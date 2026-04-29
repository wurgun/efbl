const fs = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");

const INDEX_PATH = path.join(process.cwd(), "data", "efbl-index.json");
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const MAX_CONTEXT_CHUNKS = 5;

let cachedIndex;

function loadIndex() {
  if (!cachedIndex) {
    cachedIndex = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  }
  return cachedIndex;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function lexicalScore(query, text) {
  const terms = query
    .toLocaleLowerCase("tr")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 2);
  const haystack = text.toLocaleLowerCase("tr");

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

async function retrieveContext(client, question, index) {
  const hasEmbeddings = index.chunks.some((chunk) => Array.isArray(chunk.embedding));

  if (hasEmbeddings) {
    const queryEmbedding = await client.embeddings.create({
      model: index.embeddingModel || EMBEDDING_MODEL,
      input: question
    });
    const vector = queryEmbedding.data[0].embedding;

    return index.chunks
      .filter((chunk) => Array.isArray(chunk.embedding))
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(vector, chunk.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_CONTEXT_CHUNKS);
  }

  return index.chunks
    .map((chunk) => ({
      ...chunk,
      score: lexicalScore(question, chunk.text)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_CHUNKS);
}

function buildContext(chunks) {
  return chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.title}\nSayfa: ${chunk.page}\n${chunk.text}`
    )
    .join("\n\n");
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Sadece POST istekleri desteklenir." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: "OPENAI_API_KEY ortam degiskeni tanimli degil." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    body = JSON.parse(body);
  }

  const question = String(body?.question || "").trim();
  if (question.length < 3) {
    res.status(400).json({ error: "Lutfen daha acik bir soru yazin." });
    return;
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const index = loadIndex();
    const chunks = await retrieveContext(client, question, index);
    const context = buildContext(chunks);

    const response = await client.responses.create({
      model: CHAT_MODEL,
      input: [
        {
          role: "developer",
          content:
            "Sen TLE Software'in eFBL entegrasyonlu TMS mikro sitesindeki bilgilendirme asistanisin. Yalnizca verilen FIATA eFBL rehberi baglamina dayanarak Turkce cevap ver. Baglamda yanit yoksa bunu acikca soyle. Hukuki danismanlik verme; bilgilendirme amacli oldugunu belirt. Kullanici TMS, entegrasyon, demo veya uygulama sorarsa TLE Software ile kesif gorusmesi planlamasini oner, ama PDF'te olmayan teknik/sertifikasyon iddialari uydurma. Kisa, net ve uygulanabilir cevaplar ver."
        },
        {
          role: "user",
          content: `Soru: ${question}\n\nPDF baglami:\n${context}`
        }
      ],
      temperature: 0.2
    });

    res.status(200).json({
      answer: response.output_text,
      citations: chunks.map((chunk) => ({
        id: chunk.id,
        page: chunk.page,
        title: chunk.title,
        score: Number(chunk.score || 0).toFixed(3)
      })),
      source: index.source
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "Asistan su anda yanit uretirken bir sorun yasadi. Indeks ve API ayarlarini kontrol edin."
    });
  }
};
