import "dotenv/config";

import {
  generateEmbedding,
} from "./services/embeddingService.js";

const test = async () => {
  const text = "A scientist travels through dreams";

  const embedding = await generateEmbedding(text);

  console.log("Embedding length:", embedding.length);

  console.log("First 5 values:", embedding.slice(0, 5));
};

test();