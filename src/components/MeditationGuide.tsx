import React, { useState, useEffect, useRef } from 'react';
import { Brain, Play, Pause, RotateCcw, ChevronLeft, Volume2, VolumeX } from 'lucide-react';

interface MeditationStep {
  duration: number;
  text: string;
}

interface MeditationGuideProps {
  onBack?: () => void;
}

const meditations = [
  {
    id: 'focus',
    name: 'Odaklanma',
    duration: 60,
    steps: [
      { duration: 5, text: 'Rahat bir pozisyon al. Gözlerini kapat.' },
      { duration: 5, text: 'Nefes alışverişlerine dikkat et.' },
      { duration: 10, text: 'Nefesini burnundan al, ağzından yavaşça ver.' },
      { duration: 5, text: 'Dikkatini kalbinin üstüne odakla.' },
      { duration: 10, text: 'Düşüncelerini bir bulut gibi geçip birak.' },
      { duration: 10, text: 'Sadece nefesini izle. Geliş, gidiş...' },
      { duration: 10, text: 'Bedensel hislerine dikkat et.' },
      { duration: 5, text: 'Sakinlik hissinin bedenine yayıldığını hisset.' },
    ],
  },
  {
    id: 'relax',
    name: 'Rahatlama',
    duration: 60,
    steps: [
      { duration: 5, text: 'Sırt üstü uzan veya otur.' },
      { duration: 5, text: 'Gözlerini kapat, omuzlarını birak.' },
      { duration: 10, text: 'Tüm kaslarını sıra ile gevşet: baş, boyun...' },
      { duration: 10, text: 'Omuzlarını aşağı birak, rahatlat.' },
      { duration: 10, text: 'Kollarını ve ellerini gevşet.' },
      { duration: 10, text: 'Göğüs ve karın bölgesi rahatlasin.' },
      { duration: 5, text: 'Bacaklarını ve ayaklarını serbest birak.' },
      { duration: 5, text: 'Tüm bedenin gevşemiş, ağır...' },
    ],
  },
  {
    id: 'gratitude',
    name: 'Şükran',
    duration: 60,
    steps: [
      { duration: 5, text: 'Rahat bir pozisyon al, gözlerini kapat.' },
      { duration: 5, text: 'Nefesini düzenle, birkaç derin nefes al.' },
      { duration: 10, text: 'Bugün minnetttar olduğun bir şey düşün.' },
      { duration: 10, text: 'Bu minnet hissini genişlet.' },
      { duration: 10, text: 'Kendin için bir şeye minnetttar ol.' },
      { duration: 10, text: 'Sevdiklerin için bir şeye şükret.' },
      { duration: 5, text: 'Bu sıcak hissi kalbinde hisset.' },
      { duration: 5, text: 'Gün boyun bu huzuru taşı.' },
    ],
  },
];

type Phase = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2';

const phaseLabels: Record<Phase, string> = {
  idle: 'Hazır',
  inhale: 'Nefes Al',
  hold1: 'Tut',
  exhale: 'Nefes Ver',
  hold2: 'Bekle',
};

export function MeditationGuide({ onBack }: MeditationGuideProps) {
  const [selectedMeditation, setSelectedMeditation] = useState(meditations[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const step = selectedMeditation.steps[currentStep];
    if (!step) {
      finishMeditation();
      return;
    }

    setTimeRemaining(step.duration);
    speakText(step.text);

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          nextStep();
          return 0;
        }
        return prev - 1;
      });

      setTotalProgress((prev) => {
        return Math.min(prev + 1, selectedMeditation.duration);
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentStep]);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextStep = () => {
    if (currentStep < selectedMeditation.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishMeditation();
    }
  };

  const finishMeditation = () => {
    setIsActive(false);
    setCurrentStep(0);
    setTotalProgress(0);
    window.speechSynthesis.cancel();
  };

  const handleStart = () => {
    setIsActive(true);
    setTotalTime(selectedMeditation.duration);
    speakText('Meditasyona hoşgeldin. Hazır olduğunda başlayacağız...');
    setTimeout(() => {
      setCurrentStep(0);
      setTotalProgress(0);
    }, 2000);
  };

  const handlePause = () => {
    setIsActive(false);
    window.speechSynthesis.cancel();
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentStep(0);
    setTotalProgress(0);
    setTimeRemaining(0);
    window.speechSynthesis.cancel();
  };

  const progressPercent = (totalProgress / selectedMeditation.duration) * 100;
  const currentStepData = selectedMeditation.steps[currentStep];

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
          <Brain className="w-6 h-6 text-teal-500" />
          <h2 className="text-xl font-bold text-gray-800">Meditasyon</h2>
        </div>

        {/* Meditation Selection */}
        {!isActive && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {meditations.map((med) => (
              <button
                key={med.id}
                onClick={() => {
                  handleReset();
                  setSelectedMeditation(med);
                }}
                disabled={isActive}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedMeditation.id === med.id
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {med.name}
              </button>
            ))}
          </div>
        )}

        {/* Progress Circle */}
        <div className="relative flex flex-col items-center justify-center mb-8">
          <div
            className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500
              flex items-center justify-center shadow-2xl transition-all duration-1000 ease-in-out`}
            style={{
              transform: `scale(${
                isActive && (currentStep % 2 === 0) ? 1.1 : 1
              })`,
            }}
          >
            <div className="text-center text-white">
              {isActive && currentStepData && (
                <>
                  <div className="text-5xl sm:text-6xl font-bold mb-1">{timeRemaining}</div>
                  <div className="text-sm sm:text-base font-medium">
                    Adım {currentStep + 1}/{selectedMeditation.steps.length}
                  </div>
                </>
              )}
              {!isActive && (
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
              strokeDasharray={`${progressPercent * 3} 300`}
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

        {/* Current Step Text */}
        {isActive && currentStepData && (
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-teal-100">
            <p className="text-gray-800 text-center text-lg font-medium">
              {currentStepData.text}
            </p>
          </div>
        )}

        {/* Voice Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-sm text-gray-600">Sesli Yönlendirme</span>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled
                ? 'bg-teal-100 text-teal-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
            >
              <Play className="w-5 h-5" />
              Başla ({selectedMeditation.duration}s)
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

        {/* Completion Message */}
        {totalProgress >= selectedMeditation.duration && !isActive && (
          <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100 text-center">
            <p className="text-teal-700 font-medium">Meditasyon tamamlandı. İyi hissetmen dileğiyle.</p>
          </div>
        )}
      </div>
    </div>
  );
}
