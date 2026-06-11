# MoodLens 🎭

Diario emocional con análisis de IA. El usuario escribe cómo se siente, la IA detecta emociones, sugiere actividades y construye un historial visual del estado mental.

## Screenshots

> _Próximamente_

## Stack tecnológico

- **React Native** + **Expo SDK 54** — app móvil multiplataforma
- **TypeScript** — tipado estático
- **Firebase Authentication** — registro e inicio de sesión
- **Cloud Firestore** — persistencia de datos por usuario
- **Groq API** (llama-3.3-70b-versatile) — análisis de emociones con IA
- **React Navigation** — navegación Stack + Tab
- **react-native-chart-kit** — gráficas de historial emocional

## Funcionalidades

- ✅ Registro e inicio de sesión con email/contraseña
- ✅ Análisis de texto con IA — detecta emoción, intensidad, resumen y sugerencia
- ✅ Guardado automático de cada entrada en Firestore
- ✅ Historial de entradas ordenado por fecha
- ✅ Gráfica de intensidad emocional por día
- ✅ Gráfica de frecuencia de emociones de la semana
- ✅ Sesión persistente con AsyncStorage

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/yergiroska/moodlens.git
cd moodlens
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo `.env` basándote en `.env.example` y rellena tus credenciales.

4. Arranca el servidor de desarrollo:
```bash
npx expo start
```

5. Escanea el QR con **Expo Go** en tu móvil.

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | API Key de Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth Domain de Firebase |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Project ID de Firebase |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage Bucket de Firebase |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID de Firebase |
| `EXPO_PUBLIC_GROQ_API_KEY` | API Key de Groq |

## Autor

**Yergiroska Aguirre** — [GitHub](https://github.com/yergiroska) · [LinkedIn](https://linkedin.com/in/yergiroska)