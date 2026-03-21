import confetti from "canvas-confetti";

export function fireCelebration() {
  const colors = ["#b07ff5", "#e06298", "#e8863a", "#5ec269"];

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.2, y: 0.6 },
    colors,
  });
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.8, y: 0.6 },
    colors,
  });
}
