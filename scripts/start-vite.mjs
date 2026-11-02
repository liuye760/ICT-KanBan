import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(projectRoot)

const { createServer } = await import('vite')
const server = await createServer({ configFile: path.join(projectRoot, 'vite.config.js') })

await server.listen()
server.printUrls()