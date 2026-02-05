const BotWarPlugin = require("./src/BotWarPlugin");

function loader(bot) {
  bot.botwar = new BotWarPlugin(bot);
}

module.exports = loader;
