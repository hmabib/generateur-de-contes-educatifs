import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Book, Trash2, Printer, Loader2, Download, Upload, FileText, Pencil, Eye } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BookPDF } from '../components/BookPDF';
import { StoryReader } from '../components/StoryReader';
import { exportToWord } from '../utils/exportWord';

interface Story {
  id: number;
  title: string;
  tomeNumber: string;
  content: string;
  imageUrl?: string;
  date: string;
  isStructured?: boolean;
  lexiconLanguage?: string;
}

type StoryData = {
  title: string;
  chapters: {
    chapterNumber: number;
    title: string;
    content: string;
    imagePrompt: string;
    imageUrl?: string;
  }[];
  lexicon: { word: string; translation: string; language?: string }[];
};

export function Library() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<StoryData | null>(null);
  const [exportingWord, setExportingWord] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

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
        setEditMode(false);
        setEditedData(null);
      }
    }
  };

  const handleExportAll = () => {
    const data = JSON.stringify(stories, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gardiens_stories_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('Format invalide');
        const existingIds = new Set(stories.map(s => s.id));
        const newStories = imported.filter((s: Story) => !existingIds.has(s.id));
        const merged = [...newStories, ...stories];
        setStories(merged);
        localStorage.setItem('gardiens_stories', JSON.stringify(merged));
        alert(`${newStories.length} tome(s) importé(s) avec succès !`);
      } catch {
        alert("Erreur lors de l'importation. Vérifiez le format du fichier.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getStoryData = (story: Story): StoryData | null => {
    if (!story.isStructured) return null;
    try {
      return JSON.parse(story.content);
    } catch {
      return null;
    }
  };

  // Get the current story data (edited or original)
  const getCurrentStoryData = (): StoryData | null => {
    if (!selectedStory) return null;
    if (editMode && editedData) return editedData;
    return getStoryData(selectedStory);
  };

  // Start editing
  const handleStartEdit = () => {
    if (!selectedStory) return;
    const data = getStoryData(selectedStory);
    if (data) {
      setEditedData(JSON.parse(JSON.stringify(data))); // deep clone
      setEditMode(true);
    }
  };

  // Save edits back to localStorage
  const handleSaveEdits = () => {
    if (!selectedStory || !editedData) return;
    const updatedStory = {
      ...selectedStory,
      content: JSON.stringify(editedData),
      title: editedData.title,
    };
    const updatedStories = stories.map(s =>
      s.id === selectedStory.id ? updatedStory : s
    );
    setStories(updatedStories);
    localStorage.setItem('gardiens_stories', JSON.stringify(updatedStories));
    setSelectedStory(updatedStory);
    setEditMode(false);
    setEditedData(null);
  };

  // Cancel edits
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedData(null);
  };

  // Handle story data change from StoryReader
  const handleStoryChange = (newData: StoryData) => {
    setEditedData(newData);
  };

  // Export to Word
  const handleExportWord = async () => {
    if (!selectedStory) return;
    const data = getCurrentStoryData();
    if (!data) return;

    setExportingWord(true);
    try {
      await exportToWord(
        data,
        selectedStory.tomeNumber,
        selectedStory.imageUrl || null,
        selectedStory.lexiconLanguage
      );
    } catch (err) {
      console.error('Erreur export Word:', err);
      alert("Erreur lors de l'export Word.");
    } finally {
      setExportingWord(false);
    }
  };

  // Select a story (reset edit mode)
  const handleSelectStory = (story: Story) => {
    setSelectedStory(story);
    setEditMode(false);
    setEditedData(null);
  };

  const currentData = getCurrentStoryData();

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
          Retrouvez toutes les aventures générées des Gardiens de la Terre.
        </p>
        {/* Export / Import */}
        {stories.length > 0 && (
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 bg-white text-brand-olive px-4 py-2 rounded-full font-medium hover:bg-brand-olive/10 transition-colors border border-brand-olive/20 text-sm"
            >
              <Download size={16} /> Exporter tout
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-2 bg-white text-brand-olive px-4 py-2 rounded-full font-medium hover:bg-brand-olive/10 transition-colors border border-brand-olive/20 text-sm"
            >
              <Upload size={16} /> Importer
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 print:block print:gap-0">
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-brand-olive/10 overflow-hidden flex flex-col print:hidden">
          <div className="p-6 border-b border-brand-olive/10 bg-brand-bg/50 shrink-0">
            <h2 className="text-xl font-serif font-bold text-brand-ink flex items-center gap-3">
              <div className="p-2 bg-brand-olive/10 rounded-xl text-brand-olive">
                <Book size={20} />
              </div>
              Tomes Sauvegardés
              <span className="text-sm font-mono text-brand-ink/40 font-normal ml-auto">{stories.length}</span>
            </h2>
          </div>

          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {stories.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-brand-olive-light italic mb-4">
                  Aucun tome sauvegardé pour le moment.
                </p>
                <button
                  onClick={() => importRef.current?.click()}
                  className="text-brand-olive text-sm font-medium underline"
                >
                  Importer des histoires
                </button>
              </div>
            ) : (
              stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => handleSelectStory(story)}
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
              <div className="p-8 border-b border-brand-olive/10 bg-brand-bg/30 shrink-0 print:hidden mt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-bold text-brand-olive uppercase tracking-widest mb-2 block">
                      Tome {selectedStory.tomeNumber}
                    </span>
                    <h2 className="text-4xl font-serif font-bold text-brand-ink">
                      {editMode && editedData ? editedData.title : selectedStory.title}
                    </h2>
                  </div>

                  {/* Edit / View toggle */}
                  {selectedStory.isStructured && (
                    <div className="flex items-center gap-2">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleSaveEdits}
                            className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-full font-medium hover:bg-brand-accent/80 transition-colors text-sm"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 bg-white text-brand-ink/60 px-4 py-2 rounded-full font-medium hover:bg-brand-bg transition-colors border border-brand-olive/20 text-sm"
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleStartEdit}
                          className="flex items-center gap-2 bg-white text-brand-olive px-4 py-2 rounded-full font-medium hover:bg-brand-olive/10 transition-colors border border-brand-olive/20 text-sm"
                        >
                          <Pencil size={16} />
                          Modifier
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Export buttons */}
                {selectedStory.isStructured && currentData && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <PDFDownloadLink
                      document={<BookPDF story={currentData} tomeNumber={selectedStory.tomeNumber} groupImage={selectedStory.imageUrl || null} lexiconLanguage={selectedStory.lexiconLanguage} />}
                      fileName={`Les_Gardiens_Tome_${selectedStory.tomeNumber}.pdf`}
                      className="flex items-center gap-2 bg-white text-brand-olive px-4 py-2 rounded-full font-medium hover:bg-brand-olive/10 transition-colors border border-brand-olive/20 text-sm"
                    >
                      {({ loading }) => (
                        <>
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                          {loading ? 'PDF...' : 'Exporter PDF'}
                        </>
                      )}
                    </PDFDownloadLink>
                    <button
                      onClick={handleExportWord}
                      disabled={exportingWord}
                      className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors border border-blue-200 text-sm disabled:opacity-50"
                    >
                      {exportingWord ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                      {exportingWord ? 'Word...' : 'Exporter Word'}
                    </button>
                    {editMode && (
                      <span className="flex items-center gap-1 text-xs text-brand-accent font-medium px-3 py-1 bg-brand-accent/10 rounded-full">
                        <Eye size={14} />
                        Mode édition — Modifiez le texte puis exportez
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="p-8 overflow-y-auto flex-1 print:p-0 print:overflow-visible">
                {(() => {
                  const data = currentData;
                  if (data) {
                    return (
                      <div>
                        {selectedStory.imageUrl && (
                          <img
                            src={selectedStory.imageUrl}
                            alt="Illustration de couverture"
                            className="w-full max-w-2xl h-auto rounded-2xl shadow-md border border-brand-olive/20 mb-8 print:shadow-none print:border-none"
                          />
                        )}
                        <StoryReader
                          story={data}
                          tomeNumber={selectedStory.tomeNumber}
                          editable={editMode}
                          onStoryChange={handleStoryChange}
                          lexiconLanguage={selectedStory.lexiconLanguage}
                        />
                      </div>
                    );
                  }
                  // Fallback for old unstructured stories
                  return (
                    <div className="prose prose-stone prose-lg max-w-none font-serif prose-headings:font-serif prose-headings:text-brand-olive prose-a:text-brand-olive">
                      {selectedStory.imageUrl && (
                        <div className="mb-8 flex justify-center">
                          <img
                            src={selectedStory.imageUrl}
                            alt="Illustration"
                            className="max-w-xs w-full h-auto rounded-2xl shadow-sm border border-brand-olive/20"
                          />
                        </div>
                      )}
                      <div dangerouslySetInnerHTML={{ __html: selectedStory.content }} />
                    </div>
                  );
                })()}
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
