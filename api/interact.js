// /pages/api/interact.js

export default async function handler(req, res) {
	console.log("🔥 /api/interact called", req.method, req.headers["user-agent"]);

	if (req.method !== "POST") {
		console.log("❌ Not POST");
		res.status(405).send("Method Not Allowed");
		return;
	}

	const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN; // xoxb-... をVercelの環境変数に設定しておく
	const ALLOWED_CHANNEL_ID = process.env.ALLOWED_CHANNEL_ID; // 特定チャンネル固定にしたい場合（任意）

	// Slackは application/x-www-form-urlencoded で送信してくる。
	// Next.js側のボディパース設定によっては req.body がオブジェクトではなく文字列のまま届くことがある。
	// ここでは両対応っぽく扱う。
	let payloadRaw;

	if (typeof req.body === "string") {
		// 例えば "payload=%7B%22type%22%3A%22shortcut%22..." のように来るケース
		// まず先頭の "payload=" をはがす
		if (req.body.startsWith("payload=")) {
			payloadRaw = req.body.slice("payload=".length);
		} else {
			// 念のため
			payloadRaw = req.body;
		}
	} else if (req.body && req.body.payload) {
		// 例えば { payload: "{...json...}" } のように来るケース
		payloadRaw = req.body.payload;
	} else {
		// 想定外の形
		console.error("No payload found in request body:", req.body);
		res.status(200).send("");
		return;
	}

	// URLデコード（%7B ... %7D → {" ... "}）
	const decoded = decodeURIComponent(payloadRaw);

	let payload;
	try {
		payload = JSON.parse(decoded);
	} catch (e) {
		console.error("Failed to parse payload JSON:", decoded, e);
		res.status(200).send("");
		return;
	}

	// ここでショートカットを識別する
	// Slackのショートカット作成画面で設定した Callback ID (例: "get_pokemon")
	if (payload.callback_id !== "get_pokemon") {
		// 他のショートカット用なら何もしない
		res.status(200).send("");
		return;
	}

	// どのチャンネルに投稿するか
	// グローバルショートカットでは channel は入らないことがあるので、
	// 固定のチャンネルIDを環境変数で指定しておくのが安全。
	const channelId = ALLOWED_CHANNEL_ID || (payload.channel && payload.channel.id);

	if (!channelId) {
		console.error("No channelId available. Set ALLOWED_CHANNEL_ID env or ensure payload.channel.id exists.");
		res.status(200).send("");
		return;
	}

	// ↓↓↓ ここをランダムガチャに差し替える ↓↓↓
	
	// とりあえずホケモン固定の例
	const pokemonName = "ポケモン";

	// 1〜1025のランダム整数
  const min = 1;
  const max = 1025;
  const id = Math.floor(Math.random() * (max - min + 1)) + min;
  // スプライト画像URL
  const pokemonImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

	// ↑↑↑ getpokemon.js のロジックを使ってランダムにするなら、ここで置き換える ↑↑↑

	// Slackのメッセージ本文
	const messageBody = {
		channel: channelId,
		// text: `${pokemonName} をゲット！`, // フォールバック用テキスト
		text: "", // フォールバック用テキスト
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `<@${payload.user.id}> がポケモンをゲットした！`,
				},
			},
			{
				type: "image",
				image_url: pokemonImageUrl,
				alt_text: pokemonName,
			},
		],
	};

	// Slack Web API: chat.postMessage
	try {
		const postResp = await fetch("https://slack.com/api/chat.postMessage", {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
			},
			body: JSON.stringify(messageBody),
		});

		const postJson = await postResp.json();

		if (!postJson.ok) {
			console.error("Slack chat.postMessage failed:", postJson);
		}
	} catch (err) {
		console.error("Error calling Slack chat.postMessage:", err);
	}

	// Slackには即座に200を返す必要がある
	// ここで返した文字列自体はユーザーの画面には直接出ない
	res.status(200).send("");
}
