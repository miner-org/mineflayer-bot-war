import TypedEmitter from "typed-emitter";

interface SimpleVec3 {
  x: number;
  y: number;
  z: number;
}

export interface BotWarClientEvents {
  ready(): void | Promise<void>;
  /**
   *
   * @param killer The kilelr
   * @param dead The one that died
   * @param team The killer's team
   */
  playerKilled(
    killer: string,
    dead: string,
    team: string,
  ): void | Promise<void>;
  gameStarted(): void | Promise<void>;
  gameEnd(): void | Promise<void>;

  teamWin(team: string): void | Promise<void>;

  startCapture(position: SimpleVec3, captureTeam: string): void | Promise<void>;
  /**
   * @description Fires when a control point is captured
   * @param position Position of the control point
   * @param captureTeam The team that captured the point
   */
  controlCapture(
    position: SimpleVec3,
    captureTeam: string,
  ): void | Promise<void>;
}

export interface BotWarClient extends TypedEmitter<BotWarClientEvents> {
  authenticate(): void;

  request(action: string, data: object): Promise<any>;

  getTeams(): Promise<string[]>;
}
