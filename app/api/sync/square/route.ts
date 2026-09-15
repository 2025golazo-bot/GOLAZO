import { NextResponse } from 'next/server';

import { Client, Environment } from 'square';

const environment = Environment.Production;

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
  environment,
});

// Squareの商品名から回数券の回数を判定
const getTicketCount = (name: string): number => {
  const normalized = name.replace(/\s+/g, '');

  const match =
    normalized.match(/(\d+)回券/) ||
    normalized.match(/回数券(\d+)回/) ||
    normalized.match(/(\d+)回チケット/);

  return match ? Number(match[1]) : 0;
};

// 購入商品の簡易カテゴリ判定
const getPurchaseCategory = (
  title: string,
  ticketCount: number
): '回数券' | 'セッション' | '物販' | 'その他' => {
  if (ticketCount > 0) return '回数券';

  const normalized = title.replace(/\s+/g, '');

  if (
    normalized.includes('パーソナル') ||
    normalized.includes('トレーニング') ||
    normalized.includes('セッション') ||
    normalized.includes('レッスン')
  ) {
    return 'セッション';
  }

  if (
    normalized.includes('プロテイン') ||
    normalized.includes('サプリ') ||
    normalized.includes('ウェア') ||
    normalized.includes('グッズ') ||
    normalized.includes('物販')
  ) {
    return '物販';
  }

  return 'その他';
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { squareCustomerId } = body;

    if (!squareCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Square Customer ID is required',
        },
        { status: 400 }
      );
    }

    const locationId = process.env.SQUARE_LOCATION_ID || '';

    if (!locationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Square Location ID is not configured',
        },
        { status: 500 }
      );
    }

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
console.log('Square Sync: orders =', orders.length);
    // 全購入履歴
    const squarePurchaseHistory = orders.map((order) => {
      const paymentId = order.tenders?.[0]?.paymentId || 'N/A';
      const totalPrice = order.totalMoney?.amount
        ? Number(order.totalMoney.amount)
        : 0;
      const createdAt = order.createdAt
        ? order.createdAt.split('T')[0]
        : '';

      const lineItems = order.lineItems || [];

      const title =
        lineItems
          .map((item) => item.name || 'Square購入商品')
          .filter(Boolean)
          .join(' / ') || 'Square購入';

      const quantity = lineItems.reduce(
        (sum, item) => sum + Number(item.quantity || 1),
        0
      );

      const ticketCount = lineItems.reduce((sum, item) => {
        const itemTicketCount = getTicketCount(item.name || '');
        const itemQuantity = Number(item.quantity || 1);
        return sum + itemTicketCount * itemQuantity;
      }, 0);

      const category = getPurchaseCategory(title, ticketCount);

      return {
        id: order.id || Math.random().toString(),
        date: createdAt,
        title,
        category,
        quantity,
        amount: totalPrice,
        squarePaymentId: paymentId,
        squareOrderId: order.id,
        receiptUrl: undefined,
        ticketCount: ticketCount > 0 ? ticketCount : undefined,
      };
    });

    // 回数券だけを従来のticketsHistory形式でも返す
    // 通常の商品・セッションはここには入れない
    const ticketsHistory = squarePurchaseHistory
      .filter((purchase) => purchase.ticketCount && purchase.ticketCount > 0)
      .map((purchase) => ({
        id: purchase.id,
        date: purchase.date,
        title: purchase.title,
        count: purchase.ticketCount || 0,
        expire: '購入日から6ヶ月',
        squarePaymentId: purchase.squarePaymentId,
        squareOrderId: purchase.squareOrderId,
        receiptUrl: purchase.receiptUrl,
        amount: purchase.amount,
      }));

    return NextResponse.json({
      success: true,
      ticketsHistory,
      squarePurchaseHistory,
    });
  } catch (error: any) {
    console.error('Square Sync API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.message || 'Failed to communicate with Square API',
      },
      { status: 500 }
    );
  }
}
