# Health Tracker App

React Native + Expo ile geliştirilmiş, Firebase destekli sağlık takip uygulaması.

---

## Gereksinimler

| Araç | Minimum Versiyon |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Expo Go (telefon) | Son sürüm |

---

## Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install
```

---

## Çalıştırma

### Telefonda (Expo Go)

```powershell
$env:EXPO_NO_DOCTOR=1; npx expo start --clear
```

1. Komut çalıştıktan sonra terminalde QR kod ve şuna benzer bir URL görünür:
   ```
   exp://10.41.12.53:8081
   ```
2. Telefonunda **Expo Go** uygulamasını aç
3. "Enter URL manually" seçeneğiyle URL'yi gir **veya** QR kodu tara
4. Uygulama telefonda açılır

> **Not:** Bilgisayar ve telefon aynı Wi-Fi ağında olmalıdır.

---

### Web Tarayıcısında

```powershell
$env:EXPO_NO_DOCTOR=1; npx expo start --web --clear
```

Tarayıcıda otomatik açılır. Açılmazsa:

```
http://localhost:8081
```

---

### Yalnızca Android (USB veya Emülatör)

```bash
npx expo start --android
```

---

### Yalnızca iOS (Mac gerektirir)

```bash
npx expo start --ios
```

---

## Port Çakışması Yaşanırsa

Port meşgulse Expo farklı bir port önerir (`Y` ile onaylayın).  
Direkt port belirtmek için:

```powershell
$env:EXPO_NO_DOCTOR=1; npx expo start --clear --port 8090
```

Telefonda URL'yi buna göre güncelleyin: `exp://10.41.12.53:8090`

---

## Proje Yapısı

```
mobil/
├── App.js                        # Uygulama giriş noktası
├── app.config.js                 # Expo yapılandırması
├── src/
│   ├── auth/
│   │   └── AuthContext.js        # Firebase Auth context
│   ├── firebase/
│   │   ├── config.js             # Firebase başlatma
│   │   ├── userService.js        # Kullanıcı profil işlemleri
│   │   ├── activityService.js    # Aktivite kayıtları
│   │   ├── statsService.js       # İstatistikler
│   │   └── sugarService.js       # Kan şekeri kayıtları
│   ├── navigation/
│   │   └── AppNavigator.js       # Ekran navigasyonu
│   ├── screens/                  # Tüm ekranlar
│   ├── components/               # Tekrar kullanılabilir bileşenler
│   ├── constants/                # Renkler, stiller
│   ├── services/                 # Bildirim, yerel tavsiye servisleri
│   └── utils/                    # Yardımcı fonksiyonlar
└── assets/                       # Görseller, ikonlar
```

---

## Firebase Yapılandırması

Firebase bilgileri `src/firebase/config.js` dosyasında tanımlıdır.  
Kendi Firebase projenizi kullanmak için bu dosyadaki `firebaseConfig` nesnesini güncelleyin:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Firebase Console → Proje Ayarları → Uygulamanız → SDK kurulum ve yapılandırması bölümünden alabilirsiniz.

---

## Teknoloji Yığını

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| Expo | ~54.0.0 | Geliştirme platformu |
| React Native | 0.81.5 | Mobil uygulama |
| Firebase | ^12.x | Auth + Firestore veritabanı |
| React Navigation | ^6.x | Ekranlar arası geçiş |
| AsyncStorage | ^2.2.0 | Yerel veri saklama |
| expo-notifications | ~0.32.x | Günlük bildirimler |
| expo-linear-gradient | ~15.0.x | Gradyan UI |

---

## Bilinen Kısıtlamalar (Expo Go)

- **Push bildirimleri** Expo Go'da çalışmaz (SDK 53+). Gerçek bildirim testi için [development build](https://docs.expo.dev/develop/development-builds/introduction/) gereklidir.
- Oturum açık kalan kullanıcı uygulama tamamen kapatılıp açıldığında yeniden giriş yapması gerekebilir (in-memory auth).
