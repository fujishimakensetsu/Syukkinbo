# Phase 5: 振替休日連動

## 概要

休日出勤と振替休日の双方向自動連動、およびカレンダーUIによる振替日選択を実装する。

## ステータス: 完了

## 作業開始日: 2025-02-02
## 完了日: 2025-02-02

## 前提条件
- Phase 1, 2, 3, 4 完了済み

---

## タスク一覧

### 5.1 振替連動ロジック設計

**連動パターンA: 休日出勤 → 振休**
```
1. 休日出勤の日（例: 2/1）に振替日（例: 2/15）を入力
2. 自動的に 2/15 の区分が「振休」になる
3. 2/15 の振替元に「2/1」が設定される
```

**連動パターンB: 振休 → 休日出勤**
```
1. 振休の日（例: 2/15）に振替元（例: 2/1）を入力
2. 自動的に 2/1 の区分が「休日出勤」になる
3. 2/1 の振替日に「2/15」が設定される
```

### 5.2 データ構造の拡張
```javascript
// attendance/{documentId}
{
  // 既存フィールド...
  kubun: "休日出勤",
  furikaeDate: "2025-02-15",      // 振替日（YYYY-MM-DD）
  furikaeLinkedId: "doc_id_xxx",  // 連動先レコードのドキュメントID
  furikaeType: "source"           // "source"=休日出勤側, "target"=振休側
}
```

### 5.3 振替サービス作成
- [x] attendanceService.js に統合
  - [x] linkTransferDays（振替日の連動設定）
  - [x] unlinkTransferDay（振替日の連動解除）

### 5.4 カレンダーUIコンポーネント
- [x] components/common/Calendar.js
  - [x] 月表示カレンダー
  - [x] 年月選択（年跨ぎ対応、前後5年）
  - [x] 日付クリックで選択
  - [x] 選択日のハイライト
  - [x] 土日の色分け（土=シアン、日=赤）

### 5.5 振替日ピッカーコンポーネント
- [x] components/attendance/TransferDayPicker.js
  - [x] カレンダーモーダル表示
  - [x] 日付選択後の自動連動処理
  - [x] 既存データがある場合の確認ダイアログ

### 5.6 勤怠テーブルの更新
- [x] 振替日入力欄をカレンダー選択に変更
- [x] 連動先の表示（→ 振休 / ← 休日出勤）
- [x] 連動解除ボタン（×アイコン）

### 5.7 連動時の確認ダイアログ
- [x] 既存データがある場合の上書き確認

### 5.8 整合性チェック
- [x] 区分変更時の自動連動解除（休日出勤/振休以外に変更時）
- [x] 連動解除時は両方のレコードをクリア

---

## エッジケース対応

| ケース | 対応 |
|--------|------|
| 振替先に既にデータがある | 確認ダイアログを表示 |
| 連動を解除する | 両方のレコードから連動情報を削除 |
| 片方を削除する | もう片方の連動情報も削除（unlinkTransferDay） |
| 年を跨ぐ振替 | 年月日（YYYY-MM-DD）で完全に管理 |
| 同じ日に複数の振替 | 1日1振替のみ許可（既存連動がある場合は先に解除が必要） |

---

## 実装記録

### 実装日: 2025-02-02

### 実装内容:

1. **attendanceService.js**: Phase 3で実装済み
   - `linkTransferDays`: 休日出勤と振休を双方向で連動
   - `unlinkTransferDay`: 連動を解除（両方のレコードをクリア）

2. **Calendar.js**: Phase 3で実装済み
   - 年選択ドロップダウン（前後5年）
   - 月移動ボタン
   - 土日の色分け表示

3. **TransferDayPicker.js**: 確認ダイアログ追加
   - 選択した日に既存データがある場合、確認ダイアログを表示
   - 「変更する」で上書き、「キャンセル」で戻る

4. **AttendanceRow.js**: 連動解除ボタン追加
   - 振替日が設定されている場合、×ボタンを表示
   - クリックで連動を解除

5. **AttendanceTable.js**: 区分変更時の自動解除
   - 休日出勤/振休から他の区分に変更した場合、自動で連動解除

6. **AttendanceContext.js**: Phase 3で実装済み
   - `setTransferLink`: 振替連動を設定（ローカル状態 + Firestore）
   - `removeTransferLink`: 振替連動を解除

---

## 変更ファイル一覧

| ファイル | 変更種別 | 説明 |
|----------|----------|------|
| src/services/attendanceService.js | Phase 3で実装 | linkTransferDays, unlinkTransferDay |
| src/components/common/Calendar.js | Phase 3で実装 | カレンダーUI（年選択対応） |
| src/components/attendance/TransferDayPicker.js | 更新 | 確認ダイアログ追加 |
| src/components/attendance/AttendanceRow.js | 更新 | 連動解除ボタン追加 |
| src/components/attendance/AttendanceTable.js | 更新 | 自動連動解除、props追加 |
| src/pages/AttendancePage.js | 更新 | onClearTransferLink追加 |
| src/contexts/AttendanceContext.js | Phase 3で実装 | setTransferLink, removeTransferLink |

---

## 次フェーズへの申し送り

- 振替日のカレンダーに、既に休日出勤や振休が設定されている日を視覚的にマークする機能があると便利（今後の改善）
- 同一月外の振替日設定時、その月のデータが読み込まれていない可能性があるため、リフレッシュが必要になる場合がある
