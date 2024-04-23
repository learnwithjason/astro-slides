import { defineConfig } from 'astro/config';

import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [sentry()]
});