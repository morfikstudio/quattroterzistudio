# Quattro Terzi Studio

Site e portfolio basato su [Sanity.io](https://sanity.io) e [Next.js](https://nextjs.org).

## Tech stack

- **Next.js 16** (App Router)
- **Sanity v5** (Studio, Vision, Presentation)
- **Tailwind CSS**
- **TypeScript** con Sanity TypeGen

## Prerequisiti

- **Node.js v24.13.1** — in root del progetto è presente `.nvmrc`; eseguire `nvm use` prima di `npm install` e `npm run dev`.
- Account [Sanity](https://sanity.io)

## Pagine

- **Home** — `/`
- **Projects** — `/projects`
- **Dettaglio progetto** — `/projects/[project-slug]`
- **About** — `/about`

## Content model

- **Project** — Progetti (title, slug, media). Il campo `media` è un elenco di immagini e video.

Gli schema sono in `src/sanity/schemaTypes/`. Dopo modifiche allo schema: `npm run typegen`.

## Setup Sanity

### 1. Crea un progetto Sanity

- Vai su [sanity.io/manage](https://sanity.io/manage) → **Create project**, oppure
- Dalla cartella del progetto: `npx sanity@latest init` e scegli **Create new project**.

Annota il **Project ID**.

### 2. Crea i dataset

In [sanity.io/manage](https://sanity.io/manage) → tuo progetto → **Datasets**: crea `production` e, se serve, `development`.

Da CLI (con `NEXT_PUBLIC_SANITY_PROJECT_ID` e `NEXT_PUBLIC_SANITY_DATASET` in `.env.local`):

```bash
nvm use
npx sanity dataset create production
npx sanity dataset create development   # opzionale
```

### 3. Deploy dello schema

```bash
nvm use
npx sanity schema deploy
```

### 4. Contenuto

Crea i progetti da **Sanity Studio**

**Promuovere tutto da development a production** (sostituisce il contenuto di production):

```bash
npm run promote:dev-to-prod
```

Attenzione: sovrascrive production con development. Usare solo quando sei sicuro.

Crea i progetti da **Sanity Studio** (http://localhost:3000/studio con `npm run dev`): tipo **Project**, campi title, slug e media (immagini e video).

## Setup app

1. **Installa le dipendenze**

   ```bash
   nvm use
   npm install
   ```

2. **Variabili d’ambiente**

   Crea `.env.local` con:

   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

   Opzionale: `NEXT_PUBLIC_SANITY_API_VERSION` (default: `2026-02-23`).

3. **Avvio in sviluppo**

   ```bash
   nvm use
   npm run dev
   ```

   - **Site:** [http://localhost:3000](http://localhost:3000)
   - **Studio:** [http://localhost:3000/studio](http://localhost:3000/studio)

## Scripts

| Comando            | Descrizione                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Avvia il server di sviluppo    |
| `npm run build`    | Build di produzione            |
| `npm run start`    | Avvia il server di produzione  |
| `npm run typegen`         | Rigenera i tipi Sanity              |
| `npm run promote:dev-to-prod` | Copia dataset development → production (sovrascrive prod) |
| `npm run lint`     | Esegue ESLint                  |
| `npm run format`   | Formatta con Prettier          |

## Struttura progetto

- **`src/app/`** — Next.js App Router (frontend, `/studio`)
- **`src/sanity/`** — Config Sanity, schema, query, resolve per Presentation
- **`src/components/`** — Componenti React (header, project, project-card, title)

## Revalidation

Il sito usa ISR con `revalidate: 60` (secondi). Non sono configurati webhook né revalidate on-demand.
