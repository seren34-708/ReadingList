# 📚 Reading Log - GitHub自動バックアップ

読書記録アプリのデータを毎週自動的にGitHubにバックアップし、8週間以上古いバックアップを自動削除するシステムです。

## 🎯 機能

- ✅ **毎週自動バックアップ**: 毎週日曜日午前3時に自動実行
- ✅ **古いバックアップの自動削除**: 8週間（約2ヶ月）以上前のバックアップを自動削除
- ✅ **手動バックアップ**: いつでも手動でバックアップ可能
- ✅ **無料**: GitHub Actionsの無料枠内で利用可能

## 📁 ファイル構成

```
ReadingList/
├── .github/
│   └── workflows/
│       └── backup.yml          # GitHub Actions設定ファイル
├── backup/                     # バックアップ保存先
│   ├── .gitkeep                # フォルダ維持用
│   ├── reading-log-backup_2026-02-04_03-00-00.json
│   ├── reading-log-backup_2026-01-28_03-00-00.json
│   └── ...
├── index.html                  # 読書記録アプリ本体（既存）
├── github-backup-setup.html    # バックアップ設定ガイド
└── README.md                   # このファイル
```

## 🚀 セットアップ手順

### 前提条件
✅ GitHubリポジトリ `ReadingList` が作成済み  
✅ `index.html` がリポジトリに配置済み

### 1. backupフォルダを作成

```bash
# GitHubのWebインターフェースで:
# 1. ReadingListリポジトリを開く
# 2. "Add file" → "Create new file"
# 3. ファイル名: backup/.gitkeep
# 4. "Commit new file"
```

### 2. GitHub Actionsワークフローファイルを追加

```bash
# GitHubのWebインターフェースで:
# 1. "Add file" → "Create new file"
# 2. ファイル名: .github/workflows/backup.yml
# 3. ダウンロードした backup.yml の内容をコピー＆ペースト
# 4. "Commit new file"
```

### 3. GitHub Actionsを有効化

1. GitHubリポジトリページの「Actions」タブをクリック
2. 「I understand my workflows, go ahead and enable them」をクリック
3. これで自動バックアップが有効になります

### 4. 手動テスト実行

1. 「Actions」タブ → 「📚 Reading Log Auto Backup」
2. 「Run workflow」ボタンをクリック
3. 「Run workflow」を再度クリック
4. 実行完了後、`backup/`フォルダにファイルが作成されていることを確認

## 💾 実際のデータをバックアップする方法

GitHub Actionsは「テンプレート」ファイルのみを作成します。実際の読書データをバックアップするには：

### 方法1: Webインターフェース（簡単）

1. `github-backup-setup.html`をブラウザで開く
2. GitHub Personal Access Tokenを入力
3. 「現在のデータをGitHubにバックアップ」をクリック

### 方法2: 手動アップロード

1. 読書記録アプリで「データをエクスポート」
2. ダウンロードしたJSONファイルを以下の形式にリネーム：
   ```
   reading-log-backup_YYYY-MM-DD_HH-MM-SS.json
   ```
3. GitHubリポジトリ `ReadingList` の `backup/` フォルダにアップロード

### 方法3: コマンドライン

```bash
# ReadingListリポジトリをクローン（まだの場合）
git clone https://github.com/YOUR_USERNAME/ReadingList.git
cd ReadingList

# エクスポートしたJSONファイルを整形
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
FILENAME="reading-log-backup_${TIMESTAMP}.json"

# backupフォルダに移動
mv ~/Downloads/読書記録_*.json backup/${FILENAME}

# コミット＆プッシュ
git add backup/${FILENAME}
git commit -m "Manual backup: ${TIMESTAMP}"
git push
```

## 📅 バックアップスケジュール

| 項目 | 設定値 |
|------|--------|
| **実行頻度** | 毎週日曜日 午前3時（JST） |
| **保存期間** | 8週間（約2ヶ月） |
| **保存先** | `ReadingList/backup/` フォルダ |
| **ファイル名形式** | `reading-log-backup_YYYY-MM-DD_HH-MM-SS.json` |
| **最大バックアップ数** | 約8ファイル（週1回×8週間） |

## 🔧 カスタマイズ

### バックアップ頻度を変更

`.github/workflows/backup.yml`の`cron`スケジュールを編集：

```yaml
schedule:
  # 毎日午前3時に実行
  - cron: '0 18 * * *'  # UTC 18:00 = JST 3:00
  
  # 毎月1日午前3時に実行
  - cron: '0 18 1 * *'
```

### 保存期間を変更

`.github/workflows/backup.yml`の以下の部分を編集：

```bash
# 12週間（約3ヶ月）保存
CUTOFF_DATE=$(date -d '12 weeks ago' +%s)

# 6ヶ月保存
CUTOFF_DATE=$(date -d '6 months ago' +%s)
```

## 🔐 セキュリティ

### Personal Access Tokenの作成

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」
3. **Note**: `Reading Log Backup`
4. **Expiration**: `No expiration` または `1 year`
5. **Scopes**: ✅ `repo` (全てのrepo権限)
6. 「Generate token」をクリック
7. **⚠️ トークンをコピーして安全に保存**

### トークンの安全な保管

```bash
# 環境変数として保存（推奨）
echo 'export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"' >> ~/.bashrc
source ~/.bashrc

# または、パスワードマネージャーに保存
```

## 📊 バックアップの確認

### GitHub上で確認

```
https://github.com/YOUR_USERNAME/ReadingList/tree/main/backup
```

### ローカルで確認

```bash
# ReadingListリポジトリをクローン
git clone https://github.com/YOUR_USERNAME/ReadingList.git
cd ReadingList

# バックアップファイル一覧
ls -lh backup/

# 最新のバックアップを確認
cat backup/reading-log-backup_$(ls -t backup/ | head -1)
```

## 🔄 データの復元

### 方法1: Webインターフェース

1. 読書記録アプリを開く
2. 「データをインポート」をクリック
3. GitHubからダウンロードしたバックアップファイルを選択

### 方法2: 直接編集

```bash
# GitHubから最新のバックアップをダウンロード
# ブラウザのデベロッパーツール（F12）→ Application → Local Storage
# 'readingBooks' の値を、バックアップファイルの 'books' の内容で置き換え
```

## 🐛 トラブルシューティング

### GitHub Actionsが実行されない

**原因と解決策:**

1. **Actionsが無効**
   - Settings → Actions → General で "Allow all actions" を選択

2. **初回実行まで時間がかかる**
   - cronスケジュールは最大24時間待つ場合があります
   - 「Run workflow」で手動実行してテスト

3. **リポジトリがPrivate**
   - Private リポジトリでもActionsは動作します
   - Free プランでは月2,000分まで無料

### バックアップファイルが空

**原因:**
GitHub Actionsはテンプレートのみ作成します。

**解決策:**
実際のデータは手動でアップロードする必要があります（上記「実際のデータをバックアップする方法」参照）

### 古いバックアップが削除されない

**原因:**
ファイル名の形式が正しくありません。

**必須形式:**
```
reading-log-backup_YYYY-MM-DD_HH-MM-SS.json
```

**例:**
```
✅ reading-log-backup_2026-02-04_15-30-00.json
❌ backup_2026-02-04.json
❌ reading-log-2026-02-04.json
```

## 💰 コスト

| 項目 | 料金 |
|------|------|
| **GitHubリポジトリ** | 無料（Private含む） |
| **GitHub Actions** | 月2,000分まで無料 |
| **ストレージ** | 500MBまで無料 |
| **推定使用量** | 週1回×数秒 = 月1分未満 |

**結論**: 完全無料で利用可能 🎉

## 📈 使用例

```bash
# 2026年2月4日にセットアップ
# ↓
# 毎週日曜日午前3時に自動実行
# ↓
# バックアップファイル例:
ReadingList/backup/
├── .gitkeep
├── reading-log-backup_2026-02-09_03-00-00.json  # 第1週
├── reading-log-backup_2026-02-16_03-00-00.json  # 第2週
├── reading-log-backup_2026-02-23_03-00-00.json  # 第3週
├── reading-log-backup_2026-03-02_03-00-00.json  # 第4週
├── reading-log-backup_2026-03-09_03-00-00.json  # 第5週
├── reading-log-backup_2026-03-16_03-00-00.json  # 第6週
├── reading-log-backup_2026-03-23_03-00-00.json  # 第7週
└── reading-log-backup_2026-03-30_03-00-00.json  # 第8週

# 2026年4月6日（9週目）
# → 2026年2月9日のバックアップが自動削除される
```

## 🤝 貢献

改善案やバグ報告は大歓迎です！

## 📝 ライセンス

MIT License

## 📧 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
