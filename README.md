# LIVECV

Plataforma de CVs en vivo para profesionales IT y diseñadores.

## Stack

- **Frontend:** React 19 + Vite 7
- **Backend:** Supabase (Auth + PostgreSQL + Storage)
- **Deploy:** Hostinger (static build)
- **IA:** Claude Sonnet via Anthropic API (proxy en Vite)

## Estructura

```
src/
  components/       → Componentes UI reutilizables (CV, modals, forms)
  pages/            → Vistas principales (Editor, PublicCV, Landing)
  services/         → Lógica de negocio y acceso a datos
  hooks/            → Custom hooks
  styles/           → CSS global y variables de diseño
  lib/              → Configuración de librerías externas (supabase, etc.)
```

## Setup

```bash
npm install
cp .env.example .env   # completar con tus keys
npm run dev
```

## Variables de entorno

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ANTHROPIC_API_KEY=
```

## Deploy a Hostinger

```bash
npm run build
# subir carpeta dist/ via FTP o GitHub Actions
```
