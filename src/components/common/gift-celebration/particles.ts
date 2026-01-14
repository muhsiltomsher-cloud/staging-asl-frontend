import type { Particle } from "./types";

export const COLORS = [
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#FF9F43",
  "#A55EEA",
  "#26DE81",
  "#FC5C65",
  "#45AAF2",
];

export const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50,
    y: 50,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 12 + 6,
    angle: (Math.PI * 2 * i) / count + Math.random() * 0.5,
    velocity: Math.random() * 15 + 10,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 20,
    shape: (["circle", "square", "star", "ribbon"] as const)[Math.floor(Math.random() * 4)],
  }));
};
