import React, { useEffect, useMemo, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import TopNav from '../components/TopNav.jsx';
import VoiceAssistant from '../components/VoiceAssistant.jsx';
import SignalRiver from './cmsc/SignalRiver.jsx';
import HonestyThermometer from './cmsc/HonestyThermometer.jsx';
import HonestyBadge from './cmsc/HonestyBadge.jsx';
import SignalCatalogView from './cmsc/SignalCatalogView.jsx';
import SignalCard from './cmsc/SignalCard.jsx';
import EvidencePanel from './cmsc/EvidencePanel.jsx';
import RiverSummary from './cmsc/RiverSummary.jsx';
import LatestEvidence from './cmsc/LatestEvidence.jsx';
import LabDoors from './cmsc/LabDoors.jsx';
import ScientificStatus from './cmsc/ScientificStatus.jsx';
import SpectralAnalysisInstrument from './cmsc/SpectralAnalysisInstrument.jsx';
import CmscSideNav from './cmsc/CmscSideNav.jsx';
import SignalExplorerCell from './cmsc/SignalExplorerCell.jsx';
import MathModelingCell from './cmsc/MathModelingCell.jsx';
import ModelPredictCell from './cmsc/ModelPredictCell.jsx';
import BenchmarkCell from './cmsc/BenchmarkCell.jsx';
import AcpCell from './cmsc/AcpCell.jsx';
import { NEON, HONESTY_STATES } from './cmsc/honesty.js';
import { readLiveSignals } from '../services/cmscAdapters.js';
import { docsBySignal, categorySummary, totalDocs } from '../services/docsBySignal.js';
import { useLabStore } from '../stores/useLabStore.js';

const CmscDashboard = ({ embedded = true, clusterNodes = [], onNavigate }) => {
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

  const catalogCounts = useMemo(() => {
    const counts = {};
    HONESTY_STATES.forEach((s) => (counts[s] = 0));
    catalog.forEach((signal) => {
      if (counts[signal.estado] !== undefined) counts[signal.estado] += 1;
    });
    return counts;
  }, [catalog]);

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

  return (
    <ErrorBoundary>
      {!embedded && <TopNav clusterNodes={clusterNodes} />}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-16 min-h-screen" style={{ backgroundColor: NEON.darkBackground }}>
        <div className="max-w-7xl mx-auto space-y-4">
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

            <main className="lg:col-span-8 min-w-0 space-y-4">
              {view === 'overview' ? (
                <>
                  <section className="space-y-2">
                    <div className="flex items-baseline justify-between border-b border-gray-800 pb-1">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Trío · Explorar · Modelar · Analizar
                      </h2>
                      <span className="text-[10px] text-gray-500">escena científica</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <SignalExplorerCell
                        liveEntries={liveEntries}
                        loading={loading}
                        onOpenCatalog={() => setView('catalog')}
                        onSelectSignal={handleSelect}
                      />
                      <MathModelingCell />
                      <SpectralAnalysisInstrument />
                    </div>
                  </section>

                  <section className="space-y-2">
                    <div className="flex items-baseline justify-between border-b border-gray-800 pb-1">
                      <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Trío · Predecir · Vincular · Benchmark
                      </h2>
                      <span className="text-[10px] text-gray-600">modelos y labs</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <ModelPredictCell />
                      <LabDoors />
                      <BenchmarkCell />
                    </div>
                  </section>

                  <div className="border-t border-gray-800/50" />
                  <AcpCell />
                  <div className="border-t border-gray-800/50" />

                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <HonestyThermometer
                      liveEntries={liveEntries}
                      catalogCounts={catalogCounts}
                      activeFilter={view === 'catalog' ? filter : null}
                      onFilter={view === 'catalog' ? setFilter : null}
                    />
                    <RiverSummary signals={catalog} onSelectSignal={handleRiverSelect} />
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <LatestEvidence />
                    <ScientificStatus />
                  </div>
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

            <aside className="lg:col-span-2 min-w-0">
              <div className="lg:sticky lg:top-20">
                <EvidencePanel
                  stats={{ total: totalDocs() }}
                  byCategory={categorySummary()}
                  signal={selected}
                  docs={selectedDocs}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
      {!embedded && <VoiceAssistant onNavigate={onNavigate} />}
    </ErrorBoundary>
  );
};

export default CmscDashboard;