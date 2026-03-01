import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Book, Trash2, Printer, Loader2, Download, Upload, FileText,
  Pencil, Eye, X, ChevronLeft, ChevronRight, Search, SlidersHorizontal,
  BookOpen, User, MapPin, Calendar, Save, ArrowLeft, Palette
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BookPDF } from '../components/BookPDF';
import { StoryReader } from '../components/StoryReader';
import { exportToWord } from '../utils/exportWord';
import { getTomeTheme, tomeThemes } from '../data/tomeThemes';

interface Story {
  id: number;
  title: string;
  tomeNumber: string;
  tomeTheme?: string;
  content: string;
  imageUrl?: string;
  date: string;
  isStructured?: boolean;
  lexiconLanguage?: string;
  // Enhanced metadata
  guestName?: string;
  guestStyle?: string;
  guestImage?: string | null;
  country?: string;
  ageRange?: string;
  synopsis?: string;
  theme?: string;
  chapterCount?: number;
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

type ViewMode = 'grid' | 'reader' | 'edit';

export function Library() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editedData, setEditedData] = useState<StoryData | null>(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState<Partial<Story>>({});
  const [exportingWord, setExportingWord] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [readerPage, setReaderPage] = useState(0);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    const saved = JSON.parse(localStorage.getItem('gardiens_stories') || '[]');
    setStories(saved.reverse());
  };

  const saveStories = (updated: Story[]) => {
    setStories(updated);
    // Store in original order (not reversed)
    localStorage.setItem('gardiens_stories', JSON.stringify([...updated].reverse()));
  };

  const handleDelete = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cette histoire ?')) {
      const updated = stories.filter(s => s.id !== id);
      saveStories(updated);
      if (selectedStory?.id === id) {
        setSelectedStory(null);
        setViewMode('grid');
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
        saveStories(merged);
        alert(`${newStories.length} histoire(s) importée(s) avec succès !`);
      } catch {
        alert("Erreur lors de l'importation. Vérifiez le format du fichier.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getStoryData = (story: Story): StoryData | null => {
    if (!story.isStructured) return null;
    try { return JSON.parse(story.content); } catch { return null; }
  };

  const getCurrentStoryData = (): StoryData | null => {
    if (!selectedStory) return null;
    if (viewMode === 'edit' && editedData) return editedData;
    return getStoryData(selectedStory);
  };

  const getSynopsis = (story: Story): string => {
    if (story.synopsis) return story.synopsis;
    const data = getStoryData(story);
    if (data && data.chapters[0]) {
      return data.chapters[0].content.slice(0, 150).replace(/\n/g, ' ').trim() + '...';
    }
    return '';
  };

  // ─── Open story in reader ───
  const openReader = (story: Story) => {
    setSelectedStory(story);
    setReaderPage(0);
    setViewMode('reader');
    setEditedData(null);
  };

  // ─── Open story in edit mode ───
  const openEditor = (story: Story) => {
    const data = getStoryData(story);
    if (data) {
      setSelectedStory(story);
      setEditedData(JSON.parse(JSON.stringify(data)));
      setViewMode('edit');
    }
  };

  // ─── Save edits ───
  const handleSaveEdits = () => {
    if (!selectedStory || !editedData) return;
    const synopsis = editedData.chapters[0]?.content.slice(0, 200).replace(/\n/g, ' ').trim() + '...' || '';
    const updatedStory: Story = {
      ...selectedStory,
      content: JSON.stringify(editedData),
      title: editedData.title,
      synopsis,
    };
    const updated = stories.map(s => s.id === selectedStory.id ? updatedStory : s);
    saveStories(updated);
    setSelectedStory(updatedStory);
    setViewMode('reader');
    setEditedData(null);
  };

  // ─── Edit metadata ───
  const startEditMeta = () => {
    if (!selectedStory) return;
    setMetaForm({
      tomeTheme: selectedStory.tomeTheme || 'neutre',
      guestName: selectedStory.guestName || '',
      guestStyle: selectedStory.guestStyle || '',
      country: selectedStory.country || '',
      ageRange: selectedStory.ageRange || '',
      theme: selectedStory.theme || '',
    });
    setEditingMeta(true);
  };

  const saveMetaEdits = () => {
    if (!selectedStory) return;
    const updatedStory = { ...selectedStory, ...metaForm };
    const updated = stories.map(s => s.id === selectedStory.id ? updatedStory : s);
    saveStories(updated);
    setSelectedStory(updatedStory);
    setEditingMeta(false);
  };

  // ─── Word export ───
  const handleExportWord = async () => {
    if (!selectedStory) return;
    const data = getCurrentStoryData();
    if (!data) return;
    setExportingWord(true);
    try {
      await exportToWord(data, selectedStory.tomeNumber, selectedStory.imageUrl || null, selectedStory.lexiconLanguage);
    } catch (err) {
      console.error('Erreur export Word:', err);
      alert("Erreur lors de l'export Word.");
    } finally {
      setExportingWord(false);
    }
  };

  // ─── Back to grid ───
  const backToGrid = () => {
    setViewMode('grid');
    setSelectedStory(null);
    setEditedData(null);
    setEditingMeta(false);
  };

  // ─── Filters ───
  const countries = [...new Set(stories.map(s => s.country).filter(Boolean))];
  const filteredStories = stories.filter(s => {
    const matchSearch = !searchTerm ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.theme || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCountry = !filterCountry || s.country === filterCountry;
    return matchSearch && matchCountry;
  });

  // ─── Reader page navigation ───
  const currentData = getCurrentStoryData();
  const totalPages = currentData ? currentData.chapters.length : 0;

  // ═══════════════════════════════════════════════════════
  // RENDER: READER / EDITOR MODE
  // ═══════════════════════════════════════════════════════
  if (viewMode !== 'grid' && selectedStory) {
    const data = currentData;
    const isEdit = viewMode === 'edit';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-6rem)] flex flex-col"
      >
        {/* ─── Top bar ─── */}
        <div className="bg-white border-b border-brand-olive/10 px-6 py-3 flex items-center gap-4 shrink-0">
          <button onClick={backToGrid} className="flex items-center gap-2 text-brand-olive hover:text-brand-olive-light transition-colors font-medium">
            <ArrowLeft size={20} />
            Bibliothèque
          </button>
          <div className="h-6 w-px bg-brand-olive/20" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-serif font-bold text-brand-ink truncate">{isEdit && editedData ? editedData.title : selectedStory.title}</h2>
            <div className="flex items-center gap-3 text-xs text-brand-ink/50">
              {selectedStory.guestName && <span className="flex items-center gap-1"><User size={12} /> {selectedStory.guestName}</span>}
              {selectedStory.country && <span className="flex items-center gap-1"><MapPin size={12} /> {selectedStory.country}</span>}
              {(() => { const t = getTomeTheme(selectedStory.tomeTheme || ''); return t ? <span className="flex items-center gap-1"><Palette size={12} /> {t.name}</span> : null; })()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isEdit ? (
              <>
                <button onClick={handleSaveEdits} className="flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-accent/80 transition-colors">
                  <Save size={16} /> Sauvegarder
                </button>
                <button onClick={() => { setViewMode('reader'); setEditedData(null); }} className="flex items-center gap-2 bg-white text-brand-ink/60 px-4 py-2 rounded-full text-sm font-medium border border-brand-olive/20 hover:bg-brand-bg transition-colors">
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openEditor(selectedStory)} className="flex items-center gap-2 bg-white text-brand-olive px-3 py-2 rounded-full text-sm font-medium border border-brand-olive/20 hover:bg-brand-olive/10 transition-colors">
                  <Pencil size={14} /> Modifier
                </button>
                <button onClick={startEditMeta} className="flex items-center gap-2 bg-white text-brand-olive px-3 py-2 rounded-full text-sm font-medium border border-brand-olive/20 hover:bg-brand-olive/10 transition-colors">
                  <SlidersHorizontal size={14} /> Références
                </button>
                {data && (
                  <PDFDownloadLink
                    document={<BookPDF story={data} tomeNumber={selectedStory.tomeNumber} groupImage={selectedStory.imageUrl || null} lexiconLanguage={selectedStory.lexiconLanguage} />}
                    fileName={`Les_Gardiens_${selectedStory.title.replace(/\s+/g, '_')}.pdf`}
                    className="flex items-center gap-2 bg-white text-brand-olive px-3 py-2 rounded-full text-sm font-medium border border-brand-olive/20 hover:bg-brand-olive/10 transition-colors"
                  >
                    {({ loading }) => (<>{loading ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} PDF</>)}
                  </PDFDownloadLink>
                )}
                <button onClick={handleExportWord} disabled={exportingWord} className="flex items-center gap-2 bg-white text-blue-600 px-3 py-2 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50">
                  {exportingWord ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Word
                </button>
                <button onClick={() => handleDelete(selectedStory.id)} className="flex items-center gap-2 bg-white text-red-500 px-3 py-2 rounded-full text-sm font-medium border border-red-200 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ─── Edit metadata modal ─── */}
        <AnimatePresence>
          {editingMeta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setEditingMeta(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-serif font-bold text-brand-ink">Modifier les références</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Variation thématique</label>
                    <select value={metaForm.tomeTheme || 'neutre'} onChange={e => setMetaForm({ ...metaForm, tomeTheme: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50">
                      {tomeThemes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Pays</label>
                    <input value={metaForm.country || ''} onChange={e => setMetaForm({ ...metaForm, country: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Personnage invité</label>
                  <input value={metaForm.guestName || ''} onChange={e => setMetaForm({ ...metaForm, guestName: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Description de l'invité</label>
                  <textarea value={metaForm.guestStyle || ''} onChange={e => setMetaForm({ ...metaForm, guestStyle: e.target.value })} rows={2}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Tranche d'âge</label>
                    <input value={metaForm.ageRange || ''} onChange={e => setMetaForm({ ...metaForm, ageRange: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Thème</label>
                    <input value={metaForm.theme || ''} onChange={e => setMetaForm({ ...metaForm, theme: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={saveMetaEdits} className="flex-1 bg-brand-olive text-white py-3 rounded-xl font-bold hover:bg-brand-olive-light transition-colors">
                    Enregistrer
                  </button>
                  <button onClick={() => setEditingMeta(false)} className="flex-1 bg-brand-bg text-brand-ink py-3 rounded-xl font-bold hover:bg-brand-olive/10 transition-colors">
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Content area ─── */}
        <div className="flex-1 overflow-hidden">
          {data ? (
            <div className="h-full flex flex-col">
              {/* Reader navigation (only in reader mode) */}
              {!isEdit && (
                <div className="bg-brand-bg/50 border-b border-brand-olive/10 px-6 py-2 flex items-center justify-between shrink-0">
                  <button onClick={() => setReaderPage(Math.max(0, readerPage - 1))} disabled={readerPage === 0}
                    className="p-2 rounded-full hover:bg-white transition-colors disabled:opacity-30">
                    <ChevronLeft size={20} className="text-brand-olive" />
                  </button>
                  <div className="flex items-center gap-3">
                    {data.chapters.map((_, i) => (
                      <button key={i} onClick={() => setReaderPage(i)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                          readerPage === i
                            ? 'bg-brand-olive text-white scale-110 shadow-md'
                            : 'bg-white text-brand-ink/50 hover:bg-brand-olive/10 border border-brand-olive/10'
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                    {data.lexicon?.length > 0 && (
                      <button onClick={() => setReaderPage(totalPages)}
                        className={`px-3 h-8 rounded-full text-xs font-bold transition-all ${
                          readerPage === totalPages
                            ? 'bg-brand-olive text-white scale-110 shadow-md'
                            : 'bg-white text-brand-ink/50 hover:bg-brand-olive/10 border border-brand-olive/10'
                        }`}>
                        📖
                      </button>
                    )}
                  </div>
                  <button onClick={() => setReaderPage(Math.min(totalPages, readerPage + 1))} disabled={readerPage >= totalPages}
                    className="p-2 rounded-full hover:bg-white transition-colors disabled:opacity-30">
                    <ChevronRight size={20} className="text-brand-olive" />
                  </button>
                </div>
              )}

              {/* Page content */}
              <div className="flex-1 overflow-y-auto">
                {isEdit ? (
                  <div className="max-w-4xl mx-auto p-8">
                    {selectedStory.imageUrl && (
                      <img src={selectedStory.imageUrl} alt="Couverture" className="w-full max-w-2xl h-auto rounded-2xl shadow-md border border-brand-olive/20 mb-8 mx-auto" />
                    )}
                    <StoryReader
                      story={editedData!}
                      tomeNumber={selectedStory.tomeNumber}
                      editable={true}
                      onStoryChange={(d) => setEditedData(d)}
                      lexiconLanguage={selectedStory.lexiconLanguage}
                    />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={readerPage}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="max-w-5xl mx-auto p-8"
                    >
                      {readerPage === 0 && selectedStory.imageUrl && (
                        <img src={selectedStory.imageUrl} alt="Couverture" className="w-full max-w-lg h-auto rounded-2xl shadow-lg border border-brand-olive/20 mb-8 mx-auto" />
                      )}

                      {readerPage < totalPages ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-brand-olive/10 p-10">
                          {/* Chapter image */}
                          {data.chapters[readerPage].imageUrl && (
                            <img src={data.chapters[readerPage].imageUrl} alt={data.chapters[readerPage].title}
                              className="w-full max-w-lg h-auto rounded-2xl shadow-md border border-brand-olive/20 mb-8 mx-auto" />
                          )}
                          {/* Chapter header */}
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-brand-olive/10 rounded-full flex items-center justify-center text-brand-olive font-serif font-bold text-lg shrink-0">
                              {readerPage + 1}
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-brand-ink">{data.chapters[readerPage].title}</h3>
                          </div>
                          <div className="w-16 h-0.5 bg-brand-olive-light/50 mb-8" />
                          {/* Chapter text */}
                          <div className="prose prose-stone prose-lg max-w-none font-serif text-brand-ink leading-relaxed
                            prose-p:mb-4 prose-strong:text-brand-olive prose-em:text-brand-ink/80
                            prose-blockquote:border-brand-olive/30 prose-blockquote:text-brand-ink/70
                            first:prose-p:first-letter:text-5xl first:prose-p:first-letter:font-serif first:prose-p:first-letter:text-brand-olive first:prose-p:first-letter:float-left first:prose-p:first-letter:mr-3 first:prose-p:first-letter:mt-1 first:prose-p:first-letter:font-bold">
                            {/* Render markdown manually with react-markdown */}
                            {data.chapters[readerPage].content.split('\n').filter(p => p.trim()).map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Lexicon page */
                        data.lexicon?.length > 0 && (
                          <div className="bg-white rounded-2xl shadow-sm border border-brand-olive/10 p-10">
                            <div className="text-center mb-8">
                              <p className="text-sm text-brand-olive uppercase tracking-[0.3em] mb-2">Vocabulaire</p>
                              <h3 className="text-3xl font-serif font-bold text-brand-ink">
                                Lexique{selectedStory.lexiconLanguage ? ` — ${selectedStory.lexiconLanguage}` : ''}
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {data.lexicon.map((item, i) => (
                                <div key={i} className="bg-gradient-to-br from-brand-bg to-white p-5 rounded-2xl border border-brand-olive/10 flex items-center gap-3">
                                  <span className="text-lg font-serif font-bold text-brand-olive">{item.word}</span>
                                  {(item.language || selectedStory.lexiconLanguage) && (
                                    <span className="text-xs text-brand-accent italic">({item.language || selectedStory.lexiconLanguage})</span>
                                  )}
                                  <span className="text-brand-ink/40 mx-2">→</span>
                                  <span className="text-brand-ink font-medium">{item.translation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          ) : (
            /* Old unstructured story fallback */
            <div className="p-8 overflow-y-auto h-full">
              <div className="prose prose-stone prose-lg max-w-none font-serif">
                {selectedStory.imageUrl && (
                  <div className="mb-8 flex justify-center">
                    <img src={selectedStory.imageUrl} alt="Illustration" className="max-w-xs w-full h-auto rounded-2xl shadow-sm border border-brand-olive/20" />
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: selectedStory.content }} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER: GRID VIEW (Main Library)
  // ═══════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* ─── Header ─── */}
      <header className="text-center space-y-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-olive-light/20 rounded-full blur-3xl -z-10" />
        <h1 className="text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-brand-olive to-brand-olive-light pb-2">
          La Bibliothèque
        </h1>
        <p className="text-xl text-brand-ink/70 font-light max-w-2xl mx-auto">
          {stories.length} {stories.length <= 1 ? 'histoire' : 'histoires'} dans votre collection
        </p>
      </header>

      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-brand-olive/10 p-4 shadow-sm">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un titre, personnage, thème..."
            className="w-full pl-10 pr-4 py-2.5 bg-brand-bg rounded-xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 text-sm"
          />
        </div>

        {/* Country filter */}
        {countries.length > 1 && (
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="bg-brand-bg border border-brand-olive/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
          >
            <option value="">Tous les pays</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <div className="h-8 w-px bg-brand-olive/10" />

        {/* Export / Import */}
        <button onClick={handleExportAll} disabled={stories.length === 0}
          className="flex items-center gap-2 bg-brand-bg text-brand-olive px-4 py-2.5 rounded-xl font-medium hover:bg-brand-olive/10 transition-colors text-sm disabled:opacity-50">
          <Download size={16} /> Exporter
        </button>
        <button onClick={() => importRef.current?.click()}
          className="flex items-center gap-2 bg-brand-bg text-brand-olive px-4 py-2.5 rounded-xl font-medium hover:bg-brand-olive/10 transition-colors text-sm">
          <Upload size={16} /> Importer
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      {/* ─── Story Grid ─── */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto mb-4 text-brand-olive/20" />
          <p className="text-xl font-serif text-brand-ink/40">
            {stories.length === 0 ? 'Aucune histoire sauvegardée.' : 'Aucun résultat trouvé.'}
          </p>
          {stories.length === 0 && (
            <p className="text-sm text-brand-ink/30 mt-2">Les histoires générées seront automatiquement ajoutées ici.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const synopsis = getSynopsis(story);
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                onClick={() => openReader(story)}
              >
                {/* Book cover image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-bg to-brand-olive/5 relative overflow-hidden">
                  {story.imageUrl ? (
                    <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book size={48} className="text-brand-olive/15" />
                    </div>
                  )}
                  {/* Overlay badge */}
                  {(() => { const t = getTomeTheme(story.tomeTheme || ''); return t && t.id !== 'neutre' ? (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold shadow-sm" style={{ color: t.color }}>
                      {t.icon} {t.name}
                    </div>
                  ) : null; })()}
                  {/* Quick actions overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4 gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openReader(story); }}
                      className="bg-white text-brand-olive px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-brand-bg transition-colors flex items-center gap-2">
                      <Eye size={14} /> Lire
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openEditor(story); }}
                      className="bg-white text-brand-ink px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-brand-bg transition-colors flex items-center gap-2">
                      <Pencil size={14} /> Modifier
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(story.id); }}
                      className="bg-white text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-serif font-bold text-brand-ink leading-tight line-clamp-2">
                    {story.title}
                  </h3>

                  {synopsis && (
                    <p className="text-sm text-brand-ink/50 line-clamp-2 leading-relaxed">
                      {synopsis}
                    </p>
                  )}

                  {/* Meta tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {story.guestName && (
                      <span className="inline-flex items-center gap-1 bg-brand-accent/10 text-brand-accent px-2.5 py-1 rounded-full text-xs font-medium">
                        <User size={12} /> {story.guestName}
                      </span>
                    )}
                    {story.country && (
                      <span className="inline-flex items-center gap-1 bg-brand-olive/10 text-brand-olive px-2.5 py-1 rounded-full text-xs font-medium">
                        <MapPin size={12} /> {story.country}
                      </span>
                    )}
                    {story.ageRange && (
                      <span className="inline-flex items-center gap-1 bg-brand-olive-light/10 text-brand-olive-light px-2.5 py-1 rounded-full text-xs font-medium">
                        {story.ageRange}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-brand-ink/30 pt-2 border-t border-brand-olive/5">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(story.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {story.chapterCount && (
                      <span>{story.chapterCount} séq.</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
