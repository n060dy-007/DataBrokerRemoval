import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Shield, Settings, Mail, X, Copy, Check, Globe, 
  AlertCircle, Info, LayoutGrid, List, BarChart3, Users, 
  History, User, Play, Sparkles, LogOut, Trash2, RefreshCw, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { R as brokers, CM as CATEGORIES } from './data/brokers';
import BrokerCard from './components/BrokerCard';
import { generateEmailTemplate, createGmailDraft } from './utils/simulator';
import { saveState, loadState, clearState } from './utils/storage';

const App = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  
  // App State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDrafting, setIsDrafting] = useState(null); // ID of broker currently being drafted
  
  // Persistent State
  const [progress, setProgress] = useState({});
  const [notes, setNotes] = useState({});
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });
  const [activityLog, setActivityLog] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.progress) setProgress(saved.progress);
      if (saved.notes) setNotes(saved.notes);
      if (saved.userInfo) setUserData(saved.userInfo);
      if (saved.activityLog) setActivityLog(saved.activityLog);
    }
    setIsLoaded(true);
  }, []);

  // Save state whenever important data changes
  useEffect(() => {
    if (isLoaded) {
      saveState({ progress, notes, userInfo: userData, activityLog });
    }
  }, [progress, notes, userData, activityLog, isLoaded]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = brokers.length;
    const removedView = Object.values(progress).filter(s => s === 'done').length;
    const pendingView = Object.values(progress).filter(s => s === 'pending').length;
    const remaining = total - removedView;
    const progressPct = Math.round((removedView / total) * 100);
    
    return { total, removed: removedView, pending: pendingView, remaining, progressPct };
  }, [progress]);

  const filteredBrokers = useMemo(() => {
    return brokers.filter(b => {
      const nameMatch = b[1].toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = category === 'ALL' || b[2] === category;
      const difficultyMatch = difficulty === 'ALL' || b[3] === difficulty;
      return nameMatch && categoryMatch && difficultyMatch;
    }).sort((a, b) => {
      // Sort priority: Crucial first
      if (a[10] === 'c' && b[10] !== 'c') return -1;
      if (a[10] !== 'c' && b[10] === 'c') return 1;
      return 0;
    });
  }, [searchTerm, category, difficulty]);

  // Handlers
  const handleStatusChange = useCallback((id, status) => {
    setProgress(prev => ({ ...prev, [id]: status }));
  }, []);

  const handleNoteChange = useCallback((id, note) => {
    setNotes(prev => ({ ...prev, [id]: note }));
  }, []);

  const addLog = useCallback((brokerName, action, details) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      broker: brokerName,
      action,
      details
    };
    setActivityLog(prev => [entry, ...prev].slice(0, 100));
  }, []);

  const handleSimulate = (broker) => {
    setSelectedBroker(broker);
    setShowSimulator(true);
  };

  const handleGmailDraft = async (broker) => {
    if (!userData.fullName || !userData.email) {
      alert("Please complete your profile in 'My Info' first.");
      setCurrentView('profile');
      return;
    }

    setIsDrafting(broker[0]);
    const template = generateEmailTemplate(broker, userData);
    const result = await createGmailDraft(template.to, template.subject, template.body);
    
    if (result.ok) {
      handleStatusChange(broker[0], 'pending');
      addLog(broker[1], 'Email Drafted', `Sent to ${template.to}`);
      alert("Success! Draft created in your Gmail.");
    } else {
      alert(`Error: ${result.message}`);
    }
    setIsDrafting(null);
  };

  const handleBatchDraft = async () => {
    const targetBrokers = brokers.filter(b => 
      (b[5] === 'e' || b[8]) && progress[b[0]] !== 'done'
    ).slice(0, 5); // Limit to 5 for safety in demo

    if (targetBrokers.length === 0) {
      alert("No pending email-based brokers found.");
      return;
    }

    if (!confirm(`This will generate Gmail drafts for ${targetBrokers.length} brokers. Continue?`)) return;

    for (const b of targetBrokers) {
      const template = generateEmailTemplate(b, userData);
      await createGmailDraft(template.to, template.subject, template.body);
      handleStatusChange(b[0], 'pending');
      addLog(b[1], 'Batch Email', 'Automated draft created');
    }
    alert("Batch drafting complete.");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear all progress and profile data? This cannot be undone.")) {
      clearState();
      window.location.reload();
    }
  };

  const copyTemplate = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addLog(selectedBroker[1], 'Template Copied', 'Manual copy to clipboard');
  };

  const currentTemplate = selectedBroker ? generateEmailTemplate(selectedBroker, userData) : null;

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#060606] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-900/20 blur-[150px] rounded-full" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-20 hidden lg:flex flex-col items-center py-8 glass border-r border-white/5 z-50">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex-center shadow-lg shadow-blue-500/20 mb-12">
          <Shield className="text-white" size={24} />
        </div>
        
        <div className="flex flex-col gap-8">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'brokers', icon: LayoutGrid, label: 'Brokers' },
            { id: 'profile', icon: User, label: 'My Info' },
            { id: 'activity', icon: History, label: 'Activity' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`p-3 rounded-xl transition-all group relative ${currentView === item.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <item.icon size={22} />
              <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <button 
          onClick={handleReset}
          className="mt-auto p-3 text-slate-700 hover:text-rose-500 transition-colors"
          title="Reset All Data"
        >
          <Trash2 size={20} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-20 min-h-screen">
        {/* Mobile Navbar */}
        <nav className="lg:hidden sticky top-0 z-40 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-blue-500" size={20} />
            <h1 className="text-sm font-black tracking-tighter uppercase italic">Antigravity</h1>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setCurrentView('dashboard')} className={currentView === 'dashboard' ? 'text-blue-500' : 'text-slate-500'}><BarChart3 size={20} /></button>
             <button onClick={() => setCurrentView('brokers')} className={currentView === 'brokers' ? 'text-blue-500' : 'text-slate-500'}><LayoutGrid size={20} /></button>
             <button onClick={() => setCurrentView('profile')} className={currentView === 'profile' ? 'text-blue-500' : 'text-slate-500'}><User size={20} /></button>
          </div>
        </nav>

        <header className="px-6 md:px-12 py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase italic italic-shadow">
              {currentView === 'dashboard' ? 'Agent Console' : 
               currentView === 'brokers' ? 'Data Brokers' : 
               currentView === 'profile' ? 'Identity Vault' : 'Mission Log'}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Globe size={12} className="text-blue-500" />
              Monitoring {brokers.length} Global Data Harvesters
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-xl border-white/5 hidden md:block">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-0.5">Deployment Stats</p>
              <p className="text-xs font-bold text-white uppercase italic tracking-widest">
                <span className="text-emerald-400">{stats.removed}</span> Done / <span className="text-blue-400">{stats.remaining}</span> Active
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-500/20 p-0.5 animate-spin-slow">
               <div className="w-full h-full rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent" />
            </div>
          </div>
        </header>

        <main className="px-6 md:px-12 pb-24 max-w-[1440px]">
          <AnimatePresence mode="wait">
            
            {/* DASHBOARD VIEW */}
            {currentView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Indexed', value: stats.total, color: 'text-white' },
                    { label: 'Removed', value: stats.removed, color: 'text-emerald-400' },
                    { label: 'In Progress', value: stats.pending, color: 'text-amber-400' },
                    { label: 'Protection', value: `${stats.progressPct}%`, color: 'text-blue-400' }
                  ].map(card => (
                    <div key={card.label} className="glass p-6 rounded-2xl border-white/5 flex flex-col gap-1 items-center md:items-start group hover:border-blue-500/20 transition-all">
                       <span className={`text-4xl font-black italic tracking-tighter ${card.color}`}>{card.value}</span>
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mt-1">{card.label}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-3xl border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-blue-600/10 transition-all duration-700" />
                       
                       <div className="w-48 h-48 flex-shrink-0 relative">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                           <motion.circle 
                              cx="50" cy="50" r="45" fill="transparent" stroke="#2563eb" strokeWidth="6" 
                              strokeDasharray="282.7" initial={{ strokeDashoffset: 282.7 }}
                              animate={{ strokeDashoffset: 282.7 - (282.7 * stats.progressPct) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              strokeLinecap="round"
                           />
                         </svg>
                         <div className="absolute inset-0 flex-center flex-col">
                            <span className="text-4xl font-black italic text-white tracking-tighter leading-none">{stats.progressPct}%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shield</span>
                         </div>
                       </div>

                       <div className="flex-1 space-y-4">
                          <h3 className="text-2xl font-black italic uppercase tracking-tight leading-tight text-white">
                            Fleet-Wide <br />Removal Status
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            Your identity is currently indexed across {stats.total} data brokers. {stats.removed} confirm removal, while {stats.remaining} are still harvesting your data.
                          </p>
                          <button 
                            onClick={() => setCurrentView('brokers')}
                            className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-all mt-2"
                          >
                            Execute Deployments <Play size={12} />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                               <Sparkles className="text-purple-400" size={18} />
                             </div>
                             <h4 className="text-xs font-black uppercase tracking-widest text-white">Batch Automation</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed italic">
                            Agent can draft multi-broker deletion requests using the Gmail MCP interface.
                          </p>
                          <button 
                            onClick={handleBatchDraft}
                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-slate-300"
                          >
                            Execute Batch Drafts
                          </button>
                       </div>
                       
                       <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                               <Shield className="text-emerald-400" size={18} />
                             </div>
                             <h4 className="text-xs font-black uppercase tracking-widest text-white">Identity Health</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed italic">
                            Based on your profile, {brokers.filter(b => b[10] === 'c').length} crucial brokers pose an immediate risk to your privacy.
                          </p>
                          <button 
                            onClick={() => { setCurrentView('brokers'); setCategory('ALL'); setSearchTerm(''); }}
                            className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all text-emerald-400"
                          >
                            Vital Alerts Only
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-3xl border-white/5 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                       System Activity
                       <History size={14} />
                    </h3>
                    
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      {activityLog.length === 0 ? (
                        <div className="text-center py-12">
                           <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest italic">No Intel Logs Recorded</p>
                        </div>
                      ) : (
                        activityLog.map(log => (
                          <div key={log.id} className="border-l-2 border-blue-500/30 pl-4 py-1">
                             <p className="text-[10px] font-bold text-slate-500 mb-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                             <p className="text-xs font-bold text-white uppercase italic tracking-tight">{log.broker}</p>
                             <p className="text-[10px] font-semibold text-blue-400/70">{log.action}: {log.details}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <button 
                      onClick={() => setCurrentView('activity')}
                      className="w-full py-3 mt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
                    >
                      View Full Manifest
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* BROKERS VIEW */}
            {currentView === 'brokers' && (
              <motion.div 
                key="brokers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-10 space-y-6">
                  <div className="glass p-1 rounded-2xl flex flex-col md:flex-row gap-2 border-white/10 shadow-2xl">
                    <div className="flex-1 relative flex items-center">
                      <Search className="absolute left-6 text-slate-500" size={20} />
                      <input 
                        type="text" 
                        placeholder="Intercept harvester (e.g. Acxiom, Spokeo)..."
                        className="w-full bg-transparent border-none outline-none py-5 pl-16 pr-6 text-white placeholder-slate-600 font-bold italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 p-1">
                      <select 
                        className="bg-black/40 border border-white/5 rounded-xl px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none min-w-[160px] text-slate-400"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="ALL">All Sectors</option>
                        {Object.entries(CATEGORIES).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <select 
                        className="bg-black/40 border border-white/5 rounded-xl px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none min-w-[140px] text-slate-400"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                      >
                        <option value="ALL">Complexity</option>
                        <option value="l">Easy</option>
                        <option value="m">Medium</option>
                        <option value="h">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredBrokers.slice(0, 50).map((broker) => (
                      <BrokerCard 
                        key={broker[0]} 
                        broker={broker} 
                        status={progress[broker[0]]}
                        note={notes[broker[0]]}
                        onSimulate={handleSimulate}
                        onStatusChange={handleStatusChange}
                        onNoteChange={handleNoteChange}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {filteredBrokers.length === 0 && (
                  <div className="text-center py-32 glass rounded-3xl border-dashed border-white/10 italic">
                    <p className="text-slate-600 text-lg uppercase tracking-widest font-black">No Threats Detected Tracking Criteria</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILE VIEW */}
            {currentView === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto space-y-8"
              >
                <div className="glass p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex-center mb-6 text-blue-500">
                       <User size={40} />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Target Profile</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Identifiers used for deletion requests</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { id: 'fullName', label: 'Authorized Name', icon: User, placeholder: 'Legal Entity Name' },
                      { id: 'email', label: 'Contact Email', icon: Mail, type: 'email', placeholder: 'primary@domain.com' },
                      { id: 'city', label: 'Primary City', icon: Globe, placeholder: 'Operational Base (City)' },
                      { id: 'state', label: 'State/Region', icon: MapPin, placeholder: 'CA / TX / NY' }
                    ].map(field => (
                      <div key={field.id} className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 leading-none">{field.label}</label>
                        <div className="relative group/input">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-blue-500 transition-colors">
                             {field.id === 'fullName' ? <User size={16} /> : field.id === 'email' ? <Mail size={16} /> : <Globe size={16} />}
                           </div>
                           <input 
                              type={field.type || 'text'}
                              placeholder={field.placeholder}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold placeholder:text-slate-800 outline-none focus:border-blue-500/50 transition-all text-white"
                              value={userData[field.id]}
                              onChange={(e) => setUserData({ ...userData, [field.id]: e.target.value })}
                           />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-blue-900/10 rounded-2xl border border-blue-500/10 flex gap-4">
                    <Shield className="text-blue-500 shrink-0" size={24} />
                    <p className="text-[11px] text-blue-300 font-bold italic leading-relaxed uppercase">
                      Data is encrypted in local vault. Antigravity never transmits target identifiers to external servers.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ACTIVITY VIEW */}
            {currentView === 'activity' && (
              <motion.div 
                key="activity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto"
              >
                <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                       <History className="text-blue-500" size={20} />
                       Mission Manifest
                    </h2>
                    <button className="text-[10px] font-bold text-slate-600 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                       Clear Logs <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <div className="p-0">
                    {activityLog.length === 0 ? (
                      <div className="py-24 text-center">
                        <p className="text-slate-700 font-black uppercase tracking-widest italic text-lg">Empty Manifest</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {activityLog.map(log => (
                          <div key={log.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-white/1 transition-colors">
                            <div className="w-32 flex-shrink-0">
                               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{new Date(log.timestamp).toLocaleDateString()}</p>
                               <p className="text-xs font-black text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex-1">
                               <h4 className="text-sm font-black text-white italic uppercase">{log.broker}</h4>
                               <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mt-1">{log.action}</p>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500 bg-white/5 px-4 py-2 rounded-xl italic">
                               {log.details}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Simulator Modal */}
      <AnimatePresence>
        {showSimulator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimulator(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="glass w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden relative flex flex-col border border-white/10 shadow-[0_0_150px_rgba(37,99,235,0.15)]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600/15 rounded-3xl flex-center border border-blue-500/20">
                    <Mail className="text-blue-500" size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Draft Protocol</h3>
                    <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-black mt-1 flex items-center gap-2">
                       <Sparkles size={12} /> Target: {selectedBroker?.[1]}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSimulator(false)}
                  className="glass w-12 h-12 rounded-2xl border-white/10 hover:bg-white/5 text-slate-500 hover:text-white transition-all flex-center"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
                {/* Manual Edit Side */}
                <div className="w-full lg:w-[400px] bg-black/40 border-r border-white/5 p-8 flex flex-col">
                  <div className="space-y-8">
                    <div>
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Vault Adjustment</h4>
                       <div className="space-y-4">
                         {['fullName', 'email', 'phone', 'address'].map(field => (
                           <div key={field}>
                             <label className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter mb-1.5 ml-1 block">{field.replace('fullName', 'Identity')}</label>
                             <input 
                               type="text" 
                               className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-xs font-bold text-slate-300 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800"
                               value={userData[field]}
                               onChange={(e) => setUserData({...userData, [field]: e.target.value})}
                             />
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="p-5 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex gap-4">
                       <AlertCircle className="text-blue-500 shrink-0" size={20} />
                       <p className="text-[10px] text-blue-400/70 font-bold italic leading-tight uppercase">
                         Agent identifies as {userData.fullName || 'Unknown'}. Ensure credentials match records held by {selectedBroker?.[1]}.
                       </p>
                    </div>
                  </div>
                </div>

                {/* Preview Side */}
                <div className="flex-1 flex flex-col bg-slate-900/10 overflow-hidden">
                  <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Draft Output [Decrypted]</h4>
                    </div>

                    <div className="glass bg-black/60 rounded-[2rem] p-10 border border-white/5 font-mono text-sm relative group">
                       <div className="mb-8 p-6 bg-white/2 rounded-2xl border border-white/5">
                         <span className="text-slate-700 font-black text-[9px] uppercase tracking-widest block mb-1">To (Harvester Address)</span>
                         <span className="text-blue-500 font-bold italic">{currentTemplate?.to}</span>
                       </div>
                       
                       <div className="mb-8 p-6 bg-white/2 rounded-2xl border border-white/5">
                         <span className="text-slate-700 font-black text-[9px] uppercase tracking-widest block mb-1">Subject Manifest</span>
                         <span className="text-white font-bold italic">{currentTemplate?.subject}</span>
                       </div>

                       <div className="p-6 rounded-2xl relative bg-white/1 border border-white/5 min-h-[300px]">
                         <span className="text-slate-700 font-black text-[9px] uppercase tracking-widest block mb-4">Payload Content</span>
                         <pre className="whitespace-pre-wrap leading-relaxed text-slate-400 text-xs italic font-medium">
                           {currentTemplate?.body}
                         </pre>
                       </div>

                       <button 
                         onClick={() => copyTemplate(currentTemplate?.body)}
                         className="absolute top-8 right-8 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10 shadow-xl"
                       >
                         {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                       </button>
                    </div>
                  </div>

                  <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => handleGmailDraft(selectedBroker)}
                      disabled={isDrafting === selectedBroker?.[0]}
                      className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase italic tracking-widest rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/30 group"
                    >
                      {isDrafting === selectedBroker?.[0] ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:translate-x-1 transition-transform" />}
                      Execute Gmail Protocol
                    </button>
                    <a 
                      href={currentTemplate?.mailto}
                      className="flex-1 h-16 glass border-white/10 hover:bg-white/10 text-white font-black uppercase italic tracking-widest rounded-2xl flex items-center justify-center gap-4 transition-all"
                    >
                      <LogOut className="rotate-180" size={20} />
                      External Transfer
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS for layout elements used in Tailwind classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .flex-center { display: flex; items-center: center; justify-content: center; }
        .italic-shadow { text-shadow: 2px 2px 20px rgba(37, 99, 235, 0.4); }
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      ` }} />
    </div>
  );
};


export default App;
