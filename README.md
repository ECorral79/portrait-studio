# 🎨 Portrait Studio

Generador de retratos con IA. Describe una persona, su ropa, el fondo y si está acompañada — y la IA crea la imagen.

## ✨ Características

- **Descripción libre**: escribe en español o inglés como si le contaras a alguien
- **Formulario detallado**: campos separados para persona, ropa, fondo y compañía
- Estilos artísticos: fotorrealista, pintura al óleo, acuarela, anime, y más
- La IA mejora tu descripción automáticamente antes de generar

## 🚀 Cómo correrlo

### 1. Clona el repositorio
```bash
git clone https://github.com/ECorral79/portrait-studio.git
cd portrait-studio
```

### 2. Instala dependencias
```bash
npm install
```

### 3. Agrega tu API key de Anthropic
Abre `src/App.jsx` y reemplaza en la línea:
```js
const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY";
```
con tu key real de [console.anthropic.com](https://console.anthropic.com)

### 4. Corre el proyecto
```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## 🔑 Obtener API Key de Anthropic

1. Ve a https://console.anthropic.com
2. Inicia sesión o crea una cuenta
3. Ve a **API Keys** → **Create Key**
4. Copia la key y pégala en `src/App.jsx`

## 🛠 Tecnologías

- React 18 + Vite
- Anthropic Claude API (mejora el prompt)
- Pollinations AI (generación de imágenes, gratis)
