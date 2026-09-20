# Gimnasio Mental — PWA de progreso (app + navegador + sync)

Tracker diario de hábitos (Núcleo / Mente / Cuerpo) con **gráficas, % de avance, metas y KPIs**.
Funciona **offline** en cualquier navegador, se **instala como app** (celular y PC) y **sincroniza** entre dispositivos con tu propio Supabase gratis. **No depende de Claude.**

## Archivos
- `index.html` · `app.js` · `sw.js` · `manifest.webmanifest` · `icon-192.png` · `icon-512.png`
- `generate_icons.py` (regenera los iconos si quieres cambiarlos)

---

## 1) Probarlo YA en tu PC (navegador)
Un service worker necesita servirse por http (no `file://`). En esta carpeta:

```bash
python -m http.server 5173
```

Abre **http://localhost:5173** → ya funciona y guarda tu progreso en este navegador.
En Chrome/Edge verás el ícono **Instalar** en la barra de direcciones → queda como app de escritorio.

---

## 2) Publicarlo con URL propia (para el celular)
Necesitas subir estos archivos a un hosting estático gratis. Dos caminos fáciles:

### Opción A — Netlify Drop (lo más rápido, sin cuenta técnica)
1. Entra a **https://app.netlify.com/drop**
2. **Arrastra la carpeta `gimnasio-mental`** completa.
3. Te da una URL tipo `https://algo.netlify.app` → esa es tu app. Ábrela en el celular e **"Agregar a pantalla de inicio"**.

### Opción B — GitHub Pages (tú ya usas GitHub)
1. Crea un repo (público o privado con Pages), sube estos archivos.
2. Settings → Pages → Deploy from branch → `main` / root.
3. URL tipo `https://usuario.github.io/repo/`.

> Tras publicar, copia tu URL: la necesitas para el redirect de login (paso 3.4).

---

## 3) Activar el sync entre dispositivos (Supabase gratis)
Sin esto la app igual funciona, pero cada dispositivo guarda lo suyo. Para sincronizar:

### 3.1 Crea el proyecto
1. Entra a **https://supabase.com** → crea cuenta gratis → **New project** (elige región cercana, ej. São Paulo). Anota la contraseña de la BD (no la necesitas para la app).

### 3.2 Crea las tablas + seguridad (RLS)
En Supabase → **SQL Editor** → pega y ejecuta:

```sql
create table if not exists public.dias (
  user_id uuid not null references auth.users(id) on delete cascade,
  fecha text not null,
  done jsonb default '{}'::jsonb,
  dormir text default '',
  despertar text default '',
  nota text default '',
  updated_at timestamptz default now(),
  primary key (user_id, fecha)
);
create table if not exists public.metas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table public.dias  enable row level security;
alter table public.metas enable row level security;
create policy "dias propios"  on public.dias  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "metas propias" on public.metas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- sync en vivo entre dispositivos:
alter publication supabase_realtime add table public.dias, public.metas;
```

### 3.3 Copia tus claves
Supabase → **Project Settings → API**: copia **Project URL** y **anon public key**.
(La anon key es pública por diseño; la RLS de arriba hace que cada usuario solo vea SUS datos.)

### 3.4 Permite el login desde tu URL
Supabase → **Authentication → URL Configuration**: en **Site URL** y **Redirect URLs** agrega tu URL del paso 2 (ej. `https://algo.netlify.app`) y también `http://localhost:5173` si pruebas local. Email/magic-link ya viene activado por defecto.

### 3.5 Conecta la app
En la app → pestaña **Ajustes** → pega **Project URL** y **anon key** → **Guardar y conectar** → escribe tu correo → **Enviarme enlace de acceso** → abre el enlace **en ese mismo dispositivo**. Verás el punto verde "sincronizado". Repite el login en el celular con el mismo correo y listo: mismo progreso en todos lados.

---

## Notas
- Tus claves de Supabase se guardan **solo en el navegador de cada dispositivo** (localStorage), nunca en el código ni en un repo.
- Respaldo: Ajustes → **Exportar/Importar JSON** (por si quieres un backup manual).
- Si cambias `index.html` o `app.js`, sube el número de versión `CACHE` en `sw.js` para que el service worker tome los cambios.
