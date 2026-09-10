import { NextResponse } from 'next/server';

// 1. GETリクエスト（手動でのデータ同期や確認用）
export async function GET() {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const isSandbox = process.env.SQUARE_ENVIRONMENT === 'sandbox';
  const baseUrl = isSandbox
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Squareのアクセストークンが設定されていません。' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Square APIからのデータ取得に失敗しました', details: errorData },
        { status: response.status }
      );
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
    return NextResponse.json(
      { error: 'サーバー内部でエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// 2. POSTリクエスト（SquareからのWebhook通知を受け取る用）
export async function POST(request: Request) {
  try {
    // Squareから送信されたWebhookのペイボディ（JSONデータ）を取得
    const body = await request.json();

    // イベントの種類（例: payment.updated, booking.created など）
    const eventType = body?.type;
    console.log(`Received Square Webhook event: ${eventType}`, body);

    // TODO: ここに受け取ったイベントに応じたデータベースの更新処理などを記述します
    // 例: 決済が完了したら売上データを同期する、など

    // Squareに対して「正常に受け取りました」という200 OKを返す
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhookの処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
