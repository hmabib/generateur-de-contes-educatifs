import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, TreePine, Droplets, Wind, Sprout, Plus, Trash2 } from 'lucide-react';
import { getUniverses, saveUniverses } from '../data/universes';

export function World() {
  const [universes, setUniverses] = useState(getUniverses());
  const [isAdding, setIsAdding] = useState(false);
  const [newUniverse, setNewUniverse] = useState({ name: '', description: '' });

  const handleAddUniverse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniverse.name) return;
    
    const updatedUniverses = [...universes, { ...newUniverse, id: Date.now() }];
    setUniverses(updatedUniverses);
    saveUniverses(updatedUniverses);
    setNewUniverse({ name: '', description: '' });
    setIsAdding(false);
  };

  const handleDeleteUniverse = (id: number) => {
    const updatedUniverses = universes.filter((u: any) => u.id !== id);
    setUniverses(updatedUniverses);
    saveUniverses(updatedUniverses);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <header className="text-center space-y-6 flex flex-col md:flex-row justify-between items-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-olive-light/20 rounded-full blur-3xl -z-10"></div>
        <div className="text-left">
          <h1 className="text-6xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-brand-olive to-brand-olive-light pb-2">
            Les Univers
          </h1>
          <p className="text-2xl text-brand-ink/70 font-light max-w-2xl mt-4 leading-relaxed">
            Explorez les lieux emblématiques qui rythment les aventures des Gardiens.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gradient-to-r from-brand-olive to-brand-olive-light text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium whitespace-nowrap"
        >
          <Plus size={20} />
          Nouveau Lieu
        </button>
      </header>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAddUniverse} 
          className="bg-white p-6 rounded-3xl shadow-sm border border-brand-olive/10 space-y-4"
        >
          <h3 className="text-xl font-serif font-bold text-brand-olive">Ajouter un nouveau lieu</h3>
          <div>
            <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Nom du lieu</label>
            <input
              type="text"
              value={newUniverse.name}
              onChange={(e) => setNewUniverse({...newUniverse, name: e.target.value})}
              className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-olive-light uppercase tracking-widest mb-1">Description</label>
            <textarea
              value={newUniverse.description}
              onChange={(e) => setNewUniverse({...newUniverse, description: e.target.value})}
              className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-brand-olive-light hover:text-brand-ink">Annuler</button>
            <button type="submit" className="bg-brand-olive text-white px-4 py-2 rounded-xl hover:bg-brand-olive-light">Enregistrer</button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {universes.map((universe: any) => (
          <div key={universe.id} className="bg-white p-10 rounded-[2rem] shadow-sm border border-brand-olive/10 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-olive/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className="w-14 h-14 bg-brand-olive/10 rounded-2xl flex items-center justify-center text-brand-olive group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <MapPin size={28} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-brand-ink">{universe.name}</h2>
            </div>
            <p className="text-brand-ink/70 leading-relaxed text-lg relative z-10">
              {universe.description}
            </p>
            {universe.id > 2 && (
              <button 
                onClick={() => handleDeleteUniverse(universe.id)}
                className="absolute top-6 right-6 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-2.5 rounded-full hover:bg-red-100 z-20"
                title="Supprimer ce lieu"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <h2 className="text-3xl font-serif font-bold text-brand-olive text-center">
          Variations par Tome
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-olive/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-10" />
            <span className="text-xs uppercase tracking-widest text-brand-olive-light font-bold mb-2 block">Tome 1 (Modèle)</span>
            <h3 className="text-2xl font-serif font-bold text-brand-ink mb-4">L'Eau</h3>
            <ul className="space-y-2 text-sm text-brand-ink/80">
              <li><strong>Élément :</strong> Rivière Wouri</li>
              <li><strong>Problème :</strong> Pollution plastique</li>
              <li><strong>Focus :</strong> Madiba</li>
              <li><strong>Secret :</strong> La terre ne nous appartient pas</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-olive/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -z-10" />
            <span className="text-xs uppercase tracking-widest text-brand-olive-light font-bold mb-2 block">Possible Tome 2</span>
            <h3 className="text-2xl font-serif font-bold text-brand-ink mb-4">La Forêt</h3>
            <ul className="space-y-2 text-sm text-brand-ink/80">
              <li><strong>Élément :</strong> Forêt sacrée</li>
              <li><strong>Problème :</strong> Déforestation</li>
              <li><strong>Focus :</strong> Sango</li>
              <li><strong>Secret :</strong> Un arbre abattu, c'est une mémoire perdue</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-olive/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -z-10" />
            <span className="text-xs uppercase tracking-widest text-brand-olive-light font-bold mb-2 block">Possible Tome 3</span>
            <h3 className="text-2xl font-serif font-bold text-brand-ink mb-4">La Terre</h3>
            <ul className="space-y-2 text-sm text-brand-ink/80">
              <li><strong>Élément :</strong> Champs cultivés</li>
              <li><strong>Problème :</strong> Pesticides/sécheresse</li>
              <li><strong>Focus :</strong> Aminata</li>
              <li><strong>Secret :</strong> Qui nourrit la terre sera nourri</li>
            </ul>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
