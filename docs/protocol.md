# 通信・データ設計（初版）

## データモデル

- `world`: id、管理者id、名前、生成シード、現在revision、作成・更新日時。
- `invite`: id、world id、トークンのハッシュ、有効期限、失効日時。生のトークンは作成時のみ表示する。
- `participant_session`: id、world id、招待id、期限、失効日時。表示名候補・色は個人情報を求めない。
- `block_event`: world id、revision、operation id、座標、操作前後の種類、実行セッション、確定時刻。world id + revision と world id + operation id はそれぞれ一意。
- `snapshot`: world id、revision、ブロックデータの保存先、作成時刻。復元時には新revisionを作り、履歴を上書きしない。

ワールドのブロックは有限範囲の整数座標と種類IDで表す。入力サイズ、座標範囲、種類、操作頻度をサーバーで検証する。

## メッセージ例

```json
{"type":"block.change","operationId":"client-generated-uuid","baseRevision":42,"position":{"x":1,"y":2,"z":3},"expected":"grass","next":"air"}
```

サーバーは権限と範囲を検証し、現在の種類が `expected` と一致すればトランザクションで操作IDの重複確認・イベント追記・revision更新を行う。成功すると `block.committed`（operationId、revision、position、next）を参加者全員に配信する。一致しない場合は `block.rejected`（operationId、理由、現在の種類、revision）を返す。重複操作IDの再送には元の確定結果を返し、二重適用しない。`baseRevision` は同期状況を判定するために使い、別座標の更新だけを理由に操作を拒否しない。

接続時は認可後にスナップショットとrevisionを読み込み、以降のイベントを順番に適用する。読み込みと購読の間の欠落を防ぐため、購読開始後に取得した境界revisionまでのイベントを読み直し、revisionで重複排除する。revisionの欠落を検出したら再同期する。位置情報は `presence` として送信し、順序保証や保存対象にしない。

## 失敗時

切断時は新しい編集を止め、接続状況を表示する。未確定操作は再接続後に同じoperationIdで結果を照会または再送し、確定・拒否を反映する。サーバーが保存できない場合は失敗を返し、全員に確定したように見せない。クライアントの時計を操作順序に使わない。
