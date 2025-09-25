import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";

const {
  BOT_TOKEN,
  WEBHOOK_URL,   // ex: https://xxx.yyy.app/webhook
  WEBAPP_URL     // ex: https://ton-domaine (hébergement de la webapp)
} = process.env;

if (!BOT_TOKEN) throw new Error("BOT_TOKEN manquant");

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

// /start -> bouton pour ouvrir la Mini App
bot.start(async (ctx) => {
  await ctx.reply(
    "Bienvenue ! Ouvre la mini‑app ci-dessous 👇",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Ouvrir l'app", web_app: { url: WEBAPP_URL } }]]
      }
    }
  );
});

// Webhook endpoint
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res).catch((err) => {
    console.error("handleUpdate error:", err);
    res.status(500).end();
  });
});

// Healthcheck
app.get("/health", (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log("Bot server sur port", port);
  if (WEBHOOK_URL) {
    try {
      await bot.telegram.setWebhook(WEBHOOK_URL);
      console.log("Webhook défini sur", WEBHOOK_URL);
    } catch (e) {
      console.error("Erreur setWebhook:", e);
    }
  } else {
    console.log("⚠️ Pas de WEBHOOK_URL : configure-le pour la prod.");
  }
});
