const {
  goals: { GoalNear },
} = require("@miner-org/mineflayer-baritone");
const { Vec3 } = require("vec3");

const BotState = Object.freeze({
  IDLE: "IDLE",
  SELECTING_POINT: "SELECTING_POINT",
  MOVING_TO_POINT: "MOVING_TO_POINT",
  CAPTURING: "CAPTURING",
  STOPPED: "STOPPED",
  ATTACKING: "ATTACKING",
  MOVING_TO_TARGET: "MOVING_TO_TARGET",
  ATTACK_COOLDOWN: "ATTACK_COOLDOWN",
});

const BotRole = Object.freeze({
  CAPTURER: "capturer",
  DEFENDER: "defender",
});

class BotWarBot {
  /**
   * @param {import("mineflayer").Bot} bot
   * @param {Map<string, { capped: boolean, teamId: string }>} controlPoints
   * @param {string} [role=BotRole.CAPTURER]
   * @param {{ debug?: boolean }} options
   */
  constructor(bot, controlPoints, role = BotRole.CAPTURER, options = {}) {
    this.bot = bot;
    this.role = role;
    this.controlPoints = controlPoints;
    this.state = BotState.IDLE;
    this.prevState = null;
    /**
     * Can either be an entityId or a vec3 depending on the bot role
     * @type {Vec3 | number}
     */
    this.target = null;
    this.running = false;
    this.tickRate = 250;
    this.debug = options.debug ?? true;
    this.ownTeamId = null;
    this.teamates = [];
    this.allPlayers = [];
    this.gameId = null;

    if (this.role === BotRole.DEFENDER) {
      this.attackCooldown = options.attackCooldown ?? 700;
      this.lastAttackTime = 0;
    }
  }

  setGameId(id) {
    this.gameId = id;
  }

  async initTeam() {
    const res = await this.bot.botwar.client.getOwnTeam(this.gameId);
    this.ownTeamId = res?.team ?? null;
    const res2 = await this.bot.botwar.client.getTeamPlayers(
      this.ownTeamId,
      this.gameId,
    );
    this.teamates =
      res2?.players?.filter((name) => name !== this.bot.username) ?? [];

    this.log("Our teamId:", this.ownTeamId);
    this.log("Teamates", this.teamates);
  }

  async initAllPlayers() {
    const res = await this.bot.botwar.client.getAllPlayers(this.gameId);
    this.allPlayers = res?.players ?? [];
  }

  log(...args) {
    if (!this.debug) return;
    console.log(`[BWB]`, ...args);
  }

  logStateChange(next) {
    if (this.state !== next) {
      this.log(`STATE: ${this.state} → ${next}`);
      this.prevState = this.state;
      this.state = next;
    }
  }

  async start() {
    if (this.running) return;
    this.running = true;

    await this.initAllPlayers();
    await this.initTeam();

    this.log("Starting bot war bot");
    this.logStateChange(BotState.IDLE);
    this.loop();
  }

  stop(gameId) {
    if (!this.running) return;
    if (gameId !== this.gameId) return;
    this.log("Stopping bot war bot");
    this.running = false;
    this.target = null;
    this.gameId = null;
    this.logStateChange(BotState.STOPPED);
    this.bot.ashfinder.stop();
  }

  onPointCaptured(position, teamId, gameId) {
    if (gameId !== this.gameId) return;

    const key = vecToString(position);
    this.controlPoints.set(key, { capped: true, teamId });

    this.log(`Point captured at ${key} by team ${teamId}`);

    if (
      this.target &&
      vecToString(this.target) === key &&
      teamId === this.ownTeamId
    ) {
      this.log("We successfully captured the target");
      this.target = null;
      this.logStateChange(BotState.SELECTING_POINT);
    }
  }

  async loop() {
    while (this.running && this.state !== BotState.STOPPED) {
      try {
        if (this.role === BotRole.CAPTURER) {
          await this.capturerLoop();
        } else if (this.role === BotRole.DEFENDER) {
          await this.defenderLoop();
        }
      } catch (err) {
        this.log("Error in role loop:", err);
      }
      await this.sleep(this.tickRate);
    }
  }

  async capturerLoop() {
    switch (this.state) {
      case BotState.IDLE:
        this.logStateChange(BotState.SELECTING_POINT);
        break;
      case BotState.SELECTING_POINT:
        await this.selectPoint();
        break;
      case BotState.MOVING_TO_POINT:
        await this.moveToPoint();
        break;
      case BotState.CAPTURING:
        await this.capture();
        break;
    }
  }

  async defenderLoop() {
    switch (this.state) {
      case BotState.IDLE:
        const defendTarget = this.findDefendTarget();
        if (defendTarget) {
          this.target = defendTarget.id;
          this.logStateChange(BotState.MOVING_TO_TARGET);
        }
        break;

      case BotState.MOVING_TO_TARGET:
        await this.moveToEnemy();
        break;

      case BotState.ATTACKING:
        await this.attackEnemy();
        break;

      case BotState.ATTACK_COOLDOWN:
        if (Date.now() - this.lastAttackTime >= this.attackCooldown) {
          if (this.target) {
            this.logStateChange(BotState.ATTACKING);
          } else {
            this.logStateChange(BotState.IDLE);
          }
        }
        break;
    }
  }

  findDefendTarget() {
    const enemies = Object.values(this.bot.entities)
      .filter(
        (e) =>
          e.isValid &&
          e.type === "player" &&
          !this.teamates.includes(e.username) &&
          e.username !== this.bot.username,
        this.allPlayers.includes(e.username),
      )
      .sort(
        (a, b) =>
          a.position.distanceTo(this.bot.entity.position) -
          b.position.distanceTo(this.bot.entity.position),
      );

    return enemies[0] ?? null;
  }

  async moveToEnemy() {
    const targetEnt = this.bot.entities[this.target];
    if (!targetEnt) {
      this.log("Target lost while moving");
      this.target = null;
      this.logStateChange(BotState.IDLE);
      return;
    }

    const dist = this.bot.entity.position.distanceTo(targetEnt.position);

    if (dist > 2.5) {
      try {
        await this.bot.ashfinder.goto(new GoalNear(targetEnt.position, 2));
      } catch (err) {
        this.log("Pathfinding failed:", err.message);
        this.target = null;
        this.logStateChange(BotState.IDLE);
      }
    } else {
      this.logStateChange(BotState.ATTACKING);
    }
  }

  async attackEnemy() {
    const targetEnt = this.bot.entities[this.target];
    if (!targetEnt) {
      this.log("Target gone");
      this.target = null;
      this.logStateChange(BotState.IDLE);
      return;
    }

    const dist = this.bot.entity.position.distanceTo(targetEnt.position);

    if (dist > 2.5) {
      this.logStateChange(BotState.MOVING_TO_TARGET);
      return;
    }

    if (Date.now() - this.lastAttackTime >= this.attackCooldown) {
      await this.bot.equip(
        this.bot.inventory.items().find((i) => i.name.includes("sword")),
      );
      this.bot.attack(targetEnt);
      this.lastAttackTime = Date.now();
      this.logStateChange(BotState.ATTACK_COOLDOWN);
    }
  }

  async idle() {
    this.logStateChange(BotState.SELECTING_POINT);
  }

  async selectPoint() {
    const candidates = [...this.controlPoints.entries()]
      .map(([k, v]) => ({ pos: stringToVec(k), data: v }))
      .filter(({ pos }) => this.isEnemyOrUncapped(pos))
      .sort(
        (a, b) =>
          a.pos.distanceTo(this.bot.entity.position) -
          b.pos.distanceTo(this.bot.entity.position),
      );

    if (!candidates.length) {
      this.log("No capturable points available");
      return;
    }

    this.target = candidates[0].pos;
    this.log(`Selected target ${vecToString(this.target)}`);

    this.logStateChange(BotState.MOVING_TO_POINT);
  }

  async moveToPoint() {
    if (!this.target) {
      this.log("Lost target while moving");
      this.logStateChange(BotState.SELECTING_POINT);
      return;
    }

    if (this.isOwnedByUs(this.target)) {
      this.log("Target already owned by us — retargeting");
      this.target = null;
      this.logStateChange(BotState.SELECTING_POINT);
      return;
    }

    const dist = this.bot.entity.position.distanceTo(this.target);

    this.log(`Moving to ${vecToString(this.target)} | dist=${dist.toFixed(2)}`);

    if (dist <= 2.5) {
      this.log("Reached control point");
      this.logStateChange(BotState.CAPTURING);
      return;
    }

    try {
      await this.bot.ashfinder.goto(new GoalNear(this.target, 1));
    } catch (err) {
      this.log("Pathfinding failed:", err?.message ?? err);
      this.logStateChange(BotState.SELECTING_POINT);
    }
  }

  async capture() {
    if (!this.target) {
      this.log("Capture state with no target");
      this.logStateChange(BotState.SELECTING_POINT);
      return;
    }

    const dist = this.bot.entity.position.distanceTo(this.target);

    if (dist > 2) {
      this.log(
        "Somehow moved away from capture target while in capturing state",
      );
      this.logStateChange(BotState.MOVING_TO_POINT);
      return;
    }

    if (this.isOwnedByUs(this.target)) {
      this.log(`Recapture confirmed at ${vecToString(this.target)}`);
      this.target = null;
      this.logStateChange(BotState.SELECTING_POINT);
    }
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  isPointCapped(vec3) {
    const data = this.controlPoints.get(vecToString(vec3));
    return data?.capped ?? false;
  }

  isEnemyOrUncapped(vec3) {
    const data = this.controlPoints.get(vecToString(vec3));
    if (!data) return false;

    if (!data.capped) return true;
    return data.teamId !== this.ownTeamId;
  }

  isOwnedByUs(vec3) {
    const data = this.controlPoints.get(vecToString(vec3));
    return data?.capped && data.teamId === this.ownTeamId;
  }
}

function vecToString(vec3) {
  return `${vec3.x},${vec3.y},${vec3.z}`;
}

function stringToVec(str) {
  const [x, y, z] = str.split(",").map(Number);
  return new Vec3(x, y, z);
}

module.exports = { BotRole, BotState, BotWarBot };
