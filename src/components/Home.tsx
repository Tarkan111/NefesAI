import React, { useState } from 'react';
import { StressLevel } from '../lib/types';
import { StressAssessment } from './StressAssessment';
import { BreathingExercise } from './BreathingExercise';
import { SoundsPlayer } from './SoundsPlayer';
import { Journal } from './Journal';
import { MeditationGuide } from './MeditationGuide';
import { Wind, Brain, Volume2, BookOpen, RefreshCw } from 'lucide-react';

type View = 'assessment' | 'recommendations' | 'breathing' | 'sounds' | 'journal' | 'meditation';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: typeof Wind;
  component: View;
  priority: number;
}

export function Home() {
  const [stressLevel, setStressLevel] = useState<StressLevel | null>(null);
  const [currentView, setCurrentView] = useState<View>('assessment');

  const getRecommendations = (level: StressLevel): Recommendation[] => {
    const baseRecommendations: Recommendation[] = [
      {
        id: 'breathing',
        title: 'Nefes Egzersizi',
        description: 'Derin nefes alma teknikleri ile sakinleş',
        icon: Wind,
        component: 'breathing',
        priority: level >= 4 ? 10 : level <= 2 ? 3 : 5,
      },
      {
        id: 'meditation',
        title: 'Meditasyon',
        description: '1 dakikalık odaklanma rehberi',
        icon: Brain,
        component: 'meditation',
        priority: level >= 3 ? 8 : 4,
      },
      {
        id: 'sounds',
        title: 'Rahatlatıcı Sesler',
        description: 'Doğal sesler ve atmosfer oluştur',
        icon: Volume2,
        component: 'sounds',
        priority: level >= 4 ? 7 : 6,
      },
      {
        id: 'journal',
        title: 'Günlük Yaz',
        description: 'Düşüncelerini yazarak rahatla',
        icon: BookOpen,
        component: 'journal',
        priority: level <= 2 ? 9 : 5,
      },
    ];

    return baseRecommendations.sort((a, b) => b.priority - a.priority);
  };

  const handleStressComplete = (level: StressLevel) => {
    setStressLevel(level);
    setCurrentView('recommendations');
  };

  const handleRecommendationClick = (view: View) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    if (currentView === 'assessment') {
      setCurrentView('recommendations');
    } else if (currentView === 'recommendations') {
      setStressLevel(null);
      setCurrentView('assessment');
    } else {
      setCurrentView('recommendations');
    }
  };

  const handleReset = () => {
    setStressLevel(null);
    setCurrentView('assessment');
  };

  if (currentView === 'assessment') {
    return <StressAssessment onComplete={handleStressComplete} />;
  }

  if (currentView === 'breathing') {
    return <BreathingExercise onBack={handleBack} />;
  }

  if (currentView === 'sounds') {
    return <SoundsPlayer />;
  }

  if (currentView === 'journal') {
    return <Journal />;
  }

  if (currentView === 'meditation') {
    return <MeditationGuide onBack={handleBack} />;
  }

  // Recommendations view
  const recommendations = stressLevel ? getRecommendations(stressLevel) : [];

  return (
    <div>
      <div>
        {/* Stress Level Summary */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Sana Öneriler</h2>
              <p className="text-sm text-gray-500">
                Stres seviyeni: <span className="font-medium text-teal-600">{stressLevel}/5</span>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Tekrar degerlendir"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${(stressLevel / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;

            return (
              <button
                key={rec.id}
                onClick={() => handleRecommendationClick(rec.component)}
                className="w-full bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transform hover:scale-[1.02] transition-all text-left group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-500">{rec.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-teal-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Tip */}
        <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
          <p className="text-sm text-teal-700 text-center">
            {stressLevel >= 4
              ? 'Yüksek stres seviyesi hissediyorsun. Nefes egzersizi ile başla.'
              : stressLevel <= 2
              ? 'İyi hissediyorsun! Bu anları günlüğünde not al.'
              : 'Normal bir gün. Kısa bir meditasyon sana iyi gelecektir.'}
          </p>
        </div>
      </div>
    </div>
  );
}
