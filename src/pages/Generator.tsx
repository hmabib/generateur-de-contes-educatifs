import { useState } from 'react';
import { motion } from 'motion/react';
import { generateStructuredStory, generateCharacterImage, generateChapterImage, supportsImageGeneration } from '../services/ai';
import { Loader2, Wand2, Save, BookOpen, ImagePlus, Image as ImageIcon, Printer, ChevronDown, ChevronUp, Star, UserCheck } from 'lucide-react';
import { countryOptions, getCountryOptions } from '../data/generatorOptions';
import { getCharacters } from '../data/characters';
import { getUniverses } from '../data/universes';
import { getLanguages } from '../data/dictionary';
import { getGuestCharacters, addGuestCharacter } from '../data/guestCharacters';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BookPDF } from '../components/BookPDF';
import { StoryReader } from '../components/StoryReader';

type Chapter = {
  chapterNumber: number;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
};

type StoryData = {
  title: string;
  chapters: Chapter[];
  lexicon: { word: string; translation: string }[];
};

const PROGRESS_MESSAGES = [
  "Préparation de l'aventure...",
  "Les personnages se rassemblent...",
  "L'histoire prend forme...",
  "Écriture en cours...",
  "Peaufinage du récit...",
  "Finalisation...",
];

export function Generator() {
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    tomeNumber: '2',
    title: 'Le Chant de la Forêt Sacrée',
    universe: 'Le Village de Nkonté',
    theme: 'la déforestation',
    threatenedElement: 'la forêt',
    focusCharacter: 'Sango le pont culturel',
    educationalValue: 'le reboisement et le respect des ancêtres',
    secret: "Un arbre abattu, c'est une mémoire perdue",
    guestName: 'Oswalda',
    guestStyle: 'Petite fille curieuse avec des tresses et une robe jaune',
    ageRange: '6-8 ans',
    country: 'Cameroun',
    chapterCount: '5',
    writingStyle: 'Narratif classique',
    includeLexicon: true,
    lexiconLanguage: '',
    lexiconWordCount: '8',
  });

  const universes = getUniverses();
  const savedGuests = getGuestCharacters();
  const languages = getLanguages();
  const currentCountryOptions = getCountryOptions(formData.country);

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceMimeType, setReferenceMimeType] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setFormData({
      ...formData,
      country: newCountry,
      theme: '',
      threatenedElement: '',
      educationalValue: '',
      secret: '',
    });
  };

  const handleSelectSavedGuest = (guestId: string) => {
    if (!guestId) return;
    const guest = savedGuests.find(g => g.id === Number(guestId));
    if (guest) {
      setFormData({ ...formData, guestName: guest.name, guestStyle: guest.style });
      if (guest.referenceImage) {
        setReferenceImage(guest.referenceImage);
        setReferenceMimeType('image/png');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagePromptChange = (index: number, newPrompt: string) => {
    setStory(prev => {
      if (!prev) return prev;
      const newStory = { ...prev };
      newStory.chapters[index].imagePrompt = newPrompt;
      return newStory;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStory(null);
    setGeneratedImage(null);
    setGroupImage(null);

    // Start progress messages
    let msgIndex = 0;
    setProgressMessage(PROGRESS_MESSAGES[0]);
    const progressInterval = setInterval(() => {
      msgIndex = Math.min(msgIndex + 1, PROGRESS_MESSAGES.length - 1);
      setProgressMessage(PROGRESS_MESSAGES[msgIndex]);
    }, 8000);

    try {
      const storyParams = {
        ...formData,
        chapterCount: parseInt(formData.chapterCount),
        lexiconWordCount: parseInt(formData.lexiconWordCount),
        recurrentCharacters: getCharacters(),
      };

      if (supportsImageGeneration()) {
        const [storyResult, imageResult] = await Promise.all([
          generateStructuredStory(storyParams),
          generateCharacterImage(
            formData.guestName,
            formData.guestStyle,
            referenceImage || undefined,
            referenceMimeType || undefined
          )
        ]);
        setStory(storyResult);
        setGeneratedImage(imageResult);
      } else {
        const storyResult = await generateStructuredStory(storyParams);
        setStory(storyResult);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de la génération. Vérifiez votre clé API et réessayez.");
    } finally {
      clearInterval(progressInterval);
      setProgressMessage('');
      setLoading(false);
    }
  };

  const getReferenceImages = async () => {
    const referenceImages: { data: string; mimeType: string }[] = [];
    if (generatedImage) {
      referenceImages.push({
        data: generatedImage.split(',')[1],
        mimeType: 'image/png'
      });
    }

    const { get } = await import('idb-keyval');

    for (const char of getCharacters()) {
      try {
        const customImage = await get(`character-image-${char.id}`);
        if (customImage) {
          const parts = customImage.split(',');
          const mimeType = parts[0].split(':')[1].split(';')[0];
          referenceImages.push({ data: parts[1], mimeType });
          continue;
        }

        let response = await fetch(`/characters/${char.imageFile}`);
        if (!response.ok && char.imageFile.endsWith('.jpg')) {
          response = await fetch(`/characters/${char.imageFile.replace('.jpg', '.png')}`);
        }
        if (response.ok) {
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const parts = base64.split(',');
          const mimeType = parts[0].split(':')[1].split(';')[0];
          referenceImages.push({ data: parts[1], mimeType });
        }
      } catch (e) {
        console.warn(`Could not load reference image for ${char.name}`, e);
      }
    }

    try {
      const customMentor = await get(`character-image-mentor`);
      if (customMentor) {
        const parts = customMentor.split(',');
        const mimeType = parts[0].split(':')[1].split(';')[0];
        referenceImages.push({ data: parts[1], mimeType });
      } else {
        let response = await fetch(`/characters/papa_yosep.jpg`);
        if (!response.ok) {
          response = await fetch(`/characters/papa_yosep.png`);
        }
        if (response.ok) {
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const parts = base64.split(',');
          const mimeType = parts[0].split(':')[1].split(';')[0];
          referenceImages.push({ data: parts[1], mimeType });
        }
      }
    } catch (e) {
      console.warn(`Could not load reference image for mentor`, e);
    }

    return referenceImages;
  };

  const handleGenerateGroupImage = async () => {
    setLoadingImage(true);
    try {
      const referenceImages = await getReferenceImages();
      if (referenceImages.length === 0) {
        alert("Aucune image de référence trouvée.");
        setLoadingImage(false);
        return;
      }
      const prompt = `Illustration de couverture. Thème: ${formData.theme}. On y voit le groupe d'enfants en pleine action. Style 2D, coloré, chaleureux, dessiné à la main, conte africain, sans aucun texte, sans titre, sans écriture.`;
      const result = await generateChapterImage(prompt, referenceImages);
      setGroupImage(result);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération de l'image de groupe.");
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerateChapterImage = async (chapterIndex: number) => {
    if (!story) return;

    setStory(prev => {
      if (!prev) return prev;
      const newStory = { ...prev };
      newStory.chapters[chapterIndex].isGeneratingImage = true;
      return newStory;
    });

    try {
      const referenceImages = await getReferenceImages();
      const chapter = story.chapters[chapterIndex];
      const prompt = `${chapter.imagePrompt}. Style 2D, coloré, chaleureux, dessiné à la main, conte africain, sans aucun texte, sans titre, sans écriture.`;

      const result = await generateChapterImage(prompt, referenceImages);

      setStory(prev => {
        if (!prev) return prev;
        const newStory = { ...prev };
        newStory.chapters[chapterIndex].imageUrl = result;
        newStory.chapters[chapterIndex].isGeneratingImage = false;
        return newStory;
      });
    } catch (error) {
      console.error(error);
      alert(`Erreur lors de la génération de l'image de la séquence ${chapterIndex + 1}.`);
      setStory(prev => {
        if (!prev) return prev;
        const newStory = { ...prev };
        newStory.chapters[chapterIndex].isGeneratingImage = false;
        return newStory;
      });
    }
  };

  const handleSave = () => {
    if (!story) return;
    const savedStories = JSON.parse(localStorage.getItem('gardiens_stories') || '[]');
    savedStories.push({
      id: Date.now(),
      title: story.title || formData.title,
      tomeNumber: formData.tomeNumber,
      content: JSON.stringify(story),
      imageUrl: groupImage || generatedImage,
      date: new Date().toISOString(),
      isStructured: true,
    });
    localStorage.setItem('gardiens_stories', JSON.stringify(savedStories));
    alert('Tome sauvegardé dans la bibliothèque !');
  };

  const handleSaveGuest = () => {
    addGuestCharacter({
      name: formData.guestName,
      style: formData.guestStyle,
      referenceImage: generatedImage || undefined,
    });
    alert(`${formData.guestName} sauvegardé dans les personnages invités !`);
  };

  const handleStoryChange = (updatedStory: StoryData) => {
    setStory(updatedStory);
  };

  // Filter options by selected country
  const currentThemes = currentCountryOptions?.themes || [];
  const currentThreatenedElements = currentCountryOptions?.threatenedElements || [];
  const currentEducationalValues = currentCountryOptions?.educationalValues || [];
  const currentPhilosophicalSecrets = currentCountryOptions?.philosophicalSecrets || [];
  const filteredUniverses = universes.filter((u: any) => !u.country || u.country === formData.country);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 print:m-0 print:p-0 print:max-w-none print:space-y-0"
    >
      <header className="text-center space-y-4 print:hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-olive-light/20 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-brand-olive to-brand-olive-light pb-2">
          Générateur de Tomes
        </h1>
        <p className="text-xl text-brand-ink/70 font-light max-w-2xl mx-auto">
          Créez une nouvelle aventure des Gardiens de la Terre.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:gap-0">
        <div className="lg:col-span-4 print:hidden">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-olive/10 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-serif font-bold text-brand-ink mb-8 flex items-center gap-3">
              <div className="p-2 bg-brand-olive/10 rounded-xl text-brand-olive">
                <Wand2 size={24} />
              </div>
              Paramètres
            </h2>

            <div className="space-y-6">
              {/* Section 1: Personnage Invité */}
              <div className="bg-brand-bg/50 p-6 rounded-2xl border border-brand-olive/10 space-y-5">
                <h3 className="font-serif font-bold text-brand-ink text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold text-sm">1</span>
                  Personnage Invité
                </h3>

                {/* Saved guest selector */}
                {savedGuests.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                      Personnages sauvegardés
                    </label>
                    <select
                      onChange={(e) => handleSelectSavedGuest(e.target.value)}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Nouveau personnage --</option>
                      {savedGuests.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Style / Description
                  </label>
                  <textarea
                    name="guestStyle"
                    value={formData.guestStyle}
                    onChange={handleChange}
                    rows={2}
                    className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Photo de référence (Optionnel)
                  </label>
                  <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-brand-olive/20 border-dashed rounded-xl appearance-none cursor-pointer hover:border-brand-olive/50 focus:outline-none">
                    <span className="flex items-center space-x-2">
                      <ImagePlus className="w-6 h-6 text-brand-olive-light" />
                      <span className="font-medium text-brand-olive-light text-sm">
                        {referenceImage ? "Image chargée ✓" : "Cliquez pour uploader"}
                      </span>
                    </span>
                    <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {referenceImage && (
                    <img src={referenceImage} alt="Reference" className="mt-2 w-full h-24 object-cover rounded-xl border border-brand-olive/20" />
                  )}
                </div>
              </div>

              {/* Section 2: Histoire */}
              <div className="bg-brand-bg/50 p-6 rounded-2xl border border-brand-olive/10 space-y-5">
                <h3 className="font-serif font-bold text-brand-ink text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold text-sm">2</span>
                  Histoire
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                      Tome N°
                    </label>
                    <input
                      type="text"
                      name="tomeNumber"
                      value={formData.tomeNumber}
                      onChange={handleChange}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                      Âge Cible
                    </label>
                    <select
                      name="ageRange"
                      value={formData.ageRange}
                      onChange={handleChange}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      required
                    >
                      <option value="3-5 ans">3-5 ans (Très simple)</option>
                      <option value="6-8 ans">6-8 ans (Débutant)</option>
                      <option value="9-12 ans">9-12 ans (Avancé)</option>
                    </select>
                  </div>
                </div>

                {/* Country selector */}
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Pays / Contexte
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                  >
                    {countryOptions.map(c => (
                      <option key={c.country} value={c.country}>{c.flag} {c.country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Focus
                  </label>
                  <input
                    type="text"
                    name="focusCharacter"
                    value={formData.focusCharacter}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Thème ou idée de titre
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Univers
                  </label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) setFormData({ ...formData, universe: e.target.value });
                      }}
                      value={filteredUniverses.find((u: any) => u.name === formData.universe)?.name || ""}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir un univers --</option>
                      {filteredUniverses.map((u: any) => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                    <input
                      type="text"
                      name="universe"
                      value={formData.universe}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Thème Central
                  </label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) setFormData({ ...formData, theme: e.target.value });
                      }}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {currentThemes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Élément Menacé
                  </label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) setFormData({ ...formData, threatenedElement: e.target.value });
                      }}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {currentThreatenedElements.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      name="threatenedElement"
                      value={formData.threatenedElement}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Valeur Éducative
                  </label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) setFormData({ ...formData, educationalValue: e.target.value });
                      }}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {currentEducationalValues.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      name="educationalValue"
                      value={formData.educationalValue}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                    Secret Philosophique
                  </label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) setFormData({ ...formData, secret: e.target.value });
                      }}
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {currentPhilosophicalSecrets.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <textarea
                      name="secret"
                      value={formData.secret}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Options Avancées */}
              <div className="bg-brand-bg/50 rounded-2xl border border-brand-olive/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-brand-olive/5 transition-colors"
                >
                  <h3 className="font-serif font-bold text-brand-ink text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold text-sm">3</span>
                    Options Avancées
                  </h3>
                  {showAdvanced ? <ChevronUp size={20} className="text-brand-olive" /> : <ChevronDown size={20} className="text-brand-olive" />}
                </button>

                {showAdvanced && (
                  <div className="px-6 pb-6 space-y-5 border-t border-brand-olive/10 pt-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                          Séquences
                        </label>
                        <select
                          name="chapterCount"
                          value={formData.chapterCount}
                          onChange={handleChange}
                          className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                        >
                          <option value="3">3 séquences</option>
                          <option value="5">5 séquences</option>
                          <option value="7">7 séquences</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                          Style d'écriture
                        </label>
                        <select
                          name="writingStyle"
                          value={formData.writingStyle}
                          onChange={handleChange}
                          className="w-full bg-white border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                        >
                          <option value="Narratif classique">Narratif classique</option>
                          <option value="Poétique">Poétique</option>
                          <option value="Dialogue riche">Dialogue riche</option>
                        </select>
                      </div>
                    </div>

                    {/* Lexicon toggle */}
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="includeLexicon"
                          checked={formData.includeLexicon}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-brand-olive/30 text-brand-olive focus:ring-brand-olive/50"
                        />
                        <span className="text-sm font-medium text-brand-ink">Inclure un lexique de mots locaux</span>
                      </label>

                      {formData.includeLexicon && (
                        <div className="grid grid-cols-2 gap-4 ml-8">
                          <div>
                            <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                              Langue
                            </label>
                            <select
                              name="lexiconLanguage"
                              value={formData.lexiconLanguage}
                              onChange={handleChange}
                              className="w-full bg-white border border-brand-olive/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                            >
                              <option value="">Auto (contexte)</option>
                              {languages.map(l => (
                                <option key={l.id} value={l.name}>{l.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">
                              Nb. mots
                            </label>
                            <select
                              name="lexiconWordCount"
                              value={formData.lexiconWordCount}
                              onChange={handleChange}
                              className="w-full bg-white border border-brand-olive/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                            >
                              <option value="5">5 mots</option>
                              <option value="8">8 mots</option>
                              <option value="12">12 mots</option>
                              <option value="15">15 mots</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-brand-olive to-brand-olive-light text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Génération en cours...</span>
                  </div>
                  <span className="text-sm text-white/70 font-normal">{progressMessage}</span>
                </div>
              ) : (
                <>
                  <Wand2 size={24} />
                  Générer le Tome
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 print:w-full print:block">
          {story ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-[2rem] shadow-sm border border-brand-olive/10 print:border-none print:shadow-none print:p-0 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-olive to-brand-olive-light print:hidden"></div>

              {/* Header with actions */}
              <div className="flex justify-between items-start mb-10 pb-6 border-b border-brand-olive/10 print:hidden pt-4">
                <h2 className="text-3xl font-serif font-bold text-brand-ink flex items-center gap-3">
                  <div className="p-2 bg-brand-olive/10 rounded-xl text-brand-olive">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <span className="text-sm text-brand-olive font-mono block">Tome {formData.tomeNumber}</span>
                    {story.title}
                  </div>
                </h2>
                <div className="flex gap-2 flex-wrap justify-end">
                  <PDFDownloadLink
                    document={<BookPDF story={story} tomeNumber={formData.tomeNumber} groupImage={groupImage} />}
                    fileName={`Les_Gardiens_Tome_${formData.tomeNumber}.pdf`}
                    className="flex items-center gap-2 bg-brand-bg text-brand-olive px-4 py-2 rounded-full font-medium hover:bg-brand-olive/10 transition-colors border border-brand-olive/20 text-sm"
                  >
                    {({ loading: pdfLoading }) => (
                      <>
                        {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                        {pdfLoading ? 'PDF...' : 'PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-brand-olive text-white px-4 py-2 rounded-full font-medium hover:bg-brand-olive-light transition-colors text-sm"
                  >
                    <Save size={16} />
                    Sauvegarder
                  </button>
                  {generatedImage && (
                    <button
                      onClick={handleSaveGuest}
                      className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-full font-medium hover:bg-brand-accent/80 transition-colors text-sm"
                    >
                      <UserCheck size={16} />
                      Garder l'invité
                    </button>
                  )}
                </div>
              </div>

              {/* Cover image section */}
              <div className="print:h-screen print:flex print:flex-col print:items-center print:justify-center print:page-break-after-always">
                {groupImage ? (
                  <img
                    src={groupImage}
                    alt="Illustration de couverture"
                    className="w-full max-w-2xl h-auto rounded-2xl shadow-md border border-brand-olive/20 print:shadow-none print:border-none mb-8"
                  />
                ) : supportsImageGeneration() ? (
                  <div className="w-full max-w-2xl aspect-video bg-brand-bg rounded-2xl border-2 border-dashed border-brand-olive/20 flex flex-col items-center justify-center p-8 print:hidden mb-8">
                    <button
                      onClick={handleGenerateGroupImage}
                      disabled={loadingImage}
                      className="bg-white border-2 border-brand-olive text-brand-olive rounded-xl px-6 py-3 font-bold flex items-center justify-center gap-2 hover:bg-brand-olive hover:text-white transition-colors disabled:opacity-50"
                    >
                      {loadingImage ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Création de la couverture...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={20} />
                          Générer l'illustration de couverture
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl aspect-video bg-brand-bg rounded-2xl border-2 border-dashed border-brand-olive/20 flex flex-col items-center justify-center p-8 print:hidden mb-8">
                    <p className="text-brand-ink/50 text-sm text-center">
                      La génération d'images nécessite une clé API Gemini.
                    </p>
                  </div>
                )}
              </div>

              {/* Guest character image */}
              {generatedImage && (
                <div className="my-8 p-6 bg-brand-bg rounded-2xl border border-brand-olive/10 flex flex-col md:flex-row gap-6 items-center print:hidden">
                  <img
                    src={generatedImage}
                    alt={formData.guestName}
                    className="w-40 h-40 object-cover rounded-xl shadow-sm border border-brand-olive/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-bold text-brand-olive mb-2">
                      {formData.guestName}
                    </h3>
                    <p className="text-brand-ink/80 italic">Le personnage invité de ce tome.</p>
                    <p className="text-sm text-brand-ink/60 mt-2">{formData.guestStyle}</p>
                  </div>
                </div>
              )}

              {/* Image generation per chapter */}
              {supportsImageGeneration() && (
                <div className="space-y-4 mb-8 print:hidden">
                  {story.chapters.map((chapter, index) => (
                    !chapter.imageUrl && (
                      <div key={index} className="bg-brand-bg rounded-xl border border-brand-olive/10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-brand-ink/60">Illustration Séq. {chapter.chapterNumber}</span>
                          <button
                            onClick={() => handleGenerateChapterImage(index)}
                            disabled={chapter.isGeneratingImage}
                            className="bg-white border border-brand-olive/20 text-brand-olive rounded-lg px-4 py-1.5 text-sm font-medium flex items-center gap-2 hover:bg-brand-olive hover:text-white transition-colors disabled:opacity-50"
                          >
                            {chapter.isGeneratingImage ? (
                              <><Loader2 className="animate-spin" size={14} /> Génération...</>
                            ) : (
                              <><ImageIcon size={14} /> Générer</>
                            )}
                          </button>
                        </div>
                        <textarea
                          value={chapter.imagePrompt}
                          onChange={(e) => handleImagePromptChange(index, e.target.value)}
                          className="w-full bg-white border border-brand-olive/10 rounded-lg p-3 text-xs text-brand-ink/70 focus:outline-none focus:ring-1 focus:ring-brand-olive/30 resize-y min-h-[60px]"
                        />
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Story content with StoryReader */}
              <StoryReader
                story={story}
                tomeNumber={formData.tomeNumber}
                editable={true}
                onStoryChange={handleStoryChange}
              />

            </motion.div>
          ) : (
            <div className="bg-white/50 border border-brand-olive/10 border-dashed rounded-3xl h-full min-h-[600px] flex flex-col items-center justify-center text-brand-olive-light p-8 text-center print:hidden">
              <BookOpen size={48} className="mb-4 opacity-50" />
              <p className="text-xl font-serif">Le livre est encore vierge.</p>
              <p className="mt-2 text-sm">Remplissez les paramètres et lancez la génération pour découvrir la nouvelle aventure.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
