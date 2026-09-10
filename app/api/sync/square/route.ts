// app/api/square/sync/route.ts
import { NextResponse } from 'next/server';
import { squareClient } from '@/lib/square';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { squareCustomerId } = body;

    if (!squareCustomerId) {
      return NextResponse.json({ error: 'Square Customer ID is required' }, { status: 400 });
    }

    // 1. Square Orders APIで該当顧客の注文履歴を検索
    const ordersResponse = await squareClient.ordersApi.searchOrders({
      locationIds: [process.env.SQUARE_LOCATION_ID || ''],
      query: {
        filter: {
          customerFilter: {
            customerIds: [squareCustomerId],
          },
          stateFilter: {
            states: ['COMPLETED'],
          },
        },
        sort: {
          sortField: 'CREATED_AT',
          sortOrder: 'DESC',
        },
      },
    });

    const orders = ordersResponse.result.orders || [];

    // 2. 取得した注文情報をアプリ側の「チケット購入履歴」型にマッピング
    const ticketsHistory = orders.map((order) => {
      const paymentId = order.tenders?.[0]?.paymentId || 'N/A';
      const totalPrice = order.totalMoney?.amount ? Number(order.totalMoney.amount) : 0;
      const createdAt = order.createdAt ? order.createdAt.split('T')[0] : '';
      
      // 商品名（ラインアイテム名）を抽出
      const title = order.lineItems?.[0]?.name || '回数券・チケット購入';
      const quantity = order.lineItems?.[0]?.quantity ? Number(order.lineItems?.[0]?.quantity) : 1;

      return {
        id: order.id || Math.random().toString(),
        date: createdAt,
        title: title,
        count: quantity * 4, // 例: 1セット購入で4回分付与などのロジックに合わせて調整
        expire: '購入日から6ヶ月', // 必要に応じて計算式に変更
        squarePaymentId: paymentId,
        squareOrderId: order.id,
        receiptUrl: order.tenders?.[0]?.receiptUrl || undefined,
        amount: totalPrice,
      };
    });

    return NextResponse.json({ success: true, ticketsHistory });

  } catch (error: any) {
    console.error('Square Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to sync with Square' }, { status: 500 });
  }
}
