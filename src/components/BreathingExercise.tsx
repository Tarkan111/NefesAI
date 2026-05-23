import React, { useState, useEffect, useRef } from 'react';
import { BreathingPattern } from '../lib/types';
import { Play, Pause, RotateCcw, Wind, ChevronLeft } from 'lucide-react';

interface BreathingExerciseProps {
  onBack?: () => void;
}

const patterns: BreathingPattern[] = [
  { name: '4-7-8 Nefes', inhale: 4, hold1: 7, exhale: 8, cycles: 4 },
  { name: 'Kutu Nefes', inhale: 4, hold1: 4, exhale: 4, hold2: 4, cycles: 4 },
  { name: 'Rahatlatıcı', inhale: 4, exhale: 6, cycles: 5 },
];

type Phase = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2';

const phaseLabels: Record<Phase, string> = {
  idle: 'Hazır',
  inhale: 'Nefes Al',
  hold1: 'Tut',
  exhale: 'Nefes Ver',
  hold2: 'Bekle',
};

export function BreathingExercise({ onBack }: BreathingExerciseProps) {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(patterns[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let currentPhase: Phase = 'inhale';
    let currentCount = selectedPattern.inhale;
    let currentCycle = 1;

    setPhase(currentPhase);
    setCountdown(currentCount);
    setCycle(currentCycle);

    intervalRef.current = window.setInterval(() => {
      currentCount--;

      if (currentCount <= 0) {
        // Move to next phase
        if (currentPhase === 'inhale') {
          if (selectedPattern.hold1) {
            currentPhase = 'hold1';
            currentCount = selectedPattern.hold1;
          } else {
            currentPhase = 'exhale';
            currentCount = selectedPattern.exhale;
          }
        } else if (currentPhase === 'hold1') {
          currentPhase = 'exhale';
          currentCount = selectedPattern.exhale;
        } else if (currentPhase === 'exhale') {
          if (selectedPattern.hold2) {
            currentPhase = 'hold2';
            currentCount = selectedPattern.hold2;
          } else {
            // Next cycle or finish
            if (currentCycle >= selectedPattern.cycles) {
              setIsActive(false);
              setPhase('idle');
              return;
            }
            currentCycle++;
            currentPhase = 'inhale';
            currentCount = selectedPattern.inhale;
            setCycle(currentCycle);
          }
        } else if (currentPhase === 'hold2') {
          // Next cycle or finish
          if (currentCycle >= selectedPattern.cycles) {
            setIsActive(false);
            setPhase('idle');
            return;
          }
          currentCycle++;
          currentPhase = 'inhale';
          currentCount = selectedPattern.inhale;
          setCycle(currentCycle);
        }

        setPhase(currentPhase);
      }

      setCountdown(currentCount);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, selectedPattern]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('idle');
    setCountdown(0);
    setCycle(0);
  };

  const getCircleSize = () => {
    if (phase === 'idle') return 'scale-100';
    if (phase === 'inhale') return 'scale-150';
    if (phase === 'hold1' || phase === 'hold2') return 'scale-150';
    return 'scale-100';
  };

  const getCircleColor = () => {
    if (phase === 'idle') return 'from-teal-400 to-emerald-400';
    if (phase === 'inhale') return 'from-sky-400 to-blue-500';
    if (phase === 'hold1' || phase === 'hold2') return 'from-amber-400 to-orange-400';
    return 'from-teal-400 to-emerald-400';
  };

  const progress = cycle / selectedPattern.cycles;

  return (
    <div className="max-w-xl mx-auto px-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
      )}

      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Wind className="w-6 h-6 text-teal-500" />
          <h2 className="text-xl font-bold text-gray-800">Nefes Egzersizi</h2>
        </div>

        {/* Pattern Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {patterns.map((pattern) => (
            <button
              key={pattern.name}
              onClick={() => {
                handleReset();
                setSelectedPattern(pattern);
              }}
              disabled={isActive}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedPattern.name === pattern.name
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pattern.name}
            </button>
          ))}
        </div>

        {/* Breathing Circle */}
        <div className="relative flex flex-col items-center justify-center mb-8">
          <div
            className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br ${getCircleColor()}
              flex items-center justify-center shadow-2xl transition-all duration-1000 ease-in-out ${getCircleSize()}`}
          >
            <div className="text-center text-white">
              {phase !== 'idle' && (
                <>
                  <div className="text-5xl sm:text-6xl font-bold mb-1">{countdown}</div>
                  <div className="text-sm sm:text-base font-medium">{phaseLabels[phase]}</div>
                </>
              )}
              {phase === 'idle' && (
                <div className="text-lg text-white/80">Başlamak için oyna</div>
              )}
            </div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute w-56 h-56 sm:w-64 sm:h-64 -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeDasharray={`${progress * 300} 300`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Cycle Counter */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100">
            <span className="text-sm text-gray-600">Tur:</span>
            <span className="font-bold text-teal-600">{cycle}/{selectedPattern.cycles}</span>
          </div>
        </div>

        {/* Pattern Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-gray-500 mb-1">Nefes Al</div>
              <div className="font-bold text-gray-800">{selectedPattern.inhale}s</div>
            </div>
            {selectedPattern.hold1 && (
              <div>
                <div className="text-gray-500 mb-1">Tut</div>
                <div className="font-bold text-gray-800">{selectedPattern.hold1}s</div>
              </div>
            )}
            <div>
              <div className="text-gray-500 mb-1">Nefes Ver</div>
              <div className="font-bold text-gray-800">{selectedPattern.exhale}s</div>
            </div>
            {selectedPattern.hold2 && (
              <div>
                <div className="text-gray-500 mb-1">Bekle</div>
                <div className="font-bold text-gray-800">{selectedPattern.hold2}s</div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
            >
              <Play className="w-5 h-5" />
              Başla
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
            >
              <Pause className="w-5 h-5" />
              Duraklat
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
