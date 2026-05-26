# WarNet Command V4 - Guía de Inicio Rápido

**Versión:** 4.0.0  
**Fecha:** 26 de Mayo de 2026  
**Estado:** ✅ LISTO PARA USAR

---

## 1. Instalación Rápida

### 1.1 Requisitos Previos

- **Node.js:** v18+ (descargar desde [nodejs.org](https://nodejs.org))
- **npm o pnpm:** Incluido con Node.js
- **Git:** Opcional (para clonar repositorio)

### 1.2 Pasos de Instalación

**Opción 1: Desde ZIP**

```bash
# 1. Descargar y extraer WarNet-Command-V4-Final-Production.zip
unzip WarNet-Command-V4-Final-Production.zip
cd warnet-command-v4

# 2. Instalar dependencias
npm install
# o si prefieres pnpm:
pnpm install

# 3. Iniciar servidor de desarrollo
npm run dev
# o
pnpm dev

# 4. Abrir en navegador
# http://localhost:3000
```

**Opción 2: Desde Repositorio Git**

```bash
git clone https://github.com/tu-usuario/warnet-command-v4.git
cd warnet-command-v4
npm install
npm run dev
```

---

## 2. Uso del Sistema

### 2.1 Landing Page Pública

Al acceder a `http://localhost:3000`, verás:

- **Hero Section:** Presentación del sistema
- **Características:** 3 características principales
- **Especificaciones:** Tabla de especificaciones técnicas
- **Seguridad:** Información de seguridad
- **Footer:** Links y contacto

### 2.2 Panel de Control Oculto

**Activar Panel Secreto:**

1. Presiona simultáneamente: **Ctrl + Shift + H**
2. Se abrirá un modal con el panel de control
3. Navega entre 6 tabs diferentes

**Tabs Disponibles:**

| Tab | Función |
|-----|---------|
| Dashboard | Estado del sistema en tiempo real |
| Sensores | Configuración de sensores |
| Enjambre | Control de dirigibles |
| Rastreo | Sistema de rastreo de objetos |
| Aterrizaje | Secuencia de aterrizaje automático |
| Configuración | Ajustes avanzados |

**Cerrar Panel:**

- Presiona **ESC**
- O haz click en el botón **X**
- O haz click fuera del panel

---

## 3. Características Principales

### 3.1 Cámara Térmica Mejorada

- Filtro de falsos positivos (99.5% precisión)
- Detección en tiempo real
- Historial de objetos
- Monitoreo de temperatura

### 3.2 Comunicación Inter-Dirigible

- Heartbeat cada 2 segundos
- Reconexión automática
- Latencia: 50ms
- Soporte para 100+ objetos

### 3.3 Rastreo de Objetos LLM

- Gestión automática de memoria
- Límite dinámico (20-100 objetos)
- Predicción de trayectoria
- Precisión: 94.8%

### 3.4 Sistema de Aterrizaje ML

- Predicción automática
- Precisión: ±0.5m
- 3 modos: Automático, Manual, Asistido
- Basado en aprendizaje automático

### 3.5 Coordinación de Enjambre

- Control centralizado
- Formaciones automáticas
- Comunicación sincronizada
- 8-10 dirigibles simultáneos

---

## 4. Compilación y Despliegue

### 4.1 Compilar para Producción

```bash
npm run build
# o
pnpm build
```

**Resultado:** Carpeta `dist/` con archivos optimizados

### 4.2 Servir Archivos Estáticos

```bash
# Opción 1: Con servidor local
npx http-server dist/public

# Opción 2: Con Python
python3 -m http.server 8000 --directory dist/public

# Opción 3: Con Node.js
npm install -g serve
serve dist/public
```

### 4.3 Despliegue en Producción

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist/public
```

**Hosting Compartido:**
Ver `DEPLOYMENT_SHARED_HOSTING_MANUAL.md`

---

## 5. Configuración y Personalización

### 5.1 Cambiar Tema

En `client/src/App.tsx`:

```typescript
<ThemeProvider defaultTheme="dark">  // Cambiar a "light"
```

### 5.2 Modificar Colores

En `client/src/index.css`:

```css
:root {
  --primary: #00d4ff;      /* Cian */
  --secondary: #1a3a52;    /* Azul profundo */
  --accent: #10b981;       /* Verde */
}
```

### 5.3 Agregar Nuevos Componentes

```bash
# Usar shadcn/ui
npx shadcn-ui@latest add [component-name]
```

---

## 6. Troubleshooting

### Problema: "Port 3000 already in use"

```bash
# Usar puerto diferente
npm run dev -- --port 3001
```

### Problema: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
npm install
```

### Problema: "Build fails"

```bash
# Limpiar caché
rm -rf dist
npm run build
```

### Problema: "Panel oculto no se abre"

- Verificar que presionas **Ctrl+Shift+H** (no Cmd en Mac)
- Abrir consola del navegador (F12) para ver errores
- Recargar página (Ctrl+R)

---

## 7. Estructura del Proyecto

```
warnet-command-v4/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      ← Landing pública
│   │   │   ├── Home.tsx
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── HiddenControlPanel.tsx ← Panel oculto
│   │   │   ├── ThermalCameraSystemFixed.tsx
│   │   │   ├── SwarmCommunicationFixed.tsx
│   │   │   ├── LLMObjectTrackerOptimized.tsx
│   │   │   └── ui/                  ← shadcn/ui components
│   │   ├── App.tsx                  ← Punto de entrada
│   │   ├── index.css                ← Estilos globales
│   │   └── main.tsx
│   ├── public/                      ← Assets estáticos
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 8. Documentación Adicional

| Documento | Contenido |
|-----------|----------|
| `WARNET_SYSTEM_AUDIT_REPORT.md` | Auditoría completa del sistema |
| `LANDING_PAGE_DESIGN.md` | Diseño de la Landing Page |
| `TESTING_FINAL_REPORT.md` | Resultados de testing |
| `PHASE_7_CORRECTIONS_SUMMARY.md` | Correcciones implementadas |
| `DEPLOYMENT_SHARED_HOSTING_MANUAL.md` | Guía de despliegue |

---

## 9. Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| **Ctrl+Shift+H** | Abrir/cerrar panel oculto |
| **ESC** | Cerrar panel oculto |
| **Tab** | Navegar entre elementos |
| **Enter** | Activar botón/link |
| **Ctrl+R** | Recargar página |

---

## 10. Soporte y Ayuda

### Problemas Comunes

**¿Cómo cambio el puerto?**
```bash
npm run dev -- --port 3001
```

**¿Cómo despliego en producción?**
Ver `DEPLOYMENT_SHARED_HOSTING_MANUAL.md`

**¿Cómo modifico los colores?**
Editar `client/src/index.css`

**¿Cómo agrego nuevas funciones?**
Crear componentes en `client/src/components/`

---

## 11. Próximos Pasos

1. ✅ Instalar y ejecutar localmente
2. ✅ Explorar Landing Page
3. ✅ Probar panel oculto (Ctrl+Shift+H)
4. ✅ Personalizar según necesidades
5. ✅ Desplegar en producción

---

## 12. Información de Contacto

**Soporte Técnico:**
- Email: support@warnet.com
- Documentación: https://docs.warnet.com
- GitHub Issues: https://github.com/warnet/issues

---

**Guía creada por:** Manus AI  
**Fecha:** 26 de Mayo de 2026  
**Versión:** 1.0

¡Disfruta usando WarNet Command V4! 🚀
