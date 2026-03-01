export type ProviderType = 'gemini' | 'openrouter';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey: string;
  model?: string;
}

const STORAGE_KEY = 'gardiens_provider_config';

export function getProviderConfig(): ProviderConfig | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setProviderConfig(config: ProviderConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearProviderConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

export function supportsImageGeneration(): boolean {
  const config = getProviderConfig();
  return config?.provider === 'gemini';
}

export const OPENROUTER_MODELS = [
  { id: 'google/gemini-2.5-flash-preview', label: 'Gemini 2.5 Flash (Rapide)' },
  { id: 'google/gemini-2.5-pro-preview-03-25', label: 'Gemini 2.5 Pro (Qualit\u00e9)' },
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Economique)' },
  { id: 'meta-llama/llama-4-maverick', label: 'Llama 4 Maverick' },
];

export const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.5-flash-preview';
