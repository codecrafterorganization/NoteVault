import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Download, AlertCircle } from 'lucide-react';
import API_BASE from '../config';

const DUMMY_CONTENT = {
  'dummy-biology': {
    title: 'Biology: Cellular Respiration',
    content: `# Cellular Respiration

## Overview
Cellular respiration is the process by which cells break down glucose and other molecules to produce ATP (adenosine triphosphate), the cell's primary energy currency.

## Stages

### 1. Glycolysis (Cytoplasm)
- Glucose (6C) is split into 2 pyruvate molecules (3C each)
- Net gain: 2 ATP, 2 NADH
- Occurs in the cytoplasm, does NOT require oxygen

### 2. Pyruvate Oxidation (Mitochondrial Matrix)
- Pyruvate is converted to Acetyl-CoA
- Releases CO₂ as a byproduct
- Produces NADH

### 3. Krebs Cycle / Citric Acid Cycle
- Acetyl-CoA enters the cycle
- Per glucose: 6 CO₂, 8 NADH, 2 FADH₂, 2 ATP produced
- Carbon atoms are released as CO₂

### 4. Electron Transport Chain (Inner Mitochondrial Membrane)
- NADH and FADH₂ donate electrons
- Creates a proton gradient
- ATP Synthase uses this gradient to produce ATP
- O₂ is the final electron acceptor → forms H₂O
- Major ATP production: ~32-34 ATP

## Summary
**Total ATP yield per glucose molecule:** ~36-38 ATP
**Equation:** C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP

## Key Terms
- **Substrate-level phosphorylation:** Direct transfer of phosphate to ADP
- **Oxidative phosphorylation:** ATP synthesis using electron transport chain
- **Aerobic vs Anaerobic:** With or without oxygen`
  },
  'dummy-thermo': {
    title: 'Advanced Thermodynamics',
    content: `# Advanced Thermodynamics

## Laws of Thermodynamics

### Zeroth Law
If system A is in thermal equilibrium with system B, and B is in equilibrium with C, then A is in equilibrium with C.

### First Law (Conservation of Energy)
ΔU = Q - W
- ΔU = change in internal energy
- Q = heat added to system
- W = work done by system

### Second Law
Entropy of an isolated system always increases or remains constant.
- ΔS ≥ 0 for isolated systems
- Heat flows spontaneously from hot to cold bodies

### Third Law
As temperature approaches absolute zero (0 K), entropy of a perfect crystal approaches zero.

## Key Concepts

### Enthalpy (H)
H = U + PV
ΔH = heat exchanged at constant pressure
- Exothermic: ΔH < 0 (releases heat)
- Endothermic: ΔH > 0 (absorbs heat)

### Entropy (S)
Measure of disorder/randomness in a system.
ΔS = Q_rev / T

### Gibbs Free Energy (G)
ΔG = ΔH - TΔS
- ΔG < 0: Spontaneous reaction
- ΔG > 0: Non-spontaneous
- ΔG = 0: Equilibrium

## Carnot Efficiency
η = 1 - (T_cold / T_hot)
Maximum theoretical efficiency of any heat engine.`
  },
  'dummy-chem': {
    title: 'Organic Chemistry II',
    content: `# Organic Chemistry II

## Functional Groups

### Alcohols (-OH)
- Primary, Secondary, Tertiary classification
- Oxidation: Primary → Aldehyde → Carboxylic Acid
- Secondary → Ketone

### Aldehydes & Ketones (C=O)
- Nucleophilic addition reactions
- Oxidation: Aldehyde → Carboxylic acid (ketones don't oxidize easily)
- Reduction: → Alcohol

### Carboxylic Acids (-COOH)
- pKa ≈ 4-5
- Esterification with alcohols (Fischer esterification)
- Reduction to aldehyde or alcohol

### Amines (-NH₂)
- Nucleophiles and bases
- React with carboxylic acids to form amides

## Key Reactions

### SN1 vs SN2
| Feature | SN1 | SN2 |
|---------|-----|-----|
| Mechanism | 2-step | 1-step |
| Best substrate | 3° | 1° |
| Stereochemistry | Racemization | Inversion |
| Solvent | Polar protic | Polar aprotic |

### Elimination (E1 vs E2)
- E1: Unimolecular, 3° substrates, weak base
- E2: Bimolecular, strong base, anti-periplanar geometry required

### Aromatic Chemistry
- Electrophilic Aromatic Substitution (EAS)
- Friedel-Crafts alkylation & acylation
- Substituents: Activating (ortho/para directors) vs Deactivating (meta directors)`
  },
  'dummy-quantum': {
    title: 'Quantum Mechanics Basics',
    content: `# Quantum Mechanics Basics

## Wave-Particle Duality
- Light behaves as both wave and particle (photon)
- de Broglie wavelength: λ = h/mv
- Demonstrated by double-slit experiment

## Heisenberg Uncertainty Principle
Δx · Δp ≥ ℏ/2

You cannot simultaneously know the exact position AND momentum of a particle.

## Schrödinger Equation
Hψ = Eψ

Where:
- H = Hamiltonian operator (total energy)
- ψ = wave function
- E = energy eigenvalue

The wave function ψ describes the quantum state of a system.

## Quantum Numbers
1. **Principal (n):** Energy level (1, 2, 3...)
2. **Angular momentum (l):** Subshell shape (0 to n-1)
3. **Magnetic (ml):** Orbital orientation (-l to +l)
4. **Spin (ms):** +1/2 or -1/2

## Key Principles
- **Pauli Exclusion:** No two electrons can have the same 4 quantum numbers
- **Aufbau Principle:** Fill lowest energy orbitals first
- **Hund's Rule:** Maximize unpaired electrons in degenerate orbitals

## Quantum Tunneling
Particles can pass through energy barriers that classical physics would forbid.
Used in: tunnel diodes, scanning tunneling microscopes, nuclear fusion in stars.`
  }
};

const NoteViewer = ({ noteId, onSelectText }) => {
  const [zoom, setZoom] = useState(100);
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!noteId) return;
    setIsLoading(true);
    setError(null);

    // Handle dummy notes
    if (noteId.startsWith('dummy-')) {
      const dummyNote = DUMMY_CONTENT[noteId];
      if (dummyNote) {
        setNote(dummyNote);
      } else {
        setError('Demo note not found.');
      }
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/notes/${noteId}`)
      .then(res => {
        if (!res.ok) throw new Error('Note not found');
        return res.json();
      })
      .then(data => {
        setNote(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load note:", err);
        setError('Could not load note. The backend may be offline.');
        setIsLoading(false);
      });
  }, [noteId]);

  const displayContent = note?.content || '';
  const displayTitle = note?.title || 'Note Viewer';

  const handleMouseUp = () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 5) {
      onSelectText(selection);
    }
  };

  return (
    <div className="h-full flex flex-col cinematic-glass rounded-3xl overflow-hidden premium-surface">
      <div className="h-14 border-b border-white/[0.05] flex items-center justify-between px-6 shrink-0">
        <h2 className="text-sm font-semibold text-slate-200 truncate max-w-[60%]">{displayTitle}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 border border-white/[0.02]">
            <button className="p-1.5 hover:bg-white/[0.1] rounded-md transition text-slate-400 hover:text-white" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono text-slate-300 w-12 text-center">{zoom}%</span>
            <button className="p-1.5 hover:bg-white/[0.1] rounded-md transition text-slate-400 hover:text-white" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <ZoomIn size={16} />
            </button>
          </div>
          <button className="p-2 hover:bg-white/[0.05] rounded-lg transition text-slate-400 hover:text-white">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-[#0a0f18] flex justify-center">
        <div 
          className="bg-slate-900 border border-slate-700/50 shadow-2xl p-10 min-h-[1000px] text-slate-300 whitespace-pre-wrap font-sans text-sm outline-none"
          style={{ width: `${zoom}%`, maxWidth: '800px', transition: 'width 0.2s ease' }}
          onMouseUp={handleMouseUp}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-500 h-64">
               <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mb-4"></div>
               Loading your note...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-slate-500 h-64 gap-3">
               <AlertCircle size={32} className="text-red-400/50" />
               <p className="text-sm text-red-400/70">{error}</p>
               <p className="text-xs text-slate-600">Make sure the backend server is running on port 5000.</p>
            </div>
          ) : (
            displayContent
          )}
        </div>
      </div>
      
      <div className="h-8 bg-black/40 flex items-center px-4 gap-2 text-[10px] text-slate-500 uppercase tracking-widest border-t border-white/[0.02] shrink-0">
        <AlertCircle size={12} /> Highlight any text to instantly explain it with AI.
      </div>
    </div>
  );
};

export default NoteViewer;
