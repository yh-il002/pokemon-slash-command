# getpokemon.js 処理フロー

以下はSlack Slash Command用APIエンドポイント（`api/getpokemon.js`）の処理フローです。

```mermaid
flowchart TD
    A[リクエスト受信] --> B{HTTPメソッドはPOST?}
    B -- No --> C[405 Method Not Allowedを返す]
    B -- Yes --> D[1〜1025のランダムなID生成]
    D --> E[画像URL生成]
    E --> F[Slack Block Kit形式のレスポンス生成]
    F --> G[200 OKでJSONレスポンス返却]
```

## 処理詳細
- リクエストがPOST以外の場合は405エラーを返す
- 1〜1025の範囲でランダムなポケモンIDを生成
- そのIDに対応するポケモン画像URLを作成
- Slack Block Kit形式で画像とテキストを含むレスポンスを構築
- 200 OKでJSONとして返却
