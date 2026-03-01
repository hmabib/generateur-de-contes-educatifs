import { getProviderConfig, supportsImageGeneration } from "./ai-provider";
import {
  generateStructuredStory as geminiStructuredStory,
  generateCharacterProfile as geminiCharacterProfile,
  generateCharacterImage as geminiCharacterImage,
  generateChapterImage as geminiChapterImage,
} from "./gemini";
import {
  generateStructuredStoryOpenRouter,
  generateCharacterProfileOpenRouter,
} from "./openrouter";

export interface StoryGenerationParams {
  tomeNumber: string;
  tomeTheme?: string;
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
}

export async function generateStructuredStory(params: StoryGenerationParams) {
  const config = getProviderConfig();
  if (config?.provider === 'openrouter') {
    return generateStructuredStoryOpenRouter(params);
  }
  return geminiStructuredStory(params);
}

export async function generateCharacterProfile(promptText: string) {
  const config = getProviderConfig();
  if (config?.provider === 'openrouter') {
    return generateCharacterProfileOpenRouter(promptText);
  }
  return geminiCharacterProfile(promptText);
}

export async function generateCharacterImage(
  guestName: string,
  guestStyle: string,
  base64Image?: string,
  mimeType?: string
) {
  if (!supportsImageGeneration()) {
    throw new Error("IMAGE_NOT_SUPPORTED");
  }
  return geminiCharacterImage(guestName, guestStyle, base64Image, mimeType);
}

export async function generateChapterImage(
  promptText: string,
  referenceImages: { data: string; mimeType: string }[]
) {
  if (!supportsImageGeneration()) {
    throw new Error("IMAGE_NOT_SUPPORTED");
  }
  return geminiChapterImage(promptText, referenceImages);
}

export { supportsImageGeneration } from "./ai-provider";
