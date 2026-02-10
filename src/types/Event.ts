export interface SimpleVec3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerKilledEvent {
  killer: string;
  dead: string;
  team: string;
  gameId: string;
}

export interface TeamWinEvent {
  team: string;
  gameId: string;
}

export interface StartCaptureEvent {
  captureTeam: string;
  position: SimpleVec3;
  gameId: string;
}

export interface ControlCaptureEvent {
  captureTeam: string;
  position: SimpleVec3;
  gameId: string;
}

export interface ControlDecayEvent {
  position: SimpleVec3;
  gameId: string;
}
export interface GameStartEvent {
  gameId: string;
}

export interface GameEndEvent {
  gameId: string;
}

export interface DuelStartEvent {
  gameId: string;
  team1: {
    teamId: string;
    members: string[];
  };
  team2: {
    teamId: string;
    members: string[];
  };
}

export interface DuelEndEvent {
  gameId: string;
}
