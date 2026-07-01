const http = require('http');
const https = require('https');
const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const options = {
      hostname: 'api.flutterwave.com',
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: 'api.flutterwave.com' },
    };
    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: 'Proxy error: ' + err.message }));
    });
    if (body.length > 0) proxyReq.write(body);
    proxyReq.end();
  });
});
server.listen(PORT, () => console.log('Flutterwave proxy listening on port ' + PORT));
