import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
    // Load environment variables
    const env = loadEnv(mode, process.cwd(), '');
    const API_URL = `${env.VITE_APP_BASE_NAME || '/'}`;

    // Use custom port for development server (avoid conflicts with backend)
    const PORT = 3001;

    console.log(`Running in ${mode} mode with API URL: ${env.VITE_API_URL || 'not set'}`);

    return {
        server: {
            // this ensures that the browser opens upon server start
            open: true,
            // this sets a default port to 3001 (backend is likely using 3000)
            port: PORT,
            host: true,
            // Add proxy for API requests during development
            proxy: mode === 'development' ? {
                '/api/v1': {
                    target: 'http://localhost:8000',
                    changeOrigin: true,
                    secure: false
                }
            } : {}
        },
        build: {
            chunkSizeWarningLimit: 1600,
            outDir: 'build',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled']
                    }
                }
            }
        },
        preview: {
            open: true,
            host: true
        },
        define: {
            global: 'window'
        },
        resolve: {
            alias: [
                // { find: '', replacement: path.resolve(__dirname, 'src') },
                // {
                //   find: /^~(.+)/,
                //   replacement: path.join(process.cwd(), 'node_modules/$1')
                // },
                // {
                //   find: /^src(.+)/,
                //   replacement: path.join(process.cwd(), 'src/$1')
                // }
                // {
                //   find: 'assets',
                //   replacement: path.join(process.cwd(), 'src/assets')
                // },
            ]
        },
        base: API_URL,
        plugins: [react(), jsconfigPaths()]
    };
});
