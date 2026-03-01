import { getProviderConfig, DEFAULT_OPENROUTER_MODEL } from "./ai-provider";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(messages: { role: string; content: string }[], jsonMode = false) {
  const config = getProviderConfig();
  if (!config || config.provider !== 'openrouter') {
    throw new Error("OpenRouter non configur\u00e9");
  }

  const body: any = {
    model: config.model || DEFAULT_OPENROUTER_MODEL,
    messages,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "G\u00e9n\u00e9rateur de Contes \u00c9ducatifs",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `Erreur OpenRouter: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function generateStructuredStoryOpenRouter(params: {
  tomeNumber: string;
  title: string;
  universe: string;
  theme: string;
  threatenedElement: string;
  focusCharacter: string;
  educationalValue: string;
  secret: string;
  guestName: string;
  guestStyle: string;
  ageRange: string;
  recurrentCharacters: any[];
}) {
  const charactersList = params.recurrentCharacters.map(c =>
    `- ${c.name} (${c.archetype}, ${c.signature}, langue: ${c.language}) : ${c.description}`
  ).join('\n');

  const prompt = `Tu es un auteur de litt\u00e9rature jeunesse africaine sp\u00e9cialis\u00e9 dans les
contes \u00e9ducatifs pour enfants. Tu travailles sur la s\u00e9rie
"Les Gardiens de Nkont\u00e9" qui se d\u00e9roule au Cameroun dans le village fictif
de Nkont\u00e9.

Les personnages r\u00e9currents de la s\u00e9rie (qui DOIVENT TOUS appara\u00eetre et jouer un r\u00f4le) sont :
${charactersList}

Le personnage invit\u00e9 de ce tome :
- ${params.guestName} (Description : ${params.guestStyle})

OBJECTIF : \u00c9cris le Tome ${params.tomeNumber} de la s\u00e9rie. L'id\u00e9e de d\u00e9part ou le th\u00e8me est "${params.title}". Tu dois G\u00c9N\u00c9RER UN TITRE FINAL ACCROCHEUR qui s'adapte parfaitement au contenu de l'histoire que tu vas cr\u00e9er. Il s'agit d'un LIVRE COMPLET.

TRANCHE D'\u00c2GE CIBLE : ${params.ageRange} (Adapte le vocabulaire, la complexit\u00e9 des phrases et la profondeur des th\u00e8mes \u00e0 cet \u00e2ge)
UNIVERS / LIEU DE L'ACTION : ${params.universe}
TH\u00c8ME CENTRAL : ${params.theme}
\u00c9L\u00c9MENT NATUREL MENAC\u00c9 : ${params.threatenedElement}
COMP\u00c9TENCE MISE EN AVANT : ${params.focusCharacter}
VALEUR \u00c9DUCATIVE PRINCIPALE : ${params.educationalValue}
SECRET PHILOSOPHIQUE FINAL : "${params.secret}"

CONTRAINTES DE STYLE :
- L'histoire doit \u00eatre une s\u00e9quence continue du d\u00e9but \u00e0 la fin, SANS mentionner le mot "Chapitre" ni "Tome".
- Assure-toi surtout que l'histoire suit un fil conducteur clair et une logique coh\u00e9rente de la premi\u00e8re \u00e0 la derni\u00e8re ligne.
- R\u00e9dige un r\u00e9cit authentique, naturel et de haute qualit\u00e9.
- Int\u00e8gre les traits et signatures des personnages de mani\u00e8re tr\u00e8s subtile et fluide, sans forcer le trait ni faire de focus excessif dessus.
- Phrases courtes, langage accessible pour la tranche d'\u00e2ge ${params.ageRange}.
- Mots en langues africaines avec traduction entre parenth\u00e8ses.
- Longueur : Le plus long et d\u00e9taill\u00e9 possible pour faire un vrai petit livre (environ 300 \u00e0 400 mots par s\u00e9quence).

R\u00c9PONDS UNIQUEMENT EN JSON STRICT avec cette structure exacte (pas de texte avant ni apr\u00e8s) :
{
  "title": "Titre accrocheur du tome",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Titre de la s\u00e9quence",
      "content": "Texte de la s\u00e9quence...",
      "imagePrompt": "Description visuelle d\u00e9taill\u00e9e pour illustration"
    }
  ],
  "lexicon": [
    { "word": "mot africain", "translation": "traduction" }
  ]
}

Divise l'histoire en 5 s\u00e9quences. Pour chaque s\u00e9quence, fournis une description visuelle d\u00e9taill\u00e9e (imagePrompt) d\u00e9crivant l'action, le d\u00e9cor africain, et les personnages pr\u00e9sents.`;

  const messages = [
    { role: "system", content: "Tu es un auteur de litt\u00e9rature jeunesse africaine. R\u00e9ponds uniquement en JSON valide." },
    { role: "user", content: prompt }
  ];

  const text = await callOpenRouter(messages, true);

  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("R\u00e9ponse JSON invalide du mod\u00e8le");
  }
}

export async function generateCharacterProfileOpenRouter(promptText: string) {
  const prompt = `Cr\u00e9e un nouveau personnage r\u00e9current pour la s\u00e9rie de livres pour enfants "Les Gardiens de Nkont\u00e9" (Cameroun).
Le personnage doit s'int\u00e9grer au groupe d'enfants existant.
Voici les directives de l'utilisateur : ${promptText}

R\u00c9PONDS UNIQUEMENT EN JSON STRICT avec cette structure exacte :
{
  "name": "pr\u00e9nom",
  "origin": "r\u00e9gion ou pays d'origine",
  "language": "langue parl\u00e9e",
  "archetype": "r\u00f4le dans le groupe",
  "signature": "particularit\u00e9 visuelle ou comportementale",
  "description": "2 phrases sur sa personnalit\u00e9 et son utilit\u00e9 dans le groupe",
  "imagePrompt": "description visuelle d\u00e9taill\u00e9e pour g\u00e9n\u00e9rer son image en style dessin anim\u00e9 2D africain"
}`;

  const messages = [
    { role: "system", content: "Tu cr\u00e9es des personnages pour une s\u00e9rie de livres pour enfants africains. R\u00e9ponds uniquement en JSON valide." },
    { role: "user", content: prompt }
  ];

  const text = await callOpenRouter(messages, true);

  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("R\u00e9ponse JSON invalide du mod\u00e8le");
  }
}

export async function validateOpenRouterKey(apiKey: string, model?: string): Promise<boolean> {
  try {
    const response = await fetch(OPENROUTER_BASE, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: model || DEFAULT_OPENROUTER_MODEL,
        messages: [{ role: "user", content: "Dis bonjour en un mot." }],
        max_tokens: 10,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
