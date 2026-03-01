export interface TomeTheme {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  promptStyle: string;
}

export const tomeThemes: TomeTheme[] = [
  {
    id: 'neutre',
    name: 'Classique',
    description: 'Histoire neutre sans thème imposé, libre et universelle',
    color: '#8E9299',
    icon: '📖',
    promptStyle: 'Un récit classique et universel, avec un ton naturel et bienveillant.',
  },
  {
    id: 'foret-sacree',
    name: 'La Forêt Sacrée',
    description: 'Mystères de la forêt, arbres anciens, esprits de la nature',
    color: '#2D6A4F',
    icon: '🌳',
    promptStyle: 'Atmosphère mystique et forestière. La forêt est un personnage à part entière, avec ses secrets, ses bruits, ses ombres. Les arbres centenaires murmurent des sagesses anciennes.',
  },
  {
    id: 'eaux-vivantes',
    name: 'Les Eaux Vivantes',
    description: 'Rivières, océans, pluie, créatures aquatiques',
    color: '#0077B6',
    icon: '💧',
    promptStyle: 'L\'eau est au cœur du récit : rivières chantantes, océan protecteur, pluies nourricières. Les créatures aquatiques guident les héros. L\'ambiance est fluide, poétique, avec des reflets et des courants.',
  },
  {
    id: 'savane-doree',
    name: 'La Savane Dorée',
    description: 'Grands espaces, animaux majestueux, couchers de soleil',
    color: '#E07A5F',
    icon: '🦁',
    promptStyle: 'Immensité de la savane africaine, herbes hautes dorées par le soleil. Les animaux — lions, éléphants, girafes — sont des alliés sages. Ambiance chaude, épique, avec des ciels flamboyants.',
  },
  {
    id: 'village-ancetres',
    name: 'Le Village des Ancêtres',
    description: 'Traditions, griots, sagesse des anciens, vie communautaire',
    color: '#9B2226',
    icon: '🏘️',
    promptStyle: 'L\'histoire se déroule au cœur d\'un village traditionnel africain. Les anciens transmettent leur sagesse, le griot raconte des légendes au coin du feu. Ambiance chaleureuse, communautaire, enracinée dans la tradition.',
  },
  {
    id: 'ciel-etoile',
    name: 'Le Ciel Étoilé',
    description: 'Nuit africaine, constellations, rêves, voyage spirituel',
    color: '#3D348B',
    icon: '✨',
    promptStyle: 'L\'aventure se déroule sous le ciel nocturne africain. Les étoiles guident le chemin, les rêves ouvrent des portes vers d\'autres mondes. Ambiance onirique, contemplative, pleine de merveilles célestes.',
  },
  {
    id: 'terre-rouge',
    name: 'La Terre Rouge',
    description: 'Montagnes, volcans, grottes, minéraux, forces telluriques',
    color: '#BC4749',
    icon: '🌋',
    promptStyle: 'Aventure liée à la terre, aux montagnes et aux profondeurs. Les grottes cachent des trésors de sagesse, la terre rouge vibre d\'énergie ancienne. Ambiance tellurique, puissante, avec des paysages grandioses.',
  },
  {
    id: 'marche-couleurs',
    name: 'Le Marché aux Couleurs',
    description: 'Vie urbaine, artisanat, musique, danse, rencontres',
    color: '#F4A261',
    icon: '🎨',
    promptStyle: 'L\'histoire prend vie dans un marché animé africain plein de couleurs, de sons et d\'odeurs. Artisans, musiciens, danseurs créent une mosaïque culturelle vibrante. Ambiance joyeuse, festive, multiculturelle.',
  },
];

export function getTomeTheme(id: string): TomeTheme | undefined {
  return tomeThemes.find(t => t.id === id);
}
