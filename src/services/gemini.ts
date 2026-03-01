import { GoogleGenAI, Type } from "@google/genai";
import { getProviderConfig } from "./ai-provider";

function getAiInstance() {
  const config = getProviderConfig();
  const apiKey = config?.apiKey || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({ apiKey });
}

export async function generateStructuredStory(params: {
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

G\u00e9n\u00e8re le livre au format JSON strict. Divise l'histoire en 5 s\u00e9quences logiques (utilise le tableau "chapters" dans le JSON pour ces s\u00e9quences, mais n'utilise pas le mot "chapitre" dans le texte). Pour chaque s\u00e9quence, fournis une description visuelle d\u00e9taill\u00e9e (imagePrompt) qui servira \u00e0 g\u00e9n\u00e9rer une illustration. L'imagePrompt doit d\u00e9crire l'action, le d\u00e9cor africain, et pr\u00e9ciser quels personnages sont pr\u00e9sents, SANS mentionner de num\u00e9ro de chapitre ou de tome et SANS demander de texte sur l'image.`;

  const response = await getAiInstance().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chapterNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["chapterNumber", "title", "content", "imagePrompt"]
            }
          },
          lexicon: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                translation: { type: Type.STRING }
              },
              required: ["word", "translation"]
            }
          }
        },
        required: ["title", "chapters", "lexicon"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateCharacterProfile(promptText: string) {
  const prompt = `Cr\u00e9e un nouveau personnage r\u00e9current pour la s\u00e9rie de livres pour enfants "Les Gardiens de Nkont\u00e9" (Cameroun).
Le personnage doit s'int\u00e9grer au groupe d'enfants existant.
Voici les directives de l'utilisateur : ${promptText}

G\u00e9n\u00e8re un profil au format JSON avec les propri\u00e9t\u00e9s suivantes :
- name (pr\u00e9nom)
- origin (r\u00e9gion ou pays d'origine)
- language (langue parl\u00e9e, ex: Bamil\u00e9k\u00e9, Beti, etc.)
- archetype (son r\u00f4le dans le groupe, ex: "Le Bricoleur")
- signature (sa particularit\u00e9 visuelle ou comportementale)
- description (2 phrases sur sa personnalit\u00e9 et son utilit\u00e9 dans le groupe)
- imagePrompt (une description visuelle d\u00e9taill\u00e9e pour g\u00e9n\u00e9rer son image en style dessin anim\u00e9 2D africain)`;

  const response = await getAiInstance().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          origin: { type: Type.STRING },
          language: { type: Type.STRING },
          archetype: { type: Type.STRING },
          signature: { type: Type.STRING },
          description: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ["name", "origin", "language", "archetype", "signature", "description", "imagePrompt"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateCharacterImage(
  guestName: string,
  guestStyle: string,
  base64Image?: string,
  mimeType?: string
) {
  const prompt = `Illustration pour un livre d'enfants africain (6-12 ans). Un personnage nomm\u00e9 ${guestName}. Description et style : ${guestStyle}. Le style artistique doit \u00eatre 2D, color\u00e9, chaleureux, dessin\u00e9 \u00e0 la main, dans l'esprit d'un conte africain. Fond simple blanc.`;

  const parts: any[] = [];
  if (base64Image && mimeType) {
    const base64Data = base64Image.split(',')[1];
    parts.push({ text: "Utilise cette image comme r\u00e9f\u00e9rence stricte pour le personnage (garde les m\u00eames traits, v\u00eatements et style) : " + prompt });
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
  } else {
    parts.push({ text: prompt });
  }

  const response = await getAiInstance().models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Aucune image g\u00e9n\u00e9r\u00e9e");
}

export async function generateChapterImage(
  promptText: string,
  referenceImages: { data: string; mimeType: string }[]
) {
  const parts: any[] = [{ text: `G\u00e9n\u00e8re une illustration en utilisant STRICTEMENT les personnages fournis en images de r\u00e9f\u00e9rence. Ils doivent garder EXACTEMENT le m\u00eame style, les m\u00eames visages, les m\u00eames v\u00eatements et les m\u00eames couleurs. Voici la sc\u00e8ne \u00e0 illustrer : ${promptText}` }];

  for (const ref of referenceImages) {
    parts.push({
      inlineData: {
        data: ref.data,
        mimeType: ref.mimeType
      }
    });
  }

  const response = await getAiInstance().models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Aucune image g\u00e9n\u00e9r\u00e9e");
}
