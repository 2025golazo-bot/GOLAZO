import { NextResponse } from 'next/server';

// GETリクエスト（またはPOST）を受け取ってSquareと通信するエンドポイント
export async function GET() {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  // 本番環境かサンドボックス（テスト）か
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
    // 例: Squareのペイメント（決済）一覧を取得するAPIを呼び出し
    const response = await fetch(`${baseUrl}/v2/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18', // 使用するSquareのAPIバージョンの目安
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

    // 取得した決済データ（または必要な売上集計結果）をフロントに返す
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
