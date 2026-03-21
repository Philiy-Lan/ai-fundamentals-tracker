import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ModuleComplete({ moduleTitle, show }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-16 left-1/2 z-40 -translate-x-1/2 px-5 py-3 rounded-xl border text-center"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--success-border)",
            boxShadow: "var(--shadow-md)",
          }}
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -10, x: "-50%" }}
        >
          <span className="text-sm font-medium text-[var(--success)]">
            {"\u2728"} {moduleTitle} complete!
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
