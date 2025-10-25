export default function handler(req, res) {
  // SlackのSlash Commandは基本POST
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // 1〜1025のランダム整数
  const min = 1;
  const max = 1025;
  const id = Math.floor(Math.random() * (max - min + 1)) + min;

  // スプライト画像URL
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  // Slackに返すメッセージ（Block Kit）
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
