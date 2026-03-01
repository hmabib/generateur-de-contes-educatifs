import { GoogleGenAI, Type } from "@google/genai";
import { getProviderConfig } from "./ai-provider";

function getAiInstance() {
  const config = getProviderConfig();
  const apiKey = config?.apiKey;
  if (!apiKey) {
    throw new Error("Clé API Gemini non configurée. Cliquez sur l'icône de configuration dans le menu pour ajouter votre clé.");
  }
  return new GoogleGenAI({ apiKey });
}

// Modèles Gemini
const TEXT_MODEL = "gemini-3.1-pro-preview";
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

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
  if (includeLexicon) {
    const lang = params.lexiconLanguage ? `en ${params.lexiconLanguage}` : 'dans les langues africaines locales du contexte';
    const count = params.lexiconWordCount || 8;
    lexiconInstruction = `\nIntègre naturellement des mots ${lang} dans le texte avec traduction entre parenthèses. Fournis un lexique de ${count} à ${count + 4} mots ${lang} utilisés dans l'histoire.`;
  }

  const prompt = `Tu es un auteur de littérature jeunesse africaine spécialisé dans les contes éducatifs pour enfants. Tu travailles sur la série "Les Gardiens de la Terre" qui se déroule en ${country}.

Les personnages récurrents de la série (qui DOIVENT TOUS apparaître et jouer un rôle) sont :
${charactersList}

Le personnage invité de ce tome :
- ${params.guestName} (Description : ${params.guestStyle})

OBJECTIF : Écris le Tome ${params.tomeNumber} de la série. L'idée de départ ou le thème est "${params.title}". Tu dois GÉNÉRER UN TITRE FINAL ACCROCHEUR qui s'adapte parfaitement au contenu de l'histoire que tu vas créer. Il s'agit d'un LIVRE COMPLET.

TRANCHE D'ÂGE CIBLE : ${params.ageRange} (Adapte le vocabulaire, la complexité des phrases et la profondeur des thèmes à cet âge)
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
- Assure-toi surtout que l'histoire suit un fil conducteur clair et une logique cohérente de la première à la dernière ligne.
- Rédige un récit authentique, naturel et de haute qualité.
- Intègre les traits et signatures des personnages de manière très subtile et fluide, sans forcer le trait ni faire de focus excessif dessus.
- Phrases courtes, langage accessible pour la tranche d'âge ${params.ageRange}.${lexiconInstruction}
- Longueur : Le plus long et détaillé possible pour faire un vrai petit livre (environ 300 à 400 mots par séquence).

Génère le livre au format JSON strict. Divise l'histoire en ${chapterCount} séquences logiques (utilise le tableau "chapters" dans le JSON pour ces séquences, mais n'utilise pas le mot "chapitre" dans le texte). Pour chaque séquence, fournis une description visuelle détaillée (imagePrompt) qui servira à générer une illustration. L'imagePrompt doit décrire l'action, le décor africain, et préciser quels personnages sont présents, SANS mentionner de numéro de chapitre ou de tome et SANS demander de texte sur l'image.`;

  const schemaProperties: any = {
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
  };

  const requiredFields = ["title", "chapters"];

  if (includeLexicon) {
    schemaProperties.lexicon = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          translation: { type: Type.STRING }
        },
        required: ["word", "translation"]
      }
    };
    requiredFields.push("lexicon");
  }

  const response = await getAiInstance().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: schemaProperties,
        required: requiredFields
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  if (!result.lexicon) {
    result.lexicon = [];
  }
  return result;
}

export async function generateCharacterProfile(promptText: string) {
  const prompt = `Crée un nouveau personnage récurrent pour la série de livres pour enfants "Les Gardiens de la Terre" (Afrique).
Le personnage doit s'intégrer au groupe d'enfants existant.
Voici les directives de l'utilisateur : ${promptText}

Génère un profil au format JSON avec les propriétés suivantes :
- name (prénom)
- origin (région ou pays d'origine)
- language (langue parlée, ex: Bamiléké, Beti, Wolof, etc.)
- archetype (son rôle dans le groupe, ex: "Le Bricoleur")
- signature (sa particularité visuelle ou comportementale)
- description (2 phrases sur sa personnalité et son utilité dans le groupe)
- imagePrompt (une description visuelle détaillée pour générer son image en style dessin animé 2D africain)`;

  const response = await getAiInstance().models.generateContent({
    model: TEXT_MODEL,
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
  const prompt = `Illustration pour un livre d'enfants africain (6-12 ans). Un personnage nommé ${guestName}. Description et style : ${guestStyle}. Le style artistique doit être 2D, coloré, chaleureux, dessiné à la main, dans l'esprit d'un conte africain. Fond simple blanc.`;

  const parts: any[] = [];
  if (base64Image && mimeType) {
    const base64Data = base64Image.split(',')[1];
    parts.push({ text: "Utilise cette image comme référence stricte pour le personnage (garde les mêmes traits, vêtements et style) : " + prompt });
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
    model: IMAGE_MODEL,
    contents: { parts },
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '1:1',
      },
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Aucune image générée");
}

export async function generateChapterImage(
  promptText: string,
  referenceImages: { data: string; mimeType: string }[]
) {
  const parts: any[] = [{ text: `Génère une illustration en utilisant STRICTEMENT les personnages fournis en images de référence. Ils doivent garder EXACTEMENT le même style, les mêmes visages, les mêmes vêtements et les mêmes couleurs. Voici la scène à illustrer : ${promptText}` }];

  for (const ref of referenceImages) {
    parts.push({
      inlineData: {
        data: ref.data,
        mimeType: ref.mimeType
      }
    });
  }

  const response = await getAiInstance().models.generateContent({
    model: IMAGE_MODEL,
    contents: { parts },
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '1:1',
      },
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Aucune image générée");
}
