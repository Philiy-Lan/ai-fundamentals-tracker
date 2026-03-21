import { ExternalLink } from "lucide-react";
import { NOTEBOOK_ID, NOTEBOOK_BASE_URL } from "../data/modules";

export function NotebookLMButton() {
  const url = `${NOTEBOOK_BASE_URL}/${NOTEBOOK_ID}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-3 px-4
                 rounded-xl font-medium text-sm
                 active:scale-[0.98] transition-all duration-150"
      style={{
        backgroundColor: "var(--bg-card)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <ExternalLink size={16} />
      Open in NotebookLM
    </a>
  );
}
