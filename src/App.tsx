import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ProviderSetup } from './components/ProviderSetup';
import { Home } from './pages/Home';
import { Characters } from './pages/Characters';
import { World } from './pages/World';
import { Generator } from './pages/Generator';
import { Library } from './pages/Library';
import { getProviderConfig } from './services/ai-provider';

export default function App() {
  const [isConfigured, setIsConfigured] = useState(() => {
    const config = getProviderConfig();
    return !!(config?.apiKey);
  });

  if (!isConfigured) {
    return <ProviderSetup onComplete={() => setIsConfigured(true)} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-brand-bg text-brand-ink font-sans">
        <Sidebar onResetProvider={() => setIsConfigured(false)} />
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/personnages" element={<Characters />} />
            <Route path="/univers" element={<World />} />
            <Route path="/generateur" element={<Generator />} />
            <Route path="/bibliotheque" element={<Library />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
