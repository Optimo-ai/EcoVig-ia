# EcoVig-IA — Observatorio Climático

Una aplicación web interactiva para explorar el cambio climático a través del tiempo con un globo terráqueo 3D y datos educativos.

## Características

- **Globo 3D interactivo** con Three.js y React Three Fiber
- **Línea de tiempo anual** (1980-2035) con controles de reproducción
- **Múltiples capas de datos**: Anomalía térmica, Sequía, Riesgo de incendio
- **Panel de análisis** con métricas globales y regionales
- **Chatbot educativo** (EcoGuía IA) para preguntas sobre el clima
- **Fondo de estrellas animado** con efecto parallax
- **Diseño responsive** con glassmorphism

## Tecnologías

- Next.js 16 + React 19
- Three.js + React Three Fiber para visualización 3D
- React Context API para gestión de estado
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

## Datos

La aplicación utiliza datos climáticos reales de Sudamérica, Centroamérica y Europa con:
- Temperaturas base desde 1981
- Tendencias de calentamiento proyectadas
- Eventos climáticos extremos documentados
- Variables como temperatura, precipitación, humedad y viento

## Créditos

Datos basados en tendencias de Copernicus y NASA.
Proyecto educativo sin fines de lucro.
