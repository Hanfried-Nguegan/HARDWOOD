import { useEffect, useRef, useState, useCallback } from "react";

const LOGS = [
  { text: "> Init synergy_data_v4...", status: "OK", statusClass: "text-green-500" },
  { text: "> Fetching tracking pos: [22, 14]", status: "", statusClass: "" },
  { text: "> WARN: Anomaly detected in USG%", status: "RECALIBRATING", statusClass: "text-primary" },
  { text: "> Matchup sim complete: 10,000 iter", status: "READY", statusClass: "text-secondary" },
  { text: "> Loading visualizer engine...", status: "OK", statusClass: "text-green-500" },
  { text: "> Syncing global draft intel database...", status: "", statusClass: "" },
  { text: "> Projections updated for class 2025", status: "SUCCESS", statusClass: "text-green-500" },
  { text: "> Running Monte Carlo trade scenario #491", status: "RUNNING", statusClass: "text-primary" },
  { text: "> Analytics node active: Seattle-1", status: "ONLINE", statusClass: "text-green-500" },
  { text: "> Recalculating BPM deltas...", status: "OK", statusClass: "text-green-500" },
  { text: "> Trade value model loaded", status: "READY", statusClass: "text-secondary" },
  { text: "> Calibrating defensive ratings...", status: "", statusClass: "" },
  { text: "> Draft board v12 synced", status: "SUCCESS", statusClass: "text-green-500" },
];

const MAX_VISIBLE_LOGS = 8;
const CHAR_SPEED_MS = 28;

interface LogLine {
  id: number;
  text: string;
  status: string;
  statusClass: string;
  typedText: string;
  isTyping: boolean;
  visible: boolean;
}

type TypeNextCharFn = (logId: number, fullText: string, charIndex: number) => void;

export function TerminalLogCard() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logIndexRef = useRef(0);
  const idRef = useRef(0);
  const isTypingRef = useRef(false);
  const typeNextCharRef = useRef<TypeNextCharFn | null>(null);

  // Define the typing function once, store it in the ref via an effect —
  // never assign to a ref's .current during render itself
  useEffect(() => {
    const typeNextChar: TypeNextCharFn = (logId, fullText, charIndex) => {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? { ...l, typedText: fullText.slice(0, charIndex), isTyping: charIndex < fullText.length }
            : l
        )
      );

      if (charIndex < fullText.length) {
        setTimeout(() => typeNextCharRef.current?.(logId, fullText, charIndex + 1), CHAR_SPEED_MS);
      } else {
        isTypingRef.current = false;
      }
    };

    typeNextCharRef.current = typeNextChar;
  }, []);

  const addLog = useCallback(() => {
    if (isTypingRef.current) return;
    if (!typeNextCharRef.current) return; // not ready yet on first tick
    isTypingRef.current = true;

    const source = LOGS[logIndexRef.current % LOGS.length];
    const newLine: LogLine = {
      id: idRef.current++,
      text: source.text,
      status: source.status,
      statusClass: source.statusClass,
      typedText: "",
      isTyping: true,
      visible: false,
    };

    setLogs((prev) => {
      const next = [...prev, newLine];
      return next.length > MAX_VISIBLE_LOGS ? next.slice(1) : next;
    });

    setTimeout(() => {
      setLogs((prev) =>
        prev.map((l) => (l.id === newLine.id ? { ...l, visible: true } : l))
      );
      typeNextCharRef.current?.(newLine.id, source.text, 0);
    }, 16);

    logIndexRef.current++;
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const checkAndSchedule = () => {
        if (!isTypingRef.current) {
          const delay = Math.random() * 300 + 500;
          setTimeout(() => {
            addLog();
            setTimeout(checkAndSchedule, 100);
          }, delay);
        } else {
          setTimeout(checkAndSchedule, 50);
        }
      };
      checkAndSchedule();
    };

    const initialDelay = setTimeout(scheduleNext, 400);
    return () => clearTimeout(initialDelay);
  }, [addLog]);

  return (
    <div className="col-span-12 md:col-span-3 glass-panel rounded-lg p-sm h-[320px] flex flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-label-caps text-[10px] text-tertiary">
            TERMINAL LOG
          </span>
        </div>
        <span className="font-data-mono text-[9px] text-tertiary/50">LIVE</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col gap-[3px]">
        {logs.map((log, i) => {
          const isLast = i === logs.length - 1;
          return (
            <div
              key={log.id}
              style={{
                opacity: log.visible ? 1 : 0,
                transform: log.visible ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
              }}
              className="font-data-mono text-[10px] text-tertiary leading-[1.6] flex items-center gap-1 min-h-[16px]"
            >
              <span
                style={{
                  opacity: i === logs.length - 1 ? 1 : i === logs.length - 2 ? 0.75 : 0.45,
                }}
                className="flex-1"
              >
                {log.isTyping ? log.typedText : log.text}
                {!log.isTyping && log.status && (
                  <span className={`${log.statusClass} ml-1.5 text-[9px]`}>
                    {log.status}
                  </span>
                )}
                {isLast && <span className="terminal-cursor" />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}