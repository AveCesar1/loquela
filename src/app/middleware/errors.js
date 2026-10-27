export default function errorHandler(err, req, res, next) {
  if (err && err.status === 404) {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ ok: false, error: 'not found' });
    }
    return res.status(404).render('layout', {
      title: 'Not found',
      scripts: '',
      body: '<h1>Not found</h1><p>The requested page does not exist.</p>',
    });
  }

  console.error('[loquela] 500', err);

  if (req.path.startsWith('/api')) {
    return res.status(500).json({ ok: false, error: 'internal server error' });
  }

  return res.status(500).render('layout', {
    title: 'Server error',
    scripts: '',
    body: '<h1>Server error</h1><p>Something went wrong.</p>',
  });
}