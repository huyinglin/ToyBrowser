
function Parser() {
  let state = wattingStatusLine;
  let statusLine = '';
  let headers = {};
  let headerName = '';
  let headerValue = '';

  this.statusLine = function() {
    return statusLine;
  };

  this.headers = function() {
    return headers;
  };

  this.receive = function(string) {
    string.split('').forEach(it => receiveChar(it));
  }

  function receiveChar(char) {
    state = state(char);
  }

/* ============================ paser statusLine ============================ */

  function wattingStatusLine(char) {
    switch (char) {
      case '\r':
        return wattingStatusLineEnd;
      case '\n':
        return wattingHeaderName;
      default:
        statusLine += char;
        return state;
    }
  }

  function wattingStatusLineEnd(char) {
    switch (char) {
      case '\n':
        return wattingHeaderName;
      default:
        return state;
    }
  }

/* ============================== paser headers ============================= */

  function wattingHeaderName(char) {
    switch (char) {
      case ':':
        return wattingHeaderSpace;
      case '\r':
        // new TrunkedBodyParser();
        return wattingBody;
      default:
        headerName += char;
        return state;
    }
  }

  function wattingHeaderValue(char) {
    switch (char) {
      case '\r':
        headers[headerName] = headerValue;
        headerName = '';
        headerValue = '';
        return wattingHeaderLineEnd;
      default:
        headerValue += char;
        return state;
    }
  }

  function wattingHeaderSpace(char) {
    switch (char) {
      case ' ':
        return wattingHeaderValue;
      default:
        return state;
    }
  }

  function wattingHeaderLineEnd(char) {
    switch (char) {
      case '\n':
        return wattingHeaderName;
      default:
        return state;
    }
  }

  function wattingBody(char) {
    return state;
  }
}

module.exports = Parser;
