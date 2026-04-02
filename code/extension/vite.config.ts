import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const manifestPath = resolve(rootDir, 'manifest.json');
const defaultApiBaseUrl = 'https://api.ez-crypt0.example.com/api/v1';

function toBuiltFileName(file: string): string {
  const name = file.split('/').pop() ?? file;

  return name.replace('.ts', '.js');
}

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function toHostPermission(apiBaseUrl: string): string {
  return `${new URL(apiBaseUrl).origin}/*`;
}

function emitExtensionManifest(apiHostPermission: string) {
  return {
    name: 'emit-extension-manifest',
    apply: 'build',
    generateBundle() {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        background: { service_worker: string };
        content_scripts: Array<{ js: string[] }>;
        host_permissions: string[];
      };

      manifest.background.service_worker = toBuiltFileName(manifest.background.service_worker);
      manifest.content_scripts = manifest.content_scripts.map((script) => ({
        ...script,
        js: script.js.map(toBuiltFileName),
      }));
      manifest.host_permissions = [apiHostPermission];

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}

function removeUnusedCssAssets() {
  return {
    name: 'remove-unused-css-assets',
    apply: 'build',
    generateBundle(_options: unknown, bundle: Record<string, { type: string }>) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type === 'asset' && fileName.endsWith('.css')) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const apiBaseUrl = normalizeApiBaseUrl(env.EZ_CRYPT0_API_BASE_URL || defaultApiBaseUrl);
  const apiHostPermission = toHostPermission(apiBaseUrl);

  return {
    define: {
      __EZ_CRYPT0_API_BASE_URL__: JSON.stringify(apiBaseUrl),
    },
    plugins: [react(), removeUnusedCssAssets(), emitExtensionManifest(apiHostPermission)],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(rootDir, 'popup.html'),
          background: resolve(rootDir, 'src/background.ts'),
          'content-script': resolve(rootDir, 'src/content-script.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
  };
});
