// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

const baseFolder = process.env.APPDATA && process.env.APPDATA !== ''
    ? `${process.env.APPDATA}/ASP.NET/https`
    : `${process.env.HOME}/.aspnet/https`

const certificateName = 'holochronicles.client'
const certFilePath = path.join(baseFolder, `${certificateName}.pem`)
const keyFilePath = path.join(baseFolder, `${certificateName}.key`)

export default defineConfig(({ command }) => {
    const plugins = [tailwindcss(), svgr(), react()]
    let serverConfig

    if (command === 'serve') {
        // ensure folder exists
        if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true })

        // generate if missing
        if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
            const { status } = child_process.spawnSync(
                'dotnet',
                ['dev-certs', 'https',
                    '--export-path', certFilePath,
                    '--format', 'Pem',
                    '--no-password'],
                { stdio: 'inherit' }
            )
            if (status !== 0) throw new Error('Could not create HTTPS dev-certificate.')
        }

        // sanity check: both files must start with “-----BEGIN”
        for (const p of [keyFilePath, certFilePath]) {
            const content = fs.readFileSync(p, 'utf8')
            if (!content.includes('-----BEGIN')) {
                throw new Error(`Certificate file ${p} is invalid PEM.`)
            }
        }

        const apiTarget = process.env.ASPNETCORE_HTTPS_PORT
            ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}`
            : process.env.ASPNETCORE_URLS
                ? process.env.ASPNETCORE_URLS.split(';')[0]
                : 'https://localhost:7240'

        serverConfig = {
            port: parseInt(process.env.DEV_SERVER_PORT || '60939'),
            https: {
                key: fs.readFileSync(keyFilePath),
                cert: fs.readFileSync(certFilePath),   // ← certFilePath, not keyFilePath
            },
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: false,
                },
            },
        }
    }

    return {
        plugins,
        resolve: {
            alias: { '@': path.resolve(__dirname, './src') },
        },
        ...(serverConfig ? { server: serverConfig } : {}),
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.ts',
            include: ['unittests/**/*.test.{ts,tsx}'],
            coverage: { provider: 'v8', reporter: ['html'], enabled: true },
        },
    }
})