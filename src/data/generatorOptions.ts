export interface CountryOptions {
  country: string;
  flag: string;
  themes: string[];
  threatenedElements: string[];
  educationalValues: string[];
  philosophicalSecrets: string[];
}

export const countryOptions: CountryOptions[] = [
  {
    country: 'Cameroun',
    flag: '🇨🇲',
    themes: [
      "La déforestation",
      "La pollution plastique",
      "Le braconnage",
      "La sécheresse",
      "Les feux de brousse",
      "La perte des traditions",
      "La pollution de l'eau",
      "L'érosion des sols",
    ],
    threatenedElements: [
      "La forêt sacrée",
      "La rivière Wouri",
      "Les animaux de la savane",
      "Les champs cultivés",
      "L'air du village",
      "Le grand Fromager",
      "Le lac des ancêtres",
      "Les collines de terre rouge",
    ],
    educationalValues: [
      "Le reboisement et le respect des ancêtres",
      "Le recyclage et la protection de l'eau",
      "Le respect de la vie sauvage",
      "La préservation de l'eau et la patience",
      "La prévention et la vigilance collective",
      "La transmission intergénérationnelle",
      "L'agriculture durable et le travail d'équipe",
    ],
    philosophicalSecrets: [
      "Un arbre abattu, c'est une mémoire perdue.",
      "L'eau que tu salis aujourd'hui est celle que tu boiras demain.",
      "Chaque animal est un fil dans la grande toile de la vie.",
      "La terre ne nous appartient pas, nous l'empruntons à nos enfants.",
      "Le feu détruit en un jour ce que la terre a mis cent ans à bâtir.",
      "Celui qui oublie ses racines ne peut pas donner de fruits.",
      "La force du fleuve vient de chaque goutte d'eau.",
    ],
  },
  {
    country: 'Sénégal',
    flag: '🇸🇳',
    themes: [
      "La surpêche et l'épuisement des océans",
      "La désertification du Sahel",
      "La déforestation de la Casamance",
      "La pollution des plages",
    ],
    threatenedElements: [
      "Les mangroves du Sine-Saloum",
      "Le fleuve Sénégal",
      "Les baobabs centenaires",
      "Les récifs coralliens de la Petite Côte",
    ],
    educationalValues: [
      "La Teranga (hospitalité) et le partage",
      "La pêche responsable et durable",
      "La solidarité communautaire",
      "Le respect des anciens et de la sagesse orale",
    ],
    philosophicalSecrets: [
      "L'océan nourrit celui qui le respecte.",
      "Un baobab ne tombe pas sous un seul coup de vent.",
      "Le désert avance là où l'homme a oublié de planter.",
      "La Teranga commence par un sourire et une main tendue.",
    ],
  },
  {
    country: "Côte d'Ivoire",
    flag: '🇨🇮',
    themes: [
      "La déforestation pour le cacao",
      "La pollution des lagunes",
      "Le travail des enfants dans les plantations",
      "La disparition des éléphants",
    ],
    threatenedElements: [
      "La forêt du Taï",
      "La lagune Ébrié",
      "Les éléphants de forêt",
      "Les plantations traditionnelles",
    ],
    educationalValues: [
      "Le commerce équitable et la justice",
      "La protection des espèces menacées",
      "L'éducation comme droit fondamental",
      "L'harmonie entre agriculture et nature",
    ],
    philosophicalSecrets: [
      "Le cacao amer rappelle que la douceur a un prix.",
      "Qui protège l'éléphant protège la forêt entière.",
      "Un enfant qui apprend est un arbre qui grandit.",
      "La lagune reflète le visage de ceux qui en prennent soin.",
    ],
  },
  {
    country: 'Mali',
    flag: '🇲🇱',
    themes: [
      "La désertification et l'avancée du Sahara",
      "La rareté de l'eau potable",
      "La préservation des manuscrits de Tombouctou",
      "L'érosion des berges du Niger",
    ],
    threatenedElements: [
      "Le fleuve Niger",
      "Le lac Faguibine",
      "Les manuscrits anciens de Tombouctou",
      "Les terres fertiles du delta intérieur",
    ],
    educationalValues: [
      "La sagesse des griots et la mémoire collective",
      "La gestion communautaire de l'eau",
      "La préservation du patrimoine culturel",
      "La résilience face au changement climatique",
    ],
    philosophicalSecrets: [
      "Le griot qui chante, c'est une bibliothèque qui parle.",
      "L'eau du Niger est le sang de la terre malienne.",
      "Un manuscrit brûlé est une étoile éteinte dans le ciel du savoir.",
      "Le Sahara n'avance que là où les hommes ont cessé de rêver.",
    ],
  },
  {
    country: 'RDC',
    flag: '🇨🇩',
    themes: [
      "La déforestation de la forêt équatoriale",
      "Le braconnage des gorilles",
      "L'exploitation minière sauvage",
      "La pollution du fleuve Congo",
    ],
    threatenedElements: [
      "La forêt équatoriale du bassin du Congo",
      "Les gorilles des montagnes",
      "Le fleuve Congo",
      "Les volcans du Kivu",
    ],
    educationalValues: [
      "La protection de la biodiversité",
      "Le respect des peuples autochtones",
      "L'exploitation responsable des ressources",
      "La coexistence entre l'homme et la nature",
    ],
    philosophicalSecrets: [
      "La forêt du Congo est le deuxième poumon de la Terre.",
      "Le gorille est le miroir de notre humanité.",
      "Celui qui détruit la forêt détruit son propre toit.",
      "Le fleuve Congo coule pour tous, pas pour quelques-uns.",
    ],
  },
  {
    country: 'Kenya / Tanzanie',
    flag: '🇰🇪',
    themes: [
      "Le braconnage des éléphants et rhinocéros",
      "La fonte des neiges du Kilimandjaro",
      "La surpopulation dans les réserves",
      "La sécheresse dans la Corne de l'Afrique",
    ],
    threatenedElements: [
      "Les neiges du Kilimandjaro",
      "La savane du Serengeti",
      "Les récifs de Zanzibar",
      "Le lac Victoria",
    ],
    educationalValues: [
      "Le tourisme responsable et éthique",
      "La conservation des espèces menacées",
      "L'Ubuntu : je suis parce que nous sommes",
      "Le respect des cycles de migration",
    ],
    philosophicalSecrets: [
      "Quand le Kilimandjaro perdra sa neige, la terre perdra sa couronne.",
      "Le lion qui rugit protège toute la savane.",
      "Ubuntu : une personne est une personne à travers les autres.",
      "La grande migration enseigne que la vie est un voyage, pas une destination.",
    ],
  },
];

// Backward-compatible flat exports (defaults to Cameroun)
export const themes = countryOptions[0].themes;
export const threatenedElements = countryOptions[0].threatenedElements;
export const educationalValues = countryOptions[0].educationalValues;
export const philosophicalSecrets = countryOptions[0].philosophicalSecrets;

// Helper to get options for a specific country
export const getCountryOptions = (country: string): CountryOptions | undefined => {
  return countryOptions.find(c => c.country === country);
};
