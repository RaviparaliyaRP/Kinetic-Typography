
export interface EngineConfig {
  text: string;
  repulsionRadius: number;
  repulsionStrength: number;
  friction: number;
  ease: number;
  density: number;
  showLines: boolean;
  useGlow: boolean;
  trailAlpha: number;
  palette: string[];
}

export interface ParticleState {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  id: number;
}
