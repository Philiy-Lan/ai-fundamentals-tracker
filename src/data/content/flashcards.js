// Flashcard Q&A pairs per module.
// All 8 modules populated in Phase 3.
export const FLASHCARDS = {
  "1": [
    {
      question: "What is the difference between narrow AI and general AI?",
      answer: "Narrow AI handles a specific task (e.g., image recognition or chess). General AI can reason across domains like a human — it does not yet exist.",
    },
    {
      question: "Name the three main types of machine learning.",
      answer: "Supervised learning, unsupervised learning, and reinforcement learning.",
    },
    {
      question: "What is a training dataset?",
      answer: "A labeled collection of examples used to teach a model which patterns to recognize or predict.",
    },
    {
      question: "What is the Turing Test?",
      answer: "A test proposed by Alan Turing where a machine must convince a human judge it is human through conversation. It measures conversational intelligence, not general intelligence.",
    },
    {
      question: "What distinguishes machine learning from traditional programming?",
      answer: "Traditional programming uses explicit rules written by humans. ML learns rules from data — the programmer defines the goal, not the logic.",
    },
    {
      question: "What is overfitting?",
      answer: "When a model learns the training data too well — including noise — and fails to generalize to new examples.",
    },
    {
      question: "What is a feature in machine learning?",
      answer: "An individual measurable input variable used by a model to make predictions (e.g., age, pixel value, word frequency).",
    },
    {
      question: "What is inference in an AI context?",
      answer: "Running a trained model on new input to produce a prediction or output — the deploy-time counterpart to training.",
    },
  ],
  "2": [
    {
      question: "What is supervised learning?",
      answer: "A learning approach where a model is trained on labeled input-output pairs, learning to map inputs to correct outputs.",
    },
    {
      question: "What is unsupervised learning?",
      answer: "Learning from unlabeled data to discover hidden patterns or structure, such as clustering or dimensionality reduction.",
    },
    {
      question: "What is reinforcement learning?",
      answer: "A learning approach where an agent takes actions in an environment and learns from rewards or penalties to maximize cumulative reward.",
    },
    {
      question: "What is a decision tree?",
      answer: "A tree-shaped model where each node tests a feature, each branch represents an outcome, and each leaf predicts a class or value.",
    },
    {
      question: "What does a loss function measure?",
      answer: "The difference between the model's predictions and the true labels — training minimizes this to improve accuracy.",
    },
    {
      question: "What is gradient descent?",
      answer: "An optimization algorithm that iteratively adjusts model weights in the direction that reduces the loss function.",
    },
    {
      question: "What is cross-validation?",
      answer: "A technique that splits data into multiple folds, training and testing on different subsets to estimate generalization performance.",
    },
    {
      question: "What is a hyperparameter?",
      answer: "A model configuration set before training (e.g., learning rate, number of layers) — distinct from parameters learned during training.",
    },
  ],
  "3": [
    {
      question: "What is a neural network?",
      answer: "A computational model loosely inspired by the brain — layers of interconnected nodes (neurons) transform inputs into outputs through learned weights.",
    },
    {
      question: "What is a weight in a neural network?",
      answer: "A learnable parameter connecting two neurons. Training adjusts weights so the network maps inputs to correct outputs.",
    },
    {
      question: "What is an activation function?",
      answer: "A function applied to a neuron's output to introduce non-linearity — without it, stacked layers would collapse to a single linear transform.",
    },
    {
      question: "What is backpropagation?",
      answer: "An algorithm that computes gradients by propagating the error signal backward through the network, enabling gradient descent to update weights.",
    },
    {
      question: "What is a convolutional neural network (CNN) used for?",
      answer: "Image and spatial data — convolutions detect local features (edges, textures) that are position-invariant, making CNNs efficient for vision tasks.",
    },
    {
      question: "What is a recurrent neural network (RNN)?",
      answer: "A network with loops allowing information to persist across sequence steps — designed for sequential data like text or time series.",
    },
    {
      question: "What is dropout in deep learning?",
      answer: "A regularization technique that randomly zeroes neuron activations during training, preventing co-adaptation and reducing overfitting.",
    },
    {
      question: "What is batch normalization?",
      answer: "A technique that normalizes layer inputs to have zero mean and unit variance during training, stabilizing and accelerating learning.",
    },
  ],
  "4": [
    {
      question: "What is a large language model (LLM)?",
      answer: "A neural network trained on vast text corpora to predict the next token — capable of generating, summarizing, translating, and reasoning about text.",
    },
    {
      question: "What is the transformer architecture?",
      answer: "A neural architecture using self-attention to relate every position in a sequence to every other, enabling parallel training and strong long-range modeling.",
    },
    {
      question: "What is self-attention?",
      answer: "A mechanism that computes a weighted sum of all positions in a sequence, letting each token 'attend' to every other token to build contextual representations.",
    },
    {
      question: "What is a token in the context of LLMs?",
      answer: "The basic unit an LLM processes — roughly a word or word fragment. GPT-4 uses about 0.75 words per token on average.",
    },
    {
      question: "What is prompt engineering?",
      answer: "Crafting input text to elicit accurate, useful, or appropriately formatted outputs from a language model — without changing the model weights.",
    },
    {
      question: "What is few-shot prompting?",
      answer: "Providing a small number of input-output examples inside the prompt to show the model the desired pattern before asking it to generalize.",
    },
    {
      question: "What is temperature in LLM generation?",
      answer: "A sampling parameter — low temperature makes outputs more deterministic and focused; high temperature makes them more random and creative.",
    },
    {
      question: "What is fine-tuning an LLM?",
      answer: "Continuing training on task-specific data after pretraining, adapting the model's behavior to a narrower domain or instruction-following style.",
    },
  ],
  "5": [
    {
      question: "What is natural language processing (NLP)?",
      answer: "The field of AI concerned with enabling computers to understand, generate, and reason about human language in text or speech form.",
    },
    {
      question: "What is tokenization in NLP?",
      answer: "Splitting text into discrete units (tokens — words, subwords, or characters) that a model can process numerically.",
    },
    {
      question: "What is a word embedding?",
      answer: "A dense vector representation of a word where semantically similar words cluster together in high-dimensional space.",
    },
    {
      question: "What is sentiment analysis?",
      answer: "Classifying the emotional tone of text — typically positive, negative, or neutral — using ML models trained on labeled examples.",
    },
    {
      question: "What is named entity recognition (NER)?",
      answer: "Identifying and categorizing named entities (people, organizations, locations, dates) within text.",
    },
    {
      question: "What is the difference between stemming and lemmatization?",
      answer: "Stemming crudely chops word endings; lemmatization finds the dictionary root form. Lemmatization is slower but more accurate.",
    },
    {
      question: "What is TF-IDF?",
      answer: "Term Frequency–Inverse Document Frequency — a weight that increases with term frequency in a document but decreases with frequency across all documents, highlighting distinctive terms.",
    },
    {
      question: "What is machine translation?",
      answer: "Automatically converting text from one language to another using statistical or neural models trained on parallel corpora.",
    },
  ],
  "6": [
    {
      question: "What is retrieval-augmented generation (RAG)?",
      answer: "A pattern that combines a retrieval system (fetching relevant documents) with an LLM (generating answers) — grounding responses in current, factual content.",
    },
    {
      question: "What is a vector database?",
      answer: "A database optimized for storing and querying high-dimensional embeddings by semantic similarity (nearest-neighbor search) rather than exact match.",
    },
    {
      question: "What is an embedding in the context of RAG?",
      answer: "A fixed-size numerical vector representing a chunk of text's semantic meaning — used to find similar content via vector search.",
    },
    {
      question: "Why does RAG reduce hallucination?",
      answer: "The LLM's answer is grounded in retrieved source documents it can cite, reducing reliance on memorized (and potentially outdated or wrong) training knowledge.",
    },
    {
      question: "What is chunking in a RAG pipeline?",
      answer: "Splitting source documents into smaller segments so each chunk fits in the LLM's context and retrieval returns the most relevant portion.",
    },
    {
      question: "What is a knowledge graph?",
      answer: "A structured representation of entities and their relationships as a graph — nodes are entities, edges are named relations.",
    },
    {
      question: "What is semantic search?",
      answer: "Search based on meaning rather than exact keywords — uses embeddings to find conceptually similar content even when words don't match.",
    },
    {
      question: "What is the difference between sparse and dense retrieval?",
      answer: "Sparse retrieval (e.g., BM25) matches on exact keyword overlap; dense retrieval uses embeddings to find semantically similar results even without shared terms.",
    },
  ],
  "7": [
    {
      question: "What is an AI agent?",
      answer: "A system that perceives its environment, decides on actions, executes them via tools, and iterates toward a goal — often using an LLM as its reasoning core.",
    },
    {
      question: "What is the Model Context Protocol (MCP)?",
      answer: "An open standard by Anthropic that lets AI models connect to external data sources and tools through a uniform interface, replacing one-off integrations.",
    },
    {
      question: "What is an agentic loop?",
      answer: "The observe-think-act cycle an agent runs repeatedly: receive context, decide the next action, call a tool, incorporate the result, and repeat until the task is done.",
    },
    {
      question: "What is tool use in the context of AI agents?",
      answer: "An agent's ability to call external functions (web search, code execution, API calls) and incorporate their results back into its reasoning.",
    },
    {
      question: "What is a multi-agent system?",
      answer: "A setup where multiple AI agents collaborate, each handling a sub-task, with outputs passed between them to solve problems beyond a single agent's scope.",
    },
    {
      question: "What is prompt injection in agentic AI?",
      answer: "An attack where malicious text in the environment (a webpage, document, or tool result) hijacks an agent's instructions, causing unintended actions.",
    },
    {
      question: "What is ReAct prompting?",
      answer: "A prompting strategy that interleaves reasoning (Thought) and action (Act/Observe) steps, letting the model plan and course-correct while using tools.",
    },
    {
      question: "What is an MCP server?",
      answer: "A lightweight process that exposes resources (files, databases, APIs) and tools (functions) to AI clients over the MCP protocol.",
    },
  ],
  "8": [
    {
      question: "What is AI alignment?",
      answer: "The challenge of ensuring AI systems pursue goals that are consistent with human values and intentions — especially critical as capabilities scale.",
    },
    {
      question: "What is a foundation model?",
      answer: "A large model trained on broad data at scale and adapted to many downstream tasks — GPT-4, Claude, and Gemini are examples.",
    },
    {
      question: "What is the AI risk of reward hacking?",
      answer: "When an agent achieves high reward by exploiting a proxy measure rather than the intended behavior — a failure of reward specification.",
    },
    {
      question: "What is responsible AI?",
      answer: "A set of practices and principles for developing AI that is fair, transparent, accountable, safe, and respectful of privacy and human rights.",
    },
    {
      question: "What is model interpretability?",
      answer: "The degree to which a human can understand why a model made a particular prediction — important for debugging, auditing, and trust.",
    },
    {
      question: "What is a system prompt in production AI architecture?",
      answer: "A persistent instruction block sent to the LLM before the user's message, defining the assistant's persona, capabilities, and constraints.",
    },
    {
      question: "What is latency in AI system design?",
      answer: "The time between sending a request and receiving a response — affected by model size, hardware, prompt length, and output length.",
    },
    {
      question: "What is the difference between AI safety and AI security?",
      answer: "Safety addresses misalignment and unintended behavior from within the AI system; security addresses external attacks (adversarial inputs, data poisoning, prompt injection).",
    },
  ],
}
