import express from 'express'
import { getIronSession } from 'iron-session'
import { AtpAgent } from '@atproto/api'
import { HackConfig } from './config'
import { verifyJwt } from '@atproto/xrpc-server'
import { IdResolver } from '@atproto/identity'


type Session = {
  did: string
  handle: string
}

type Image = {
  image: string
  creator: string
}


export const createRoutes = (cfg: HackConfig) => {
  const router = express.Router()

  const agent = new AtpAgent({ service: 'https://api.bsky.app' })
  const idResolver = new IdResolver()

  const images: Image[] = []

  const getSession = (req: express.Request, res: express.Response) =>
    getIronSession<Session>(req, res, {
      cookieName: 'sid',
      password: cfg.cookieSecret,
      cookieOptions: {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
      },
    })


  router.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })

  router.post('/login', async (req, res) => {
    const jwt = req.body.jwt
    if(!jwt) {
      res.sendStatus(400)
      return
    }
    const validatedToken = await verifyJwt(jwt, 'did:web:dholms.com', null, (iss: string) => {
      return idResolver.did.resolveAtprotoKey(iss)
    })
    const did = validatedToken.iss
    const profRes = await agent.app.bsky.actor.getProfile({ actor: did })
    const handle = profRes.data.handle
    const session = await getSession(req, res)
    session.did = did
    session.handle = handle
    await session.save()
    res.send({ did, handle })
  })

  router.post('/image', async (req, res) => {
    const image = req.body.image
    if(!image) {
      res.sendStatus(400)
      return
    }
    const session = await getSession(req, res)
    const sessionHandle = session.handle
    if(!sessionHandle) {
      res.sendStatus(401)
      return
    }

    images.push({
      image,
      creator: sessionHandle
    })

    res.sendStatus(200)
   })

  router.get('/images', (_req, res) => {
    res.send(images.slice(0, 12))
   })

  return router
}