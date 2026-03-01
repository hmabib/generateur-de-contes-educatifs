export interface Universe {
  id: number;
  name: string;
  description: string;
  imageFile: string;
  country?: string;
}

export const defaultUniverses: Universe[] = [
  {
    id: 1,
    name: "Le Village de Nkonté",
    description: "Un village paisible entouré d'une forêt dense, où les traditions et la magie de la nature coexistent en harmonie.",
    imageFile: "village.jpg",
    country: "Cameroun",
  },
  {
    id: 2,
    name: "La Forêt Sacrée",
    description: "Une forêt ancienne et mystique, abritant des esprits protecteurs et des secrets oubliés.",
    imageFile: "forest.jpg",
    country: "Cameroun",
  },
  {
    id: 3,
    name: "Les Mangroves du Sine-Saloum",
    description: "Un labyrinthe d'eau et de racines, où les pêcheurs vivent au rythme des marées et des oiseaux migrateurs.",
    imageFile: "default_universe.jpg",
    country: "Sénégal",
  },
  {
    id: 4,
    name: "La Falaise de Bandiagara",
    description: "Les habitations ancestrales des Dogon, accrochées aux falaises, gardent les mystères du cosmos.",
    imageFile: "default_universe.jpg",
    country: "Mali",
  },
  {
    id: 5,
    name: "La Forêt du Taï",
    description: "L'une des dernières forêts primaires d'Afrique de l'Ouest, refuge des chimpanzés et de mille espèces rares.",
    imageFile: "default_universe.jpg",
    country: "Côte d'Ivoire",
  },
  {
    id: 6,
    name: "Le Bassin du Congo",
    description: "La plus grande forêt tropicale d'Afrique, deuxième poumon vert de la planète, traversée par le puissant fleuve Congo.",
    imageFile: "default_universe.jpg",
    country: "RDC",
  },
  {
    id: 7,
    name: "La Savane du Serengeti",
    description: "Des plaines infinies où se déroule la plus grande migration animale du monde, sous le regard du Kilimandjaro.",
    imageFile: "default_universe.jpg",
    country: "Kenya / Tanzanie",
  },
];

export const getUniverses = (): Universe[] => {
  const stored = localStorage.getItem('gardiens_universes');
  if (stored) {
    return JSON.parse(stored);
  }
  return defaultUniverses;
};

export const saveUniverses = (universes: Universe[]) => {
  localStorage.setItem('gardiens_universes', JSON.stringify(universes));
};
