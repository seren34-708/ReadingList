# 📚 Reading Log - サーバーレスアプリケーション

AWS Lambda + API Gateway + RDS PostgreSQLを使用した読書記録Webアプリケーションです。

## 📁 ファイル構成

```
├── cloudformation-template.yaml   # CloudFormationテンプレート
├── DEPLOYMENT.md                  # デプロイ手順書
├── create-layer.sh                # Lambda Layer作成スクリプト
├── init-database.sql              # データベース初期化SQL
├── api-integration.js             # API統合ヘルパー関数
└── index.html                     # フロントエンドHTML
```

## 🏗️ アーキテクチャ

```
┌─────────────┐
│   Browser   │
│ (index.html)│
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│  API Gateway    │
│   (HTTP API)    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│   Lambda Functions       │
│ ┌──────────────────────┐ │
│ │ GetBooks             │ │
│ │ CreateBook           │ │
│ │ UpdateBook           │ │
│ │ DeleteBook           │ │
│ └──────────────────────┘ │
└──────────┬───────────────┘
           │ VPC
           ▼
    ┌──────────────┐
    │    RDS       │
    │ PostgreSQL   │
    │ (Private)    │
    └──────────────┘
```

## ⚡ 機能

- ✅ 本の追加・編集・削除
- ✅ ステータス管理（読書中/読了/読みたい）
- ✅ ジャンル分類（小説/自己啓発/English/その他）
- ✅ 評価（5段階）
- ✅ 読み始めた日・読み終わった日の記録
- ✅ メモ・感想の記録
- ✅ 並び替え・フィルター機能
- ✅ ISBN自動入力機能
- ✅ 日本語/英語切り替え
- ✅ ページネーション
- ✅ データエクスポート/インポート
- ✅ レスポンシブデザイン（スマホ対応）

## 🚀 クイックスタート

詳細な手順は[DEPLOYMENT.md](DEPLOYMENT.md)を参照してください。

### 1. Lambda Layerの作成

```bash
./create-layer.sh
```

### 2. CloudFormationスタックのデプロイ

```bash
aws cloudformation create-stack \
  --stack-name readinglog-serverless \
  --template-body file://cloudformation-template.yaml \
  --parameters \
    ParameterKey=DBUsername,ParameterValue=admin \
    ParameterKey=DBPassword,ParameterValue=YourPassword123 \
  --capabilities CAPABILITY_IAM
```

### 3. データベースの初期化

```bash
psql -h <RDS_ENDPOINT> -U admin -d readinglogdb -f init-database.sql
```

### 4. フロントエンドのデプロイ

1. `index.html`のAPI_BASE_URLを更新
2. S3にアップロード

```bash
aws s3 cp index.html s3://readinglog-frontend-YOUR_ACCOUNT_ID/
```

## 📊 データベーススキーマ

```sql
CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(50),
    url VARCHAR(1000),
    status VARCHAR(50) NOT NULL,
    rating VARCHAR(10),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API エンドポイント

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/books` | 全ての本を取得 |
| POST | `/books` | 新しい本を追加 |
| PUT | `/books/{id}` | 本を更新 |
| DELETE | `/books/{id}` | 本を削除 |

### リクエスト例

```bash
# 本の一覧を取得
curl https://YOUR_API.execute-api.REGION.amazonaws.com/prod/books

# 新しい本を追加
curl -X POST https://YOUR_API.execute-api.REGION.amazonaws.com/prod/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "吾輩は猫である",
    "author": "夏目漱石",
    "genre": "novel",
    "status": "completed",
    "rating": "5"
  }'
```

## 💰 コスト見積もり

月額（東京リージョン、軽度使用）:
- RDS db.t3.micro: ~$15-20
- Lambda: 無料枠内
- API Gateway: 無料枠内
- S3: ~$0.01
- Secrets Manager: ~$0.40

**合計**: 約$15-25/月

## 🔒 セキュリティ

- ✅ RDSはプライベートサブネットに配置
- ✅ データベース認証情報はSecrets Managerで管理
- ✅ Lambda関数はVPC内で実行
- ✅ HTTPS通信のみ
- ✅ CORSの適切な設定
- ✅ IAMロールによる最小権限の原則

## 🐛 トラブルシューティング

詳細は[DEPLOYMENT.md](DEPLOYMENT.md)の「トラブルシューティング」セクションを参照してください。

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエストを歓迎します！

## 📧 お問い合わせ

問題が発生した場合は、GitHubのIssuesで報告してください。
