const mineflayer = require("mineflayer");
const loader = require("../index.js");
const { loader: baritone } = require("@miner-org/mineflayer-baritone");
const { BotRole, BotWarBot } = require("./botWarBot");

const botsConfig = [
  { username: "Frisk", role: BotRole.CAPTURER, joinTeam: "blue" },
  { username: "Chara", role: BotRole.DEFENDER, joinTeam: "blue" },
  { username: "Chisomo", role: BotRole.DEFENDER, joinTeam: "red" },
  { username: "Najira", role: BotRole.CAPTURER, joinTeam: "red" },
];

const controlPoints = new Map();

(async () => {
  for (const cfg of botsConfig) {
    const bot = mineflayer.createBot({
      host: "localhost",
      username: cfg.username,
      port: 24751,
      version: "1.21.1",
    });

    bot.loadPlugin(loader);
    bot.loadPlugin(baritone);

    bot.once("spawn", async () => {
      await bot.waitForChunksToLoad();
      bot.botwar.connect({
        url: "localhost:67420",
        token: "token",
      });

      bot.botwar.client.on("ready", () => {
        // bot.chat(`/join-team ${cfg.joinTeam}`);
      });

      bot.botwar.client.on("gameStarted", async () => {
        controlPoints.clear();
        const { points } = await bot.botwar.client.getControlPoints();
        points.forEach((p) =>
          controlPoints.set(`${p.x},${p.y},${p.z}`, {
            capped: false,
            teamId: "",
          }),
        );
        bot.botWarBot = new BotWarBot(bot, controlPoints, cfg.role);
        bot.botWarBot.start();
      });

      bot.botwar.client.on("gameEnd", () => {
        bot.botWarBot?.stop();
      });

      bot.botwar.client.on("controlCapture", ({ captureTeam, position }) => {
        bot.botWarBot?.onPointCaptured(position, captureTeam);
      });
    });

    await new Promise((r) => setTimeout(r, 5000));
  }
})();
