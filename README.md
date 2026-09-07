# パーソナルジム統合管理アプリ

Next.js (App Router) + Tailwind CSS + Supabase による、パーソナルジム運営向けの全機能統合型Webアプリです。

## 画面構成
- `/`：売上管理ダッシュボード（本日・今月・年度累計、体験者管理表、キャンペーン実績表、回数券消化進捗表）
- `/clients`：顧客カルテ一覧（フォロー推奨・回数券残り1回・3ヶ月測定月のアラートバッジ付き）
- `/clients/[id]`：顧客カルテ詳細（基本情報、セッション記録、測定詳細、写真添付）
- `/tasks`：業務タスク＆ミーティング議事録（カレンダー、担当者・進捗トグル、明日/来週へコピー、議事録→タスク/キャンペーン自動連携）
- `/local-info`：近隣情報データベース
- `/transactions`：取引一覧（Square連携データ＋手動追加）
- `/login`：スタッフ用ログイン（Supabase Auth）
- `/api/square-webhook`：Square Webhook 受信エンドポイント（署名検証あり）

## セットアップ手順

### 1. 依存パッケージのインストール
```bash
npm install
```

### 2. Supabaseプロジェクトの準備
1. https://supabase.com でプロジェクトを作成
2. SQL Editorで `supabase/schema.sql` を実行（テーブル・ビュー・Realtime・RLS・Storageバケットを一括作成）
3. Authentication > Users からスタッフ用アカウント（TAKA・NANAなど）を作成

### 3. 環境変数の設定
`.env.local.example` を `.env.local` にコピーし、値を埋めてください。

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase の Project Settings > API から取得
- `SUPABASE_SERVICE_ROLE_KEY`：同上（**サーバー側のみで使用。クライアントに絶対に露出させないこと**）
- `SQUARE_WEBHOOK_SIGNATURE_KEY` / `SQUARE_WEBHOOK_NOTIFICATION_URL`：Square Developer Dashboard の Webhooks 設定から取得

### 4. Square Webhookの登録
Square Developer Dashboard で以下を設定してください。
- 通知先URL：`https://<デプロイ先ドメイン>/api/square-webhook`
- 購読イベント：`payment.created`、`customer.created`
- Signature Key を控えて `.env.local` の `SQUARE_WEBHOOK_SIGNATURE_KEY` に設定

### 5. ローカル起動
```bash
npm run dev
```
http://localhost:3000 にアクセスし、作成したスタッフアカウントでログインしてください。

### 6. 本番デプロイ
Vercel等にデプロイする場合は、上記の環境変数をすべてデプロイ先の環境変数設定にも登録してください。

## 決済の自動判定ロジックについて（要調整）
`app/api/square-webhook/route.ts` の `classifyPayment()` は、Square側の決済メモ・商品名に含まれるキーワード（「体験」「回数券」「キャンペーン：〇〇」など）から 体験/回数券/キャンペーン を判定する簡易ロジックです。実際のSquareカタログ構成・命名規則に合わせて調整してください。

## 今月の売上目標について
`NEXT_PUBLIC_MONTHLY_SALES_TARGET` で固定値を設定する簡易実装です。月ごとに目標を変えたい場合は、目標値を保存する専用テーブルを追加し、ダッシュボードから読み込むよう拡張してください。

## 未実装・要検討事項
- 認証はSupabase Authのメール/パスワードのみを想定しています。担当者（TAKA/NANA）とログインユーザーの紐付けは行っていません。
- 画像アップロード先は Storage バケット `gym-media`（public）です。本番運用でアクセス制限が必要な場合は非公開バケット＋署名付きURLに変更してください。
- Square側の商品カタログ構成が固まり次第、`classifyPayment()` をカタログID照合ベースに置き換えることを推奨します。
