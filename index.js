const http = require('http');
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        console.log('Calling Anthropic, model:', parsed.model);
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({...parsed, model: 'claude-haiku-4-5-20251001'}),
        });
        console.log('Anthropic status:', response.status);
        const data = await response.json();
        console.log('Anthropic reply:', JSON.stringify(data).slice(0, 100));
        res.writeHead(response.status, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
      } catch (e) {
        console.log('ERROR:', e.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: e.message}));
      }
    });
    return;
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({status: 'ok', service: 'StrataWrite API'}));
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`StrataWrite API running on port ${PORT}`));
