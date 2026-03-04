# Deployment

## GitHub Pages

The project deploys automatically to GitHub Pages via the included GitHub Actions workflow.

### How It Works

1. Push to `main` branch triggers the workflow
2. GitHub Actions installs dependencies and builds the SvelteKit app
3. The `build/` output is uploaded as a Pages artifact
4. GitHub Pages serves the static files

### Workflow File

Located at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write
```

### Configuration

#### SvelteKit Static Adapter

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    paths: {
      base: process.argv.includes('dev') ? '' : process.env.BASE_PATH ?? ''
    }
  }
};
```

#### SPA Mode

```typescript
// src/routes/+layout.ts
export const prerender = true;
export const ssr = false;
```

The `fallback: '404.html'` setting ensures that GitHub Pages serves the SPA shell for any route, enabling client-side routing.

### Base Path

For GitHub Pages project sites (e.g., `username.github.io/choke-scoreboard`), the `BASE_PATH` environment variable is set in the workflow:

```yaml
env:
  BASE_PATH: '/${{ github.event.repository.name }}'
```

### Manual Deployment

To deploy manually:

```bash
BASE_PATH="/choke-scoreboard" npm run build
```

Then upload the `build/` directory to any static hosting provider.

### Custom Domain

To use a custom domain, add a `CNAME` file in the `static/` directory:

```text
bjjscore.live
```

Then configure your DNS to point to GitHub Pages.

## Local Development

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # Build for production
npm run preview  # Preview production build locally
```
