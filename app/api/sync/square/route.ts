import { NextResponse } from 'next/server';
import { Client, Environment } from 'square';

const environment = process.env.NODE_ENV === 'production' 
  ? Environment.Production 
  : Environment.Sandbox;

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
  environment: environment,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { squareCustomerId } = body;

    if (!squareCustomerId) {
      return NextResponse.json({ success: false, error: 'Square Customer ID is required' }, { status: 400 });
    }

    const locationId = process.env.SQUARE_LOCATION_ID || '';

    // Squareから該当顧客の注文履歴を検索
    const ordersResponse = await squareClient.ordersApi.searchOrders({
      locationIds: [locationId],
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

    // アプリ側のチケット・購入履歴の形式に変換
    const ticketsHistory = orders.map((order) => {
      const paymentId = order.tenders?.[0]?.paymentId || 'N/A';
      const totalPrice = order.totalMoney?.amount ? Number(order.totalMoney.amount) : 0;
      const createdAt = order.createdAt ? order.createdAt.split('T')[0] : '';
      const title = order.lineItems?.[0]?.name || 'Square購入チケット';
      const quantity = order.lineItems?.[0]?.quantity ? Number(order.lineItems?.[0]?.quantity) : 1;

      return {
        id: order.id || Math.random().toString(),
        date: createdAt,
        title: title,
        count: quantity * 5,
        expire: '購入日から6ヶ月',
        squarePaymentId: paymentId,
        squareOrderId: order.id,
        receiptUrl: undefined,
        amount: totalPrice,
      };
    });

    return NextResponse.json({ success: true, ticketsHistory });

  } catch (error: any) {
    console.error('Square Sync API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to communicate with Square API' 
    }, { status: 500 });
  }
}
