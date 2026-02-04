#!/bin/bash

# Lambda Layer作成スクリプト
# このスクリプトはNode.js PostgreSQLライブラリを含むLambda Layerを作成します

echo "Creating Lambda Layer for PostgreSQL..."

# 作業ディレクトリを作成
mkdir -p lambda-layer/nodejs
cd lambda-layer/nodejs

# package.jsonを作成
cat > package.json << 'EOF'
{
  "name": "postgres-layer",
  "version": "1.0.0",
  "description": "PostgreSQL client for AWS Lambda",
  "dependencies": {
    "pg": "^8.11.3",
    "@aws-sdk/client-secrets-manager": "^3.470.0"
  }
}
EOF

# 依存関係をインストール
npm install --production

# zipファイルを作成
cd ..
zip -r nodejs-postgres-layer.zip nodejs

echo "Lambda Layer created: nodejs-postgres-layer.zip"
echo ""
echo "次のステップ:"
echo "1. S3バケットを作成: aws s3 mb s3://readinglog-lambda-code-YOUR_ACCOUNT_ID"
echo "2. Layerをアップロード: aws s3 cp nodejs-postgres-layer.zip s3://readinglog-lambda-code-YOUR_ACCOUNT_ID/layers/"
echo "3. CloudFormationスタックをデプロイ"
