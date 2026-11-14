import { useState, useMemo, useEffect } from 'react';
import {
  Map,
  Activity,
  Compass,
  Database,
  Wind,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  X
} from 'lucide-react';
import MarsMap from './components/MarsMap';
import DustOverlay from './components/DustOverlay';
import TelemetryView from './components/TelemetryView';
import ScienceView from './components/ScienceView';
import ArchitectureView from './components/ArchitectureView';
import { computeTelemetry, SCIENCE_TARGETS } from './data/marsData';

export default function App() {
  const [activeTab, setActiveTab] = useState('MAP');
  const [hourMtc, setHourMtc] = useState(10.5);
  const [payloadKg, setPayloadKg] = useState(12);
  const [dustDevilActive, setDustDevilActive] = useState(false);
  const [speAlertActive, setSpeAlertActive] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(SCIENCE_TARGETS[0]);
  const [isPlayingSol, setIsPlayingSol] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isPlayingSol) return;
    const interval = setInterval(() => {
      setHourMtc((prev) => (prev >= 18 ? 6 : +(prev + 0.1).toFixed(2)));
    }, 250);
    return () => clearInterval(interval);
  }, [isPlayingSol]);

  const telemetry = useMemo(
    () => computeTelemetry(hourMtc, payloadKg, dustDevilActive, speAlertActive),
    [hourMtc, payloadKg, dustDevilActive, speAlertActive]
  );

  const formattedTime = useMemo(() => {
    const hrs = Math.floor(hourMtc);
    const mins = Math.round((hourMtc - hrs) * 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} MTC`;
  }, [hourMtc]);

  const handleReset = () => {
    setIsPlayingSol(false);
    setHourMtc(10.5);
    setPayloadKg(12);
    setDustDevilActive(false);
    setSpeAlertActive(false);
    setSelectedTarget(SCIENCE_TARGETS[0]);
    setLightboxOpen(false);
  };

  return (
    <div className="flex h-screen w-screen select-none flex-col bg-[#09090B] text-zinc-100">
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-zinc-800/90 bg-[#09090B] px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 font-mono text-xs font-bold text-zinc-950">
              Æ
            </div>
            <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
              AETHON
            </span>
            <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              v2.5 3D RECON
            </span>
          </div>

          <div className="hidden items-center gap-5 border-l border-zinc-800 pl-6 font-mono text-xs md:flex">
            <div>
              <span className="text-zinc-500">P_AMB </span>
              <span className="text-zinc-200">{telemetry.localPressurePa} Pa</span>
            </div>
            <div>
              <span className="text-zinc-500">ΔP SUBLIMATOR </span>
              <span className={telemetry.deltaP > 10 ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.deltaP > 0 ? `+${telemetry.deltaP}` : telemetry.deltaP} Pa
              </span>
            </div>
            <div>
              <span className="text-zinc-500">PASCHEN </span>
              <span
                className={
                  telemetry.paschenRisk >= 1.0 ? 'font-semibold text-amber-400' : 'text-zinc-200'
                }
              >
                {telemetry.paschenRisk} Ω
              </span>
            </div>
            <div>
              <span className="text-zinc-500">WIND </span>
              <span className="text-zinc-200">{telemetry.windSpeed} m/s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDustDevilActive((p) => !p)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
              dustDevilActive
                ? 'border-amber-500/80 bg-amber-500/15 text-amber-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <Wind className="h-3.5 w-3.5 text-amber-400" />
            {dustDevilActive ? 'Dust Vortex: Active' : 'Simulate Dust Vortex'}
          </button>

          <button
            onClick={() => setSpeAlertActive((p) => !p)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
              speAlertActive
                ? 'border-rose-500/80 bg-rose-500/15 text-rose-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            {speAlertActive ? 'SPE Alert: Active' : 'Simulate Solar Event'}
          </button>

          <button
            onClick={handleReset}
            title="Reset Simulation"
            className="cursor-pointer rounded-md border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="flex w-48 shrink-0 flex-col justify-between border-r border-zinc-800/90 bg-[#09090B] p-2.5">
          <div className="space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Operations
            </div>
            {[
              { id: 'MAP', label: 'Tactical Map', icon: Map },
              { id: 'TELEMETRY', label: 'EVA Telemetry', icon: Activity },
              { id: 'SCIENCE', label: 'Science Archive', icon: Compass },
              { id: 'ARCH', label: 'NASA Pipeline', icon: Database }
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition ${
                    active
                      ? 'bg-zinc-800/90 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2.5 rounded-md border border-zinc-800/90 bg-zinc-900/40 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">PLSS O₂</span>
              <span className="font-mono text-zinc-200">{telemetry.o2Pct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-cyan-400" style={{ width: `${telemetry.o2Pct}%` }} />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Cooling H₂O</span>
              <span className="font-mono text-zinc-200">{telemetry.waterPct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-zinc-300" style={{ width: `${telemetry.waterPct}%` }} />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Dose Rate</span>
              <span className="font-mono text-zinc-200">{telemetry.uvRadiation} mSv</span>
            </div>
          </div>
        </nav>

        <main className="relative flex flex-1 overflow-hidden">
          {activeTab === 'MAP' && (
            <>
              <div className="relative h-full flex-1">
                <MarsMap
                  hourMtc={hourMtc}
                  dustDevilActive={dustDevilActive}
                  speAlertActive={speAlertActive}
                  selectedTarget={selectedTarget}
                  onSelectTarget={setSelectedTarget}
                />
                <DustOverlay active={dustDevilActive} />
              </div>

              <aside className="flex w-84 shrink-0 flex-col justify-between overflow-y-auto border-l border-zinc-800/90 bg-[#09090B] p-4">
                {selectedTarget && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${
                            selectedTarget.id === 'RECON' ? 'text-amber-400' : 'text-cyan-400'
                          }`}
                        >
                          {selectedTarget.code} // {selectedTarget.priority}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {selectedTarget.distanceKm}
                        </span>
                      </div>
                      <h2 className="mt-1 text-sm font-semibold text-zinc-100">
                        {selectedTarget.name}
                      </h2>
                      {selectedTarget.lngLat && (
                        <div className="mt-0.5 font-mono text-[11px] text-zinc-400">
                          COORD: {selectedTarget.lngLat[1]}°S, {selectedTarget.lngLat[0]}°E
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => setLightboxOpen(true)}
                      className="group relative h-44 w-full cursor-pointer overflow-hidden rounded-md border border-zinc-800 bg-zinc-950"
                    >
                      <img
                        src={selectedTarget.imageUrl}
                        onError={(e) => {
                          if (e.currentTarget.src !== selectedTarget.fallbackImage) {
                            e.currentTarget.src = selectedTarget.fallbackImage;
                          }
                        }}
                        alt={selectedTarget.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="absolute right-2 top-2 flex items-center gap-1 rounded border border-zinc-700 bg-zinc-950/85 px-2 py-1 font-mono text-[10px] text-zinc-200 group-hover:border-cyan-400 group-hover:text-cyan-300"
                      >
                        <Maximize2 className="h-3 w-3" /> Expand HD Photo
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded bg-zinc-950/85 px-2 py-0.5 font-mono text-[9px] text-zinc-300">
                        {selectedTarget.sol}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 font-mono text-[10px] uppercase text-zinc-500">
                        Primary Mission Waypoints (Or Click Map)
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {SCIENCE_TARGETS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTarget(t)}
                            className={`cursor-pointer rounded border py-1 font-mono text-[11px] font-medium transition ${
                              selectedTarget.id === t.id
                                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {t.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-md border border-zinc-800/90 bg-zinc-900/30 p-2.5 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-500">ELEV</div>
                        <div className="text-zinc-200">{selectedTarget.elevation}m</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">INERTIA</div>
                        <div className="text-zinc-200">{selectedTarget.thermalInertia} TIU</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">SVF</div>
                        <div className="text-emerald-400">{selectedTarget.svf}</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-medium text-zinc-300">{selectedTarget.mineralogy}</div>
                      <p className="leading-relaxed text-zinc-400">{selectedTarget.description}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-400">ACTIVE VECTOR</span>
                    <span className={dustDevilActive ? 'text-amber-400' : 'text-cyan-400'}>
                      {dustDevilActive ? 'ABORT TO GAMMA' : 'NOMINAL BIO-A*'}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-zinc-500">
                    Click any crater, ridge, or dune on the map to pull real NASA Curiosity ground-truth imagery.
                  </div>
                </div>
              </aside>
            </>
          )}

          {activeTab === 'TELEMETRY' && (
            <div className="flex-1">
              <TelemetryView telemetry={telemetry} hourMtc={hourMtc} payloadKg={payloadKg} />
            </div>
          )}

          {activeTab === 'SCIENCE' && (
            <div className="flex-1">
              <ScienceView
                onLocateTarget={(target) => {
                  setSelectedTarget(target);
                  setActiveTab('MAP');
                }}
              />
            </div>
          )}

          {activeTab === 'ARCH' && (
            <div className="flex-1">
              <ArchitectureView />
            </div>
          )}
        </main>
      </div>

      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-zinc-800/90 bg-[#09090B] px-4">
        <div className="flex max-w-3xl flex-1 items-center gap-4">
          <button
            type="button"
            onClick={() => setIsPlayingSol((p) => !p)}
            className="flex cursor-pointer items-center gap-1.5 rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:border-cyan-500"
          >
            {isPlayingSol ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="font-mono">{formattedTime}</span>
          </button>

          <div className="flex flex-1 items-center gap-3">
            <span className="font-mono text-[11px] text-zinc-500">06:00</span>
            <input
              type="range"
              min="6"
              max="18"
              step="0.1"
              value={hourMtc}
              onChange={(e) => setHourMtc(parseFloat(e.target.value))}
              className="flex-1 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-zinc-500">18:00 MTC</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-zinc-800 pl-6">
          <span className="text-xs text-zinc-400">Sample Load</span>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={payloadKg}
            onChange={(e) => setPayloadKg(parseInt(e.target.value, 10))}
            className="w-32 cursor-pointer"
          />
          <span className="w-12 font-mono text-xs font-medium text-zinc-200">{payloadKg} kg</span>
        </div>
      </footer>

      {lightboxOpen && selectedTarget && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-6 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-[#09090B] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div>
                <span className="font-mono text-[10px] font-semibold text-cyan-400">
                  {selectedTarget.code} // {selectedTarget.sol}
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">{selectedTarget.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="cursor-pointer rounded border border-zinc-800 p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
              <img
                src={selectedTarget.imageUrl}
                onError={(e) => {
                  if (e.currentTarget.src !== selectedTarget.fallbackImage) {
                    e.currentTarget.src = selectedTarget.fallbackImage;
                  }
                }}
                alt={selectedTarget.name}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-300">
              <span>{selectedTarget.description}</span>
              <span className="ml-4 shrink-0 font-mono text-cyan-400">
                ELEV: {selectedTarget.elevation}m | TIU: {selectedTarget.thermalInertia}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
