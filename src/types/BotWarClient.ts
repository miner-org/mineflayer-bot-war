import { EventEmitter } from "events";

export interface BotWarClient extends EventEmitter {
  authenticate(): void;

  request(action: string, data: object): Promise<any>;

  getTeams(): Promise<string[]>;
}
