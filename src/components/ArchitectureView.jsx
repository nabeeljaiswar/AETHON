import { NASA_DATASETS } from '../data/marsData';
import { CheckCircle2, Database, Layers } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="h-full overflow-y-auto bg-[#09090B] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
            <Layers className="h-5 w-5 text-cyan-400" />
            System Architecture &amp; Multi-Mission NASA Data Pipeline
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Telemetry models run locally; basemap tiles and archive imagery may require an internet connection.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {NASA_DATASETS.map((ds) => (
            <div key={ds.instrument} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-mono text-xs font-semibold text-cyan-400">
                  <Database className="h-3.5 w-3.5 shrink-0" />
                  {ds.instrument}
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                  {ds.resolution}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">{ds.role}</p>
              <div className="mt-3 text-[11px] text-zinc-500">Archive: {ds.source}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Autonomous Bio-A* Pathfinding Objective Function
          </h3>
          <div className="overflow-x-auto rounded border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-cyan-300">
            Cost(u → v) = Δd · (1 + 0.18|θ| + 0.045θ²) · μ_regolith · (1 + Ω_Paschen) · SVF
          </div>
          <p className="text-xs leading-relaxed text-zinc-400">
            Model constraints proposed for route planning assign infinite traversal cost (∞) to DTM cells
            where slope θ &gt; 25°, lava-tube roof thickness &lt; 1.0 m, or ambient pressure exceeds the
            611.65 Pa water triple-point sublimator limit. The current app visualizes predefined routes and
            telemetry; it does not calculate this objective against a live DTM.
          </p>
        </div>
      </div>
    </div>
  );
}
