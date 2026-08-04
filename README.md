# Asfalto° — Frontend del ecommerce de motos

Frontend en **Next.js 16 (App Router) + React + TypeScript + Tailwind v4**.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

> La primera vez que corras `npm run build` o `npm run dev`, Next.js necesita
> descargar las tipografías (Big Shoulders, Manrope, JetBrains Mono) desde
> Google Fonts — asegúrate de tener conexión a internet.

## Estructura

```
app/
  page.tsx                  → Home
  catalogo/page.tsx         → Catálogo con filtros, orden y paginación
  moto/[slug]/page.tsx      → Ficha técnica de cada moto (SSG)
  admin/
    layout.tsx               → Layout oscuro con sidebar
    page.tsx                 → Resumen / KPIs
    inventario/page.tsx      → Tabla de inventario
    ventas/page.tsx          → Tabla de ventas
    conversaciones/page.tsx  → Bandeja de chats (web + WhatsApp)
    leads/page.tsx           → Tabla de leads

components/
  layout/     → Navbar, Footer, SpecStrip, ChatWidget
  catalog/    → ProductCard, MotoThumb, CatalogClient (filtros)
  admin/      → AdminSidebar, KpiCard, StatusBadge

data/motos.ts    → 68 motos + ventas + leads + conversaciones (datos MOCK)
types/index.ts   → Todos los tipos del dominio
lib/filtrarCatalogo.ts → Lógica de filtrado/orden/paginación
```

## Datos mock → tu backend real

Todo hoy lee de `data/motos.ts` (generado por `scripts/generate-motos.mjs`).
Para conectar tu backend, solo necesitas reemplazar los `import { motos } from
"@/data/motos"` por llamadas a tu API que devuelvan objetos con la forma
definida en `types/index.ts` (`Moto`, `Venta`, `Lead`, `Conversacion`). El
frontend no necesita más cambios si el contrato de datos coincide.

## Pendiente para producción

- Imágenes reales (hoy son placeholders SVG generados en `MotoThumb.tsx`)
- Conectar `ChatWidget` y el hilo de `/admin/conversaciones` a tu backend/WhatsApp real
- Autenticación de `/admin`
- Formularios reales de "Agendar prueba" y financiamiento
