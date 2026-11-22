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

const trustDevCert = process.env.TRUST_DEV_CERT === 'true'
const proxySecure = process.env.PROXY_SECURE ? process.env.PROXY_SECURE === 'true' : false

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

        // Optionally trust the machine dev-certificate (prompts UI on some platforms)
        if (trustDevCert) {
            const { status } = child_process.spawnSync('dotnet', ['dev-certs', 'https', '--trust'], { stdio: 'inherit' })
            if (status !== 0) {
                // don't fail the dev server just because trust failed, but warn in console
                console.warn('Warning: could not trust the dev certificate. You may need to run `dotnet dev-certs https --trust` manually.')
            }
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
                cert: fs.readFileSync(certFilePath),
            },
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: proxySecure, // set to true if backend cert is trusted
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