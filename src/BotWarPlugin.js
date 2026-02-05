const BotWarClient = require("./BotWarClient.js");

class BotWarPlugin {
  #bot;
  constructor(bot) {
    this.#bot = bot;
    this.client = null;
  }

  /**
   *
   * @param {import("./types/WarClientOptions.js").WarClientOptions} options
   */
  connect(options) {
    this.client = new BotWarClient(this.#bot, options);
  }
}

module.exports = BotWarPlugin;
