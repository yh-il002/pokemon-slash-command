import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // SlackのSlash Commandは基本POSTで飛んでくる
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // 1〜1025でランダムな整数
  const min = 1;
  const max = 1025;
  const id = Math.floor(Math.random() * (max - min + 1)) + min;

  // 画像URL
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  // Slackに返すJSON
  // blocksを使って画像をどーんと出す（in_channelでチャンネル全員に見せる）
  const body = {
    response_type: "in_channel",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Random Pokémon #${id}*`
        }
      },
      {
        type: "image",
        image_url: imageUrl,
        alt_text: `Pokemon #${id}`
      }
    ]
  };

  res.status(200).json(body);
}
