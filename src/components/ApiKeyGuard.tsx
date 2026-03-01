import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

export function ApiKeyGuard({ children }: { children: React.ReactNode }) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          // @ts-ignore
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          // Fallback if not in AI Studio environment
          setHasKey(true);
        }
      } catch (err) {
        console.error("Error checking API key:", err);
        setHasKey(true); // Proceed anyway if error
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Assume success to avoid race condition
        setHasKey(true);
      }
    } catch (err) {
      console.error("Error selecting API key:", err);
    }
  };

  if (hasKey === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-brand-accent" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink mb-4">Clé API Requise</h1>
          <p className="text-brand-ink/70 mb-8">
            Pour générer des images de haute qualité et utiliser les modèles avancés, vous devez connecter votre propre clé API Gemini (issue d'un projet Google Cloud avec facturation activée).
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-6 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent/90 transition-colors"
          >
            Sélectionner ma clé API
          </button>
          <p className="mt-6 text-sm text-brand-ink/50">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-brand-accent">
              En savoir plus sur la facturation Gemini API
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
