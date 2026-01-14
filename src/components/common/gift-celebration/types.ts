export interface GiftCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  giftName?: string;
  locale?: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "square" | "star" | "ribbon";
}

export type AnimationPhase = "idle" | "shake" | "explode" | "celebrate";
