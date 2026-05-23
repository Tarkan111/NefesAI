import React, { useState } from 'react';
import { StressLevel } from '../lib/types';
import { Frown, Meh, Smile, Sun, Cloud, CloudRain, AlertCircle, Sparkles } from 'lucide-react';

interface StressAssessmentProps {
  onComplete: (level: StressLevel) => void;
}

const stressOptions: { level: StressLevel; label: string; icon: typeof Frown; color: string; bgColor: string }[] = [
  { level: 1, label: 'Çok Rahat', icon: Sun, color: 'text-amber-500', bgColor: 'bg-amber-50' },
  { level: 2, label: 'Rahat', icon: Cloud, color: 'text-sky-500', bgColor: 'bg-sky-50' },
  { level: 3, label: 'Normal', icon: Smile, color: 'text-teal-500', bgColor: 'bg-teal-50' },
  { level: 4, label: 'Stresli', icon: CloudRain, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { level: 5, label: 'Çok Stresli', icon: AlertCircle, color: 'text-slate-600', bgColor: 'bg-slate-100' },
];

export function StressAssessment({ onComplete }: StressAssessmentProps) {
  const [selected, setSelected] = useState<StressLevel | null>(null);
  const [hovered, setHovered] = useState<StressLevel | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Şu an nasıl hissediyorsun?</h2>
        <p className="text-gray-600">Seviyeni seç ve sana uygun önerileri keşfet</p>
      </div>

      <div className="grid grid-cols-5 gap-3 sm:gap-4 mb-8">
        {stressOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.level;
          const isHovered = hovered === option.level;

          return (
            <button
              key={option.level}
              onClick={() => setSelected(option.level)}
              onMouseEnter={() => setHovered(option.level)}
              onMouseLeave={() => setHovered(null)}
              className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? `${option.bgColor} ring-2 ring-offset-2 ring-teal-400 scale-110 shadow-lg z-10`
                  : isHovered
                  ? `${option.bgColor} scale-105 shadow-md`
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`mb-2 ${isSelected || isHovered ? option.color : 'text-gray-400'}`}>
                <Icon className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300" />
              </div>
              <span className={`text-xs sm:text-sm font-medium text-center ${
                isSelected || isHovered ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {option.level}
              </span>
              <span className="text-xs text-gray-400 mt-1 hidden sm:block">{option.label}</span>

              {isSelected && (
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-2xl opacity-20 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 mb-4">
            <span className="text-sm text-teal-700">
              Seviye {selected} - {stressOptions.find(o => o.level === selected)?.label}
            </span>
          </div>

          <button
            onClick={() => onComplete(selected)}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
          >
            Devam Et
          </button>
        </div>
      )}
    </div>
  );
}
