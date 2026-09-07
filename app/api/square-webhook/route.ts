import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
/**
 * Squareの過去売上・顧客データを一括取得するエンドポイント
 * 呼び出しURL例: GET /api/sync/square?startDate=2025-10-01T00:00:00Z
 */
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

    // 1. 過去の顧客一覧を取得
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

    // 2. 過去の決済（売上）一覧を取得
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

    return NextResponse.json({
      success: true,
      summary: {
        startDate,
        fetchedCustomersCount: customers.length,
        fetchedPaymentsCount: completedPayments.length,
      },
      customers,
      payments: completedPayments,
    });
  } catch (error: any) {
    console.error('Square Sync Error:', error);
    return NextResponse.json(
      { error: 'Square 過去データの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
