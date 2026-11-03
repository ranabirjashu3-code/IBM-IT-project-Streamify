export const cosineSimilarity = (a, b) => {
  if (a.length !== b.length) {
    throw new Error("Embedding dimensions do not match");
  }

  let dotProduct = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
  }

  return dotProduct;
};