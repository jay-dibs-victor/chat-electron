import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: resolve(__dirname, 'src/main/main.ts'),
                external: ['sqlite3', 'electron', 'ws'],
            },
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: resolve(__dirname, 'src/preload/index.ts'),
            },
        },
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve(__dirname, 'src/renderer'),
            },
        },
        plugins: [react()],
        root: 'src/renderer',
        build: {
            rollupOptions: {
                input: resolve(__dirname, 'src/renderer/index.html'),
                onwarn(warning, warn) {
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
                        return;
                    }
                    warn(warning);
                }
            },
        },
    },
});
