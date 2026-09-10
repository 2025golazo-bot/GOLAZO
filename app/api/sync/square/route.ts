import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GETリクエスト（手動同期・確認用）
export async function GET() {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const isSandbox = process.env.SQUARE_ENVIRONMENT === 'sandbox';
  const baseUrl = isSandbox
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';

  if (!accessToken) {
    return NextResponse.json({ error: 'Squareのアクセストークンが設定されていません。' }, { status: 500 });
  }

  try {
    const response = await fetch(`${baseUrl}/v2/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Square APIからのデータ取得に失敗しました', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Squareから正常にデータを同期しました',
      payments: data.payments || [],
      syncedAt: new Date().toLocaleString('ja-JP'),
    });
  } catch (error) {
    console.error('Square sync error:', error);
    return NextResponse.json({ error: 'サーバー内部でエラーが発生しました。' }, { status: 500 });
  }
}

// POSTリクエスト（SquareからのWebhookを受け取りSupabaseへ同期）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body?.type;
    const objectData = body?.data?.object;

    console.log(`Received Square Webhook event: ${eventType}`);

    // 1. 顧客関連のイベント (customer.created / customer.updated)
    if (eventType === 'customer.created' || eventType === 'customer.updated') {
      const customer = objectData?.customer;
      if (customer) {
        const { error } = await supabase
          .from('customers')
          .upsert({
            id: customer.id,
            given_name: customer.given_name || '',
            family_name: customer.family_name || '',
            email_address: customer.email_address || '',
            phone_number: customer.phone_number || '',
            updated_at: new Date().toISOString(),
          });

        if (error) console.error('Supabase customer upsert error:', error);
      }
    }

    // 2. 決済関連のイベント (payment.created / payment.updated)
    if (eventType === 'payment.created' || eventType === 'payment.updated') {
      const payment = objectData?.payment;
      if (payment) {
        const lineItem = payment.line_items?.[0]; 
        const itemName = lineItem?.name || payment.note || '通常決済 / 物販';
        const sourceType = payment.source_type || 'CARD';

        const { error } = await supabase
          .from('payments')
          .upsert({
            id: payment.id,
            amount: payment.amount_money?.amount || 0,
            currency: payment.amount_money?.currency || 'JPY',
            status: payment.status,
            customer_id: payment.customer_id || null,
            item_name: itemName,
            staff_name: payment.employee_id || null,
            payment_method: sourceType,
            created_at: payment.created_at,
          });

        if (error) console.error('Supabase payment upsert error:', error);
      }
    }

    // 3. 予約関連のイベント (booking.created / booking.updated / booking.rescheduled など)
    if (
      eventType === 'booking.created' || 
      eventType === 'booking.updated' || 
      eventType === 'booking.rescheduled'
    ) {
      const booking = objectData?.booking;
      if (booking) {
        const appointmentSegment = booking.appointment_segments?.[0];
        const serviceVariationId = appointmentSegment?.service_variation_id || null;
        const staffId = appointmentSegment?.team_member_id || null;

        const { error } = await supabase
          .from('bookings')
          .upsert({
            id: booking.id,
            status: booking.status,
            start_at: booking.start_at,
            customer_id: booking.customer_id || null,
            service_variation_id: serviceVariationId,
            staff_id: staffId,
          });

        if (error) console.error('Supabase booking upsert error:', error);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhookの処理中にエラーが発生しました。' }, { status: 500 });
  }
}
