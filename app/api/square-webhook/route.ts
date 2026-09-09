import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ビルド時や未設定時でも絶対にクラッシュしない安全な初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.type;

    // 1. 決済情報の連携 (売上管理への反映)
    if (eventType === 'payment.updated' || eventType === 'payment.created') {
      const payment = body.data?.object?.payment;
      
      if (payment && payment.status === 'COMPLETED') {
        const amount = payment.amount_money?.amount ? payment.amount_money.amount / 100 : 0; 
        const customerId = payment.customer_id || null;
        const paidAt = payment.created_at ? new Date(payment.created_at).toISOString() : new Date().toISOString();

        // Supabaseの sales テーブルにデータを挿入（重複IDは無視）
        const { error } = await supabase.from('sales').upsert({
          square_payment_id: payment.id,
          amount: amount,
          customer_square_id: customerId,
          paid_at: paidAt,
          source: 'Square'
        }, { onConflict: 'square_payment_id' });

        if (error) {
          console.error('Supabase sales insert error:', error);
        }
      }
    }

    // 2. 顧客情報の連携 (顧客リストへの反映)
    if (eventType === 'customer.created' || eventType === 'customer.updated') {
      const customer = body.data?.object?.customer;

      if (customer) {
        const fullName = `${customer.given_name || ''} ${customer.family_name || ''}`.trim() || '未設定';

        // Supabaseの customers テーブルにupsert
        const { error } = await supabase.from('customers').upsert({
          square_customer_id: customer.id,
          name: fullName,
          email: customer.email_address || null,
          phone: customer.phone_number || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'square_customer_id' });

        if (error) {
          console.error('Supabase customer upsert error:', error);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
