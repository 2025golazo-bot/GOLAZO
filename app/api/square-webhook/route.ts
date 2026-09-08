import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアント（サーバー側用：Service Role Keyを使用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.type;

    // 1. 決済情報の連携 (売上管理への反映)
    if (eventType === 'payment.updated' || eventType === 'payment.created') {
      const payment = body.data.object.payment;
      
      if (payment.status === 'COMPLETED') {
        const amount = payment.amount_money.amount / 100; // 円単位に変換
        const customerId = payment.customer_id;
        const createdAt = payment.created_at;

        // Supabaseの sales テーブルにデータを挿入
        const { error } = await supabase.from('sales').insert({
          square_payment_id: payment.id,
          amount: amount,
          customer_square_id: customerId,
          paid_at: createdAt,
          source: 'Square'
        });

        if (error) console.error('Supabase sales insert error:', error);
      }
    }

    // 2. 顧客情報の連携 (顧客リストへの反映)
    if (eventType === 'customer.created' || eventType === 'customer.updated') {
      const customer = body.data.object.customer;

      // Supabaseの customers テーブルにupsert（存在すれば更新、なければ追加）
      const { error } = await supabase.from('customers').upsert({
        square_customer_id: customer.id,
        name: `${customer.given_name || ''} ${customer.family_name || ''}`.trim(),
        email: customer.email_address,
        phone: customer.phone_number,
        updated_at: new Date().toISOString()
      }, { onConflict: 'square_customer_id' });

      if (error) console.error('Supabase customer upsert error:', error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
