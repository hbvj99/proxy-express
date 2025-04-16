const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Global CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change to your domain later if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Base64 URL path: /proxy/base64_encoded_data/
app.get('/proxy/:b64', (req, res) => {
  const base64Url = req.params.b64;

  if (!base64Url) {
    return res.status(400).json({ message: 'Missing Base64 URL in path' });
  }

  let decodedUrl;
  try {
    decodedUrl = Buffer.from(base64Url, 'base64').toString('utf8');
  } catch (e) {
    return res.status(400).json({ message: 'Invalid Base64 encoding' });
  }

  https.get(decodedUrl, { rejectUnauthorized: false }, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    });
  }).on('error', err => {
    console.error("Proxy error:", err);
    res.status(500).json({ message: 'Proxy request failed' });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running at http://localhost:${PORT}`);
});
