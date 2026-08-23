import http from 'node:http';
import { pathToFileURL } from 'node:url';

const pixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const user = {
  email: 'qa@example.com',
  token: 'strategy-lab-token',
  username: 'strategy_lab',
  bio: 'Evidence over assumptions',
  image: pixel,
};

const article = {
  slug: 'testing-strategies-with-evidence',
  title: 'Testing strategies with evidence',
  description: 'Compare confidence, detection and execution cost.',
  body: 'A reproducible strategy benchmark.',
  tagList: ['testing', 'quality'],
  createdAt: '2026-08-22T12:00:00.000Z',
  updatedAt: '2026-08-22T12:00:00.000Z',
  favorited: false,
  favoritesCount: 3,
  author: {
    username: 'strategy_lab',
    bio: 'Evidence over assumptions',
    image: pixel,
    following: false,
  },
};

function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createMockApiServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const { pathname } = url;

    if (pathname === '/health') return json(res, 200, { ok: true });
    if (req.method === 'GET' && pathname === '/api/tags') {
      return json(res, 200, { tags: ['testing', 'quality', 'playwright'] });
    }
    if (req.method === 'GET' && (pathname === '/api/articles' || pathname === '/api/articles/feed')) {
      return json(res, 200, { articles: [article], articlesCount: 1 });
    }
    if (req.method === 'GET' && pathname === `/api/articles/${article.slug}`) {
      return json(res, 200, { article });
    }
    if (req.method === 'POST' && pathname === '/api/users/login') {
      const body = await readJson(req);
      if (!body?.user?.email || !body?.user?.password) {
        return json(res, 422, { errors: { credentials: ['are required'] } });
      }
      return json(res, 200, { user });
    }
    if (req.method === 'POST' && pathname === '/api/users') {
      return json(res, 201, { user });
    }
    if (req.method === 'GET' && pathname === '/api/user') {
      return json(res, 200, { user });
    }
    if (req.method === 'GET' && pathname === `/api/profiles/${user.username}`) {
      return json(res, 200, { profile: article.author });
    }
    if (pathname === `/api/articles/${article.slug}/favorite` && ['POST', 'DELETE'].includes(req.method)) {
      const favorited = req.method === 'POST';
      return json(res, 200, {
        article: {
          ...article,
          favorited,
          favoritesCount: article.favoritesCount + (favorited ? 1 : 0),
        },
      });
    }

    return json(res, 404, { errors: { resource: ['not found'] } });
  });
}

export async function listenMockApi(port = 3001) {
  const server = createMockApiServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3001);
  const server = await listenMockApi(port);
  console.log(`Deterministic RealWorld API listening on http://127.0.0.1:${port}`);

  const stop = () => server.close(() => process.exit(0));
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
