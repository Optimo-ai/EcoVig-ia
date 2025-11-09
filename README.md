# EcoVig-IA — Observatorio Climático

Una aplicación web interactiva para explorar el cambio climático a través del tiempo con un globo terráqueo 3D y datos educativos.

## Características

- **Globo 3D interactivo** con CesiumJS
- **Línea de tiempo anual** (1980-2035) con controles de reproducción
- **Múltiples capas de datos**: Anomalía térmica, Sequía, Riesgo de incendio
- **Panel de análisis** con métricas globales y regionales
- **Chatbot educativo** (EcoGuía IA) para preguntas sobre el clima
- **Fondo de estrellas animado** con efecto parallax
- **Diseño responsive** con glassmorphism

## Tecnologías

- Next.js 16 + React 19
- CesiumJS para visualización 3D
- Zustand para gestión de estado
- TailwindCSS v4 para estilos
- TypeScript

## Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
\`\`\`

## Configuración

Para usar texturas de alta calidad en Cesium, añade tu token de Cesium Ion:

\`\`\`env
NEXT_PUBLIC_CESIUM_ION_TOKEN=tu_token_aqui
\`\`\`

## Créditos

Datos simulados basados en tendencias de Copernicus y NASA.
Proyecto educativo sin fines de lucro.
