export const defaultCharacters = [
  {
    id: 2,
    name: "Nkôlo",
    origin: "Centre",
    language: "Ewondo",
    archetype: "Le Stratège",
    signature: "Fauteuil roulant + yeux vifs",
    description: "Le cerveau du groupe. Son handicap n'est jamais une limite, il identifie toujours la source logique du problème.",
    imageFile: "nkolo.jpg"
  },
  {
    id: 3,
    name: "Madiba",
    origin: "Littoral",
    language: "Duala",
    archetype: "Le Gardien de l'eau",
    signature: "Pieds nus, lien à la nature",
    description: "Connecté aux éléments aquatiques, il ressent les souffrances de la rivière.",
    imageFile: "madiba.jpg"
  },
  {
    id: 4,
    name: "Aminata",
    origin: "Nord",
    language: "Fufulde",
    archetype: "La Protectrice",
    signature: "Menton haut, instinct de groupe",
    description: "Veille sur les autres avec un fort instinct protecteur.",
    imageFile: "aminata.jpg"
  },
  {
    id: 5,
    name: "Ngwé",
    origin: "Ouest",
    language: "Fèfè",
    archetype: "La Documentaliste",
    signature: "Photographie, peau lumineuse",
    description: "La mémoire visuelle du groupe, elle observe et documente tout.",
    imageFile: "ngwe.jpg"
  },
  {
    id: 6,
    name: "Mimi",
    origin: "Sud",
    language: "Bassa",
    archetype: "L'Énergie",
    signature: "Chansons, démarche sautillante",
    description: "Apporte la joie et le rythme. Invente toujours une chanson de travail pour motiver les troupes.",
    imageFile: "mimi.jpg"
  },
  {
    id: 7,
    name: "Sango",
    origin: "Est / RCA",
    language: "Sango",
    archetype: "Le Pont entre cultures",
    signature: "Observateur, ferme la marche",
    description: "Calme et réfléchi, il relie les différentes traditions.",
    imageFile: "sango.jpg"
  }
];

export const getCharacters = () => {
  const stored = localStorage.getItem('gardiens_characters');
  if (stored) {
    return JSON.parse(stored);
  }
  return defaultCharacters;
};

export const saveCharacters = (chars: any[]) => {
  localStorage.setItem('gardiens_characters', JSON.stringify(chars));
};

export const guestCharacterTemplate = {
  name: "Personnage Invité (ex: Oswalda)",
  origin: "Extérieure",
  language: "Lien entre tous",
  archetype: "La Fédératrice / Le Fédérateur",
  signature: "Refuse d'abandonner",
  description: "Ce personnage change à chaque tome ! C'est le nouveau venu, l'étranger qui découvre le village et devient le ciment du groupe le temps d'une aventure."
};

export const mentor = {
  name: "Papa Yosep",
  role: "Sage sculpteur",
  description: "Gardien de la mémoire du village. Il apparaît mystérieusement sous le Fromager pour guider les enfants et révéler le secret philosophique de chaque aventure.",
  imageFile: "papa_yosep.jpg"
};
