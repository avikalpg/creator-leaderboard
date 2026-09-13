export interface DiscordBroadcastPayload {
  title: string;
  description: string;
  color?: number;
  fields: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

export async function sendDiscordWebhook(
  webhookUrl: string | undefined,
  embed: DiscordBroadcastPayload
): Promise<boolean> {
  const url = webhookUrl || process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    return false;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: embed.title,
            description: embed.description,
            color: embed.color ?? 0x6366f1, // GenC Indigo
            fields: embed.fields,
            footer: embed.footer ?? { text: "GenC Cohort Leaderboard Engine" },
            timestamp: embed.timestamp ?? new Date().toISOString(),
          },
        ],
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to send Discord webhook:", err);
    return false;
  }
}
