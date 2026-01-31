# 勤怠管理システム

社内の勤怠管理をブラウザから行うためのWebアプリケーションです。

## 機能

- **ログイン認証**: ID/パスワードによる3種類の権限（管理者・経理・社員）
- **勤怠入力**: 日付・区分・出社/退社時刻・振替日を入力
- **期間選択**: 16日～翌月15日の期間
- **集計表示**: 出勤日数・有給取得・定休日・総就業時間を自動計算
- **経理画面**: 全社員の一覧表示・ステータス確認
- **ユーザー管理**: 追加・編集・削除
- **Excel出力**: 勤怠データをExcelファイルとしてダウンロード

## セットアップ

### 必要環境

- Node.js 16以上
- npm または yarn

### インストール

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm start
```

ブラウザで http://localhost:3000 を開きます。

### ビルド

```bash
npm run build
```

`build` フォルダに本番用ファイルが生成されます。

## テストアカウント

| 権限 | ID | パスワード |
|------|-----|----------|
| 管理者 | admin | admin123 |
| 経理 | keiri | keiri123 |
| 社員 | user001 | pass001 |
| 社員 | user002 | pass002 |

## ファイル構成

```
attendance-app/
├── public/
│   └── index.html          # HTMLテンプレート
├── src/
│   ├── components/         # Reactコンポーネント
│   │   ├── AdminPanel.js       # 経理・管理者用一覧
│   │   ├── AttendanceDetail.js # 勤怠詳細表示
│   │   ├── AttendanceInput.js  # 勤怠入力フォーム
│   │   ├── Header.js           # ヘッダー・ナビゲーション
│   │   ├── LoginScreen.js      # ログイン画面
│   │   ├── UserManagement.js   # ユーザー管理
│   │   └── UserModal.js        # ユーザー編集モーダル
│   ├── data/
│   │   └── constants.js    # 定数・ユーティリティ関数
│   ├── utils/
│   │   └── excelExport.js  # Excel出力機能
│   ├── App.js              # メインアプリ
│   └── index.js            # エントリーポイント
├── package.json
└── README.md
```

## カスタマイズ

### 区分の変更

`src/data/constants.js` の `KUBUN_OPTIONS` を編集してください。

```javascript
export const KUBUN_OPTIONS = ['', '出勤', '定休日', '休日出勤', '振休', '有給', '午前休', '午後休'];
```

### 部署の変更

`src/data/constants.js` の `DEPARTMENT_OPTIONS` を編集してください。

```javascript
export const DEPARTMENT_OPTIONS = ['営業部', '特販部', '設計部', '工事部', 'お客様相談室'];
```

### 初期ユーザーの変更

`src/data/constants.js` の `SAMPLE_USERS` を編集してください。

## 今後の拡張予定

- [ ] クラウドデータベース連携（Firebase/Google Cloud）
- [ ] 御社のExcelテンプレートに完全対応した出力
- [ ] オフライン対応（ローカルストレージ保存）
- [ ] プッシュ通知（提出期限リマインダー）

## ライセンス

MIT
