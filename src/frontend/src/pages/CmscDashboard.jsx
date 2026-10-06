import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import TopNav from '../components/TopNav.jsx';
import VoiceAssistant from '../components/VoiceAssistant.jsx';
import SignalRiver from './cmsc/SignalRiver.jsx';
import HonestyBadge from './cmsc/HonestyBadge.jsx';
import SignalCatalogView from './cmsc/SignalCatalogView.jsx';
import SignalCard from './cmsc/SignalCard.jsx';
import LabDoors from './cmsc/LabDoors.jsx';
import SpectralAnalysisInstrument from './cmsc/SpectralAnalysisInstrument.jsx';
import CmscSideNav from './cmsc/CmscSideNav.jsx';
import MmcHero from './cmsc/MmcHero.jsx';
import SignalExplorerAccordion from './cmsc/SignalExplorerAccordion.jsx';
import ModelPredictCell from './cmsc/ModelPredictCell.jsx';
import BenchmarkCell from './cmsc/BenchmarkCell.jsx';
import OrchestrationZoneV2 from './cmsc/orchestration/OrchestrationZoneV2.jsx';
import { NEON, HONESTY_STATES, honestyMeta } from './cmsc/honesty.js';
import { readLiveSignals } from '../services/cmscAdapters.js';
import { docsBySignal, totalDocs } from '../services/docsBySignal.js';
import { useLabStore } from '../stores/useLabStore.js';

const CmscDashboard = ({ embedded = true, clusterNodes = [], onNavigate }) => {
  const pcmTapRef = useRef(null);
  const [live, setLive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignalId, setSelectedSignalId] = useState(null);
  const [filter, setFilter] = useState(null);
  const [view, setView] = useState('overview');

  const catalog = useLabStore((state) => state.signalRegistry.catalog);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results = await readLiveSignals();
      if (mounted) {
        setLive(results.filter((r) => r && typeof r === 'object'));
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selected = useMemo(
    () => (selectedSignalId ? catalog.find((s) => s.signal_id === selectedSignalId) : null),
    [selectedSignalId, catalog]
  );

  const selectedDocs = useMemo(
    () => (selected ? docsBySignal(selected.signal_id) : []),
    [selected]
  );

  const liveEntries = useMemo(() => {
    if (live.length === 0) {
      return [];
    }
    const tele = live.find((r) => r.signalId === 'S10' && r.ok);
    const weather = live.find((r) => r.signalId === 'S03' && r.ok);
    const mic = live.find((r) => r.signalId === 'S30');
    const cluster = live.find((r) => r.signalId === 'S04');
    const robot = live.find((r) => r.signalId === 'S50');
    const setUp = (entry, estado) => ({ ...entry, estado });
    return [
      setUp(tele, tele ? 'REAL' : 'ROTO'),
      setUp(weather, weather ? 'REAL-LOCAL' : 'ROTO'),
      setUp(mic, 'REAL-LOCAL'),
      setUp(cluster, 'SIM'),
      setUp(robot, 'ROTO')
    ].filter(Boolean);
  }, [live]);

  const handleSelect = (signalId) => {
    setSelectedSignalId(signalId);
    if (signalId) setView('catalog');
  };

  const handleRiverSelect = (label) => {
    if (label === 'Knowledge Hub') {
      setSelectedSignalId(null);
      setView('overview');
    }
    if (label === 'Señales') {
      setSelectedSignalId(null);
      setView('catalog');
    }
  };

  const handleNavSide = (action) => {
    if (action === 'overview') setView('overview');
    if (action === 'catalog') setView('catalog');
  };

  const handleHonestyFilter = (value) => {
    setFilter(value || null);
    if (value) setView('catalog');
  };

  return (
    <ErrorBoundary>
      {!embedded && <TopNav clusterNodes={clusterNodes} />}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 2xl:px-6 pb-16 min-h-screen" style={{ backgroundColor: NEON.darkBackground }}>
        <div className="max-w-[1800px] 2xl:max-w-[1920px] mx-auto space-y-3">
          <header className="flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-widest" style={{ color: NEON.primary }}>
                CMSC · DASHBOARD CIENTÍFICO
              </h1>
              <p className="text-xs text-gray-500">
                Centro de Modelado, Simulación y Ciencias Computacionales · knowledge-centric v1.2
              </p>
            </div>
            <HonestyBadge estado="REAL" confidence={null} />
          </header>

          <SignalRiver onSelectSignal={handleRiverSelect} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <aside className="lg:col-span-2 min-w-0">
              <div className="lg:sticky lg:top-20">
                <CmscSideNav view={view} onNav={handleNavSide} />
              </div>
            </aside>

            <main className="lg:col-span-10 min-w-0 space-y-4 relative before:content-[''] before:absolute before:left-[-8px] before:top-0 before:bottom-0 before:w-px before:bg-gray-800/60 before:hidden lg:before:block">
              {view === 'overview' ? (
                <>
                  <MmcHero />

                  {/* FFT · instrumento (sin plegar todavía · compactación pendiente P3) */}
                  <div className="min-w-0 [&_h3]:text-xs [&_h3]:text-gray-400">
                    <SpectralAnalysisInstrument pcmTapRef={pcmTapRef} />
                  </div>

                  <SignalExplorerAccordion
                    liveEntries={liveEntries}
                    loading={loading}
                    onOpenCatalog={() => setView('catalog')}
                    onSelectSignal={handleSelect}
                  />

                  {/* Zona de Orquestación Científica V2 · freeze §12 (APROBADO 2026-10-04).
                      Envuelve y conecta; conserva Hero, S30, ACP, trío agrícola y KH sin cambios. */}
                  <OrchestrationZoneV2 pcmTapRef={pcmTapRef} />

                  <section className="space-y-2">
                    <div className="flex items-baseline justify-between border-b border-gray-800 pb-1">
                      <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Trío · Predecir · Vincular · Benchmark
                      </h2>
                      <span className="text-[10px] text-gray-600">modelos y labs</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:h-[214px]">
                      <ModelPredictCell />
                      <LabDoors />
                      <BenchmarkCell />
                    </div>
                  </section>

                  <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                      to="/knowledge"
                      className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/40 px-3 py-2.5 hover:border-gray-600 transition-colors"
                    >
                      <span className="text-base leading-none">📚</span>
                      <span className="text-xs font-semibold text-gray-200">Knowledge Hub</span>
                      <span className="ml-auto text-[10px] text-gray-500">{totalDocs()} docs</span>
                    </Link>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/40 px-3 py-2.5">
                      <span className="text-base leading-none">🗺️</span>
                      <span className="text-xs font-semibold text-gray-200">Roadmap Científico</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/40 px-3 py-2.5">
                      <span className="text-base leading-none">⚖️</span>
                      <label htmlFor="cmsc-honesty-filter" className="text-xs font-semibold text-gray-200">Gobernanza</label>
                      <select
                        id="cmsc-honesty-filter"
                        value={filter || ''}
                        onChange={(e) => handleHonestyFilter(e.target.value)}
                        title="Filtrar el catálogo por estado honesto"
                        className="ml-auto bg-gray-950 border border-gray-700 rounded-md text-[10px] text-gray-300 px-1.5 py-1 focus:outline-none focus:border-gray-500"
                      >
                        <option value="">Todos</option>
                        {HONESTY_STATES.map((s) => (
                          <option key={s} value={s}>{honestyMeta(s).label}</option>
                        ))}
                      </select>
                    </div>
                  </section>
                </> 
              ) : (
                <>
                  {selected ? (
                    <SignalCard signal={selected} docs={selectedDocs} onSelect={onNavigate} />
                  ) : (
                    <SignalCatalogView filter={filter} onSelectSignal={handleSelect} />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setView('overview')}
                      className="text-[11px] px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                    >
                      ← Volver a la escena
                    </button>
                    {selected && (
                      <button
                        type="button"
                        onClick={() => setSelectedSignalId(null)}
                        className="text-[11px] px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                      >
                        ← Volver al catálogo
                      </button>
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>
      {!embedded && <VoiceAssistant onNavigate={onNavigate} />}
    </ErrorBoundary>
  );
};

export default CmscDashboard;