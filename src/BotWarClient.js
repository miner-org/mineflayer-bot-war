const EventEmitter = require("events");
const { WebSocket } = require("ws");
const { v4: uuid } = require("uuid");

class BotWarClient extends EventEmitter {
  #bot;

  constructor(bot, options = {}) {
    super();

    this.#bot = bot;

    /**
     * @type {import ("./types/WarClientOptions").WarClientOptions}
     */
    this.options = options;
    this.ws = new WebSocket(options.url);
    this.ready = false;
    this.pending = new Map();

    this.ws.on("open", () => this._authenticate());
    this.ws.on("message", (data) => this._handleMessage(data.toString()));
    this.ws.on("close", () => (this.ready = false));
  }

  _authenticate() {
    this.ws.send(
      JSON.stringify({
        type: "auth",
        token: this.options.token,
        botUUID: this.#bot._client.uuid,
      }),
    );
  }

  _handleMessage(msg) {
    const packet = JSON.parse(msg);
    if (packet.type === "auth_ok") {
      this.ready = true;
      this.emit("ready");
      return;
    }

    if (packet.type === "response" && packet.id) {
      const cb = this.pending.get(packet.id);
      if (cb) {
        this.pending.delete(packet.id);
        cb(packet.data);
      }
      return;
    }

    if (packet.type === "event") {
      this.emit(packet.event, packet.data);
    }
  }

  request(action, payload = {}) {
    if (!this.ready) return Promise.reject("BotWar not authenticated");

    return new Promise((resolve) => {
      const id = uuid();
      this.pending.set(id, resolve);
      this.ws.send(JSON.stringify({ type: "request", id, action, payload }));
    });
  }

  getAllPlayers(gameId) {
    if (!gameId) return console.error("No game id supplied");
    return this.request("getAllPlayers", { gameId });
  }

  getTeams(gameId = null) {
    return this.request("getTeams", { gameId });
  }

  getControlPoints(gameId) {
    if (!gameId) return console.error("No game id supplied");
    return this.request("getControlPoints", { gameId });
  }

  getTeamScore(teamId, gameId) {
    if (!gameId) return console.error("No game id supplied");
    return this.request("getTeamScore", { teamId, gameId });
  }

  getTeamPlayers(teamId, gameId = null) {
    return this.request("getTeamPlayers", { teamId, gameId });
  }

  getPlayerTeam(playerName, gameId = null) {
    return this.request("getPlayerTeam", { playerName });
  }

  getOwnTeam(gameId = null) {
    return this.request("getPlayerTeam", {
      playerName: this.#bot.username,
      gameId,
    });
  }
}

module.exports = BotWarClient;
