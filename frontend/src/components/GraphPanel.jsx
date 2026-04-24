import API_BASE from '../config.js';
import React, { useState } from 'react';
import axios from 'axios';
import { Network, Loader2 } from 'lucide-react';
import KnowledgeGraph from './KnowledgeGraph';

const GraphPanel = ({ noteId }) => {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateGraph = async () => {
    setIsLoading(true);
    setGraphData(null);
    try {
      const res = await axios.post(API_BASE + '/api/graph/generate', {
        noteId: noteId || 'default-note'
      });
      if (res.data.success && res.data.graph) {
        setGraphData(res.data.graph);
      } else {
        alert('Could not generate mind map.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to graph server.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface flex items-center justify-center">
        <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-white">Synthesizing Relationships...</h3>
        <p className="text-sm text-slate-400 mt-2">Connecting the dots across all concepts in your notes.</p>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface flex items-center justify-center text-center p-8">
        <Network size={48} className="text-slate-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">Concept Mapping</h2>
        <p className="text-slate-400 max-w-sm mb-8">Generate an interactive Web of Knowledge. Use this to visually organize how concepts in your notes are connected to each other.</p>
        <button onClick={generateGraph} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20">
          🕸️ Generate Mind Map
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
       <KnowledgeGraph graphData={graphData} />
    </div>
  );
};

export default GraphPanel;
