export interface DictionaryEntry {
  id: number;
  word: string;
  translation: string;
  language: string;
  category?: string;
}

export interface DictionaryLanguage {
  id: string;
  name: string;
  region: string;
  country: string;
}

export const defaultLanguages: DictionaryLanguage[] = [
  { id: 'ewondo', name: 'Ewondo', region: 'Centre', country: 'Cameroun' },
  { id: 'duala', name: 'Duala', region: 'Littoral', country: 'Cameroun' },
  { id: 'fufulde', name: 'Fufulde', region: 'Nord', country: 'Cameroun' },
  { id: 'fefe', name: 'Fèfè', region: 'Ouest', country: 'Cameroun' },
  { id: 'bassa', name: 'Bassa', region: 'Sud', country: 'Cameroun' },
  { id: 'sango', name: 'Sango', region: 'Est / RCA', country: 'Centrafrique' },
  { id: 'wolof', name: 'Wolof', region: 'Dakar', country: 'Sénégal' },
  { id: 'bambara', name: 'Bambara', region: 'Bamako', country: 'Mali' },
  { id: 'yoruba', name: 'Yoruba', region: 'Ouest', country: 'Nigeria' },
  { id: 'swahili', name: 'Swahili', region: 'Est', country: 'Kenya / Tanzanie' },
  { id: 'lingala', name: 'Lingala', region: 'Kinshasa', country: 'RDC' },
  { id: 'fon', name: 'Fon', region: 'Sud', country: 'Bénin' },
];

export const defaultDictionary: DictionaryEntry[] = [
  { id: 1, word: 'Mbolo', translation: 'Bonjour', language: 'ewondo', category: 'salutation' },
  { id: 2, word: 'Akiba', translation: 'Merci', language: 'ewondo', category: 'politesse' },
  { id: 3, word: 'Nnam', translation: 'Forêt', language: 'ewondo', category: 'nature' },
  { id: 4, word: 'Ndip', translation: 'Eau / Rivière', language: 'duala', category: 'nature' },
  { id: 5, word: 'Mboa', translation: 'Pays / Village', language: 'duala', category: 'lieu' },
  { id: 6, word: 'Wouri', translation: 'Rivière', language: 'duala', category: 'nature' },
  { id: 7, word: 'Pulaaku', translation: 'Code d\'honneur peul', language: 'fufulde', category: 'culture' },
  { id: 8, word: 'Ngaoundéré', translation: 'Montagne du nombril', language: 'fufulde', category: 'lieu' },
  { id: 9, word: 'Nkùh', translation: 'Solidarité', language: 'fefe', category: 'valeur' },
  { id: 10, word: 'Njanga', translation: 'Crevette', language: 'bassa', category: 'animal' },
  { id: 11, word: 'Bolo', translation: 'Force', language: 'sango', category: 'valeur' },
  { id: 12, word: 'Teranga', translation: 'Hospitalité', language: 'wolof', category: 'valeur' },
  { id: 13, word: 'Jaam', translation: 'Paix', language: 'wolof', category: 'valeur' },
  { id: 14, word: 'Dugu', translation: 'Village', language: 'bambara', category: 'lieu' },
  { id: 15, word: 'Badenya', translation: 'Fraternité maternelle', language: 'bambara', category: 'valeur' },
  { id: 16, word: 'Omo', translation: 'Enfant', language: 'yoruba', category: 'famille' },
  { id: 17, word: 'Ashe', translation: 'Énergie de vie', language: 'yoruba', category: 'spirituel' },
  { id: 18, word: 'Jambo', translation: 'Bonjour', language: 'swahili', category: 'salutation' },
  { id: 19, word: 'Harambee', translation: 'Travaillons ensemble', language: 'swahili', category: 'valeur' },
  { id: 20, word: 'Moto', translation: 'Personne', language: 'lingala', category: 'famille' },
];

const DICTIONARY_KEY = 'gardiens_dictionary';
const LANGUAGES_KEY = 'gardiens_languages';

export const getDictionary = (): DictionaryEntry[] => {
  const stored = localStorage.getItem(DICTIONARY_KEY);
  if (stored) return JSON.parse(stored);
  return defaultDictionary;
};

export const saveDictionary = (entries: DictionaryEntry[]) => {
  localStorage.setItem(DICTIONARY_KEY, JSON.stringify(entries));
};

export const getLanguages = (): DictionaryLanguage[] => {
  const stored = localStorage.getItem(LANGUAGES_KEY);
  if (stored) return JSON.parse(stored);
  return defaultLanguages;
};

export const saveLanguages = (langs: DictionaryLanguage[]) => {
  localStorage.setItem(LANGUAGES_KEY, JSON.stringify(langs));
};
