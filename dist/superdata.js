(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.superdata = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],2:[function(require,module,exports){
/* eslint-env browser */
module.exports = FormData;

},{}],3:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],4:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

Request.prototype.parse = function(fn){
  this._parser = fn;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename || file.name);
  return this;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this.getHeader('Content-Type');
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

Request.prototype.then = function (fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":1,"reduce":3}],5:[function(require,module,exports){
/*jslint node: true */
"use strict";

module.exports = {
	errorMessages: {
		NOT_FOUND: "NOT_FOUND"
	},
	exceptionMessages: {
		NOT_A_FUNCTION: "NOT_A_FUNCTION"
	}
};

},{}],6:[function(require,module,exports){
/*jslint node: true */
"use strict";

var createModelObject = require("./modelObject");

module.exports = function createModel(options) {
	if (!options) {
		options = {};
	}

	if (!options.idField) {
		throw new Error("options.idField is mandatory!");
	}

	if (!options.fields) {
		throw new Error("options.fields is mandatory!");
	}

	if (!options.proxy) {
		throw new Error("options.proxy is mandatory!");
	}
	
	var idField = options.idField;
	var fields = options.fields;

	var proxy = options.proxy;

	//options.fields should be an array of objects
	//the objects should describe the fields:
	// - name
	// - type
	// - validators
	// - mapping
	// - defaultValue
	// - beforeChange
	// - afterChange

	function list(options, callback) {
		proxy.read(options, function(err, result) {
			if (err) {
				return callback(err);
			}

			var data = [];

			result.items.forEach(function(item) {
				data.push(createModelObject({
					model: model,

					data: item
				}));
			});

			var resultObj = {
				items: data,
				count: result.count
			};

			callback(null, resultObj);
		});
	}

	function load(id, callback) {
		proxy.readOneById(id, function(err, result) {
			if (err) {
				return callback(err);
			}

			var modelObject = createModelObject({
				model: model,

				data: result
			});
			callback(null, modelObject);
		});
	}

	function create(modelValues, callback) {
		proxy.createOne(modelValues, function(err, result) {
			if (err) {
				return callback(err);
			}

			callback(null, createModelObject({
				model: model,

				data: result
			}));
		});
	}

	var model = Object.freeze({
		fields: fields,
		proxy: proxy,
		idField: idField,

		list: list,
		load: load,
		create: create
	});

	return model;
};
},{"./modelObject":7}],7:[function(require,module,exports){
/*jslint node: true */
"use strict";

var createProp = require("./prop");

module.exports = function createModelObject(options) {
	if (!options) {
		options = {};
	}

	if (!options.data) {
		throw new Error("options.data is mandatory!");
	}

	if (!options.model) {
		throw new Error("options.model is mandatory!");
	}

	if (!options.model.fields) {
		throw new Error("options.model.fields is mandatory!");
	}

	if (!options.model.idField) {
		throw new Error("options.model.idField is mandatory!");
	}

	if (!options.model.proxy) {
		throw new Error("options.model.proxy is mandatory!");
	}

	var model = options.model;

	var fields = options.model.fields;
	var idField = options.model.idField;
	var proxy = options.model.proxy;


	var data = {};

	for (var prop in fields) {
		var actField = fields[prop];
		var actValue = options.data.hasOwnProperty(prop) ? options.data[prop] : actField.defaultValue;

		createProp(data, prop, {
			value: actValue,
			beforeChange: createBeforeChangeFunction(prop),
			afterChange: createAfterChangeFunction(prop)
		});
	}

	var obj = {
		data: data,
		model: model,

		read: read,
		save: save,
		destroy: destroy
	};

	function createBeforeChangeFunction(propName) {
		return function beforeChange(values) {
			validate(propName, values);

			//var field = fields[propName];

/*
			if (field.beforeChange) {
				if (typeof field.beforeChange === "function") {

				}
			}
*/
		};
	}

	function createAfterChangeFunction() {
		return function afterChange() {
			//call the onChange listeners
		};
	}


	function validate(propName) {
		var field = fields[propName];

		if (!field) {
			return;
		}

		if (!field.validators) {
			return;
		}
	}

	function read(callback) {
		var id = data[idField];
		proxy.readOneById(id, function(err, result) {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});
	}

	function save(callback) {
		var id = data[idField];
		proxy.updateOneById(id, data, function(err, result) {
			if (err) {
				return callback(err);
			}

			for (var prop in result) {
				data[prop] = result[prop];
			}

			callback(null, obj);
		});
	}

	//deleted flag?
	function destroy(callback) {
		var id = data[idField];
		proxy.destroyOneById(id, function(err) {
			if (err) {
				return callback(err);
			}

			callback(null, obj);
		});
	}

	return obj;
};

},{"./prop":8}],8:[function(require,module,exports){
/*jslint node: true */
"use strict";

module.exports = function createProp(obj, name, config) {
	//should be called field
	config = config || {};

	var initialValue = config.value;
	var value = initialValue;
	var lastValue = value;

	Object.defineProperty(obj, name, {
		enumerable: true,
		configurable: false,

		set: set,
		get: get
	});

	function set(newVal) {
		if (newVal === value) {
			return;
		}

		if (typeof config.beforeChange === "function") {
			config.beforeChange({lastValue: lastValue, value: value, newValue: newVal, initialValue: initialValue});
		}

		lastValue = value;
		value = newVal;

		if (typeof config.afterChange === "function") {
			config.afterChange({lastValue: lastValue, value: value, newValue: newVal, initialValue: initialValue});
		}
	}

	function get() {
		return value;
	}

	return obj;
};

},{}],9:[function(require,module,exports){
(function (global){
/*
 * Ajax proxy shell
 */

/*jslint node: true */
"use strict";

var createReader = require("../reader/json");

var ajaxCore = require("./ajaxCore");

var request = require("superagent");

// var isNode = new Function("try {return this===global;}catch(e){return false;}");
var environment;

try {
	environment = window ? window : global;
} catch (e) {
	environment = global;
}

var FormData = environment.FormData;
if (!FormData) {
	FormData = require("form-data");
}

var ajaxHelpers = require("./ajaxHelpers")({
	request: request,
	createReader: createReader
});

module.exports = ajaxCore({
	ajaxHelpers: ajaxHelpers,
	FormData: FormData
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../reader/json":17,"./ajaxCore":10,"./ajaxHelpers":11,"form-data":2,"superagent":4}],10:[function(require,module,exports){
/*
 * Ajax proxy core
 */

/*jslint node: true */
"use strict";

var defaultTimeout = 3000;

module.exports = function(dependencies) {

	if (!dependencies.ajaxHelpers) {
		throw new Error("dependencies.ajaxHelpers is mandatory!");
	}

	if (!dependencies.FormData) {
		throw new Error("dependencies.FormData is mandatory!");
	}

	var ajaxHelpers = dependencies.ajaxHelpers;
	var createOperationConfig = ajaxHelpers.createOperationConfig;
	var dispatchAjax = ajaxHelpers.dispatchAjax;
	var prepareOperationsConfig = ajaxHelpers.prepareOperationsConfig;
	var assert = ajaxHelpers.assert;
	var FormData = dependencies.FormData;
	
	return function createAjaxProxy(config) {
		if (!config) {
			config = {};
		}

		if (!config.idProperty) {
			throw new Error("config.idProperty is mandatory!");
		}

		if (!config.operations) {
			throw new Error("config.operations is mandatory!");
		}

		if(config.fieldsToBeExcluded) {
			if(!(config.fieldsToBeExcluded instanceof "Array")) {
				throw Error("config.fieldsToBeExcluded should be an array");
			}
		}

		var timeout = config.timeout || defaultTimeout;

		var idProperty = config.idProperty;

		var generateId = config.generateId || (function() {
			var nextId = 0;

			return function() {
				return nextId += 1;
			};
		}());

		var queryMapping = config.queryMapping;

		var fieldsToBeExcluded = config.fieldsToBeExcluded;

		function removeFields(object, fields) {
			if(!fields){
				return;
			}

			for(var i = 0; i < fields.length; i += 1){
				for(var prop in object){
					if(fields[i] === prop){
						delete object[prop];
					}
				}
			}
		}

		prepareOperationsConfig(config.operations);

		function createOne(data, callback) {
			removeFields(data, fieldsToBeExcluded);

			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.createOne, null, data);


			if (data.constructor === FormData) {
				actConfig.formData = true;
			}


			dispatchAjax(actConfig, callback);
		}

		function read(options, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);
			if (typeof queryMapping === "function") {
				options = queryMapping(options);
			}
			var actConfig = createOperationConfig(config.operations.read);

			for (var prop in options) {
				actConfig.queries[prop] = options[prop];
			}
			actConfig.method = actConfig.method.toLowerCase();
			dispatchAjax(actConfig, filters, callback);
		}

		function readOneById(id, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.readOneById, id);
			dispatchAjax(actConfig, filters, callback);
		}

		function updateOneById(id, newData, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			removeFields(newData, fieldsToBeExcluded);

			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.updateOneById, id, newData);
			dispatchAjax(actConfig, filters, callback);
		}

		function destroyOneById(id, filters, callback) {
			if(!callback) {
				callback = filters;
				filters = undefined;
			}
			checkCallback(callback);
			var actConfig = createOperationConfig(config.operations.destroyOneById, id);
			dispatchAjax(actConfig, filters, callback);
		}

		function checkCallback(callback) {
			assert(typeof callback === "function", "callback should be a function");
		}

		return Object.freeze({
			idProperty: idProperty,
			generateId: generateId,
			config: config,

			read: read,

			createOne: createOne,

			readOneById: readOneById,
			updateOneById: updateOneById,
			destroyOneById: destroyOneById
		});
	};
};
},{}],11:[function(require,module,exports){
/*
 * AjaxHelper core
 */

/*jslint node: true */
"use strict";

module.exports = function(dependencies) {

	if (!dependencies.request) {
		throw new Error("dependencies.request is mandatory!");
	}

	if (!dependencies.createReader) {
		throw new Error("dependencies.createReader is mandatory!");
	}

	var request = dependencies.request;
	var createReader = dependencies.createReader;
	
	function createOperationConfig(config, id, data) {
		var newConfig = {};

		for (var prop in config) {
			newConfig[prop] = config[prop];
		}

		if (data) {
			newConfig.data = data;
		} else {
			newConfig.data = {};
		}

		newConfig.id = id;

		return newConfig;
	}

	function dispatchAjax (actConfig, filters, callback) {
		if (typeof actConfig.route === "string") {
			actConfig.route = [actConfig.route];
		}
		if(!callback) {
			callback = filters;
			filters = undefined;
		}

		var actRouteIdx = 0;
		var actRoute = actConfig.route[actRouteIdx];

		function dispatch(retries) {

			if(filters) {
				for (var filter in filters) {
					var regex = new RegExp(":" + filter, "g");
					actRoute = actRoute.replace(regex, filters[filter]);
				}
			}
			var idRegex = /:id/g;

			if (idRegex.test(actRoute)) {
				actRoute = actRoute.replace(idRegex, actConfig.id);
			} else if (actConfig.id) {
				actConfig.data[idProperty] = actConfig.id;
			}

			try {
				var req = request
					[actConfig.method](actRoute)
					.query(actConfig.queries)
					.accept(actConfig.accept)
					.timeout(timeout);

				if (actConfig.formData !== true) {
					req.type(actConfig.type);
				}
				req
					.send(actConfig.data)
					.end(function(err, result) {
						if (err) {
							if (retries < actConfig.route.length) {
								actRouteIdx += 1;
								actRouteIdx %= actConfig.route.length;
								actRoute = actConfig.route[actRouteIdx];
								return dispatch(retries + 1);
							}
							return callback(err);
						}
						var body = actConfig.reader.read(result.body);

						callback(body.err, body);
					});
			} catch (e) {
			}
		}
		dispatch(0);
	}

	//var defaultReader = createReader({});

	function prepareOperationsConfig(config) {
		assert(typeof config === "object", "config.operations should be a config object");
		for (var prop in config) {
			var act = config[prop];
			assert(act, prop + " should be configured");
			assert(act.route, prop + " route should be configured");
			assert(act.method, prop + " method should be configured");
			act.method = act.method.toLowerCase();
			act.queries = act.queries || {};
			act.accept = act.accept || "application/json";
			act.type = act.type || "application/json";
			act.reader = act.reader ? act.reader : {};
			if (prop === "read") {
				act.reader.out = "items";
			}
			act.reader = act.reader !== {} ? createReader(act.reader) : defaultReader;
		}
	}

	function assert(condition, message) {
		if (!condition) {
			message = message || "Assertion failed";
			if (typeof Error !== "undefined") {
				throw new Error(message);
			}
			throw message; // Fallback
		}
	}

	return {
		createOperationConfig: createOperationConfig,
		dispatchAjax: dispatchAjax,
		prepareOperationsConfig: prepareOperationsConfig,
		assert: assert

	};
};
},{}],12:[function(require,module,exports){
/*jslint node: true */
"use strict";

//not used yet

var createMemoryProxy = require("./memory");

module.exports = function createDelayedMemoryProxy(config) {
	var memoryProxy = createMemoryProxy(config);
	var delay = config.delay || 1000;

	var wrapper = {};

	function addWrapperFunction(name, func) {
		wrapper[name] = function() {
			var args = arguments;
			setTimeout(function() {
				func.apply(this, args);
			}, delay);
		};
	}

	for (var prop in memoryProxy) {
		var actFunction = memoryProxy[prop];

		if (typeof actFunction === "function") {
			addWrapperFunction(prop, actFunction);
		}
	}

	return Object.freeze(wrapper);
};
},{"./memory":15}],13:[function(require,module,exports){
// /*
//  * LocalStorage proxy shell
//  */

//  /*jslint node: true */
//  "use strict";

var createMemoryProxy = require("./memory");
var localStorageCore = require("./localStorageCore");
var storage = (function() {
		try {
			// var testDate = new Date();
			var testDate = "adsfj";

			localStorage.setItem(testDate, testDate);
			var isSame = localStorage.getItem(testDate) === testDate;
			localStorage.removeItem(testDate);
			return isSame && localStorage;
		} catch(e) {
			return false;
		}
	}());

module.exports = localStorageCore({
	createMemoryProxy: createMemoryProxy,
	storage: storage
});

},{"./localStorageCore":14,"./memory":15}],14:[function(require,module,exports){
/*
 * LocalStorage proxy core
 */

 /*jslint node: true */
 "use strict";

module.exports = function(dependencies) {

	if (!dependencies.createMemoryProxy) {
		throw new Error("dependencies.createMemoryProxy is mandatory!");
	}

	if (!(typeof dependencies.storage === "object" || typeof dependencies.storage === "boolean")) {
		throw new Error("dependencies.storage is mandatory!");
	}

	var createMemoryProxy = dependencies.createMemoryProxy;
	var storage = dependencies.storage;

	return function createLocalStorageProxy(config) {
		var memoryProxy = createMemoryProxy(config);
		var proxyName = config.name || "lsProxy";

		if (storage) {
			var localData = JSON.parse(storage.getItem(proxyName));

			if (localData) {
				localData.items.forEach(function(item) {
					memoryProxy.createOne(item, function() {});
				});
			}
		}

		function createWrapperFunction(prop) {
			return function saveToLocalStorageWrapper() {
				memoryProxy[prop].apply(this, arguments);

				memoryProxy.read({}, function(err, result) {
					if (err) {
						return console.log(err);
					}

					if (storage) {
						storage.setItem(proxyName, JSON.stringify(result));
					}
				});
			};
		}


		return Object.freeze({
			idProperty: memoryProxy.idProperty,
			generateId: memoryProxy.generateId,


			read: memoryProxy.read,

			createOne: createWrapperFunction("createOne"),

			readOneById: memoryProxy.readOneById,
			updateOneById: createWrapperFunction("updateOneById"),
			destroyOneById: createWrapperFunction("destroyOneById")
		});
	};
};

},{}],15:[function(require,module,exports){
/*jslint node: true */
"use strict";

var messages = require("../errorMessages");

module.exports = function createMemoryProxy(config) {
	if (!config) {
		config = {};
	}

	if (!config.idProperty) {
		throw new Error("config.idProperty is mandatory!");
	}

	if (!config.idType) {
		throw new Error("config.idType is mandatory!");
	}

	var idProperty = config.idProperty;
	var idType = config.idType.toLowerCase();

	var generateId = config.generateId || (function() {
		var nextId = 0;
		return function() {
			return nextId += 1;
		};
	}());

	var db = [];

	function findIndexById(originalId) {
		var id = castId(idType, originalId);
		for (var idx = 0; idx < db.length; idx += 1) {
			var act = db[idx];
			if (act[idProperty] === id) {
				return idx;
			}
		}

		return -1;
	}

	function castId(type, id) {
		if (type === undefined || id === undefined) {
			return console.log("Missing cast parameters");
		}

		var castedId = id;
		switch(type) {
			case "string": {
				if (typeof castedId !== "string") {
					castedId = castedId.toString();
					if (typeof castedId !== "string") {
						throw "Id " + id + " could not be parsed as " + type;
					}
				}
				break;
			}
			case "number": {
				if (typeof castedId !== "number") {
					castedId = parseInt(castedId);
					if (isNaN(castedId)) {
						throw "Id " + id + " could not be parsed as " + type;
					}
				}
				break;
			}
			default: {
				return console.log("Unrecognized id type", type);
			}
		}
		return castedId;
	}

	function checkCallback(callback) {
		assert(typeof callback === "function", "callback should be a function");
	}

	function assert(condition, message) {
		if (!condition) {
			message = message || "Assertion failed";
			if (typeof Error !== "undefined") {
				throw new Error(message);
			}
			throw message; // Fallback
		}
	}

	function accessProp(item, prop) {
		var propSplit = prop.split(".");

		for(var idx = 0; idx < propSplit.length; idx += 1) {
			if(typeof item[propSplit[idx]] !== "undefined") {
				item = item[propSplit[idx]];
			} else {
				return item;
			}
		}

		return item;
	}

	function read(options, callback) {
		checkCallback(callback);

		if (!options) {
			options = {};
		}

		var find = options.find;
		var sort = options.sort;

		var skip = options.skip;
		var limit = options.limit;

		var elements = db;

		if (find && typeof find === "object") {
			elements = elements.filter(function(item) {
				for (var prop in find) {
					var act = find[prop];

					item = accessProp(item, prop);

					if (typeof act === "string") {
						var actSplit = act.split("/");
						
						actSplit.splice(0, 1);
						
						var regexpOptions = actSplit.splice(actSplit.length - 1, 1);
						var pattern = actSplit.join("/");
						
						act = new RegExp(pattern, regexpOptions);
					}

					if (act instanceof RegExp) {
						if (!act.test(item)) {
							return false;
						}
					} else if (act !== item) {
						return false;
					}
				}
				return true;
			});
		}

		if (sort && typeof sort === "object") {
			elements = elements.sort(function(item1, item2) {
				for (var prop in sort) {

					var act1 = accessProp(item1, prop);
					var act2 = accessProp(item2, prop);

					var actRelation = sort[prop];

					if(actRelation === 1) {
						if (act1 < act2) {
							return -1;
						}
						if (act1 > act2) {
							return 1;
						}
					}
					if (act1 > act2) {
						return -1;
					}
					if (act1 < act2) {
						return 1;
					}
				}
				return 0;
			});
		}

		if (typeof skip !== "number" || skip < 0) {
			skip = 0;
		}

		if (typeof limit !== "number" || limit < 0) {
			limit = db.length;
		}



		var response = {
			items: elements.slice(skip, skip + limit),
			count: elements.length
		};

		callback(null, response);
	}

	function createOne(data, callback) {
		checkCallback(callback);

		if (typeof data[idProperty] === "undefined") {
			data[idProperty] = generateId();
		}

		var dataIdx = findIndexById(data[idProperty]);

		if (dataIdx === -1) { //this way this is an upsert actually...
			db.push(data);
		} else {
			db[dataIdx] = data;
		}

		callback(null, data);
	}

	function readOneById(id, callback) {
		checkCallback(callback);

		var dataIdx = findIndexById(id);
		if (dataIdx === -1) {
			return callback(messages.errorMessages.NOT_FOUND);
		}
		callback(null, db[dataIdx]);
	}

	function updateOneById(id, newData, callback) {
		checkCallback(callback);

		var dataIdx = findIndexById(id);
		if (dataIdx === -1) {
			return callback(messages.errorMessages.NOT_FOUND);
		}

		newData[idProperty] = id;
		db[dataIdx] = newData;

		callback(null, newData);
	}

	function destroyOneById(id, callback) {
		checkCallback(callback);

		var dataIdx = findIndexById(id);
		if (dataIdx === -1) {
			return callback(messages.errorMessages.NOT_FOUND);
		}

		var data = db.splice(dataIdx, 1);

		callback(null, data[0]);
	}

	return Object.freeze({
		idProperty: idProperty,
		generateId: generateId,


		read: read,

		createOne: createOne,

		readOneById: readOneById,
		updateOneById: updateOneById,
		destroyOneById: destroyOneById
	});
};

},{"../errorMessages":5}],16:[function(require,module,exports){
var createAjaxProxy = require("./ajax");

module.exports = function createRestProxy(config) {

	if (!config) {
		throw new Error("config is mandatory");
	}

	if (!config.route) {
		throw new Error("config.route is mandatory");
	}

	if (typeof config.route !== "string" &&	config.route.constructor !== Array) {
		throw new Error("config.route must be either string or array");
	}

	var queries = config.queries || {};

	var readQuery = queries.read || {};
	var createOneQuery = queries.createOne || {};
	var readOneByIdQuery = queries.readOneById || {};
	var updateOneByIdQuery = queries.updateOneById || {};
	var destroyOneByIdQuery = queries.destroyOneById || {};

	var route = config.route;

	function addId(route) {
		var newRoute;

		if (typeof route === "string") {
			newRoute = [route];
		} else {
			newRoute = route.slice(0);
		}

		for (var i = 0; i < newRoute.length; i += 1) {
			newRoute[i] += "/:id";
		}

		return newRoute;
	}

	var restProxy = createAjaxProxy({
		idProperty: config.idProperty,
		idType: config.idType,
		timeout: config.timeout,
		operations: {
			read: {
				route: route,
				method: "GET",
				reader: config.reader,
				queries: readQuery
			},
			createOne: {
				route: route,
				method: "POST",
				queries: createOneQuery
			},
			readOneById: {
				route: addId(route),
				method: "GET",
				queries: readOneByIdQuery
			},
			updateOneById: {
				route: addId(route),
				method: "PUT",
				queries: updateOneByIdQuery
			},
			destroyOneById: {
				route: addId(route),
				method: "DELETE",
				queries: destroyOneByIdQuery
			}
		}
	});

	return restProxy;
};

},{"./ajax":9}],17:[function(require,module,exports){
/*jslint node: true */
"use strict";

module.exports = function createReader(config) {

	if (!config) {
		throw "JSON READER: please provide a config object";
	}

	if ((config && (config.success || config.message || config.count) && !(config.root || config.record))) {
		throw "JSON READER: If success, message, or count present, root or record must be specified!";
	}

	var recordProp  = config.record;
	var root		= config.root;
	var countProp	= config.count;
	var successProp = config.success;
	var messageProp = config.message;
	var errProp     = config.err || "err";
	var outProp		= config.out;

	function read(response) {

		var rootData = !root ? response : response[root];

		var data = {};

		if (outProp) {
			data[outProp] = recordProp ? rootData[recordProp] : rootData;
		} else {
			data = recordProp ? rootData[recordProp] : rootData;
		}

		if (countProp) {
			data.count = response[countProp];
		}

		if (successProp) {
			data.success = response[successProp];
		}

		if (messageProp) {
			data.message = response[messageProp];
		}

		if (errProp) {
			if (response[errProp]) {
				data.err = response[errProp];
			}
		}

		return data;
	}

	return Object.freeze({
		read: read
	});
};

},{}],18:[function(require,module,exports){
/*jslint node: true */
"use strict";

var createProp = require("../model/prop");

module.exports = function createStore(options) {
	if (!options) {
		options = {};
	}

	if (!options.model) {
		throw new Error("options.model is mandatory!");
	}

	var model = options.model;
	var proxy = model.proxy;

	//var autoLoad;
	//var autoSync;


	var store = {
		//data: data,
		model: model,
		proxy: proxy,

		items: [],
		count: 0,

		load: load,
		add: add
	};

	var triggerQueryChanged = (function() {
		var queryChanged = null;
		return function triggerQueryChanged() {
			if (queryChanged) {
				return;
			}

			queryChanged = setTimeout(function() {
				queryChanged = null;
				load();
			}, 0);
		};
	}());

	//maybe these should be on a separate query object.
	createProp(store, "find", {
		//lastValue, value, newValue, initialValue
		value: options.find || {},
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});

	//also, find and sort properties are not very good as simple props... They should be "propObjects" or something...
	//that way their fields' changes would be triggered as well.
	createProp(store, "sort", {
		value: options.sort || {id: -1},
		beforeChange: function() {
		},
		afterChange: triggerQueryChanged
	});

	createProp(store, "skip", {
		value: options.skip || 0,
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});

	createProp(store, "limit", {
		value: options.limit || 10,
		beforeChange: function() {

		},
		afterChange: triggerQueryChanged
	});



	//var group = "?good question?";

	//var buffered;

	//var remoteFilter;
	//var remoteGroup;
	//var remoteSort;


	//var actPage = options.actPage || 0;
	//var numOfItems = 0;
	//var numOfPages = 0;

	//model instances should be stored somewhere by id as well.
	//in the data array, there should be references to those instances... although it would be complicated when loaded from localStorage.
	//maybe we should store only the id-s of the elements in the data array...
	//var prefetchedData = {
	//	"{sorters: {id: 1}, filters: {}": [{skip: 0, ids: []}]
	//};
	//var prefetchedDataStorage = [];

	//function getData() {
	//	return prefetchedData[currentPage].data;
	//}


	//skip and limit should be properties as well
	//if skip, limit, find or sort changes, then the load method should be called automatically.


	//every load call should have an id.
	//this way we can set up
	function query(queryObj, callback) {
		model.list(queryObj, function(err, result) {
			callback(err, result);
		});
	}

	function load() {
		var queryObj = {
			find: store.find,
			sort: store.sort,
			skip: store.skip,
			limit: store.limit
		};

		load.before(queryObj);

		query(queryObj, function(err, result) {
			if (err) {
				return load.after(err);
			}

			store.items.length = 0;
			store.items.length = result.items.length;
			for (var idx = 0; idx < result.items.length; idx += 1) {
				store.items[idx] = result.items[idx];
			}
			store.count = result.count;

			load.after(null, result);
		});
	}

	load.before = createCallbackArrayCaller(store, []); //later we can add default callbacks
	load.after = createCallbackArrayCaller(store, []);

	function createCallbackArrayCaller(thisArg, array) {
		function callbackArrayCaller(err) {
			array.forEach(function(actFunction) {
				actFunction.call(thisArg, err);
			});
		}

		callbackArrayCaller.add = function(func) {
			if (typeof func !== "function") {
				return;
			}

			array.push(func);
		};

		callbackArrayCaller.remove = function(func) {
			var idx = array.indexOf(func);

			if (idx > -1) {
				array.splice(idx, 1);
			}
		};

		return callbackArrayCaller;
	}


	function add(data, callback) {
		model.create(data, callback);
	}




	return store;
};
},{"../model/prop":8}],19:[function(require,module,exports){
/*jslint node: true */
"use strict";

var memoryProxy = require("./proxy/memory");
var localStorageProxy = require("./proxy/localStorage");
var restProxy = require("./proxy/rest");
var ajaxProxy = require("./proxy/ajax");
var delayedMemoryProxy = require("./proxy/delayedMemory");
var store = require("./store/store");
var model = require("./model/model");
var jsonReader = require("./reader/json");

module.exports = {
	proxy: {
		memory: memoryProxy,
		localStorage: localStorageProxy,
		rest: restProxy,
		ajax: ajaxProxy,
		delayedMemory: delayedMemoryProxy
	},
	model: {
		model: model
	},
	store: {
		store: store
	},
	reader: {
		json: jsonReader
	}
};

},{"./model/model":6,"./proxy/ajax":9,"./proxy/delayedMemory":12,"./proxy/localStorage":13,"./proxy/memory":15,"./proxy/rest":16,"./reader/json":17,"./store/store":18}]},{},[19])(19)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZm9ybS1kYXRhL2xpYi9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwic3JjL2Vycm9yTWVzc2FnZXMuanMiLCJzcmMvbW9kZWwvbW9kZWwuanMiLCJzcmMvbW9kZWwvbW9kZWxPYmplY3QuanMiLCJzcmMvbW9kZWwvcHJvcC5qcyIsInNyYy9wcm94eS9hamF4LmpzIiwic3JjL3Byb3h5L2FqYXhDb3JlLmpzIiwic3JjL3Byb3h5L2FqYXhIZWxwZXJzLmpzIiwic3JjL3Byb3h5L2RlbGF5ZWRNZW1vcnkuanMiLCJzcmMvcHJveHkvbG9jYWxTdG9yYWdlLmpzIiwic3JjL3Byb3h5L2xvY2FsU3RvcmFnZUNvcmUuanMiLCJzcmMvcHJveHkvbWVtb3J5LmpzIiwic3JjL3Byb3h5L3Jlc3QuanMiLCJzcmMvcmVhZGVyL2pzb24uanMiLCJzcmMvc3RvcmUvc3RvcmUuanMiLCJzcmMvc3VwZXJEYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcclxuLyoqXHJcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXHJcbiAqXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcclxuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEByZXR1cm4ge09iamVjdH1cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XHJcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XHJcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XHJcbiAgfVxyXG4gIHJldHVybiBvYmo7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuICAodGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW10pXHJcbiAgICAucHVzaChmbik7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXHJcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIGZ1bmN0aW9uIG9uKCkge1xyXG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKTtcclxuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBvbi5mbiA9IGZuO1xyXG4gIHRoaXMub24oZXZlbnQsIG9uKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxyXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cclxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcblxyXG4gIC8vIGFsbFxyXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBzcGVjaWZpYyBldmVudFxyXG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcclxuXHJcbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xyXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxyXG4gIHZhciBjYjtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY2IgPSBjYWxsYmFja3NbaV07XHJcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xyXG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge01peGVkfSAuLi5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxyXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG5cclxuICBpZiAoY2FsbGJhY2tzKSB7XHJcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcmV0dXJuIHtBcnJheX1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xyXG59O1xyXG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbm1vZHVsZS5leHBvcnRzID0gRm9ybURhdGE7XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdDtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgeyAvLyBCcm93c2VyIHdpbmRvd1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn0gZWxzZSB7IC8vIE90aGVyIGVudmlyb25tZW50c1xuICByb290ID0gdGhpcztcbn1cblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gZnVuY3Rpb24gKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICAgJiYgKCFyb290LmxvY2F0aW9uIHx8ICdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbFxuICAgICAgICAgIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgb2JqW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogSGVscHMgJ3NlcmlhbGl6ZScgd2l0aCBzZXJpYWxpemluZyBhcnJheXMuXG4gKiBNdXRhdGVzIHRoZSBwYWlycyBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWlyc1xuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKi9cblxuZnVuY3Rpb24gcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdmFsKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICByZXR1cm4gdmFsLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdik7XG4gICAgfSk7XG4gIH1cbiAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIHJldHVybiAvW1xcLytdanNvblxcYi8udGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICAvLyBpc3N1ZSAjNjc1OiByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgZXJyLnJhd1Jlc3BvbnNlID0gc2VsZi54aHIgJiYgc2VsZi54aHIucmVzcG9uc2VUZXh0ID8gc2VsZi54aHIucmVzcG9uc2VUZXh0IDogbnVsbDtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuXG4gICAgc2VsZi5jYWxsYmFjayhuZXdfZXJyLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZvcmNlIGdpdmVuIHBhcnNlclxuICpcbiAqIFNldHMgdGhlIGJvZHkgcGFyc2VyIG5vIG1hdHRlciB0eXBlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZm4pe1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSB8fCBmaWxlLm5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaiB8fCBpc0hvc3QoZGF0YSkpIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIGVyci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICgwID09IHN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBlLmRpcmVjdGlvbiA9ICdkb3dubG9hZCc7XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB4aHIub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKHhoci51cGxvYWQgJiYgdGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYudGltZWRvdXQgPSB0cnVlO1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIGNvbnRlbnRUeXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIHZhciBzZXJpYWxpemUgPSB0aGlzLl9wYXJzZXIgfHwgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG5cbiAgLy8gSUUxMSB4aHIuc2VuZCh1bmRlZmluZWQpIHNlbmRzICd1bmRlZmluZWQnIHN0cmluZyBhcyBQT1NUIHBheWxvYWQgKGluc3RlYWQgb2Ygbm90aGluZylcbiAgLy8gV2UgbmVlZCBudWxsIGhlcmUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgeGhyLnNlbmQodHlwZW9mIGRhdGEgIT09ICd1bmRlZmluZWQnID8gZGF0YSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRmF1eCBwcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsLCByZWplY3QpIHtcbiAgcmV0dXJuIHRoaXMuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgZXJyID8gcmVqZWN0KGVycikgOiBmdWxmaWxsKHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxucmVxdWVzdFsnZGVsJ10gPSBkZWw7XG5yZXF1ZXN0WydkZWxldGUnXSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZXJyb3JNZXNzYWdlczoge1xuXHRcdE5PVF9GT1VORDogXCJOT1RfRk9VTkRcIlxuXHR9LFxuXHRleGNlcHRpb25NZXNzYWdlczoge1xuXHRcdE5PVF9BX0ZVTkNUSU9OOiBcIk5PVF9BX0ZVTkNUSU9OXCJcblx0fVxufTtcbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgY3JlYXRlTW9kZWxPYmplY3QgPSByZXF1aXJlKFwiLi9tb2RlbE9iamVjdFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVNb2RlbChvcHRpb25zKSB7XG5cdGlmICghb3B0aW9ucykge1xuXHRcdG9wdGlvbnMgPSB7fTtcblx0fVxuXG5cdGlmICghb3B0aW9ucy5pZEZpZWxkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5pZEZpZWxkIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMuZmllbGRzKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5maWVsZHMgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdGlmICghb3B0aW9ucy5wcm94eSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMucHJveHkgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXHRcblx0dmFyIGlkRmllbGQgPSBvcHRpb25zLmlkRmllbGQ7XG5cdHZhciBmaWVsZHMgPSBvcHRpb25zLmZpZWxkcztcblxuXHR2YXIgcHJveHkgPSBvcHRpb25zLnByb3h5O1xuXG5cdC8vb3B0aW9ucy5maWVsZHMgc2hvdWxkIGJlIGFuIGFycmF5IG9mIG9iamVjdHNcblx0Ly90aGUgb2JqZWN0cyBzaG91bGQgZGVzY3JpYmUgdGhlIGZpZWxkczpcblx0Ly8gLSBuYW1lXG5cdC8vIC0gdHlwZVxuXHQvLyAtIHZhbGlkYXRvcnNcblx0Ly8gLSBtYXBwaW5nXG5cdC8vIC0gZGVmYXVsdFZhbHVlXG5cdC8vIC0gYmVmb3JlQ2hhbmdlXG5cdC8vIC0gYWZ0ZXJDaGFuZ2VcblxuXHRmdW5jdGlvbiBsaXN0KG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdFx0cHJveHkucmVhZChvcHRpb25zLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGRhdGEgPSBbXTtcblxuXHRcdFx0cmVzdWx0Lml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHRkYXRhLnB1c2goY3JlYXRlTW9kZWxPYmplY3Qoe1xuXHRcdFx0XHRcdG1vZGVsOiBtb2RlbCxcblxuXHRcdFx0XHRcdGRhdGE6IGl0ZW1cblx0XHRcdFx0fSkpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHZhciByZXN1bHRPYmogPSB7XG5cdFx0XHRcdGl0ZW1zOiBkYXRhLFxuXHRcdFx0XHRjb3VudDogcmVzdWx0LmNvdW50XG5cdFx0XHR9O1xuXG5cdFx0XHRjYWxsYmFjayhudWxsLCByZXN1bHRPYmopO1xuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gbG9hZChpZCwgY2FsbGJhY2spIHtcblx0XHRwcm94eS5yZWFkT25lQnlJZChpZCwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycik7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBtb2RlbE9iamVjdCA9IGNyZWF0ZU1vZGVsT2JqZWN0KHtcblx0XHRcdFx0bW9kZWw6IG1vZGVsLFxuXG5cdFx0XHRcdGRhdGE6IHJlc3VsdFxuXHRcdFx0fSk7XG5cdFx0XHRjYWxsYmFjayhudWxsLCBtb2RlbE9iamVjdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGUobW9kZWxWYWx1ZXMsIGNhbGxiYWNrKSB7XG5cdFx0cHJveHkuY3JlYXRlT25lKG1vZGVsVmFsdWVzLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgY3JlYXRlTW9kZWxPYmplY3Qoe1xuXHRcdFx0XHRtb2RlbDogbW9kZWwsXG5cblx0XHRcdFx0ZGF0YTogcmVzdWx0XG5cdFx0XHR9KSk7XG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgbW9kZWwgPSBPYmplY3QuZnJlZXplKHtcblx0XHRmaWVsZHM6IGZpZWxkcyxcblx0XHRwcm94eTogcHJveHksXG5cdFx0aWRGaWVsZDogaWRGaWVsZCxcblxuXHRcdGxpc3Q6IGxpc3QsXG5cdFx0bG9hZDogbG9hZCxcblx0XHRjcmVhdGU6IGNyZWF0ZVxuXHR9KTtcblxuXHRyZXR1cm4gbW9kZWw7XG59OyIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgY3JlYXRlUHJvcCA9IHJlcXVpcmUoXCIuL3Byb3BcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlTW9kZWxPYmplY3Qob3B0aW9ucykge1xuXHRpZiAoIW9wdGlvbnMpIHtcblx0XHRvcHRpb25zID0ge307XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMuZGF0YSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMuZGF0YSBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0aWYgKCFvcHRpb25zLm1vZGVsKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5tb2RlbCBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0aWYgKCFvcHRpb25zLm1vZGVsLmZpZWxkcykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMubW9kZWwuZmllbGRzIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMubW9kZWwuaWRGaWVsZCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMubW9kZWwuaWRGaWVsZCBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0aWYgKCFvcHRpb25zLm1vZGVsLnByb3h5KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5tb2RlbC5wcm94eSBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0dmFyIG1vZGVsID0gb3B0aW9ucy5tb2RlbDtcblxuXHR2YXIgZmllbGRzID0gb3B0aW9ucy5tb2RlbC5maWVsZHM7XG5cdHZhciBpZEZpZWxkID0gb3B0aW9ucy5tb2RlbC5pZEZpZWxkO1xuXHR2YXIgcHJveHkgPSBvcHRpb25zLm1vZGVsLnByb3h5O1xuXG5cblx0dmFyIGRhdGEgPSB7fTtcblxuXHRmb3IgKHZhciBwcm9wIGluIGZpZWxkcykge1xuXHRcdHZhciBhY3RGaWVsZCA9IGZpZWxkc1twcm9wXTtcblx0XHR2YXIgYWN0VmFsdWUgPSBvcHRpb25zLmRhdGEuaGFzT3duUHJvcGVydHkocHJvcCkgPyBvcHRpb25zLmRhdGFbcHJvcF0gOiBhY3RGaWVsZC5kZWZhdWx0VmFsdWU7XG5cblx0XHRjcmVhdGVQcm9wKGRhdGEsIHByb3AsIHtcblx0XHRcdHZhbHVlOiBhY3RWYWx1ZSxcblx0XHRcdGJlZm9yZUNoYW5nZTogY3JlYXRlQmVmb3JlQ2hhbmdlRnVuY3Rpb24ocHJvcCksXG5cdFx0XHRhZnRlckNoYW5nZTogY3JlYXRlQWZ0ZXJDaGFuZ2VGdW5jdGlvbihwcm9wKVxuXHRcdH0pO1xuXHR9XG5cblx0dmFyIG9iaiA9IHtcblx0XHRkYXRhOiBkYXRhLFxuXHRcdG1vZGVsOiBtb2RlbCxcblxuXHRcdHJlYWQ6IHJlYWQsXG5cdFx0c2F2ZTogc2F2ZSxcblx0XHRkZXN0cm95OiBkZXN0cm95XG5cdH07XG5cblx0ZnVuY3Rpb24gY3JlYXRlQmVmb3JlQ2hhbmdlRnVuY3Rpb24ocHJvcE5hbWUpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gYmVmb3JlQ2hhbmdlKHZhbHVlcykge1xuXHRcdFx0dmFsaWRhdGUocHJvcE5hbWUsIHZhbHVlcyk7XG5cblx0XHRcdC8vdmFyIGZpZWxkID0gZmllbGRzW3Byb3BOYW1lXTtcblxuLypcblx0XHRcdGlmIChmaWVsZC5iZWZvcmVDaGFuZ2UpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBmaWVsZC5iZWZvcmVDaGFuZ2UgPT09IFwiZnVuY3Rpb25cIikge1xuXG5cdFx0XHRcdH1cblx0XHRcdH1cbiovXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUFmdGVyQ2hhbmdlRnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIGFmdGVyQ2hhbmdlKCkge1xuXHRcdFx0Ly9jYWxsIHRoZSBvbkNoYW5nZSBsaXN0ZW5lcnNcblx0XHR9O1xuXHR9XG5cblxuXHRmdW5jdGlvbiB2YWxpZGF0ZShwcm9wTmFtZSkge1xuXHRcdHZhciBmaWVsZCA9IGZpZWxkc1twcm9wTmFtZV07XG5cblx0XHRpZiAoIWZpZWxkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFmaWVsZC52YWxpZGF0b3JzKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVhZChjYWxsYmFjaykge1xuXHRcdHZhciBpZCA9IGRhdGFbaWRGaWVsZF07XG5cdFx0cHJveHkucmVhZE9uZUJ5SWQoaWQsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIHNhdmUoY2FsbGJhY2spIHtcblx0XHR2YXIgaWQgPSBkYXRhW2lkRmllbGRdO1xuXHRcdHByb3h5LnVwZGF0ZU9uZUJ5SWQoaWQsIGRhdGEsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKHZhciBwcm9wIGluIHJlc3VsdCkge1xuXHRcdFx0XHRkYXRhW3Byb3BdID0gcmVzdWx0W3Byb3BdO1xuXHRcdFx0fVxuXG5cdFx0XHRjYWxsYmFjayhudWxsLCBvYmopO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly9kZWxldGVkIGZsYWc/XG5cdGZ1bmN0aW9uIGRlc3Ryb3koY2FsbGJhY2spIHtcblx0XHR2YXIgaWQgPSBkYXRhW2lkRmllbGRdO1xuXHRcdHByb3h5LmRlc3Ryb3lPbmVCeUlkKGlkLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycik7XG5cdFx0XHR9XG5cblx0XHRcdGNhbGxiYWNrKG51bGwsIG9iaik7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gb2JqO1xufTtcbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVByb3Aob2JqLCBuYW1lLCBjb25maWcpIHtcblx0Ly9zaG91bGQgYmUgY2FsbGVkIGZpZWxkXG5cdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblxuXHR2YXIgaW5pdGlhbFZhbHVlID0gY29uZmlnLnZhbHVlO1xuXHR2YXIgdmFsdWUgPSBpbml0aWFsVmFsdWU7XG5cdHZhciBsYXN0VmFsdWUgPSB2YWx1ZTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG5cdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuXG5cdFx0c2V0OiBzZXQsXG5cdFx0Z2V0OiBnZXRcblx0fSk7XG5cblx0ZnVuY3Rpb24gc2V0KG5ld1ZhbCkge1xuXHRcdGlmIChuZXdWYWwgPT09IHZhbHVlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBjb25maWcuYmVmb3JlQ2hhbmdlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGNvbmZpZy5iZWZvcmVDaGFuZ2Uoe2xhc3RWYWx1ZTogbGFzdFZhbHVlLCB2YWx1ZTogdmFsdWUsIG5ld1ZhbHVlOiBuZXdWYWwsIGluaXRpYWxWYWx1ZTogaW5pdGlhbFZhbHVlfSk7XG5cdFx0fVxuXG5cdFx0bGFzdFZhbHVlID0gdmFsdWU7XG5cdFx0dmFsdWUgPSBuZXdWYWw7XG5cblx0XHRpZiAodHlwZW9mIGNvbmZpZy5hZnRlckNoYW5nZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRjb25maWcuYWZ0ZXJDaGFuZ2Uoe2xhc3RWYWx1ZTogbGFzdFZhbHVlLCB2YWx1ZTogdmFsdWUsIG5ld1ZhbHVlOiBuZXdWYWwsIGluaXRpYWxWYWx1ZTogaW5pdGlhbFZhbHVlfSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0KCkge1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdHJldHVybiBvYmo7XG59O1xuIiwiLypcbiAqIEFqYXggcHJveHkgc2hlbGxcbiAqL1xuXG4vKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGNyZWF0ZVJlYWRlciA9IHJlcXVpcmUoXCIuLi9yZWFkZXIvanNvblwiKTtcblxudmFyIGFqYXhDb3JlID0gcmVxdWlyZShcIi4vYWpheENvcmVcIik7XG5cbnZhciByZXF1ZXN0ID0gcmVxdWlyZShcInN1cGVyYWdlbnRcIik7XG5cbi8vIHZhciBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcbnZhciBlbnZpcm9ubWVudDtcblxudHJ5IHtcblx0ZW52aXJvbm1lbnQgPSB3aW5kb3cgPyB3aW5kb3cgOiBnbG9iYWw7XG59IGNhdGNoIChlKSB7XG5cdGVudmlyb25tZW50ID0gZ2xvYmFsO1xufVxuXG52YXIgRm9ybURhdGEgPSBlbnZpcm9ubWVudC5Gb3JtRGF0YTtcbmlmICghRm9ybURhdGEpIHtcblx0Rm9ybURhdGEgPSByZXF1aXJlKFwiZm9ybS1kYXRhXCIpO1xufVxuXG52YXIgYWpheEhlbHBlcnMgPSByZXF1aXJlKFwiLi9hamF4SGVscGVyc1wiKSh7XG5cdHJlcXVlc3Q6IHJlcXVlc3QsXG5cdGNyZWF0ZVJlYWRlcjogY3JlYXRlUmVhZGVyXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBhamF4Q29yZSh7XG5cdGFqYXhIZWxwZXJzOiBhamF4SGVscGVycyxcblx0Rm9ybURhdGE6IEZvcm1EYXRhXG59KTsiLCIvKlxuICogQWpheCBwcm94eSBjb3JlXG4gKi9cblxuLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBkZWZhdWx0VGltZW91dCA9IDMwMDA7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVwZW5kZW5jaWVzKSB7XG5cblx0aWYgKCFkZXBlbmRlbmNpZXMuYWpheEhlbHBlcnMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkZXBlbmRlbmNpZXMuYWpheEhlbHBlcnMgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdGlmICghZGVwZW5kZW5jaWVzLkZvcm1EYXRhKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGVwZW5kZW5jaWVzLkZvcm1EYXRhIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHR2YXIgYWpheEhlbHBlcnMgPSBkZXBlbmRlbmNpZXMuYWpheEhlbHBlcnM7XG5cdHZhciBjcmVhdGVPcGVyYXRpb25Db25maWcgPSBhamF4SGVscGVycy5jcmVhdGVPcGVyYXRpb25Db25maWc7XG5cdHZhciBkaXNwYXRjaEFqYXggPSBhamF4SGVscGVycy5kaXNwYXRjaEFqYXg7XG5cdHZhciBwcmVwYXJlT3BlcmF0aW9uc0NvbmZpZyA9IGFqYXhIZWxwZXJzLnByZXBhcmVPcGVyYXRpb25zQ29uZmlnO1xuXHR2YXIgYXNzZXJ0ID0gYWpheEhlbHBlcnMuYXNzZXJ0O1xuXHR2YXIgRm9ybURhdGEgPSBkZXBlbmRlbmNpZXMuRm9ybURhdGE7XG5cdFxuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlQWpheFByb3h5KGNvbmZpZykge1xuXHRcdGlmICghY29uZmlnKSB7XG5cdFx0XHRjb25maWcgPSB7fTtcblx0XHR9XG5cblx0XHRpZiAoIWNvbmZpZy5pZFByb3BlcnR5KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjb25maWcuaWRQcm9wZXJ0eSBpcyBtYW5kYXRvcnkhXCIpO1xuXHRcdH1cblxuXHRcdGlmICghY29uZmlnLm9wZXJhdGlvbnMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImNvbmZpZy5vcGVyYXRpb25zIGlzIG1hbmRhdG9yeSFcIik7XG5cdFx0fVxuXG5cdFx0aWYoY29uZmlnLmZpZWxkc1RvQmVFeGNsdWRlZCkge1xuXHRcdFx0aWYoIShjb25maWcuZmllbGRzVG9CZUV4Y2x1ZGVkIGluc3RhbmNlb2YgXCJBcnJheVwiKSkge1xuXHRcdFx0XHR0aHJvdyBFcnJvcihcImNvbmZpZy5maWVsZHNUb0JlRXhjbHVkZWQgc2hvdWxkIGJlIGFuIGFycmF5XCIpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciB0aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQgfHwgZGVmYXVsdFRpbWVvdXQ7XG5cblx0XHR2YXIgaWRQcm9wZXJ0eSA9IGNvbmZpZy5pZFByb3BlcnR5O1xuXG5cdFx0dmFyIGdlbmVyYXRlSWQgPSBjb25maWcuZ2VuZXJhdGVJZCB8fCAoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV4dElkID0gMDtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbmV4dElkICs9IDE7XG5cdFx0XHR9O1xuXHRcdH0oKSk7XG5cblx0XHR2YXIgcXVlcnlNYXBwaW5nID0gY29uZmlnLnF1ZXJ5TWFwcGluZztcblxuXHRcdHZhciBmaWVsZHNUb0JlRXhjbHVkZWQgPSBjb25maWcuZmllbGRzVG9CZUV4Y2x1ZGVkO1xuXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlRmllbGRzKG9iamVjdCwgZmllbGRzKSB7XG5cdFx0XHRpZighZmllbGRzKXtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aDsgaSArPSAxKXtcblx0XHRcdFx0Zm9yKHZhciBwcm9wIGluIG9iamVjdCl7XG5cdFx0XHRcdFx0aWYoZmllbGRzW2ldID09PSBwcm9wKXtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvYmplY3RbcHJvcF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cHJlcGFyZU9wZXJhdGlvbnNDb25maWcoY29uZmlnLm9wZXJhdGlvbnMpO1xuXG5cdFx0ZnVuY3Rpb24gY3JlYXRlT25lKGRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0XHRyZW1vdmVGaWVsZHMoZGF0YSwgZmllbGRzVG9CZUV4Y2x1ZGVkKTtcblxuXHRcdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cdFx0XHR2YXIgYWN0Q29uZmlnID0gY3JlYXRlT3BlcmF0aW9uQ29uZmlnKGNvbmZpZy5vcGVyYXRpb25zLmNyZWF0ZU9uZSwgbnVsbCwgZGF0YSk7XG5cblxuXHRcdFx0aWYgKGRhdGEuY29uc3RydWN0b3IgPT09IEZvcm1EYXRhKSB7XG5cdFx0XHRcdGFjdENvbmZpZy5mb3JtRGF0YSA9IHRydWU7XG5cdFx0XHR9XG5cblxuXHRcdFx0ZGlzcGF0Y2hBamF4KGFjdENvbmZpZywgY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlYWQob3B0aW9ucywgZmlsdGVycywgY2FsbGJhY2spIHtcblx0XHRcdGlmKCFjYWxsYmFjaykge1xuXHRcdFx0XHRjYWxsYmFjayA9IGZpbHRlcnM7XG5cdFx0XHRcdGZpbHRlcnMgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRjaGVja0NhbGxiYWNrKGNhbGxiYWNrKTtcblx0XHRcdGlmICh0eXBlb2YgcXVlcnlNYXBwaW5nID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0b3B0aW9ucyA9IHF1ZXJ5TWFwcGluZyhvcHRpb25zKTtcblx0XHRcdH1cblx0XHRcdHZhciBhY3RDb25maWcgPSBjcmVhdGVPcGVyYXRpb25Db25maWcoY29uZmlnLm9wZXJhdGlvbnMucmVhZCk7XG5cblx0XHRcdGZvciAodmFyIHByb3AgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRhY3RDb25maWcucXVlcmllc1twcm9wXSA9IG9wdGlvbnNbcHJvcF07XG5cdFx0XHR9XG5cdFx0XHRhY3RDb25maWcubWV0aG9kID0gYWN0Q29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0ZGlzcGF0Y2hBamF4KGFjdENvbmZpZywgZmlsdGVycywgY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlYWRPbmVCeUlkKGlkLCBmaWx0ZXJzLCBjYWxsYmFjaykge1xuXHRcdFx0aWYoIWNhbGxiYWNrKSB7XG5cdFx0XHRcdGNhbGxiYWNrID0gZmlsdGVycztcblx0XHRcdFx0ZmlsdGVycyA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXHRcdFx0dmFyIGFjdENvbmZpZyA9IGNyZWF0ZU9wZXJhdGlvbkNvbmZpZyhjb25maWcub3BlcmF0aW9ucy5yZWFkT25lQnlJZCwgaWQpO1xuXHRcdFx0ZGlzcGF0Y2hBamF4KGFjdENvbmZpZywgZmlsdGVycywgY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHVwZGF0ZU9uZUJ5SWQoaWQsIG5ld0RhdGEsIGZpbHRlcnMsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZighY2FsbGJhY2spIHtcblx0XHRcdFx0Y2FsbGJhY2sgPSBmaWx0ZXJzO1xuXHRcdFx0XHRmaWx0ZXJzID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0cmVtb3ZlRmllbGRzKG5ld0RhdGEsIGZpZWxkc1RvQmVFeGNsdWRlZCk7XG5cblx0XHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXHRcdFx0dmFyIGFjdENvbmZpZyA9IGNyZWF0ZU9wZXJhdGlvbkNvbmZpZyhjb25maWcub3BlcmF0aW9ucy51cGRhdGVPbmVCeUlkLCBpZCwgbmV3RGF0YSk7XG5cdFx0XHRkaXNwYXRjaEFqYXgoYWN0Q29uZmlnLCBmaWx0ZXJzLCBjYWxsYmFjayk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZGVzdHJveU9uZUJ5SWQoaWQsIGZpbHRlcnMsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZighY2FsbGJhY2spIHtcblx0XHRcdFx0Y2FsbGJhY2sgPSBmaWx0ZXJzO1xuXHRcdFx0XHRmaWx0ZXJzID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cdFx0XHR2YXIgYWN0Q29uZmlnID0gY3JlYXRlT3BlcmF0aW9uQ29uZmlnKGNvbmZpZy5vcGVyYXRpb25zLmRlc3Ryb3lPbmVCeUlkLCBpZCk7XG5cdFx0XHRkaXNwYXRjaEFqYXgoYWN0Q29uZmlnLCBmaWx0ZXJzLCBjYWxsYmFjayk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gY2hlY2tDYWxsYmFjayhjYWxsYmFjaykge1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiLCBcImNhbGxiYWNrIHNob3VsZCBiZSBhIGZ1bmN0aW9uXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3QuZnJlZXplKHtcblx0XHRcdGlkUHJvcGVydHk6IGlkUHJvcGVydHksXG5cdFx0XHRnZW5lcmF0ZUlkOiBnZW5lcmF0ZUlkLFxuXHRcdFx0Y29uZmlnOiBjb25maWcsXG5cblx0XHRcdHJlYWQ6IHJlYWQsXG5cblx0XHRcdGNyZWF0ZU9uZTogY3JlYXRlT25lLFxuXG5cdFx0XHRyZWFkT25lQnlJZDogcmVhZE9uZUJ5SWQsXG5cdFx0XHR1cGRhdGVPbmVCeUlkOiB1cGRhdGVPbmVCeUlkLFxuXHRcdFx0ZGVzdHJveU9uZUJ5SWQ6IGRlc3Ryb3lPbmVCeUlkXG5cdFx0fSk7XG5cdH07XG59OyIsIi8qXG4gKiBBamF4SGVscGVyIGNvcmVcbiAqL1xuXG4vKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZXBlbmRlbmNpZXMpIHtcblxuXHRpZiAoIWRlcGVuZGVuY2llcy5yZXF1ZXN0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGVwZW5kZW5jaWVzLnJlcXVlc3QgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdGlmICghZGVwZW5kZW5jaWVzLmNyZWF0ZVJlYWRlcikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRlcGVuZGVuY2llcy5jcmVhdGVSZWFkZXIgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdHZhciByZXF1ZXN0ID0gZGVwZW5kZW5jaWVzLnJlcXVlc3Q7XG5cdHZhciBjcmVhdGVSZWFkZXIgPSBkZXBlbmRlbmNpZXMuY3JlYXRlUmVhZGVyO1xuXHRcblx0ZnVuY3Rpb24gY3JlYXRlT3BlcmF0aW9uQ29uZmlnKGNvbmZpZywgaWQsIGRhdGEpIHtcblx0XHR2YXIgbmV3Q29uZmlnID0ge307XG5cblx0XHRmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuXHRcdFx0bmV3Q29uZmlnW3Byb3BdID0gY29uZmlnW3Byb3BdO1xuXHRcdH1cblxuXHRcdGlmIChkYXRhKSB7XG5cdFx0XHRuZXdDb25maWcuZGF0YSA9IGRhdGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5ld0NvbmZpZy5kYXRhID0ge307XG5cdFx0fVxuXG5cdFx0bmV3Q29uZmlnLmlkID0gaWQ7XG5cblx0XHRyZXR1cm4gbmV3Q29uZmlnO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hBamF4IChhY3RDb25maWcsIGZpbHRlcnMsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKHR5cGVvZiBhY3RDb25maWcucm91dGUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGFjdENvbmZpZy5yb3V0ZSA9IFthY3RDb25maWcucm91dGVdO1xuXHRcdH1cblx0XHRpZighY2FsbGJhY2spIHtcblx0XHRcdGNhbGxiYWNrID0gZmlsdGVycztcblx0XHRcdGZpbHRlcnMgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0dmFyIGFjdFJvdXRlSWR4ID0gMDtcblx0XHR2YXIgYWN0Um91dGUgPSBhY3RDb25maWcucm91dGVbYWN0Um91dGVJZHhdO1xuXG5cdFx0ZnVuY3Rpb24gZGlzcGF0Y2gocmV0cmllcykge1xuXG5cdFx0XHRpZihmaWx0ZXJzKSB7XG5cdFx0XHRcdGZvciAodmFyIGZpbHRlciBpbiBmaWx0ZXJzKSB7XG5cdFx0XHRcdFx0dmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIjpcIiArIGZpbHRlciwgXCJnXCIpO1xuXHRcdFx0XHRcdGFjdFJvdXRlID0gYWN0Um91dGUucmVwbGFjZShyZWdleCwgZmlsdGVyc1tmaWx0ZXJdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFyIGlkUmVnZXggPSAvOmlkL2c7XG5cblx0XHRcdGlmIChpZFJlZ2V4LnRlc3QoYWN0Um91dGUpKSB7XG5cdFx0XHRcdGFjdFJvdXRlID0gYWN0Um91dGUucmVwbGFjZShpZFJlZ2V4LCBhY3RDb25maWcuaWQpO1xuXHRcdFx0fSBlbHNlIGlmIChhY3RDb25maWcuaWQpIHtcblx0XHRcdFx0YWN0Q29uZmlnLmRhdGFbaWRQcm9wZXJ0eV0gPSBhY3RDb25maWcuaWQ7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHZhciByZXEgPSByZXF1ZXN0XG5cdFx0XHRcdFx0W2FjdENvbmZpZy5tZXRob2RdKGFjdFJvdXRlKVxuXHRcdFx0XHRcdC5xdWVyeShhY3RDb25maWcucXVlcmllcylcblx0XHRcdFx0XHQuYWNjZXB0KGFjdENvbmZpZy5hY2NlcHQpXG5cdFx0XHRcdFx0LnRpbWVvdXQodGltZW91dCk7XG5cblx0XHRcdFx0aWYgKGFjdENvbmZpZy5mb3JtRGF0YSAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRcdHJlcS50eXBlKGFjdENvbmZpZy50eXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXFcblx0XHRcdFx0XHQuc2VuZChhY3RDb25maWcuZGF0YSlcblx0XHRcdFx0XHQuZW5kKGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChyZXRyaWVzIDwgYWN0Q29uZmlnLnJvdXRlLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRcdGFjdFJvdXRlSWR4ICs9IDE7XG5cdFx0XHRcdFx0XHRcdFx0YWN0Um91dGVJZHggJT0gYWN0Q29uZmlnLnJvdXRlLmxlbmd0aDtcblx0XHRcdFx0XHRcdFx0XHRhY3RSb3V0ZSA9IGFjdENvbmZpZy5yb3V0ZVthY3RSb3V0ZUlkeF07XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGRpc3BhdGNoKHJldHJpZXMgKyAxKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHZhciBib2R5ID0gYWN0Q29uZmlnLnJlYWRlci5yZWFkKHJlc3VsdC5ib2R5KTtcblxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soYm9keS5lcnIsIGJvZHkpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0fVxuXHRcdH1cblx0XHRkaXNwYXRjaCgwKTtcblx0fVxuXG5cdC8vdmFyIGRlZmF1bHRSZWFkZXIgPSBjcmVhdGVSZWFkZXIoe30pO1xuXG5cdGZ1bmN0aW9uIHByZXBhcmVPcGVyYXRpb25zQ29uZmlnKGNvbmZpZykge1xuXHRcdGFzc2VydCh0eXBlb2YgY29uZmlnID09PSBcIm9iamVjdFwiLCBcImNvbmZpZy5vcGVyYXRpb25zIHNob3VsZCBiZSBhIGNvbmZpZyBvYmplY3RcIik7XG5cdFx0Zm9yICh2YXIgcHJvcCBpbiBjb25maWcpIHtcblx0XHRcdHZhciBhY3QgPSBjb25maWdbcHJvcF07XG5cdFx0XHRhc3NlcnQoYWN0LCBwcm9wICsgXCIgc2hvdWxkIGJlIGNvbmZpZ3VyZWRcIik7XG5cdFx0XHRhc3NlcnQoYWN0LnJvdXRlLCBwcm9wICsgXCIgcm91dGUgc2hvdWxkIGJlIGNvbmZpZ3VyZWRcIik7XG5cdFx0XHRhc3NlcnQoYWN0Lm1ldGhvZCwgcHJvcCArIFwiIG1ldGhvZCBzaG91bGQgYmUgY29uZmlndXJlZFwiKTtcblx0XHRcdGFjdC5tZXRob2QgPSBhY3QubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRhY3QucXVlcmllcyA9IGFjdC5xdWVyaWVzIHx8IHt9O1xuXHRcdFx0YWN0LmFjY2VwdCA9IGFjdC5hY2NlcHQgfHwgXCJhcHBsaWNhdGlvbi9qc29uXCI7XG5cdFx0XHRhY3QudHlwZSA9IGFjdC50eXBlIHx8IFwiYXBwbGljYXRpb24vanNvblwiO1xuXHRcdFx0YWN0LnJlYWRlciA9IGFjdC5yZWFkZXIgPyBhY3QucmVhZGVyIDoge307XG5cdFx0XHRpZiAocHJvcCA9PT0gXCJyZWFkXCIpIHtcblx0XHRcdFx0YWN0LnJlYWRlci5vdXQgPSBcIml0ZW1zXCI7XG5cdFx0XHR9XG5cdFx0XHRhY3QucmVhZGVyID0gYWN0LnJlYWRlciAhPT0ge30gPyBjcmVhdGVSZWFkZXIoYWN0LnJlYWRlcikgOiBkZWZhdWx0UmVhZGVyO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcblx0XHRpZiAoIWNvbmRpdGlvbikge1xuXHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2UgfHwgXCJBc3NlcnRpb24gZmFpbGVkXCI7XG5cdFx0XHRpZiAodHlwZW9mIEVycm9yICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcblx0XHRcdH1cblx0XHRcdHRocm93IG1lc3NhZ2U7IC8vIEZhbGxiYWNrXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjcmVhdGVPcGVyYXRpb25Db25maWc6IGNyZWF0ZU9wZXJhdGlvbkNvbmZpZyxcblx0XHRkaXNwYXRjaEFqYXg6IGRpc3BhdGNoQWpheCxcblx0XHRwcmVwYXJlT3BlcmF0aW9uc0NvbmZpZzogcHJlcGFyZU9wZXJhdGlvbnNDb25maWcsXG5cdFx0YXNzZXJ0OiBhc3NlcnRcblxuXHR9O1xufTsiLCIvKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxuLy9ub3QgdXNlZCB5ZXRcblxudmFyIGNyZWF0ZU1lbW9yeVByb3h5ID0gcmVxdWlyZShcIi4vbWVtb3J5XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZURlbGF5ZWRNZW1vcnlQcm94eShjb25maWcpIHtcblx0dmFyIG1lbW9yeVByb3h5ID0gY3JlYXRlTWVtb3J5UHJveHkoY29uZmlnKTtcblx0dmFyIGRlbGF5ID0gY29uZmlnLmRlbGF5IHx8IDEwMDA7XG5cblx0dmFyIHdyYXBwZXIgPSB7fTtcblxuXHRmdW5jdGlvbiBhZGRXcmFwcGVyRnVuY3Rpb24obmFtZSwgZnVuYykge1xuXHRcdHdyYXBwZXJbbmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0ZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRcdH0sIGRlbGF5KTtcblx0XHR9O1xuXHR9XG5cblx0Zm9yICh2YXIgcHJvcCBpbiBtZW1vcnlQcm94eSkge1xuXHRcdHZhciBhY3RGdW5jdGlvbiA9IG1lbW9yeVByb3h5W3Byb3BdO1xuXG5cdFx0aWYgKHR5cGVvZiBhY3RGdW5jdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRhZGRXcmFwcGVyRnVuY3Rpb24ocHJvcCwgYWN0RnVuY3Rpb24pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBPYmplY3QuZnJlZXplKHdyYXBwZXIpO1xufTsiLCIvLyAvKlxuLy8gICogTG9jYWxTdG9yYWdlIHByb3h5IHNoZWxsXG4vLyAgKi9cblxuLy8gIC8qanNsaW50IG5vZGU6IHRydWUgKi9cbi8vICBcInVzZSBzdHJpY3RcIjtcblxudmFyIGNyZWF0ZU1lbW9yeVByb3h5ID0gcmVxdWlyZShcIi4vbWVtb3J5XCIpO1xudmFyIGxvY2FsU3RvcmFnZUNvcmUgPSByZXF1aXJlKFwiLi9sb2NhbFN0b3JhZ2VDb3JlXCIpO1xudmFyIHN0b3JhZ2UgPSAoZnVuY3Rpb24oKSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIHZhciB0ZXN0RGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHR2YXIgdGVzdERhdGUgPSBcImFkc2ZqXCI7XG5cblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRlc3REYXRlLCB0ZXN0RGF0ZSk7XG5cdFx0XHR2YXIgaXNTYW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGVzdERhdGUpID09PSB0ZXN0RGF0ZTtcblx0XHRcdGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRlc3REYXRlKTtcblx0XHRcdHJldHVybiBpc1NhbWUgJiYgbG9jYWxTdG9yYWdlO1xuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2NhbFN0b3JhZ2VDb3JlKHtcblx0Y3JlYXRlTWVtb3J5UHJveHk6IGNyZWF0ZU1lbW9yeVByb3h5LFxuXHRzdG9yYWdlOiBzdG9yYWdlXG59KTtcbiIsIi8qXG4gKiBMb2NhbFN0b3JhZ2UgcHJveHkgY29yZVxuICovXG5cbiAvKmpzbGludCBub2RlOiB0cnVlICovXG4gXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVwZW5kZW5jaWVzKSB7XG5cblx0aWYgKCFkZXBlbmRlbmNpZXMuY3JlYXRlTWVtb3J5UHJveHkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkZXBlbmRlbmNpZXMuY3JlYXRlTWVtb3J5UHJveHkgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdGlmICghKHR5cGVvZiBkZXBlbmRlbmNpZXMuc3RvcmFnZSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZGVwZW5kZW5jaWVzLnN0b3JhZ2UgPT09IFwiYm9vbGVhblwiKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRlcGVuZGVuY2llcy5zdG9yYWdlIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHR2YXIgY3JlYXRlTWVtb3J5UHJveHkgPSBkZXBlbmRlbmNpZXMuY3JlYXRlTWVtb3J5UHJveHk7XG5cdHZhciBzdG9yYWdlID0gZGVwZW5kZW5jaWVzLnN0b3JhZ2U7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZUxvY2FsU3RvcmFnZVByb3h5KGNvbmZpZykge1xuXHRcdHZhciBtZW1vcnlQcm94eSA9IGNyZWF0ZU1lbW9yeVByb3h5KGNvbmZpZyk7XG5cdFx0dmFyIHByb3h5TmFtZSA9IGNvbmZpZy5uYW1lIHx8IFwibHNQcm94eVwiO1xuXG5cdFx0aWYgKHN0b3JhZ2UpIHtcblx0XHRcdHZhciBsb2NhbERhdGEgPSBKU09OLnBhcnNlKHN0b3JhZ2UuZ2V0SXRlbShwcm94eU5hbWUpKTtcblxuXHRcdFx0aWYgKGxvY2FsRGF0YSkge1xuXHRcdFx0XHRsb2NhbERhdGEuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRcdFx0bWVtb3J5UHJveHkuY3JlYXRlT25lKGl0ZW0sIGZ1bmN0aW9uKCkge30pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBjcmVhdGVXcmFwcGVyRnVuY3Rpb24ocHJvcCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIHNhdmVUb0xvY2FsU3RvcmFnZVdyYXBwZXIoKSB7XG5cdFx0XHRcdG1lbW9yeVByb3h5W3Byb3BdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cblx0XHRcdFx0bWVtb3J5UHJveHkucmVhZCh7fSwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcblx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29uc29sZS5sb2coZXJyKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdFx0c3RvcmFnZS5zZXRJdGVtKHByb3h5TmFtZSwgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cdFx0fVxuXG5cblx0XHRyZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG5cdFx0XHRpZFByb3BlcnR5OiBtZW1vcnlQcm94eS5pZFByb3BlcnR5LFxuXHRcdFx0Z2VuZXJhdGVJZDogbWVtb3J5UHJveHkuZ2VuZXJhdGVJZCxcblxuXG5cdFx0XHRyZWFkOiBtZW1vcnlQcm94eS5yZWFkLFxuXG5cdFx0XHRjcmVhdGVPbmU6IGNyZWF0ZVdyYXBwZXJGdW5jdGlvbihcImNyZWF0ZU9uZVwiKSxcblxuXHRcdFx0cmVhZE9uZUJ5SWQ6IG1lbW9yeVByb3h5LnJlYWRPbmVCeUlkLFxuXHRcdFx0dXBkYXRlT25lQnlJZDogY3JlYXRlV3JhcHBlckZ1bmN0aW9uKFwidXBkYXRlT25lQnlJZFwiKSxcblx0XHRcdGRlc3Ryb3lPbmVCeUlkOiBjcmVhdGVXcmFwcGVyRnVuY3Rpb24oXCJkZXN0cm95T25lQnlJZFwiKVxuXHRcdH0pO1xuXHR9O1xufTtcbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVzc2FnZXMgPSByZXF1aXJlKFwiLi4vZXJyb3JNZXNzYWdlc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVNZW1vcnlQcm94eShjb25maWcpIHtcblx0aWYgKCFjb25maWcpIHtcblx0XHRjb25maWcgPSB7fTtcblx0fVxuXG5cdGlmICghY29uZmlnLmlkUHJvcGVydHkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjb25maWcuaWRQcm9wZXJ0eSBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0aWYgKCFjb25maWcuaWRUeXBlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiY29uZmlnLmlkVHlwZSBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0dmFyIGlkUHJvcGVydHkgPSBjb25maWcuaWRQcm9wZXJ0eTtcblx0dmFyIGlkVHlwZSA9IGNvbmZpZy5pZFR5cGUudG9Mb3dlckNhc2UoKTtcblxuXHR2YXIgZ2VuZXJhdGVJZCA9IGNvbmZpZy5nZW5lcmF0ZUlkIHx8IChmdW5jdGlvbigpIHtcblx0XHR2YXIgbmV4dElkID0gMDtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gbmV4dElkICs9IDE7XG5cdFx0fTtcblx0fSgpKTtcblxuXHR2YXIgZGIgPSBbXTtcblxuXHRmdW5jdGlvbiBmaW5kSW5kZXhCeUlkKG9yaWdpbmFsSWQpIHtcblx0XHR2YXIgaWQgPSBjYXN0SWQoaWRUeXBlLCBvcmlnaW5hbElkKTtcblx0XHRmb3IgKHZhciBpZHggPSAwOyBpZHggPCBkYi5sZW5ndGg7IGlkeCArPSAxKSB7XG5cdFx0XHR2YXIgYWN0ID0gZGJbaWR4XTtcblx0XHRcdGlmIChhY3RbaWRQcm9wZXJ0eV0gPT09IGlkKSB7XG5cdFx0XHRcdHJldHVybiBpZHg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2FzdElkKHR5cGUsIGlkKSB7XG5cdFx0aWYgKHR5cGUgPT09IHVuZGVmaW5lZCB8fCBpZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gY29uc29sZS5sb2coXCJNaXNzaW5nIGNhc3QgcGFyYW1ldGVyc1wiKTtcblx0XHR9XG5cblx0XHR2YXIgY2FzdGVkSWQgPSBpZDtcblx0XHRzd2l0Y2godHlwZSkge1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY2FzdGVkSWQgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRjYXN0ZWRJZCA9IGNhc3RlZElkLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBjYXN0ZWRJZCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhyb3cgXCJJZCBcIiArIGlkICsgXCIgY291bGQgbm90IGJlIHBhcnNlZCBhcyBcIiArIHR5cGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY2FzdGVkSWQgIT09IFwibnVtYmVyXCIpIHtcblx0XHRcdFx0XHRjYXN0ZWRJZCA9IHBhcnNlSW50KGNhc3RlZElkKTtcblx0XHRcdFx0XHRpZiAoaXNOYU4oY2FzdGVkSWQpKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBcIklkIFwiICsgaWQgKyBcIiBjb3VsZCBub3QgYmUgcGFyc2VkIGFzIFwiICsgdHlwZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OiB7XG5cdFx0XHRcdHJldHVybiBjb25zb2xlLmxvZyhcIlVucmVjb2duaXplZCBpZCB0eXBlXCIsIHR5cGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY2FzdGVkSWQ7XG5cdH1cblxuXHRmdW5jdGlvbiBjaGVja0NhbGxiYWNrKGNhbGxiYWNrKSB7XG5cdFx0YXNzZXJ0KHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiLCBcImNhbGxiYWNrIHNob3VsZCBiZSBhIGZ1bmN0aW9uXCIpO1xuXHR9XG5cblx0ZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuXHRcdGlmICghY29uZGl0aW9uKSB7XG5cdFx0XHRtZXNzYWdlID0gbWVzc2FnZSB8fCBcIkFzc2VydGlvbiBmYWlsZWRcIjtcblx0XHRcdGlmICh0eXBlb2YgRXJyb3IgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0dGhyb3cgbWVzc2FnZTsgLy8gRmFsbGJhY2tcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBhY2Nlc3NQcm9wKGl0ZW0sIHByb3ApIHtcblx0XHR2YXIgcHJvcFNwbGl0ID0gcHJvcC5zcGxpdChcIi5cIik7XG5cblx0XHRmb3IodmFyIGlkeCA9IDA7IGlkeCA8IHByb3BTcGxpdC5sZW5ndGg7IGlkeCArPSAxKSB7XG5cdFx0XHRpZih0eXBlb2YgaXRlbVtwcm9wU3BsaXRbaWR4XV0gIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0aXRlbSA9IGl0ZW1bcHJvcFNwbGl0W2lkeF1dO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGl0ZW07XG5cdH1cblxuXHRmdW5jdGlvbiByZWFkKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSB7fTtcblx0XHR9XG5cblx0XHR2YXIgZmluZCA9IG9wdGlvbnMuZmluZDtcblx0XHR2YXIgc29ydCA9IG9wdGlvbnMuc29ydDtcblxuXHRcdHZhciBza2lwID0gb3B0aW9ucy5za2lwO1xuXHRcdHZhciBsaW1pdCA9IG9wdGlvbnMubGltaXQ7XG5cblx0XHR2YXIgZWxlbWVudHMgPSBkYjtcblxuXHRcdGlmIChmaW5kICYmIHR5cGVvZiBmaW5kID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRlbGVtZW50cyA9IGVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRcdGZvciAodmFyIHByb3AgaW4gZmluZCkge1xuXHRcdFx0XHRcdHZhciBhY3QgPSBmaW5kW3Byb3BdO1xuXG5cdFx0XHRcdFx0aXRlbSA9IGFjY2Vzc1Byb3AoaXRlbSwgcHJvcCk7XG5cblx0XHRcdFx0XHRpZiAodHlwZW9mIGFjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dmFyIGFjdFNwbGl0ID0gYWN0LnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0YWN0U3BsaXQuc3BsaWNlKDAsIDEpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHR2YXIgcmVnZXhwT3B0aW9ucyA9IGFjdFNwbGl0LnNwbGljZShhY3RTcGxpdC5sZW5ndGggLSAxLCAxKTtcblx0XHRcdFx0XHRcdHZhciBwYXR0ZXJuID0gYWN0U3BsaXQuam9pbihcIi9cIik7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGFjdCA9IG5ldyBSZWdFeHAocGF0dGVybiwgcmVnZXhwT3B0aW9ucyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGFjdCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0XHRcdFx0aWYgKCFhY3QudGVzdChpdGVtKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChhY3QgIT09IGl0ZW0pIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoc29ydCAmJiB0eXBlb2Ygc29ydCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0ZWxlbWVudHMgPSBlbGVtZW50cy5zb3J0KGZ1bmN0aW9uKGl0ZW0xLCBpdGVtMikge1xuXHRcdFx0XHRmb3IgKHZhciBwcm9wIGluIHNvcnQpIHtcblxuXHRcdFx0XHRcdHZhciBhY3QxID0gYWNjZXNzUHJvcChpdGVtMSwgcHJvcCk7XG5cdFx0XHRcdFx0dmFyIGFjdDIgPSBhY2Nlc3NQcm9wKGl0ZW0yLCBwcm9wKTtcblxuXHRcdFx0XHRcdHZhciBhY3RSZWxhdGlvbiA9IHNvcnRbcHJvcF07XG5cblx0XHRcdFx0XHRpZihhY3RSZWxhdGlvbiA9PT0gMSkge1xuXHRcdFx0XHRcdFx0aWYgKGFjdDEgPCBhY3QyKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChhY3QxID4gYWN0Mikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGFjdDEgPiBhY3QyKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChhY3QxIDwgYWN0Mikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBza2lwICE9PSBcIm51bWJlclwiIHx8IHNraXAgPCAwKSB7XG5cdFx0XHRza2lwID0gMDtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGxpbWl0ICE9PSBcIm51bWJlclwiIHx8IGxpbWl0IDwgMCkge1xuXHRcdFx0bGltaXQgPSBkYi5sZW5ndGg7XG5cdFx0fVxuXG5cblxuXHRcdHZhciByZXNwb25zZSA9IHtcblx0XHRcdGl0ZW1zOiBlbGVtZW50cy5zbGljZShza2lwLCBza2lwICsgbGltaXQpLFxuXHRcdFx0Y291bnQ6IGVsZW1lbnRzLmxlbmd0aFxuXHRcdH07XG5cblx0XHRjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVPbmUoZGF0YSwgY2FsbGJhY2spIHtcblx0XHRjaGVja0NhbGxiYWNrKGNhbGxiYWNrKTtcblxuXHRcdGlmICh0eXBlb2YgZGF0YVtpZFByb3BlcnR5XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0ZGF0YVtpZFByb3BlcnR5XSA9IGdlbmVyYXRlSWQoKTtcblx0XHR9XG5cblx0XHR2YXIgZGF0YUlkeCA9IGZpbmRJbmRleEJ5SWQoZGF0YVtpZFByb3BlcnR5XSk7XG5cblx0XHRpZiAoZGF0YUlkeCA9PT0gLTEpIHsgLy90aGlzIHdheSB0aGlzIGlzIGFuIHVwc2VydCBhY3R1YWxseS4uLlxuXHRcdFx0ZGIucHVzaChkYXRhKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGJbZGF0YUlkeF0gPSBkYXRhO1xuXHRcdH1cblxuXHRcdGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmVhZE9uZUJ5SWQoaWQsIGNhbGxiYWNrKSB7XG5cdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cblx0XHR2YXIgZGF0YUlkeCA9IGZpbmRJbmRleEJ5SWQoaWQpO1xuXHRcdGlmIChkYXRhSWR4ID09PSAtMSkge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG1lc3NhZ2VzLmVycm9yTWVzc2FnZXMuTk9UX0ZPVU5EKTtcblx0XHR9XG5cdFx0Y2FsbGJhY2sobnVsbCwgZGJbZGF0YUlkeF0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gdXBkYXRlT25lQnlJZChpZCwgbmV3RGF0YSwgY2FsbGJhY2spIHtcblx0XHRjaGVja0NhbGxiYWNrKGNhbGxiYWNrKTtcblxuXHRcdHZhciBkYXRhSWR4ID0gZmluZEluZGV4QnlJZChpZCk7XG5cdFx0aWYgKGRhdGFJZHggPT09IC0xKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobWVzc2FnZXMuZXJyb3JNZXNzYWdlcy5OT1RfRk9VTkQpO1xuXHRcdH1cblxuXHRcdG5ld0RhdGFbaWRQcm9wZXJ0eV0gPSBpZDtcblx0XHRkYltkYXRhSWR4XSA9IG5ld0RhdGE7XG5cblx0XHRjYWxsYmFjayhudWxsLCBuZXdEYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlc3Ryb3lPbmVCeUlkKGlkLCBjYWxsYmFjaykge1xuXHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXG5cdFx0dmFyIGRhdGFJZHggPSBmaW5kSW5kZXhCeUlkKGlkKTtcblx0XHRpZiAoZGF0YUlkeCA9PT0gLTEpIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayhtZXNzYWdlcy5lcnJvck1lc3NhZ2VzLk5PVF9GT1VORCk7XG5cdFx0fVxuXG5cdFx0dmFyIGRhdGEgPSBkYi5zcGxpY2UoZGF0YUlkeCwgMSk7XG5cblx0XHRjYWxsYmFjayhudWxsLCBkYXRhWzBdKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QuZnJlZXplKHtcblx0XHRpZFByb3BlcnR5OiBpZFByb3BlcnR5LFxuXHRcdGdlbmVyYXRlSWQ6IGdlbmVyYXRlSWQsXG5cblxuXHRcdHJlYWQ6IHJlYWQsXG5cblx0XHRjcmVhdGVPbmU6IGNyZWF0ZU9uZSxcblxuXHRcdHJlYWRPbmVCeUlkOiByZWFkT25lQnlJZCxcblx0XHR1cGRhdGVPbmVCeUlkOiB1cGRhdGVPbmVCeUlkLFxuXHRcdGRlc3Ryb3lPbmVCeUlkOiBkZXN0cm95T25lQnlJZFxuXHR9KTtcbn07XG4iLCJ2YXIgY3JlYXRlQWpheFByb3h5ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVSZXN0UHJveHkoY29uZmlnKSB7XG5cblx0aWYgKCFjb25maWcpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjb25maWcgaXMgbWFuZGF0b3J5XCIpO1xuXHR9XG5cblx0aWYgKCFjb25maWcucm91dGUpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjb25maWcucm91dGUgaXMgbWFuZGF0b3J5XCIpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBjb25maWcucm91dGUgIT09IFwic3RyaW5nXCIgJiZcdGNvbmZpZy5yb3V0ZS5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjb25maWcucm91dGUgbXVzdCBiZSBlaXRoZXIgc3RyaW5nIG9yIGFycmF5XCIpO1xuXHR9XG5cblx0dmFyIHF1ZXJpZXMgPSBjb25maWcucXVlcmllcyB8fCB7fTtcblxuXHR2YXIgcmVhZFF1ZXJ5ID0gcXVlcmllcy5yZWFkIHx8IHt9O1xuXHR2YXIgY3JlYXRlT25lUXVlcnkgPSBxdWVyaWVzLmNyZWF0ZU9uZSB8fCB7fTtcblx0dmFyIHJlYWRPbmVCeUlkUXVlcnkgPSBxdWVyaWVzLnJlYWRPbmVCeUlkIHx8IHt9O1xuXHR2YXIgdXBkYXRlT25lQnlJZFF1ZXJ5ID0gcXVlcmllcy51cGRhdGVPbmVCeUlkIHx8IHt9O1xuXHR2YXIgZGVzdHJveU9uZUJ5SWRRdWVyeSA9IHF1ZXJpZXMuZGVzdHJveU9uZUJ5SWQgfHwge307XG5cblx0dmFyIHJvdXRlID0gY29uZmlnLnJvdXRlO1xuXG5cdGZ1bmN0aW9uIGFkZElkKHJvdXRlKSB7XG5cdFx0dmFyIG5ld1JvdXRlO1xuXG5cdFx0aWYgKHR5cGVvZiByb3V0ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0bmV3Um91dGUgPSBbcm91dGVdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdSb3V0ZSA9IHJvdXRlLnNsaWNlKDApO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbmV3Um91dGUubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdG5ld1JvdXRlW2ldICs9IFwiLzppZFwiO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXdSb3V0ZTtcblx0fVxuXG5cdHZhciByZXN0UHJveHkgPSBjcmVhdGVBamF4UHJveHkoe1xuXHRcdGlkUHJvcGVydHk6IGNvbmZpZy5pZFByb3BlcnR5LFxuXHRcdGlkVHlwZTogY29uZmlnLmlkVHlwZSxcblx0XHR0aW1lb3V0OiBjb25maWcudGltZW91dCxcblx0XHRvcGVyYXRpb25zOiB7XG5cdFx0XHRyZWFkOiB7XG5cdFx0XHRcdHJvdXRlOiByb3V0ZSxcblx0XHRcdFx0bWV0aG9kOiBcIkdFVFwiLFxuXHRcdFx0XHRyZWFkZXI6IGNvbmZpZy5yZWFkZXIsXG5cdFx0XHRcdHF1ZXJpZXM6IHJlYWRRdWVyeVxuXHRcdFx0fSxcblx0XHRcdGNyZWF0ZU9uZToge1xuXHRcdFx0XHRyb3V0ZTogcm91dGUsXG5cdFx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXG5cdFx0XHRcdHF1ZXJpZXM6IGNyZWF0ZU9uZVF1ZXJ5XG5cdFx0XHR9LFxuXHRcdFx0cmVhZE9uZUJ5SWQ6IHtcblx0XHRcdFx0cm91dGU6IGFkZElkKHJvdXRlKSxcblx0XHRcdFx0bWV0aG9kOiBcIkdFVFwiLFxuXHRcdFx0XHRxdWVyaWVzOiByZWFkT25lQnlJZFF1ZXJ5XG5cdFx0XHR9LFxuXHRcdFx0dXBkYXRlT25lQnlJZDoge1xuXHRcdFx0XHRyb3V0ZTogYWRkSWQocm91dGUpLFxuXHRcdFx0XHRtZXRob2Q6IFwiUFVUXCIsXG5cdFx0XHRcdHF1ZXJpZXM6IHVwZGF0ZU9uZUJ5SWRRdWVyeVxuXHRcdFx0fSxcblx0XHRcdGRlc3Ryb3lPbmVCeUlkOiB7XG5cdFx0XHRcdHJvdXRlOiBhZGRJZChyb3V0ZSksXG5cdFx0XHRcdG1ldGhvZDogXCJERUxFVEVcIixcblx0XHRcdFx0cXVlcmllczogZGVzdHJveU9uZUJ5SWRRdWVyeVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIHJlc3RQcm94eTtcbn07XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVSZWFkZXIoY29uZmlnKSB7XG5cblx0aWYgKCFjb25maWcpIHtcblx0XHR0aHJvdyBcIkpTT04gUkVBREVSOiBwbGVhc2UgcHJvdmlkZSBhIGNvbmZpZyBvYmplY3RcIjtcblx0fVxuXG5cdGlmICgoY29uZmlnICYmIChjb25maWcuc3VjY2VzcyB8fCBjb25maWcubWVzc2FnZSB8fCBjb25maWcuY291bnQpICYmICEoY29uZmlnLnJvb3QgfHwgY29uZmlnLnJlY29yZCkpKSB7XG5cdFx0dGhyb3cgXCJKU09OIFJFQURFUjogSWYgc3VjY2VzcywgbWVzc2FnZSwgb3IgY291bnQgcHJlc2VudCwgcm9vdCBvciByZWNvcmQgbXVzdCBiZSBzcGVjaWZpZWQhXCI7XG5cdH1cblxuXHR2YXIgcmVjb3JkUHJvcCAgPSBjb25maWcucmVjb3JkO1xuXHR2YXIgcm9vdFx0XHQ9IGNvbmZpZy5yb290O1xuXHR2YXIgY291bnRQcm9wXHQ9IGNvbmZpZy5jb3VudDtcblx0dmFyIHN1Y2Nlc3NQcm9wID0gY29uZmlnLnN1Y2Nlc3M7XG5cdHZhciBtZXNzYWdlUHJvcCA9IGNvbmZpZy5tZXNzYWdlO1xuXHR2YXIgZXJyUHJvcCAgICAgPSBjb25maWcuZXJyIHx8IFwiZXJyXCI7XG5cdHZhciBvdXRQcm9wXHRcdD0gY29uZmlnLm91dDtcblxuXHRmdW5jdGlvbiByZWFkKHJlc3BvbnNlKSB7XG5cblx0XHR2YXIgcm9vdERhdGEgPSAhcm9vdCA/IHJlc3BvbnNlIDogcmVzcG9uc2Vbcm9vdF07XG5cblx0XHR2YXIgZGF0YSA9IHt9O1xuXG5cdFx0aWYgKG91dFByb3ApIHtcblx0XHRcdGRhdGFbb3V0UHJvcF0gPSByZWNvcmRQcm9wID8gcm9vdERhdGFbcmVjb3JkUHJvcF0gOiByb290RGF0YTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGF0YSA9IHJlY29yZFByb3AgPyByb290RGF0YVtyZWNvcmRQcm9wXSA6IHJvb3REYXRhO1xuXHRcdH1cblxuXHRcdGlmIChjb3VudFByb3ApIHtcblx0XHRcdGRhdGEuY291bnQgPSByZXNwb25zZVtjb3VudFByb3BdO1xuXHRcdH1cblxuXHRcdGlmIChzdWNjZXNzUHJvcCkge1xuXHRcdFx0ZGF0YS5zdWNjZXNzID0gcmVzcG9uc2Vbc3VjY2Vzc1Byb3BdO1xuXHRcdH1cblxuXHRcdGlmIChtZXNzYWdlUHJvcCkge1xuXHRcdFx0ZGF0YS5tZXNzYWdlID0gcmVzcG9uc2VbbWVzc2FnZVByb3BdO1xuXHRcdH1cblxuXHRcdGlmIChlcnJQcm9wKSB7XG5cdFx0XHRpZiAocmVzcG9uc2VbZXJyUHJvcF0pIHtcblx0XHRcdFx0ZGF0YS5lcnIgPSByZXNwb25zZVtlcnJQcm9wXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QuZnJlZXplKHtcblx0XHRyZWFkOiByZWFkXG5cdH0pO1xufTtcbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgY3JlYXRlUHJvcCA9IHJlcXVpcmUoXCIuLi9tb2RlbC9wcm9wXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlKG9wdGlvbnMpIHtcblx0aWYgKCFvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IHt9O1xuXHR9XG5cblx0aWYgKCFvcHRpb25zLm1vZGVsKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5tb2RlbCBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0dmFyIG1vZGVsID0gb3B0aW9ucy5tb2RlbDtcblx0dmFyIHByb3h5ID0gbW9kZWwucHJveHk7XG5cblx0Ly92YXIgYXV0b0xvYWQ7XG5cdC8vdmFyIGF1dG9TeW5jO1xuXG5cblx0dmFyIHN0b3JlID0ge1xuXHRcdC8vZGF0YTogZGF0YSxcblx0XHRtb2RlbDogbW9kZWwsXG5cdFx0cHJveHk6IHByb3h5LFxuXG5cdFx0aXRlbXM6IFtdLFxuXHRcdGNvdW50OiAwLFxuXG5cdFx0bG9hZDogbG9hZCxcblx0XHRhZGQ6IGFkZFxuXHR9O1xuXG5cdHZhciB0cmlnZ2VyUXVlcnlDaGFuZ2VkID0gKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBxdWVyeUNoYW5nZWQgPSBudWxsO1xuXHRcdHJldHVybiBmdW5jdGlvbiB0cmlnZ2VyUXVlcnlDaGFuZ2VkKCkge1xuXHRcdFx0aWYgKHF1ZXJ5Q2hhbmdlZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHF1ZXJ5Q2hhbmdlZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHF1ZXJ5Q2hhbmdlZCA9IG51bGw7XG5cdFx0XHRcdGxvYWQoKTtcblx0XHRcdH0sIDApO1xuXHRcdH07XG5cdH0oKSk7XG5cblx0Ly9tYXliZSB0aGVzZSBzaG91bGQgYmUgb24gYSBzZXBhcmF0ZSBxdWVyeSBvYmplY3QuXG5cdGNyZWF0ZVByb3Aoc3RvcmUsIFwiZmluZFwiLCB7XG5cdFx0Ly9sYXN0VmFsdWUsIHZhbHVlLCBuZXdWYWx1ZSwgaW5pdGlhbFZhbHVlXG5cdFx0dmFsdWU6IG9wdGlvbnMuZmluZCB8fCB7fSxcblx0XHRiZWZvcmVDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0fSxcblx0XHRhZnRlckNoYW5nZTogdHJpZ2dlclF1ZXJ5Q2hhbmdlZFxuXHR9KTtcblxuXHQvL2Fsc28sIGZpbmQgYW5kIHNvcnQgcHJvcGVydGllcyBhcmUgbm90IHZlcnkgZ29vZCBhcyBzaW1wbGUgcHJvcHMuLi4gVGhleSBzaG91bGQgYmUgXCJwcm9wT2JqZWN0c1wiIG9yIHNvbWV0aGluZy4uLlxuXHQvL3RoYXQgd2F5IHRoZWlyIGZpZWxkcycgY2hhbmdlcyB3b3VsZCBiZSB0cmlnZ2VyZWQgYXMgd2VsbC5cblx0Y3JlYXRlUHJvcChzdG9yZSwgXCJzb3J0XCIsIHtcblx0XHR2YWx1ZTogb3B0aW9ucy5zb3J0IHx8IHtpZDogLTF9LFxuXHRcdGJlZm9yZUNoYW5nZTogZnVuY3Rpb24oKSB7XG5cdFx0fSxcblx0XHRhZnRlckNoYW5nZTogdHJpZ2dlclF1ZXJ5Q2hhbmdlZFxuXHR9KTtcblxuXHRjcmVhdGVQcm9wKHN0b3JlLCBcInNraXBcIiwge1xuXHRcdHZhbHVlOiBvcHRpb25zLnNraXAgfHwgMCxcblx0XHRiZWZvcmVDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0fSxcblx0XHRhZnRlckNoYW5nZTogdHJpZ2dlclF1ZXJ5Q2hhbmdlZFxuXHR9KTtcblxuXHRjcmVhdGVQcm9wKHN0b3JlLCBcImxpbWl0XCIsIHtcblx0XHR2YWx1ZTogb3B0aW9ucy5saW1pdCB8fCAxMCxcblx0XHRiZWZvcmVDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0fSxcblx0XHRhZnRlckNoYW5nZTogdHJpZ2dlclF1ZXJ5Q2hhbmdlZFxuXHR9KTtcblxuXG5cblx0Ly92YXIgZ3JvdXAgPSBcIj9nb29kIHF1ZXN0aW9uP1wiO1xuXG5cdC8vdmFyIGJ1ZmZlcmVkO1xuXG5cdC8vdmFyIHJlbW90ZUZpbHRlcjtcblx0Ly92YXIgcmVtb3RlR3JvdXA7XG5cdC8vdmFyIHJlbW90ZVNvcnQ7XG5cblxuXHQvL3ZhciBhY3RQYWdlID0gb3B0aW9ucy5hY3RQYWdlIHx8IDA7XG5cdC8vdmFyIG51bU9mSXRlbXMgPSAwO1xuXHQvL3ZhciBudW1PZlBhZ2VzID0gMDtcblxuXHQvL21vZGVsIGluc3RhbmNlcyBzaG91bGQgYmUgc3RvcmVkIHNvbWV3aGVyZSBieSBpZCBhcyB3ZWxsLlxuXHQvL2luIHRoZSBkYXRhIGFycmF5LCB0aGVyZSBzaG91bGQgYmUgcmVmZXJlbmNlcyB0byB0aG9zZSBpbnN0YW5jZXMuLi4gYWx0aG91Z2ggaXQgd291bGQgYmUgY29tcGxpY2F0ZWQgd2hlbiBsb2FkZWQgZnJvbSBsb2NhbFN0b3JhZ2UuXG5cdC8vbWF5YmUgd2Ugc2hvdWxkIHN0b3JlIG9ubHkgdGhlIGlkLXMgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBkYXRhIGFycmF5Li4uXG5cdC8vdmFyIHByZWZldGNoZWREYXRhID0ge1xuXHQvL1x0XCJ7c29ydGVyczoge2lkOiAxfSwgZmlsdGVyczoge31cIjogW3tza2lwOiAwLCBpZHM6IFtdfV1cblx0Ly99O1xuXHQvL3ZhciBwcmVmZXRjaGVkRGF0YVN0b3JhZ2UgPSBbXTtcblxuXHQvL2Z1bmN0aW9uIGdldERhdGEoKSB7XG5cdC8vXHRyZXR1cm4gcHJlZmV0Y2hlZERhdGFbY3VycmVudFBhZ2VdLmRhdGE7XG5cdC8vfVxuXG5cblx0Ly9za2lwIGFuZCBsaW1pdCBzaG91bGQgYmUgcHJvcGVydGllcyBhcyB3ZWxsXG5cdC8vaWYgc2tpcCwgbGltaXQsIGZpbmQgb3Igc29ydCBjaGFuZ2VzLCB0aGVuIHRoZSBsb2FkIG1ldGhvZCBzaG91bGQgYmUgY2FsbGVkIGF1dG9tYXRpY2FsbHkuXG5cblxuXHQvL2V2ZXJ5IGxvYWQgY2FsbCBzaG91bGQgaGF2ZSBhbiBpZC5cblx0Ly90aGlzIHdheSB3ZSBjYW4gc2V0IHVwXG5cdGZ1bmN0aW9uIHF1ZXJ5KHF1ZXJ5T2JqLCBjYWxsYmFjaykge1xuXHRcdG1vZGVsLmxpc3QocXVlcnlPYmosIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRjYWxsYmFjayhlcnIsIHJlc3VsdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBsb2FkKCkge1xuXHRcdHZhciBxdWVyeU9iaiA9IHtcblx0XHRcdGZpbmQ6IHN0b3JlLmZpbmQsXG5cdFx0XHRzb3J0OiBzdG9yZS5zb3J0LFxuXHRcdFx0c2tpcDogc3RvcmUuc2tpcCxcblx0XHRcdGxpbWl0OiBzdG9yZS5saW1pdFxuXHRcdH07XG5cblx0XHRsb2FkLmJlZm9yZShxdWVyeU9iaik7XG5cblx0XHRxdWVyeShxdWVyeU9iaiwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIGxvYWQuYWZ0ZXIoZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0c3RvcmUuaXRlbXMubGVuZ3RoID0gMDtcblx0XHRcdHN0b3JlLml0ZW1zLmxlbmd0aCA9IHJlc3VsdC5pdGVtcy5sZW5ndGg7XG5cdFx0XHRmb3IgKHZhciBpZHggPSAwOyBpZHggPCByZXN1bHQuaXRlbXMubGVuZ3RoOyBpZHggKz0gMSkge1xuXHRcdFx0XHRzdG9yZS5pdGVtc1tpZHhdID0gcmVzdWx0Lml0ZW1zW2lkeF07XG5cdFx0XHR9XG5cdFx0XHRzdG9yZS5jb3VudCA9IHJlc3VsdC5jb3VudDtcblxuXHRcdFx0bG9hZC5hZnRlcihudWxsLCByZXN1bHQpO1xuXHRcdH0pO1xuXHR9XG5cblx0bG9hZC5iZWZvcmUgPSBjcmVhdGVDYWxsYmFja0FycmF5Q2FsbGVyKHN0b3JlLCBbXSk7IC8vbGF0ZXIgd2UgY2FuIGFkZCBkZWZhdWx0IGNhbGxiYWNrc1xuXHRsb2FkLmFmdGVyID0gY3JlYXRlQ2FsbGJhY2tBcnJheUNhbGxlcihzdG9yZSwgW10pO1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrQXJyYXlDYWxsZXIodGhpc0FyZywgYXJyYXkpIHtcblx0XHRmdW5jdGlvbiBjYWxsYmFja0FycmF5Q2FsbGVyKGVycikge1xuXHRcdFx0YXJyYXkuZm9yRWFjaChmdW5jdGlvbihhY3RGdW5jdGlvbikge1xuXHRcdFx0XHRhY3RGdW5jdGlvbi5jYWxsKHRoaXNBcmcsIGVycik7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjYWxsYmFja0FycmF5Q2FsbGVyLmFkZCA9IGZ1bmN0aW9uKGZ1bmMpIHtcblx0XHRcdGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0YXJyYXkucHVzaChmdW5jKTtcblx0XHR9O1xuXG5cdFx0Y2FsbGJhY2tBcnJheUNhbGxlci5yZW1vdmUgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0XHR2YXIgaWR4ID0gYXJyYXkuaW5kZXhPZihmdW5jKTtcblxuXHRcdFx0aWYgKGlkeCA+IC0xKSB7XG5cdFx0XHRcdGFycmF5LnNwbGljZShpZHgsIDEpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gY2FsbGJhY2tBcnJheUNhbGxlcjtcblx0fVxuXG5cblx0ZnVuY3Rpb24gYWRkKGRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0bW9kZWwuY3JlYXRlKGRhdGEsIGNhbGxiYWNrKTtcblx0fVxuXG5cblxuXG5cdHJldHVybiBzdG9yZTtcbn07IiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vcnlQcm94eSA9IHJlcXVpcmUoXCIuL3Byb3h5L21lbW9yeVwiKTtcbnZhciBsb2NhbFN0b3JhZ2VQcm94eSA9IHJlcXVpcmUoXCIuL3Byb3h5L2xvY2FsU3RvcmFnZVwiKTtcbnZhciByZXN0UHJveHkgPSByZXF1aXJlKFwiLi9wcm94eS9yZXN0XCIpO1xudmFyIGFqYXhQcm94eSA9IHJlcXVpcmUoXCIuL3Byb3h5L2FqYXhcIik7XG52YXIgZGVsYXllZE1lbW9yeVByb3h5ID0gcmVxdWlyZShcIi4vcHJveHkvZGVsYXllZE1lbW9yeVwiKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoXCIuL3N0b3JlL3N0b3JlXCIpO1xudmFyIG1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWwvbW9kZWxcIik7XG52YXIganNvblJlYWRlciA9IHJlcXVpcmUoXCIuL3JlYWRlci9qc29uXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0cHJveHk6IHtcblx0XHRtZW1vcnk6IG1lbW9yeVByb3h5LFxuXHRcdGxvY2FsU3RvcmFnZTogbG9jYWxTdG9yYWdlUHJveHksXG5cdFx0cmVzdDogcmVzdFByb3h5LFxuXHRcdGFqYXg6IGFqYXhQcm94eSxcblx0XHRkZWxheWVkTWVtb3J5OiBkZWxheWVkTWVtb3J5UHJveHlcblx0fSxcblx0bW9kZWw6IHtcblx0XHRtb2RlbDogbW9kZWxcblx0fSxcblx0c3RvcmU6IHtcblx0XHRzdG9yZTogc3RvcmVcblx0fSxcblx0cmVhZGVyOiB7XG5cdFx0anNvbjoganNvblJlYWRlclxuXHR9XG59O1xuIl19
