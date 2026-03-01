import { motion } from 'motion/react';
import { BookOpen, Users, Globe, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-16 py-8"
    >
      <header className="text-center space-y-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-olive-light/20 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-6xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-brand-olive to-brand-olive-light pb-2">
          Générateur de Contes Éducatifs
        </h1>
        <p className="text-2xl text-brand-ink/70 font-light max-w-2xl mx-auto leading-relaxed">
          Créez des histoires illustrées personnalisées pour enfants, ancrées dans la culture africaine.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/personnages" className="group">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-olive/10 hover:border-brand-olive/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-olive/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-14 h-14 bg-brand-olive/10 rounded-2xl flex items-center justify-center text-brand-olive mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
              <Users size={28} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3 text-brand-ink relative z-10">Les Personnages</h2>
            <p className="text-brand-ink/70 leading-relaxed relative z-10">
              Découvrez Oswalda, Nkôlo, Madiba et les autres. 7 enfants, 7 langues, 7 compétences uniques pour sauver leur monde.
            </p>
          </div>
        </Link>

        <Link to="/univers" className="group">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-olive/10 hover:border-brand-olive/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-accent/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 relative z-10">
              <Globe size={28} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3 text-brand-ink relative z-10">L'Univers</h2>
            <p className="text-brand-ink/70 leading-relaxed relative z-10">
              Explorez le village de Nkonté, le Fromager sacré, et les éléments naturels qui rythment les aventures.
            </p>
          </div>
        </Link>

        <Link to="/generateur" className="group md:col-span-2">
          <div className="bg-gradient-to-br from-brand-olive to-brand-olive-light p-10 rounded-[2rem] shadow-lg text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10 shadow-inner">
              <PenTool size={36} className="text-white" />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-4xl font-serif font-bold mb-4">Générateur de Tomes</h2>
              <p className="text-white/90 text-xl font-light leading-relaxed max-w-2xl">
                Utilisez l'intelligence artificielle pour générer de nouvelles aventures en respectant la structure narrative en 7 actes et l'ADN de la série.
              </p>
            </div>
          </div>
        </Link>
      </div>

      <section className="bg-white p-10 rounded-[2rem] border border-brand-olive/10 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 w-2 h-full bg-brand-olive"></div>
        <h3 className="text-3xl font-serif font-bold mb-8 text-brand-ink flex items-center gap-4">
          <div className="p-3 bg-brand-olive/10 rounded-xl text-brand-olive">
            <BookOpen size={28} />
          </div>
          L'ADN de la Collection
        </h3>
        <ul className="space-y-6 text-brand-ink/80 text-lg">
          <li className="flex gap-4 items-start">
            <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold mt-1">1</span>
            <span><strong className="text-brand-ink">Cible :</strong> Enfants de 6 à 12 ans (adaptable).</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold mt-1">2</span>
            <span><strong className="text-brand-ink">Cadre :</strong> Cameroun, village fictif de Nkonté.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold mt-1">3</span>
            <span><strong className="text-brand-ink">Concept :</strong> 6 enfants récurrents et 1 personnage invité qui change à chaque tome, ambassadeurs de 6 langues (ewondo, duala, fufulde, fèfè, bassa, sango) et d'une langue de lien.</span>
          </li>
          <li className="flex gap-4 items-start">
            <span className="w-8 h-8 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center shrink-0 font-bold mt-1">4</span>
            <span><strong className="text-brand-ink">Structure :</strong> Chaque aventure suit un template strict en 7 actes, guidée par le sage Papa Yosep.</span>
          </li>
        </ul>
      </section>
    </motion.div>
  );
}
