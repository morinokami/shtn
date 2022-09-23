import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'

const app = new Hono()

const store: {
  [key: string]: { url: string; createdAt: string } | undefined
} = {}

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
)

function shorten(url: string) {
  const key = nanoid()
  const createdAt = new Date().toISOString()
  store[key] = { url, createdAt }
  return { key }
}

function getUrl(key: string) {
  return store[key]
}

app.get('/', (c) => c.text('shtn'))

app.post('/api/links', async (c) => {
  const { url } = await c.req.json<{ url: string }>()
  if (!url) {
    return c.text('Missing url', 400)
  }
  const { key } = shorten(url)
  return c.json({ key, url })
})

app.get('/api/links/:key', (c) => {
  const key = c.req.param('key')
  const res = getUrl(key)
  if (!res) {
    return c.notFound()
  }
  return c.json({ key, url: res.url })
})

export default app
