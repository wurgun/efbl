import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pdf from "pdf-parse";
import OpenAI from "openai";

const PDF_URL =
  "https://fiata.cdn.prismic.io/fiata/acu4XJGXnQHGZIQ0_eFBLguide_final.pdf";
const LOCAL_PDF =
  "C:\\Users\\TLE\\Downloads\\Practical Guide to the electronic FIATA Multimodal Bill of Lading (eFBL).pdf";
const OUT_FILE = path.join(process.cwd(), "data", "efbl-index.json");

const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

async function readPdfBuffer() {
  try {
    return await fs.readFile(LOCAL_PDF);
  } catch {
    const response = await fetch(PDF_URL);
    if (!response.ok) {
      throw new Error(`PDF indirilemedi: ${response.status} ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
}

function normalizeText(text) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkPage(pageText, pageNumber) {
  const words = normalizeText(pageText).split(/\s+/).filter(Boolean);
  const chunks = [];
  const size = 180;
  const overlap = 35;

  for (let start = 0; start < words.length; start += size - overlap) {
    const text = words.slice(start, start + size).join(" ");
    if (text.length > 220) {
      chunks.push({
        id: `p${pageNumber}-c${chunks.length + 1}`,
        page: pageNumber,
        title: `FIATA eFBL Practical Guide, page ${pageNumber}`,
        text
      });
    }
  }

  return chunks;
}

async function extractPages(buffer) {
  const pages = [];

  await pdf(buffer, {
    pagerender: async (pageData) => {
      const content = await pageData.getTextContent();
      const text = content.items.map((item) => item.str).join(" ");
      pages.push(text);
      return text;
    }
  });

  return pages;
}

async function embedChunks(chunks) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY yok; indeks embedding olmadan yaziliyor.");
    return chunks;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embedded = [];

  try {
    for (let i = 0; i < chunks.length; i += 50) {
      const batch = chunks.slice(i, i + 50);
      const response = await client.embeddings.create({
        model: embeddingModel,
        input: batch.map((chunk) => chunk.text)
      });

      response.data.forEach((item, index) => {
        embedded.push({
          ...batch[index],
          embedding: item.embedding
        });
      });

      console.log(`${Math.min(i + 50, chunks.length)}/${chunks.length} parca indekslendi`);
    }

    return embedded;
  } catch (error) {
    console.warn(
      `Embedding uretilemedi (${error.status || "unknown"}). Indeks metin aramasi icin embedding olmadan yaziliyor.`
    );
    return chunks;
  }
}

const buffer = await readPdfBuffer();
const pages = await extractPages(buffer);
const chunks = pages.flatMap((pageText, index) => chunkPage(pageText, index + 1));
const indexedChunks = await embedChunks(chunks);

await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
await fs.writeFile(
  OUT_FILE,
  JSON.stringify(
    {
      source: {
        title: "Practical Guide to the electronic FIATA Multimodal Bill of Lading (eFBL)",
        url: PDF_URL
      },
      embeddingModel,
      generatedAt: new Date().toISOString(),
      chunks: indexedChunks
    },
    null,
    2
  )
);

console.log(`${indexedChunks.length} parca ${OUT_FILE} dosyasina yazildi.`);
