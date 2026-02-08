import TypedEmitter from "typed-emitter";
import {
  PlayerKilledEvent,
  TeamWinEvent,
  StartCaptureEvent,
  ControlCaptureEvent,
  SimpleVec3,
  ControlDecayEvent,
} from "./Event";

import { GameState } from "./GameState";

export interface BotWarClientEvents {
  ready(): void | Promise<void>;

  gameStarted(): void | Promise<void>;
  gameEnd(): void | Promise<void>;

  /**
   * Fired when a player is killed
   */
  playerKilled(data: PlayerKilledEvent): void | Promise<void>;

  teamWin(data: TeamWinEvent): void | Promise<void>;

  /**
   * Fired when a team starts capturing a control point
   */
  startCapture(data: StartCaptureEvent): void | Promise<void>;

  /**
   * Fired when a control point is fully captured
   */
  controlCapture(data: ControlCaptureEvent): void | Promise<void>;

  controlDecay(data: ControlDecayEvent): void | Promise<void>;
}

export interface BotWarClient extends TypedEmitter<BotWarClientEvents> {
  authenticate(): void;

  request<T = unknown>(
    action: string,
    payload?: Record<string, unknown>,
  ): Promise<T>;

  getTeams(): Promise<{ teams: string[] }>;
  getControlPoints(): Promise<{ points: SimpleVec3[] }>;
  getTeamScore(teamId: string): Promise<{ score: number }>;
  getTeamPlayers(teamId: string): Promise<{ players: string[] }>;
  getPlayerTeam(playerName: string): Promise<{ team: string }>;
  getOwnTeam(): Promise<{ team: string }>;
  getGameState(): Promise<{ gameState: GameState }>;
}
