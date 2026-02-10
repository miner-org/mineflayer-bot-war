const mineflayer = require("mineflayer");
const loader = require("../index.js");
const { loader: baritone } = require("@miner-org/mineflayer-baritone");
const { BotRole, BotWarBot } = require("./botWarBot");

const botsConfig = [
  { username: "Frisk", role: BotRole.CAPTURER },
  { username: "Chara", role: BotRole.DEFENDER },
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

      bot.botwar.client.on("duelStarted", async ({ gameId, team1, team2 }) => {
        const allPlayers = team1.members.concat(team2.members);

        //this duel is not for us
        if (!allPlayers.includes(bot.username)) return;

        controlPoints.clear();
        const { points } = await bot.botwar.client.getControlPoints();
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
