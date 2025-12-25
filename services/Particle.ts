
import { EngineConfig } from '../types';

export class Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number = 0;
  vy: number = 0;
  radius: number;
  color: string;
  id: number;
  friction: number;
  ease: number;

  constructor(
    x: number, 
    y: number, 
    radius: number, 
    color: string, 
    id: number,
    friction: number,
    ease: number
  ) {
    // Start at a random position for a nice "gathering" effect on spawn
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.homeX = x;
    this.homeY = y;
    this.radius = radius;
    this.color = color;
    this.id = id;
    this.friction = friction;
    this.ease = ease;
  }

  update(
    mouseX: number, 
    mouseY: number, 
    repulsionRadius: number, 
    repulsionStrength: number,
    time: number
  ) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Repulsion Logic
    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      this.vx += Math.cos(angle) * force;
      this.vy += Math.sin(angle) * force;
    }

    // Return Home Logic
    this.vx += (this.homeX - this.x) * this.ease;
    this.vy += (this.homeY - this.y) * this.ease;

    // Physics
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    // Ambient Breathing (Subtle Oscillation)
    this.x += Math.sin(time * 0.002 + this.id) * 0.2;
    this.y += Math.cos(time * 0.002 + this.id) * 0.2;
  }
}
