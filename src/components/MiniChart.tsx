import { useEffect, useRef } from "react";
import type { DayStat } from "@/types";

// ─── constants ────────────────────────────────────────────────────────────────
const CANVAS_H = 88;
const BASELINE_R = 0.64;
const SCROLL_SPEED = 0.7;
const GRID_SPACING = 22;
const FLAT_GAP = 18;   // px between spikes
const PRE_LEAD = 60;   // lead-in flat px

// ─── waveform builder ─────────────────────────────────────────────────────────
// Flat baseline everywhere; one fixed-height sharp spike per individual request hit.
function buildWaveform(data: DayStat[]): Float32Array {
  const baseline = CANVAS_H * BASELINE_R;
  const buf: number[] = [];

  const flat = (n: number) => {
    for (let i = 0; i < n; i++) buf.push(baseline);
  };

  // One sharp ECG QRS spike — identical every time (each request = one beat)
  const spike = () => {
    buf.push(baseline + 3, baseline + 5);                    // Q dip
    buf.push(baseline - 16, baseline - 40, baseline - 54);  // R rising
    buf.push(baseline - 40, baseline - 16);                  // R falling
    buf.push(baseline + 10, baseline + 5, baseline + 2);    // S dip
    buf.push(baseline);                                      // return
  };

  const sorted = [...data].sort((a, b) => a.day.localeCompare(b.day));

  flat(PRE_LEAD);

  for (const day of sorted) {
    if (day.requests === 0) {
      flat(FLAT_GAP * 3);  // silent day = longer flat stretch
    } else {
      for (let i = 0; i < day.requests; i++) {
        flat(FLAT_GAP);
        spike();
      }
      flat(FLAT_GAP);
    }
  }

  flat(PRE_LEAD);

  return new Float32Array(buf);
}

// ─── component ────────────────────────────────────────────────────────────────
export function MiniChart({ data }: { data: DayStat[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let animId: number;
    let offset = 0;
    let waveform = buildWaveform(data);
    let W = 0;
    let cursorX = 0;
    const baseline = CANVAS_H * BASELINE_R;

    const setup = () => {
      W = container.clientWidth;
      cursorX = Math.round(W * 0.78);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(CANVAS_H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${CANVAS_H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      waveform = buildWaveform(data);
    };

    setup();

    const draw = () => {
      ctx.clearRect(0, 0, W, CANVAS_H);

      // background
      ctx.fillStyle = "#080d14";
      ctx.fillRect(0, 0, W, CANVAS_H);

      // ECG-paper grid
      ctx.strokeStyle = "rgba(57,211,83,0.07)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < CANVAS_H; y += GRID_SPACING) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let x = 0; x < W; x += GRID_SPACING) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
      }
      // centre baseline (slightly brighter)
      ctx.strokeStyle = "rgba(57,211,83,0.14)";
      ctx.beginPath(); ctx.moveTo(0, baseline); ctx.lineTo(W, baseline); ctx.stroke();

      // waveform — clipped to left of scanning cursor
      const len = waveform.length;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, cursorX, CANVAS_H);
      ctx.clip();

      // outer glow
      ctx.beginPath();
      ctx.strokeStyle = "rgba(57,211,83,0.22)";
      ctx.lineWidth = 5;
      ctx.shadowColor = "#39d353";
      ctx.shadowBlur = 14;
      for (let x = 0; x <= cursorX; x++) {
        const idx = ((Math.floor(offset) + x) % len + len) % len;
        const y = waveform[idx];
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // crisp inner line
      ctx.beginPath();
      ctx.strokeStyle = "#39d353";
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (let x = 0; x <= cursorX; x++) {
        const idx = ((Math.floor(offset) + x) % len + len) % len;
        const y = waveform[idx];
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // scanning cursor bar
      const cg = ctx.createLinearGradient(cursorX - 1, 0, cursorX + 2, 0);
      cg.addColorStop(0, "rgba(57,211,83,0)");
      cg.addColorStop(0.5, "rgba(57,211,83,0.6)");
      cg.addColorStop(1, "rgba(57,211,83,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(cursorX - 1, 0, 3, CANVAS_H);

      // glowing dot at exact waveform y
      const dotIdx = ((Math.floor(offset) + cursorX) % len + len) % len;
      const dotY = waveform[dotIdx];
      ctx.beginPath();
      ctx.arc(cursorX, dotY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#39d353";
      ctx.shadowColor = "#39d353";
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;

      // right-side fade (blank paper ahead)
      const fg = ctx.createLinearGradient(cursorX, 0, W, 0);
      fg.addColorStop(0, "rgba(8,13,20,0.88)");
      fg.addColorStop(1, "rgba(8,13,20,0.97)");
      ctx.fillStyle = fg;
      ctx.fillRect(cursorX, 0, W - cursorX, CANVAS_H);

      offset = (offset + SCROLL_SPEED) % len;
      animId = requestAnimationFrame(draw);
    };

    draw();

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(animId);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      setup();
      offset = 0;
      draw();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-md overflow-hidden"
      style={{ background: "#080d14" }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
