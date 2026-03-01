import { useState } from 'react';
import { motion } from 'motion/react';
import { generateStructuredStory, generateCharacterImage, generateChapterImage, supportsImageGeneration } from '../services/ai';
import { Loader2, Wand2, Save, BookOpen, ImagePlus, UserPlus, Image as ImageIcon, Printer } from 'lucide-react';
import Markdown from 'react-markdown';
import { themes, threatenedElements, educationalValues, philosophicalSecrets } from '../data/generatorOptions';
import { getCharacters } from '../data/characters';
import { getUniverses } from '../data/universes';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BookPDF } from '../components/BookPDF';

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

export function Generator() {
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  
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
  });

  const universes = getUniverses();

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceMimeType, setReferenceMimeType] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    try {
      if (supportsImageGeneration()) {
        const [storyResult, imageResult] = await Promise.all([
          generateStructuredStory({ ...formData, recurrentCharacters: getCharacters() }),
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
        const storyResult = await generateStructuredStory({ ...formData, recurrentCharacters: getCharacters() });
        setStory(storyResult);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de la g\u00e9n\u00e9ration.");
    } finally {
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
      alert(`Erreur lors de la génération de l'image du chapitre ${chapterIndex + 1}.`);
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

  const handlePrint = () => {
    window.print();
  };

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
          Créez une nouvelle aventure et générez l'illustration du personnage invité.
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
              {/* Section Personnage Invité */}
              <div className="bg-brand-bg/50 p-6 rounded-2xl border border-brand-olive/10 space-y-5">
                <h3 className="font-serif font-bold text-brand-ink text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold text-sm">1</span>
                  Personnage Invité
                </h3>
                
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
                        {referenceImage ? "Image chargée" : "Cliquez pour uploader"}
                      </span>
                    </span>
                    <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {referenceImage && (
                    <img src={referenceImage} alt="Reference" className="mt-2 w-full h-24 object-cover rounded-xl border border-brand-olive/20" />
                  )}
                </div>
              </div>

              {/* Section Histoire */}
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
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
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
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                      required
                    >
                      <option value="3-5 ans">3-5 ans (Très simple)</option>
                      <option value="6-8 ans">6-8 ans (Débutant)</option>
                      <option value="9-12 ans">9-12 ans (Avancé)</option>
                    </select>
                  </div>
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
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
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
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
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
                      value={universes.find(u => u.name === formData.universe)?.name || ""}
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir un univers --</option>
                      {universes.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                    <input
                      type="text"
                      name="universe"
                      value={formData.universe}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
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
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {themes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
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
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {threatenedElements.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      name="threatenedElement"
                      value={formData.threatenedElement}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
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
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {educationalValues.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      name="educationalValue"
                      value={formData.educationalValue}
                      onChange={handleChange}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
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
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-brand-ink/70"
                    >
                      <option value="">-- Choisir une suggestion --</option>
                      {philosophicalSecrets.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <textarea
                      name="secret"
                      value={formData.secret}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ou saisissez manuellement..."
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-brand-olive to-brand-olive-light text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Génération en cours...
                </>
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
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-brand-olive/10 print:hidden">
                <h2 className="text-3xl font-serif font-bold text-brand-ink flex items-center gap-3">
                  <div className="p-2 bg-brand-olive/10 rounded-xl text-brand-olive">
                    <BookOpen size={24} />
                  </div>
                  Tome {formData.tomeNumber} : {story.title}
                </h2>
                <div className="flex gap-2">
                  <PDFDownloadLink
                    document={<BookPDF story={story} tomeNumber={formData.tomeNumber} groupImage={groupImage} />}
                    fileName={`Les_Gardiens_de_Nkonte_Tome_${formData.tomeNumber}.pdf`}
                    className="flex items-center gap-2 bg-brand-bg text-brand-olive px-4 py-2 rounded-full font-medium hover:bg-brand-olive/10 transition-colors border border-brand-olive/20"
                  >
                    {({ loading }) => (
                      <>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                        {loading ? 'Préparation PDF...' : 'Télécharger PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-brand-olive text-white px-4 py-2 rounded-full font-medium hover:bg-brand-olive-light transition-colors"
                  >
                    <Save size={18} />
                    Sauvegarder
                  </button>
                </div>
              </div>
              
              {/* Couverture (Print & Screen) */}
              <div className="print:h-screen print:flex print:flex-col print:items-center print:justify-center print:page-break-after-always">
                <div className="text-center mb-8">
                  <h1 className="text-5xl font-serif font-bold text-brand-olive mb-4">Générateur de Contes</h1>
                  <h2 className="text-3xl font-serif text-brand-ink">Tome {formData.tomeNumber}</h2>
                  <h3 className="text-4xl font-serif font-bold text-brand-ink mt-4">{story.title}</h3>
                </div>

                {groupImage ? (
                  <img
                    src={groupImage}
                    alt="Illustration de couverture"
                    className="w-full max-w-2xl h-auto rounded-2xl shadow-md border border-brand-olive/20 print:shadow-none print:border-none"
                  />
                ) : supportsImageGeneration() ? (
                  <div className="w-full max-w-2xl aspect-video bg-brand-bg rounded-2xl border-2 border-dashed border-brand-olive/20 flex flex-col items-center justify-center p-8 print:hidden">
                    <button
                      onClick={handleGenerateGroupImage}
                      disabled={loadingImage}
                      className="bg-white border-2 border-brand-olive text-brand-olive rounded-xl px-6 py-3 font-bold flex items-center justify-center gap-2 hover:bg-brand-olive hover:text-white transition-colors disabled:opacity-50"
                    >
                      {loadingImage ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Cr\u00e9ation de la couverture...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={20} />
                          G\u00e9n\u00e9rer l'illustration de couverture
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl aspect-video bg-brand-bg rounded-2xl border-2 border-dashed border-brand-olive/20 flex flex-col items-center justify-center p-8 print:hidden">
                    <p className="text-brand-ink/50 text-sm text-center">
                      La g\u00e9n\u00e9ration d'images n\u00e9cessite une cl\u00e9 API Gemini.
                    </p>
                  </div>
                )}
              </div>

              {/* Personnage Invité (Screen only) */}
              {generatedImage && (
                <div className="my-12 p-6 bg-brand-bg rounded-2xl border border-brand-olive/10 flex flex-col items-center gap-6 print:hidden">
                  <div className="flex flex-col md:flex-row gap-6 items-center w-full">
                    <img 
                      src={generatedImage} 
                      alt={formData.guestName} 
                      className="w-48 h-48 object-cover rounded-xl shadow-sm border border-brand-olive/20"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-brand-olive mb-2">
                        {formData.guestName}
                      </h3>
                      <p className="text-brand-ink/80 italic">
                        Le personnage invité de ce tome.
                      </p>
                      <p className="text-sm text-brand-ink/60 mt-2">
                        {formData.guestStyle}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Séquences */}
              <div className="space-y-16 print:space-y-0">
                {story.chapters.map((chapter, index) => (
                  <div key={index} className="print:page-break-after-always print:min-h-screen print:py-12">
                    <h3 className="text-3xl font-serif font-bold text-brand-olive mb-6 print:hidden">
                      {chapter.title}
                    </h3>
                    
                    {chapter.imageUrl ? (
                      <img
                        src={chapter.imageUrl}
                        alt={`Illustration S\u00e9quence ${chapter.chapterNumber}`}
                        className="w-full h-auto rounded-2xl shadow-md border border-brand-olive/20 mb-8 print:shadow-none print:border-none print:rounded-none print:mb-4"
                      />
                    ) : supportsImageGeneration() ? (
                      <div className="w-full bg-brand-bg rounded-2xl border-2 border-dashed border-brand-olive/20 flex flex-col items-center justify-center p-8 mb-8 print:hidden">
                        <label className="text-sm font-bold text-brand-ink/60 mb-2 self-start">
                          Prompt de l'image (modifiable) :
                        </label>
                        <textarea
                          value={chapter.imagePrompt}
                          onChange={(e) => handleImagePromptChange(index, e.target.value)}
                          className="w-full bg-white border border-brand-olive/20 rounded-xl p-4 text-sm text-brand-ink mb-4 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 resize-y min-h-[100px]"
                        />
                        <button
                          onClick={() => handleGenerateChapterImage(index)}
                          disabled={chapter.isGeneratingImage}
                          className="bg-white border-2 border-brand-olive text-brand-olive rounded-xl px-6 py-3 font-bold flex items-center justify-center gap-2 hover:bg-brand-olive hover:text-white transition-colors disabled:opacity-50"
                        >
                          {chapter.isGeneratingImage ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              G\u00e9n\u00e9ration...
                            </>
                          ) : (
                            <>
                              <ImageIcon size={20} />
                              G\u00e9n\u00e9rer l'illustration
                            </>
                          )}
                        </button>
                      </div>
                    ) : null}

                    <div className="prose prose-stone prose-lg max-w-none font-serif text-brand-ink leading-relaxed print:text-black print:prose-p:leading-normal print:prose-p:mb-4 print:bg-[#fcf8f2] print:p-8 print:rounded-xl print:border-2 print:border-brand-olive/30 print:shadow-[4px_4px_0px_rgba(90,90,64,0.2)]">
                      <Markdown>{chapter.content}</Markdown>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lexique */}
              {story.lexicon && story.lexicon.length > 0 && (
                <div className="mt-16 print:page-break-before-always print:py-12">
                  <h3 className="text-3xl font-serif font-bold text-brand-olive mb-6">Lexique</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {story.lexicon.map((item, index) => (
                      <div key={index} className="bg-brand-bg p-4 rounded-xl border border-brand-olive/10">
                        <span className="font-bold text-brand-ink">{item.word}</span>
                        <span className="text-brand-olive mx-2">→</span>
                        <span className="text-brand-ink/80">{item.translation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
