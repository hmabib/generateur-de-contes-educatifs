import { NavLink } from 'react-router-dom';
import { Home, Users, Globe, PenTool, Library, Sparkles, Settings, LogOut, Zap } from 'lucide-react';
import { getProviderConfig, clearProviderConfig } from '../services/ai-provider';

interface SidebarProps {
  onResetProvider: () => void;
}

export function Sidebar({ onResetProvider }: SidebarProps) {
  const config = getProviderConfig();

  const links = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/personnages', icon: Users, label: 'Personnages' },
    { to: '/univers', icon: Globe, label: 'Univers' },
    { to: '/generateur', icon: PenTool, label: 'G\u00e9n\u00e9rateur' },
    { to: '/bibliotheque', icon: Library, label: 'Biblioth\u00e8que' },
  ];

  const handleReset = () => {
    clearProviderConfig();
    onResetProvider();
  };

  return (
    <aside className="w-72 bg-white border-r border-brand-olive/10 h-screen sticky top-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
      <div className="p-8 border-b border-brand-olive/10 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-olive/5 rounded-full blur-xl"></div>
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-olive to-brand-olive-light rounded-xl flex items-center justify-center text-white shadow-sm">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl font-bold font-serif text-brand-ink leading-tight">
            G\u00e9n\u00e9rateur<br />de Contes
          </h1>
        </div>
        <p className="text-sm text-brand-olive font-medium mt-3 tracking-wide uppercase">
          Histoires \u00c9ducatives
        </p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-olive text-white shadow-md shadow-brand-olive/20'
                  : 'text-brand-ink/70 hover:bg-brand-olive/5 hover:text-brand-olive'
              }`
            }
          >
            <link.icon size={22} className="transition-transform group-hover:scale-110" />
            <span className="font-medium text-base">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Provider info & settings */}
      <div className="p-5 border-t border-brand-olive/10 bg-brand-bg/50 space-y-3">
        {config && (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-brand-olive/10">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              config.provider === 'gemini'
                ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}>
              {config.provider === 'gemini' ? (
                <Zap size={14} className="text-white" />
              ) : (
                <Globe size={14} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand-ink truncate">
                {config.provider === 'gemini' ? 'Google Gemini' : 'OpenRouter'}
              </p>
              <p className="text-[10px] text-brand-ink/40 font-mono truncate">
                {config.apiKey.slice(0, 8)}...{config.apiKey.slice(-4)}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-brand-ink/50 hover:text-brand-olive transition-colors py-2 rounded-lg hover:bg-brand-olive/5 cursor-pointer"
        >
          <Settings size={14} />
          <span>Changer de fournisseur</span>
        </button>
      </div>
    </aside>
  );
}
