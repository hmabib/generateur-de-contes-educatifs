import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, ArrowRight, Check, AlertCircle, Loader2, Zap, Globe, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { ProviderType, setProviderConfig, OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODEL } from '../services/ai-provider';
import { validateOpenRouterKey } from '../services/openrouter';
import { Logo } from './Logo';

interface ProviderSetupProps {
  onComplete: () => void;
}

export function ProviderSetup({ onComplete }: ProviderSetupProps) {
  const [step, setStep] = useState<'choose' | 'configure'>('choose');
  const [provider, setProvider] = useState<ProviderType | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_OPENROUTER_MODEL);
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleProviderSelect = (p: ProviderType) => {
    setProvider(p);
    setApiKey('');
    setError('');
    setStep('configure');
  };

  const handleSubmit = async () => {
    if (!provider || !apiKey.trim()) return;

    setValidating(true);
    setError('');

    try {
      if (provider === 'openrouter') {
        const valid = await validateOpenRouterKey(apiKey.trim(), model);
        if (!valid) {
          setError('Clé API invalide ou modèle inaccessible. Vérifiez votre clé et réessayez.');
          setValidating(false);
          return;
        }
      }

      setProviderConfig({
        provider,
        apiKey: apiKey.trim(),
        model: provider === 'openrouter' ? model : undefined,
      });

      onComplete();
    } catch {
      setError('Impossible de valider la clé. Vérifiez votre connexion internet.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-brand-olive/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-olive-light/5 rounded-full blur-3xl"></div>

      <AnimatePresence mode="wait">
        {step === 'choose' ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-2xl w-full relative z-10"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-brand-accent/20 to-brand-olive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-olive/10"
              >
                <Logo size={56} />
              </motion.div>
              <h1 className="text-4xl font-serif font-bold text-brand-ink mb-3">
                Les Gardiens de la Terre
              </h1>
              <p className="text-lg text-brand-ink/60 max-w-md mx-auto">
                Choisissez votre fournisseur d'IA pour commencer à créer des histoires magiques.
              </p>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gemini Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSelect('gemini')}
                className="bg-white rounded-[1.5rem] p-7 border-2 border-transparent hover:border-brand-olive/30 shadow-sm hover:shadow-lg transition-all duration-300 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-md">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-ink">Google Gemini</h3>
                    <span className="text-xs font-medium text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-brand-ink/70 mb-5">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-brand-accent mt-0.5 shrink-0" />
                    <span>Génération de texte <strong>et d'images</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-brand-accent mt-0.5 shrink-0" />
                    <span>Illustrations personnalisées des personnages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-brand-accent mt-0.5 shrink-0" />
                    <span>Meilleure qualité pour les contes en français</span>
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-brand-olive font-medium group-hover:gap-3 transition-all">
                  <span>Configurer</span>
                  <ArrowRight size={16} />
                </div>
              </motion.button>

              {/* OpenRouter Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSelect('openrouter')}
                className="bg-white rounded-[1.5rem] p-7 border-2 border-transparent hover:border-brand-olive/30 shadow-sm hover:shadow-lg transition-all duration-300 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-ink">OpenRouter</h3>
                    <span className="text-xs font-medium text-brand-olive-light bg-brand-olive-light/10 px-2 py-0.5 rounded-full">
                      Multi-modèles
                    </span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-brand-ink/70 mb-5">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-brand-accent mt-0.5 shrink-0" />
                    <span>Accès à GPT-4o, Claude, Gemini, Llama...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-brand-accent mt-0.5 shrink-0" />
                    <span>Choix du modèle selon vos besoins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-brand-olive-light mt-0.5 shrink-0" />
                    <span>Génération de texte uniquement (pas d'images)</span>
                  </li>
                </ul>
                <div className="flex items-center gap-2 text-brand-olive font-medium group-hover:gap-3 transition-all">
                  <span>Configurer</span>
                  <ArrowRight size={16} />
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-md w-full relative z-10"
          >
            <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-brand-olive/10 relative overflow-hidden">
              {/* Top gradient bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-olive to-brand-olive-light"></div>

              {/* Back button */}
              <button
                onClick={() => { setStep('choose'); setError(''); }}
                className="text-sm text-brand-ink/50 hover:text-brand-olive transition-colors mb-6 flex items-center gap-1"
              >
                <ArrowRight size={14} className="rotate-180" />
                Retour au choix du fournisseur
              </button>

              {/* Provider icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${
                  provider === 'gemini'
                    ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {provider === 'gemini' ? (
                    <Zap className="w-7 h-7 text-white" />
                  ) : (
                    <Globe className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-brand-ink">
                    {provider === 'gemini' ? 'Google Gemini' : 'OpenRouter'}
                  </h2>
                  <p className="text-sm text-brand-ink/50">Entrez votre clé API</p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-brand-ink/60 uppercase tracking-widest mb-2">
                    <Key size={12} className="inline mr-1" />
                    Clé API
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                      placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-or-...'}
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 focus:border-transparent text-brand-ink placeholder:text-brand-ink/30 font-mono text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-ink/70 transition-colors"
                    >
                      {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Model selector for OpenRouter */}
                {provider === 'openrouter' && (
                  <div>
                    <label className="block text-xs font-bold text-brand-ink/60 uppercase tracking-widest mb-2">
                      <ChevronDown size={12} className="inline mr-1" />
                      Modèle
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-olive/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-olive/50 focus:border-transparent text-brand-ink text-sm appearance-none cursor-pointer"
                    >
                      {OPENROUTER_MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200"
                    >
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!apiKey.trim() || validating}
                  className="w-full bg-gradient-to-r from-brand-olive to-brand-olive-light text-white rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  {validating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Logo size={24} />
                      Commencer à créer
                    </>
                  )}
                </button>

                {/* Help link */}
                <p className="text-center text-xs text-brand-ink/40">
                  {provider === 'gemini' ? (
                    <>
                      Obtenez votre clé sur{' '}
                      <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-brand-olive hover:underline">
                        Google AI Studio
                      </a>
                    </>
                  ) : (
                    <>
                      Obtenez votre clé sur{' '}
                      <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-brand-olive hover:underline">
                        openrouter.ai/keys
                      </a>
                    </>
                  )}
                </p>

                {/* Info about key storage */}
                <p className="text-center text-xs text-brand-ink/30">
                  Votre clé est stockée localement dans votre navigateur uniquement.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
