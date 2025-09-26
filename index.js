import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";

const { BOT_TOKEN, WEBAPP_URL, WEBHOOK_URL } = process.env;
if (!BOT_TOKEN) throw new Error("BOT_TOKEN manquant");

const bot = new Telegraf(BOT_TOKEN);

// URL de ta WebApp (Netlify)
const webAppUrl = WEBAPP_URL || "https://cosmic-haupia-9fb894.netlify.app";

// /start -> bouton pour ouvrir la WebApp
bot.start(async (ctx) => {
  await ctx.reply("Bienvenue 🚀 Clique pour ouvrir l’app :", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 Ouvrir l’app", web_app: { url: webAppUrl } }]
      ]
    }
  });
});

const app = express();
app.use(express.json());
app.get("/health", (_, res) => res.json({ ok: true }));
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res).catch((err) => {
    console.error("handleUpdate error:", err);
    res.status(500).end();
  });
});

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
    // Pas de webhook ? On lance en long polling (pratique pour tester)
    await bot.launch();
    console.log("Bot lancé en mode long polling.");
  }
});
