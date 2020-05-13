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
        this.length *= 10;
        this.length += char.charCodeAt(0) - '0'.charCodeAt(0);
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
