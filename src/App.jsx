import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useProgress } from "./hooks/useProgress";
import { useSync } from "./hooks/useSync";
import { Dashboard } from "./pages/Dashboard";
import { ModuleDetail } from "./pages/ModuleDetail";
import { Settings } from "./pages/Settings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const location = useLocation();
  const progress = useProgress();
  const sync = useSync(progress.state, progress.setState);

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        offset={20}
        toastOptions={{
          style: {
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-accent)",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "var(--shadow-md)",
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard progress={progress} sync={sync} />} />
          <Route path="/module/:id" element={<ModuleDetail progress={progress} />} />
          <Route path="/settings" element={<Settings progress={progress} sync={sync} />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
