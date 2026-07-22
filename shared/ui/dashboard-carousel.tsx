"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export interface Slide {
  id: string;
  title: string;
  render: () => ReactNode;
}

interface Props {
  slides: Slide[];
  intervalSeconds?: number;
}

export function DashboardCarousel({ slides, intervalSeconds = 10 }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open || !playing) {
      setProgress(0);
      return;
    }
    const totalMs = intervalSeconds * 1000;
    const tickMs = 100;
    let elapsed = 0;
    progressRef.current = setInterval(() => {
      elapsed += tickMs;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);
      if (elapsed >= totalMs) {
        setIndex((i) => (i + 1) % slides.length);
        elapsed = 0;
      }
    }, tickMs);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [open, playing, index, intervalSeconds, slides.length]);

  // Atalhos de teclado quando aberto
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + slides.length) % slides.length);
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, slides.length]);

  if (slides.length === 0) return null;
  const current = slides[index];

  return (
    <>
      {/* Botão para abrir o carousel */}
      <button
        onClick={() => { setOpen(true); setIndex(0); setPlaying(true); }}
        className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl p-5 shadow-lg transition-all hover:shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs uppercase tracking-wider opacity-80">📊 Apresentação executiva</p>
            <p className="text-lg font-bold mt-0.5">Ver gráficos em modo apresentação</p>
            <p className="text-sm opacity-80 mt-0.5">{slides.length} gráficos · {intervalSeconds}s cada · controlo manual</p>
          </div>
          <div className="bg-white/20 group-hover:bg-white/30 p-3 rounded-full transition-colors">
            <Play className="h-5 w-5" />
          </div>
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded">
                  {index + 1} / {slides.length}
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {current.title}
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Anterior (←)"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className={`p-2 rounded-lg ${playing ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                  title={playing ? "Pausar (Espaço)" : "Reproduzir (Espaço)"}
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setIndex((i) => (i + 1) % slides.length)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Próximo (→)"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Fechar (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${playing ? progress : 0}%`, transitionDuration: playing ? "100ms" : "0ms" }}
              />
            </div>

            {/* Slide content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                {current.render()}
              </div>
            </div>

            {/* Footer com pontos de navegação */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${i === index ? "bg-blue-600 w-8" : "bg-gray-300 dark:bg-gray-700 w-2 hover:bg-gray-400"}`}
                    title={s.title}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                ← → navegar · Espaço play/pause · Esc fechar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
