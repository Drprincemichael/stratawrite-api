const http = require('http');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({status: 'ok', service: 'StrataWrite API'}));
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: body,
        });
        const data = await response.json();
        res.writeHead(response.status, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
      } catch (error) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: error.message}));
      }
    });
    return;
  }

  res.writeHead(404, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({error: 'Not found'}));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`StrataWrite API running on port ${PORT}`));
