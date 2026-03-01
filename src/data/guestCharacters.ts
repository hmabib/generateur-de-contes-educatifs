export interface GuestCharacter {
  id: number;
  name: string;
  style: string;
  referenceImage?: string;
  createdAt: string;
}

const STORAGE_KEY = 'gardiens_guest_characters';

export const getGuestCharacters = (): GuestCharacter[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveGuestCharacters = (chars: GuestCharacter[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chars));
};

export const addGuestCharacter = (char: Omit<GuestCharacter, 'id' | 'createdAt'>): GuestCharacter => {
  const chars = getGuestCharacters();
  const newChar: GuestCharacter = {
    ...char,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  chars.push(newChar);
  saveGuestCharacters(chars);
  return newChar;
};

export const deleteGuestCharacter = (id: number) => {
  const chars = getGuestCharacters().filter(c => c.id !== id);
  saveGuestCharacters(chars);
};
