# interact.js フローチャート

```mermaid
flowchart TD
    Start([リクエスト受信]) --> CheckMethod{POST<br/>メソッド?}

    CheckMethod -->|No| ReturnError[405エラーを返す]
    ReturnError --> End([終了])

    CheckMethod -->|Yes| LoadEnv[環境変数をロード<br/>SLACK_BOT_TOKEN<br/>ALLOWED_CHANNEL_ID]

    LoadEnv --> CheckBodyType{req.bodyの<br/>型は?}

    CheckBodyType -->|String| ExtractPayload1[payload=を除去]
    CheckBodyType -->|Object| ExtractPayload2[payload属性を取得]
    CheckBodyType -->|その他| NoPayload[エラーログ出力]

    NoPayload --> Return200A[200を返す]
    Return200A --> End

    ExtractPayload1 --> Decode[URLデコード]
    ExtractPayload2 --> Decode

    Decode --> ParseJSON{JSON<br/>パース成功?}

    ParseJSON -->|失敗| LogError1[エラーログ出力]
    LogError1 --> Return200B[200を返す]
    Return200B --> End

    ParseJSON -->|成功| CheckCallback{callback_id<br/>== 'get_pokemon'?}

    CheckCallback -->|No| Return200C[200を返す]
    Return200C --> End

    CheckCallback -->|Yes| GetChannelId[チャンネルIDを取得<br/>環境変数 or payload]

    GetChannelId --> CheckChannel{チャンネルID<br/>あり?}

    CheckChannel -->|No| LogError2[エラーログ出力]
    LogError2 --> Return200D[200を返す]
    Return200D --> End

    CheckChannel -->|Yes| GenerateRandom[ランダムID生成<br/>1〜1025]

    GenerateRandom --> FetchSpecies[PokeAPI:<br/>pokemon-species取得]

    FetchSpecies --> GetJaName[日本語名を抽出<br/>ja-Hrkt]

    GetJaName --> FetchGeneration[PokeAPI:<br/>generation取得]

    FetchGeneration --> GetGenerationJa[世代の日本語名を抽出]

    GetGenerationJa --> FetchRegion[PokeAPI:<br/>region取得]

    FetchRegion --> GetRegionJa[地方の日本語名を抽出]

    GetRegionJa --> GetImageUrl[スプライト画像URLを構築]

    GetImageUrl --> BuildMessage[Slackメッセージを構築<br/>blocks形式]

    BuildMessage --> PostMessage[Slack API:<br/>chat.postMessage]

    PostMessage --> CheckPost{投稿<br/>成功?}

    CheckPost -->|失敗| LogError3[エラーログ出力]
    CheckPost -->|成功| Return200E[200を返す]
    LogError3 --> Return200E

    Return200E --> End
```

## 処理概要

このAPIエンドポイントは、Slackのショートカット機能から呼び出され、ランダムなポケモン情報をSlackチャンネルに投稿します。

### 主要な処理フロー

1. **リクエスト検証**: POSTメソッドかどうかをチェック
2. **ペイロード解析**: Slackから送られてくるpayloadをパースし、callback_idを確認
3. **ポケモン情報取得**: PokeAPIから以下の情報を取得
   - ポケモンの日本語名
   - 世代情報
   - 地方（生息地）情報
   - スプライト画像
4. **Slack投稿**: 取得した情報をSlackのBlocks形式でフォーマットし、chat.postMessageで投稿

### 外部API連携

- **PokeAPI**:
  - `/api/v2/pokemon-species/{id}` - ポケモン種族情報
  - `/api/v2/generation/{id}` - 世代情報
  - `/api/v2/region/{id}` - 地方情報
- **Slack API**:
  - `chat.postMessage` - メッセージ投稿
