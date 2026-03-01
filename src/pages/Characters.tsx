import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { getCharacters, saveCharacters, mentor, guestCharacterTemplate } from '../data/characters';
import { getUniverses, saveUniverses } from '../data/universes';
import { getGuestCharacters, deleteGuestCharacter, type GuestCharacter } from '../data/guestCharacters';
import { UserPlus, Upload, Plus, Pencil, Trash2, Map, Star, Calendar } from 'lucide-react';
import { get, set, del } from 'idb-keyval';

function CharacterImage({ id, defaultImage, name, className }: { id: string, defaultImage: string, name: string, className?: string }) {
  const [imageSrc, setImageSrc] = useState<string>(`/characters/${defaultImage}`);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    get(`character-image-${id}`).then((val) => {
      if (val) {
        setImageSrc(val);
      }
    });
  }, [id, defaultImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImageSrc(base64String);
      await set(`character-image-${id}`, base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative group w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      <img 
        src={imageSrc} 
        alt={name} 
        className="w-full h-full object-cover opacity-90"
        onError={(e) => {
          if (imageSrc.startsWith('/characters/') && imageSrc.endsWith('.jpg')) {
            setImageSrc(imageSrc.replace('.jpg', '.png'));
          } else if (imageSrc.startsWith('/characters/')) {
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent && !parent.querySelector('.fallback-text')) {
              const fallback = document.createElement('div');
              fallback.className = 'fallback-text text-brand-ink/40 text-sm italic p-4 text-center';
              fallback.innerText = `Image manquante. Cliquez pour uploader.`;
              parent.appendChild(fallback);
            }
          }
        }}
      />
      <div 
        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-white text-brand-ink px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg">
          <Upload size={16} />
          <span>Modifier</span>
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}

export function Characters() {
  const [characters, setCharactersList] = useState<any[]>([]);
  const [universes, setUniversesList] = useState<any[]>([]);
  const [guestChars, setGuestChars] = useState<GuestCharacter[]>([]);

  const [editingChar, setEditingChar] = useState<any | null>(null);
  const [editingUniverse, setEditingUniverse] = useState<any | null>(null);

  useEffect(() => {
    setCharactersList(getCharacters());
    setUniversesList(getUniverses());
    setGuestChars(getGuestCharacters());
  }, []);

  const handleDeleteGuest = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer ce personnage invité ?')) {
      deleteGuestCharacter(id);
      setGuestChars(getGuestCharacters());
    }
  };

  const handleSaveChar = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editingChar.id) {
      updated = characters.map(c => c.id === editingChar.id ? editingChar : c);
    } else {
      updated = [...characters, { ...editingChar, id: Date.now() }];
    }
    setCharactersList(updated);
    saveCharacters(updated);
    setEditingChar(null);
  };

  const handleDeleteChar = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce personnage ?")) {
      const updated = characters.filter(c => c.id !== id);
      setCharactersList(updated);
      saveCharacters(updated);
      await del(`character-image-${id}`);
    }
  };

  const handleSaveUniverse = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editingUniverse.id) {
      updated = universes.map(u => u.id === editingUniverse.id ? editingUniverse : u);
    } else {
      updated = [...universes, { ...editingUniverse, id: Date.now() }];
    }
    setUniversesList(updated);
    saveUniverses(updated);
    setEditingUniverse(null);
  };

  const handleDeleteUniverse = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet univers ?")) {
      const updated = universes.filter(u => u.id !== id);
      setUniversesList(updated);
      saveUniverses(updated);
      await del(`character-image-universe-${id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-16"
    >
      <header className="text-center space-y-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-olive-light/20 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-6xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-brand-olive to-brand-olive-light pb-2">
          Personnages & Univers
        </h1>
        <p className="text-2xl text-brand-ink/70 font-light max-w-2xl mx-auto leading-relaxed">
          Gérez les héros récurrents et les lieux emblématiques de vos aventures.
        </p>
      </header>

      {/* Personnages Section */}
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-serif font-bold text-brand-ink flex items-center gap-2">
            <UserPlus className="text-brand-olive" /> Personnages
          </h2>
          <button 
            onClick={() => setEditingChar({ name: '', origin: '', language: '', archetype: '', signature: '', description: '', imageFile: 'default.jpg' })}
            className="bg-gradient-to-r from-brand-olive to-brand-olive-light text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
          >
            <Plus size={20} /> Ajouter un personnage
          </button>
        </div>

        {/* Guest Character Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-olive/10 to-brand-olive-light/10 p-10 rounded-[2rem] shadow-sm border border-brand-olive/20 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-brand-olive/5 rounded-full blur-2xl"></div>
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shrink-0 text-brand-olive shadow-sm relative z-10">
            <UserPlus size={48} />
          </div>
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-4xl font-serif font-bold text-brand-olive">{guestCharacterTemplate.name}</h2>
              <span className="text-sm font-mono bg-white text-brand-olive px-4 py-1.5 rounded-full shadow-sm font-bold">
                {guestCharacterTemplate.language}
              </span>
            </div>
            <p className="text-brand-ink/80 font-medium mb-3 text-lg">{guestCharacterTemplate.archetype} • {guestCharacterTemplate.origin}</p>
            <p className="text-brand-ink/70 leading-relaxed text-lg">{guestCharacterTemplate.description}</p>
          </div>
        </motion.div>

        {/* Saved Guest Characters */}
        {guestChars.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-brand-ink flex items-center gap-2">
              <Star className="text-brand-olive-light" size={20} />
              Personnages Invités Sauvegardés
              <span className="text-sm font-mono text-brand-ink/40 font-normal ml-2">{guestChars.length}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guestChars.map((guest, i) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-brand-olive/10 hover:shadow-md transition-all duration-300 group/guest relative"
                >
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/guest:opacity-100 transition-opacity"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-start gap-4">
                    {guest.referenceImage ? (
                      <img
                        src={guest.referenceImage}
                        alt={guest.name}
                        className="w-16 h-16 rounded-xl object-cover border border-brand-olive/20 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-brand-olive/10 flex items-center justify-center text-brand-olive shrink-0">
                        <UserPlus size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-brand-ink text-lg truncate">{guest.name}</h4>
                      <p className="text-brand-ink/60 text-sm line-clamp-2 mt-1">{guest.style}</p>
                      <p className="text-brand-ink/40 text-xs mt-2 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(guest.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {characters.map((char, i) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-olive/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden relative group/card"
            >
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button onClick={() => setEditingChar(char)} className="bg-white/90 p-2.5 rounded-full text-brand-olive hover:bg-brand-olive hover:text-white shadow-md transition-colors">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDeleteChar(char.id)} className="bg-white/90 p-2.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white shadow-md transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Image Background / Header */}
              <div className="absolute top-0 left-0 right-0 h-64 bg-brand-bg/50 border-b border-brand-olive/10">
                <CharacterImage 
                  id={char.id.toString()} 
                  defaultImage={char.imageFile} 
                  name={char.name} 
                />
              </div>

              <div className="pt-64 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6 mt-4">
                  <h2 className="text-3xl font-serif font-bold text-brand-olive">{char.name}</h2>
                  <span className="text-sm font-mono bg-brand-olive/10 text-brand-olive px-3 py-1 rounded-full">
                    {char.language}
                  </span>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-brand-olive-light font-bold mb-1">Archétype</h3>
                    <p className="text-brand-ink font-medium">{char.archetype}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-brand-olive-light font-bold mb-1">Origine</h3>
                    <p className="text-brand-ink">{char.origin}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-brand-olive-light font-bold mb-1">Signature</h3>
                    <p className="text-brand-ink italic">"{char.signature}"</p>
                  </div>
                  
                  <div className="pt-4 border-t border-brand-olive/10">
                    <p className="text-brand-ink/80 text-sm leading-relaxed">{char.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-brand-olive text-white p-10 rounded-3xl shadow-sm flex flex-col md:flex-row gap-8 items-center relative overflow-hidden"
        >
          <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden">
            <CharacterImage 
              id="mentor" 
              defaultImage={mentor.imageFile} 
              name={mentor.name} 
              className="rounded-full"
            />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">{mentor.name}</h2>
            <p className="text-white/80 font-medium mb-4">{mentor.role}</p>
            <p className="text-white/90 leading-relaxed max-w-2xl">{mentor.description}</p>
          </div>
        </motion.div>
      </section>

      {/* Universes Section */}
      <section className="space-y-8 pt-8 border-t border-brand-olive/20">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-serif font-bold text-brand-ink flex items-center gap-2">
            <Map className="text-brand-olive" /> Univers
          </h2>
          <button 
            onClick={() => setEditingUniverse({ name: '', description: '', imageFile: 'default_universe.jpg' })}
            className="bg-brand-olive text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-olive-light transition-colors"
          >
            <Plus size={18} /> Ajouter un univers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {universes.map((univ, i) => (
            <motion.div
              key={univ.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-brand-olive/10 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden relative group/card"
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button onClick={() => setEditingUniverse(univ)} className="bg-white/90 p-2 rounded-full text-brand-olive hover:bg-brand-olive hover:text-white shadow-sm">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDeleteUniverse(univ.id)} className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white shadow-sm">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="absolute top-0 left-0 right-0 h-64 bg-brand-bg/50 border-b border-brand-olive/10">
                <CharacterImage 
                  id={`universe-${univ.id}`} 
                  defaultImage={univ.imageFile} 
                  name={univ.name} 
                />
              </div>

              <div className="pt-64 flex-1 flex flex-col">
                <h2 className="text-3xl font-serif font-bold text-brand-olive mb-4 mt-4">{univ.name}</h2>
                <p className="text-brand-ink/80 text-sm leading-relaxed">{univ.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Character Modal */}
      {editingChar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold text-brand-olive mb-6">
              {editingChar.id ? 'Modifier le personnage' : 'Nouveau personnage'}
            </h2>
            <form onSubmit={handleSaveChar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Nom</label>
                <input type="text" value={editingChar.name} onChange={e => setEditingChar({...editingChar, name: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Langue</label>
                <input type="text" value={editingChar.language} onChange={e => setEditingChar({...editingChar, language: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Archétype</label>
                <input type="text" value={editingChar.archetype} onChange={e => setEditingChar({...editingChar, archetype: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Origine</label>
                <input type="text" value={editingChar.origin} onChange={e => setEditingChar({...editingChar, origin: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Signature</label>
                <input type="text" value={editingChar.signature} onChange={e => setEditingChar({...editingChar, signature: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Description</label>
                <textarea value={editingChar.description} onChange={e => setEditingChar({...editingChar, description: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2 resize-none" rows={3} required />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setEditingChar(null)} className="px-6 py-2 rounded-xl border border-brand-olive/20 text-brand-ink">Annuler</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-brand-olive text-white">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universe Modal */}
      {editingUniverse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold text-brand-olive mb-6">
              {editingUniverse.id ? "Modifier l'univers" : "Nouvel univers"}
            </h2>
            <form onSubmit={handleSaveUniverse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Nom</label>
                <input type="text" value={editingUniverse.name} onChange={e => setEditingUniverse({...editingUniverse, name: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Description</label>
                <textarea value={editingUniverse.description} onChange={e => setEditingUniverse({...editingUniverse, description: e.target.value})} className="w-full border border-brand-olive/20 rounded-xl px-4 py-2 resize-none" rows={4} required />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setEditingUniverse(null)} className="px-6 py-2 rounded-xl border border-brand-olive/20 text-brand-ink">Annuler</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-brand-olive text-white">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

