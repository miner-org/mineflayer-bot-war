export interface SimpleVec3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerKilledEvent {
  killer: string;
  dead: string;
  team: string;
}

export interface TeamWinEvent {
  team: string;
}

export interface StartCaptureEvent {
  captureTeam: string;
  position: SimpleVec3;
}

export interface ControlCaptureEvent {
  captureTeam: string;
  position: SimpleVec3;
}
