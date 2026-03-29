// Multiple-choice quiz questions per module.
// All 8 modules populated in Phase 3.
export const QUIZZES = {
  "1": [
    {
      question: "Which of the following is an example of narrow AI?",
      options: [
        "A robot that can cook, clean, and write code",
        "A chess engine that only plays chess",
        "A system that learns any skill instantly",
        "A simulation of the human brain",
      ],
      correctIndex: 1,
    },
    {
      question: "What does training a model mean?",
      options: [
        "Writing the model's source code by hand",
        "Adjusting model parameters using example data",
        "Downloading pre-built weights from the internet",
        "Running the model in a live production environment",
      ],
      correctIndex: 1,
    },
    {
      question: "Which learning type uses labeled input-output pairs?",
      options: [
        "Reinforcement learning",
        "Unsupervised learning",
        "Supervised learning",
        "Transfer learning",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the Turing Test designed to evaluate?",
      options: [
        "A machine's ability to solve mathematical proofs",
        "Whether a machine can convince a human it is human through conversation",
        "How fast a computer can process data",
        "The accuracy of a model on a benchmark dataset",
      ],
      correctIndex: 1,
    },
    {
      question: "What is overfitting?",
      options: [
        "When a model performs well on both training and test data",
        "When a model is too simple to capture the data's patterns",
        "When a model memorizes training data and fails to generalize",
        "When training takes too long to complete",
      ],
      correctIndex: 2,
    },
    {
      question: "What is inference in machine learning?",
      options: [
        "The process of labeling training data",
        "Adjusting model weights during training",
        "Running a trained model on new input to produce predictions",
        "Splitting data into training and test sets",
      ],
      correctIndex: 2,
    },
    {
      question: "Which statement best describes Artificial General Intelligence (AGI)?",
      options: [
        "AI that can beat humans at a single game",
        "AI that exists today in most smartphones",
        "AI capable of reasoning across any domain like a human",
        "AI that uses only rule-based logic",
      ],
      correctIndex: 2,
    },
    {
      question: "What is a feature in machine learning?",
      options: [
        "A layer in a neural network",
        "A measurable input variable used to make predictions",
        "The output a model produces",
        "A type of activation function",
      ],
      correctIndex: 1,
    },
  ],
  "2": [
    {
      question: "Which type of ML does NOT require labeled training data?",
      options: [
        "Supervised learning",
        "Unsupervised learning",
        "Reinforcement learning from human feedback",
        "Transfer learning",
      ],
      correctIndex: 1,
    },
    {
      question: "What does gradient descent minimize?",
      options: [
        "The number of parameters in a model",
        "The training time",
        "The loss function",
        "The size of the dataset",
      ],
      correctIndex: 2,
    },
    {
      question: "In reinforcement learning, what does an agent receive for taking correct actions?",
      options: [
        "More training data",
        "A reward signal",
        "Updated weights directly",
        "A lower learning rate",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the purpose of a validation set?",
      options: [
        "To train the model's final weights",
        "To evaluate the model during training and tune hyperparameters",
        "To clean raw training data before use",
        "To store model checkpoints",
      ],
      correctIndex: 1,
    },
    {
      question: "What is a hyperparameter?",
      options: [
        "A weight learned during training",
        "A bias term in a linear model",
        "A configuration set before training begins",
        "A feature extracted from raw data",
      ],
      correctIndex: 2,
    },
    {
      question: "Which algorithm splits data into tree-like structures based on feature thresholds?",
      options: [
        "K-means clustering",
        "Decision tree",
        "Linear regression",
        "Principal component analysis",
      ],
      correctIndex: 1,
    },
    {
      question: "What does cross-validation help assess?",
      options: [
        "Whether two models have identical architectures",
        "How well a model generalizes to unseen data",
        "The total number of parameters in a model",
        "Whether the training data is balanced",
      ],
      correctIndex: 1,
    },
    {
      question: "What is regularization used for in machine learning?",
      options: [
        "Speed up the gradient descent computation",
        "Reduce overfitting by penalizing model complexity",
        "Normalize input features to the same scale",
        "Convert categorical features to numbers",
      ],
      correctIndex: 1,
    },
  ],
  "3": [
    {
      question: "What is the role of weights in a neural network?",
      options: [
        "They determine which activation function to use",
        "They are randomly reset after each epoch",
        "They are learned parameters that transform inputs into outputs",
        "They control the size of the training batch",
      ],
      correctIndex: 2,
    },
    {
      question: "Why are activation functions necessary in deep networks?",
      options: [
        "They speed up matrix multiplication",
        "They reduce memory usage per layer",
        "They introduce non-linearity so the network can learn complex patterns",
        "They ensure gradients are always positive",
      ],
      correctIndex: 2,
    },
    {
      question: "What does backpropagation compute?",
      options: [
        "The optimal learning rate for training",
        "Gradients of the loss with respect to each weight",
        "The predicted output for each training example",
        "The number of epochs needed to converge",
      ],
      correctIndex: 1,
    },
    {
      question: "Which architecture is best suited for image classification?",
      options: [
        "Recurrent neural network (RNN)",
        "Transformer",
        "Convolutional neural network (CNN)",
        "Restricted Boltzmann machine",
      ],
      correctIndex: 2,
    },
    {
      question: "What does dropout do during training?",
      options: [
        "Removes neurons permanently to reduce model size",
        "Randomly deactivates neurons to reduce overfitting",
        "Doubles the learning rate on selected layers",
        "Skips layers that produce near-zero activations",
      ],
      correctIndex: 1,
    },
    {
      question: "What problem do RNNs solve that feedforward networks cannot?",
      options: [
        "Classifying images with high resolution",
        "Processing variable-length sequential data",
        "Training with unlabeled data",
        "Running inference without GPUs",
      ],
      correctIndex: 1,
    },
    {
      question: "What is batch normalization primarily used for?",
      options: [
        "Augmenting training data during each epoch",
        "Randomly shuffling training examples",
        "Stabilizing and accelerating training by normalizing layer inputs",
        "Reducing the output dimensionality of a layer",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the vanishing gradient problem?",
      options: [
        "Gradients become too large during backprop, destabilizing training",
        "Gradients shrink toward zero in early layers, slowing or stopping learning",
        "The model forgets earlier training examples as it sees new ones",
        "Weights are initialized too close to zero",
      ],
      correctIndex: 1,
    },
  ],
  "4": [
    {
      question: "What does a large language model (LLM) predict at each step?",
      options: [
        "The sentiment of the entire input",
        "The most likely next token in the sequence",
        "Which language the input was written in",
        "A fixed-length embedding of the input",
      ],
      correctIndex: 1,
    },
    {
      question: "What makes the transformer architecture different from RNNs?",
      options: [
        "Transformers process sequences one token at a time",
        "Transformers use convolutional layers instead of attention",
        "Transformers process all positions in parallel using self-attention",
        "Transformers require labeled training data",
      ],
      correctIndex: 2,
    },
    {
      question: "What is temperature in LLM sampling?",
      options: [
        "The physical heat generated by GPU computation",
        "A measure of how many tokens the model considers at once",
        "A parameter controlling randomness — lower is more deterministic",
        "The initial learning rate used during pretraining",
      ],
      correctIndex: 2,
    },
    {
      question: "What is few-shot prompting?",
      options: [
        "Training the model on a small labeled dataset",
        "Providing a few examples inside the prompt to guide the model's output",
        "Reducing the model's context window size",
        "Using multiple models together to produce one answer",
      ],
      correctIndex: 1,
    },
    {
      question: "What is fine-tuning an LLM?",
      options: [
        "Rewriting the transformer architecture for a specific task",
        "Adjusting sampling parameters at inference time",
        "Continuing training on task-specific data after pretraining",
        "Compressing the model for faster inference",
      ],
      correctIndex: 2,
    },
    {
      question: "What is a token in LLM terms?",
      options: [
        "A unique identifier assigned to each user session",
        "An API key used to authenticate requests",
        "The basic unit of text the model processes (roughly a word or word fragment)",
        "A checkpoint saved during model training",
      ],
      correctIndex: 2,
    },
    {
      question: "What does self-attention allow a transformer to do?",
      options: [
        "Process inputs without positional information",
        "Relate every token to every other token in the same sequence",
        "Generate outputs faster by skipping redundant layers",
        "Share weights between the encoder and decoder",
      ],
      correctIndex: 1,
    },
    {
      question: "What is prompt engineering?",
      options: [
        "Building the infrastructure to host LLMs in production",
        "Modifying model weights to improve accuracy",
        "Crafting input text to guide an LLM toward desired outputs",
        "Compiling prompts into native machine code",
      ],
      correctIndex: 2,
    },
  ],
  "5": [
    {
      question: "What is tokenization in NLP?",
      options: [
        "Converting audio speech to text",
        "Splitting text into discrete units a model can process",
        "Translating text between languages",
        "Assigning sentiment scores to sentences",
      ],
      correctIndex: 1,
    },
    {
      question: "What do word embeddings capture?",
      options: [
        "The grammatical role of each word in a sentence",
        "The exact spelling and punctuation of a word",
        "Semantic relationships — similar words cluster together in vector space",
        "The frequency of a word in the training corpus",
      ],
      correctIndex: 2,
    },
    {
      question: "What is sentiment analysis used for?",
      options: [
        "Finding named entities like people and places in text",
        "Translating text from one language to another",
        "Classifying the emotional tone (positive, negative, neutral) of text",
        "Summarizing long documents into short versions",
      ],
      correctIndex: 2,
    },
    {
      question: "What does TF-IDF measure?",
      options: [
        "The total length of a document",
        "How distinctive a term is for a specific document relative to a corpus",
        "The syntactic complexity of a sentence",
        "The similarity between two word embeddings",
      ],
      correctIndex: 1,
    },
    {
      question: "What is named entity recognition (NER)?",
      options: [
        "Generating new names for entities in a story",
        "Identifying and categorizing real-world entities (people, places, dates) in text",
        "Ranking named entities by their importance score",
        "Replacing entity names with anonymized placeholders",
      ],
      correctIndex: 1,
    },
    {
      question: "How does lemmatization differ from stemming?",
      options: [
        "Lemmatization is faster but less accurate",
        "Stemming always returns a valid dictionary word",
        "Lemmatization returns the dictionary root form; stemming crudely chops endings",
        "They produce identical outputs on most words",
      ],
      correctIndex: 2,
    },
    {
      question: "What NLP task involves converting spoken words into text?",
      options: [
        "Machine translation",
        "Speech recognition (ASR)",
        "Text summarization",
        "Question answering",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the purpose of stop word removal in NLP preprocessing?",
      options: [
        "To prevent the model from processing punctuation",
        "To remove high-frequency words (like 'the', 'is') that carry little meaning",
        "To tokenize text at the character level",
        "To normalize numerical values in text",
      ],
      correctIndex: 1,
    },
  ],
  "6": [
    {
      question: "What does RAG stand for in AI?",
      options: [
        "Recursive Attention Gating",
        "Retrieval-Augmented Generation",
        "Randomized Answer Grounding",
        "Relational Aggregation Graph",
      ],
      correctIndex: 1,
    },
    {
      question: "Why does RAG reduce hallucination in LLM responses?",
      options: [
        "It uses a smaller model with less memorized misinformation",
        "It grounds responses in retrieved source documents the model can cite",
        "It adds a human review step before each response",
        "It lowers the temperature parameter to zero",
      ],
      correctIndex: 1,
    },
    {
      question: "What is a vector database primarily used for?",
      options: [
        "Storing relational tables with foreign key relationships",
        "Caching LLM responses for repeated identical queries",
        "Storing embeddings and querying them by semantic similarity",
        "Running SQL queries on unstructured text",
      ],
      correctIndex: 2,
    },
    {
      question: "What is chunking in a RAG pipeline?",
      options: [
        "Splitting the model's parameters into shards for distributed training",
        "Removing duplicate documents from the knowledge base",
        "Dividing source documents into smaller segments for retrieval and context",
        "Compressing embeddings to reduce storage costs",
      ],
      correctIndex: 2,
    },
    {
      question: "What is semantic search?",
      options: [
        "Searching for exact keyword matches in a document",
        "Search based on meaning, using embeddings to find conceptually similar content",
        "Filtering search results by publication date",
        "Ranking search results by link popularity",
      ],
      correctIndex: 1,
    },
    {
      question: "What is a knowledge graph?",
      options: [
        "A bar chart showing model performance over training time",
        "A graph structure where nodes are entities and edges are named relationships",
        "A neural network layer that stores factual knowledge",
        "A database of verified factual statements in JSON format",
      ],
      correctIndex: 1,
    },
    {
      question: "How does dense retrieval differ from sparse retrieval (e.g., BM25)?",
      options: [
        "Dense retrieval is always faster than sparse retrieval",
        "Sparse retrieval uses embeddings; dense uses exact keyword counts",
        "Dense retrieval uses embeddings to find semantically similar results even without shared terms",
        "Dense retrieval requires no training data",
      ],
      correctIndex: 2,
    },
    {
      question: "In a RAG system, what role does the LLM play?",
      options: [
        "Indexing documents into the vector database",
        "Computing similarity scores between query and document embeddings",
        "Generating the final answer grounded in retrieved documents",
        "Managing the retrieval pipeline and chunking strategy",
      ],
      correctIndex: 2,
    },
  ],
  "7": [
    {
      question: "What distinguishes an AI agent from a simple chatbot?",
      options: [
        "An agent uses a larger language model",
        "An agent takes actions, uses tools, and iterates toward a goal autonomously",
        "An agent only responds to pre-defined commands",
        "An agent processes images instead of text",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the Model Context Protocol (MCP)?",
      options: [
        "A fine-tuning technique for adapting LLMs to specific tasks",
        "A compression algorithm for reducing model size",
        "An open standard for connecting AI models to external tools and data sources",
        "A benchmark for evaluating LLM reasoning ability",
      ],
      correctIndex: 2,
    },
    {
      question: "What is an agentic loop?",
      options: [
        "A loop that runs the same prompt multiple times until the answer stabilizes",
        "The observe-think-act cycle an agent repeats until a task is complete",
        "A feedback loop in reinforcement learning training",
        "A loop that retries failed tool calls with exponential backoff",
      ],
      correctIndex: 1,
    },
    {
      question: "What is prompt injection in agentic AI?",
      options: [
        "Adding few-shot examples to improve agent performance",
        "Compressing a prompt to fit within the context window",
        "Malicious text in the environment that hijacks the agent's instructions",
        "Injecting user preferences into the system prompt",
      ],
      correctIndex: 2,
    },
    {
      question: "What is ReAct prompting?",
      options: [
        "A React.js framework for building AI agent UIs",
        "A technique that alternates reasoning steps and action calls so the model can plan and adjust",
        "A method for reducing hallucination by reacting to user corrections",
        "A prompt compression algorithm that removes redundant reasoning",
      ],
      correctIndex: 1,
    },
    {
      question: "What does an MCP server expose to AI clients?",
      options: [
        "Pre-trained model weights for fine-tuning",
        "Resources (files, databases) and tools (callable functions) via the MCP protocol",
        "A hosted LLM endpoint the client calls directly",
        "Training data curated for a specific domain",
      ],
      correctIndex: 1,
    },
    {
      question: "Why are multi-agent systems useful?",
      options: [
        "They reduce the total compute needed for a task",
        "Multiple specialized agents can collaborate on sub-tasks beyond a single agent's scope",
        "They eliminate the need for tool use in each agent",
        "They ensure responses are always factually correct",
      ],
      correctIndex: 1,
    },
    {
      question: "What is tool use in the context of AI agents?",
      options: [
        "Using IDE plugins to help developers write agent code",
        "Deploying agents to hardware tools like robots",
        "The agent's ability to call external functions and incorporate their results into reasoning",
        "Selecting which LLM to use for each sub-task",
      ],
      correctIndex: 2,
    },
  ],
  "8": [
    {
      question: "What is AI alignment?",
      options: [
        "Adjusting model weights to match a target benchmark",
        "Ensuring AI systems pursue goals consistent with human values and intentions",
        "Aligning training data distributions across different datasets",
        "Synchronizing multiple AI agents to work on the same task",
      ],
      correctIndex: 1,
    },
    {
      question: "What is a foundation model?",
      options: [
        "A model trained specifically for safety evaluation",
        "A small model used as the base layer in a multi-model stack",
        "A large model trained on broad data at scale and adapted to many downstream tasks",
        "A model that provides factual grounding to other models",
      ],
      correctIndex: 2,
    },
    {
      question: "What is reward hacking in AI systems?",
      options: [
        "Stealing reward signals from other agents in a multi-agent environment",
        "Exploiting a proxy reward measure to score high without achieving the intended goal",
        "Modifying the reward function during training to improve performance",
        "Using reward shaping to speed up reinforcement learning",
      ],
      correctIndex: 1,
    },
    {
      question: "What does model interpretability refer to?",
      options: [
        "How quickly a model responds to queries in production",
        "The degree to which a human can understand why the model made a specific prediction",
        "Whether a model can explain its outputs in multiple languages",
        "The accuracy of a model on held-out test data",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the role of a system prompt in production AI architecture?",
      options: [
        "It provides the user's message to the model",
        "It stores the model's conversation history",
        "It defines the assistant's persona, capabilities, and constraints before the user message",
        "It controls the maximum number of tokens in a response",
      ],
      correctIndex: 2,
    },
    {
      question: "What is the key difference between AI safety and AI security?",
      options: [
        "Safety applies to research; security applies to production deployments",
        "Safety addresses misalignment from within the AI; security addresses external attacks",
        "They are the same field with different naming conventions",
        "Safety is about preventing job displacement; security is about data privacy",
      ],
      correctIndex: 1,
    },
    {
      question: "What is responsible AI?",
      options: [
        "AI that only runs on certified hardware",
        "AI that refuses to answer sensitive questions",
        "Practices for developing AI that is fair, transparent, accountable, and safe",
        "AI that notifies users before collecting any data",
      ],
      correctIndex: 2,
    },
    {
      question: "What factors primarily determine latency in an AI system?",
      options: [
        "The color scheme of the UI and the geographic location of the user",
        "Model size, hardware, prompt length, and output length",
        "The number of users simultaneously accessing the API",
        "The programming language used to call the API",
      ],
      correctIndex: 1,
    },
  ],
}
