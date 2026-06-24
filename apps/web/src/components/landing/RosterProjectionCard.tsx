import { useEffect, useRef, useState } from "react";

const roster = [
  { name: "Tatum, J.", overall: 95.2 },
  { name: "Brown, J.", overall: 90.5 },
  { name: "White, D.", overall: 89.1 },
  { name: "Vucevic, N.", overall: 86.1 },
];

export function RosterProjectionCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setTriggered(true);
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={cardRef}
      className="col-span-12 md:col-span-4 glass-panel rounded-lg p-sm h-[320px] flex flex-col"
    >
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            group
          </span>
          <span className="font-label-caps text-[10px] text-tertiary">
            ROSTER PROJ
          </span>
        </div>
        <span className="font-data-mono text-[10px] text-primary">LIVE</span>
      </div>

      <div className="flex-1 overflow-hidden">
        {roster.map((player, i) => (
          <div key={player.name}>
            <div className="font-data-mono text-xs text-on-surface mb-2 flex justify-between">
              <span>{player.name}</span>
              <span className="text-secondary">{player.overall} OVR</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mb-4">
              <div
                className="bg-secondary h-1.5 rounded-full"
                style={{
                  width: triggered ? `${player.overall}%` : "0%",
                  transition: `width 1.2s cubic-bezier(0.65, 0, 0.35, 1) ${i * 0.15}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
