import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '2025-10-01T00:00:00Z';

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT || 'production';

    if (!accessToken) {
      return NextResponse.json(
        { error: '環境変数 SQUARE_ACCESS_TOKEN が設定されていません。' },
        { status: 500 }
      );
    }

    const baseUrl =
      environment === 'production'
        ? 'https://connect.squareup.com/v2'
        : 'https://connect.squareupsandbox.com/v2';

    // 顧客一覧取得
    const customerResponse = await fetch(`${baseUrl}/customers`, {
      method: 'GET',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const customerData = await customerResponse.json();
    const customers = customerData.customers || [];

    // 決済一覧取得
    const paymentResponse = await fetch(
      `${baseUrl}/payments?begin_time=${encodeURIComponent(startDate)}`,
      {
        method: 'GET',
        headers: {
          'Square-Version': '2024-01-18',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const paymentData = await paymentResponse.json();
    const payments = paymentData.payments || [];

    const completedPayments = payments.filter((p: any) => p.status === 'COMPLETED');

    // 各決済のオーダー情報（商品明細）の紐付け（必要に応じて取得）
    const enrichedPayments = await Promise.all(
      completedPayments.map(async (payment: any) => {
        let itemNames: string[] = [];
        if (payment.note) {
          itemNames.push(payment.note);
        }

        // Order ID が存在する場合、Order API から商品名を取得
        if (payment.order_id) {
          try {
            const orderRes = await fetch(`${baseUrl}/orders/${payment.order_id}`, {
              method: 'GET',
              headers: {
                'Square-Version': '2024-01-18',
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            const orderData = await orderRes.json();
            if (orderData.order && orderData.order.line_items) {
              const names = orderData.order.line_items.map(
                (item: any) => item.name || item.variation_name || '商品名なし'
              );
              itemNames = Array.from(new Set([...itemNames, ...names]));
            }
          } catch (e) {
            console.error(`Order fetch error for ${payment.order_id}`, e);
          }
        }

        return {
          ...payment,
          item_names: itemNames.length > 0 ? itemNames.join(', ') : '店頭決済・その他',
        };
      })
    );

    return NextResponse.json({
      success: true,
      summary: {
        startDate,
        fetchedCustomersCount: customers.length,
        fetchedPaymentsCount: enrichedPayments.length,
      },
      customers,
      payments: enrichedPayments,
    });
  } catch (error: any) {
    console.error('Square Sync Error:', error);
    return NextResponse.json(
      { error: 'Square 過去データの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
