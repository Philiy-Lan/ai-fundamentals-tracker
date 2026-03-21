import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useId } from "react";

export function ProgressRing({ percent, completedCount, totalActivities }) {
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = useId();

  const progress = useMotionValue(0);
  const dashOffset = useTransform(
    progress,
    (v) => circumference - (v / 100) * circumference
  );

  useEffect(() => {
    const controls = animate(progress, percent, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [percent, progress]);

  const isEmpty = percent === 0;

  return (
    <div className="flex flex-col items-center pt-4 pb-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b07ff5" />
              <stop offset="50%" stopColor="#e06298" />
              <stop offset="100%" stopColor="#e8863a" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isEmpty ? (
            <>
              <span className="text-2xl font-display font-bold text-[var(--text-primary)]">
                Ready?
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">
                Tap a module to begin
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-display font-bold text-[var(--text-primary)]">
                {percent}%
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">
                {completedCount} of {totalActivities}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
