import assert from 'node:assert'

export type HackConfig = {
  cookieSecret: string
  port: number
}

export const readEnv = (): HackConfig => {
  const cookieSecret = process.env.COOKIE_SECRET
  assert(typeof cookieSecret === 'string')
  const port = parseInt(process.env.PORT ?? '')
  assert(typeof port === 'number' && !isNaN(port))
  return {
    cookieSecret,
    port,
  }
}
