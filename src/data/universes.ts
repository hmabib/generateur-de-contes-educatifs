export const defaultUniverses = [
  {
    id: 1,
    name: "Le Village de Nkonté",
    description: "Un village paisible entouré d'une forêt dense, où les traditions et la magie de la nature coexistent en harmonie.",
    imageFile: "village.jpg"
  },
  {
    id: 2,
    name: "La Forêt Sacrée",
    description: "Une forêt ancienne et mystique, abritant des esprits protecteurs et des secrets oubliés.",
    imageFile: "forest.jpg"
  }
];

export const getUniverses = () => {
  const stored = localStorage.getItem('gardiens_universes');
  if (stored) {
    return JSON.parse(stored);
  }
  return defaultUniverses;
};

export const saveUniverses = (universes: any[]) => {
  localStorage.setItem('gardiens_universes', JSON.stringify(universes));
};
