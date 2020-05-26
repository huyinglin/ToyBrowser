const http = require('http');

const server = http.createServer((req, res) => {
  console.log('reques received');
  console.log(req.headers);

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(
`<html maaa=a >
  <head>
    <style>
      #container {
        width: 500px;
        height: 300px;
        display: flex;
        background-color: rgb(255,255,255);
      }
      #container #myid {
        width: 200px;
        height: 100px;
        background-color: rgb(255,0,0);
      }
      #container .c1 {
        flex: 1;
        background-color: rgb(0,255,0);
      }
    </style>
  </head>
  <body>
      <div id="container">
        <div id="myid"></div>
        <div class="c1"></div>
      </div>
  </body>
</html>`);
});

server.listen(8088, () => {
  console.log('listen on port: 8088');
});
