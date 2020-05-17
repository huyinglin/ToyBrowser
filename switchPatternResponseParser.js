class ResPonseParser {
  constructor() {
    this.state = this.waitingStatusLine;
    this.statusLine = '';
    this.headers = {};
    this.headerName = '';
    this.headerValue = '';
    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(''),
    }
  }

  receive(string) {
    string.split('').forEach(it => this.receiveChar(it));
  }

  receiveChar(char) {
    this.state = this.state(char);
  }

/* ============================ paser statusLine ============================ */

  waitingStatusLine(char) {
    switch (char) {
      case '\r':
        return this.waitingStatusLineEnd;
      case '\n':
        return this.waitingHeaderName;
      default:
        this.statusLine += char;
        return this.state;
    }
  }

  waitingStatusLineEnd(char) {
    switch (char) {
      case '\n':
        return this.waitingHeaderName;
      default:
        return this.state;
    }
  }

/* ============================== paser headers ============================= */

  waitingHeaderName(char) {
    switch (char) {
      case ':':
        return this.waitingHeaderSpace;
      case '\r':
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          // Transfer-Encoding: 指明了将实体传递给用户所采用的编码形式。
          //
          // @Syntax
          // chunked: 数据以一系列分块的形式进行发送。Content-Length 首部在这种情况下不被发送。
          //   在每一个分块的开头需要添加当前分块的长度，以十六进制的形式表示，后面紧跟着 '\r\n' ，
          //   之后是分块本身，后面也是'\r\n' 。终止块是一个常规的分块，不同之处在于其长度为0。
          //   终止块后面是一个挂载（trailer），由一系列（或者为空）的实体消息首部构成。
          // compress: 采用 Lempel-Ziv-Welch 压缩算法。这种内容编码方式已经被大部分浏览器弃用，部分因为专利问题（这项专利在2003年到期）。
          // deflate: 采用 zlib 结构 (在 RFC 1950 中规定)，和 deflate 压缩算法(在 RFC 1951 中规定)。
          // gzip: 表示采用 Lempel-Ziv coding (LZ77) 压缩算法，以及32位CRC校验的编码方式。
          // identity: 用于指代自身（例如：未经过压缩和修改）。除非特别指明，这个标记始终可以被接受。
          //
          // gzip, chunked: 可以是多个值，多个值之间以逗号分隔

          this.bodyParser = new TrunkedBodyParser();
        }
        return this.waitingHeaderBlockEnd;
      default:
        this.headerName += char;
        return this.state;
    }
  }

  waitingHeaderValue(char) {
    switch (char) {
      case '\r':
        this.headers[this.headerName] = this.headerValue;
        this.headerName = '';
        this.headerValue = '';
        return this.waitingHeaderLineEnd;
      default:
        this.headerValue += char;
        return this.state;
    }
  }

  waitingHeaderSpace(char) {
    switch (char) {
      case ' ':
        return this.waitingHeaderValue;
      default:
        return this.state;
    }
  }

  waitingHeaderLineEnd(char) {
    switch (char) {
      case '\n':
        return this.waitingHeaderName;
      default:
        return this.state;
    }
  }

  waitingHeaderBlockEnd(char) {
    switch (char) {
      case '\n':
        return this.waitingBody;
      default:
        return this.state;
    }
  }

/* =============================== parser body ============================== */

  waitingBody(char) {
    if (this.bodyParser) {
      this.bodyParser.receiveChar(char);
    }
    return this.state;
  }
}

class TrunkedBodyParser {
  constructor() {
    this.state = this.waitingLength;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
  }

  receiveChar(char) {
    this.state = this.state(char);
  }

  waitingLength(char) {
    switch (char) {
      case '\r':
        return this.waitingStatusLineEnd;
      default:
        this.length *= 16;
        this.length += parseInt(char, 16);
        if (this.length === 0) {
          // 如果下一行的长度为0，表明body结束
          this.isFinished = true;
        }
        return this.state;
    }
  }

  waitingStatusLineEnd(char) {
    switch (char) {
      case '\n':
        return this.readingTrunk;
      default:
        return this.state;
    }
  }

  readingTrunk(char) {
    if (this.isFinished) {
      return this.state;
    }
    this.content.push(char);
    this.length--;
    if (this.length === 0) {
      return this.waitingNewLine;
    }
    return this.state;
  }

  waitingNewLine(char) {
    switch (char) {
      case '\r':
        return this.waitingNewLineEnd;
      default:
        return this.state;
    }
  }

  waitingNewLineEnd(char) {
    switch (char) {
      case '\n':
        return this.waitingLength;
      default:
        return this.state;
    }
  }
}

module.exports = ResPonseParser;
