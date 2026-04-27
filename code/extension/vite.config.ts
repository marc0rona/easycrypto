import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);
const tailwindcss = require(
  require.resolve('@tailwindcss/vite', {
    paths: [resolve(rootDir, '../frontend')],
  }),
).default as () => unknown;
const manifestPath = resolve(rootDir, 'manifest.json');
const backendEnvPath = resolve(rootDir, '../backend/.env');
const productionApiBaseUrl = 'https://api.ez-crypt0.example.com/api/v1';

function toBuiltFileName(file: string): string {
  const name = file.split('/').pop() ?? file;

  return name.replace('.ts', '.js');
}

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function toLocalApiBaseUrl(host: 'localhost' | '127.0.0.1', port: number): string {
  return `http://${host}:${port}/api/v1`;
}

function uniqueValues<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function parsePortValue(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().replace(/^['"]|['"]$/g, '');
  const parsedPort = Number(normalizedValue);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return null;
  }

  return parsedPort;
}

function readBackendPort(): number | null {
  if (!existsSync(backendEnvPath)) {
    return null;
  }

  const backendEnvFile = readFileSync(backendEnvPath, 'utf8');
  const portMatch = backendEnvFile.match(/^PORT=(.+)$/m);

  return parsePortValue(portMatch?.[1]);
}

function getDefaultApiBaseUrl(): string {
  const backendPort = readBackendPort();

  if (backendPort) {
    return toLocalApiBaseUrl('localhost', backendPort);
  }

  return productionApiBaseUrl;
}

function getLocalFallbackApiBaseUrls(): string[] {
  const backendPort = readBackendPort();

  if (!backendPort) {
    return [];
  }

  return uniqueValues([
    toLocalApiBaseUrl('localhost', backendPort),
    toLocalApiBaseUrl('127.0.0.1', backendPort),
  ]);
}

function getApiBaseUrls(configuredApiBaseUrl?: string): string[] {
  const primaryApiBaseUrl = normalizeApiBaseUrl(configuredApiBaseUrl || getDefaultApiBaseUrl());

  return uniqueValues([primaryApiBaseUrl, ...getLocalFallbackApiBaseUrls()]);
}

function toHostPermissions(apiBaseUrls: string[]): string[] {
  return uniqueValues(apiBaseUrls.map((apiBaseUrl) => `${new URL(apiBaseUrl).origin}/*`));
}

function emitExtensionManifest(apiHostPermissions: string[]) {
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
      manifest.host_permissions = uniqueValues([...manifest.host_permissions, ...apiHostPermissions]);

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
  const apiBaseUrls = getApiBaseUrls(env.EZ_CRYPT0_API_BASE_URL);
  const apiHostPermissions = toHostPermissions(apiBaseUrls);

  return {
    define: {
      __EZ_CRYPT0_API_BASE_URL__: JSON.stringify(apiBaseUrls[0]),
    },
    plugins: [
      react(),
      tailwindcss(),
      removeUnusedCssAssets(),
      emitExtensionManifest(apiHostPermissions),
    ],
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
