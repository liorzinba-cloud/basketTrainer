export interface TeamPlayerProfile {
  id: string;
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'Def';
  height: string;
  team: 'offense' | 'defense';
}

export interface PlayerSimulationState {
  id: string;
  x: number;
  y: number;
}

export interface BallSimulationState {
  x: number;
  y: number;
  attachedToPlayerId: string | null;
}

export interface Frame {
  players: PlayerSimulationState[];
  ball: BallSimulationState;
}

export interface PlaybookDrill {
  id: string;
  name: string;
  description: string;
  frames: Frame[];
}
