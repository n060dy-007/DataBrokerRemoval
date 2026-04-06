import React, { useState, useMemo } from 'react';
import { Search, Filter, Shield, Settings, Mail, X, Copy, Check, Globe, AlertCircle, Info, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { R as brokers } from './data/brokers';
import BrokerCard from './components/BrokerCard';
import { generateEmailTemplate } from './utils/simulator';

const CATEGORIES = {
  'ALL': 'All Categories',
  'P': 'People Search',
  'M': 'Marketing/Advertising',
  'B': 'B2B/Lead Gen',
  'C': 'Credit/Financial',
  'H': 'Health/Medical',
  'K': 'Risk/Background',
  'L': 'Location/Geospatial',
  'A': 'AdTech/Analytics',
  'G': 'Government/Portal',
  'S': 'Search Engine',
  'X': 'Security/Breach',
  'V': 'Opt-Out Service'
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // User Profile for Simulation
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  const filteredBrokers = useMemo(() => {
    return brokers.filter(b => {
      const nameMatch = b[1].toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = category === 'ALL' || b[2] === category;
      const difficultyMatch = difficulty === 'ALL' || b[3] === difficulty;
      return nameMatch && categoryMatch && difficultyMatch;
    });
  }, [searchTerm, category, difficulty]);

  const handleSimulate = (broker) => {
    setSelectedBroker(broker);
    setShowSimulator(true);
  };

  const handleCopyTemplate = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTemplate = selectedBroker ? generateEmailTemplate(selectedBroker, userData) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex-center shadow-lg shadow-blue-500/20">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight brand-font">ANTIGRAVITY</h1>
            <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase opacity-70">Data Broker Removal Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="glass p-2 rounded-lg hover:bg-white/5 transition-colors border-white/10">
            <Settings size={18} />
          </button>
          <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">Database Active</p>
              <p className="text-[10px] text-slate-500">{brokers.length} Entities Indexed</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Hero / Header */}
      <header className="pt-16 pb-8 container animate-fade-in">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent leading-tight">
            Take Control of Your <br />Digital Identity.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Search 697+ data brokers and generate secure deletion requests instantly. Premium "Simulator Mode" ensures your sensitive info never leaves your device.
          </p>

          <div className="glass p-1 rounded-2xl flex flex-col md:flex-row gap-2 border-white/10 shadow-2xl">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-4 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search brokers (e.g. Acxiom, Spokeo, ZoomInfo)..."
                className="w-full bg-transparent border-none outline-none py-4 pl-12 pr-4 text-white placeholder-slate-600 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 p-1">
              <select 
                className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500/50 transition-colors cursor-pointer appearance-none min-w-[140px]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select 
                className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500/50 transition-colors cursor-pointer appearance-none min-w-[100px]"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="ALL">All Levels</option>
                <option value="l">Easy</option>
                <option value="m">Medium</option>
                <option value="h">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container pb-24">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-slate-500 uppercase tracking-widest font-bold text-[10px]">
               <Globe size={14} />
               Results: {filteredBrokers.length} Found
             </div>
          </div>
          <div className="flex gap-2">
            <button className="glass p-2 rounded-lg text-slate-400 hover:text-white transition-colors border-white/10">
              <LayoutGrid size={16} />
            </button>
            <button className="glass p-2 rounded-lg text-slate-400 hover:text-white transition-colors border-white/10 opacity-50">
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Broker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBrokers.map((broker) => (
              <BrokerCard 
                key={broker[0]} 
                broker={broker} 
                onSimulate={handleSimulate}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredBrokers.length === 0 && (
          <div className="flex-center flex-col py-24 glass rounded-3xl border-dashed border-white/10 mt-12">
            <Info className="text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-medium text-lg">No brokers found matching your criteria</p>
            <button 
              onClick={() => { setSearchTerm(''); setCategory('ALL'); setDifficulty('ALL'); }}
              className="mt-4 text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase tracking-widest text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Simulator Modal / Drawer */}
      <AnimatePresence>
        {showSimulator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimulator(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden relative flex flex-col border-white/10 shadow-[0_0_100px_rgba(51,154,240,0.1)]"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex-center border border-blue-500/20">
                    <Mail className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Secure Simulator Mode</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Drafting deletion request for <span className="text-blue-400">{selectedBroker?.[1]}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSimulator(false)}
                  className="glass p-2 rounded-xl border-white/10 hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row overflow-hidden h-full">
                {/* User Input Section */}
                <div className="w-full md:w-[350px] bg-black/40 border-r border-white/5 p-6 space-y-6 overflow-y-auto">
                  <div className="p-4 bg-blue-900/10 rounded-xl border border-blue-500/10 flex gap-3">
                    <AlertCircle className="text-blue-500 shrink-0" size={18} />
                    <p className="text-[10px] text-blue-300 leading-relaxed font-semibold italic">
                      Antigravity Simulator runs locally. Your data remains on your machine and is only used to populate the template.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Identifying Data</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase ml-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="Legal Name"
                          className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                          value={userData.fullName}
                          onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase ml-1">Primary Email</label>
                        <input 
                          type="email" 
                          placeholder="your.email@example.com"
                          className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase ml-1">Phone (Optional)</label>
                        <input 
                          type="tel" 
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                          value={userData.phone}
                          onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase ml-1">Address (Optional)</label>
                        <textarea 
                          placeholder="Current residential address"
                          className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors resize-none h-24"
                          value={userData.address}
                          onChange={(e) => setUserData({...userData, address: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template View Section */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-900/10">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Template Preview</h4>
                     <button 
                        onClick={() => handleCopyTemplate(currentTemplate?.body)}
                        className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
                      >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy Template'}
                      </button>
                  </div>

                  <div className="glass bg-black/60 rounded-2xl p-6 border-white/5 font-mono text-sm group overflow-hidden">
                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-slate-500 mb-1 font-bold text-[10px] uppercase tracking-tighter">Recipient (To:)</p>
                      <p className="text-blue-400 font-bold">{currentTemplate?.to}</p>
                    </div>
                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-slate-500 mb-1 font-bold text-[10px] uppercase tracking-tighter">Subject:</p>
                      <p className="text-white font-bold">{currentTemplate?.subject}</p>
                    </div>
                    <div className="p-4 rounded-xl relative">
                       <p className="text-slate-500 mb-4 font-bold text-[10px] uppercase tracking-tighter">Email Body:</p>
                       <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
                         {currentTemplate?.body}
                       </pre>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <a 
                      href={currentTemplate?.mailto}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 group"
                    >
                      <Mail size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Open In Mail Client
                    </a>
                    <button 
                      onClick={() => handleCopyTemplate(currentTemplate?.body)}
                      className="flex-1 glass border-white/10 hover:bg-white/5 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                      <Copy size={20} />
                      Copy To Clipboard
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
