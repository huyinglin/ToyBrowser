const http = require('http');

const server = http.createServer((req, res) => {
  console.log('reques received');
  console.log(req.headers);

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

server.listen(8088, () => {
  console.log('listen on port: 8088');
});
