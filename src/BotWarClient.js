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
        uuid: this.#bot._client.uuid,
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

  getTeams() {
    return this.request("getTeams");
  }

  getControlPoints() {
    return this.request("getControlPoints");
  }

  getTeamScore(teamId) {
    return this.request("getTeamScore", { teamId });
  }

  getTeamPlayers(teamId) {
    return this.request("getTeamPlayers", { teamId });
  }

  getPlayerTeam(playerName) {
    return this.request("getPlayerTeam", { playerName });
  }

  getOwnTeam() {
    return this.request("getPlayerTeam", { playerName: this.#bot.username });
  }
}

module.exports = BotWarClient;
