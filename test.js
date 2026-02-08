const mineflayer = require("mineflayer");
const botWarPlugin = require("./index.js");

const bot = mineflayer.createBot({
  host: "localhost",
  username: "Frisk",
  port: 24751,
  version: "1.21.1",
});

bot.loadPlugin(botWarPlugin);

bot.once("spawn", async () => {
  await bot.waitForChunksToLoad();
  console.log(bot._client.uuid);
  bot.botwar.connect({
    url: "localhost:8767",
    token: "259244a881984eb98a5a5f8f26b22d43",
  });

  bot.botwar.client.on("ready", async () => {
    console.log("Authenticated!");
  });
});
