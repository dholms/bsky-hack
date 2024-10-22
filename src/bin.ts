import dotenv from 'dotenv'
import { HackServer } from '.'
import { readEnv } from './config'

dotenv.config()

const run = async () => {
  const config = readEnv()
  await HackServer.create(config)
}

run()
