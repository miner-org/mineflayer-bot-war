const mineflayer = require("mineflayer");
const botWarPlugin = require("./index.js");

const bot = mineflayer.createBot({
  host: "localhost",
  username: "Frisk",
  port: 25565,
  viewDistance: "tiny",
});

bot.loadPlugin(botWarPlugin);

bot.once("spawn", async () => {
  await bot.waitForChunksToLoad();
  bot.botwar.connect({
    url: "ws://localhost:8765",
    token: "92389d0ffe1547f1b41939abcc9f0b59",
  });

  bot.botwar.client.on("ready", async () => {
    console.log("uwu")
    const teams = await bot.botwar.client.getTeams();

    console.log(teams);
  })
});
