import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var environment = loadEnv(mode, '.', '');
    var apiProxyTarget = ((_b = environment.VITE_API_PROXY_TARGET) === null || _b === void 0 ? void 0 : _b.trim()) || 'http://127.0.0.1:5050';
    return {
        plugins: [react(), tailwindcss()],
        server: {
            proxy: {
                '/api': {
                    target: apiProxyTarget,
                    changeOrigin: true,
                },
            },
        },
    };
});
