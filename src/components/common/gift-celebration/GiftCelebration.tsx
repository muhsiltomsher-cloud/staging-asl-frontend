"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Gift } from "lucide-react";
import type { GiftCelebrationProps, Particle, AnimationPhase } from "./types";
import { generateParticles } from "./particles";
import { celebrationStyles } from "./styles";

export function GiftCelebration({ isVisible, onComplete, giftName, locale = "en" }: GiftCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
  const hasStartedRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const isRTL = locale === "ar";

  const startAnimation = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    setAnimationPhase("shake");
    
    const timeout1 = setTimeout(() => {
      setAnimationPhase("explode");
      setParticles(generateParticles(50));
    }, 600);

    const timeout2 = setTimeout(() => {
      setAnimationPhase("celebrate");
    }, 800);

    const timeout3 = setTimeout(() => {
      setAnimationPhase("idle");
      setParticles([]);
      hasStartedRef.current = false;
      onComplete();
    }, 3500);

    timeoutsRef.current = [timeout1, timeout2, timeout3];
  }, [onComplete]);

  useEffect(() => {
    if (isVisible && animationPhase === "idle" && !hasStartedRef.current) {
      const animationTimeout = setTimeout(() => {
        startAnimation();
      }, 0);
      return () => clearTimeout(animationTimeout);
    }
  }, [isVisible, animationPhase, startAnimation]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  if (!isVisible && animationPhase === "idle") return null;

  const renderParticle = (particle: Particle) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.shape !== "star" ? particle.color : "transparent",
      transform: `rotate(${particle.rotation}deg)`,
      borderRadius: particle.shape === "circle" ? "50%" : particle.shape === "ribbon" ? "2px" : "0",
      animation: animationPhase === "explode" || animationPhase === "celebrate"
        ? `particle-burst 2.5s ease-out forwards`
        : "none",
      "--particle-angle": `${particle.angle}rad`,
      "--particle-velocity": `${particle.velocity}`,
      "--particle-rotation": `${particle.rotationSpeed}deg`,
    } as React.CSSProperties;

    if (particle.shape === "star") {
      return (
        <svg
          key={particle.id}
          style={style}
          viewBox="0 0 24 24"
          fill={particle.color}
          className="particle"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }

    if (particle.shape === "ribbon") {
      return (
        <div
          key={particle.id}
          style={{
            ...style,
            width: particle.size * 3,
            height: particle.size / 2,
          }}
          className="particle"
        />
      );
    }

    return <div key={particle.id} style={style} className="particle" />;
  };

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 animate-fade-in pointer-events-auto" onClick={onComplete} />
      
      <div className="relative">
        <div
          className={`
            relative z-10 flex flex-col items-center justify-center
            ${animationPhase === "shake" ? "animate-gift-shake" : ""}
            ${animationPhase === "explode" ? "animate-gift-explode" : ""}
            ${animationPhase === "celebrate" ? "animate-gift-float" : ""}
          `}
        >
          <div className={`
            relative w-32 h-32 flex items-center justify-center
            ${animationPhase === "explode" || animationPhase === "celebrate" ? "animate-gift-open" : ""}
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl transform rotate-3" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-400 to-red-400 rounded-2xl shadow-xl" />
            
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-t-2xl" />
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 bg-gradient-to-b from-red-600 via-red-500 to-red-600" />
            
            <div className={`
              absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-8
              ${animationPhase === "explode" || animationPhase === "celebrate" ? "animate-ribbon-fly" : ""}
            `}>
              <div className="absolute left-0 w-6 h-6 bg-red-600 rounded-full transform -rotate-45 origin-bottom-right" />
              <div className="absolute right-0 w-6 h-6 bg-red-600 rounded-full transform rotate-45 origin-bottom-left" />
            </div>
            
            <Gift className={`
              relative z-10 h-12 w-12 text-white drop-shadow-lg
              ${animationPhase === "celebrate" ? "animate-bounce" : ""}
            `} />
          </div>

          {(animationPhase === "celebrate") && (
            <div className="mt-6 text-center animate-slide-up">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl border border-amber-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎁</span>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {isRTL ? "مبروك!" : "Congratulations!"}
                  </h3>
                  <span className="text-2xl">🎉</span>
                </div>
                <p className="text-gray-700 font-medium">
                  {isRTL ? "لقد حصلت على هدية مجانية!" : "You unlocked a free gift!"}
                </p>
                {giftName && (
                  <p className="text-amber-600 font-semibold mt-1 text-sm">
                    {giftName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-0 overflow-visible">
          {particles.map(renderParticle)}
        </div>

        {(animationPhase === "explode" || animationPhase === "celebrate") && (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"
                style={{
                  left: `${50 + Math.cos((Math.PI * 2 * i) / 12) * 80}%`,
                  top: `${50 + Math.sin((Math.PI * 2 * i) / 12) * 80}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </>
        )}
      </div>

      <style jsx>{celebrationStyles}</style>
    </div>
  );
}
