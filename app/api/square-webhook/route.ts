import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Square Webhook 署名検証
// https://developer.squareup.com/docs/webhooks/step3validate
function verifySquareSignature(
  rawBody: string,
  signatureHeader: string | null,
  notificationUrl: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey || !signatureHeader) return false;

  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(notificationUrl + rawBody);
  const expected = hmac.digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}

// 決済金額・メモ・商品名から 体験 / 回数券 / キャンペーン を自動判定する簡易ロジック。
// Square の Catalog 名やメモに含まれるキーワードで判定しています。
// 実際の商品名・カタログ構成に合わせて調整してください。
function classifyPayment(orderTitleOrNote: string) {
  const text = orderTitleOrNote || "";
  const isTrial = /体験/.test(text);
  const isTicketPurchase = /回数券|チケット/.test(text);
  const campaignMatch = text.match(/キャンペーン[:：]?\s*(.+)/);
  const campaignName = campaignMatch ? campaignMatch[1].trim() : null;
  // 「◯回券」のような表記から購入回数を抽出（例: "10回券" -> 10）
  const ticketCountMatch = text.match(/(\d+)\s*回/);
  const ticketCount = ticketCountMatch ? parseInt(ticketCountMatch[1], 10) : 0;

  return { isTrial, isTicketPurchase, campaignName, ticketCount };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const notificationUrl =
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ||
    `${req.nextUrl.origin}/api/square-webhook`;

  if (
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY &&
    !verifySquareSignature(rawBody, signature, notificationUrl)
  ) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createServiceRoleClient();

  try {
    switch (event.type) {
      case "payment.created": {
        const payment = event.data?.object?.payment;
        if (!payment) break;

        const amount = (payment.amount_money?.amount || 0) / 100; // Square は最小通貨単位（円は等倍だが安全のため /100 は USD 想定。JPY の場合は amount がそのまま円）
        const amountJpy = payment.amount_money?.currency === "JPY"
          ? payment.amount_money.amount
          : amount;

        const note = payment.note || payment.receipt_number || "";
        const { isTrial, isTicketPurchase, campaignName, ticketCount } =
          classifyPayment(note);

        // Square 顧客IDから既存クライアントを検索
        let clientId: string | null = null;
        if (payment.customer_id) {
          const { data: existingClient } = await supabase
            .from("clients")
            .select("id, ticket_total")
            .eq("square_customer_id", payment.customer_id)
            .maybeSingle();
          if (existingClient) {
            clientId = existingClient.id;

            // 回数券購入時は ticket_total を自動加算
            if (isTicketPurchase && ticketCount > 0) {
              await supabase
                .from("clients")
                .update({
                  ticket_total: (existingClient.ticket_total || 0) + ticketCount,
                })
                .eq("id", existingClient.id);
            }
          }
        }

        await supabase.from("sales").upsert(
          {
            square_payment_id: payment.id,
            client_id: clientId,
            amount: amountJpy,
            payment_date: payment.created_at || new Date().toISOString(),
            is_trial: isTrial,
            is_ticket_purchase: isTicketPurchase,
            campaign_name: campaignName,
          },
          { onConflict: "square_payment_id" }
        );

        // キャンペーン経由の売上であれば実績数を自動加算
        if (campaignName) {
          const { data: campaign } = await supabase
            .from("campaigns")
            .select("id, actual_count")
            .eq("name", campaignName)
            .maybeSingle();
          if (campaign) {
            await supabase
              .from("campaigns")
              .update({ actual_count: (campaign.actual_count || 0) + 1 })
              .eq("id", campaign.id);
          }
        }

        // 取引一覧にも自動反映
        await supabase.from("transactions").upsert(
          {
            name: note || `Square決済 ${payment.id}`,
            source: "square",
            square_reference_id: payment.id,
          },
          { onConflict: "square_reference_id" }
        );

        break;
      }

      case "customer.created": {
        const customer = event.data?.object?.customer;
        if (!customer) break;

        const parentName = [customer.family_name, customer.given_name]
          .filter(Boolean)
          .join(" ");

        await supabase.from("clients").upsert(
          {
            square_customer_id: customer.id,
            parent_name: parentName || customer.company_name || null,
            child_name: parentName || "未設定",
            birth_date: customer.birthday || "2000-01-01",
          },
          { onConflict: "square_customer_id" }
        );
        break;
      }

      default:
        // 未対応イベントは無視
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Square webhook processing error:", err);
    return NextResponse.json(
      { error: "internal processing error" },
      { status: 500 }
    );
  }
}
