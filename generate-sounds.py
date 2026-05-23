#!/usr/bin/env python3
"""
Nefes Al - Ambient Sounds Generator
Rahatlatıcı sesler oluşturur
"""

import numpy as np
import wave
import os
from pathlib import Path

SAMPLE_RATE = 44100
DURATION = 30  # 30 saniye

def generate_rain():
    """Yağmur sesi"""
    samples = int(SAMPLE_RATE * DURATION)
    audio = np.zeros(samples, dtype=np.float32)

    # Beyaz gürültü
    noise = np.random.randn(samples) * 0.3

    # LPF (düşük pass filtre) simülasyonu
    filtered = np.copy(noise)
    for i in range(1, samples):
        filtered[i] = filtered[i-1] * 0.95 + noise[i] * 0.05

    # Zarflama
    envelope = np.sin(np.linspace(0, np.pi, samples)) * 0.8
    audio = filtered * envelope

    return audio

def generate_waves():
    """Deniz dalgası sesi"""
    samples = int(SAMPLE_RATE * DURATION)
    t = np.linspace(0, DURATION, samples)

    # Sinüs dalgası + gürültü
    wave = np.sin(2 * np.pi * 0.5 * t) * 0.4  # 0.5 Hz dalga
    noise = np.random.randn(samples) * 0.15

    audio = (wave + noise) * 0.4

    # Zarflama
    envelope = np.sin(np.linspace(0, np.pi, samples)) * 0.8
    audio = audio * envelope

    return audio.astype(np.float32)

def generate_wind():
    """Rüzgar sesi"""
    samples = int(SAMPLE_RATE * DURATION)
    t = np.linspace(0, DURATION, samples)

    # Gürültü + modülasyon
    noise = np.random.randn(samples) * 0.4
    modulation = np.sin(2 * np.pi * 0.2 * t) * 0.3  # Yavaş modülasyon

    audio = noise * (1 + modulation) * 0.25

    # Zarflama
    envelope = np.sin(np.linspace(0, np.pi, samples)) * 0.8
    audio = audio * envelope

    return audio.astype(np.float32)

def generate_forest():
    """Orman/kuş sesleri"""
    samples = int(SAMPLE_RATE * DURATION)
    t = np.linspace(0, DURATION, samples)

    audio = np.zeros(samples, dtype=np.float32)

    # Yüksek frekans chirplar (kuş sesleri)
    for chirp_time in np.linspace(0, DURATION, 15):
        start_idx = int(chirp_time * SAMPLE_RATE)
        end_idx = min(start_idx + int(0.5 * SAMPLE_RATE), samples)

        if start_idx < samples:
            chirp_samples = end_idx - start_idx
            chirp_t = np.linspace(0, 0.5, chirp_samples)
            freq = 2000 + np.linspace(0, 2000, chirp_samples)  # Frekans değişimi

            chirp = np.sin(2 * np.pi * freq * 0.001 * chirp_t) * 0.3
            envelope = np.sin(np.linspace(0, np.pi, chirp_samples)) * 0.8

            if end_idx <= len(audio):
                audio[start_idx:end_idx] += chirp * envelope

    # Arka plan gürültüsü
    noise = np.random.randn(samples) * 0.1
    audio = (audio + noise) * 0.4

    return np.clip(audio, -1, 1).astype(np.float32)

def generate_birds():
    """Kuş cıvıltıları"""
    samples = int(SAMPLE_RATE * DURATION)
    t = np.linspace(0, DURATION, samples)

    audio = np.zeros(samples, dtype=np.float32)

    # Periyodik kuş sesleri
    for bird_time in np.linspace(0, DURATION, 20):
        start_idx = int(bird_time * SAMPLE_RATE)
        end_idx = min(start_idx + int(0.3 * SAMPLE_RATE), samples)

        if start_idx < samples:
            bird_samples = end_idx - start_idx
            bird_t = np.linspace(0, 0.3, bird_samples)

            # Yüksek frekans chirp
            base_freq = 3000 + np.sin(2 * np.pi * bird_t * 3) * 1000
            bird_sound = np.sin(2 * np.pi * base_freq * 0.0001 * bird_t) * 0.4
            envelope = np.sin(np.linspace(0, np.pi, bird_samples)) * 0.8

            if end_idx <= len(audio):
                audio[start_idx:end_idx] += bird_sound * envelope

    # Arka plan gürültüsü
    noise = np.random.randn(samples) * 0.05
    audio = (audio + noise) * 0.5

    return np.clip(audio, -1, 1).astype(np.float32)

def generate_cafe():
    """Kafe gürültüsü"""
    samples = int(SAMPLE_RATE * DURATION)
    t = np.linspace(0, DURATION, samples)

    # Gürültü
    noise = np.random.randn(samples) * 0.4

    # Periyodik konuşma sesi (orta frekans)
    chatter = np.sin(2 * np.pi * 500 * t) * 0.2
    chatter += np.sin(2 * np.pi * 800 * t) * 0.1

    # Bardak/çay sesini simüle et
    clink_times = np.array([5, 10, 15, 20, 25])
    for clink_time in clink_times:
        start_idx = int(clink_time * SAMPLE_RATE)
        end_idx = min(start_idx + int(0.1 * SAMPLE_RATE), samples)
        if start_idx < samples:
            clink_samples = end_idx - start_idx
            clink_t = np.linspace(0, 0.1, clink_samples)
            clink = np.sin(2 * np.pi * 2000 * clink_t) * 0.3
            if end_idx <= len(noise):
                noise[start_idx:end_idx] += clink

    audio = (noise * 0.5 + chatter) * 0.35

    # Zarflama
    envelope = np.sin(np.linspace(0, np.pi, samples)) * 0.8
    audio = audio * envelope

    return np.clip(audio, -1, 1).astype(np.float32)

def generate_fire():
    """Ateş sesi"""
    samples = int(SAMPLE_RATE * DURATION)
    t = np.linspace(0, DURATION, samples)

    # Gürültü + patlamalar
    noise = np.random.randn(samples) * 0.4

    # Cızıltı (yüksek frekans)
    crackling = np.sin(2 * np.pi * 3000 * t) * 0.2
    crackling += np.sin(2 * np.pi * 5000 * t) * 0.15

    # Periyodik patlamalar
    explosions = np.sin(2 * np.pi * 0.3 * t) * 0.5
    explosions = np.maximum(explosions, 0)  # Sadece pozitif kısım

    audio = (noise * 0.4 + crackling + explosions) * 0.3

    # Zarflama
    envelope = np.sin(np.linspace(0, np.pi, samples)) * 0.8
    audio = audio * envelope

    return np.clip(audio, -1, 1).astype(np.float32)

def save_wav(filename, audio, sample_rate=SAMPLE_RATE):
    """WAV dosyası olarak kaydet"""
    # Audio'yu int16'ya dönüştür
    audio_int16 = np.int16(audio * 32767)

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())

def main():
    output_dir = Path(__file__).parent / 'public' / 'sounds'
    output_dir.mkdir(parents=True, exist_ok=True)

    sounds = {
        'rain': generate_rain,
        'waves': generate_waves,
        'wind': generate_wind,
        'forest': generate_forest,
        'birds': generate_birds,
        'cafe': generate_cafe,
        'fire': generate_fire,
    }

    print("Nefes Al - Rahatlatıcı Sesler Oluşturuluyor...")
    print(f"Çıkış: {output_dir}")
    print()

    for name, generator in sounds.items():
        print(f"Oluşturuluyor: {name}...", end=' ')
        audio = generator()

        # WAV olarak kaydet
        wav_path = output_dir / f'{name}.wav'
        save_wav(str(wav_path), audio)
        print(f"✓ ({wav_path.stat().st_size / 1024:.1f} KB)")

    print()
    print("✓ Tüm sesler başarıyla oluşturuldu!")
    print()
    print("İpucu: Daha iyi kalite için WAV dosyalarını MP3'e dönüştür:")
    print("  ffmpeg -i public/sounds/rain.wav -ab 128k public/sounds/rain.mp3")

if __name__ == '__main__':
    main()
