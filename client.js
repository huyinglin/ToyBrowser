const net = require('net');
const HTTPParser = require('./http-parser');
const HTMLParser = require('./html-parser');

class Request {
  // @param method, url = host + port + path
  // body: k/v
  // headers

  constructor(options) {
    this.method = options.method || 'GET';
    this.host = options.host;
    this.port = options.port || 80;
    this.path = options.path || '/';
    this.body = options.body || {};
    this.headers = options.headers || {};

    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
    }

    this.headers['Content-Length'] = this.bodyText.length;
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}
\r
${this.bodyText}`;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new HTTPParser();
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port,
        }, () => {
          connection.write(this.toString());
        });
      }

      connection.on('data', (data) => {
        parser.receive(data.toString());
        if (parser.isFinished) {
          resolve(parser.response);
        }
        connection.end();
      });

      connection.on('error', (err) => {
        resolve(err);
        connection.end();
      });
    });
  }
}

void async function () {
  const request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8088',
    headers: {
      'X-Foo2': 'customed'
    },
    body: {
      name: 'winter'
    }
  });

  const response = await request.send();

  // console.log(response.body);

  const dom = HTMLParser.parseHTML(response.body);

  console.log(JSON.stringify(dom, null, '    '));

}();

// const request = new Request({
//   method: 'POST',
//   host: '127.0.0.1',
//   port: '8088',
//   headers: {
//     'X-Foo2': 'customed'
//   },
//   body: {
//     name: 'winter'
//   }
// });

// request.send();

// const client = net.createConnection({
//   host: '127.0.0.1',
//   port: 8088,
// }, () => {

//   const request = new Request({
//     method: 'POST',
//     host: '127.0.0.1',
//     port: '8088',
//     headers: {
//       'X-Foo2': 'customed'
//     },
//     body: {
//       name: 'winter'
//     }
//   });

//   console.log(request.toString());

//   client.write(request.toString())

//   // 'connect' listener.
//   console.log('connected to server!');
//   // client.write('POST / HTTP/1.1\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 11\r\n\r\nname=winter');
// });
// client.on('data', (data) => {
//   console.log(data.toString());
//   client.end();
// });
// client.on('end', () => {
//   console.log('disconnected from server');
// });
