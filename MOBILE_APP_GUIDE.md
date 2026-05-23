# Nefes Al - Mobile App (Android & iOS)

## Proje Yapisi

Web ve Mobile uygulamasi ayni repository icinde:
- `/src` - Web uygulamasi (React + Tailwind)
- `/src/mobile` - Mobile uygulamasi (React Native + Expo)
- `/src/lib` - Paylaşilan kutuphaneler

## Android Uygulamasi Olusturma

### Gerekli Araçlar
- Node.js 18+
- Android SDK (Android Studio)
- Java JDK 11+

### Kurulum ve Calistirma

```bash
# 1. Projeyi klonla
git clone <repo>
cd nefes_al

# 2. Baglantilari yuekle
npm install

# 3. Android emulator olustur
# Android Studio'yu aç → Tools → Device Manager → Create Device

# 4. Uygulamayi caliştir
npx expo run:android
```

### APK Olusturma (Kurulum dosyasi)

```bash
# EAS CLI'yi yükle
npm install -g eas-cli

# EAS hesabina giriş yap
eas login

# APK olustur
eas build --platform android --local

# Cikti dosyasi: dist/*.apk
```

## iOS Uygulamasi Olusturma

### Gerekli Araçlar
- macOS
- Xcode
- Apple Developer Account

### Kurulum ve Calistirma

```bash
# 1. iOS simulatoru caliştir
open -a Simulator

# 2. Uygulamayi caliştir
npx expo run:ios
```

### IPA Olusturma (Kurulum dosyasi)

```bash
# EAS CLI'yi yükle
npm install -g eas-cli

# EAS hesabina giriş yap
eas login

# IPA olustur
eas build --platform ios --local

# Cikti dosyasi: dist/*.ipa
```

## Verilerin Depolanmasi

Tum veriler cihazda lokal olarak AsyncStorage'da saklanir:
- **Gunluk kayitlari** - sqlite yerine AsyncStorage
- **Dosya indir** - JSON formatinda
- **Dosya yukle** - JSON'dan restore
- **Sohbet uygulamalarinda paylas** - Sistem paylasim ozelliği

## Ozellikler

✅ Stres seviyesi degerlendirmesi
✅ Nefes egzersizleri (3 tip)
✅ Rahatlatici sesler (7 tip)
✅ Gunluk (export/import)
✅ Meditasyon rehberi
✅ Lokal veri depolama
✅ Offline calisma

## Geliştirme

### Dosya Yapisi
```
src/
├── mobile/
│   ├── AppMobile.tsx         # Ana Mobile uygulamasi
│   ├── HomeMobile.tsx        # Ana sayfa
│   ├── StressAssessmentMobile.tsx
│   ├── BreathingExerciseMobile.tsx
│   ├── SoundsPlayerMobile.tsx
│   ├── JournalMobile.tsx
│   └── MeditationGuideMobile.tsx
└── lib/
    ├── types.ts              # Type tanımları
    └── mobileStorage.ts      # AsyncStorage fonksiyonları
```

### Caliştirma Modları
```bash
# Web
npm run dev

# Android
npx expo run:android

# iOS
npx expo run:ios

# Expo Go (hızlı test)
npx expo start
```

## Publikasyon

### Google Play Store
1. Google Play Console'a git
2. Yeni uygulama olustur
3. APK'yi yukle
4. Store listing'i tamamla
5. Yayinla

### Apple App Store
1. App Store Connect'e git
2. Yeni uygulama olustur
3. IPA'yi yukle
4. App information'i tamamla
5. Review'e gonder
