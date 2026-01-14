export const celebrationStyles = `
  @keyframes gift-shake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    10% { transform: translateX(-10px) rotate(-5deg); }
    20% { transform: translateX(10px) rotate(5deg); }
    30% { transform: translateX(-10px) rotate(-5deg); }
    40% { transform: translateX(10px) rotate(5deg); }
    50% { transform: translateX(-8px) rotate(-4deg); }
    60% { transform: translateX(8px) rotate(4deg); }
    70% { transform: translateX(-6px) rotate(-3deg); }
    80% { transform: translateX(6px) rotate(3deg); }
    90% { transform: translateX(-4px) rotate(-2deg); }
  }

  @keyframes gift-explode {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  @keyframes gift-open {
    0% { transform: scale(1) rotate(0deg); }
    30% { transform: scale(1.2) rotate(-5deg); }
    60% { transform: scale(1.1) rotate(3deg); }
    100% { transform: scale(1) rotate(0deg); }
  }

  @keyframes gift-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes ribbon-fly {
    0% { transform: translateX(-50%) translateY(0) scale(1); }
    50% { transform: translateX(-50%) translateY(-20px) scale(1.2); }
    100% { transform: translateX(-50%) translateY(0) scale(1); }
  }

  @keyframes particle-burst {
    0% {
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: 
        translate(
          calc(cos(var(--particle-angle)) * var(--particle-velocity) * 15px),
          calc(sin(var(--particle-angle)) * var(--particle-velocity) * 15px + 100px)
        )
        rotate(calc(var(--particle-rotation) * 20))
        scale(0);
      opacity: 0;
    }
  }

  @keyframes sparkle {
    0%, 100% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.5); opacity: 1; }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  .animate-gift-shake {
    animation: gift-shake 0.6s ease-in-out;
  }

  .animate-gift-explode {
    animation: gift-explode 0.3s ease-out;
  }

  .animate-gift-open {
    animation: gift-open 0.5s ease-out;
  }

  .animate-gift-float {
    animation: gift-float 2s ease-in-out infinite;
  }

  .animate-ribbon-fly {
    animation: ribbon-fly 0.5s ease-out;
  }

  .animate-sparkle {
    animation: sparkle 0.8s ease-in-out infinite;
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.5s ease-out 0.3s both;
  }

  .particle {
    pointer-events: none;
  }
`;
