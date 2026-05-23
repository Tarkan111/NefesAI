#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function createWavHeader(audioLength, sampleRate = 22050, channels = 1) {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const subChunk2Size = audioLength * channels * 2;
  const chunkSize = 36 + subChunk2Size;

  const buffer = Buffer.alloc(44);
  let offset = 0;

  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(chunkSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(channels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(16, offset); offset += 2;

  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(subChunk2Size, offset);

  return buffer;
}

function floatTo16BitPCM(float) {
  const s = Math.max(-1, Math.min(1, float));
  return s < 0 ? s * 0x8000 : s * 0x7FFF;
}

function generateRain(sampleRate = 22050, duration = 10) {
  const samples = sampleRate * duration;
  const audio = Buffer.alloc(samples * 2);

  for (let i = 0; i < samples; i++) {
    const noise = Math.random() * 2 - 1;
    const envelope = Math.sin((i / samples) * Math.PI) * 0.8;
    const sample = noise * envelope * 0.3;
    const int16 = floatTo16BitPCM(sample);
    audio.writeInt16LE(int16, i * 2);
  }

  return audio;
}

function generateWaves(sampleRate = 22050, duration = 10) {
  const samples = sampleRate * duration;
  const audio = Buffer.alloc(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const wave = Math.sin(2 * Math.PI * 0.5 * t) * 0.4;
    const noise = Math.random() * 0.2 - 0.1;
    const envelope = Math.sin((i / samples) * Math.PI) * 0.8;
    const sample = (wave + noise) * envelope * 0.4;
    const int16 = floatTo16BitPCM(sample);
    audio.writeInt16LE(int16, i * 2);
  }

  return audio;
}

function generateWind(sampleRate = 22050, duration = 10) {
  const samples = sampleRate * duration;
  const audio = Buffer.alloc(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noise = Math.random() * 2 - 1;
    const modulation = Math.sin(2 * Math.PI * 0.2 * t) * 0.3;
    const envelope = Math.sin((i / samples) * Math.PI) * 0.8;
    const sample = noise * (1 + modulation) * envelope * 0.25;
    const int16 = floatTo16BitPCM(sample);
    audio.writeInt16LE(int16, i * 2);
  }

  return audio;
}

function generateForest(sampleRate = 22050, duration = 10) {
  const samples = sampleRate * duration;
  const audio = Buffer.alloc(samples * 2);
  const audioFloat = new Float32Array(samples);

  for (let chirpIdx = 0; chirpIdx < 8; chirpIdx++) {
    const chirpTime = (chirpIdx / 8) * duration;
    const startIdx = Math.floor(chirpTime * sampleRate);
    const endIdx = Math.min(startIdx + Math.floor(0.3 * sampleRate), samples);
    const chirpSamples = endIdx - startIdx;

    for (let j = 0; j < chirpSamples; j++) {
      const chirpProgress = j / chirpSamples;
      const freq = 2000 + chirpProgress * 2000;
      const chirp = Math.sin(2 * Math.PI * freq * 0.001 * chirpProgress) * 0.3;
      const envelope = Math.sin(Math.PI * chirpProgress) * 0.8;
      audioFloat[startIdx + j] += chirp * envelope;
    }
  }

  for (let i = 0; i < samples; i++) {
    const noise = Math.random() * 0.1;
    const sample = (audioFloat[i] + noise) * 0.4;
    const clipped = Math.max(-1, Math.min(1, sample));
    const int16 = floatTo16BitPCM(clipped);
    audio.writeInt16LE(int16, i * 2);
  }

  return audio;
}

function generateBirds(sampleRate = 22050, duration = 10) {
  const samples = sampleRate * duration;
  const audio = Buffer.alloc(samples * 2);
  const audioFloat = new Float32Array(samples);

  for (let birdIdx = 0; birdIdx < 10; birdIdx++) {
    const birdTime = (birdIdx / 10) * duration;
    const startIdx = Math.floor(birdTime * sampleRate);
    const endIdx = Math.min(startIdx + Math.floor(0.2 * sampleRate), samples);
    const birdSamples = endIdx - startIdx;

    for (let j = 0; j < birdSamples; j++) {
      const birdProgress = j / birdSamples;
      const baseFreq = 3000 + Math.sin(2 * Math.PI * birdProgress * 3) * 1000;
      const birdSound = Math.sin(2 * Math.PI * baseFreq * 0.0001 * birdProgress) * 0.4;
      const envelope = Math.sin(Math.PI * birdProgress) * 0.8;
      audioFloat[startIdx + j] += birdSound * envelope;
    }
  }

  for (let i = 0; i < samples; i++) {
    const noise = Math.random() * 0.05;
    const sample = (audioFloat[i] + noise) * 0.5;
    const clipped = Math.max(-1, Math.min(1, sample));
    const int16 = floatTo16BitPCM(clipped);
    audio.writeInt16LE(int16, i * 2);
  }

  return audio;
}

function generateCafe(sampleRate = 22050, duration = 10) {
  const samples = sampleRate * duration;
  const audio = Buffer.alloc(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noise = Math.random() * 0.4;
    const chatter = Math.sin(2 * Math.PI * 500 * t) * 0.2 + Math.sin(2 * Math.PI * 800 * t) * 0.1;
    const envelope = Math.sin((i / samples) * Math.PI) * 0.8;
    const sample = (noise * 0.5 + chatter) * envelope * 0.35;
    const clipped = Math.max(-1, Math.min(1, sample));
    const int16 = floatTo16BitPCM(clipped);
    audio.writeInt16LE(int16, i * 2);
  }

  return audio;
}

function generateFire(sampleRate = 22050, duration = 10) {
  const samples = sampleRate * duration;
  const audio = Buffer.alloc(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const noise = Math.random() * 0.4;
    const crackling = Math.sin(2 * Math.PI * 3000 * t) * 0.2 + Math.sin(2 * Math.PI * 5000 * t) * 0.15;
    const explosions = Math.max(Math.sin(2 * Math.PI * 0.3 * t) * 0.5, 0);
    const envelope = Math.sin((i / samples) * Math.PI) * 0.8;
    const sample = (noise * 0.4 + crackling + explosions) * envelope * 0.3;
    const clipped = Math.max(-1, Math.min(1, sample));
    const int16 = floatTo16BitPCM(clipped);
    audio.writeInt16LE(int16, i * 2);
  }

  return audio;
}

function saveWav(filename, audioData, sampleRate = 22050) {
  const header = createWavHeader(audioData.length / 2, sampleRate);
  const fullBuffer = Buffer.concat([header, audioData]);

  fs.writeFileSync(filename, fullBuffer);
  const sizeKB = (fullBuffer.length / 1024).toFixed(1);
  console.log(`✓ ${path.basename(filename)} (${sizeKB} KB)`);
}

async function main() {
  const outputDir = path.join(__dirname, 'public', 'sounds');

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Nefes Al - Ses Dosyaları (Optimize) Oluşturuluyor...\n');

  const sounds = {
    rain: generateRain,
    waves: generateWaves,
    wind: generateWind,
    forest: generateForest,
    birds: generateBirds,
    cafe: generateCafe,
    fire: generateFire,
  };

  for (const [name, generator] of Object.entries(sounds)) {
    try {
      const audioData = generator(22050, 10);
      saveWav(path.join(outputDir, `${name}.wav`), audioData);
    } catch (error) {
      console.error(`✗ ${name}: ${error.message}`);
    }
  }

  console.log('\n✓ Tüm sesler başarıyla oluşturuldu!');
  console.log(`📁 Konum: ${outputDir}`);
}

main().catch(console.error);
