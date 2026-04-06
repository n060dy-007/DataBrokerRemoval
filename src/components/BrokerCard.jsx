import React from 'react';
import { ExternalLink, Mail, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BrokerCard = ({ broker, onSimulate }) => {
  const [id, name, cat, diff, url, method, data, time, email, types, status] = broker;

  const difficultyColor = {
    'l': 'badge-low',
    'm': 'badge-mid',
    'h': 'badge-high'
  }[diff] || 'badge-mid';

  const categoryLabel = {
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
  }[cat] || 'General Broker';

  return (
    <motion.div 
      layout
      className="glass glass-card p-6 rounded-xl flex flex-col gap-4 border border-white/5 hover:border-blue-500/50 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
          <span className="badge glass text-[10px] py-0.5 px-2 text-slate-400">{categoryLabel}</span>
        </div>
        <div className={`badge ${difficultyColor} flex items-center gap-1`}>
          {diff === 'h' ? <AlertTriangle size={12} /> : diff === 'l' ? <CheckCircle size={12} /> : null}
          {diff === 'h' ? 'High' : diff === 'm' ? 'Medium' : 'Low'}
        </div>
      </div>

      <p className="text-sm text-slate-400 line-clamp-2">
        Data: {types}
      </p>

      <div className="mt-auto pt-4 flex gap-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
        >
          <ExternalLink size={16} />
          Opt-Out URL
        </a>
        
        {method === 'e' || email ? (
          <button 
            onClick={() => onSimulate(broker)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium shadow-lg shadow-blue-900/20"
          >
            <Mail size={16} />
            Email Draft
          </button>
        ) : (
          <div className="flex-1 bg-slate-900/50 text-slate-600 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs border border-white/5 italic">
            Web Form Only
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BrokerCard;
