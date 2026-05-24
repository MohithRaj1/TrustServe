# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Google Maps Embed (Optional)

To enable Google Maps embedded route previews in the receiver dashboard, set a Vite environment variable with your Google Maps Embed API key.

1. Create a file named `.env.local` at the project root (this file is ignored by git in many setups):

```bash
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

2. Restart the dev server so Vite can pick up the env var:

```bash
npm run dev -- --host
```

3. Behavior:
- If `VITE_GOOGLE_MAPS_API_KEY` is present, the receiver map preview uses the Google Maps Embed iframe (Directions when both origin and destination coordinates are available, otherwise a Place view).
- If the key is missing, the app falls back to an OpenStreetMap static image preview.

Note: Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with a valid Google Maps Embed API key. Keep the key secret; do not commit it to a public repository.
