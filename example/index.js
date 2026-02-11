const mineflayer = require("mineflayer");
const loader = require("../index.js");
const { loader: baritone } = require("@miner-org/mineflayer-baritone");
const { BotRole, BotWarBot } = require("./botWarBot");

const botsConfig = [
  { username: "WarCapturer", role: BotRole.CAPTURER },
  { username: "WarDefender", role: BotRole.DEFENDER },
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
        url: "ws://localhost:67420",
        token: "tokenHere",
      });

      bot.botwar.client.on("ready", () => {
        console.log("Authenticated!");
      });

      bot.botwar.client.on("joinGame", async ({ gameId }) => {
        // console.log(gameId);
        controlPoints.clear();
        const { points } = await bot.botwar.client.getControlPoints(gameId);
        points.forEach((p) =>
          controlPoints.set(`${p.x},${p.y},${p.z}`, {
            capped: false,
            teamId: "",
          }),
        );
        bot.botWarBot = new BotWarBot(bot, controlPoints, cfg.role);

        bot.botWarBot.setGameId(gameId);
        bot.botWarBot.start();
      });

      bot.botwar.client.on("gameEnd", ({ gameId }) => {
        bot.botWarBot?.stop();
      });

      bot.botwar.client.on(
        "controlCapture",
        ({ captureTeam, position, gameId }) => {
          bot.botWarBot?.onPointCaptured(position, captureTeam, gameId);
        },
      );
    });

    await new Promise((r) => setTimeout(r, 5000));
  }
})();
