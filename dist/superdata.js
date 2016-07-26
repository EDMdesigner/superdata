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

			actConfig.timeout = config.timeout;
			actConfig.idProperty = idProperty;

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

var defaultTimeout = 3000;

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
		var timeout = actConfig.timeout || defaultTimeout;
		var idProperty = actConfig.idProperty;

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

	var defaultReader = createReader({});

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZm9ybS1kYXRhL2xpYi9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwic3JjL2Vycm9yTWVzc2FnZXMuanMiLCJzcmMvbW9kZWwvbW9kZWwuanMiLCJzcmMvbW9kZWwvbW9kZWxPYmplY3QuanMiLCJzcmMvbW9kZWwvcHJvcC5qcyIsInNyYy9wcm94eS9hamF4LmpzIiwic3JjL3Byb3h5L2FqYXhDb3JlLmpzIiwic3JjL3Byb3h5L2FqYXhIZWxwZXJzLmpzIiwic3JjL3Byb3h5L2RlbGF5ZWRNZW1vcnkuanMiLCJzcmMvcHJveHkvbG9jYWxTdG9yYWdlLmpzIiwic3JjL3Byb3h5L2xvY2FsU3RvcmFnZUNvcmUuanMiLCJzcmMvcHJveHkvbWVtb3J5LmpzIiwic3JjL3Byb3h5L3Jlc3QuanMiLCJzcmMvcmVhZGVyL2pzb24uanMiLCJzcmMvc3RvcmUvc3RvcmUuanMiLCJzcmMvc3VwZXJEYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG4vKipcclxuICogRXhwb3NlIGBFbWl0dGVyYC5cclxuICovXHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICBtb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cclxuICpcclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xyXG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICogQHJldHVybiB7T2JqZWN0fVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcclxuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcclxuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIG9iajtcclxufVxyXG5cclxuLyoqXHJcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cclxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gICh0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXSlcclxuICAgIC5wdXNoKGZuKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcclxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XHJcbiAgZnVuY3Rpb24gb24oKSB7XHJcbiAgICB0aGlzLm9mZihldmVudCwgb24pO1xyXG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICB9XHJcblxyXG4gIG9uLmZuID0gZm47XHJcbiAgdGhpcy5vbihldmVudCwgb24pO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXHJcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuXHJcbiAgLy8gYWxsXHJcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIHNwZWNpZmljIGV2ZW50XHJcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XHJcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xyXG5cclxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXHJcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXHJcbiAgdmFyIGNiO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcclxuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XHJcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXHJcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XHJcblxyXG4gIGlmIChjYWxsYmFja3MpIHtcclxuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEByZXR1cm4ge0FycmF5fVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW107XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHJldHVybiB7Qm9vbGVhbn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XHJcbn07XHJcbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xubW9kdWxlLmV4cG9ydHMgPSBGb3JtRGF0YTtcbiIsIlxuLyoqXG4gKiBSZWR1Y2UgYGFycmAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxcbiAqXG4gKiBUT0RPOiBjb21iYXRpYmxlIGVycm9yIGhhbmRsaW5nP1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbiwgaW5pdGlhbCl7ICBcbiAgdmFyIGlkeCA9IDA7XG4gIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICB2YXIgY3VyciA9IGFyZ3VtZW50cy5sZW5ndGggPT0gM1xuICAgID8gaW5pdGlhbFxuICAgIDogYXJyW2lkeCsrXTtcblxuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgY3VyciA9IGZuLmNhbGwobnVsbCwgY3VyciwgYXJyW2lkeF0sICsraWR4LCBhcnIpO1xuICB9XG4gIFxuICByZXR1cm4gY3Vycjtcbn07IiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7IC8vIEJyb3dzZXIgd2luZG93XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgeyAvLyBXZWIgV29ya2VyXG4gIHJvb3QgPSBzZWxmO1xufSBlbHNlIHsgLy8gT3RoZXIgZW52aXJvbm1lbnRzXG4gIHJvb3QgPSB0aGlzO1xufVxuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAmJiAoIXJvb3QubG9jYXRpb24gfHwgJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCBvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBIZWxwcyAnc2VyaWFsaXplJyB3aXRoIHNlcmlhbGl6aW5nIGFycmF5cy5cbiAqIE11dGF0ZXMgdGhlIHBhaXJzIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2YWwpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIHJldHVybiB2YWwuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2KTtcbiAgICB9KTtcbiAgfVxuICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsKSk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgcmV0dXJuIC9bXFwvK11qc29uXFxiLy50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9ICgodGhpcy5yZXEubWV0aG9kICE9J0hFQUQnICYmICh0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICcnIHx8IHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnKSkgfHwgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgIDogbnVsbDtcbiAgdGhpcy5zdGF0dXNUZXh0ID0gdGhpcy5yZXEueGhyLnN0YXR1c1RleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgKHN0ci5sZW5ndGggfHwgc3RyIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIC8vIGlzc3VlICM2NzU6IHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBlcnIucmF3UmVzcG9uc2UgPSBzZWxmLnhociAmJiBzZWxmLnhoci5yZXNwb25zZVRleHQgPyBzZWxmLnhoci5yZXNwb25zZVRleHQgOiBudWxsO1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ3Jlc3BvbnNlJywgcmVzKTtcblxuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICB9XG5cbiAgICBpZiAocmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMCkge1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICAgIH1cblxuICAgIHZhciBuZXdfZXJyID0gbmV3IEVycm9yKHJlcy5zdGF0dXNUZXh0IHx8ICdVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZScpO1xuICAgIG5ld19lcnIub3JpZ2luYWwgPSBlcnI7XG4gICAgbmV3X2Vyci5yZXNwb25zZSA9IHJlcztcbiAgICBuZXdfZXJyLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG5cbiAgICBzZWxmLmNhbGxiYWNrKG5ld19lcnIsIHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRm9yY2UgZ2l2ZW4gcGFyc2VyXG4gKlxuICogU2V0cyB0aGUgYm9keSBwYXJzZXIgbm8gbWF0dGVyIHR5cGUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihmbil7XG4gIHRoaXMuX3BhcnNlciA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lIHx8IGZpbGUubmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCBhcyB0aGUgcmVxdWVzdCBib2R5LCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0nKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqIHx8IGlzSG9zdChkYXRhKSkgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGZuKGVyciwgcmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1JlcXVlc3QgaGFzIGJlZW4gdGVybWluYXRlZFxcblBvc3NpYmxlIGNhdXNlczogdGhlIG5ldHdvcmsgaXMgb2ZmbGluZSwgT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiwgdGhlIHBhZ2UgaXMgYmVpbmcgdW5sb2FkZWQsIGV0Yy4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcblxuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgZXJyLnVybCA9IHRoaXMudXJsO1xuXG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IHJlcXVlc3QuZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuXG4gICAgLy8gSW4gSUU5LCByZWFkcyB0byBhbnkgcHJvcGVydHkgKGUuZy4gc3RhdHVzKSBvZmYgb2YgYW4gYWJvcnRlZCBYSFIgd2lsbFxuICAgIC8vIHJlc3VsdCBpbiB0aGUgZXJyb3IgXCJDb3VsZCBub3QgY29tcGxldGUgdGhlIG9wZXJhdGlvbiBkdWUgdG8gZXJyb3IgYzAwYzAyM2ZcIlxuICAgIHZhciBzdGF0dXM7XG4gICAgdHJ5IHsgc3RhdHVzID0geGhyLnN0YXR1cyB9IGNhdGNoKGUpIHsgc3RhdHVzID0gMDsgfVxuXG4gICAgaWYgKDAgPT0gc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgdmFyIGhhbmRsZVByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgfVxuICAgIGUuZGlyZWN0aW9uID0gJ2Rvd25sb2FkJztcbiAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gIH07XG4gIGlmICh0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgIHhoci5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAoeGhyLnVwbG9hZCAmJiB0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3M7XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICAvLyBBY2Nlc3NpbmcgeGhyLnVwbG9hZCBmYWlscyBpbiBJRSBmcm9tIGEgd2ViIHdvcmtlciwgc28ganVzdCBwcmV0ZW5kIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzgzNzI0NS94bWxodHRwcmVxdWVzdC11cGxvYWQtdGhyb3dzLWludmFsaWQtYXJndW1lbnQtd2hlbi11c2VkLWZyb20td2ViLXdvcmtlci1jb250ZXh0XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi50aW1lZG91dCA9IHRydWU7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgY29udGVudFR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgdmFyIHNlcmlhbGl6ZSA9IHRoaXMuX3BhcnNlciB8fCByZXF1ZXN0LnNlcmlhbGl6ZVtjb250ZW50VHlwZSA/IGNvbnRlbnRUeXBlLnNwbGl0KCc7JylbMF0gOiAnJ107XG4gICAgaWYgKCFzZXJpYWxpemUgJiYgaXNKU09OKGNvbnRlbnRUeXBlKSkgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcblxuICAvLyBJRTExIHhoci5zZW5kKHVuZGVmaW5lZCkgc2VuZHMgJ3VuZGVmaW5lZCcgc3RyaW5nIGFzIFBPU1QgcGF5bG9hZCAoaW5zdGVhZCBvZiBub3RoaW5nKVxuICAvLyBXZSBuZWVkIG51bGwgaGVyZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICB4aHIuc2VuZCh0eXBlb2YgZGF0YSAhPT0gJ3VuZGVmaW5lZCcgPyBkYXRhIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGYXV4IHByb21pc2Ugc3VwcG9ydFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdFxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGwsIHJlamVjdCkge1xuICByZXR1cm4gdGhpcy5lbmQoZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICBlcnIgPyByZWplY3QoZXJyKSA6IGZ1bGZpbGwocmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlbCh1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG5yZXF1ZXN0WydkZWwnXSA9IGRlbDtcbnJlcXVlc3RbJ2RlbGV0ZSddID0gZGVsO1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRlcnJvck1lc3NhZ2VzOiB7XG5cdFx0Tk9UX0ZPVU5EOiBcIk5PVF9GT1VORFwiXG5cdH0sXG5cdGV4Y2VwdGlvbk1lc3NhZ2VzOiB7XG5cdFx0Tk9UX0FfRlVOQ1RJT046IFwiTk9UX0FfRlVOQ1RJT05cIlxuXHR9XG59O1xuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjcmVhdGVNb2RlbE9iamVjdCA9IHJlcXVpcmUoXCIuL21vZGVsT2JqZWN0XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU1vZGVsKG9wdGlvbnMpIHtcblx0aWYgKCFvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IHt9O1xuXHR9XG5cblx0aWYgKCFvcHRpb25zLmlkRmllbGQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLmlkRmllbGQgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdGlmICghb3B0aW9ucy5maWVsZHMpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLmZpZWxkcyBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0aWYgKCFvcHRpb25zLnByb3h5KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5wcm94eSBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cdFxuXHR2YXIgaWRGaWVsZCA9IG9wdGlvbnMuaWRGaWVsZDtcblx0dmFyIGZpZWxkcyA9IG9wdGlvbnMuZmllbGRzO1xuXG5cdHZhciBwcm94eSA9IG9wdGlvbnMucHJveHk7XG5cblx0Ly9vcHRpb25zLmZpZWxkcyBzaG91bGQgYmUgYW4gYXJyYXkgb2Ygb2JqZWN0c1xuXHQvL3RoZSBvYmplY3RzIHNob3VsZCBkZXNjcmliZSB0aGUgZmllbGRzOlxuXHQvLyAtIG5hbWVcblx0Ly8gLSB0eXBlXG5cdC8vIC0gdmFsaWRhdG9yc1xuXHQvLyAtIG1hcHBpbmdcblx0Ly8gLSBkZWZhdWx0VmFsdWVcblx0Ly8gLSBiZWZvcmVDaGFuZ2Vcblx0Ly8gLSBhZnRlckNoYW5nZVxuXG5cdGZ1bmN0aW9uIGxpc3Qob3B0aW9ucywgY2FsbGJhY2spIHtcblx0XHRwcm94eS5yZWFkKG9wdGlvbnMsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZGF0YSA9IFtdO1xuXG5cdFx0XHRyZXN1bHQuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRcdGRhdGEucHVzaChjcmVhdGVNb2RlbE9iamVjdCh7XG5cdFx0XHRcdFx0bW9kZWw6IG1vZGVsLFxuXG5cdFx0XHRcdFx0ZGF0YTogaXRlbVxuXHRcdFx0XHR9KSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIHJlc3VsdE9iaiA9IHtcblx0XHRcdFx0aXRlbXM6IGRhdGEsXG5cdFx0XHRcdGNvdW50OiByZXN1bHQuY291bnRcblx0XHRcdH07XG5cblx0XHRcdGNhbGxiYWNrKG51bGwsIHJlc3VsdE9iaik7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBsb2FkKGlkLCBjYWxsYmFjaykge1xuXHRcdHByb3h5LnJlYWRPbmVCeUlkKGlkLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG1vZGVsT2JqZWN0ID0gY3JlYXRlTW9kZWxPYmplY3Qoe1xuXHRcdFx0XHRtb2RlbDogbW9kZWwsXG5cblx0XHRcdFx0ZGF0YTogcmVzdWx0XG5cdFx0XHR9KTtcblx0XHRcdGNhbGxiYWNrKG51bGwsIG1vZGVsT2JqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZShtb2RlbFZhbHVlcywgY2FsbGJhY2spIHtcblx0XHRwcm94eS5jcmVhdGVPbmUobW9kZWxWYWx1ZXMsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRjYWxsYmFjayhudWxsLCBjcmVhdGVNb2RlbE9iamVjdCh7XG5cdFx0XHRcdG1vZGVsOiBtb2RlbCxcblxuXHRcdFx0XHRkYXRhOiByZXN1bHRcblx0XHRcdH0pKTtcblx0XHR9KTtcblx0fVxuXG5cdHZhciBtb2RlbCA9IE9iamVjdC5mcmVlemUoe1xuXHRcdGZpZWxkczogZmllbGRzLFxuXHRcdHByb3h5OiBwcm94eSxcblx0XHRpZEZpZWxkOiBpZEZpZWxkLFxuXG5cdFx0bGlzdDogbGlzdCxcblx0XHRsb2FkOiBsb2FkLFxuXHRcdGNyZWF0ZTogY3JlYXRlXG5cdH0pO1xuXG5cdHJldHVybiBtb2RlbDtcbn07IiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjcmVhdGVQcm9wID0gcmVxdWlyZShcIi4vcHJvcFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVNb2RlbE9iamVjdChvcHRpb25zKSB7XG5cdGlmICghb3B0aW9ucykge1xuXHRcdG9wdGlvbnMgPSB7fTtcblx0fVxuXG5cdGlmICghb3B0aW9ucy5kYXRhKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5kYXRhIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMubW9kZWwpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLm1vZGVsIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMubW9kZWwuZmllbGRzKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5tb2RlbC5maWVsZHMgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdGlmICghb3B0aW9ucy5tb2RlbC5pZEZpZWxkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy5tb2RlbC5pZEZpZWxkIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMubW9kZWwucHJveHkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLm1vZGVsLnByb3h5IGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHR2YXIgbW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXG5cdHZhciBmaWVsZHMgPSBvcHRpb25zLm1vZGVsLmZpZWxkcztcblx0dmFyIGlkRmllbGQgPSBvcHRpb25zLm1vZGVsLmlkRmllbGQ7XG5cdHZhciBwcm94eSA9IG9wdGlvbnMubW9kZWwucHJveHk7XG5cblxuXHR2YXIgZGF0YSA9IHt9O1xuXG5cdGZvciAodmFyIHByb3AgaW4gZmllbGRzKSB7XG5cdFx0dmFyIGFjdEZpZWxkID0gZmllbGRzW3Byb3BdO1xuXHRcdHZhciBhY3RWYWx1ZSA9IG9wdGlvbnMuZGF0YS5oYXNPd25Qcm9wZXJ0eShwcm9wKSA/IG9wdGlvbnMuZGF0YVtwcm9wXSA6IGFjdEZpZWxkLmRlZmF1bHRWYWx1ZTtcblxuXHRcdGNyZWF0ZVByb3AoZGF0YSwgcHJvcCwge1xuXHRcdFx0dmFsdWU6IGFjdFZhbHVlLFxuXHRcdFx0YmVmb3JlQ2hhbmdlOiBjcmVhdGVCZWZvcmVDaGFuZ2VGdW5jdGlvbihwcm9wKSxcblx0XHRcdGFmdGVyQ2hhbmdlOiBjcmVhdGVBZnRlckNoYW5nZUZ1bmN0aW9uKHByb3ApXG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgb2JqID0ge1xuXHRcdGRhdGE6IGRhdGEsXG5cdFx0bW9kZWw6IG1vZGVsLFxuXG5cdFx0cmVhZDogcmVhZCxcblx0XHRzYXZlOiBzYXZlLFxuXHRcdGRlc3Ryb3k6IGRlc3Ryb3lcblx0fTtcblxuXHRmdW5jdGlvbiBjcmVhdGVCZWZvcmVDaGFuZ2VGdW5jdGlvbihwcm9wTmFtZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiBiZWZvcmVDaGFuZ2UodmFsdWVzKSB7XG5cdFx0XHR2YWxpZGF0ZShwcm9wTmFtZSwgdmFsdWVzKTtcblxuXHRcdFx0Ly92YXIgZmllbGQgPSBmaWVsZHNbcHJvcE5hbWVdO1xuXG4vKlxuXHRcdFx0aWYgKGZpZWxkLmJlZm9yZUNoYW5nZSkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpZWxkLmJlZm9yZUNoYW5nZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cblx0XHRcdFx0fVxuXHRcdFx0fVxuKi9cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlQWZ0ZXJDaGFuZ2VGdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gYWZ0ZXJDaGFuZ2UoKSB7XG5cdFx0XHQvL2NhbGwgdGhlIG9uQ2hhbmdlIGxpc3RlbmVyc1xuXHRcdH07XG5cdH1cblxuXG5cdGZ1bmN0aW9uIHZhbGlkYXRlKHByb3BOYW1lKSB7XG5cdFx0dmFyIGZpZWxkID0gZmllbGRzW3Byb3BOYW1lXTtcblxuXHRcdGlmICghZmllbGQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIWZpZWxkLnZhbGlkYXRvcnMpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZWFkKGNhbGxiYWNrKSB7XG5cdFx0dmFyIGlkID0gZGF0YVtpZEZpZWxkXTtcblx0XHRwcm94eS5yZWFkT25lQnlJZChpZCwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycik7XG5cdFx0XHR9XG5cdFx0XHRjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2F2ZShjYWxsYmFjaykge1xuXHRcdHZhciBpZCA9IGRhdGFbaWRGaWVsZF07XG5cdFx0cHJveHkudXBkYXRlT25lQnlJZChpZCwgZGF0YSwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcblx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycik7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAodmFyIHByb3AgaW4gcmVzdWx0KSB7XG5cdFx0XHRcdGRhdGFbcHJvcF0gPSByZXN1bHRbcHJvcF07XG5cdFx0XHR9XG5cblx0XHRcdGNhbGxiYWNrKG51bGwsIG9iaik7XG5cdFx0fSk7XG5cdH1cblxuXHQvL2RlbGV0ZWQgZmxhZz9cblx0ZnVuY3Rpb24gZGVzdHJveShjYWxsYmFjaykge1xuXHRcdHZhciBpZCA9IGRhdGFbaWRGaWVsZF07XG5cdFx0cHJveHkuZGVzdHJveU9uZUJ5SWQoaWQsIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRcdH1cblxuXHRcdFx0Y2FsbGJhY2sobnVsbCwgb2JqKTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBvYmo7XG59O1xuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlUHJvcChvYmosIG5hbWUsIGNvbmZpZykge1xuXHQvL3Nob3VsZCBiZSBjYWxsZWQgZmllbGRcblx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXG5cdHZhciBpbml0aWFsVmFsdWUgPSBjb25maWcudmFsdWU7XG5cdHZhciB2YWx1ZSA9IGluaXRpYWxWYWx1ZTtcblx0dmFyIGxhc3RWYWx1ZSA9IHZhbHVlO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcblx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG5cblx0XHRzZXQ6IHNldCxcblx0XHRnZXQ6IGdldFxuXHR9KTtcblxuXHRmdW5jdGlvbiBzZXQobmV3VmFsKSB7XG5cdFx0aWYgKG5ld1ZhbCA9PT0gdmFsdWUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGNvbmZpZy5iZWZvcmVDaGFuZ2UgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0Y29uZmlnLmJlZm9yZUNoYW5nZSh7bGFzdFZhbHVlOiBsYXN0VmFsdWUsIHZhbHVlOiB2YWx1ZSwgbmV3VmFsdWU6IG5ld1ZhbCwgaW5pdGlhbFZhbHVlOiBpbml0aWFsVmFsdWV9KTtcblx0XHR9XG5cblx0XHRsYXN0VmFsdWUgPSB2YWx1ZTtcblx0XHR2YWx1ZSA9IG5ld1ZhbDtcblxuXHRcdGlmICh0eXBlb2YgY29uZmlnLmFmdGVyQ2hhbmdlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGNvbmZpZy5hZnRlckNoYW5nZSh7bGFzdFZhbHVlOiBsYXN0VmFsdWUsIHZhbHVlOiB2YWx1ZSwgbmV3VmFsdWU6IG5ld1ZhbCwgaW5pdGlhbFZhbHVlOiBpbml0aWFsVmFsdWV9KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnZXQoKSB7XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9XG5cblx0cmV0dXJuIG9iajtcbn07XG4iLCIvKlxuICogQWpheCBwcm94eSBzaGVsbFxuICovXG5cbi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgY3JlYXRlUmVhZGVyID0gcmVxdWlyZShcIi4uL3JlYWRlci9qc29uXCIpO1xuXG52YXIgYWpheENvcmUgPSByZXF1aXJlKFwiLi9hamF4Q29yZVwiKTtcblxudmFyIHJlcXVlc3QgPSByZXF1aXJlKFwic3VwZXJhZ2VudFwiKTtcblxuLy8gdmFyIGlzTm9kZSA9IG5ldyBGdW5jdGlvbihcInRyeSB7cmV0dXJuIHRoaXM9PT1nbG9iYWw7fWNhdGNoKGUpe3JldHVybiBmYWxzZTt9XCIpO1xudmFyIGVudmlyb25tZW50O1xuXG50cnkge1xuXHRlbnZpcm9ubWVudCA9IHdpbmRvdyA/IHdpbmRvdyA6IGdsb2JhbDtcbn0gY2F0Y2ggKGUpIHtcblx0ZW52aXJvbm1lbnQgPSBnbG9iYWw7XG59XG5cbnZhciBGb3JtRGF0YSA9IGVudmlyb25tZW50LkZvcm1EYXRhO1xuaWYgKCFGb3JtRGF0YSkge1xuXHRGb3JtRGF0YSA9IHJlcXVpcmUoXCJmb3JtLWRhdGFcIik7XG59XG5cbnZhciBhamF4SGVscGVycyA9IHJlcXVpcmUoXCIuL2FqYXhIZWxwZXJzXCIpKHtcblx0cmVxdWVzdDogcmVxdWVzdCxcblx0Y3JlYXRlUmVhZGVyOiBjcmVhdGVSZWFkZXJcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFqYXhDb3JlKHtcblx0YWpheEhlbHBlcnM6IGFqYXhIZWxwZXJzLFxuXHRGb3JtRGF0YTogRm9ybURhdGFcbn0pOyIsIi8qXG4gKiBBamF4IHByb3h5IGNvcmVcbiAqL1xuXG4vKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZXBlbmRlbmNpZXMpIHtcblxuXHRpZiAoIWRlcGVuZGVuY2llcy5hamF4SGVscGVycykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRlcGVuZGVuY2llcy5hamF4SGVscGVycyBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0aWYgKCFkZXBlbmRlbmNpZXMuRm9ybURhdGEpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkZXBlbmRlbmNpZXMuRm9ybURhdGEgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdHZhciBhamF4SGVscGVycyA9IGRlcGVuZGVuY2llcy5hamF4SGVscGVycztcblx0dmFyIGNyZWF0ZU9wZXJhdGlvbkNvbmZpZyA9IGFqYXhIZWxwZXJzLmNyZWF0ZU9wZXJhdGlvbkNvbmZpZztcblx0dmFyIGRpc3BhdGNoQWpheCA9IGFqYXhIZWxwZXJzLmRpc3BhdGNoQWpheDtcblx0dmFyIHByZXBhcmVPcGVyYXRpb25zQ29uZmlnID0gYWpheEhlbHBlcnMucHJlcGFyZU9wZXJhdGlvbnNDb25maWc7XG5cdHZhciBhc3NlcnQgPSBhamF4SGVscGVycy5hc3NlcnQ7XG5cdHZhciBGb3JtRGF0YSA9IGRlcGVuZGVuY2llcy5Gb3JtRGF0YTtcblx0XG5cdHJldHVybiBmdW5jdGlvbiBjcmVhdGVBamF4UHJveHkoY29uZmlnKSB7XG5cdFx0aWYgKCFjb25maWcpIHtcblx0XHRcdGNvbmZpZyA9IHt9O1xuXHRcdH1cblxuXHRcdGlmICghY29uZmlnLmlkUHJvcGVydHkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImNvbmZpZy5pZFByb3BlcnR5IGlzIG1hbmRhdG9yeSFcIik7XG5cdFx0fVxuXG5cdFx0aWYgKCFjb25maWcub3BlcmF0aW9ucykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiY29uZmlnLm9wZXJhdGlvbnMgaXMgbWFuZGF0b3J5IVwiKTtcblx0XHR9XG5cblx0XHRpZihjb25maWcuZmllbGRzVG9CZUV4Y2x1ZGVkKSB7XG5cdFx0XHRpZighKGNvbmZpZy5maWVsZHNUb0JlRXhjbHVkZWQgaW5zdGFuY2VvZiBcIkFycmF5XCIpKSB7XG5cdFx0XHRcdHRocm93IEVycm9yKFwiY29uZmlnLmZpZWxkc1RvQmVFeGNsdWRlZCBzaG91bGQgYmUgYW4gYXJyYXlcIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIGlkUHJvcGVydHkgPSBjb25maWcuaWRQcm9wZXJ0eTtcblxuXHRcdHZhciBnZW5lcmF0ZUlkID0gY29uZmlnLmdlbmVyYXRlSWQgfHwgKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG5leHRJZCA9IDA7XG5cblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG5leHRJZCArPSAxO1xuXHRcdFx0fTtcblx0XHR9KCkpO1xuXG5cdFx0dmFyIHF1ZXJ5TWFwcGluZyA9IGNvbmZpZy5xdWVyeU1hcHBpbmc7XG5cblx0XHR2YXIgZmllbGRzVG9CZUV4Y2x1ZGVkID0gY29uZmlnLmZpZWxkc1RvQmVFeGNsdWRlZDtcblxuXHRcdGZ1bmN0aW9uIHJlbW92ZUZpZWxkcyhvYmplY3QsIGZpZWxkcykge1xuXHRcdFx0aWYoIWZpZWxkcyl7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkgKz0gMSl7XG5cdFx0XHRcdGZvcih2YXIgcHJvcCBpbiBvYmplY3Qpe1xuXHRcdFx0XHRcdGlmKGZpZWxkc1tpXSA9PT0gcHJvcCl7XG5cdFx0XHRcdFx0XHRkZWxldGUgb2JqZWN0W3Byb3BdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHByZXBhcmVPcGVyYXRpb25zQ29uZmlnKGNvbmZpZy5vcGVyYXRpb25zKTtcblxuXHRcdGZ1bmN0aW9uIGNyZWF0ZU9uZShkYXRhLCBjYWxsYmFjaykge1xuXHRcdFx0cmVtb3ZlRmllbGRzKGRhdGEsIGZpZWxkc1RvQmVFeGNsdWRlZCk7XG5cblx0XHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXHRcdFx0dmFyIGFjdENvbmZpZyA9IGNyZWF0ZU9wZXJhdGlvbkNvbmZpZyhjb25maWcub3BlcmF0aW9ucy5jcmVhdGVPbmUsIG51bGwsIGRhdGEpO1xuXG5cdFx0XHRpZiAoZGF0YS5jb25zdHJ1Y3RvciA9PT0gRm9ybURhdGEpIHtcblx0XHRcdFx0YWN0Q29uZmlnLmZvcm1EYXRhID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YWN0Q29uZmlnLnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblx0XHRcdGFjdENvbmZpZy5pZFByb3BlcnR5ID0gaWRQcm9wZXJ0eTtcblxuXHRcdFx0ZGlzcGF0Y2hBamF4KGFjdENvbmZpZywgY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlYWQob3B0aW9ucywgZmlsdGVycywgY2FsbGJhY2spIHtcblx0XHRcdGlmKCFjYWxsYmFjaykge1xuXHRcdFx0XHRjYWxsYmFjayA9IGZpbHRlcnM7XG5cdFx0XHRcdGZpbHRlcnMgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRjaGVja0NhbGxiYWNrKGNhbGxiYWNrKTtcblx0XHRcdGlmICh0eXBlb2YgcXVlcnlNYXBwaW5nID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0b3B0aW9ucyA9IHF1ZXJ5TWFwcGluZyhvcHRpb25zKTtcblx0XHRcdH1cblx0XHRcdHZhciBhY3RDb25maWcgPSBjcmVhdGVPcGVyYXRpb25Db25maWcoY29uZmlnLm9wZXJhdGlvbnMucmVhZCk7XG5cblx0XHRcdGZvciAodmFyIHByb3AgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRhY3RDb25maWcucXVlcmllc1twcm9wXSA9IG9wdGlvbnNbcHJvcF07XG5cdFx0XHR9XG5cdFx0XHRhY3RDb25maWcubWV0aG9kID0gYWN0Q29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0ZGlzcGF0Y2hBamF4KGFjdENvbmZpZywgZmlsdGVycywgY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlYWRPbmVCeUlkKGlkLCBmaWx0ZXJzLCBjYWxsYmFjaykge1xuXHRcdFx0aWYoIWNhbGxiYWNrKSB7XG5cdFx0XHRcdGNhbGxiYWNrID0gZmlsdGVycztcblx0XHRcdFx0ZmlsdGVycyA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXHRcdFx0dmFyIGFjdENvbmZpZyA9IGNyZWF0ZU9wZXJhdGlvbkNvbmZpZyhjb25maWcub3BlcmF0aW9ucy5yZWFkT25lQnlJZCwgaWQpO1xuXHRcdFx0ZGlzcGF0Y2hBamF4KGFjdENvbmZpZywgZmlsdGVycywgY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHVwZGF0ZU9uZUJ5SWQoaWQsIG5ld0RhdGEsIGZpbHRlcnMsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZighY2FsbGJhY2spIHtcblx0XHRcdFx0Y2FsbGJhY2sgPSBmaWx0ZXJzO1xuXHRcdFx0XHRmaWx0ZXJzID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0cmVtb3ZlRmllbGRzKG5ld0RhdGEsIGZpZWxkc1RvQmVFeGNsdWRlZCk7XG5cblx0XHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXHRcdFx0dmFyIGFjdENvbmZpZyA9IGNyZWF0ZU9wZXJhdGlvbkNvbmZpZyhjb25maWcub3BlcmF0aW9ucy51cGRhdGVPbmVCeUlkLCBpZCwgbmV3RGF0YSk7XG5cdFx0XHRkaXNwYXRjaEFqYXgoYWN0Q29uZmlnLCBmaWx0ZXJzLCBjYWxsYmFjayk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZGVzdHJveU9uZUJ5SWQoaWQsIGZpbHRlcnMsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZighY2FsbGJhY2spIHtcblx0XHRcdFx0Y2FsbGJhY2sgPSBmaWx0ZXJzO1xuXHRcdFx0XHRmaWx0ZXJzID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cdFx0XHR2YXIgYWN0Q29uZmlnID0gY3JlYXRlT3BlcmF0aW9uQ29uZmlnKGNvbmZpZy5vcGVyYXRpb25zLmRlc3Ryb3lPbmVCeUlkLCBpZCk7XG5cdFx0XHRkaXNwYXRjaEFqYXgoYWN0Q29uZmlnLCBmaWx0ZXJzLCBjYWxsYmFjayk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gY2hlY2tDYWxsYmFjayhjYWxsYmFjaykge1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiLCBcImNhbGxiYWNrIHNob3VsZCBiZSBhIGZ1bmN0aW9uXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3QuZnJlZXplKHtcblx0XHRcdGlkUHJvcGVydHk6IGlkUHJvcGVydHksXG5cdFx0XHRnZW5lcmF0ZUlkOiBnZW5lcmF0ZUlkLFxuXHRcdFx0Y29uZmlnOiBjb25maWcsXG5cblx0XHRcdHJlYWQ6IHJlYWQsXG5cblx0XHRcdGNyZWF0ZU9uZTogY3JlYXRlT25lLFxuXG5cdFx0XHRyZWFkT25lQnlJZDogcmVhZE9uZUJ5SWQsXG5cdFx0XHR1cGRhdGVPbmVCeUlkOiB1cGRhdGVPbmVCeUlkLFxuXHRcdFx0ZGVzdHJveU9uZUJ5SWQ6IGRlc3Ryb3lPbmVCeUlkXG5cdFx0fSk7XG5cdH07XG59OyIsIi8qXG4gKiBBamF4SGVscGVyIGNvcmVcbiAqL1xuXG4vKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGRlZmF1bHRUaW1lb3V0ID0gMzAwMDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZXBlbmRlbmNpZXMpIHtcblxuXHRpZiAoIWRlcGVuZGVuY2llcy5yZXF1ZXN0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGVwZW5kZW5jaWVzLnJlcXVlc3QgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdGlmICghZGVwZW5kZW5jaWVzLmNyZWF0ZVJlYWRlcikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRlcGVuZGVuY2llcy5jcmVhdGVSZWFkZXIgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdHZhciByZXF1ZXN0ID0gZGVwZW5kZW5jaWVzLnJlcXVlc3Q7XG5cdHZhciBjcmVhdGVSZWFkZXIgPSBkZXBlbmRlbmNpZXMuY3JlYXRlUmVhZGVyO1xuXHRcblx0ZnVuY3Rpb24gY3JlYXRlT3BlcmF0aW9uQ29uZmlnKGNvbmZpZywgaWQsIGRhdGEpIHtcblx0XHR2YXIgbmV3Q29uZmlnID0ge307XG5cblx0XHRmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuXHRcdFx0bmV3Q29uZmlnW3Byb3BdID0gY29uZmlnW3Byb3BdO1xuXHRcdH1cblxuXHRcdGlmIChkYXRhKSB7XG5cdFx0XHRuZXdDb25maWcuZGF0YSA9IGRhdGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5ld0NvbmZpZy5kYXRhID0ge307XG5cdFx0fVxuXG5cdFx0bmV3Q29uZmlnLmlkID0gaWQ7XG5cblx0XHRyZXR1cm4gbmV3Q29uZmlnO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hBamF4IChhY3RDb25maWcsIGZpbHRlcnMsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKHR5cGVvZiBhY3RDb25maWcucm91dGUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGFjdENvbmZpZy5yb3V0ZSA9IFthY3RDb25maWcucm91dGVdO1xuXHRcdH1cblx0XHRpZighY2FsbGJhY2spIHtcblx0XHRcdGNhbGxiYWNrID0gZmlsdGVycztcblx0XHRcdGZpbHRlcnMgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHZhciB0aW1lb3V0ID0gYWN0Q29uZmlnLnRpbWVvdXQgfHwgZGVmYXVsdFRpbWVvdXQ7XG5cdFx0dmFyIGlkUHJvcGVydHkgPSBhY3RDb25maWcuaWRQcm9wZXJ0eTtcblxuXHRcdHZhciBhY3RSb3V0ZUlkeCA9IDA7XG5cdFx0dmFyIGFjdFJvdXRlID0gYWN0Q29uZmlnLnJvdXRlW2FjdFJvdXRlSWR4XTtcblxuXHRcdGZ1bmN0aW9uIGRpc3BhdGNoKHJldHJpZXMpIHtcblxuXHRcdFx0aWYoZmlsdGVycykge1xuXHRcdFx0XHRmb3IgKHZhciBmaWx0ZXIgaW4gZmlsdGVycykge1xuXHRcdFx0XHRcdHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCI6XCIgKyBmaWx0ZXIsIFwiZ1wiKTtcblx0XHRcdFx0XHRhY3RSb3V0ZSA9IGFjdFJvdXRlLnJlcGxhY2UocmVnZXgsIGZpbHRlcnNbZmlsdGVyXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHZhciBpZFJlZ2V4ID0gLzppZC9nO1xuXG5cdFx0XHRpZiAoaWRSZWdleC50ZXN0KGFjdFJvdXRlKSkge1xuXHRcdFx0XHRhY3RSb3V0ZSA9IGFjdFJvdXRlLnJlcGxhY2UoaWRSZWdleCwgYWN0Q29uZmlnLmlkKTtcblx0XHRcdH0gZWxzZSBpZiAoYWN0Q29uZmlnLmlkKSB7XG5cdFx0XHRcdGFjdENvbmZpZy5kYXRhW2lkUHJvcGVydHldID0gYWN0Q29uZmlnLmlkO1xuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR2YXIgcmVxID0gcmVxdWVzdFxuXHRcdFx0XHRcdFthY3RDb25maWcubWV0aG9kXShhY3RSb3V0ZSlcblx0XHRcdFx0XHQucXVlcnkoYWN0Q29uZmlnLnF1ZXJpZXMpXG5cdFx0XHRcdFx0LmFjY2VwdChhY3RDb25maWcuYWNjZXB0KVxuXHRcdFx0XHRcdC50aW1lb3V0KHRpbWVvdXQpO1xuXG5cdFx0XHRcdGlmIChhY3RDb25maWcuZm9ybURhdGEgIT09IHRydWUpIHtcblx0XHRcdFx0XHRyZXEudHlwZShhY3RDb25maWcudHlwZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVxXG5cdFx0XHRcdFx0LnNlbmQoYWN0Q29uZmlnLmRhdGEpXG5cdFx0XHRcdFx0LmVuZChmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdFx0XHRpZiAocmV0cmllcyA8IGFjdENvbmZpZy5yb3V0ZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0XHRhY3RSb3V0ZUlkeCArPSAxO1xuXHRcdFx0XHRcdFx0XHRcdGFjdFJvdXRlSWR4ICU9IGFjdENvbmZpZy5yb3V0ZS5sZW5ndGg7XG5cdFx0XHRcdFx0XHRcdFx0YWN0Um91dGUgPSBhY3RDb25maWcucm91dGVbYWN0Um91dGVJZHhdO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBkaXNwYXRjaChyZXRyaWVzICsgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR2YXIgYm9keSA9IGFjdENvbmZpZy5yZWFkZXIucmVhZChyZXN1bHQuYm9keSk7XG5cblx0XHRcdFx0XHRcdGNhbGxiYWNrKGJvZHkuZXJyLCBib2R5KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZGlzcGF0Y2goMCk7XG5cdH1cblxuXHR2YXIgZGVmYXVsdFJlYWRlciA9IGNyZWF0ZVJlYWRlcih7fSk7XG5cblx0ZnVuY3Rpb24gcHJlcGFyZU9wZXJhdGlvbnNDb25maWcoY29uZmlnKSB7XG5cdFx0YXNzZXJ0KHR5cGVvZiBjb25maWcgPT09IFwib2JqZWN0XCIsIFwiY29uZmlnLm9wZXJhdGlvbnMgc2hvdWxkIGJlIGEgY29uZmlnIG9iamVjdFwiKTtcblx0XHRmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuXHRcdFx0dmFyIGFjdCA9IGNvbmZpZ1twcm9wXTtcblx0XHRcdGFzc2VydChhY3QsIHByb3AgKyBcIiBzaG91bGQgYmUgY29uZmlndXJlZFwiKTtcblx0XHRcdGFzc2VydChhY3Qucm91dGUsIHByb3AgKyBcIiByb3V0ZSBzaG91bGQgYmUgY29uZmlndXJlZFwiKTtcblx0XHRcdGFzc2VydChhY3QubWV0aG9kLCBwcm9wICsgXCIgbWV0aG9kIHNob3VsZCBiZSBjb25maWd1cmVkXCIpO1xuXHRcdFx0YWN0Lm1ldGhvZCA9IGFjdC5tZXRob2QudG9Mb3dlckNhc2UoKTtcblx0XHRcdGFjdC5xdWVyaWVzID0gYWN0LnF1ZXJpZXMgfHwge307XG5cdFx0XHRhY3QuYWNjZXB0ID0gYWN0LmFjY2VwdCB8fCBcImFwcGxpY2F0aW9uL2pzb25cIjtcblx0XHRcdGFjdC50eXBlID0gYWN0LnR5cGUgfHwgXCJhcHBsaWNhdGlvbi9qc29uXCI7XG5cdFx0XHRhY3QucmVhZGVyID0gYWN0LnJlYWRlciA/IGFjdC5yZWFkZXIgOiB7fTtcblx0XHRcdGlmIChwcm9wID09PSBcInJlYWRcIikge1xuXHRcdFx0XHRhY3QucmVhZGVyLm91dCA9IFwiaXRlbXNcIjtcblx0XHRcdH1cblx0XHRcdGFjdC5yZWFkZXIgPSBhY3QucmVhZGVyICE9PSB7fSA/IGNyZWF0ZVJlYWRlcihhY3QucmVhZGVyKSA6IGRlZmF1bHRSZWFkZXI7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuXHRcdGlmICghY29uZGl0aW9uKSB7XG5cdFx0XHRtZXNzYWdlID0gbWVzc2FnZSB8fCBcIkFzc2VydGlvbiBmYWlsZWRcIjtcblx0XHRcdGlmICh0eXBlb2YgRXJyb3IgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdFx0dGhyb3cgbWVzc2FnZTsgLy8gRmFsbGJhY2tcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNyZWF0ZU9wZXJhdGlvbkNvbmZpZzogY3JlYXRlT3BlcmF0aW9uQ29uZmlnLFxuXHRcdGRpc3BhdGNoQWpheDogZGlzcGF0Y2hBamF4LFxuXHRcdHByZXBhcmVPcGVyYXRpb25zQ29uZmlnOiBwcmVwYXJlT3BlcmF0aW9uc0NvbmZpZyxcblx0XHRhc3NlcnQ6IGFzc2VydFxuXG5cdH07XG59OyIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vL25vdCB1c2VkIHlldFxuXG52YXIgY3JlYXRlTWVtb3J5UHJveHkgPSByZXF1aXJlKFwiLi9tZW1vcnlcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRGVsYXllZE1lbW9yeVByb3h5KGNvbmZpZykge1xuXHR2YXIgbWVtb3J5UHJveHkgPSBjcmVhdGVNZW1vcnlQcm94eShjb25maWcpO1xuXHR2YXIgZGVsYXkgPSBjb25maWcuZGVsYXkgfHwgMTAwMDtcblxuXHR2YXIgd3JhcHBlciA9IHt9O1xuXG5cdGZ1bmN0aW9uIGFkZFdyYXBwZXJGdW5jdGlvbihuYW1lLCBmdW5jKSB7XG5cdFx0d3JhcHBlcltuYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0fSwgZGVsYXkpO1xuXHRcdH07XG5cdH1cblxuXHRmb3IgKHZhciBwcm9wIGluIG1lbW9yeVByb3h5KSB7XG5cdFx0dmFyIGFjdEZ1bmN0aW9uID0gbWVtb3J5UHJveHlbcHJvcF07XG5cblx0XHRpZiAodHlwZW9mIGFjdEZ1bmN0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGFkZFdyYXBwZXJGdW5jdGlvbihwcm9wLCBhY3RGdW5jdGlvbik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5mcmVlemUod3JhcHBlcik7XG59OyIsIi8vIC8qXG4vLyAgKiBMb2NhbFN0b3JhZ2UgcHJveHkgc2hlbGxcbi8vICAqL1xuXG4vLyAgLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuLy8gIFwidXNlIHN0cmljdFwiO1xuXG52YXIgY3JlYXRlTWVtb3J5UHJveHkgPSByZXF1aXJlKFwiLi9tZW1vcnlcIik7XG52YXIgbG9jYWxTdG9yYWdlQ29yZSA9IHJlcXVpcmUoXCIuL2xvY2FsU3RvcmFnZUNvcmVcIik7XG52YXIgc3RvcmFnZSA9IChmdW5jdGlvbigpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gdmFyIHRlc3REYXRlID0gbmV3IERhdGUoKTtcblx0XHRcdHZhciB0ZXN0RGF0ZSA9IFwiYWRzZmpcIjtcblxuXHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0odGVzdERhdGUsIHRlc3REYXRlKTtcblx0XHRcdHZhciBpc1NhbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0ZXN0RGF0ZSkgPT09IHRlc3REYXRlO1xuXHRcdFx0bG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGVzdERhdGUpO1xuXHRcdFx0cmV0dXJuIGlzU2FtZSAmJiBsb2NhbFN0b3JhZ2U7XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvY2FsU3RvcmFnZUNvcmUoe1xuXHRjcmVhdGVNZW1vcnlQcm94eTogY3JlYXRlTWVtb3J5UHJveHksXG5cdHN0b3JhZ2U6IHN0b3JhZ2Vcbn0pO1xuIiwiLypcbiAqIExvY2FsU3RvcmFnZSBwcm94eSBjb3JlXG4gKi9cblxuIC8qanNsaW50IG5vZGU6IHRydWUgKi9cbiBcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZXBlbmRlbmNpZXMpIHtcblxuXHRpZiAoIWRlcGVuZGVuY2llcy5jcmVhdGVNZW1vcnlQcm94eSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRlcGVuZGVuY2llcy5jcmVhdGVNZW1vcnlQcm94eSBpcyBtYW5kYXRvcnkhXCIpO1xuXHR9XG5cblx0aWYgKCEodHlwZW9mIGRlcGVuZGVuY2llcy5zdG9yYWdlID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBkZXBlbmRlbmNpZXMuc3RvcmFnZSA9PT0gXCJib29sZWFuXCIpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGVwZW5kZW5jaWVzLnN0b3JhZ2UgaXMgbWFuZGF0b3J5IVwiKTtcblx0fVxuXG5cdHZhciBjcmVhdGVNZW1vcnlQcm94eSA9IGRlcGVuZGVuY2llcy5jcmVhdGVNZW1vcnlQcm94eTtcblx0dmFyIHN0b3JhZ2UgPSBkZXBlbmRlbmNpZXMuc3RvcmFnZTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlTG9jYWxTdG9yYWdlUHJveHkoY29uZmlnKSB7XG5cdFx0dmFyIG1lbW9yeVByb3h5ID0gY3JlYXRlTWVtb3J5UHJveHkoY29uZmlnKTtcblx0XHR2YXIgcHJveHlOYW1lID0gY29uZmlnLm5hbWUgfHwgXCJsc1Byb3h5XCI7XG5cblx0XHRpZiAoc3RvcmFnZSkge1xuXHRcdFx0dmFyIGxvY2FsRGF0YSA9IEpTT04ucGFyc2Uoc3RvcmFnZS5nZXRJdGVtKHByb3h5TmFtZSkpO1xuXG5cdFx0XHRpZiAobG9jYWxEYXRhKSB7XG5cdFx0XHRcdGxvY2FsRGF0YS5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0XHRtZW1vcnlQcm94eS5jcmVhdGVPbmUoaXRlbSwgZnVuY3Rpb24oKSB7fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXJGdW5jdGlvbihwcm9wKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gc2F2ZVRvTG9jYWxTdG9yYWdlV3JhcHBlcigpIHtcblx0XHRcdFx0bWVtb3J5UHJveHlbcHJvcF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuXHRcdFx0XHRtZW1vcnlQcm94eS5yZWFkKHt9LCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdHJldHVybiBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0XHRzdG9yYWdlLnNldEl0ZW0ocHJveHlOYW1lLCBKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblx0XHR9XG5cblxuXHRcdHJldHVybiBPYmplY3QuZnJlZXplKHtcblx0XHRcdGlkUHJvcGVydHk6IG1lbW9yeVByb3h5LmlkUHJvcGVydHksXG5cdFx0XHRnZW5lcmF0ZUlkOiBtZW1vcnlQcm94eS5nZW5lcmF0ZUlkLFxuXG5cblx0XHRcdHJlYWQ6IG1lbW9yeVByb3h5LnJlYWQsXG5cblx0XHRcdGNyZWF0ZU9uZTogY3JlYXRlV3JhcHBlckZ1bmN0aW9uKFwiY3JlYXRlT25lXCIpLFxuXG5cdFx0XHRyZWFkT25lQnlJZDogbWVtb3J5UHJveHkucmVhZE9uZUJ5SWQsXG5cdFx0XHR1cGRhdGVPbmVCeUlkOiBjcmVhdGVXcmFwcGVyRnVuY3Rpb24oXCJ1cGRhdGVPbmVCeUlkXCIpLFxuXHRcdFx0ZGVzdHJveU9uZUJ5SWQ6IGNyZWF0ZVdyYXBwZXJGdW5jdGlvbihcImRlc3Ryb3lPbmVCeUlkXCIpXG5cdFx0fSk7XG5cdH07XG59O1xuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZXNzYWdlcyA9IHJlcXVpcmUoXCIuLi9lcnJvck1lc3NhZ2VzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU1lbW9yeVByb3h5KGNvbmZpZykge1xuXHRpZiAoIWNvbmZpZykge1xuXHRcdGNvbmZpZyA9IHt9O1xuXHR9XG5cblx0aWYgKCFjb25maWcuaWRQcm9wZXJ0eSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImNvbmZpZy5pZFByb3BlcnR5IGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHRpZiAoIWNvbmZpZy5pZFR5cGUpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjb25maWcuaWRUeXBlIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHR2YXIgaWRQcm9wZXJ0eSA9IGNvbmZpZy5pZFByb3BlcnR5O1xuXHR2YXIgaWRUeXBlID0gY29uZmlnLmlkVHlwZS50b0xvd2VyQ2FzZSgpO1xuXG5cdHZhciBnZW5lcmF0ZUlkID0gY29uZmlnLmdlbmVyYXRlSWQgfHwgKGZ1bmN0aW9uKCkge1xuXHRcdHZhciBuZXh0SWQgPSAwO1xuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBuZXh0SWQgKz0gMTtcblx0XHR9O1xuXHR9KCkpO1xuXG5cdHZhciBkYiA9IFtdO1xuXG5cdGZ1bmN0aW9uIGZpbmRJbmRleEJ5SWQob3JpZ2luYWxJZCkge1xuXHRcdHZhciBpZCA9IGNhc3RJZChpZFR5cGUsIG9yaWdpbmFsSWQpO1xuXHRcdGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGRiLmxlbmd0aDsgaWR4ICs9IDEpIHtcblx0XHRcdHZhciBhY3QgPSBkYltpZHhdO1xuXHRcdFx0aWYgKGFjdFtpZFByb3BlcnR5XSA9PT0gaWQpIHtcblx0XHRcdFx0cmV0dXJuIGlkeDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHRmdW5jdGlvbiBjYXN0SWQodHlwZSwgaWQpIHtcblx0XHRpZiAodHlwZSA9PT0gdW5kZWZpbmVkIHx8IGlkID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBjb25zb2xlLmxvZyhcIk1pc3NpbmcgY2FzdCBwYXJhbWV0ZXJzXCIpO1xuXHRcdH1cblxuXHRcdHZhciBjYXN0ZWRJZCA9IGlkO1xuXHRcdHN3aXRjaCh0eXBlKSB7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcblx0XHRcdFx0aWYgKHR5cGVvZiBjYXN0ZWRJZCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGNhc3RlZElkID0gY2FzdGVkSWQudG9TdHJpbmcoKTtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGNhc3RlZElkICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBcIklkIFwiICsgaWQgKyBcIiBjb3VsZCBub3QgYmUgcGFyc2VkIGFzIFwiICsgdHlwZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHtcblx0XHRcdFx0aWYgKHR5cGVvZiBjYXN0ZWRJZCAhPT0gXCJudW1iZXJcIikge1xuXHRcdFx0XHRcdGNhc3RlZElkID0gcGFyc2VJbnQoY2FzdGVkSWQpO1xuXHRcdFx0XHRcdGlmIChpc05hTihjYXN0ZWRJZCkpIHtcblx0XHRcdFx0XHRcdHRocm93IFwiSWQgXCIgKyBpZCArIFwiIGNvdWxkIG5vdCBiZSBwYXJzZWQgYXMgXCIgKyB0eXBlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0cmV0dXJuIGNvbnNvbGUubG9nKFwiVW5yZWNvZ25pemVkIGlkIHR5cGVcIiwgdHlwZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjYXN0ZWRJZDtcblx0fVxuXG5cdGZ1bmN0aW9uIGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spIHtcblx0XHRhc3NlcnQodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIsIFwiY2FsbGJhY2sgc2hvdWxkIGJlIGEgZnVuY3Rpb25cIik7XG5cdH1cblxuXHRmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG5cdFx0aWYgKCFjb25kaXRpb24pIHtcblx0XHRcdG1lc3NhZ2UgPSBtZXNzYWdlIHx8IFwiQXNzZXJ0aW9uIGZhaWxlZFwiO1xuXHRcdFx0aWYgKHR5cGVvZiBFcnJvciAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBtZXNzYWdlOyAvLyBGYWxsYmFja1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGFjY2Vzc1Byb3AoaXRlbSwgcHJvcCkge1xuXHRcdHZhciBwcm9wU3BsaXQgPSBwcm9wLnNwbGl0KFwiLlwiKTtcblxuXHRcdGZvcih2YXIgaWR4ID0gMDsgaWR4IDwgcHJvcFNwbGl0Lmxlbmd0aDsgaWR4ICs9IDEpIHtcblx0XHRcdGlmKHR5cGVvZiBpdGVtW3Byb3BTcGxpdFtpZHhdXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRpdGVtID0gaXRlbVtwcm9wU3BsaXRbaWR4XV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbTtcblx0fVxuXG5cdGZ1bmN0aW9uIHJlYWQob3B0aW9ucywgY2FsbGJhY2spIHtcblx0XHRjaGVja0NhbGxiYWNrKGNhbGxiYWNrKTtcblxuXHRcdGlmICghb3B0aW9ucykge1xuXHRcdFx0b3B0aW9ucyA9IHt9O1xuXHRcdH1cblxuXHRcdHZhciBmaW5kID0gb3B0aW9ucy5maW5kO1xuXHRcdHZhciBzb3J0ID0gb3B0aW9ucy5zb3J0O1xuXG5cdFx0dmFyIHNraXAgPSBvcHRpb25zLnNraXA7XG5cdFx0dmFyIGxpbWl0ID0gb3B0aW9ucy5saW1pdDtcblxuXHRcdHZhciBlbGVtZW50cyA9IGRiO1xuXG5cdFx0aWYgKGZpbmQgJiYgdHlwZW9mIGZpbmQgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGVsZW1lbnRzID0gZWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0Zm9yICh2YXIgcHJvcCBpbiBmaW5kKSB7XG5cdFx0XHRcdFx0dmFyIGFjdCA9IGZpbmRbcHJvcF07XG5cblx0XHRcdFx0XHRpdGVtID0gYWNjZXNzUHJvcChpdGVtLCBwcm9wKTtcblxuXHRcdFx0XHRcdGlmICh0eXBlb2YgYWN0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHR2YXIgYWN0U3BsaXQgPSBhY3Quc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRhY3RTcGxpdC5zcGxpY2UoMCwgMSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdHZhciByZWdleHBPcHRpb25zID0gYWN0U3BsaXQuc3BsaWNlKGFjdFNwbGl0Lmxlbmd0aCAtIDEsIDEpO1xuXHRcdFx0XHRcdFx0dmFyIHBhdHRlcm4gPSBhY3RTcGxpdC5qb2luKFwiL1wiKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0YWN0ID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCByZWdleHBPcHRpb25zKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYWN0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdFx0XHRpZiAoIWFjdC50ZXN0KGl0ZW0pKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKGFjdCAhPT0gaXRlbSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChzb3J0ICYmIHR5cGVvZiBzb3J0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRlbGVtZW50cyA9IGVsZW1lbnRzLnNvcnQoZnVuY3Rpb24oaXRlbTEsIGl0ZW0yKSB7XG5cdFx0XHRcdGZvciAodmFyIHByb3AgaW4gc29ydCkge1xuXG5cdFx0XHRcdFx0dmFyIGFjdDEgPSBhY2Nlc3NQcm9wKGl0ZW0xLCBwcm9wKTtcblx0XHRcdFx0XHR2YXIgYWN0MiA9IGFjY2Vzc1Byb3AoaXRlbTIsIHByb3ApO1xuXG5cdFx0XHRcdFx0dmFyIGFjdFJlbGF0aW9uID0gc29ydFtwcm9wXTtcblxuXHRcdFx0XHRcdGlmKGFjdFJlbGF0aW9uID09PSAxKSB7XG5cdFx0XHRcdFx0XHRpZiAoYWN0MSA8IGFjdDIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKGFjdDEgPiBhY3QyKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoYWN0MSA+IGFjdDIpIHtcblx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGFjdDEgPCBhY3QyKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHNraXAgIT09IFwibnVtYmVyXCIgfHwgc2tpcCA8IDApIHtcblx0XHRcdHNraXAgPSAwO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgbGltaXQgIT09IFwibnVtYmVyXCIgfHwgbGltaXQgPCAwKSB7XG5cdFx0XHRsaW1pdCA9IGRiLmxlbmd0aDtcblx0XHR9XG5cblxuXG5cdFx0dmFyIHJlc3BvbnNlID0ge1xuXHRcdFx0aXRlbXM6IGVsZW1lbnRzLnNsaWNlKHNraXAsIHNraXAgKyBsaW1pdCksXG5cdFx0XHRjb3VudDogZWxlbWVudHMubGVuZ3RoXG5cdFx0fTtcblxuXHRcdGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZU9uZShkYXRhLCBjYWxsYmFjaykge1xuXHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXG5cdFx0aWYgKHR5cGVvZiBkYXRhW2lkUHJvcGVydHldID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRkYXRhW2lkUHJvcGVydHldID0gZ2VuZXJhdGVJZCgpO1xuXHRcdH1cblxuXHRcdHZhciBkYXRhSWR4ID0gZmluZEluZGV4QnlJZChkYXRhW2lkUHJvcGVydHldKTtcblxuXHRcdGlmIChkYXRhSWR4ID09PSAtMSkgeyAvL3RoaXMgd2F5IHRoaXMgaXMgYW4gdXBzZXJ0IGFjdHVhbGx5Li4uXG5cdFx0XHRkYi5wdXNoKGRhdGEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkYltkYXRhSWR4XSA9IGRhdGE7XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2sobnVsbCwgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiByZWFkT25lQnlJZChpZCwgY2FsbGJhY2spIHtcblx0XHRjaGVja0NhbGxiYWNrKGNhbGxiYWNrKTtcblxuXHRcdHZhciBkYXRhSWR4ID0gZmluZEluZGV4QnlJZChpZCk7XG5cdFx0aWYgKGRhdGFJZHggPT09IC0xKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobWVzc2FnZXMuZXJyb3JNZXNzYWdlcy5OT1RfRk9VTkQpO1xuXHRcdH1cblx0XHRjYWxsYmFjayhudWxsLCBkYltkYXRhSWR4XSk7XG5cdH1cblxuXHRmdW5jdGlvbiB1cGRhdGVPbmVCeUlkKGlkLCBuZXdEYXRhLCBjYWxsYmFjaykge1xuXHRcdGNoZWNrQ2FsbGJhY2soY2FsbGJhY2spO1xuXG5cdFx0dmFyIGRhdGFJZHggPSBmaW5kSW5kZXhCeUlkKGlkKTtcblx0XHRpZiAoZGF0YUlkeCA9PT0gLTEpIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayhtZXNzYWdlcy5lcnJvck1lc3NhZ2VzLk5PVF9GT1VORCk7XG5cdFx0fVxuXG5cdFx0bmV3RGF0YVtpZFByb3BlcnR5XSA9IGlkO1xuXHRcdGRiW2RhdGFJZHhdID0gbmV3RGF0YTtcblxuXHRcdGNhbGxiYWNrKG51bGwsIG5ld0RhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVzdHJveU9uZUJ5SWQoaWQsIGNhbGxiYWNrKSB7XG5cdFx0Y2hlY2tDYWxsYmFjayhjYWxsYmFjayk7XG5cblx0XHR2YXIgZGF0YUlkeCA9IGZpbmRJbmRleEJ5SWQoaWQpO1xuXHRcdGlmIChkYXRhSWR4ID09PSAtMSkge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG1lc3NhZ2VzLmVycm9yTWVzc2FnZXMuTk9UX0ZPVU5EKTtcblx0XHR9XG5cblx0XHR2YXIgZGF0YSA9IGRiLnNwbGljZShkYXRhSWR4LCAxKTtcblxuXHRcdGNhbGxiYWNrKG51bGwsIGRhdGFbMF0pO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5mcmVlemUoe1xuXHRcdGlkUHJvcGVydHk6IGlkUHJvcGVydHksXG5cdFx0Z2VuZXJhdGVJZDogZ2VuZXJhdGVJZCxcblxuXG5cdFx0cmVhZDogcmVhZCxcblxuXHRcdGNyZWF0ZU9uZTogY3JlYXRlT25lLFxuXG5cdFx0cmVhZE9uZUJ5SWQ6IHJlYWRPbmVCeUlkLFxuXHRcdHVwZGF0ZU9uZUJ5SWQ6IHVwZGF0ZU9uZUJ5SWQsXG5cdFx0ZGVzdHJveU9uZUJ5SWQ6IGRlc3Ryb3lPbmVCeUlkXG5cdH0pO1xufTtcbiIsInZhciBjcmVhdGVBamF4UHJveHkgPSByZXF1aXJlKFwiLi9hamF4XCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVJlc3RQcm94eShjb25maWcpIHtcblxuXHRpZiAoIWNvbmZpZykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImNvbmZpZyBpcyBtYW5kYXRvcnlcIik7XG5cdH1cblxuXHRpZiAoIWNvbmZpZy5yb3V0ZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImNvbmZpZy5yb3V0ZSBpcyBtYW5kYXRvcnlcIik7XG5cdH1cblxuXHRpZiAodHlwZW9mIGNvbmZpZy5yb3V0ZSAhPT0gXCJzdHJpbmdcIiAmJlx0Y29uZmlnLnJvdXRlLmNvbnN0cnVjdG9yICE9PSBBcnJheSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImNvbmZpZy5yb3V0ZSBtdXN0IGJlIGVpdGhlciBzdHJpbmcgb3IgYXJyYXlcIik7XG5cdH1cblxuXHR2YXIgcXVlcmllcyA9IGNvbmZpZy5xdWVyaWVzIHx8IHt9O1xuXG5cdHZhciByZWFkUXVlcnkgPSBxdWVyaWVzLnJlYWQgfHwge307XG5cdHZhciBjcmVhdGVPbmVRdWVyeSA9IHF1ZXJpZXMuY3JlYXRlT25lIHx8IHt9O1xuXHR2YXIgcmVhZE9uZUJ5SWRRdWVyeSA9IHF1ZXJpZXMucmVhZE9uZUJ5SWQgfHwge307XG5cdHZhciB1cGRhdGVPbmVCeUlkUXVlcnkgPSBxdWVyaWVzLnVwZGF0ZU9uZUJ5SWQgfHwge307XG5cdHZhciBkZXN0cm95T25lQnlJZFF1ZXJ5ID0gcXVlcmllcy5kZXN0cm95T25lQnlJZCB8fCB7fTtcblxuXHR2YXIgcm91dGUgPSBjb25maWcucm91dGU7XG5cblx0ZnVuY3Rpb24gYWRkSWQocm91dGUpIHtcblx0XHR2YXIgbmV3Um91dGU7XG5cblx0XHRpZiAodHlwZW9mIHJvdXRlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRuZXdSb3V0ZSA9IFtyb3V0ZV07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5ld1JvdXRlID0gcm91dGUuc2xpY2UoMCk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBuZXdSb3V0ZS5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0bmV3Um91dGVbaV0gKz0gXCIvOmlkXCI7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ld1JvdXRlO1xuXHR9XG5cblx0dmFyIHJlc3RQcm94eSA9IGNyZWF0ZUFqYXhQcm94eSh7XG5cdFx0aWRQcm9wZXJ0eTogY29uZmlnLmlkUHJvcGVydHksXG5cdFx0aWRUeXBlOiBjb25maWcuaWRUeXBlLFxuXHRcdHRpbWVvdXQ6IGNvbmZpZy50aW1lb3V0LFxuXHRcdG9wZXJhdGlvbnM6IHtcblx0XHRcdHJlYWQ6IHtcblx0XHRcdFx0cm91dGU6IHJvdXRlLFxuXHRcdFx0XHRtZXRob2Q6IFwiR0VUXCIsXG5cdFx0XHRcdHJlYWRlcjogY29uZmlnLnJlYWRlcixcblx0XHRcdFx0cXVlcmllczogcmVhZFF1ZXJ5XG5cdFx0XHR9LFxuXHRcdFx0Y3JlYXRlT25lOiB7XG5cdFx0XHRcdHJvdXRlOiByb3V0ZSxcblx0XHRcdFx0bWV0aG9kOiBcIlBPU1RcIixcblx0XHRcdFx0cXVlcmllczogY3JlYXRlT25lUXVlcnlcblx0XHRcdH0sXG5cdFx0XHRyZWFkT25lQnlJZDoge1xuXHRcdFx0XHRyb3V0ZTogYWRkSWQocm91dGUpLFxuXHRcdFx0XHRtZXRob2Q6IFwiR0VUXCIsXG5cdFx0XHRcdHF1ZXJpZXM6IHJlYWRPbmVCeUlkUXVlcnlcblx0XHRcdH0sXG5cdFx0XHR1cGRhdGVPbmVCeUlkOiB7XG5cdFx0XHRcdHJvdXRlOiBhZGRJZChyb3V0ZSksXG5cdFx0XHRcdG1ldGhvZDogXCJQVVRcIixcblx0XHRcdFx0cXVlcmllczogdXBkYXRlT25lQnlJZFF1ZXJ5XG5cdFx0XHR9LFxuXHRcdFx0ZGVzdHJveU9uZUJ5SWQ6IHtcblx0XHRcdFx0cm91dGU6IGFkZElkKHJvdXRlKSxcblx0XHRcdFx0bWV0aG9kOiBcIkRFTEVURVwiLFxuXHRcdFx0XHRxdWVyaWVzOiBkZXN0cm95T25lQnlJZFF1ZXJ5XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gcmVzdFByb3h5O1xufTtcbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZVJlYWRlcihjb25maWcpIHtcblxuXHRpZiAoIWNvbmZpZykge1xuXHRcdHRocm93IFwiSlNPTiBSRUFERVI6IHBsZWFzZSBwcm92aWRlIGEgY29uZmlnIG9iamVjdFwiO1xuXHR9XG5cblx0aWYgKChjb25maWcgJiYgKGNvbmZpZy5zdWNjZXNzIHx8IGNvbmZpZy5tZXNzYWdlIHx8IGNvbmZpZy5jb3VudCkgJiYgIShjb25maWcucm9vdCB8fCBjb25maWcucmVjb3JkKSkpIHtcblx0XHR0aHJvdyBcIkpTT04gUkVBREVSOiBJZiBzdWNjZXNzLCBtZXNzYWdlLCBvciBjb3VudCBwcmVzZW50LCByb290IG9yIHJlY29yZCBtdXN0IGJlIHNwZWNpZmllZCFcIjtcblx0fVxuXG5cdHZhciByZWNvcmRQcm9wICA9IGNvbmZpZy5yZWNvcmQ7XG5cdHZhciByb290XHRcdD0gY29uZmlnLnJvb3Q7XG5cdHZhciBjb3VudFByb3BcdD0gY29uZmlnLmNvdW50O1xuXHR2YXIgc3VjY2Vzc1Byb3AgPSBjb25maWcuc3VjY2Vzcztcblx0dmFyIG1lc3NhZ2VQcm9wID0gY29uZmlnLm1lc3NhZ2U7XG5cdHZhciBlcnJQcm9wICAgICA9IGNvbmZpZy5lcnIgfHwgXCJlcnJcIjtcblx0dmFyIG91dFByb3BcdFx0PSBjb25maWcub3V0O1xuXG5cdGZ1bmN0aW9uIHJlYWQocmVzcG9uc2UpIHtcblxuXHRcdHZhciByb290RGF0YSA9ICFyb290ID8gcmVzcG9uc2UgOiByZXNwb25zZVtyb290XTtcblxuXHRcdHZhciBkYXRhID0ge307XG5cblx0XHRpZiAob3V0UHJvcCkge1xuXHRcdFx0ZGF0YVtvdXRQcm9wXSA9IHJlY29yZFByb3AgPyByb290RGF0YVtyZWNvcmRQcm9wXSA6IHJvb3REYXRhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkYXRhID0gcmVjb3JkUHJvcCA/IHJvb3REYXRhW3JlY29yZFByb3BdIDogcm9vdERhdGE7XG5cdFx0fVxuXG5cdFx0aWYgKGNvdW50UHJvcCkge1xuXHRcdFx0ZGF0YS5jb3VudCA9IHJlc3BvbnNlW2NvdW50UHJvcF07XG5cdFx0fVxuXG5cdFx0aWYgKHN1Y2Nlc3NQcm9wKSB7XG5cdFx0XHRkYXRhLnN1Y2Nlc3MgPSByZXNwb25zZVtzdWNjZXNzUHJvcF07XG5cdFx0fVxuXG5cdFx0aWYgKG1lc3NhZ2VQcm9wKSB7XG5cdFx0XHRkYXRhLm1lc3NhZ2UgPSByZXNwb25zZVttZXNzYWdlUHJvcF07XG5cdFx0fVxuXG5cdFx0aWYgKGVyclByb3ApIHtcblx0XHRcdGlmIChyZXNwb25zZVtlcnJQcm9wXSkge1xuXHRcdFx0XHRkYXRhLmVyciA9IHJlc3BvbnNlW2VyclByb3BdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5mcmVlemUoe1xuXHRcdHJlYWQ6IHJlYWRcblx0fSk7XG59O1xuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjcmVhdGVQcm9wID0gcmVxdWlyZShcIi4uL21vZGVsL3Byb3BcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlU3RvcmUob3B0aW9ucykge1xuXHRpZiAoIW9wdGlvbnMpIHtcblx0XHRvcHRpb25zID0ge307XG5cdH1cblxuXHRpZiAoIW9wdGlvbnMubW9kZWwpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLm1vZGVsIGlzIG1hbmRhdG9yeSFcIik7XG5cdH1cblxuXHR2YXIgbW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuXHR2YXIgcHJveHkgPSBtb2RlbC5wcm94eTtcblxuXHQvL3ZhciBhdXRvTG9hZDtcblx0Ly92YXIgYXV0b1N5bmM7XG5cblxuXHR2YXIgc3RvcmUgPSB7XG5cdFx0Ly9kYXRhOiBkYXRhLFxuXHRcdG1vZGVsOiBtb2RlbCxcblx0XHRwcm94eTogcHJveHksXG5cblx0XHRpdGVtczogW10sXG5cdFx0Y291bnQ6IDAsXG5cblx0XHRsb2FkOiBsb2FkLFxuXHRcdGFkZDogYWRkXG5cdH07XG5cblx0dmFyIHRyaWdnZXJRdWVyeUNoYW5nZWQgPSAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHF1ZXJ5Q2hhbmdlZCA9IG51bGw7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIHRyaWdnZXJRdWVyeUNoYW5nZWQoKSB7XG5cdFx0XHRpZiAocXVlcnlDaGFuZ2VkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0cXVlcnlDaGFuZ2VkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0cXVlcnlDaGFuZ2VkID0gbnVsbDtcblx0XHRcdFx0bG9hZCgpO1xuXHRcdFx0fSwgMCk7XG5cdFx0fTtcblx0fSgpKTtcblxuXHQvL21heWJlIHRoZXNlIHNob3VsZCBiZSBvbiBhIHNlcGFyYXRlIHF1ZXJ5IG9iamVjdC5cblx0Y3JlYXRlUHJvcChzdG9yZSwgXCJmaW5kXCIsIHtcblx0XHQvL2xhc3RWYWx1ZSwgdmFsdWUsIG5ld1ZhbHVlLCBpbml0aWFsVmFsdWVcblx0XHR2YWx1ZTogb3B0aW9ucy5maW5kIHx8IHt9LFxuXHRcdGJlZm9yZUNoYW5nZTogZnVuY3Rpb24oKSB7XG5cblx0XHR9LFxuXHRcdGFmdGVyQ2hhbmdlOiB0cmlnZ2VyUXVlcnlDaGFuZ2VkXG5cdH0pO1xuXG5cdC8vYWxzbywgZmluZCBhbmQgc29ydCBwcm9wZXJ0aWVzIGFyZSBub3QgdmVyeSBnb29kIGFzIHNpbXBsZSBwcm9wcy4uLiBUaGV5IHNob3VsZCBiZSBcInByb3BPYmplY3RzXCIgb3Igc29tZXRoaW5nLi4uXG5cdC8vdGhhdCB3YXkgdGhlaXIgZmllbGRzJyBjaGFuZ2VzIHdvdWxkIGJlIHRyaWdnZXJlZCBhcyB3ZWxsLlxuXHRjcmVhdGVQcm9wKHN0b3JlLCBcInNvcnRcIiwge1xuXHRcdHZhbHVlOiBvcHRpb25zLnNvcnQgfHwge2lkOiAtMX0sXG5cdFx0YmVmb3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcblx0XHR9LFxuXHRcdGFmdGVyQ2hhbmdlOiB0cmlnZ2VyUXVlcnlDaGFuZ2VkXG5cdH0pO1xuXG5cdGNyZWF0ZVByb3Aoc3RvcmUsIFwic2tpcFwiLCB7XG5cdFx0dmFsdWU6IG9wdGlvbnMuc2tpcCB8fCAwLFxuXHRcdGJlZm9yZUNoYW5nZTogZnVuY3Rpb24oKSB7XG5cblx0XHR9LFxuXHRcdGFmdGVyQ2hhbmdlOiB0cmlnZ2VyUXVlcnlDaGFuZ2VkXG5cdH0pO1xuXG5cdGNyZWF0ZVByb3Aoc3RvcmUsIFwibGltaXRcIiwge1xuXHRcdHZhbHVlOiBvcHRpb25zLmxpbWl0IHx8IDEwLFxuXHRcdGJlZm9yZUNoYW5nZTogZnVuY3Rpb24oKSB7XG5cblx0XHR9LFxuXHRcdGFmdGVyQ2hhbmdlOiB0cmlnZ2VyUXVlcnlDaGFuZ2VkXG5cdH0pO1xuXG5cblxuXHQvL3ZhciBncm91cCA9IFwiP2dvb2QgcXVlc3Rpb24/XCI7XG5cblx0Ly92YXIgYnVmZmVyZWQ7XG5cblx0Ly92YXIgcmVtb3RlRmlsdGVyO1xuXHQvL3ZhciByZW1vdGVHcm91cDtcblx0Ly92YXIgcmVtb3RlU29ydDtcblxuXG5cdC8vdmFyIGFjdFBhZ2UgPSBvcHRpb25zLmFjdFBhZ2UgfHwgMDtcblx0Ly92YXIgbnVtT2ZJdGVtcyA9IDA7XG5cdC8vdmFyIG51bU9mUGFnZXMgPSAwO1xuXG5cdC8vbW9kZWwgaW5zdGFuY2VzIHNob3VsZCBiZSBzdG9yZWQgc29tZXdoZXJlIGJ5IGlkIGFzIHdlbGwuXG5cdC8vaW4gdGhlIGRhdGEgYXJyYXksIHRoZXJlIHNob3VsZCBiZSByZWZlcmVuY2VzIHRvIHRob3NlIGluc3RhbmNlcy4uLiBhbHRob3VnaCBpdCB3b3VsZCBiZSBjb21wbGljYXRlZCB3aGVuIGxvYWRlZCBmcm9tIGxvY2FsU3RvcmFnZS5cblx0Ly9tYXliZSB3ZSBzaG91bGQgc3RvcmUgb25seSB0aGUgaWQtcyBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGRhdGEgYXJyYXkuLi5cblx0Ly92YXIgcHJlZmV0Y2hlZERhdGEgPSB7XG5cdC8vXHRcIntzb3J0ZXJzOiB7aWQ6IDF9LCBmaWx0ZXJzOiB7fVwiOiBbe3NraXA6IDAsIGlkczogW119XVxuXHQvL307XG5cdC8vdmFyIHByZWZldGNoZWREYXRhU3RvcmFnZSA9IFtdO1xuXG5cdC8vZnVuY3Rpb24gZ2V0RGF0YSgpIHtcblx0Ly9cdHJldHVybiBwcmVmZXRjaGVkRGF0YVtjdXJyZW50UGFnZV0uZGF0YTtcblx0Ly99XG5cblxuXHQvL3NraXAgYW5kIGxpbWl0IHNob3VsZCBiZSBwcm9wZXJ0aWVzIGFzIHdlbGxcblx0Ly9pZiBza2lwLCBsaW1pdCwgZmluZCBvciBzb3J0IGNoYW5nZXMsIHRoZW4gdGhlIGxvYWQgbWV0aG9kIHNob3VsZCBiZSBjYWxsZWQgYXV0b21hdGljYWxseS5cblxuXG5cdC8vZXZlcnkgbG9hZCBjYWxsIHNob3VsZCBoYXZlIGFuIGlkLlxuXHQvL3RoaXMgd2F5IHdlIGNhbiBzZXQgdXBcblx0ZnVuY3Rpb24gcXVlcnkocXVlcnlPYmosIGNhbGxiYWNrKSB7XG5cdFx0bW9kZWwubGlzdChxdWVyeU9iaiwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcblx0XHRcdGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGxvYWQoKSB7XG5cdFx0dmFyIHF1ZXJ5T2JqID0ge1xuXHRcdFx0ZmluZDogc3RvcmUuZmluZCxcblx0XHRcdHNvcnQ6IHN0b3JlLnNvcnQsXG5cdFx0XHRza2lwOiBzdG9yZS5za2lwLFxuXHRcdFx0bGltaXQ6IHN0b3JlLmxpbWl0XG5cdFx0fTtcblxuXHRcdGxvYWQuYmVmb3JlKHF1ZXJ5T2JqKTtcblxuXHRcdHF1ZXJ5KHF1ZXJ5T2JqLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuXHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRyZXR1cm4gbG9hZC5hZnRlcihlcnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdG9yZS5pdGVtcy5sZW5ndGggPSAwO1xuXHRcdFx0c3RvcmUuaXRlbXMubGVuZ3RoID0gcmVzdWx0Lml0ZW1zLmxlbmd0aDtcblx0XHRcdGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IHJlc3VsdC5pdGVtcy5sZW5ndGg7IGlkeCArPSAxKSB7XG5cdFx0XHRcdHN0b3JlLml0ZW1zW2lkeF0gPSByZXN1bHQuaXRlbXNbaWR4XTtcblx0XHRcdH1cblx0XHRcdHN0b3JlLmNvdW50ID0gcmVzdWx0LmNvdW50O1xuXG5cdFx0XHRsb2FkLmFmdGVyKG51bGwsIHJlc3VsdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRsb2FkLmJlZm9yZSA9IGNyZWF0ZUNhbGxiYWNrQXJyYXlDYWxsZXIoc3RvcmUsIFtdKTsgLy9sYXRlciB3ZSBjYW4gYWRkIGRlZmF1bHQgY2FsbGJhY2tzXG5cdGxvYWQuYWZ0ZXIgPSBjcmVhdGVDYWxsYmFja0FycmF5Q2FsbGVyKHN0b3JlLCBbXSk7XG5cblx0ZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2tBcnJheUNhbGxlcih0aGlzQXJnLCBhcnJheSkge1xuXHRcdGZ1bmN0aW9uIGNhbGxiYWNrQXJyYXlDYWxsZXIoZXJyKSB7XG5cdFx0XHRhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGFjdEZ1bmN0aW9uKSB7XG5cdFx0XHRcdGFjdEZ1bmN0aW9uLmNhbGwodGhpc0FyZywgZXJyKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGNhbGxiYWNrQXJyYXlDYWxsZXIuYWRkID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdFx0aWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRhcnJheS5wdXNoKGZ1bmMpO1xuXHRcdH07XG5cblx0XHRjYWxsYmFja0FycmF5Q2FsbGVyLnJlbW92ZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcblx0XHRcdHZhciBpZHggPSBhcnJheS5pbmRleE9mKGZ1bmMpO1xuXG5cdFx0XHRpZiAoaWR4ID4gLTEpIHtcblx0XHRcdFx0YXJyYXkuc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiBjYWxsYmFja0FycmF5Q2FsbGVyO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBhZGQoZGF0YSwgY2FsbGJhY2spIHtcblx0XHRtb2RlbC5jcmVhdGUoZGF0YSwgY2FsbGJhY2spO1xuXHR9XG5cblxuXG5cblx0cmV0dXJuIHN0b3JlO1xufTsiLCIvKmpzbGludCBub2RlOiB0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW9yeVByb3h5ID0gcmVxdWlyZShcIi4vcHJveHkvbWVtb3J5XCIpO1xudmFyIGxvY2FsU3RvcmFnZVByb3h5ID0gcmVxdWlyZShcIi4vcHJveHkvbG9jYWxTdG9yYWdlXCIpO1xudmFyIHJlc3RQcm94eSA9IHJlcXVpcmUoXCIuL3Byb3h5L3Jlc3RcIik7XG52YXIgYWpheFByb3h5ID0gcmVxdWlyZShcIi4vcHJveHkvYWpheFwiKTtcbnZhciBkZWxheWVkTWVtb3J5UHJveHkgPSByZXF1aXJlKFwiLi9wcm94eS9kZWxheWVkTWVtb3J5XCIpO1xudmFyIHN0b3JlID0gcmVxdWlyZShcIi4vc3RvcmUvc3RvcmVcIik7XG52YXIgbW9kZWwgPSByZXF1aXJlKFwiLi9tb2RlbC9tb2RlbFwiKTtcbnZhciBqc29uUmVhZGVyID0gcmVxdWlyZShcIi4vcmVhZGVyL2pzb25cIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRwcm94eToge1xuXHRcdG1lbW9yeTogbWVtb3J5UHJveHksXG5cdFx0bG9jYWxTdG9yYWdlOiBsb2NhbFN0b3JhZ2VQcm94eSxcblx0XHRyZXN0OiByZXN0UHJveHksXG5cdFx0YWpheDogYWpheFByb3h5LFxuXHRcdGRlbGF5ZWRNZW1vcnk6IGRlbGF5ZWRNZW1vcnlQcm94eVxuXHR9LFxuXHRtb2RlbDoge1xuXHRcdG1vZGVsOiBtb2RlbFxuXHR9LFxuXHRzdG9yZToge1xuXHRcdHN0b3JlOiBzdG9yZVxuXHR9LFxuXHRyZWFkZXI6IHtcblx0XHRqc29uOiBqc29uUmVhZGVyXG5cdH1cbn07XG4iXX0=
