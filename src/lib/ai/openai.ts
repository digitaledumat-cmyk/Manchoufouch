import {
  fetchPageContext,
  formatPageContextForPrompt,
} from "@/lib/ai/fetch-page-context";
import {
  ARTICLE_MODELS,
  getArticleModelLabel,
  type ArticleModelId,
  type GeneratedArticle,
} from "@/lib/ai/simulate-article";
import { stripMarkdownHashes } from "@/lib/ai/strip-markdown-hashes";

export type AiProvider = "gemini" | "openai" | "simulation";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export function hasGeminiKey() {
  return Boolean(
    process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
  );
}

export function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** Priorité : Gemini (gratuit) > OpenAI > simulation */
export function resolveAiProvider(): AiProvider {
  if (hasGeminiKey()) return "gemini";
  if (hasOpenAiKey()) return "openai";
  return "simulation";
}

function getGeminiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    ""
  );
}

/** Ordre : modèle configuré, puis lite (quota gratuit plus fiable), puis flash. */
function getGeminiModelCandidates() {
  const preferred = process.env.GEMINI_MODEL?.trim() || "gemini-flash-lite-latest";
  const fallbacks = [
    preferred,
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-2.0-flash-lite",
  ];
  return [...new Set(fallbacks.filter(Boolean))];
}

function extractGeminiText(data: {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
}) {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function parseGeminiJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("Réponse Gemini JSON invalide.");
  }
}

async function chatWithGeminiModel(model: string, messages: ChatMessage[]) {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY manquante.");
  }

  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const user = messages.find((m) => m.role === "user")?.content ?? "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${system}\n\n${user}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
      },
    }),
  });

  const detail = await response.text();
  if (!response.ok) {
    const error = new Error(
      response.status === 429
        ? `Quota Gemini (${model}) dépassé.`
        : `Erreur Gemini ${model} (${response.status}) : ${detail.slice(0, 220)}`,
    ) as Error & { status?: number; model?: string };
    error.status = response.status;
    error.model = model;
    throw error;
  }

  const data = JSON.parse(detail) as {
    candidates?: {
      content?: { parts?: { text?: string; thought?: boolean }[] };
      finishReason?: string;
    }[];
  };

  const text = extractGeminiText(data);
  if (!text) {
    throw new Error(`Réponse Gemini vide (${model}).`);
  }

  return parseGeminiJson(text);
}

async function chatWithGemini(messages: ChatMessage[]) {
  const models = getGeminiModelCandidates();
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await chatWithGeminiModel(model, messages);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const status = (error as { status?: number } | null)?.status;
      // Retry on quota / overload / temporary model unavailability
      if (status === 429 || status === 503 || status === 404) {
        continue;
      }
      throw lastError;
    }
  }

  throw new Error(
    lastError?.message?.includes("Quota")
      ? "Quota Gemini dépassé sur tous les modèles gratuits. Réessayez dans 1–2 minutes."
      : lastError?.message || "Aucun modèle Gemini disponible.",
  );
}

async function chatWithOpenAi(messages: ChatMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquante.");
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erreur OpenAI (${response.status}) : ${detail.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Réponse OpenAI vide.");

  return JSON.parse(content) as Record<string, unknown>;
}

async function chatCompletion(messages: ChatMessage[]) {
  const provider = resolveAiProvider();
  if (provider === "gemini") return chatWithGemini(messages);
  if (provider === "openai") return chatWithOpenAi(messages);
  throw new Error("Aucun fournisseur IA configuré.");
}

export async function generateArticleWithAi(input: {
  url: string;
  model: ArticleModelId;
  domainLabel?: string;
}): Promise<GeneratedArticle> {
  const modelMeta = ARTICLE_MODELS.find((item) => item.id === input.model);
  const modelLabel = getArticleModelLabel(input.model);
  const page = await fetchPageContext(input.url);

  const parsed = await chatCompletion([
    {
      role: "system",
      content: `Tu es un rédacteur SEO expert au Maroc. Tu rédiges en français.
Réponds UNIQUEMENT en JSON valide avec les clés: title (string), body (string), metaDescription (string, max 160 caractères).
RÈGLES STRICTES:
- Base-toi UNIQUEMENT sur le contenu réel du site fourni (titre, méta, titres, extrait).
- Ne invente PAS une autre activité, un autre produit ou un autre métier.
- Si le site parle d'IPTV / streaming / abonnements TV, l'article doit parler de ça — jamais de fontaines, jardinage, électroménager, etc.
- Ignore tout "domaine métier" suggéré s'il contredit le contenu réel du site.
- INTERDIT d'utiliser des dièses (# ## ###) dans le body. Titres en texte simple, sur leur propre ligne, sans #.`,
    },
    {
      role: "user",
      content: `Génère un article de type "${modelLabel}" (${modelMeta?.description ?? ""}).

Contenu réel du site à analyser:
${formatPageContextForPrompt(page)}

${input.domainLabel ? `Indice domaine (secondaire, à ignorer s'il ne correspond pas): ${input.domainLabel}` : ""}

Contraintes:
- Fidèle à l'activité réelle du site
- Contenu utile, naturel, orienté Google Maroc
- Structure claire avec titres en texte plain (SANS aucun caractère #)
- Listes avec - ou numéros autorisées
- CTA adaptés (WhatsApp / devis / abonnement) si pertinent
- metaDescription <= 160 caractères`,
    },
  ]);

  const title = stripMarkdownHashes(String(parsed.title ?? "").trim());
  const body = stripMarkdownHashes(String(parsed.body ?? "").trim());
  const metaDescription = String(parsed.metaDescription ?? "").trim();

  if (!title || !body) {
    throw new Error("L'IA n'a pas renvoyé un article complet.");
  }

  return {
    model: input.model,
    sourceUrl: page.url,
    title,
    body,
    metaDescription: metaDescription.slice(0, 160),
    generatedAt: new Date().toISOString(),
  };
}

export async function generateBriefWithAi(input: {
  domainId: string;
  domainLabel: string;
  url?: string;
}) {
  let pageBlock = "";
  if (input.url?.trim()) {
    try {
      const page = await fetchPageContext(input.url);
      pageBlock = `\nContenu réel du site:\n${formatPageContextForPrompt(page)}\nPriorité au contenu du site s'il contredit le domaine suggéré.`;
    } catch {
      pageBlock = `\nURL cible (non analysée): ${input.url}`;
    }
  }

  const parsed = await chatCompletion([
    {
      role: "system",
      content: `Tu es un expert SEO Maroc. Réponds UNIQUEMENT en JSON avec: keywords (string[]), h1 (string), h2 (string[]), h3 (string[]), metaDescription (string max 160).
Si un extrait de site est fourni, aligne le brief sur l'activité réelle du site.`,
    },
    {
      role: "user",
      content: `Crée un brief SEO pour le domaine suggéré "${input.domainLabel}" (${input.domainId}).
${pageBlock}
Inclus des mots-clés pertinents pour Google Maroc.`,
    },
  ]);

  return {
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map(String)
      : [],
    headings: {
      h1: String(parsed.h1 ?? input.domainLabel),
      h2: Array.isArray(parsed.h2) ? parsed.h2.map(String) : [],
      h3: Array.isArray(parsed.h3) ? parsed.h3.map(String) : [],
    },
    metaDescription: String(parsed.metaDescription ?? "").slice(0, 160),
    generatedAt: new Date().toISOString(),
  };
}

/** @deprecated Utiliser generateArticleWithAi */
export const generateArticleWithOpenAi = generateArticleWithAi;
/** @deprecated Utiliser generateBriefWithAi */
export const generateBriefWithOpenAi = generateBriefWithAi;
