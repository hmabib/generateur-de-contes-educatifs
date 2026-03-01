import { getProviderConfig, DEFAULT_OPENROUTER_MODEL } from "./ai-provider";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(messages: { role: string; content: string }[], jsonMode = false) {
  const config = getProviderConfig();
  if (!config || config.provider !== 'openrouter') {
    throw new Error("OpenRouter non configuré");
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
      "X-Title": "Les Gardiens de la Terre",
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
  chapterCount?: number;
  writingStyle?: string;
  country?: string;
  includeLexicon?: boolean;
  lexiconLanguage?: string;
  lexiconWordCount?: number;
}) {
  const charactersList = params.recurrentCharacters.map(c =>
    `- ${c.name} (${c.archetype}, ${c.signature}, langue: ${c.language}) : ${c.description}`
  ).join('\n');

  const chapterCount = params.chapterCount || 5;
  const country = params.country || 'Cameroun';
  const writingStyle = params.writingStyle || 'Narratif classique';
  const includeLexicon = params.includeLexicon !== false;

  let styleInstruction = '';
  switch (writingStyle) {
    case 'Poétique':
      styleInstruction = 'Utilise un style poétique et lyrique, avec des métaphores, des rimes occasionnelles et un rythme musical dans les phrases.';
      break;
    case 'Dialogue riche':
      styleInstruction = 'Privilégie les dialogues entre personnages. Au moins 50% du texte doit être des échanges parlés vivants et expressifs.';
      break;
    default:
      styleInstruction = 'Utilise un style narratif classique, fluide et immersif, adapté aux enfants.';
  }

  let lexiconInstruction = '';
  let lexiconJsonInstruction = '';
  if (includeLexicon) {
    const lang = params.lexiconLanguage ? `en ${params.lexiconLanguage}` : 'dans les langues africaines locales du contexte';
    const count = params.lexiconWordCount || 8;
    lexiconInstruction = `\nIntègre naturellement des mots ${lang} dans le texte avec traduction entre parenthèses.`;
    lexiconJsonInstruction = `,
  "lexicon": [
    { "word": "mot africain", "translation": "traduction" }
  ]

Fournis un lexique de ${count} à ${count + 4} mots ${lang} utilisés dans l'histoire.`;
  }

  const prompt = `Tu es un auteur de littérature jeunesse africaine spécialisé dans les contes éducatifs pour enfants. Tu travailles sur la série "Les Gardiens de la Terre" qui se déroule en ${country}.

Les personnages récurrents de la série (qui DOIVENT TOUS apparaître et jouer un rôle) sont :
${charactersList}

Le personnage invité de ce tome :
- ${params.guestName} (Description : ${params.guestStyle})

OBJECTIF : Écris le Tome ${params.tomeNumber} de la série. L'idée de départ ou le thème est "${params.title}". Tu dois GÉNÉRER UN TITRE FINAL ACCROCHEUR qui s'adapte parfaitement au contenu de l'histoire que tu vas créer. Il s'agit d'un LIVRE COMPLET.

TRANCHE D'ÂGE CIBLE : ${params.ageRange}
UNIVERS / LIEU DE L'ACTION : ${params.universe}
THÈME CENTRAL : ${params.theme}
ÉLÉMENT NATUREL MENACÉ : ${params.threatenedElement}
COMPÉTENCE MISE EN AVANT : ${params.focusCharacter}
VALEUR ÉDUCATIVE PRINCIPALE : ${params.educationalValue}
SECRET PHILOSOPHIQUE FINAL : "${params.secret}"
PAYS / CONTEXTE CULTUREL : ${country}

STYLE D'ÉCRITURE : ${styleInstruction}

CONTRAINTES DE STYLE :
- L'histoire doit être une séquence continue du début à la fin, SANS mentionner le mot "Chapitre" ni "Tome".
- Rédige un récit authentique, naturel et de haute qualité.
- Intègre les traits et signatures des personnages de manière très subtile et fluide.
- Phrases courtes, langage accessible pour la tranche d'âge ${params.ageRange}.${lexiconInstruction}
- Longueur : Chaque séquence doit être LONGUE et DÉTAILLÉE, environ 500 à 700 mots par séquence minimum, avec des descriptions riches, des dialogues, et des détails sensoriels. C'est un vrai livre pour enfants.

RÉPONDS UNIQUEMENT EN JSON STRICT avec cette structure exacte :
{
  "title": "Titre accrocheur du tome",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Titre de la séquence",
      "content": "Texte de la séquence...",
      "imagePrompt": "Description visuelle détaillée pour illustration"
    }
  ]${lexiconJsonInstruction}
}

Divise l'histoire en ${chapterCount} séquences.`;

  const messages = [
    { role: "system", content: "Tu es un auteur de littérature jeunesse africaine. Réponds uniquement en JSON valide." },
    { role: "user", content: prompt }
  ];

  const text = await callOpenRouter(messages, true);

  try {
    const result = JSON.parse(text);
    if (!result.lexicon) result.lexicon = [];
    return result;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (!result.lexicon) result.lexicon = [];
      return result;
    }
    throw new Error("Réponse JSON invalide du modèle");
  }
}

export async function generateCharacterProfileOpenRouter(promptText: string) {
  const prompt = `Crée un nouveau personnage récurrent pour la série de livres pour enfants "Les Gardiens de la Terre" (Afrique).
Le personnage doit s'intégrer au groupe d'enfants existant.
Voici les directives de l'utilisateur : ${promptText}

RÉPONDS UNIQUEMENT EN JSON STRICT avec cette structure exacte :
{
  "name": "prénom",
  "origin": "région ou pays d'origine",
  "language": "langue parlée",
  "archetype": "rôle dans le groupe",
  "signature": "particularité visuelle ou comportementale",
  "description": "2 phrases sur sa personnalité et son utilité dans le groupe",
  "imagePrompt": "description visuelle détaillée pour générer son image en style dessin animé 2D africain"
}`;

  const messages = [
    { role: "system", content: "Tu crées des personnages pour une série de livres pour enfants africains. Réponds uniquement en JSON valide." },
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
    throw new Error("Réponse JSON invalide du modèle");
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
