import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'

interface Env {
  SHORT_URLS: KVNamespace
}

interface URL {
  url: string
  createdAt: number
}

const app = new Hono<{ Bindings: Env }>()

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
)

async function shorten(kv: KVNamespace, url: string) {
  const key = nanoid()
  const createdAt = Date.now()
  await kv.put(key, JSON.stringify({ url, createdAt }))
  return { key }
}

async function getUrl(kv: KVNamespace, key: string) {
  return kv.get<URL>(key, 'json')
}

app.get('/', (c) => c.text('shtn'))

app.post('/api/links', async (c) => {
  const { url } = await c.req.json<{ url: string }>()
  if (!url) {
    return c.text('Missing url', 400)
  }
  const { key } = await shorten(c.env.SHORT_URLS, url)
  return c.json({ key, url })
})

app.get('/api/links/:key', async (c) => {
  const key = c.req.param('key')
  const res = await getUrl(c.env.SHORT_URLS, key)
  if (!res) {
    return c.notFound()
  }
  return c.json({ key, url: res.url })
})

export default app
