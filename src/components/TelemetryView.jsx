import { Gauge, Zap } from 'lucide-react';

export default function TelemetryView({ telemetry, hourMtc, payloadKg }) {
  const matrixCells = Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const slope = ((row * 3 + col * 2) % 24) + 2;
    const risk = +(
      telemetry.paschenRisk * (0.65 + ((row + col) % 5) * 0.12)
    ).toFixed(2);
    return { id: i, slope, risk };
  });

  return (
    <div className="h-full overflow-y-auto bg-[#09090B] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              EVA Suit Telemetry &amp; Physics Verification Matrix
            </h2>
            <p className="text-xs text-zinc-400">
              Real-time PLSS consumables and sub-6-millibar thermodynamic boundaries at{' '}
              {hourMtc.toFixed(1)}h MTC ({payloadKg} kg sample load)
            </p>
          </div>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-400">
            ALL MATHEMATICAL MODELS LOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Primary O₂ Reserve', value: `${telemetry.o2Pct}%`, sub: 'PLSS Tank Pressure 6.2 MPa' },
            { label: 'Sublimator Feedwater', value: `${telemetry.waterPct}%`, sub: 'Porous Plate Mass Flow' },
            { label: 'Solid-State Battery', value: `${telemetry.batteryPct}%`, sub: '28V Bus Nominal' },
            { label: 'Metabolic Expenditure', value: `${telemetry.kcalBurned} kcal`, sub: `RCA CO₂ Scrubber: ${telemetry.co2ScrubberPct}%` }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="text-xs text-zinc-400">{item.label}</div>
              <div className="mt-2 font-mono text-2xl font-semibold text-zinc-100">{item.value}</div>
              <div className="mt-1 text-[11px] text-zinc-500">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-7">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  <Zap className="h-4 w-4 text-cyan-400" /> 1. Paschen Breakdown &amp; Triboelectric Model
                </span>
                <span className="font-mono text-xs text-cyan-400">
                  Ω_Paschen = {telemetry.paschenRisk}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                At Martian surface pressures (~6.1 mbar), CO₂ electrical breakdown strength drops to ~20 kV/m.
                Saltating dust over low thermal inertia sand drifts induces triboelectric fields.
              </p>
              <p className="mt-2 font-mono text-[11px] text-cyan-300">
                E_crit = 20.0 × (P_ambient / 650) · E_induced = 0.5 × v^1.4 × dustFactor · Ω = E_induced / E_crit
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 rounded border border-zinc-800/80 bg-zinc-950 p-3 font-mono text-xs sm:grid-cols-3">
                <div>
                  <div className="text-[10px] text-zinc-500">E_crit (Townsend)</div>
                  <div className="text-zinc-200">{telemetry.eCrit} kV/m</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">E_induced (Wind)</div>
                  <div className="text-zinc-200">{telemetry.eInduced} kV/m</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Discharge Status</div>
                  <div className={telemetry.paschenRisk >= 1 ? 'text-amber-400' : 'text-emerald-400'}>
                    {telemetry.paschenRisk >= 1 ? 'CRITICAL ARC' : 'SAFE MARGIN'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  <Gauge className="h-4 w-4 text-cyan-400" /> 2. Sublimator Triple-Point Margin (611.65 Pa)
                </span>
                <span className="font-mono text-xs text-cyan-400">
                  ΔP = {telemetry.deltaP > 0 ? `+${telemetry.deltaP}` : telemetry.deltaP} Pa
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Spacesuit porous-plate sublimators require ambient pressure below the H₂O triple point
                (611.65 Pa) so ice sublimates directly to vapor. Descending into deep depressions risks liquid
                flooding of the cooling plate.
              </p>
              <p className="mt-2 font-mono text-[11px] text-cyan-300">
                ΔP = 611.65 Pa − P_ambient
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 rounded border border-zinc-800/80 bg-zinc-950 p-3 font-mono text-xs sm:grid-cols-3">
                <div>
                  <div className="text-[10px] text-zinc-500">P_ambient</div>
                  <div className="text-zinc-200">{telemetry.localPressurePa} Pa</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">H₂O Triple Point</div>
                  <div className="text-zinc-200">611.65 Pa</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Plate State</div>
                  <div className="text-zinc-200">{telemetry.sublimatorStatus}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 xl:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Bio-A* Cost Grid (Gale Sector)
              </span>
              <span className="font-mono text-[11px] text-zinc-400">10×10 SAMPLE / 100×100 DTM</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Live traversability cost per sector combining slope angle θ, thermal inertia, and Paschen risk.
            </p>
            <div className="mt-4 grid grid-cols-10 gap-1">
              {matrixCells.map((cell) => {
                const highRisk = cell.risk >= 0.9 || cell.slope > 20;
                return (
                  <div
                    key={cell.id}
                    className={`flex flex-col items-center justify-center rounded border py-2 font-mono text-[10px] ${
                      highRisk
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                    }`}
                    title={`Slope: ${cell.slope}° | Risk: ${cell.risk}`}
                  >
                    <span>{cell.slope}°</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-zinc-500">
              <span>■ Nominal Bedrock (&lt;20° slope)</span>
              <span className="text-amber-400">■ High Cost / Cutoff Sector</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
