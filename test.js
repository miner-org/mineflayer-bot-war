const mineflayer = require("mineflayer");
const botWarPlugin = require("./index.js");
const { Vec3 } = require("vec3");

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
  let teams = [];

  bot.botwar.client.on("ready", async () => {
    console.log("Authenticated!");
  });

  bot.on("messagestr", (msg, pos, chatMessage) => {
    if (chatMessage.json.translate !== "chat.type.text") return;
    const cleanName = username.replace(/[<>]/g, "").trim();
    const usableMessage = Object.values(chatMessage.json.with[1])[0];
    if (!usableMessage.startsWith(prefix)) return;

    if (cleanName !== "AshLikesFood") return;

    const args = usableMessage.split(" ");
    const command = args.shift();

    switch (command) {
      case "joinTeam": {
        const team = args[0];

        bot.chat(`/join-team ${team}`);
        break;
      }
    }
  });

  bot.botwar.client.on("gameStarted", async () => {
    //make sure we are actually in a team;
    const response = await bot.botwar.client.getOwnTeam();

    if (!response || (response && response.team == null)) return;

    //get nearest control point
    const controlResponse = await bot.botwar.client.getControlPoints();

    if (!controlResponse) return;

    const points = controlResponse.points
      .map((p) => new Vec3(p.x, p.y, p.z))
      .sort(
        (a, b) =>
          bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b),
      );

      const closest = points[0];

      
  });
});
