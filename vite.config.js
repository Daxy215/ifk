import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return defineConfig({
        plugins: [react()],
        build: {
            sourcemap: true,
        },
        server: {
            port: parseInt(env.VITE_PORT),
            proxy: {
                '/api': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                    secure: true
                },
            },
            historyApiFallback: true,
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    });
};
