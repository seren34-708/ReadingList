# Reading Log - サーバーレスアプリケーション デプロイ手順

## 📋 前提条件

- AWS CLIがインストールされていること
- AWS認証情報が設定されていること
- Node.js 18以上がインストールされていること
- PostgreSQLクライアントがインストールされていること（データベース初期化用）

## 🚀 デプロイ手順

### ステップ1: Lambda Layerの準備

```bash
# Lambda Layerを作成
chmod +x create-layer.sh
./create-layer.sh

# AWS アカウントIDを取得
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# S3バケットを作成
aws s3 mb s3://readinglog-lambda-code-${AWS_ACCOUNT_ID}

# Lambda Layerをアップロード
cd lambda-layer
aws s3 cp nodejs-postgres-layer.zip s3://readinglog-lambda-code-${AWS_ACCOUNT_ID}/layers/
cd ..
```

### ステップ2: CloudFormationスタックのデプロイ

```bash
# パラメータを設定してスタックを作成
aws cloudformation create-stack \
  --stack-name readinglog-serverless \
  --template-body file://cloudformation-template.yaml \
  --parameters \
    ParameterKey=DBUsername,ParameterValue=admin \
    ParameterKey=DBPassword,ParameterValue=YourSecurePassword123 \
    ParameterKey=DBName,ParameterValue=readinglogdb \
  --capabilities CAPABILITY_IAM

# デプロイ状況を確認
aws cloudformation wait stack-create-complete --stack-name readinglog-serverless

# スタック情報を取得
aws cloudformation describe-stacks --stack-name readinglog-serverless
```

### ステップ3: データベースの初期化

```bash
# RDSエンドポイントを取得
DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name readinglog-serverless \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text)

# VPC内のEC2インスタンスまたはCloud9から接続
# または、VPCにVPN/Direct Connect経由で接続

# PostgreSQLに接続してスクリプトを実行
psql -h $DB_ENDPOINT -U admin -d readinglogdb -f init-database.sql
```

**注意**: RDSはプライベートサブネットにあるため、直接接続できません。以下のいずれかの方法で接続してください：
- VPC内のEC2インスタンス（踏み台サーバー）を作成
- AWS Cloud9を使用
- VPNまたはDirect Connectを設定

### ステップ4: APIエンドポイントの取得

```bash
# APIエンドポイントURLを取得
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name readinglog-serverless \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

echo "API Endpoint: $API_ENDPOINT"
```

### ステップ5: フロントエンドの設定とデプロイ

1. `index.html`を編集して、APIエンドポイントを設定：

```javascript
// index.htmlの以下の部分を編集
const API_BASE_URL = 'YOUR_API_ENDPOINT'; // 例: https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
```

2. S3にアップロード：

```bash
# S3バケット名を取得
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name readinglog-serverless \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' \
  --output text | cut -d'.' -f1 | cut -d'/' -f3)

# フロントエンドをアップロード
aws s3 cp index.html s3://${FRONTEND_BUCKET}/

# ウェブサイトURLを取得
WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name readinglog-serverless \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' \
  --output text)

echo "Website URL: $WEBSITE_URL"
```

## 🧪 動作確認

### APIのテスト

```bash
# 本の一覧を取得
curl $API_ENDPOINT/books

# 新しい本を追加
curl -X POST $API_ENDPOINT/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "genre": "novel",
    "status": "reading",
    "rating": "5",
    "notes": "This is a test"
  }'
```

### Webサイトへアクセス

ブラウザで`$WEBSITE_URL`を開いて動作確認

## 🗑️ クリーンアップ（削除）

```bash
# S3バケットを空にする
aws s3 rm s3://readinglog-lambda-code-${AWS_ACCOUNT_ID} --recursive
aws s3 rm s3://${FRONTEND_BUCKET} --recursive

# CloudFormationスタックを削除
aws cloudformation delete-stack --stack-name readinglog-serverless

# 削除完了を待つ
aws cloudformation wait stack-delete-complete --stack-name readinglog-serverless
```

## 💰 コスト見積もり

このアーキテクチャの月額コスト（東京リージョン、軽度使用の場合）:

- **RDS db.t3.micro**: 約$15-20/月
- **Lambda**: 無料枠内（月100万リクエストまで無料）
- **API Gateway**: 無料枠内（月100万リクエストまで無料）
- **S3**: ほぼ無料（数セント程度）
- **Secrets Manager**: 約$0.40/月

**合計**: 約$15-25/月

## 🔒 セキュリティのベストプラクティス

1. **データベースパスワード**: 強力なパスワードを使用
2. **API認証**: 本番環境ではAPI Gateway Cognito認証を追加推奨
3. **VPC設定**: RDSはプライベートサブネットに配置済み
4. **HTTPS**: API GatewayとS3は自動的にHTTPS対応
5. **IAM**: 最小権限の原則に従ったロール設定済み

## 📊 モニタリング

```bash
# Lambda関数のログを確認
aws logs tail /aws/lambda/ReadingLog-GetBooks --follow

# RDSメトリクスを確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=readinglog-db \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## 🐛 トラブルシューティング

### Lambda関数がRDSに接続できない

1. セキュリティグループを確認
2. Lambda関数がVPC内にあることを確認
3. Secrets Managerの権限を確認

### APIがCORSエラーを返す

CloudFormationテンプレートでCORS設定は含まれていますが、問題がある場合：

```bash
aws apigatewayv2 update-api \
  --api-id YOUR_API_ID \
  --cors-configuration AllowOrigins='*',AllowMethods='*',AllowHeaders='*'
```

## 📚 参考リソース

- [AWS Lambda ドキュメント](https://docs.aws.amazon.com/lambda/)
- [Amazon RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [API Gateway HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
