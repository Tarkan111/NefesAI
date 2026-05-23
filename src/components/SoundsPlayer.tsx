import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  emoji: string;
}

const sounds: Sound[] = [
  { id: 'rain', name: 'Yağmur', emoji: '🌧️' },
  { id: 'forest', name: 'Orman', emoji: '🌲' },
  { id: 'waves', name: 'Dalga', emoji: '🌊' },
  { id: 'wind', name: 'Rüzgar', emoji: '💨' },
  { id: 'cafe', name: 'Kafe', emoji: '☕' },
  { id: 'fire', name: 'Ateş', emoji: '🔥' },
  { id: 'birds', name: 'Kuşlar', emoji: '🐦' },
];

export function SoundsPlayer() {
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRefsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const toggleSound = (soundId: string) => {
    const audio = audioRefsRef.current.get(soundId);
    if (!audio) return;

    const isActive = activeSounds.has(soundId);

    if (isActive) {
      audio.pause();
      audio.currentTime = 0;
      setActiveSounds((prev) => {
        const next = new Set(prev);
        next.delete(soundId);
        return next;
      });
    } else {
      audio.loop = true;
      audio.volume = isMuted ? 0 : masterVolume;
      audio.play().catch((err) => console.error(`Error playing ${soundId}:`, err));
      setActiveSounds((prev) => new Set(prev).add(soundId));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setMasterVolume(volume);

    activeSounds.forEach((soundId) => {
      const audio = audioRefsRef.current.get(soundId);
      if (audio) {
        audio.volume = isMuted ? 0 : volume;
      }
    });
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    activeSounds.forEach((soundId) => {
      const audio = audioRefsRef.current.get(soundId);
      if (audio) {
        audio.volume = isMuted ? masterVolume : 0;
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Volume2 className="w-6 h-6 text-teal-500" />
          <h2 className="text-xl font-bold text-gray-800">Rahatlatıcı Sesler</h2>
        </div>

        {/* Master Volume */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Ana Ses</span>
            <button
              onClick={handleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
            disabled={isMuted}
          />
        </div>

        {/* Sound Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {sounds.map((sound) => {
            const isActive = activeSounds.has(sound.id);

            return (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className={`text-3xl sm:text-4xl mb-2 ${isActive ? 'animate-pulse' : ''}`}>
                  {sound.emoji}
                </span>
                <span className="text-xs sm:text-sm font-medium text-center">{sound.name}</span>

                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="bg-teal-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-teal-700 text-center">
            Birden fazla sesi aynı anda açarak kendi atmosferinizi oluşturun
          </p>
        </div>

        {/* Active Sounds Counter */}
        {activeSounds.size > 0 && (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">{activeSounds.size} ses çalıyor</span>
            </span>
          </div>
        )}

        {/* Audio Elements */}
        {sounds.map((sound) => (
          <audio
            key={sound.id}
            ref={(el) => {
              if (el) audioRefsRef.current.set(sound.id, el);
            }}
            src={`/sounds/${sound.id}.mp3`}
            crossOrigin="anonymous"
          />
        ))}
      </div>
    </div>
  );
}
