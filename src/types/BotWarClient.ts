import TypedEmitter from "typed-emitter";
import {
  PlayerKilledEvent,
  TeamWinEvent,
  StartCaptureEvent,
  ControlCaptureEvent,
  SimpleVec3,
  ControlDecayEvent,
  GameStartEvent,
  GameEndEvent,
  DuelStartEvent,
  DuelEndEvent,
} from "./Event";

import { GameState } from "./GameState";

export interface BotWarClientEvents {
  ready(): void | Promise<void>;

  gameStarted(data: GameStartEvent): void | Promise<void>;
  gameEnd(data: GameEndEvent): void | Promise<void>;

  duelStarted(data: DuelStartEvent): void | Promise<void>;
  duelEnded(data: DuelEndEvent): void | Promise<void>;

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

  getTeams(gameId?: string): Promise<{ teams: string[] }>;
  getControlPoints(gameId: string): Promise<{ points: SimpleVec3[] }>;
  getTeamScore(gameId: string, teamId: string): Promise<{ score: number }>;
  getTeamPlayers(
    teamId: string,
    gameId?: string,
  ): Promise<{ players: string[] }>;
  getPlayerTeam(playerName: string, gameid?: string): Promise<{ team: string }>;
  getOwnTeam(gameId?: string): Promise<{ team: string }>;
  getGameState(gameId: string): Promise<{ gameState: GameState }>;
}
