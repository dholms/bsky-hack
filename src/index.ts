import express from 'express'
import http from 'node:http'
import events from 'node:events'
import { createRoutes } from './routes'
import { HackConfig } from './config'
export { readEnv } from './config'

export class HackServer {
  constructor(
    public app: express.Application,
    public server: http.Server,
  ) {}

  static async create(cfg: HackConfig) {
    const app = express()

    app.use(express.json())
    app.use(createRoutes(cfg))

    const server = app.listen(cfg.port)
    await events.once(server, 'listening')
    console.log('server running')

    return new HackServer(app, server)
  }

  async destroy() {
    this.server.close()
    await events.once(this.server, 'close')
  }
}
