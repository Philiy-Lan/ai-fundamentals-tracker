// Concept explanation prompts for the Teach-Back activity per module.
// Module 1: scaffold prompts for "What is AI?"
// Modules 2-8: populated in Phase 4.
export const TEACHBACK_PROMPTS = {
  "1": [
    {
      prompt: "Explain what artificial intelligence is and how it differs from traditional software.",
      conceptArea: "AI definition",
    },
    {
      prompt: "Describe the three main types of machine learning and give a real-world example of each.",
      conceptArea: "ML types",
    },
  ],
  "2": [
    {
      prompt: "Explain the difference between supervised and unsupervised learning, and give an example of when you would use each.",
      conceptArea: "ML paradigms",
    },
    {
      prompt: "Describe how a model learns from training data and what overfitting means in plain terms.",
      conceptArea: "Model training",
    },
  ],
  "3": [
    {
      prompt: "Explain what a neural network is and how it processes information through layers.",
      conceptArea: "Neural network basics",
    },
    {
      prompt: "Describe what backpropagation does and why it matters for training neural networks.",
      conceptArea: "Backpropagation",
    },
  ],
  "4": [
    {
      prompt: "Explain how transformers use attention to process language differently from earlier approaches.",
      conceptArea: "Transformer architecture",
    },
    {
      prompt: "Describe what prompt engineering is and why the way you phrase a question to an LLM matters.",
      conceptArea: "Prompt engineering",
    },
  ],
  "5": [
    {
      prompt: "Explain what word embeddings are and why representing words as numbers is useful.",
      conceptArea: "Word embeddings",
    },
    {
      prompt: "Describe how sentiment analysis works and give an example of its real-world application.",
      conceptArea: "Sentiment analysis",
    },
  ],
  "6": [
    {
      prompt: "Explain what retrieval-augmented generation (RAG) is and why it helps reduce hallucinations.",
      conceptArea: "RAG fundamentals",
    },
    {
      prompt: "Describe what a vector database does and how it enables semantic search.",
      conceptArea: "Vector databases",
    },
  ],
  "7": [
    {
      prompt: "Explain what an AI agent is and how it differs from a simple chatbot.",
      conceptArea: "AI agents",
    },
    {
      prompt: "Describe how the Model Context Protocol (MCP) enables AI to use external tools.",
      conceptArea: "MCP and tool use",
    },
  ],
  "8": [
    {
      prompt: "Explain what responsible AI means and describe two concrete practices that help achieve it.",
      conceptArea: "AI ethics",
    },
    {
      prompt: "Describe the key considerations when designing a system that uses AI components.",
      conceptArea: "AI system design",
    },
  ],
}
