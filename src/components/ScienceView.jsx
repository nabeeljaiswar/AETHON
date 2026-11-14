import { SCIENCE_TARGETS } from '../data/marsData';
import { MapPin, ArrowUpRight } from 'lucide-react';

export default function ScienceView({ onLocateTarget }) {
  return (
    <div className="h-full overflow-y-auto bg-[#09090B] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              Ground-Truth Science Targets // Curiosity Mastcam Archive
            </h2>
            <p className="text-xs text-zinc-400">
              Verified geological waypoints within the 2 km × 2 km Mount Sharp Boxwork EVA sector
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-400">MSL PDS GEOSCIENCES NODE</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SCIENCE_TARGETS.map((target) => (
            <div
              key={target.id}
              className="flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden border-b border-zinc-800 bg-zinc-950">
                  <img
                    src={target.imageUrl}
                    onError={(e) => {
                      if (e.currentTarget.src !== target.fallbackImage) {
                        e.currentTarget.src = target.fallbackImage;
                      }
                    }}
                    alt={target.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded border border-zinc-700 bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400">
                    {target.code} // {target.id}
                  </span>
                  <span className="absolute bottom-2 right-2 rounded bg-zinc-950/85 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                    {target.distanceKm} from HAB
                  </span>
                </div>

                <div className="p-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {target.priority}
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-100">{target.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{target.description}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-800/80 pt-3 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-500">ELEVATION</div>
                      <div className="text-zinc-200">{target.elevation}m</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">INERTIA</div>
                      <div className="text-zinc-200">{target.thermalInertia} TIU</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">SVF SHIELD</div>
                      <div className="text-emerald-400">{target.svf}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 bg-zinc-950/60 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onLocateTarget(target)}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-900 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-cyan-500 hover:text-cyan-400"
                >
                  <MapPin className="h-3.5 w-3.5" /> Inspect on Tactical Map
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
