const http = require('http');

const server = http.createServer(async (req, res) => {
  console.log(`REQUEST: ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end('{}');
  }

  if (req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({status: 'ok', service: 'StrataWrite API', method: req.method, url: req.url}));
  }

  if (req.method === 'POST') {
    console.log('POST received!');
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      console.log('Body length:', body.length);
      try {
        const parsed = JSON.parse(body || '{}');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(parsed),
        });
        const data = await response.json();
        console.log('Anthropic response status:', response.status);
        res.writeHead(response.status);
        res.end(JSON.stringify(data));
      } catch (error) {
        console.log('Error:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({error: error.message}));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({error: 'Not found', method: req.method, url: req.url}));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`StrataWrite API running on port ${PORT}`));
