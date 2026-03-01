import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Plus, Pencil, Trash2, X, Search, BookOpen, Globe } from 'lucide-react';
import {
  getDictionary, saveDictionary, getLanguages, saveLanguages,
  type DictionaryEntry, type DictionaryLanguage
} from '../data/dictionary';

export function Dictionary() {
  const [entries, setEntries] = useState<DictionaryEntry[]>(getDictionary());
  const [languages, setLanguages] = useState<DictionaryLanguage[]>(getLanguages());
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
  const [editingLang, setEditingLang] = useState<DictionaryLanguage | null>(null);
  const [activeTab, setActiveTab] = useState<'words' | 'languages'>('words');

  // Entry form state
  const [entryForm, setEntryForm] = useState({ word: '', translation: '', language: '', category: '' });
  // Language form state
  const [langForm, setLangForm] = useState({ id: '', name: '', region: '', country: '' });

  const filteredEntries = entries.filter(e => {
    const matchLang = selectedLang === 'all' || e.language === selectedLang;
    const matchSearch = !searchQuery ||
      e.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLang && matchSearch;
  });

  const handleSaveEntry = () => {
    if (!entryForm.word || !entryForm.translation || !entryForm.language) return;
    let updated: DictionaryEntry[];
    if (editingEntry) {
      updated = entries.map(e => e.id === editingEntry.id ? { ...editingEntry, ...entryForm } : e);
    } else {
      const newEntry: DictionaryEntry = { id: Date.now(), ...entryForm };
      updated = [...entries, newEntry];
    }
    setEntries(updated);
    saveDictionary(updated);
    setShowEntryModal(false);
    setEditingEntry(null);
    setEntryForm({ word: '', translation: '', language: '', category: '' });
  };

  const handleDeleteEntry = (id: number) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveDictionary(updated);
  };

  const handleEditEntry = (entry: DictionaryEntry) => {
    setEditingEntry(entry);
    setEntryForm({ word: entry.word, translation: entry.translation, language: entry.language, category: entry.category || '' });
    setShowEntryModal(true);
  };

  const handleSaveLang = () => {
    if (!langForm.name || !langForm.country) return;
    const id = langForm.id || langForm.name.toLowerCase().replace(/\s+/g, '-');
    let updated: DictionaryLanguage[];
    if (editingLang) {
      updated = languages.map(l => l.id === editingLang.id ? { ...langForm, id: editingLang.id } : l);
    } else {
      updated = [...languages, { ...langForm, id }];
    }
    setLanguages(updated);
    saveLanguages(updated);
    setShowLangModal(false);
    setEditingLang(null);
    setLangForm({ id: '', name: '', region: '', country: '' });
  };

  const handleDeleteLang = (id: string) => {
    const updated = languages.filter(l => l.id !== id);
    setLanguages(updated);
    saveLanguages(updated);
  };

  const handleImportFromStories = () => {
    const stories = JSON.parse(localStorage.getItem('gardiens_stories') || '[]');
    let imported = 0;
    const existingWords = new Set(entries.map(e => `${e.word.toLowerCase()}-${e.language}`));

    for (const story of stories) {
      try {
        const data = story.isStructured ? JSON.parse(story.content) : null;
        if (data?.lexicon) {
          for (const item of data.lexicon) {
            const key = `${item.word.toLowerCase()}-unknown`;
            if (!existingWords.has(key)) {
              entries.push({
                id: Date.now() + imported,
                word: item.word,
                translation: item.translation,
                language: 'unknown',
                category: 'importé',
              });
              existingWords.add(key);
              imported++;
            }
          }
        }
      } catch { /* skip */ }
    }

    if (imported > 0) {
      setEntries([...entries]);
      saveDictionary(entries);
      alert(`${imported} mot(s) importé(s) depuis vos histoires !`);
    } else {
      alert('Aucun nouveau mot trouvé dans vos histoires.');
    }
  };

  const langCounts = entries.reduce((acc, e) => {
    acc[e.language] = (acc[e.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="text-center space-y-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-olive pb-2">
          Dictionnaire
        </h1>
        <p className="text-xl text-brand-ink/70 font-light max-w-2xl mx-auto">
          Gérez votre bibliothèque de mots et de langues africaines.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-brand-olive/10 shadow-sm w-fit mx-auto">
        <button
          onClick={() => setActiveTab('words')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'words' ? 'bg-brand-olive text-white shadow-md' : 'text-brand-ink/60 hover:text-brand-olive'
          }`}
        >
          <BookOpen size={16} className="inline mr-2" />
          Mots ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'languages' ? 'bg-brand-olive text-white shadow-md' : 'text-brand-ink/60 hover:text-brand-olive'
          }`}
        >
          <Globe size={16} className="inline mr-2" />
          Langues ({languages.length})
        </button>
      </div>

      {activeTab === 'words' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/40" />
              <input
                type="text"
                placeholder="Rechercher un mot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-brand-olive/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
              />
            </div>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-white border border-brand-olive/15 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
            >
              <option value="all">Toutes les langues</option>
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({langCounts[l.id] || 0})</option>
              ))}
            </select>
            <button
              onClick={handleImportFromStories}
              className="px-4 py-3 bg-brand-bg text-brand-olive border border-brand-olive/20 rounded-xl font-medium hover:bg-brand-olive/10 transition-colors"
            >
              Importer des histoires
            </button>
            <button
              onClick={() => {
                setEditingEntry(null);
                setEntryForm({ word: '', translation: '', language: languages[0]?.id || '', category: '' });
                setShowEntryModal(true);
              }}
              className="px-4 py-3 bg-brand-olive text-white rounded-xl font-medium hover:bg-brand-olive-light transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Ajouter
            </button>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredEntries.map((entry) => {
                const lang = languages.find(l => l.id === entry.language);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-5 rounded-2xl border border-brand-olive/10 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-lg font-serif font-bold text-brand-olive">{entry.word}</span>
                        {entry.category && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full font-medium uppercase">
                            {entry.category}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditEntry(entry)} className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-ink/40 hover:text-brand-olive">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-brand-ink/40 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-brand-ink/60 text-sm italic mb-2">signifie</p>
                    <p className="text-brand-ink font-medium">{entry.translation}</p>
                    {lang && (
                      <p className="text-xs text-brand-ink/40 mt-3 flex items-center gap-1">
                        <Languages size={12} />
                        {lang.name} — {lang.country}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-16 text-brand-ink/40">
              <Languages size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-serif">Aucun mot trouvé.</p>
              <p className="text-sm mt-1">Ajoutez des mots ou modifiez vos filtres.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'languages' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingLang(null);
                setLangForm({ id: '', name: '', region: '', country: '' });
                setShowLangModal(true);
              }}
              className="px-4 py-3 bg-brand-olive text-white rounded-xl font-medium hover:bg-brand-olive-light transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Ajouter une langue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <div key={lang.id} className="bg-white p-5 rounded-2xl border border-brand-olive/10 shadow-sm group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-serif font-bold text-brand-ink">{lang.name}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingLang(lang);
                        setLangForm({ id: lang.id, name: lang.name, region: lang.region, country: lang.country });
                        setShowLangModal(true);
                      }}
                      className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-ink/40 hover:text-brand-olive"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteLang(lang.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-brand-ink/40 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-brand-ink/60">{lang.region} — {lang.country}</p>
                <p className="text-xs text-brand-olive mt-2 font-medium">{langCounts[lang.id] || 0} mot(s)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entry Modal */}
      <AnimatePresence>
        {showEntryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowEntryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-brand-ink">
                  {editingEntry ? 'Modifier le mot' : 'Ajouter un mot'}
                </h3>
                <button onClick={() => setShowEntryModal(false)} className="p-2 hover:bg-brand-bg rounded-xl text-brand-ink/40">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Mot</label>
                  <input
                    value={entryForm.word}
                    onChange={(e) => setEntryForm({ ...entryForm, word: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    placeholder="Ex: Mbolo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Traduction</label>
                  <input
                    value={entryForm.translation}
                    onChange={(e) => setEntryForm({ ...entryForm, translation: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    placeholder="Ex: Bonjour"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Langue</label>
                  <select
                    value={entryForm.language}
                    onChange={(e) => setEntryForm({ ...entryForm, language: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                  >
                    <option value="">-- Choisir --</option>
                    {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Catégorie (optionnel)</label>
                  <input
                    value={entryForm.category}
                    onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    placeholder="Ex: salutation, nature, valeur"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveEntry}
                disabled={!entryForm.word || !entryForm.translation || !entryForm.language}
                className="w-full mt-6 bg-brand-olive text-white rounded-xl py-3 font-bold hover:bg-brand-olive-light transition-colors disabled:opacity-50"
              >
                {editingEntry ? 'Enregistrer' : 'Ajouter'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {showLangModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowLangModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-brand-ink">
                  {editingLang ? 'Modifier la langue' : 'Ajouter une langue'}
                </h3>
                <button onClick={() => setShowLangModal(false)} className="p-2 hover:bg-brand-bg rounded-xl text-brand-ink/40">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Nom de la langue</label>
                  <input
                    value={langForm.name}
                    onChange={(e) => setLangForm({ ...langForm, name: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    placeholder="Ex: Wolof"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Région</label>
                  <input
                    value={langForm.region}
                    onChange={(e) => setLangForm({ ...langForm, region: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    placeholder="Ex: Dakar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Pays</label>
                  <input
                    value={langForm.country}
                    onChange={(e) => setLangForm({ ...langForm, country: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
                    placeholder="Ex: Sénégal"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveLang}
                disabled={!langForm.name || !langForm.country}
                className="w-full mt-6 bg-brand-olive text-white rounded-xl py-3 font-bold hover:bg-brand-olive-light transition-colors disabled:opacity-50"
              >
                {editingLang ? 'Enregistrer' : 'Ajouter'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
