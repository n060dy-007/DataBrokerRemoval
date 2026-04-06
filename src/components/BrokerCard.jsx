import React, { useState } from 'react';
import { ExternalLink, Mail, Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, StickyNote, X, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BrokerCard = ({ 
  broker, 
  status = 'notstarted', 
  note = '', 
  onSimulate, 
  onStatusChange, 
  onNoteChange 
}) => {
  const [id, name, cat, diff, url, method, data, time, email, types, priority] = broker;
  const [isExpanded, setIsExpanded] = useState(false);

  const difficultyStyles = {
    'l': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'm': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'h': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }[diff] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  const statusColors = {
    'done': 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    'pending': 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    'notstarted': 'text-slate-500 bg-slate-500/10 border-white/5'
  };

  const statusLabels = {
    'done': 'Removed',
    'pending': 'In Progress',
    'notstarted': 'Not Started'
  };

  return (
    <motion.div 
      layout
      className={`glass glass-card rounded-xl flex flex-col border transition-all duration-300 ${status === 'done' ? 'border-emerald-500/20' : 'border-white/5'} hover:border-blue-500/30 overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Header Info */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate mb-1">{name}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{time}</span>
              {priority === 'c' && (
                <span className="text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded leading-none uppercase">Crucial</span>
              )}
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${difficultyStyles}`}>
            {diff === 'h' ? 'Hard' : diff === 'm' ? 'Medium' : 'Easy'}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${statusColors[status]}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'done' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-slate-600'}`} />
            {statusLabels[status]}
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => onStatusChange(id, 'notstarted')}
              className={`w-7 h-7 rounded-lg flex-center border transition-all ${status === 'notstarted' ? 'bg-slate-800 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-600 hover:border-white/20'}`}
              title="Reset"
            >
              <X size={14} />
            </button>
            <button 
              onClick={() => onStatusChange(id, 'pending')}
              className={`w-7 h-7 rounded-lg flex-center border transition-all ${status === 'pending' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-transparent border-white/5 text-slate-600 hover:border-amber-500/20 font-bold'}`}
              title="In Progress"
            >
              <RefreshCw size={12} />
            </button>
            <button 
              onClick={() => onStatusChange(id, 'done')}
              className={`w-7 h-7 rounded-lg flex-center border transition-all ${status === 'done' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-transparent border-white/5 text-slate-600 hover:border-emerald-500/20 font-bold'}`}
              title="Done"
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="px-5 pb-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors py-2 border-t border-white/5"
        >
          <span>Broker Data Details</span>
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-3 flex flex-wrap gap-1.5">
                {types.split(',').map((type, idx) => (
                  <span key={idx} className="bg-white/5 text-slate-400 px-2 py-0.5 rounded text-[10px] border border-white/5">
                    {type.trim()}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Note Input */}
      <div className="px-5 pb-4">
        <div className="relative group">
          <StickyNote size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text"
            placeholder="Add a private note..."
            className="w-full bg-black/40 border border-white/5 rounded-lg py-2 pl-8 pr-3 text-[11px] text-slate-300 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
            value={note}
            onChange={(e) => onNoteChange(id, e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 mt-auto flex gap-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 glass bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg flex-center gap-2 transition-all text-xs font-bold border border-white/10 shadow-sm"
        >
          <ExternalLink size={14} />
          Opt-Out URL
        </a>
        
        {method === 'e' || email ? (
          <button 
            onClick={() => onSimulate(broker)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg flex-center gap-2 transition-all text-xs font-bold shadow-lg shadow-blue-600/20 border border-blue-400/20"
          >
            <Mail size={14} />
            Draft Email
          </button>
        ) : (
          <div className="flex-1 bg-slate-900/40 text-slate-600 py-2.5 rounded-lg flex-center gap-2 text-[10px] font-bold border border-white/5 uppercase tracking-tighter opacity-60">
            Form Required
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BrokerCard;
