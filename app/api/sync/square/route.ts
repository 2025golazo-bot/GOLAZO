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

    // 1. Square 顧客カルテ（顧客一覧）の全件取得
    const customerResponse = await fetch(`${baseUrl}/customers`, {
      method: 'GET',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const customerData = await customerResponse.json();
    const rawCustomers = customerData.customers || [];

    // 顧客マップの作成 (ID -> 顧客情報)
    const customerMap = new Map();
    const formattedCustomers = rawCustomers.map((c: any) => {
      const name = [c.family_name, c.given_name].filter(Boolean).join(' ') || c.company_name || '名称未設定';
      const info = {
        id: c.id,
        name: name,
        email: c.email_address || '未登録',
        phone: c.phone_number || '未登録',
        note: c.note || '',
        createdAt: c.created_at,
      };
      customerMap.set(c.id, info);
      return info;
    });

    // 2. Square 決済一覧の取得
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

    // 3. 決済データに商品明細と顧客カルテ情報を紐付け
    const enrichedPayments = await Promise.all(
      completedPayments.map(async (payment: any) => {
        let itemNames: string[] = [];
        if (payment.note) {
          itemNames.push(payment.note);
        }

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

        // 顧客カルテ情報の紐付け
        const customerInfo = payment.customer_id ? customerMap.get(payment.customer_id) : null;

        return {
          ...payment,
          customer_name: customerInfo ? customerInfo.name : 'ビジター / 非会員',
          customer_email: customerInfo ? customerInfo.email : '-',
          item_names: itemNames.length > 0 ? itemNames.join(', ') : '店頭決済・その他',
        };
      })
    );

    return NextResponse.json({
      success: true,
      summary: {
        startDate,
        fetchedCustomersCount: formattedCustomers.length,
        fetchedPaymentsCount: enrichedPayments.length,
      },
      customers: formattedCustomers,
      payments: enrichedPayments,
    });
  } catch (error: any) {
    console.error('Square Sync Error:', error);
    return NextResponse.json(
      { error: 'Square データの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
