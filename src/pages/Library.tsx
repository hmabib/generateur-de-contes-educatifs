import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, Trash2, Printer, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BookPDF } from '../components/BookPDF';

interface Story {
  id: number;
  title: string;
  tomeNumber: string;
  content: string;
  imageUrl?: string;
  date: string;
  isStructured?: boolean;
}

type Chapter = {
  chapterNumber: number;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
};

type StoryData = {
  title: string;
  chapters: Chapter[];
  lexicon: { word: string; translation: string }[];
};

export function Library() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('gardiens_stories') || '[]');
    setStories(saved.reverse());
  }, []);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer ce tome ?')) {
      const updated = stories.filter(s => s.id !== id);
      setStories(updated);
      localStorage.setItem('gardiens_stories', JSON.stringify(updated));
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStoryContent = (story: Story) => {
    if (story.isStructured) {
      try {
        const data: StoryData = JSON.parse(story.content);
        return (
          <div className="space-y-16 print:space-y-0">
            {/* Couverture (Print & Screen) */}
            <div className="print:h-screen print:flex print:flex-col print:items-center print:justify-center print:page-break-after-always">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-serif font-bold text-brand-olive mb-4">Bibliothèque de Contes</h1>
                <h2 className="text-3xl font-serif text-brand-ink">Tome {story.tomeNumber}</h2>
                <h3 className="text-4xl font-serif font-bold text-brand-ink mt-4">{data.title}</h3>
              </div>

              {story.imageUrl && (
                <img 
                  src={story.imageUrl} 
                  alt="Illustration de couverture" 
                  className="w-full max-w-2xl h-auto rounded-2xl shadow-md border border-brand-olive/20 print:shadow-none print:border-none"
                />
              )}
            </div>

            {/* Séquences */}
            {data.chapters.map((chapter, index) => (
              <div key={index} className="print:page-break-after-always print:min-h-screen print:py-12">
                <h3 className="text-3xl font-serif font-bold text-brand-olive mb-6 print:hidden">
                  {chapter.title}
                </h3>
                
                {chapter.imageUrl && (
                  <img 
                    src={chapter.imageUrl} 
                    alt={`Illustration Séquence ${chapter.chapterNumber}`} 
                    className="w-full h-auto rounded-2xl shadow-md border border-brand-olive/20 mb-8 print:shadow-none print:border-none print:rounded-none print:mb-4"
                  />
                )}

                <div className="prose prose-stone prose-lg max-w-none font-serif text-brand-ink leading-relaxed print:text-black print:prose-p:leading-normal print:prose-p:mb-4 print:bg-[#fcf8f2] print:p-8 print:rounded-xl print:border-2 print:border-brand-olive/30 print:shadow-[4px_4px_0px_rgba(90,90,64,0.2)]">
                  <Markdown>{chapter.content}</Markdown>
                </div>
              </div>
            ))}

            {/* Lexique */}
            {data.lexicon && data.lexicon.length > 0 && (
              <div className="mt-16 print:page-break-before-always print:py-12">
                <h3 className="text-3xl font-serif font-bold text-brand-olive mb-6">Lexique</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.lexicon.map((item, index) => (
                    <div key={index} className="bg-brand-bg p-4 rounded-xl border border-brand-olive/10">
                      <span className="font-bold text-brand-ink">{item.word}</span>
                      <span className="text-brand-olive mx-2">→</span>
                      <span className="text-brand-ink/80">{item.translation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      } catch (e) {
        console.error("Failed to parse structured story", e);
        return <p>Erreur de lecture du tome.</p>;
      }
    }

    // Fallback for old unstructured stories
    return (
      <div className="prose prose-stone prose-lg max-w-none font-serif prose-headings:font-serif prose-headings:text-brand-olive prose-a:text-brand-olive">
        {story.imageUrl && (
          <div className="mb-8 flex justify-center">
            <img 
              src={story.imageUrl} 
              alt="Illustration" 
              className="max-w-xs w-full h-auto rounded-2xl shadow-sm border border-brand-olive/20"
            />
          </div>
        )}
        <Markdown>{story.content}</Markdown>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 h-[calc(100vh-8rem)] flex flex-col print:m-0 print:p-0 print:h-auto print:max-w-none print:space-y-0"
    >
      <header className="text-center space-y-4 shrink-0 print:hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-olive-light/20 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-brand-olive to-brand-olive-light pb-2">
          La Bibliothèque
        </h1>
        <p className="text-xl text-brand-ink/70 font-light max-w-2xl mx-auto">
          Retrouvez toutes les aventures générées des Gardiens de Nkonté.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 print:block print:gap-0">
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-brand-olive/10 overflow-hidden flex flex-col print:hidden">
          <div className="p-6 border-b border-brand-olive/10 bg-brand-bg/50 shrink-0">
            <h2 className="text-xl font-serif font-bold text-brand-ink flex items-center gap-3">
              <div className="p-2 bg-brand-olive/10 rounded-xl text-brand-olive">
                <Book size={20} />
              </div>
              Tomes Sauvegardés
            </h2>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {stories.length === 0 ? (
              <p className="text-center text-brand-olive-light italic p-4">
                Aucun tome sauvegardé pour le moment.
              </p>
            ) : (
              stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    selectedStory?.id === story.id
                      ? 'bg-gradient-to-r from-brand-olive to-brand-olive-light text-white border-transparent shadow-md shadow-brand-olive/20 scale-[1.02]'
                      : 'bg-white border-brand-olive/10 hover:border-brand-olive/30 hover:bg-brand-bg hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      selectedStory?.id === story.id ? 'text-white/80' : 'text-brand-olive-light'
                    }`}>
                      Tome {story.tomeNumber}
                    </span>
                    <button
                      onClick={(e) => handleDelete(story.id, e)}
                      className={`p-1 rounded-full transition-colors ${
                        selectedStory?.id === story.id
                          ? 'hover:bg-white/20 text-white/80'
                          : 'hover:bg-red-50 text-brand-ink/40 hover:text-red-500'
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className={`font-serif font-bold text-lg leading-tight ${
                    selectedStory?.id === story.id ? 'text-white' : 'text-brand-ink'
                  }`}>
                    {story.title}
                  </h3>
                  <p className={`text-xs mt-2 ${
                    selectedStory?.id === story.id ? 'text-white/60' : 'text-brand-ink/40'
                  }`}>
                    {new Date(story.date).toLocaleDateString('fr-FR')}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-sm border border-brand-olive/10 overflow-hidden flex flex-col print:border-none print:shadow-none print:w-full print:block relative">
          {selectedStory ? (
            <>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-olive to-brand-olive-light print:hidden"></div>
              <div className="p-8 border-b border-brand-olive/10 bg-brand-bg/30 shrink-0 flex justify-between items-center print:hidden mt-2">
                <div>
                  <span className="text-sm font-bold text-brand-olive uppercase tracking-widest mb-2 block">
                    Tome {selectedStory.tomeNumber}
                  </span>
                  <h2 className="text-4xl font-serif font-bold text-brand-ink">
                    {selectedStory.title}
                  </h2>
                </div>
                {selectedStory.isStructured && (
                  <PDFDownloadLink
                    document={<BookPDF story={JSON.parse(selectedStory.content)} tomeNumber={selectedStory.tomeNumber} groupImage={selectedStory.imageUrl || null} />}
                    fileName={`Les_Gardiens_de_Nkonte_Tome_${selectedStory.tomeNumber}.pdf`}
                    className="flex items-center gap-2 bg-white text-brand-olive px-4 py-2 rounded-full font-medium hover:bg-brand-olive/10 transition-colors border border-brand-olive/20"
                  >
                    {({ loading }) => (
                      <>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                        {loading ? 'Préparation PDF...' : 'Télécharger PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
              <div className="p-8 overflow-y-auto flex-1 print:p-0 print:overflow-visible">
                {renderStoryContent(selectedStory)}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-brand-olive-light p-8 text-center print:hidden">
              <Book size={48} className="mb-4 opacity-30" />
              <p className="text-xl font-serif">Sélectionnez un tome à lire</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
