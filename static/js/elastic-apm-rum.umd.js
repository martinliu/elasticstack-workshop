(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["elastic-apm-rum"] = factory();
	else
		root["elastic-apm-rum"] = factory();
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../rum-core/dist/es/bootstrap.js":
/*!****************************************!*\
  !*** ../rum-core/dist/es/bootstrap.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bootstrap": function() { return /* binding */ bootstrap; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_patching__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/patching */ "../rum-core/dist/es/common/patching/index.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./state */ "../rum-core/dist/es/state.js");



var enabled = false;
function bootstrap() {
  if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.isPlatformSupported)()) {
    (0,_common_patching__WEBPACK_IMPORTED_MODULE_1__.patchAll)();
    _state__WEBPACK_IMPORTED_MODULE_2__.state.bootstrapTime = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.now)();
    enabled = true;
  } else if (_common_utils__WEBPACK_IMPORTED_MODULE_0__.isBrowser) {
    console.log('[Elastic APM] platform is not supported!');
  }

  return enabled;
}

/***/ }),

/***/ "../rum-core/dist/es/common/after-frame.js":
/*!*************************************************!*\
  !*** ../rum-core/dist/es/common/after-frame.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ afterFrame; }
/* harmony export */ });
var RAF_TIMEOUT = 100;
function afterFrame(callback) {
  var handler = function handler() {
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    setTimeout(callback);
  };

  var timeout = setTimeout(handler, RAF_TIMEOUT);
  var raf = requestAnimationFrame(handler);
}

/***/ }),

/***/ "../rum-core/dist/es/common/apm-server.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/common/apm-server.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _queue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./queue */ "../rum-core/dist/es/common/queue.js");
/* harmony import */ var _throttle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./throttle */ "../rum-core/dist/es/common/throttle.js");
/* harmony import */ var _ndjson__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ndjson */ "../rum-core/dist/es/common/ndjson.js");
/* harmony import */ var _truncate__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./truncate */ "../rum-core/dist/es/common/truncate.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _compress__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./compress */ "../rum-core/dist/es/common/compress.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _http_fetch__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./http/fetch */ "../rum-core/dist/es/common/http/fetch.js");
/* harmony import */ var _http_xhr__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./http/xhr */ "../rum-core/dist/es/common/http/xhr.js");











var THROTTLE_INTERVAL = 60000;

var ApmServer = function () {
  function ApmServer(configService, loggingService) {
    this._configService = configService;
    this._loggingService = loggingService;
    this.queue = undefined;
    this.throttleEvents = _utils__WEBPACK_IMPORTED_MODULE_0__.noop;
  }

  var _proto = ApmServer.prototype;

  _proto.init = function init() {
    var _this = this;

    var queueLimit = this._configService.get('queueLimit');

    var flushInterval = this._configService.get('flushInterval');

    var limit = this._configService.get('eventsLimit');

    var onFlush = function onFlush(events) {
      var promise = _this.sendEvents(events);

      if (promise) {
        promise.catch(function (reason) {
          _this._loggingService.warn('Failed sending events!', _this._constructError(reason));
        });
      }
    };

    this.queue = new _queue__WEBPACK_IMPORTED_MODULE_1__.default(onFlush, {
      queueLimit: queueLimit,
      flushInterval: flushInterval
    });
    this.throttleEvents = (0,_throttle__WEBPACK_IMPORTED_MODULE_2__.default)(this.queue.add.bind(this.queue), function () {
      return _this._loggingService.warn('Dropped events due to throttling!');
    }, {
      limit: limit,
      interval: THROTTLE_INTERVAL
    });

    this._configService.observeEvent(_constants__WEBPACK_IMPORTED_MODULE_3__.QUEUE_FLUSH, function () {
      _this.queue.flush();
    });
  };

  _proto._postJson = function _postJson(endPoint, payload) {
    var _this2 = this;

    var headers = {
      'Content-Type': 'application/x-ndjson'
    };

    var apmRequest = this._configService.get('apmRequest');

    var params = {
      payload: payload,
      headers: headers,
      beforeSend: apmRequest
    };
    return (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressPayload)(params).catch(function (error) {
      if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
        _this2._loggingService.debug('Compressing the payload using CompressionStream API failed', error.message);
      }

      return params;
    }).then(function (result) {
      return _this2._makeHttpRequest('POST', endPoint, result);
    }).then(function (_ref) {
      var responseText = _ref.responseText;
      return responseText;
    });
  };

  _proto._constructError = function _constructError(reason) {
    var url = reason.url,
        status = reason.status,
        responseText = reason.responseText;

    if (typeof status == 'undefined') {
      return reason;
    }

    var message = url + ' HTTP status: ' + status;

    if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__ && responseText) {
      try {
        var serverErrors = [];
        var response = JSON.parse(responseText);

        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(function (err) {
            return serverErrors.push(err.message);
          });
          message += ' ' + serverErrors.join(',');
        }
      } catch (e) {
        this._loggingService.debug('Error parsing response from APM server', e);
      }
    }

    return new Error(message);
  };

  _proto._makeHttpRequest = function _makeHttpRequest(method, url, _temp) {
    var _ref2 = _temp === void 0 ? {} : _temp,
        _ref2$timeout = _ref2.timeout,
        timeout = _ref2$timeout === void 0 ? _constants__WEBPACK_IMPORTED_MODULE_3__.HTTP_REQUEST_TIMEOUT : _ref2$timeout,
        payload = _ref2.payload,
        headers = _ref2.headers,
        beforeSend = _ref2.beforeSend;

    if (!beforeSend && (0,_http_fetch__WEBPACK_IMPORTED_MODULE_6__.shouldUseFetchWithKeepAlive)(method, payload)) {
      return (0,_http_fetch__WEBPACK_IMPORTED_MODULE_6__.sendFetchRequest)(method, url, {
        keepalive: true,
        timeout: timeout,
        payload: payload,
        headers: headers
      }).catch(function (reason) {
        if (reason instanceof TypeError) {
          return (0,_http_xhr__WEBPACK_IMPORTED_MODULE_7__.sendXHR)(method, url, {
            timeout: timeout,
            payload: payload,
            headers: headers,
            beforeSend: beforeSend
          });
        }

        throw reason;
      });
    }

    return (0,_http_xhr__WEBPACK_IMPORTED_MODULE_7__.sendXHR)(method, url, {
      timeout: timeout,
      payload: payload,
      headers: headers,
      beforeSend: beforeSend
    });
  };

  _proto.fetchConfig = function fetchConfig(serviceName, environment) {
    var _this3 = this;

    var _this$getEndpoints = this.getEndpoints(),
        configEndpoint = _this$getEndpoints.configEndpoint;

    if (!serviceName) {
      return _polyfills__WEBPACK_IMPORTED_MODULE_8__.Promise.reject('serviceName is required for fetching central config.');
    }

    configEndpoint += "?service.name=" + serviceName;

    if (environment) {
      configEndpoint += "&service.environment=" + environment;
    }

    var localConfig = this._configService.getLocalConfig();

    if (localConfig) {
      configEndpoint += "&ifnonematch=" + localConfig.etag;
    }

    var apmRequest = this._configService.get('apmRequest');

    return this._makeHttpRequest('GET', configEndpoint, {
      timeout: 5000,
      beforeSend: apmRequest
    }).then(function (xhr) {
      var status = xhr.status,
          responseText = xhr.responseText;

      if (status === 304) {
        return localConfig;
      } else {
        var remoteConfig = JSON.parse(responseText);
        var etag = xhr.getResponseHeader('etag');

        if (etag) {
          remoteConfig.etag = etag.replace(/["]/g, '');

          _this3._configService.setLocalConfig(remoteConfig, true);
        }

        return remoteConfig;
      }
    }).catch(function (reason) {
      var error = _this3._constructError(reason);

      return _polyfills__WEBPACK_IMPORTED_MODULE_8__.Promise.reject(error);
    });
  };

  _proto.createMetaData = function createMetaData() {
    var cfg = this._configService;
    var metadata = {
      service: {
        name: cfg.get('serviceName'),
        version: cfg.get('serviceVersion'),
        agent: {
          name: 'rum-js',
          version: cfg.version
        },
        language: {
          name: 'javascript'
        },
        environment: cfg.get('environment')
      },
      labels: cfg.get('context.tags')
    };
    return (0,_truncate__WEBPACK_IMPORTED_MODULE_9__.truncateModel)(_truncate__WEBPACK_IMPORTED_MODULE_9__.METADATA_MODEL, metadata);
  };

  _proto.addError = function addError(error) {
    var _this$throttleEvents;

    this.throttleEvents((_this$throttleEvents = {}, _this$throttleEvents[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS] = error, _this$throttleEvents));
  };

  _proto.addTransaction = function addTransaction(transaction) {
    var _this$throttleEvents2;

    this.throttleEvents((_this$throttleEvents2 = {}, _this$throttleEvents2[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS] = transaction, _this$throttleEvents2));
  };

  _proto.ndjsonErrors = function ndjsonErrors(errors, compress) {
    var key = compress ? 'e' : 'error';
    return errors.map(function (error) {
      var _NDJSON$stringify;

      return _ndjson__WEBPACK_IMPORTED_MODULE_10__.default.stringify((_NDJSON$stringify = {}, _NDJSON$stringify[key] = compress ? (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressError)(error) : error, _NDJSON$stringify));
    });
  };

  _proto.ndjsonMetricsets = function ndjsonMetricsets(metricsets) {
    return metricsets.map(function (metricset) {
      return _ndjson__WEBPACK_IMPORTED_MODULE_10__.default.stringify({
        metricset: metricset
      });
    }).join('');
  };

  _proto.ndjsonTransactions = function ndjsonTransactions(transactions, compress) {
    var _this4 = this;

    var key = compress ? 'x' : 'transaction';
    return transactions.map(function (tr) {
      var _NDJSON$stringify2;

      var spans = '',
          breakdowns = '';

      if (!compress) {
        if (tr.spans) {
          spans = tr.spans.map(function (span) {
            return _ndjson__WEBPACK_IMPORTED_MODULE_10__.default.stringify({
              span: span
            });
          }).join('');
          delete tr.spans;
        }

        if (tr.breakdown) {
          breakdowns = _this4.ndjsonMetricsets(tr.breakdown);
          delete tr.breakdown;
        }
      }

      return _ndjson__WEBPACK_IMPORTED_MODULE_10__.default.stringify((_NDJSON$stringify2 = {}, _NDJSON$stringify2[key] = compress ? (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressTransaction)(tr) : tr, _NDJSON$stringify2)) + spans + breakdowns;
    });
  };

  _proto.sendEvents = function sendEvents(events) {
    var _payload, _NDJSON$stringify3;

    if (events.length === 0) {
      return;
    }

    var transactions = [];
    var errors = [];

    for (var i = 0; i < events.length; i++) {
      var event = events[i];

      if (event[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS]) {
        transactions.push(event[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS]);
      }

      if (event[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS]) {
        errors.push(event[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS]);
      }
    }

    if (transactions.length === 0 && errors.length === 0) {
      return;
    }

    var cfg = this._configService;
    var payload = (_payload = {}, _payload[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS] = transactions, _payload[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS] = errors, _payload);
    var filteredPayload = cfg.applyFilters(payload);

    if (!filteredPayload) {
      this._loggingService.warn('Dropped payload due to filtering!');

      return;
    }

    var apiVersion = cfg.get('apiVersion');
    var compress = apiVersion > 2;
    var ndjson = [];
    var metadata = this.createMetaData();
    var metadataKey = compress ? 'm' : 'metadata';
    ndjson.push(_ndjson__WEBPACK_IMPORTED_MODULE_10__.default.stringify((_NDJSON$stringify3 = {}, _NDJSON$stringify3[metadataKey] = compress ? (0,_compress__WEBPACK_IMPORTED_MODULE_4__.compressMetadata)(metadata) : metadata, _NDJSON$stringify3)));
    ndjson = ndjson.concat(this.ndjsonErrors(filteredPayload[_constants__WEBPACK_IMPORTED_MODULE_3__.ERRORS], compress), this.ndjsonTransactions(filteredPayload[_constants__WEBPACK_IMPORTED_MODULE_3__.TRANSACTIONS], compress));
    var ndjsonPayload = ndjson.join('');

    var _this$getEndpoints2 = this.getEndpoints(),
        intakeEndpoint = _this$getEndpoints2.intakeEndpoint;

    return this._postJson(intakeEndpoint, ndjsonPayload);
  };

  _proto.getEndpoints = function getEndpoints() {
    var serverUrl = this._configService.get('serverUrl');

    var apiVersion = this._configService.get('apiVersion');

    var serverUrlPrefix = this._configService.get('serverUrlPrefix') || "/intake/v" + apiVersion + "/rum/events";
    var intakeEndpoint = serverUrl + serverUrlPrefix;
    var configEndpoint = serverUrl + "/config/v1/rum/agents";
    return {
      intakeEndpoint: intakeEndpoint,
      configEndpoint: configEndpoint
    };
  };

  return ApmServer;
}();

/* harmony default export */ __webpack_exports__["default"] = (ApmServer);

/***/ }),

/***/ "../rum-core/dist/es/common/compress.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/compress.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "compressMetadata": function() { return /* binding */ compressMetadata; },
/* harmony export */   "compressTransaction": function() { return /* binding */ compressTransaction; },
/* harmony export */   "compressError": function() { return /* binding */ compressError; },
/* harmony export */   "compressMetricsets": function() { return /* binding */ compressMetricsets; },
/* harmony export */   "compressPayload": function() { return /* binding */ compressPayload; }
/* harmony export */ });
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _performance_monitoring_capture_navigation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../performance-monitoring/capture-navigation */ "../rum-core/dist/es/performance-monitoring/capture-navigation.js");



function compressStackFrames(frames) {
  return frames.map(function (frame) {
    return {
      ap: frame.abs_path,
      f: frame.filename,
      fn: frame.function,
      li: frame.lineno,
      co: frame.colno
    };
  });
}

function compressResponse(response) {
  return {
    ts: response.transfer_size,
    ebs: response.encoded_body_size,
    dbs: response.decoded_body_size
  };
}

function compressHTTP(http) {
  var compressed = {};
  var method = http.method,
      status_code = http.status_code,
      url = http.url,
      response = http.response;
  compressed.url = url;

  if (method) {
    compressed.mt = method;
  }

  if (status_code) {
    compressed.sc = status_code;
  }

  if (response) {
    compressed.r = compressResponse(response);
  }

  return compressed;
}

function compressContext(context) {
  if (!context) {
    return null;
  }

  var compressed = {};
  var page = context.page,
      http = context.http,
      response = context.response,
      destination = context.destination,
      user = context.user,
      custom = context.custom;

  if (page) {
    compressed.p = {
      rf: page.referer,
      url: page.url
    };
  }

  if (http) {
    compressed.h = compressHTTP(http);
  }

  if (response) {
    compressed.r = compressResponse(response);
  }

  if (destination) {
    var service = destination.service;
    compressed.dt = {
      se: {
        n: service.name,
        t: service.type,
        rc: service.resource
      },
      ad: destination.address,
      po: destination.port
    };
  }

  if (user) {
    compressed.u = {
      id: user.id,
      un: user.username,
      em: user.email
    };
  }

  if (custom) {
    compressed.cu = custom;
  }

  return compressed;
}

function compressMarks(marks) {
  if (!marks) {
    return null;
  }

  var compressedNtMarks = compressNavigationTimingMarks(marks.navigationTiming);
  var compressed = {
    nt: compressedNtMarks,
    a: compressAgentMarks(compressedNtMarks, marks.agent)
  };
  return compressed;
}

function compressNavigationTimingMarks(ntMarks) {
  if (!ntMarks) {
    return null;
  }

  var compressed = {};
  _performance_monitoring_capture_navigation__WEBPACK_IMPORTED_MODULE_0__.COMPRESSED_NAV_TIMING_MARKS.forEach(function (mark, index) {
    var mapping = _performance_monitoring_capture_navigation__WEBPACK_IMPORTED_MODULE_0__.NAVIGATION_TIMING_MARKS[index];
    compressed[mark] = ntMarks[mapping];
  });
  return compressed;
}

function compressAgentMarks(compressedNtMarks, agentMarks) {
  var compressed = {};

  if (compressedNtMarks) {
    compressed = {
      fb: compressedNtMarks.rs,
      di: compressedNtMarks.di,
      dc: compressedNtMarks.dc
    };
  }

  if (agentMarks) {
    var fp = agentMarks.firstContentfulPaint;
    var lp = agentMarks.largestContentfulPaint;

    if (fp) {
      compressed.fp = fp;
    }

    if (lp) {
      compressed.lp = lp;
    }
  }

  if (Object.keys(compressed).length === 0) {
    return null;
  }

  return compressed;
}

function compressMetadata(metadata) {
  var service = metadata.service,
      labels = metadata.labels;
  var agent = service.agent,
      language = service.language;
  return {
    se: {
      n: service.name,
      ve: service.version,
      a: {
        n: agent.name,
        ve: agent.version
      },
      la: {
        n: language.name
      },
      en: service.environment
    },
    l: labels
  };
}
function compressTransaction(transaction) {
  var spans = transaction.spans.map(function (span) {
    var spanData = {
      id: span.id,
      n: span.name,
      t: span.type,
      s: span.start,
      d: span.duration,
      c: compressContext(span.context),
      o: span.outcome,
      sr: span.sample_rate
    };

    if (span.parent_id !== transaction.id) {
      spanData.pid = span.parent_id;
    }

    if (span.sync === true) {
      spanData.sy = true;
    }

    if (span.subtype) {
      spanData.su = span.subtype;
    }

    if (span.action) {
      spanData.ac = span.action;
    }

    return spanData;
  });
  var tr = {
    id: transaction.id,
    tid: transaction.trace_id,
    n: transaction.name,
    t: transaction.type,
    d: transaction.duration,
    c: compressContext(transaction.context),
    k: compressMarks(transaction.marks),
    me: compressMetricsets(transaction.breakdown),
    y: spans,
    yc: {
      sd: spans.length
    },
    sm: transaction.sampled,
    sr: transaction.sample_rate,
    o: transaction.outcome
  };

  if (transaction.experience) {
    var _transaction$experien = transaction.experience,
        cls = _transaction$experien.cls,
        fid = _transaction$experien.fid,
        tbt = _transaction$experien.tbt,
        longtask = _transaction$experien.longtask;
    tr.exp = {
      cls: cls,
      fid: fid,
      tbt: tbt,
      lt: longtask
    };
  }

  if (transaction.session) {
    var _transaction$session = transaction.session,
        id = _transaction$session.id,
        sequence = _transaction$session.sequence;
    tr.ses = {
      id: id,
      seq: sequence
    };
  }

  return tr;
}
function compressError(error) {
  var exception = error.exception;
  var compressed = {
    id: error.id,
    cl: error.culprit,
    ex: {
      mg: exception.message,
      st: compressStackFrames(exception.stacktrace),
      t: error.type
    },
    c: compressContext(error.context)
  };
  var transaction = error.transaction;

  if (transaction) {
    compressed.tid = error.trace_id;
    compressed.pid = error.parent_id;
    compressed.xid = error.transaction_id;
    compressed.x = {
      t: transaction.type,
      sm: transaction.sampled
    };
  }

  return compressed;
}
function compressMetricsets(breakdowns) {
  return breakdowns.map(function (_ref) {
    var span = _ref.span,
        samples = _ref.samples;
    var isSpan = span != null;

    if (isSpan) {
      return {
        y: {
          t: span.type
        },
        sa: {
          ysc: {
            v: samples['span.self_time.count'].value
          },
          yss: {
            v: samples['span.self_time.sum.us'].value
          }
        }
      };
    }

    return {
      sa: {
        xdc: {
          v: samples['transaction.duration.count'].value
        },
        xds: {
          v: samples['transaction.duration.sum.us'].value
        },
        xbc: {
          v: samples['transaction.breakdown.count'].value
        }
      }
    };
  });
}
function compressPayload(params, type) {
  if (type === void 0) {
    type = 'gzip';
  }

  var isCompressionStreamSupported = typeof CompressionStream === 'function';
  return new _polyfills__WEBPACK_IMPORTED_MODULE_1__.Promise(function (resolve) {
    if (!isCompressionStreamSupported) {
      return resolve(params);
    }

    var payload = params.payload,
        headers = params.headers,
        beforeSend = params.beforeSend;
    var payloadStream = new Blob([payload]).stream();
    var compressedStream = payloadStream.pipeThrough(new CompressionStream(type));
    return new Response(compressedStream).blob().then(function (payload) {
      headers['Content-Encoding'] = type;
      return resolve({
        payload: payload,
        headers: headers,
        beforeSend: beforeSend
      });
    });
  });
}

/***/ }),

/***/ "../rum-core/dist/es/common/config-service.js":
/*!****************************************************!*\
  !*** ../rum-core/dist/es/common/config-service.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _event_handler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event-handler */ "../rum-core/dist/es/common/event-handler.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}





function getConfigFromScript() {
  var script = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCurrentScript)();
  var config = getDataAttributesFromNode(script);
  return config;
}

function getDataAttributesFromNode(node) {
  if (!node) {
    return {};
  }

  var dataAttrs = {};
  var dataRegex = /^data-([\w-]+)$/;
  var attrs = node.attributes;

  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];

    if (dataRegex.test(attr.nodeName)) {
      var key = attr.nodeName.match(dataRegex)[1];
      var camelCasedkey = key.split('-').map(function (value, index) {
        return index > 0 ? value.charAt(0).toUpperCase() + value.substring(1) : value;
      }).join('');
      dataAttrs[camelCasedkey] = attr.value || attr.nodeValue;
    }
  }

  return dataAttrs;
}

var Config = function () {
  function Config() {
    this.config = {
      serviceName: '',
      serviceVersion: '',
      environment: '',
      serverUrl: 'http://localhost:8200',
      serverUrlPrefix: '',
      active: true,
      instrument: true,
      disableInstrumentations: [],
      logLevel: 'warn',
      breakdownMetrics: false,
      ignoreTransactions: [],
      eventsLimit: 80,
      queueLimit: -1,
      flushInterval: 500,
      distributedTracing: true,
      distributedTracingOrigins: [],
      distributedTracingHeaderName: 'traceparent',
      pageLoadTraceId: '',
      pageLoadSpanId: '',
      pageLoadSampled: false,
      pageLoadTransactionName: '',
      propagateTracestate: false,
      transactionSampleRate: 1.0,
      centralConfig: false,
      monitorLongtasks: true,
      apiVersion: 2,
      context: {},
      session: false,
      apmRequest: null
    };
    this.events = new _event_handler__WEBPACK_IMPORTED_MODULE_1__.default();
    this.filters = [];
    this.version = '';
  }

  var _proto = Config.prototype;

  _proto.init = function init() {
    var scriptData = getConfigFromScript();
    this.setConfig(scriptData);
  };

  _proto.setVersion = function setVersion(version) {
    this.version = version;
  };

  _proto.addFilter = function addFilter(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Argument to must be function');
    }

    this.filters.push(cb);
  };

  _proto.applyFilters = function applyFilters(data) {
    for (var i = 0; i < this.filters.length; i++) {
      data = this.filters[i](data);

      if (!data) {
        return;
      }
    }

    return data;
  };

  _proto.get = function get(key) {
    return key.split('.').reduce(function (obj, objKey) {
      return obj && obj[objKey];
    }, this.config);
  };

  _proto.setUserContext = function setUserContext(userContext) {
    if (userContext === void 0) {
      userContext = {};
    }

    var context = {};
    var _userContext = userContext,
        id = _userContext.id,
        username = _userContext.username,
        email = _userContext.email;

    if (typeof id === 'number' || typeof id === 'string') {
      context.id = id;
    }

    if (typeof username === 'string') {
      context.username = username;
    }

    if (typeof email === 'string') {
      context.email = email;
    }

    this.config.context.user = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.extend)(this.config.context.user || {}, context);
  };

  _proto.setCustomContext = function setCustomContext(customContext) {
    if (customContext === void 0) {
      customContext = {};
    }

    this.config.context.custom = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.extend)(this.config.context.custom || {}, customContext);
  };

  _proto.addLabels = function addLabels(tags) {
    var _this = this;

    if (!this.config.context.tags) {
      this.config.context.tags = {};
    }

    var keys = Object.keys(tags);
    keys.forEach(function (k) {
      return (0,_utils__WEBPACK_IMPORTED_MODULE_0__.setLabel)(k, tags[k], _this.config.context.tags);
    });
  };

  _proto.setConfig = function setConfig(properties) {
    if (properties === void 0) {
      properties = {};
    }

    var _properties = properties,
        transactionSampleRate = _properties.transactionSampleRate,
        serverUrl = _properties.serverUrl;

    if (serverUrl) {
      properties.serverUrl = serverUrl.replace(/\/+$/, '');
    }

    if (!(0,_utils__WEBPACK_IMPORTED_MODULE_0__.isUndefined)(transactionSampleRate)) {
      if (transactionSampleRate < 0.0001 && transactionSampleRate > 0) {
        transactionSampleRate = 0.0001;
      }

      properties.transactionSampleRate = Math.round(transactionSampleRate * 10000) / 10000;
    }

    (0,_utils__WEBPACK_IMPORTED_MODULE_0__.merge)(this.config, properties);
    this.events.send(_constants__WEBPACK_IMPORTED_MODULE_2__.CONFIG_CHANGE, [this.config]);
  };

  _proto.validate = function validate(properties) {
    if (properties === void 0) {
      properties = {};
    }

    var requiredKeys = ['serviceName', 'serverUrl'];
    var errors = {
      missing: [],
      invalid: []
    };
    Object.keys(properties).forEach(function (key) {
      if (requiredKeys.indexOf(key) !== -1 && !properties[key]) {
        errors.missing.push(key);
      }
    });

    if (properties.serviceName && !/^[a-zA-Z0-9 _-]+$/.test(properties.serviceName)) {
      errors.invalid.push({
        key: 'serviceName',
        value: properties.serviceName,
        allowed: 'a-z, A-Z, 0-9, _, -, <space>'
      });
    }

    var sampleRate = properties.transactionSampleRate;

    if (typeof sampleRate !== 'undefined' && (typeof sampleRate !== 'number' || isNaN(sampleRate) || sampleRate < 0 || sampleRate > 1)) {
      errors.invalid.push({
        key: 'transactionSampleRate',
        value: sampleRate,
        allowed: 'Number between 0 and 1'
      });
    }

    return errors;
  };

  _proto.getLocalConfig = function getLocalConfig() {
    var storage = sessionStorage;

    if (this.config.session) {
      storage = localStorage;
    }

    var config = storage.getItem(_constants__WEBPACK_IMPORTED_MODULE_2__.LOCAL_CONFIG_KEY);

    if (config) {
      return JSON.parse(config);
    }
  };

  _proto.setLocalConfig = function setLocalConfig(config, merge) {
    if (config) {
      if (merge) {
        var prevConfig = this.getLocalConfig();
        config = _extends({}, prevConfig, config);
      }

      var storage = sessionStorage;

      if (this.config.session) {
        storage = localStorage;
      }

      storage.setItem(_constants__WEBPACK_IMPORTED_MODULE_2__.LOCAL_CONFIG_KEY, JSON.stringify(config));
    }
  };

  _proto.dispatchEvent = function dispatchEvent(name, args) {
    this.events.send(name, args);
  };

  _proto.observeEvent = function observeEvent(name, fn) {
    return this.events.observe(name, fn);
  };

  return Config;
}();

/* harmony default export */ __webpack_exports__["default"] = (Config);

/***/ }),

/***/ "../rum-core/dist/es/common/constants.js":
/*!***********************************************!*\
  !*** ../rum-core/dist/es/common/constants.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SCHEDULE": function() { return /* binding */ SCHEDULE; },
/* harmony export */   "INVOKE": function() { return /* binding */ INVOKE; },
/* harmony export */   "ADD_EVENT_LISTENER_STR": function() { return /* binding */ ADD_EVENT_LISTENER_STR; },
/* harmony export */   "REMOVE_EVENT_LISTENER_STR": function() { return /* binding */ REMOVE_EVENT_LISTENER_STR; },
/* harmony export */   "RESOURCE_INITIATOR_TYPES": function() { return /* binding */ RESOURCE_INITIATOR_TYPES; },
/* harmony export */   "REUSABILITY_THRESHOLD": function() { return /* binding */ REUSABILITY_THRESHOLD; },
/* harmony export */   "MAX_SPAN_DURATION": function() { return /* binding */ MAX_SPAN_DURATION; },
/* harmony export */   "PAGE_LOAD_DELAY": function() { return /* binding */ PAGE_LOAD_DELAY; },
/* harmony export */   "PAGE_LOAD": function() { return /* binding */ PAGE_LOAD; },
/* harmony export */   "ROUTE_CHANGE": function() { return /* binding */ ROUTE_CHANGE; },
/* harmony export */   "NAME_UNKNOWN": function() { return /* binding */ NAME_UNKNOWN; },
/* harmony export */   "TYPE_CUSTOM": function() { return /* binding */ TYPE_CUSTOM; },
/* harmony export */   "USER_TIMING_THRESHOLD": function() { return /* binding */ USER_TIMING_THRESHOLD; },
/* harmony export */   "TRANSACTION_START": function() { return /* binding */ TRANSACTION_START; },
/* harmony export */   "TRANSACTION_END": function() { return /* binding */ TRANSACTION_END; },
/* harmony export */   "CONFIG_CHANGE": function() { return /* binding */ CONFIG_CHANGE; },
/* harmony export */   "QUEUE_FLUSH": function() { return /* binding */ QUEUE_FLUSH; },
/* harmony export */   "QUEUE_ADD_TRANSACTION": function() { return /* binding */ QUEUE_ADD_TRANSACTION; },
/* harmony export */   "XMLHTTPREQUEST": function() { return /* binding */ XMLHTTPREQUEST; },
/* harmony export */   "FETCH": function() { return /* binding */ FETCH; },
/* harmony export */   "HISTORY": function() { return /* binding */ HISTORY; },
/* harmony export */   "EVENT_TARGET": function() { return /* binding */ EVENT_TARGET; },
/* harmony export */   "ERROR": function() { return /* binding */ ERROR; },
/* harmony export */   "BEFORE_EVENT": function() { return /* binding */ BEFORE_EVENT; },
/* harmony export */   "AFTER_EVENT": function() { return /* binding */ AFTER_EVENT; },
/* harmony export */   "LOCAL_CONFIG_KEY": function() { return /* binding */ LOCAL_CONFIG_KEY; },
/* harmony export */   "HTTP_REQUEST_TYPE": function() { return /* binding */ HTTP_REQUEST_TYPE; },
/* harmony export */   "LONG_TASK": function() { return /* binding */ LONG_TASK; },
/* harmony export */   "PAINT": function() { return /* binding */ PAINT; },
/* harmony export */   "MEASURE": function() { return /* binding */ MEASURE; },
/* harmony export */   "NAVIGATION": function() { return /* binding */ NAVIGATION; },
/* harmony export */   "RESOURCE": function() { return /* binding */ RESOURCE; },
/* harmony export */   "FIRST_CONTENTFUL_PAINT": function() { return /* binding */ FIRST_CONTENTFUL_PAINT; },
/* harmony export */   "LARGEST_CONTENTFUL_PAINT": function() { return /* binding */ LARGEST_CONTENTFUL_PAINT; },
/* harmony export */   "KEYWORD_LIMIT": function() { return /* binding */ KEYWORD_LIMIT; },
/* harmony export */   "TEMPORARY_TYPE": function() { return /* binding */ TEMPORARY_TYPE; },
/* harmony export */   "USER_INTERACTION": function() { return /* binding */ USER_INTERACTION; },
/* harmony export */   "TRANSACTION_TYPE_ORDER": function() { return /* binding */ TRANSACTION_TYPE_ORDER; },
/* harmony export */   "ERRORS": function() { return /* binding */ ERRORS; },
/* harmony export */   "TRANSACTIONS": function() { return /* binding */ TRANSACTIONS; },
/* harmony export */   "CONFIG_SERVICE": function() { return /* binding */ CONFIG_SERVICE; },
/* harmony export */   "LOGGING_SERVICE": function() { return /* binding */ LOGGING_SERVICE; },
/* harmony export */   "TRANSACTION_SERVICE": function() { return /* binding */ TRANSACTION_SERVICE; },
/* harmony export */   "APM_SERVER": function() { return /* binding */ APM_SERVER; },
/* harmony export */   "TRUNCATED_TYPE": function() { return /* binding */ TRUNCATED_TYPE; },
/* harmony export */   "FIRST_INPUT": function() { return /* binding */ FIRST_INPUT; },
/* harmony export */   "LAYOUT_SHIFT": function() { return /* binding */ LAYOUT_SHIFT; },
/* harmony export */   "OUTCOME_SUCCESS": function() { return /* binding */ OUTCOME_SUCCESS; },
/* harmony export */   "OUTCOME_FAILURE": function() { return /* binding */ OUTCOME_FAILURE; },
/* harmony export */   "SESSION_TIMEOUT": function() { return /* binding */ SESSION_TIMEOUT; },
/* harmony export */   "HTTP_REQUEST_TIMEOUT": function() { return /* binding */ HTTP_REQUEST_TIMEOUT; }
/* harmony export */ });
var SCHEDULE = 'schedule';
var INVOKE = 'invoke';
var ADD_EVENT_LISTENER_STR = 'addEventListener';
var REMOVE_EVENT_LISTENER_STR = 'removeEventListener';
var RESOURCE_INITIATOR_TYPES = ['link', 'css', 'script', 'img', 'xmlhttprequest', 'fetch', 'beacon', 'iframe'];
var REUSABILITY_THRESHOLD = 5000;
var MAX_SPAN_DURATION = 5 * 60 * 1000;
var PAGE_LOAD_DELAY = 1000;
var PAGE_LOAD = 'page-load';
var ROUTE_CHANGE = 'route-change';
var TYPE_CUSTOM = 'custom';
var USER_INTERACTION = 'user-interaction';
var HTTP_REQUEST_TYPE = 'http-request';
var TEMPORARY_TYPE = 'temporary';
var NAME_UNKNOWN = 'Unknown';
var TRANSACTION_TYPE_ORDER = [PAGE_LOAD, ROUTE_CHANGE, USER_INTERACTION, HTTP_REQUEST_TYPE, TYPE_CUSTOM, TEMPORARY_TYPE];
var OUTCOME_SUCCESS = 'success';
var OUTCOME_FAILURE = 'failure';
var USER_TIMING_THRESHOLD = 60;
var TRANSACTION_START = 'transaction:start';
var TRANSACTION_END = 'transaction:end';
var CONFIG_CHANGE = 'config:change';
var QUEUE_FLUSH = 'queue:flush';
var QUEUE_ADD_TRANSACTION = 'queue:add_transaction';
var XMLHTTPREQUEST = 'xmlhttprequest';
var FETCH = 'fetch';
var HISTORY = 'history';
var EVENT_TARGET = 'eventtarget';
var ERROR = 'error';
var BEFORE_EVENT = ':before';
var AFTER_EVENT = ':after';
var LOCAL_CONFIG_KEY = 'elastic_apm_config';
var LONG_TASK = 'longtask';
var PAINT = 'paint';
var MEASURE = 'measure';
var NAVIGATION = 'navigation';
var RESOURCE = 'resource';
var FIRST_CONTENTFUL_PAINT = 'first-contentful-paint';
var LARGEST_CONTENTFUL_PAINT = 'largest-contentful-paint';
var FIRST_INPUT = 'first-input';
var LAYOUT_SHIFT = 'layout-shift';
var ERRORS = 'errors';
var TRANSACTIONS = 'transactions';
var CONFIG_SERVICE = 'ConfigService';
var LOGGING_SERVICE = 'LoggingService';
var TRANSACTION_SERVICE = 'TransactionService';
var APM_SERVER = 'ApmServer';
var TRUNCATED_TYPE = '.truncated';
var KEYWORD_LIMIT = 1024;
var SESSION_TIMEOUT = 30 * 60000;
var HTTP_REQUEST_TIMEOUT = 10000;


/***/ }),

/***/ "../rum-core/dist/es/common/context.js":
/*!*********************************************!*\
  !*** ../rum-core/dist/es/common/context.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPageContext": function() { return /* binding */ getPageContext; },
/* harmony export */   "addSpanContext": function() { return /* binding */ addSpanContext; },
/* harmony export */   "addTransactionContext": function() { return /* binding */ addTransactionContext; }
/* harmony export */ });
/* harmony import */ var _url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./url */ "../rum-core/dist/es/common/url.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");
var _excluded = ["tags"];

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}




var LEFT_SQUARE_BRACKET = 91;
var RIGHT_SQUARE_BRACKET = 93;
var EXTERNAL = 'external';
var RESOURCE = 'resource';
var HARD_NAVIGATION = 'hard-navigation';

function getPortNumber(port, protocol) {
  if (port === '') {
    port = protocol === 'http:' ? '80' : protocol === 'https:' ? '443' : '';
  }

  return port;
}

function getResponseContext(perfTimingEntry) {
  var transferSize = perfTimingEntry.transferSize,
      encodedBodySize = perfTimingEntry.encodedBodySize,
      decodedBodySize = perfTimingEntry.decodedBodySize,
      serverTiming = perfTimingEntry.serverTiming;
  var respContext = {
    transfer_size: transferSize,
    encoded_body_size: encodedBodySize,
    decoded_body_size: decodedBodySize
  };
  var serverTimingStr = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getServerTimingInfo)(serverTiming);

  if (serverTimingStr) {
    respContext.headers = {
      'server-timing': serverTimingStr
    };
  }

  return respContext;
}

function getDestination(parsedUrl) {
  var port = parsedUrl.port,
      protocol = parsedUrl.protocol,
      hostname = parsedUrl.hostname;
  var portNumber = getPortNumber(port, protocol);
  var ipv6Hostname = hostname.charCodeAt(0) === LEFT_SQUARE_BRACKET && hostname.charCodeAt(hostname.length - 1) === RIGHT_SQUARE_BRACKET;
  var address = hostname;

  if (ipv6Hostname) {
    address = hostname.slice(1, -1);
  }

  return {
    service: {
      resource: hostname + ':' + portNumber,
      name: '',
      type: ''
    },
    address: address,
    port: Number(portNumber)
  };
}

function getResourceContext(data) {
  var entry = data.entry,
      url = data.url;
  var parsedUrl = new _url__WEBPACK_IMPORTED_MODULE_1__.Url(url);
  var destination = getDestination(parsedUrl);
  return {
    http: {
      url: url,
      response: getResponseContext(entry)
    },
    destination: destination
  };
}

function getExternalContext(data) {
  var url = data.url,
      method = data.method,
      target = data.target,
      response = data.response;
  var parsedUrl = new _url__WEBPACK_IMPORTED_MODULE_1__.Url(url);
  var destination = getDestination(parsedUrl);
  var context = {
    http: {
      method: method,
      url: parsedUrl.href
    },
    destination: destination
  };
  var statusCode;

  if (target && typeof target.status !== 'undefined') {
    statusCode = target.status;
  } else if (response) {
    statusCode = response.status;
  }

  context.http.status_code = statusCode;
  return context;
}

function getNavigationContext(data) {
  var url = data.url;
  var parsedUrl = new _url__WEBPACK_IMPORTED_MODULE_1__.Url(url);
  var destination = getDestination(parsedUrl);
  return {
    destination: destination
  };
}

function getPageContext() {
  return {
    page: {
      referer: document.referrer,
      url: location.href
    }
  };
}
function addSpanContext(span, data) {
  if (!data) {
    return;
  }

  var type = span.type;
  var context;

  switch (type) {
    case EXTERNAL:
      context = getExternalContext(data);
      break;

    case RESOURCE:
      context = getResourceContext(data);
      break;

    case HARD_NAVIGATION:
      context = getNavigationContext(data);
      break;
  }

  span.addContext(context);
}
function addTransactionContext(transaction, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      tags = _ref.tags,
      configContext = _objectWithoutPropertiesLoose(_ref, _excluded);

  var pageContext = getPageContext();
  var responseContext = {};

  if (transaction.type === _constants__WEBPACK_IMPORTED_MODULE_2__.PAGE_LOAD && (0,_utils__WEBPACK_IMPORTED_MODULE_0__.isPerfTimelineSupported)()) {
    var entries = _utils__WEBPACK_IMPORTED_MODULE_0__.PERF.getEntriesByType(_constants__WEBPACK_IMPORTED_MODULE_2__.NAVIGATION);

    if (entries && entries.length > 0) {
      responseContext = {
        response: getResponseContext(entries[0])
      };
    }
  }

  transaction.addContext(pageContext, responseContext, configContext);
}

/***/ }),

/***/ "../rum-core/dist/es/common/event-handler.js":
/*!***************************************************!*\
  !*** ../rum-core/dist/es/common/event-handler.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");


var EventHandler = function () {
  function EventHandler() {
    this.observers = {};
  }

  var _proto = EventHandler.prototype;

  _proto.observe = function observe(name, fn) {
    var _this = this;

    if (typeof fn === 'function') {
      if (!this.observers[name]) {
        this.observers[name] = [];
      }

      this.observers[name].push(fn);
      return function () {
        var index = _this.observers[name].indexOf(fn);

        if (index > -1) {
          _this.observers[name].splice(index, 1);
        }
      };
    }
  };

  _proto.sendOnly = function sendOnly(name, args) {
    var obs = this.observers[name];

    if (obs) {
      obs.forEach(function (fn) {
        try {
          fn.apply(undefined, args);
        } catch (error) {
          console.log(error, error.stack);
        }
      });
    }
  };

  _proto.send = function send(name, args) {
    this.sendOnly(name + _constants__WEBPACK_IMPORTED_MODULE_0__.BEFORE_EVENT, args);
    this.sendOnly(name, args);
    this.sendOnly(name + _constants__WEBPACK_IMPORTED_MODULE_0__.AFTER_EVENT, args);
  };

  return EventHandler;
}();

/* harmony default export */ __webpack_exports__["default"] = (EventHandler);

/***/ }),

/***/ "../rum-core/dist/es/common/http/fetch.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/common/http/fetch.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BYTE_LIMIT": function() { return /* binding */ BYTE_LIMIT; },
/* harmony export */   "shouldUseFetchWithKeepAlive": function() { return /* binding */ shouldUseFetchWithKeepAlive; },
/* harmony export */   "sendFetchRequest": function() { return /* binding */ sendFetchRequest; },
/* harmony export */   "isFetchSupported": function() { return /* binding */ isFetchSupported; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _response_status__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./response-status */ "../rum-core/dist/es/common/http/response-status.js");
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}



var BYTE_LIMIT = 60 * 1000;
function shouldUseFetchWithKeepAlive(method, payload) {
  if (!isFetchSupported()) {
    return false;
  }

  var isKeepAliveSupported = ('keepalive' in new Request(''));

  if (!isKeepAliveSupported) {
    return false;
  }

  var size = calculateSize(payload);
  return method === 'POST' && size < BYTE_LIMIT;
}
function sendFetchRequest(method, url, _ref) {
  var _ref$keepalive = _ref.keepalive,
      keepalive = _ref$keepalive === void 0 ? false : _ref$keepalive,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? _constants__WEBPACK_IMPORTED_MODULE_0__.HTTP_REQUEST_TIMEOUT : _ref$timeout,
      payload = _ref.payload,
      headers = _ref.headers;
  var timeoutConfig = {};

  if (typeof AbortController === 'function') {
    var controller = new AbortController();
    timeoutConfig.signal = controller.signal;
    setTimeout(function () {
      return controller.abort();
    }, timeout);
  }

  var fetchResponse;
  return window.fetch(url, _extends({
    body: payload,
    headers: headers,
    method: method,
    keepalive: keepalive,
    credentials: 'omit'
  }, timeoutConfig)).then(function (response) {
    fetchResponse = response;
    return fetchResponse.text();
  }).then(function (responseText) {
    var bodyResponse = {
      url: url,
      status: fetchResponse.status,
      responseText: responseText
    };

    if (!(0,_response_status__WEBPACK_IMPORTED_MODULE_1__.isResponseSuccessful)(fetchResponse.status)) {
      throw bodyResponse;
    }

    return bodyResponse;
  });
}
function isFetchSupported() {
  return typeof window.fetch === 'function' && typeof window.Request === 'function';
}

function calculateSize(payload) {
  if (!payload) {
    return 0;
  }

  if (payload instanceof Blob) {
    return payload.size;
  }

  return new Blob([payload]).size;
}

/***/ }),

/***/ "../rum-core/dist/es/common/http/response-status.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/common/http/response-status.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isResponseSuccessful": function() { return /* binding */ isResponseSuccessful; }
/* harmony export */ });
function isResponseSuccessful(status) {
  if (status === 0 || status > 399 && status < 600) {
    return false;
  }

  return true;
}

/***/ }),

/***/ "../rum-core/dist/es/common/http/xhr.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/http/xhr.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sendXHR": function() { return /* binding */ sendXHR; }
/* harmony export */ });
/* harmony import */ var _patching_patch_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../patching/patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _response_status__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./response-status */ "../rum-core/dist/es/common/http/response-status.js");
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../polyfills */ "../rum-core/dist/es/common/polyfills.js");



function sendXHR(method, url, _ref) {
  var _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? HTTP_REQUEST_TIMEOUT : _ref$timeout,
      payload = _ref.payload,
      headers = _ref.headers,
      beforeSend = _ref.beforeSend;
  return new _polyfills__WEBPACK_IMPORTED_MODULE_0__.Promise(function (resolve, reject) {
    var xhr = new window.XMLHttpRequest();
    xhr[_patching_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_IGNORE] = true;
    xhr.open(method, url, true);
    xhr.timeout = timeout;

    if (headers) {
      for (var header in headers) {
        if (headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, headers[header]);
        }
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var status = xhr.status,
            responseText = xhr.responseText;

        if ((0,_response_status__WEBPACK_IMPORTED_MODULE_2__.isResponseSuccessful)(status)) {
          resolve(xhr);
        } else {
          reject({
            url: url,
            status: status,
            responseText: responseText
          });
        }
      }
    };

    xhr.onerror = function () {
      var status = xhr.status,
          responseText = xhr.responseText;
      reject({
        url: url,
        status: status,
        responseText: responseText
      });
    };

    var canSend = true;

    if (typeof beforeSend === 'function') {
      canSend = beforeSend({
        url: url,
        method: method,
        headers: headers,
        payload: payload,
        xhr: xhr
      });
    }

    if (canSend) {
      xhr.send(payload);
    } else {
      reject({
        url: url,
        status: 0,
        responseText: 'Request rejected by user configuration.'
      });
    }
  });
}

/***/ }),

/***/ "../rum-core/dist/es/common/instrument.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/common/instrument.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getInstrumentationFlags": function() { return /* binding */ getInstrumentationFlags; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");

function getInstrumentationFlags(instrument, disabledInstrumentations) {
  var _flags;

  var flags = (_flags = {}, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.ERROR] = false, _flags[_constants__WEBPACK_IMPORTED_MODULE_0__.EVENT_TARGET] = false, _flags);

  if (!instrument) {
    return flags;
  }

  Object.keys(flags).forEach(function (key) {
    if (disabledInstrumentations.indexOf(key) === -1) {
      flags[key] = true;
    }
  });
  return flags;
}

/***/ }),

/***/ "../rum-core/dist/es/common/logging-service.js":
/*!*****************************************************!*\
  !*** ../rum-core/dist/es/common/logging-service.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");


var LoggingService = function () {
  function LoggingService(spec) {
    if (spec === void 0) {
      spec = {};
    }

    this.levels = ['trace', 'debug', 'info', 'warn', 'error'];
    this.level = spec.level || 'warn';
    this.prefix = spec.prefix || '';
    this.resetLogMethods();
  }

  var _proto = LoggingService.prototype;

  _proto.shouldLog = function shouldLog(level) {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.level);
  };

  _proto.setLevel = function setLevel(level) {
    if (level === this.level) {
      return;
    }

    this.level = level;
    this.resetLogMethods();
  };

  _proto.resetLogMethods = function resetLogMethods() {
    var _this = this;

    this.levels.forEach(function (level) {
      _this[level] = _this.shouldLog(level) ? log : _utils__WEBPACK_IMPORTED_MODULE_0__.noop;

      function log() {
        var normalizedLevel = level;

        if (level === 'trace' || level === 'debug') {
          normalizedLevel = 'info';
        }

        var args = arguments;
        args[0] = this.prefix + args[0];

        if (console) {
          var realMethod = console[normalizedLevel] || console.log;

          if (typeof realMethod === 'function') {
            realMethod.apply(console, args);
          }
        }
      }
    });
  };

  return LoggingService;
}();

/* harmony default export */ __webpack_exports__["default"] = (LoggingService);

/***/ }),

/***/ "../rum-core/dist/es/common/ndjson.js":
/*!********************************************!*\
  !*** ../rum-core/dist/es/common/ndjson.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var NDJSON = function () {
  function NDJSON() {}

  NDJSON.stringify = function stringify(object) {
    return JSON.stringify(object) + '\n';
  };

  return NDJSON;
}();

/* harmony default export */ __webpack_exports__["default"] = (NDJSON);

/***/ }),

/***/ "../rum-core/dist/es/common/page-visibility.js":
/*!*****************************************************!*\
  !*** ../rum-core/dist/es/common/page-visibility.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "observePageVisibility": function() { return /* binding */ observePageVisibility; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");



function observePageVisibility(configService, transactionService) {
  if (document.visibilityState === 'hidden') {
    _state__WEBPACK_IMPORTED_MODULE_0__.state.lastHiddenStart = 0;
  }

  var visibilityChangeHandler = function visibilityChangeHandler() {
    if (document.visibilityState === 'hidden') {
      onPageHidden(configService, transactionService);
    }
  };

  var pageHideHandler = function pageHideHandler() {
    return onPageHidden(configService, transactionService);
  };

  var useCapture = true;
  window.addEventListener('visibilitychange', visibilityChangeHandler, useCapture);
  window.addEventListener('pagehide', pageHideHandler, useCapture);
  return function () {
    window.removeEventListener('visibilitychange', visibilityChangeHandler, useCapture);
    window.removeEventListener('pagehide', pageHideHandler, useCapture);
  };
}

function onPageHidden(configService, transactionService) {
  var tr = transactionService.getCurrentTransaction();

  if (tr) {
    var unobserve = configService.observeEvent(_constants__WEBPACK_IMPORTED_MODULE_1__.QUEUE_ADD_TRANSACTION, function () {
      configService.dispatchEvent(_constants__WEBPACK_IMPORTED_MODULE_1__.QUEUE_FLUSH);
      _state__WEBPACK_IMPORTED_MODULE_0__.state.lastHiddenStart = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.now)();
      unobserve();
    });
    tr.end();
  } else {
    configService.dispatchEvent(_constants__WEBPACK_IMPORTED_MODULE_1__.QUEUE_FLUSH);
    _state__WEBPACK_IMPORTED_MODULE_0__.state.lastHiddenStart = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.now)();
  }
}

/***/ }),

/***/ "../rum-core/dist/es/common/patching/event-target-patch.js":
/*!*****************************************************************!*\
  !*** ../rum-core/dist/es/common/patching/event-target-patch.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "patchEventTarget": function() { return /* binding */ patchEventTarget; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _patch_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");


var eventTypes = ['click'];
var eventTypeSymbols = {};

for (var i = 0; i < eventTypes.length; i++) {
  var et = eventTypes[i];
  eventTypeSymbols[et] = (0,_patch_utils__WEBPACK_IMPORTED_MODULE_0__.apmSymbol)(et);
}

function shouldInstrumentEvent(target, eventType, listenerFn) {
  return target instanceof EventTarget && eventTypes.indexOf(eventType) >= 0 && typeof listenerFn === 'function';
}

function patchEventTarget(callback) {
  if (!window.EventTarget) {
    return;
  }

  var proto = window.EventTarget.prototype;
  var nativeAddEventListener = proto[_constants__WEBPACK_IMPORTED_MODULE_1__.ADD_EVENT_LISTENER_STR];
  var nativeRemoveEventListener = proto[_constants__WEBPACK_IMPORTED_MODULE_1__.REMOVE_EVENT_LISTENER_STR];

  function findTaskIndex(existingTasks, eventType, listenerFn, capture) {
    for (var _i = 0; _i < existingTasks.length; _i++) {
      var task = existingTasks[_i];

      if (task.eventType === eventType && task.listenerFn === listenerFn && task.capture === capture) {
        return _i;
      }
    }

    return -1;
  }

  function isCapture(options) {
    var capture;

    if (typeof options === 'boolean') {
      capture = options;
    } else {
      capture = options ? !!options.capture : false;
    }

    return capture;
  }

  function createListenerWrapper(target, eventType, listenerFn, options) {
    var eventSymbol = eventTypeSymbols[eventType];
    if (!eventSymbol) return listenerFn;
    var existingTasks = target[eventSymbol];
    var capture = isCapture(options);

    if (existingTasks) {
      var taskIndex = findTaskIndex(existingTasks, eventType, listenerFn, capture);

      if (taskIndex !== -1) {
        var _task = existingTasks[taskIndex];
        return _task.wrappingFn;
      }
    } else {
      existingTasks = target[eventSymbol] = [];
    }

    var task = {
      source: _constants__WEBPACK_IMPORTED_MODULE_1__.EVENT_TARGET,
      eventType: eventType,
      listenerFn: listenerFn,
      capture: capture,
      wrappingFn: wrappingFn
    };
    existingTasks.push(task);

    function wrappingFn() {
      var event = arguments[0];
      task.target = event.target;
      callback(_constants__WEBPACK_IMPORTED_MODULE_1__.SCHEDULE, task);
      var result;

      try {
        result = listenerFn.apply(this, arguments);
      } finally {
        callback(_constants__WEBPACK_IMPORTED_MODULE_1__.INVOKE, task);
      }

      return result;
    }

    return wrappingFn;
  }

  function getWrappingFn(target, eventType, listenerFn, options) {
    var eventSymbol = eventTypeSymbols[eventType];
    var existingTasks = target[eventSymbol];

    if (existingTasks) {
      var capture = isCapture(options);
      var taskIndex = findTaskIndex(existingTasks, eventType, listenerFn, capture);

      if (taskIndex !== -1) {
        var task = existingTasks[taskIndex];
        existingTasks.splice(taskIndex, 1);

        if (existingTasks.length === 0) {
          target[eventSymbol] = undefined;
        }

        return task.wrappingFn;
      }
    }

    return listenerFn;
  }

  proto[_constants__WEBPACK_IMPORTED_MODULE_1__.ADD_EVENT_LISTENER_STR] = function (eventType, listenerFn, optionsOrCapture) {
    var target = this;

    if (!shouldInstrumentEvent(target, eventType, listenerFn)) {
      return nativeAddEventListener.apply(target, arguments);
    }

    var wrappingListenerFn = createListenerWrapper(target, eventType, listenerFn, optionsOrCapture);
    var args = Array.prototype.slice.call(arguments);
    args[1] = wrappingListenerFn;
    return nativeAddEventListener.apply(target, args);
  };

  proto[_constants__WEBPACK_IMPORTED_MODULE_1__.REMOVE_EVENT_LISTENER_STR] = function (eventType, listenerFn, optionsOrCapture) {
    var target = this;

    if (!shouldInstrumentEvent(target, eventType, listenerFn)) {
      return nativeRemoveEventListener.apply(target, arguments);
    }

    var wrappingFn = getWrappingFn(target, eventType, listenerFn, optionsOrCapture);
    var args = Array.prototype.slice.call(arguments);
    args[1] = wrappingFn;
    return nativeRemoveEventListener.apply(target, args);
  };
}

/***/ }),

/***/ "../rum-core/dist/es/common/patching/fetch-patch.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/common/patching/fetch-patch.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "patchFetch": function() { return /* binding */ patchFetch; }
/* harmony export */ });
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _patch_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _http_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../http/fetch */ "../rum-core/dist/es/common/http/fetch.js");





function patchFetch(callback) {
  if (!(0,_http_fetch__WEBPACK_IMPORTED_MODULE_0__.isFetchSupported)()) {
    return;
  }

  function scheduleTask(task) {
    task.state = _constants__WEBPACK_IMPORTED_MODULE_1__.SCHEDULE;
    callback(_constants__WEBPACK_IMPORTED_MODULE_1__.SCHEDULE, task);
  }

  function invokeTask(task) {
    task.state = _constants__WEBPACK_IMPORTED_MODULE_1__.INVOKE;
    callback(_constants__WEBPACK_IMPORTED_MODULE_1__.INVOKE, task);
  }

  var nativeFetch = window.fetch;

  window.fetch = function (input, init) {
    var fetchSelf = this;
    var args = arguments;
    var request, url;

    if (typeof input === 'string') {
      request = new Request(input, init);
      url = input;
    } else if (input) {
      request = input;
      url = request.url;
    } else {
      return nativeFetch.apply(fetchSelf, args);
    }

    var task = {
      source: _constants__WEBPACK_IMPORTED_MODULE_1__.FETCH,
      state: '',
      type: 'macroTask',
      data: {
        target: request,
        method: request.method,
        url: url,
        aborted: false
      }
    };
    return new _polyfills__WEBPACK_IMPORTED_MODULE_2__.Promise(function (resolve, reject) {
      _patch_utils__WEBPACK_IMPORTED_MODULE_3__.globalState.fetchInProgress = true;
      scheduleTask(task);
      var promise;

      try {
        promise = nativeFetch.apply(fetchSelf, [request]);
      } catch (error) {
        reject(error);
        task.data.error = error;
        invokeTask(task);
        _patch_utils__WEBPACK_IMPORTED_MODULE_3__.globalState.fetchInProgress = false;
        return;
      }

      promise.then(function (response) {
        resolve(response);
        (0,_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMicroTask)(function () {
          task.data.response = response;
          invokeTask(task);
        });
      }, function (error) {
        reject(error);
        (0,_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMicroTask)(function () {
          task.data.error = error;
          invokeTask(task);
        });
      });
      _patch_utils__WEBPACK_IMPORTED_MODULE_3__.globalState.fetchInProgress = false;
    });
  };
}

/***/ }),

/***/ "../rum-core/dist/es/common/patching/history-patch.js":
/*!************************************************************!*\
  !*** ../rum-core/dist/es/common/patching/history-patch.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "patchHistory": function() { return /* binding */ patchHistory; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");

function patchHistory(callback) {
  if (!window.history) {
    return;
  }

  var nativePushState = history.pushState;

  if (typeof nativePushState === 'function') {
    history.pushState = function (state, title, url) {
      var task = {
        source: _constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY,
        data: {
          state: state,
          title: title,
          url: url
        }
      };
      callback(_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE, task);
      nativePushState.apply(this, arguments);
    };
  }
}

/***/ }),

/***/ "../rum-core/dist/es/common/patching/index.js":
/*!****************************************************!*\
  !*** ../rum-core/dist/es/common/patching/index.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "patchAll": function() { return /* binding */ patchAll; },
/* harmony export */   "patchEventHandler": function() { return /* binding */ patchEventHandler; }
/* harmony export */ });
/* harmony import */ var _xhr_patch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./xhr-patch */ "../rum-core/dist/es/common/patching/xhr-patch.js");
/* harmony import */ var _fetch_patch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./fetch-patch */ "../rum-core/dist/es/common/patching/fetch-patch.js");
/* harmony import */ var _history_patch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./history-patch */ "../rum-core/dist/es/common/patching/history-patch.js");
/* harmony import */ var _event_target_patch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./event-target-patch */ "../rum-core/dist/es/common/patching/event-target-patch.js");
/* harmony import */ var _event_handler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../event-handler */ "../rum-core/dist/es/common/event-handler.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");






var patchEventHandler = new _event_handler__WEBPACK_IMPORTED_MODULE_0__.default();
var alreadyPatched = false;

function patchAll() {
  if (!alreadyPatched) {
    alreadyPatched = true;
    (0,_xhr_patch__WEBPACK_IMPORTED_MODULE_1__.patchXMLHttpRequest)(function (event, task) {
      patchEventHandler.send(_constants__WEBPACK_IMPORTED_MODULE_2__.XMLHTTPREQUEST, [event, task]);
    });
    (0,_fetch_patch__WEBPACK_IMPORTED_MODULE_3__.patchFetch)(function (event, task) {
      patchEventHandler.send(_constants__WEBPACK_IMPORTED_MODULE_2__.FETCH, [event, task]);
    });
    (0,_history_patch__WEBPACK_IMPORTED_MODULE_4__.patchHistory)(function (event, task) {
      patchEventHandler.send(_constants__WEBPACK_IMPORTED_MODULE_2__.HISTORY, [event, task]);
    });
    (0,_event_target_patch__WEBPACK_IMPORTED_MODULE_5__.patchEventTarget)(function (event, task) {
      patchEventHandler.send(_constants__WEBPACK_IMPORTED_MODULE_2__.EVENT_TARGET, [event, task]);
    });
  }

  return patchEventHandler;
}



/***/ }),

/***/ "../rum-core/dist/es/common/patching/patch-utils.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/common/patching/patch-utils.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "globalState": function() { return /* binding */ globalState; },
/* harmony export */   "apmSymbol": function() { return /* binding */ apmSymbol; },
/* harmony export */   "patchMethod": function() { return /* binding */ patchMethod; },
/* harmony export */   "XHR_IGNORE": function() { return /* binding */ XHR_IGNORE; },
/* harmony export */   "XHR_SYNC": function() { return /* binding */ XHR_SYNC; },
/* harmony export */   "XHR_URL": function() { return /* binding */ XHR_URL; },
/* harmony export */   "XHR_METHOD": function() { return /* binding */ XHR_METHOD; }
/* harmony export */ });
var globalState = {
  fetchInProgress: false
};
function apmSymbol(name) {
  return '__apm_symbol__' + name;
}

function isPropertyWritable(propertyDesc) {
  if (!propertyDesc) {
    return true;
  }

  if (propertyDesc.writable === false) {
    return false;
  }

  return !(typeof propertyDesc.get === 'function' && typeof propertyDesc.set === 'undefined');
}

function attachOriginToPatched(patched, original) {
  patched[apmSymbol('OriginalDelegate')] = original;
}

function patchMethod(target, name, patchFn) {
  var proto = target;

  while (proto && !proto.hasOwnProperty(name)) {
    proto = Object.getPrototypeOf(proto);
  }

  if (!proto && target[name]) {
    proto = target;
  }

  var delegateName = apmSymbol(name);
  var delegate;

  if (proto && !(delegate = proto[delegateName])) {
    delegate = proto[delegateName] = proto[name];
    var desc = proto && Object.getOwnPropertyDescriptor(proto, name);

    if (isPropertyWritable(desc)) {
      var patchDelegate = patchFn(delegate, delegateName, name);

      proto[name] = function () {
        return patchDelegate(this, arguments);
      };

      attachOriginToPatched(proto[name], delegate);
    }
  }

  return delegate;
}
var XHR_IGNORE = apmSymbol('xhrIgnore');
var XHR_SYNC = apmSymbol('xhrSync');
var XHR_URL = apmSymbol('xhrURL');
var XHR_METHOD = apmSymbol('xhrMethod');

/***/ }),

/***/ "../rum-core/dist/es/common/patching/xhr-patch.js":
/*!********************************************************!*\
  !*** ../rum-core/dist/es/common/patching/xhr-patch.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "patchXMLHttpRequest": function() { return /* binding */ patchXMLHttpRequest; }
/* harmony export */ });
/* harmony import */ var _patch_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "../rum-core/dist/es/common/constants.js");


function patchXMLHttpRequest(callback) {
  var XMLHttpRequestPrototype = XMLHttpRequest.prototype;

  if (!XMLHttpRequestPrototype || !XMLHttpRequestPrototype[_constants__WEBPACK_IMPORTED_MODULE_0__.ADD_EVENT_LISTENER_STR]) {
    return;
  }

  var READY_STATE_CHANGE = 'readystatechange';
  var LOAD = 'load';
  var ERROR = 'error';
  var TIMEOUT = 'timeout';
  var ABORT = 'abort';

  function invokeTask(task, status) {
    if (task.state !== _constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE) {
      task.state = _constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE;
      task.data.status = status;
      callback(_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE, task);
    }
  }

  function scheduleTask(task) {
    if (task.state === _constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE) {
      return;
    }

    task.state = _constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE;
    callback(_constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE, task);
    var target = task.data.target;

    function addListener(name) {
      target[_constants__WEBPACK_IMPORTED_MODULE_0__.ADD_EVENT_LISTENER_STR](name, function (_ref) {
        var type = _ref.type;

        if (type === READY_STATE_CHANGE) {
          if (target.readyState === 4 && target.status !== 0) {
            invokeTask(task, 'success');
          }
        } else {
          var status = type === LOAD ? 'success' : type;
          invokeTask(task, status);
        }
      });
    }

    addListener(READY_STATE_CHANGE);
    addListener(LOAD);
    addListener(TIMEOUT);
    addListener(ERROR);
    addListener(ABORT);
  }

  var openNative = (0,_patch_utils__WEBPACK_IMPORTED_MODULE_1__.patchMethod)(XMLHttpRequestPrototype, 'open', function () {
    return function (self, args) {
      if (!self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_IGNORE]) {
        self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_METHOD] = args[0];
        self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_URL] = args[1];
        self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_SYNC] = args[2] === false;
      }

      return openNative.apply(self, args);
    };
  });
  var sendNative = (0,_patch_utils__WEBPACK_IMPORTED_MODULE_1__.patchMethod)(XMLHttpRequestPrototype, 'send', function () {
    return function (self, args) {
      if (self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_IGNORE]) {
        return sendNative.apply(self, args);
      }

      var task = {
        source: _constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST,
        state: '',
        type: 'macroTask',
        data: {
          target: self,
          method: self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_METHOD],
          sync: self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_SYNC],
          url: self[_patch_utils__WEBPACK_IMPORTED_MODULE_1__.XHR_URL],
          status: ''
        }
      };

      try {
        scheduleTask(task);
        return sendNative.apply(self, args);
      } catch (e) {
        invokeTask(task, ERROR);
        throw e;
      }
    };
  });
}

/***/ }),

/***/ "../rum-core/dist/es/common/polyfills.js":
/*!***********************************************!*\
  !*** ../rum-core/dist/es/common/polyfills.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Promise": function() { return /* binding */ Promise; }
/* harmony export */ });
/* harmony import */ var promise_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! promise-polyfill */ "../../node_modules/promise-polyfill/src/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");


var local = {};

if (_utils__WEBPACK_IMPORTED_MODULE_1__.isBrowser) {
  local = window;
} else if (typeof self !== 'undefined') {
  local = self;
}

var Promise = 'Promise' in local ? local.Promise : promise_polyfill__WEBPACK_IMPORTED_MODULE_0__.default;


/***/ }),

/***/ "../rum-core/dist/es/common/queue.js":
/*!*******************************************!*\
  !*** ../rum-core/dist/es/common/queue.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var Queue = function () {
  function Queue(onFlush, opts) {
    if (opts === void 0) {
      opts = {};
    }

    this.onFlush = onFlush;
    this.items = [];
    this.queueLimit = opts.queueLimit || -1;
    this.flushInterval = opts.flushInterval || 0;
    this.timeoutId = undefined;
  }

  var _proto = Queue.prototype;

  _proto._setTimer = function _setTimer() {
    var _this = this;

    this.timeoutId = setTimeout(function () {
      return _this.flush();
    }, this.flushInterval);
  };

  _proto._clear = function _clear() {
    if (typeof this.timeoutId !== 'undefined') {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    this.items = [];
  };

  _proto.flush = function flush() {
    this.onFlush(this.items);

    this._clear();
  };

  _proto.add = function add(item) {
    this.items.push(item);

    if (this.queueLimit !== -1 && this.items.length >= this.queueLimit) {
      this.flush();
    } else {
      if (typeof this.timeoutId === 'undefined') {
        this._setTimer();
      }
    }
  };

  return Queue;
}();

/* harmony default export */ __webpack_exports__["default"] = (Queue);

/***/ }),

/***/ "../rum-core/dist/es/common/service-factory.js":
/*!*****************************************************!*\
  !*** ../rum-core/dist/es/common/service-factory.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "serviceCreators": function() { return /* binding */ serviceCreators; },
/* harmony export */   "ServiceFactory": function() { return /* binding */ ServiceFactory; }
/* harmony export */ });
/* harmony import */ var _apm_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./apm-server */ "../rum-core/dist/es/common/apm-server.js");
/* harmony import */ var _config_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config-service */ "../rum-core/dist/es/common/config-service.js");
/* harmony import */ var _logging_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logging-service */ "../rum-core/dist/es/common/logging-service.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
var _serviceCreators;






var serviceCreators = (_serviceCreators = {}, _serviceCreators[_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE] = function () {
  return new _config_service__WEBPACK_IMPORTED_MODULE_1__.default();
}, _serviceCreators[_constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE] = function () {
  return new _logging_service__WEBPACK_IMPORTED_MODULE_2__.default({
    prefix: '[Elastic APM] '
  });
}, _serviceCreators[_constants__WEBPACK_IMPORTED_MODULE_0__.APM_SERVER] = function (factory) {
  var _factory$getService = factory.getService([_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE, _constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE]),
      configService = _factory$getService[0],
      loggingService = _factory$getService[1];

  return new _apm_server__WEBPACK_IMPORTED_MODULE_3__.default(configService, loggingService);
}, _serviceCreators);

var ServiceFactory = function () {
  function ServiceFactory() {
    this.instances = {};
    this.initialized = false;
  }

  var _proto = ServiceFactory.prototype;

  _proto.init = function init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    var configService = this.getService(_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.init();

    var _this$getService = this.getService([_constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE, _constants__WEBPACK_IMPORTED_MODULE_0__.APM_SERVER]),
        loggingService = _this$getService[0],
        apmServer = _this$getService[1];

    configService.events.observe(_constants__WEBPACK_IMPORTED_MODULE_0__.CONFIG_CHANGE, function () {
      var logLevel = configService.get('logLevel');
      loggingService.setLevel(logLevel);
    });
    apmServer.init();
  };

  _proto.getService = function getService(name) {
    var _this = this;

    if (typeof name === 'string') {
      if (!this.instances[name]) {
        if (typeof serviceCreators[name] === 'function') {
          this.instances[name] = serviceCreators[name](this);
        } else if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
          console.log('Cannot get service, No creator for: ' + name);
        }
      }

      return this.instances[name];
    } else if (Array.isArray(name)) {
      return name.map(function (n) {
        return _this.getService(n);
      });
    }
  };

  return ServiceFactory;
}();



/***/ }),

/***/ "../rum-core/dist/es/common/throttle.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/throttle.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ throttle; }
/* harmony export */ });
function throttle(fn, onThrottle, opts) {
  var context = this;
  var limit = opts.limit;
  var interval = opts.interval;
  var counter = 0;
  var timeoutId;
  return function () {
    counter++;

    if (typeof timeoutId === 'undefined') {
      timeoutId = setTimeout(function () {
        counter = 0;
        timeoutId = undefined;
      }, interval);
    }

    if (counter > limit && typeof onThrottle === 'function') {
      return onThrottle.apply(context, arguments);
    } else {
      return fn.apply(context, arguments);
    }
  };
}

/***/ }),

/***/ "../rum-core/dist/es/common/truncate.js":
/*!**********************************************!*\
  !*** ../rum-core/dist/es/common/truncate.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "truncate": function() { return /* binding */ truncate; },
/* harmony export */   "truncateModel": function() { return /* binding */ truncateModel; },
/* harmony export */   "SPAN_MODEL": function() { return /* binding */ SPAN_MODEL; },
/* harmony export */   "TRANSACTION_MODEL": function() { return /* binding */ TRANSACTION_MODEL; },
/* harmony export */   "ERROR_MODEL": function() { return /* binding */ ERROR_MODEL; },
/* harmony export */   "METADATA_MODEL": function() { return /* binding */ METADATA_MODEL; },
/* harmony export */   "RESPONSE_MODEL": function() { return /* binding */ RESPONSE_MODEL; }
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "../rum-core/dist/es/common/constants.js");

var METADATA_MODEL = {
  service: {
    name: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
    version: true,
    agent: {
      version: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true]
    },
    environment: true
  },
  labels: {
    '*': true
  }
};
var RESPONSE_MODEL = {
  '*': true,
  headers: {
    '*': true
  }
};
var DESTINATION_MODEL = {
  address: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT],
  service: {
    '*': [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true]
  }
};
var CONTEXT_MODEL = {
  user: {
    id: true,
    email: true,
    username: true
  },
  tags: {
    '*': true
  },
  http: {
    response: RESPONSE_MODEL
  },
  destination: DESTINATION_MODEL,
  response: RESPONSE_MODEL
};
var SPAN_MODEL = {
  name: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  type: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  trace_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  parent_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  transaction_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  subtype: true,
  action: true,
  context: CONTEXT_MODEL
};
var TRANSACTION_MODEL = {
  name: true,
  parent_id: true,
  type: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  trace_id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  span_count: {
    started: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true]
  },
  context: CONTEXT_MODEL
};
var ERROR_MODEL = {
  id: [_constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT, true],
  trace_id: true,
  transaction_id: true,
  parent_id: true,
  culprit: true,
  exception: {
    type: true
  },
  transaction: {
    type: true
  },
  context: CONTEXT_MODEL
};

function truncate(value, limit, required, placeholder) {
  if (limit === void 0) {
    limit = _constants__WEBPACK_IMPORTED_MODULE_0__.KEYWORD_LIMIT;
  }

  if (required === void 0) {
    required = false;
  }

  if (placeholder === void 0) {
    placeholder = 'N/A';
  }

  if (required && isEmpty(value)) {
    value = placeholder;
  }

  if (typeof value === 'string') {
    return value.substring(0, limit);
  }

  return value;
}

function isEmpty(value) {
  return value == null || value === '' || typeof value === 'undefined';
}

function replaceValue(target, key, currModel) {
  var value = truncate(target[key], currModel[0], currModel[1]);

  if (isEmpty(value)) {
    delete target[key];
    return;
  }

  target[key] = value;
}

function truncateModel(model, target, childTarget) {
  if (model === void 0) {
    model = {};
  }

  if (childTarget === void 0) {
    childTarget = target;
  }

  var keys = Object.keys(model);
  var emptyArr = [];

  var _loop = function _loop(i) {
    var currKey = keys[i];
    var currModel = model[currKey] === true ? emptyArr : model[currKey];

    if (!Array.isArray(currModel)) {
      truncateModel(currModel, target, childTarget[currKey]);
    } else {
      if (currKey === '*') {
        Object.keys(childTarget).forEach(function (key) {
          return replaceValue(childTarget, key, currModel);
        });
      } else {
        replaceValue(childTarget, currKey, currModel);
      }
    }
  };

  for (var i = 0; i < keys.length; i++) {
    _loop(i);
  }

  return target;
}



/***/ }),

/***/ "../rum-core/dist/es/common/url.js":
/*!*****************************************!*\
  !*** ../rum-core/dist/es/common/url.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Url": function() { return /* binding */ Url; },
/* harmony export */   "slugifyUrl": function() { return /* binding */ slugifyUrl; }
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "../rum-core/dist/es/common/utils.js");


function isDefaultPort(port, protocol) {
  switch (protocol) {
    case 'http:':
      return port === '80';

    case 'https:':
      return port === '443';
  }

  return true;
}

var RULES = [['#', 'hash'], ['?', 'query'], ['/', 'path'], ['@', 'auth', 1], [NaN, 'host', undefined, 1]];
var PROTOCOL_REGEX = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;
var Url = function () {
  function Url(url) {
    var _this$extractProtocol = this.extractProtocol(url || ''),
        protocol = _this$extractProtocol.protocol,
        address = _this$extractProtocol.address,
        slashes = _this$extractProtocol.slashes;

    var relative = !protocol && !slashes;
    var location = this.getLocation();
    var instructions = RULES.slice();
    address = address.replace('\\', '/');

    if (!slashes) {
      instructions[2] = [NaN, 'path'];
    }

    var index;

    for (var i = 0; i < instructions.length; i++) {
      var instruction = instructions[i];
      var parse = instruction[0];
      var key = instruction[1];

      if (typeof parse === 'string') {
        index = address.indexOf(parse);

        if (~index) {
          var instLength = instruction[2];

          if (instLength) {
            var newIndex = address.lastIndexOf(parse);
            index = Math.max(index, newIndex);
            this[key] = address.slice(0, index);
            address = address.slice(index + instLength);
          } else {
            this[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else {
        this[key] = address;
        address = '';
      }

      this[key] = this[key] || (relative && instruction[3] ? location[key] || '' : '');
      if (instruction[3]) this[key] = this[key].toLowerCase();
    }

    if (relative && this.path.charAt(0) !== '/') {
      this.path = '/' + this.path;
    }

    this.relative = relative;
    this.protocol = protocol || location.protocol;
    this.hostname = this.host;
    this.port = '';

    if (/:\d+$/.test(this.host)) {
      var value = this.host.split(':');
      var port = value.pop();
      var hostname = value.join(':');

      if (isDefaultPort(port, this.protocol)) {
        this.host = hostname;
      } else {
        this.port = port;
      }

      this.hostname = hostname;
    }

    this.origin = this.protocol && this.host && this.protocol !== 'file:' ? this.protocol + '//' + this.host : 'null';
    this.href = this.toString();
  }

  var _proto = Url.prototype;

  _proto.toString = function toString() {
    var result = this.protocol;
    result += '//';

    if (this.auth) {
      var REDACTED = '[REDACTED]';
      var userpass = this.auth.split(':');
      var username = userpass[0] ? REDACTED : '';
      var password = userpass[1] ? ':' + REDACTED : '';
      result += username + password + '@';
    }

    result += this.host;
    result += this.path;
    result += this.query;
    result += this.hash;
    return result;
  };

  _proto.getLocation = function getLocation() {
    var globalVar = {};

    if (_utils__WEBPACK_IMPORTED_MODULE_0__.isBrowser) {
      globalVar = window;
    }

    return globalVar.location;
  };

  _proto.extractProtocol = function extractProtocol(url) {
    var match = PROTOCOL_REGEX.exec(url);
    return {
      protocol: match[1] ? match[1].toLowerCase() : '',
      slashes: !!match[2],
      address: match[3]
    };
  };

  return Url;
}();
function slugifyUrl(urlStr, depth) {
  if (depth === void 0) {
    depth = 2;
  }

  var parsedUrl = new Url(urlStr);
  var query = parsedUrl.query,
      path = parsedUrl.path;
  var pathParts = path.substring(1).split('/');
  var redactString = ':id';
  var wildcard = '*';
  var specialCharsRegex = /\W|_/g;
  var digitsRegex = /[0-9]/g;
  var lowerCaseRegex = /[a-z]/g;
  var upperCaseRegex = /[A-Z]/g;
  var redactedParts = [];
  var redactedBefore = false;

  for (var index = 0; index < pathParts.length; index++) {
    var part = pathParts[index];

    if (redactedBefore || index > depth - 1) {
      if (part) {
        redactedParts.push(wildcard);
      }

      break;
    }

    var numberOfSpecialChars = (part.match(specialCharsRegex) || []).length;

    if (numberOfSpecialChars >= 2) {
      redactedParts.push(redactString);
      redactedBefore = true;
      continue;
    }

    var numberOfDigits = (part.match(digitsRegex) || []).length;

    if (numberOfDigits > 3 || part.length > 3 && numberOfDigits / part.length >= 0.3) {
      redactedParts.push(redactString);
      redactedBefore = true;
      continue;
    }

    var numberofUpperCase = (part.match(upperCaseRegex) || []).length;
    var numberofLowerCase = (part.match(lowerCaseRegex) || []).length;
    var lowerCaseRate = numberofLowerCase / part.length;
    var upperCaseRate = numberofUpperCase / part.length;

    if (part.length > 5 && (upperCaseRate > 0.3 && upperCaseRate < 0.6 || lowerCaseRate > 0.3 && lowerCaseRate < 0.6)) {
      redactedParts.push(redactString);
      redactedBefore = true;
      continue;
    }

    part && redactedParts.push(part);
  }

  var redacted = '/' + (redactedParts.length >= 2 ? redactedParts.join('/') : redactedParts.join('')) + (query ? '?{query}' : '');
  return redacted;
}

/***/ }),

/***/ "../rum-core/dist/es/common/utils.js":
/*!*******************************************!*\
  !*** ../rum-core/dist/es/common/utils.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "extend": function() { return /* binding */ extend; },
/* harmony export */   "merge": function() { return /* binding */ merge; },
/* harmony export */   "isUndefined": function() { return /* binding */ isUndefined; },
/* harmony export */   "noop": function() { return /* binding */ noop; },
/* harmony export */   "baseExtend": function() { return /* binding */ baseExtend; },
/* harmony export */   "bytesToHex": function() { return /* binding */ bytesToHex; },
/* harmony export */   "isCORSSupported": function() { return /* binding */ isCORSSupported; },
/* harmony export */   "isObject": function() { return /* binding */ isObject; },
/* harmony export */   "isFunction": function() { return /* binding */ isFunction; },
/* harmony export */   "isPlatformSupported": function() { return /* binding */ isPlatformSupported; },
/* harmony export */   "isDtHeaderValid": function() { return /* binding */ isDtHeaderValid; },
/* harmony export */   "parseDtHeaderValue": function() { return /* binding */ parseDtHeaderValue; },
/* harmony export */   "getServerTimingInfo": function() { return /* binding */ getServerTimingInfo; },
/* harmony export */   "getDtHeaderValue": function() { return /* binding */ getDtHeaderValue; },
/* harmony export */   "getTSHeaderValue": function() { return /* binding */ getTSHeaderValue; },
/* harmony export */   "getCurrentScript": function() { return /* binding */ getCurrentScript; },
/* harmony export */   "getElasticScript": function() { return /* binding */ getElasticScript; },
/* harmony export */   "getTimeOrigin": function() { return /* binding */ getTimeOrigin; },
/* harmony export */   "generateRandomId": function() { return /* binding */ generateRandomId; },
/* harmony export */   "getEarliestSpan": function() { return /* binding */ getEarliestSpan; },
/* harmony export */   "getLatestNonXHRSpan": function() { return /* binding */ getLatestNonXHRSpan; },
/* harmony export */   "getLatestXHRSpan": function() { return /* binding */ getLatestXHRSpan; },
/* harmony export */   "getDuration": function() { return /* binding */ getDuration; },
/* harmony export */   "getTime": function() { return /* binding */ getTime; },
/* harmony export */   "now": function() { return /* binding */ now; },
/* harmony export */   "rng": function() { return /* binding */ rng; },
/* harmony export */   "checkSameOrigin": function() { return /* binding */ checkSameOrigin; },
/* harmony export */   "scheduleMacroTask": function() { return /* binding */ scheduleMacroTask; },
/* harmony export */   "scheduleMicroTask": function() { return /* binding */ scheduleMicroTask; },
/* harmony export */   "setLabel": function() { return /* binding */ setLabel; },
/* harmony export */   "setRequestHeader": function() { return /* binding */ setRequestHeader; },
/* harmony export */   "stripQueryStringFromUrl": function() { return /* binding */ stripQueryStringFromUrl; },
/* harmony export */   "find": function() { return /* binding */ find; },
/* harmony export */   "removeInvalidChars": function() { return /* binding */ removeInvalidChars; },
/* harmony export */   "PERF": function() { return /* binding */ PERF; },
/* harmony export */   "isPerfTimelineSupported": function() { return /* binding */ isPerfTimelineSupported; },
/* harmony export */   "isBrowser": function() { return /* binding */ isBrowser; },
/* harmony export */   "isPerfTypeSupported": function() { return /* binding */ isPerfTypeSupported; }
/* harmony export */ });
/* harmony import */ var _polyfills__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfills */ "../rum-core/dist/es/common/polyfills.js");

var slice = [].slice;
var isBrowser = typeof window !== 'undefined';
var PERF = isBrowser && typeof performance !== 'undefined' ? performance : {};

function isCORSSupported() {
  var xhr = new window.XMLHttpRequest();
  return 'withCredentials' in xhr;
}

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToHex(buffer) {
  var hexOctets = [];

  for (var _i = 0; _i < buffer.length; _i++) {
    hexOctets.push(byteToHex[buffer[_i]]);
  }

  return hexOctets.join('');
}

var destination = new Uint8Array(16);

function rng() {
  if (typeof crypto != 'undefined' && typeof crypto.getRandomValues == 'function') {
    return crypto.getRandomValues(destination);
  } else if (typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function') {
    return msCrypto.getRandomValues(destination);
  }

  return destination;
}

function generateRandomId(length) {
  var id = bytesToHex(rng());
  return id.substr(0, length);
}

function getDtHeaderValue(span) {
  var dtVersion = '00';
  var dtUnSampledFlags = '00';
  var dtSampledFlags = '01';

  if (span && span.traceId && span.id && span.parentId) {
    var flags = span.sampled ? dtSampledFlags : dtUnSampledFlags;
    var id = span.sampled ? span.id : span.parentId;
    return dtVersion + '-' + span.traceId + '-' + id + '-' + flags;
  }
}

function parseDtHeaderValue(value) {
  var parsed = /^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/.exec(value);

  if (parsed) {
    var flags = parsed[4];
    var sampled = flags !== '00';
    return {
      traceId: parsed[2],
      id: parsed[3],
      sampled: sampled
    };
  }
}

function isDtHeaderValid(header) {
  return /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(header) && header.slice(3, 35) !== '00000000000000000000000000000000' && header.slice(36, 52) !== '0000000000000000';
}

function getTSHeaderValue(_ref) {
  var sampleRate = _ref.sampleRate;

  if (typeof sampleRate !== 'number' || String(sampleRate).length > 256) {
    return;
  }

  var NAMESPACE = 'es';
  var SEPARATOR = '=';
  return "" + NAMESPACE + SEPARATOR + "s:" + sampleRate;
}

function setRequestHeader(target, name, value) {
  if (typeof target.setRequestHeader === 'function') {
    target.setRequestHeader(name, value);
  } else if (target.headers && typeof target.headers.append === 'function') {
    target.headers.append(name, value);
  } else {
    target[name] = value;
  }
}

function checkSameOrigin(source, target) {
  var isSame = false;

  if (typeof target === 'string') {
    isSame = source === target;
  } else if (target && typeof target.test === 'function') {
    isSame = target.test(source);
  } else if (Array.isArray(target)) {
    target.forEach(function (t) {
      if (!isSame) {
        isSame = checkSameOrigin(source, t);
      }
    });
  }

  return isSame;
}

function isPlatformSupported() {
  return isBrowser && typeof Set === 'function' && typeof JSON.stringify === 'function' && PERF && typeof PERF.now === 'function' && isCORSSupported();
}

function setLabel(key, value, obj) {
  if (!obj || !key) return;
  var skey = removeInvalidChars(key);
  var valueType = typeof value;

  if (value != undefined && valueType !== 'boolean' && valueType !== 'number') {
    value = String(value);
  }

  obj[skey] = value;
  return obj;
}

function getServerTimingInfo(serverTimingEntries) {
  if (serverTimingEntries === void 0) {
    serverTimingEntries = [];
  }

  var serverTimingInfo = [];
  var entrySeparator = ', ';
  var valueSeparator = ';';

  for (var _i2 = 0; _i2 < serverTimingEntries.length; _i2++) {
    var _serverTimingEntries$ = serverTimingEntries[_i2],
        name = _serverTimingEntries$.name,
        duration = _serverTimingEntries$.duration,
        description = _serverTimingEntries$.description;
    var timingValue = name;

    if (description) {
      timingValue += valueSeparator + 'desc=' + description;
    }

    if (duration) {
      timingValue += valueSeparator + 'dur=' + duration;
    }

    serverTimingInfo.push(timingValue);
  }

  return serverTimingInfo.join(entrySeparator);
}

function getTimeOrigin() {
  return PERF.timing.fetchStart;
}

function stripQueryStringFromUrl(url) {
  return url && url.split('?')[0];
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function isFunction(value) {
  return typeof value === 'function';
}

function baseExtend(dst, objs, deep) {
  for (var i = 0, ii = objs.length; i < ii; ++i) {
    var obj = objs[i];
    if (!isObject(obj) && !isFunction(obj)) continue;
    var keys = Object.keys(obj);

    for (var j = 0, jj = keys.length; j < jj; j++) {
      var key = keys[j];
      var src = obj[key];

      if (deep && isObject(src)) {
        if (!isObject(dst[key])) dst[key] = Array.isArray(src) ? [] : {};
        baseExtend(dst[key], [src], false);
      } else {
        dst[key] = src;
      }
    }
  }

  return dst;
}

function getElasticScript() {
  if (typeof document !== 'undefined') {
    var scripts = document.getElementsByTagName('script');

    for (var i = 0, l = scripts.length; i < l; i++) {
      var sc = scripts[i];

      if (sc.src.indexOf('elastic') > 0) {
        return sc;
      }
    }
  }
}

function getCurrentScript() {
  if (typeof document !== 'undefined') {
    var currentScript = document.currentScript;

    if (!currentScript) {
      return getElasticScript();
    }

    return currentScript;
  }
}

function extend(dst) {
  return baseExtend(dst, slice.call(arguments, 1), false);
}

function merge(dst) {
  return baseExtend(dst, slice.call(arguments, 1), true);
}

function isUndefined(obj) {
  return typeof obj === 'undefined';
}

function noop() {}

function find(array, predicate, thisArg) {
  if (array == null) {
    throw new TypeError('array is null or not defined');
  }

  var o = Object(array);
  var len = o.length >>> 0;

  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }

  var k = 0;

  while (k < len) {
    var kValue = o[k];

    if (predicate.call(thisArg, kValue, k, o)) {
      return kValue;
    }

    k++;
  }

  return undefined;
}

function removeInvalidChars(key) {
  return key.replace(/[.*"]/g, '_');
}

function getLatestSpan(spans, typeFilter) {
  var latestSpan = null;

  for (var _i3 = 0; _i3 < spans.length; _i3++) {
    var span = spans[_i3];

    if (typeFilter && typeFilter(span.type) && (!latestSpan || latestSpan._end < span._end)) {
      latestSpan = span;
    }
  }

  return latestSpan;
}

function getLatestNonXHRSpan(spans) {
  return getLatestSpan(spans, function (type) {
    return String(type).indexOf('external') === -1;
  });
}

function getLatestXHRSpan(spans) {
  return getLatestSpan(spans, function (type) {
    return String(type).indexOf('external') !== -1;
  });
}

function getEarliestSpan(spans) {
  var earliestSpan = spans[0];

  for (var _i4 = 1; _i4 < spans.length; _i4++) {
    var span = spans[_i4];

    if (earliestSpan._start > span._start) {
      earliestSpan = span;
    }
  }

  return earliestSpan;
}

function now() {
  return PERF.now();
}

function getTime(time) {
  return typeof time === 'number' && time >= 0 ? time : now();
}

function getDuration(start, end) {
  if (isUndefined(end) || isUndefined(start)) {
    return null;
  }

  return parseInt(end - start);
}

function scheduleMacroTask(callback) {
  setTimeout(callback, 0);
}

function scheduleMicroTask(callback) {
  _polyfills__WEBPACK_IMPORTED_MODULE_0__.Promise.resolve().then(callback);
}

function isPerfTimelineSupported() {
  return typeof PERF.getEntriesByType === 'function';
}

function isPerfTypeSupported(type) {
  return typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.indexOf(type) >= 0;
}



/***/ }),

/***/ "../rum-core/dist/es/error-logging/error-logging.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/error-logging/error-logging.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _stack_trace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stack-trace */ "../rum-core/dist/es/error-logging/stack-trace.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/context */ "../rum-core/dist/es/common/context.js");
/* harmony import */ var _common_truncate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/truncate */ "../rum-core/dist/es/common/truncate.js");
var _excluded = ["tags"];

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}





var IGNORE_KEYS = ['stack', 'message'];

function getErrorProperties(error) {
  var propertyFound = false;
  var properties = {};
  Object.keys(error).forEach(function (key) {
    if (IGNORE_KEYS.indexOf(key) >= 0) {
      return;
    }

    var val = error[key];

    if (val == null || typeof val === 'function') {
      return;
    }

    if (typeof val === 'object') {
      if (typeof val.toISOString !== 'function') return;
      val = val.toISOString();
    }

    properties[key] = val;
    propertyFound = true;
  });

  if (propertyFound) {
    return properties;
  }
}

var ErrorLogging = function () {
  function ErrorLogging(apmServer, configService, transactionService) {
    this._apmServer = apmServer;
    this._configService = configService;
    this._transactionService = transactionService;
  }

  var _proto = ErrorLogging.prototype;

  _proto.createErrorDataModel = function createErrorDataModel(errorEvent) {
    var frames = (0,_stack_trace__WEBPACK_IMPORTED_MODULE_0__.createStackTraces)(errorEvent);
    var filteredFrames = (0,_stack_trace__WEBPACK_IMPORTED_MODULE_0__.filterInvalidFrames)(frames);
    var culprit = '(inline script)';
    var lastFrame = filteredFrames[filteredFrames.length - 1];

    if (lastFrame && lastFrame.filename) {
      culprit = lastFrame.filename;
    }

    var message = errorEvent.message,
        error = errorEvent.error;
    var errorMessage = message;
    var errorType = '';
    var errorContext = {};

    if (error && typeof error === 'object') {
      errorMessage = errorMessage || error.message;
      errorType = error.name;
      var customProperties = getErrorProperties(error);

      if (customProperties) {
        errorContext.custom = customProperties;
      }
    }

    if (!errorType) {
      if (errorMessage && errorMessage.indexOf(':') > -1) {
        errorType = errorMessage.split(':')[0];
      }
    }

    var currentTransaction = this._transactionService.getCurrentTransaction();

    var transactionContext = currentTransaction ? currentTransaction.context : {};

    var _this$_configService$ = this._configService.get('context'),
        tags = _this$_configService$.tags,
        configContext = _objectWithoutPropertiesLoose(_this$_configService$, _excluded);

    var pageContext = (0,_common_context__WEBPACK_IMPORTED_MODULE_1__.getPageContext)();
    var context = (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.merge)({}, pageContext, transactionContext, configContext, errorContext);
    var errorObject = {
      id: (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.generateRandomId)(),
      culprit: culprit,
      exception: {
        message: errorMessage,
        stacktrace: filteredFrames,
        type: errorType
      },
      context: context
    };

    if (currentTransaction) {
      errorObject = (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.extend)(errorObject, {
        trace_id: currentTransaction.traceId,
        parent_id: currentTransaction.id,
        transaction_id: currentTransaction.id,
        transaction: {
          type: currentTransaction.type,
          sampled: currentTransaction.sampled
        }
      });
    }

    return (0,_common_truncate__WEBPACK_IMPORTED_MODULE_3__.truncateModel)(_common_truncate__WEBPACK_IMPORTED_MODULE_3__.ERROR_MODEL, errorObject);
  };

  _proto.logErrorEvent = function logErrorEvent(errorEvent) {
    if (typeof errorEvent === 'undefined') {
      return;
    }

    var errorObject = this.createErrorDataModel(errorEvent);

    if (typeof errorObject.exception.message === 'undefined') {
      return;
    }

    this._apmServer.addError(errorObject);
  };

  _proto.registerListeners = function registerListeners() {
    var _this = this;

    window.addEventListener('error', function (errorEvent) {
      return _this.logErrorEvent(errorEvent);
    });
    window.addEventListener('unhandledrejection', function (promiseRejectionEvent) {
      return _this.logPromiseEvent(promiseRejectionEvent);
    });
  };

  _proto.logPromiseEvent = function logPromiseEvent(promiseRejectionEvent) {
    var prefix = 'Unhandled promise rejection: ';
    var reason = promiseRejectionEvent.reason;

    if (reason == null) {
      reason = '<no reason specified>';
    }

    var errorEvent;

    if (typeof reason.message === 'string') {
      var name = reason.name ? reason.name + ': ' : '';
      errorEvent = {
        error: reason,
        message: prefix + name + reason.message
      };
    } else {
      reason = typeof reason === 'object' ? '<object>' : typeof reason === 'function' ? '<function>' : reason;
      errorEvent = {
        message: prefix + reason
      };
    }

    this.logErrorEvent(errorEvent);
  };

  _proto.logError = function logError(messageOrError) {
    var errorEvent = {};

    if (typeof messageOrError === 'string') {
      errorEvent.message = messageOrError;
    } else {
      errorEvent.error = messageOrError;
    }

    return this.logErrorEvent(errorEvent);
  };

  return ErrorLogging;
}();

/* harmony default export */ __webpack_exports__["default"] = (ErrorLogging);

/***/ }),

/***/ "../rum-core/dist/es/error-logging/index.js":
/*!**************************************************!*\
  !*** ../rum-core/dist/es/error-logging/index.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "registerServices": function() { return /* binding */ registerServices; }
/* harmony export */ });
/* harmony import */ var _error_logging__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./error-logging */ "../rum-core/dist/es/error-logging/error-logging.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_service_factory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/service-factory */ "../rum-core/dist/es/common/service-factory.js");




function registerServices() {
  _common_service_factory__WEBPACK_IMPORTED_MODULE_0__.serviceCreators.ErrorLogging = function (serviceFactory) {
    var _serviceFactory$getSe = serviceFactory.getService([_common_constants__WEBPACK_IMPORTED_MODULE_1__.APM_SERVER, _common_constants__WEBPACK_IMPORTED_MODULE_1__.CONFIG_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_SERVICE]),
        apmServer = _serviceFactory$getSe[0],
        configService = _serviceFactory$getSe[1],
        transactionService = _serviceFactory$getSe[2];

    return new _error_logging__WEBPACK_IMPORTED_MODULE_2__.default(apmServer, configService, transactionService);
  };
}



/***/ }),

/***/ "../rum-core/dist/es/error-logging/stack-trace.js":
/*!********************************************************!*\
  !*** ../rum-core/dist/es/error-logging/stack-trace.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createStackTraces": function() { return /* binding */ createStackTraces; },
/* harmony export */   "filterInvalidFrames": function() { return /* binding */ filterInvalidFrames; }
/* harmony export */ });
/* harmony import */ var error_stack_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! error-stack-parser */ "../../node_modules/error-stack-parser/error-stack-parser.js");
/* harmony import */ var error_stack_parser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(error_stack_parser__WEBPACK_IMPORTED_MODULE_0__);


function filePathToFileName(fileUrl) {
  var origin = window.location.origin || window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

  if (fileUrl.indexOf(origin) > -1) {
    fileUrl = fileUrl.replace(origin + '/', '');
  }

  return fileUrl;
}

function cleanFilePath(filePath) {
  if (filePath === void 0) {
    filePath = '';
  }

  if (filePath === '<anonymous>') {
    filePath = '';
  }

  return filePath;
}

function isFileInline(fileUrl) {
  if (fileUrl) {
    return window.location.href.indexOf(fileUrl) === 0;
  }

  return false;
}

function normalizeStackFrames(stackFrames) {
  return stackFrames.map(function (frame) {
    if (frame.functionName) {
      frame.functionName = normalizeFunctionName(frame.functionName);
    }

    return frame;
  });
}

function normalizeFunctionName(fnName) {
  var parts = fnName.split('/');

  if (parts.length > 1) {
    fnName = ['Object', parts[parts.length - 1]].join('.');
  } else {
    fnName = parts[0];
  }

  fnName = fnName.replace(/.<$/gi, '.<anonymous>');
  fnName = fnName.replace(/^Anonymous function$/, '<anonymous>');
  parts = fnName.split('.');

  if (parts.length > 1) {
    fnName = parts[parts.length - 1];
  } else {
    fnName = parts[0];
  }

  return fnName;
}

function createStackTraces(errorEvent) {
  var error = errorEvent.error,
      filename = errorEvent.filename,
      lineno = errorEvent.lineno,
      colno = errorEvent.colno;
  var stackTraces = [];

  if (error) {
    try {
      stackTraces = error_stack_parser__WEBPACK_IMPORTED_MODULE_0___default().parse(error);
    } catch (e) {}
  }

  if (stackTraces.length === 0) {
    stackTraces = [{
      fileName: filename,
      lineNumber: lineno,
      columnNumber: colno
    }];
  }

  var normalizedStackTraces = normalizeStackFrames(stackTraces);
  return normalizedStackTraces.map(function (stack) {
    var fileName = stack.fileName,
        lineNumber = stack.lineNumber,
        columnNumber = stack.columnNumber,
        _stack$functionName = stack.functionName,
        functionName = _stack$functionName === void 0 ? '<anonymous>' : _stack$functionName;

    if (!fileName && !lineNumber) {
      return {};
    }

    if (!columnNumber && !lineNumber) {
      return {};
    }

    var filePath = cleanFilePath(fileName);
    var cleanedFileName = filePathToFileName(filePath);

    if (isFileInline(filePath)) {
      cleanedFileName = '(inline script)';
    }

    return {
      abs_path: fileName,
      filename: cleanedFileName,
      function: functionName,
      lineno: lineNumber,
      colno: columnNumber
    };
  });
}
function filterInvalidFrames(frames) {
  return frames.filter(function (_ref) {
    var filename = _ref.filename,
        lineno = _ref.lineno;
    return typeof filename !== 'undefined' && typeof lineno !== 'undefined';
  });
}

/***/ }),

/***/ "../rum-core/dist/es/index.js":
/*!************************************!*\
  !*** ../rum-core/dist/es/index.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createServiceFactory": function() { return /* binding */ createServiceFactory; },
/* harmony export */   "ServiceFactory": function() { return /* reexport safe */ _common_service_factory__WEBPACK_IMPORTED_MODULE_2__.ServiceFactory; },
/* harmony export */   "patchAll": function() { return /* reexport safe */ _common_patching__WEBPACK_IMPORTED_MODULE_3__.patchAll; },
/* harmony export */   "patchEventHandler": function() { return /* reexport safe */ _common_patching__WEBPACK_IMPORTED_MODULE_3__.patchEventHandler; },
/* harmony export */   "isPlatformSupported": function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.isPlatformSupported; },
/* harmony export */   "isBrowser": function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.isBrowser; },
/* harmony export */   "getInstrumentationFlags": function() { return /* reexport safe */ _common_instrument__WEBPACK_IMPORTED_MODULE_5__.getInstrumentationFlags; },
/* harmony export */   "createTracer": function() { return /* reexport safe */ _opentracing__WEBPACK_IMPORTED_MODULE_6__.createTracer; },
/* harmony export */   "scheduleMicroTask": function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMicroTask; },
/* harmony export */   "scheduleMacroTask": function() { return /* reexport safe */ _common_utils__WEBPACK_IMPORTED_MODULE_4__.scheduleMacroTask; },
/* harmony export */   "afterFrame": function() { return /* reexport safe */ _common_after_frame__WEBPACK_IMPORTED_MODULE_7__.default; },
/* harmony export */   "ERROR": function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.ERROR; },
/* harmony export */   "PAGE_LOAD_DELAY": function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.PAGE_LOAD_DELAY; },
/* harmony export */   "PAGE_LOAD": function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.PAGE_LOAD; },
/* harmony export */   "CONFIG_SERVICE": function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.CONFIG_SERVICE; },
/* harmony export */   "LOGGING_SERVICE": function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.LOGGING_SERVICE; },
/* harmony export */   "TRANSACTION_SERVICE": function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.TRANSACTION_SERVICE; },
/* harmony export */   "APM_SERVER": function() { return /* reexport safe */ _common_constants__WEBPACK_IMPORTED_MODULE_8__.APM_SERVER; },
/* harmony export */   "bootstrap": function() { return /* reexport safe */ _bootstrap__WEBPACK_IMPORTED_MODULE_9__.bootstrap; },
/* harmony export */   "observePageVisibility": function() { return /* reexport safe */ _common_page_visibility__WEBPACK_IMPORTED_MODULE_10__.observePageVisibility; }
/* harmony export */ });
/* harmony import */ var _error_logging__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error-logging */ "../rum-core/dist/es/error-logging/index.js");
/* harmony import */ var _performance_monitoring__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./performance-monitoring */ "../rum-core/dist/es/performance-monitoring/index.js");
/* harmony import */ var _common_service_factory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/service-factory */ "../rum-core/dist/es/common/service-factory.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_patching__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common/patching */ "../rum-core/dist/es/common/patching/index.js");
/* harmony import */ var _common_page_visibility__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./common/page-visibility */ "../rum-core/dist/es/common/page-visibility.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_instrument__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./common/instrument */ "../rum-core/dist/es/common/instrument.js");
/* harmony import */ var _common_after_frame__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./common/after-frame */ "../rum-core/dist/es/common/after-frame.js");
/* harmony import */ var _bootstrap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./bootstrap */ "../rum-core/dist/es/bootstrap.js");
/* harmony import */ var _opentracing__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./opentracing */ "../rum-core/dist/es/opentracing/index.js");












function createServiceFactory() {
  (0,_performance_monitoring__WEBPACK_IMPORTED_MODULE_0__.registerServices)();
  (0,_error_logging__WEBPACK_IMPORTED_MODULE_1__.registerServices)();
  var serviceFactory = new _common_service_factory__WEBPACK_IMPORTED_MODULE_2__.ServiceFactory();
  return serviceFactory;
}



/***/ }),

/***/ "../rum-core/dist/es/opentracing/index.js":
/*!************************************************!*\
  !*** ../rum-core/dist/es/opentracing/index.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Span": function() { return /* reexport safe */ _span__WEBPACK_IMPORTED_MODULE_2__.default; },
/* harmony export */   "Tracer": function() { return /* reexport safe */ _tracer__WEBPACK_IMPORTED_MODULE_1__.default; },
/* harmony export */   "createTracer": function() { return /* binding */ createTracer; }
/* harmony export */ });
/* harmony import */ var _tracer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tracer */ "../rum-core/dist/es/opentracing/tracer.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/opentracing/span.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");




function createTracer(serviceFactory) {
  var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring');
  var transactionService = serviceFactory.getService(_common_constants__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
  var errorLogging = serviceFactory.getService('ErrorLogging');
  var loggingService = serviceFactory.getService(_common_constants__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE);
  return new _tracer__WEBPACK_IMPORTED_MODULE_1__.default(performanceMonitoring, transactionService, loggingService, errorLogging);
}



/***/ }),

/***/ "../rum-core/dist/es/opentracing/span.js":
/*!***********************************************!*\
  !*** ../rum-core/dist/es/opentracing/span.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var opentracing_lib_span__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! opentracing/lib/span */ "../../node_modules/opentracing/lib/span.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _performance_monitoring_transaction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../performance-monitoring/transaction */ "../rum-core/dist/es/performance-monitoring/transaction.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}





var Span = function (_otSpan) {
  _inheritsLoose(Span, _otSpan);

  function Span(tracer, span) {
    var _this;

    _this = _otSpan.call(this) || this;
    _this.__tracer = tracer;
    _this.span = span;
    _this.isTransaction = span instanceof _performance_monitoring_transaction__WEBPACK_IMPORTED_MODULE_1__.default;
    _this.spanContext = {
      id: span.id,
      traceId: span.traceId,
      sampled: span.sampled
    };
    return _this;
  }

  var _proto = Span.prototype;

  _proto._context = function _context() {
    return this.spanContext;
  };

  _proto._tracer = function _tracer() {
    return this.__tracer;
  };

  _proto._setOperationName = function _setOperationName(name) {
    this.span.name = name;
  };

  _proto._addTags = function _addTags(keyValuePairs) {
    var tags = (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.extend)({}, keyValuePairs);

    if (tags.type) {
      this.span.type = tags.type;
      delete tags.type;
    }

    if (this.isTransaction) {
      var userId = tags['user.id'];
      var username = tags['user.username'];
      var email = tags['user.email'];

      if (userId || username || email) {
        this.span.addContext({
          user: {
            id: userId,
            username: username,
            email: email
          }
        });
        delete tags['user.id'];
        delete tags['user.username'];
        delete tags['user.email'];
      }
    }

    this.span.addLabels(tags);
  };

  _proto._log = function _log(log, timestamp) {
    if (log.event === 'error') {
      if (log['error.object']) {
        this.__tracer.errorLogging.logError(log['error.object']);
      } else if (log.message) {
        this.__tracer.errorLogging.logError(log.message);
      }
    }
  };

  _proto._finish = function _finish(finishTime) {
    this.span.end();

    if (finishTime) {
      this.span._end = finishTime - (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.getTimeOrigin)();
    }
  };

  return Span;
}(opentracing_lib_span__WEBPACK_IMPORTED_MODULE_0__.Span);

/* harmony default export */ __webpack_exports__["default"] = (Span);

/***/ }),

/***/ "../rum-core/dist/es/opentracing/tracer.js":
/*!*************************************************!*\
  !*** ../rum-core/dist/es/opentracing/tracer.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var opentracing_lib_tracer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! opentracing/lib/tracer */ "../../node_modules/opentracing/lib/tracer.js");
/* harmony import */ var opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! opentracing/lib/constants */ "../../node_modules/opentracing/lib/constants.js");
/* harmony import */ var opentracing_lib_span__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! opentracing/lib/span */ "../../node_modules/opentracing/lib/span.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/opentracing/span.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}








var Tracer = function (_otTracer) {
  _inheritsLoose(Tracer, _otTracer);

  function Tracer(performanceMonitoring, transactionService, loggingService, errorLogging) {
    var _this;

    _this = _otTracer.call(this) || this;
    _this.performanceMonitoring = performanceMonitoring;
    _this.transactionService = transactionService;
    _this.loggingService = loggingService;
    _this.errorLogging = errorLogging;
    return _this;
  }

  var _proto = Tracer.prototype;

  _proto._startSpan = function _startSpan(name, options) {
    var spanOptions = {
      managed: true
    };

    if (options) {
      spanOptions.timestamp = options.startTime;

      if (options.childOf) {
        spanOptions.parentId = options.childOf.id;
      } else if (options.references && options.references.length > 0) {
        if (options.references.length > 1) {
          if (_state__WEBPACK_IMPORTED_MODULE_3__.__DEV__) {
            this.loggingService.debug('Elastic APM OpenTracing: Unsupported number of references, only the first childOf reference will be recorded.');
          }
        }

        var childRef = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.find)(options.references, function (ref) {
          return ref.type() === opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.REFERENCE_CHILD_OF;
        });

        if (childRef) {
          spanOptions.parentId = childRef.referencedContext().id;
        }
      }
    }

    var span;
    var currentTransaction = this.transactionService.getCurrentTransaction();

    if (currentTransaction) {
      span = this.transactionService.startSpan(name, undefined, spanOptions);
    } else {
      span = this.transactionService.startTransaction(name, undefined, spanOptions);
    }

    if (!span) {
      return new opentracing_lib_span__WEBPACK_IMPORTED_MODULE_2__.Span();
    }

    if (spanOptions.timestamp) {
      span._start = spanOptions.timestamp - (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.getTimeOrigin)();
    }

    var otSpan = new _span__WEBPACK_IMPORTED_MODULE_5__.default(this, span);

    if (options && options.tags) {
      otSpan.addTags(options.tags);
    }

    return otSpan;
  };

  _proto._inject = function _inject(spanContext, format, carrier) {
    switch (format) {
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_TEXT_MAP:
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_HTTP_HEADERS:
        this.performanceMonitoring.injectDtHeader(spanContext, carrier);
        break;

      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_BINARY:
        if (_state__WEBPACK_IMPORTED_MODULE_3__.__DEV__) {
          this.loggingService.debug('Elastic APM OpenTracing: binary carrier format is not supported.');
        }

        break;
    }
  };

  _proto._extract = function _extract(format, carrier) {
    var ctx;

    switch (format) {
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_TEXT_MAP:
      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_HTTP_HEADERS:
        ctx = this.performanceMonitoring.extractDtHeader(carrier);
        break;

      case opentracing_lib_constants__WEBPACK_IMPORTED_MODULE_1__.FORMAT_BINARY:
        if (_state__WEBPACK_IMPORTED_MODULE_3__.__DEV__) {
          this.loggingService.debug('Elastic APM OpenTracing: binary carrier format is not supported.');
        }

        break;
    }

    if (!ctx) {
      ctx = null;
    }

    return ctx;
  };

  return Tracer;
}(opentracing_lib_tracer__WEBPACK_IMPORTED_MODULE_0__.Tracer);

/* harmony default export */ __webpack_exports__["default"] = (Tracer);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/breakdown.js":
/*!***************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/breakdown.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "captureBreakdown": function() { return /* binding */ captureBreakdown; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");


var pageLoadBreakdowns = [['domainLookupStart', 'domainLookupEnd', 'DNS'], ['connectStart', 'connectEnd', 'TCP'], ['requestStart', 'responseStart', 'Request'], ['responseStart', 'responseEnd', 'Response'], ['domLoading', 'domComplete', 'Processing'], ['loadEventStart', 'loadEventEnd', 'Load']];

function getValue(value) {
  return {
    value: value
  };
}

function calculateSelfTime(transaction) {
  var spans = transaction.spans,
      _start = transaction._start,
      _end = transaction._end;

  if (spans.length === 0) {
    return transaction.duration();
  }

  spans.sort(function (span1, span2) {
    return span1._start - span2._start;
  });
  var span = spans[0];
  var spanEnd = span._end;
  var spanStart = span._start;
  var lastContinuousEnd = spanEnd;
  var selfTime = spanStart - _start;

  for (var i = 1; i < spans.length; i++) {
    span = spans[i];
    spanStart = span._start;
    spanEnd = span._end;

    if (spanStart > lastContinuousEnd) {
      selfTime += spanStart - lastContinuousEnd;
      lastContinuousEnd = spanEnd;
    } else if (spanEnd > lastContinuousEnd) {
      lastContinuousEnd = spanEnd;
    }
  }

  if (lastContinuousEnd < _end) {
    selfTime += _end - lastContinuousEnd;
  }

  return selfTime;
}

function groupSpans(transaction) {
  var spanMap = {};
  var transactionSelfTime = calculateSelfTime(transaction);
  spanMap['app'] = {
    count: 1,
    duration: transactionSelfTime
  };
  var spans = transaction.spans;

  for (var i = 0; i < spans.length; i++) {
    var span = spans[i];
    var duration = span.duration();

    if (duration === 0 || duration == null) {
      continue;
    }

    var type = span.type,
        subtype = span.subtype;
    var key = type.replace(_common_constants__WEBPACK_IMPORTED_MODULE_0__.TRUNCATED_TYPE, '');

    if (subtype) {
      key += '.' + subtype;
    }

    if (!spanMap[key]) {
      spanMap[key] = {
        duration: 0,
        count: 0
      };
    }

    spanMap[key].count++;
    spanMap[key].duration += duration;
  }

  return spanMap;
}

function getSpanBreakdown(transactionDetails, _ref) {
  var details = _ref.details,
      _ref$count = _ref.count,
      count = _ref$count === void 0 ? 1 : _ref$count,
      duration = _ref.duration;
  return {
    transaction: transactionDetails,
    span: details,
    samples: {
      'span.self_time.count': getValue(count),
      'span.self_time.sum.us': getValue(duration)
    }
  };
}

function captureBreakdown(transaction, timings) {
  if (timings === void 0) {
    timings = _common_utils__WEBPACK_IMPORTED_MODULE_1__.PERF.timing;
  }

  var breakdowns = [];
  var trDuration = transaction.duration();
  var name = transaction.name,
      type = transaction.type,
      sampled = transaction.sampled;
  var transactionDetails = {
    name: name,
    type: type
  };
  breakdowns.push({
    transaction: transactionDetails,
    samples: {
      'transaction.duration.count': getValue(1),
      'transaction.duration.sum.us': getValue(trDuration),
      'transaction.breakdown.count': getValue(sampled ? 1 : 0)
    }
  });

  if (!sampled) {
    return breakdowns;
  }

  if (type === _common_constants__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD && timings) {
    for (var i = 0; i < pageLoadBreakdowns.length; i++) {
      var current = pageLoadBreakdowns[i];
      var start = timings[current[0]];
      var end = timings[current[1]];
      var duration = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getDuration)(start, end);

      if (duration === 0 || duration == null) {
        continue;
      }

      breakdowns.push(getSpanBreakdown(transactionDetails, {
        details: {
          type: current[2]
        },
        duration: duration
      }));
    }
  } else {
    var spanMap = groupSpans(transaction);
    Object.keys(spanMap).forEach(function (key) {
      var _key$split = key.split('.'),
          type = _key$split[0],
          subtype = _key$split[1];

      var _spanMap$key = spanMap[key],
          duration = _spanMap$key.duration,
          count = _spanMap$key.count;
      breakdowns.push(getSpanBreakdown(transactionDetails, {
        details: {
          type: type,
          subtype: subtype
        },
        duration: duration,
        count: count
      }));
    });
  }

  return breakdowns;
}

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/capture-navigation.js":
/*!************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/capture-navigation.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPageLoadMarks": function() { return /* binding */ getPageLoadMarks; },
/* harmony export */   "captureNavigation": function() { return /* binding */ captureNavigation; },
/* harmony export */   "createNavigationTimingSpans": function() { return /* binding */ createNavigationTimingSpans; },
/* harmony export */   "createResourceTimingSpans": function() { return /* binding */ createResourceTimingSpans; },
/* harmony export */   "createUserTimingSpans": function() { return /* binding */ createUserTimingSpans; },
/* harmony export */   "NAVIGATION_TIMING_MARKS": function() { return /* binding */ NAVIGATION_TIMING_MARKS; },
/* harmony export */   "COMPRESSED_NAV_TIMING_MARKS": function() { return /* binding */ COMPRESSED_NAV_TIMING_MARKS; }
/* harmony export */ });
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/performance-monitoring/span.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");




var eventPairs = [['domainLookupStart', 'domainLookupEnd', 'Domain lookup'], ['connectStart', 'connectEnd', 'Making a connection to the server'], ['requestStart', 'responseEnd', 'Requesting and receiving the document'], ['domLoading', 'domInteractive', 'Parsing the document, executing sync. scripts'], ['domContentLoadedEventStart', 'domContentLoadedEventEnd', 'Fire "DOMContentLoaded" event'], ['loadEventStart', 'loadEventEnd', 'Fire "load" event']];

function shouldCreateSpan(start, end, trStart, trEnd, baseTime) {
  if (baseTime === void 0) {
    baseTime = 0;
  }

  return typeof start === 'number' && typeof end === 'number' && start >= baseTime && end > start && start - baseTime >= trStart && end - baseTime <= trEnd && end - start < _common_constants__WEBPACK_IMPORTED_MODULE_0__.MAX_SPAN_DURATION && start - baseTime < _common_constants__WEBPACK_IMPORTED_MODULE_0__.MAX_SPAN_DURATION && end - baseTime < _common_constants__WEBPACK_IMPORTED_MODULE_0__.MAX_SPAN_DURATION;
}

function createNavigationTimingSpans(timings, baseTime, trStart, trEnd) {
  var spans = [];

  for (var i = 0; i < eventPairs.length; i++) {
    var start = timings[eventPairs[i][0]];
    var end = timings[eventPairs[i][1]];

    if (!shouldCreateSpan(start, end, trStart, trEnd, baseTime)) {
      continue;
    }

    var span = new _span__WEBPACK_IMPORTED_MODULE_1__.default(eventPairs[i][2], 'hard-navigation.browser-timing');
    var data = null;

    if (eventPairs[i][0] === 'requestStart') {
      span.pageResponse = true;
      data = {
        url: location.origin
      };
    }

    span._start = start - baseTime;
    span.end(end - baseTime, data);
    spans.push(span);
  }

  return spans;
}

function createResourceTimingSpan(resourceTimingEntry) {
  var name = resourceTimingEntry.name,
      initiatorType = resourceTimingEntry.initiatorType,
      startTime = resourceTimingEntry.startTime,
      responseEnd = resourceTimingEntry.responseEnd;
  var kind = 'resource';

  if (initiatorType) {
    kind += '.' + initiatorType;
  }

  var spanName = (0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.stripQueryStringFromUrl)(name);
  var span = new _span__WEBPACK_IMPORTED_MODULE_1__.default(spanName, kind);
  span._start = startTime;
  span.end(responseEnd, {
    url: name,
    entry: resourceTimingEntry
  });
  return span;
}

function isCapturedByPatching(resourceStartTime, requestPatchTime) {
  return requestPatchTime != null && resourceStartTime > requestPatchTime;
}

function isIntakeAPIEndpoint(url) {
  return /intake\/v\d+\/rum\/events/.test(url);
}

function createResourceTimingSpans(entries, requestPatchTime, trStart, trEnd) {
  var spans = [];

  for (var i = 0; i < entries.length; i++) {
    var _entries$i = entries[i],
        initiatorType = _entries$i.initiatorType,
        name = _entries$i.name,
        startTime = _entries$i.startTime,
        responseEnd = _entries$i.responseEnd;

    if (_common_constants__WEBPACK_IMPORTED_MODULE_0__.RESOURCE_INITIATOR_TYPES.indexOf(initiatorType) === -1 || name == null) {
      continue;
    }

    if ((initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') && (isIntakeAPIEndpoint(name) || isCapturedByPatching(startTime, requestPatchTime))) {
      continue;
    }

    if (shouldCreateSpan(startTime, responseEnd, trStart, trEnd)) {
      spans.push(createResourceTimingSpan(entries[i]));
    }
  }

  return spans;
}

function createUserTimingSpans(entries, trStart, trEnd) {
  var userTimingSpans = [];

  for (var i = 0; i < entries.length; i++) {
    var _entries$i2 = entries[i],
        name = _entries$i2.name,
        startTime = _entries$i2.startTime,
        duration = _entries$i2.duration;
    var end = startTime + duration;

    if (duration <= _common_constants__WEBPACK_IMPORTED_MODULE_0__.USER_TIMING_THRESHOLD || !shouldCreateSpan(startTime, end, trStart, trEnd)) {
      continue;
    }

    var kind = 'app';
    var span = new _span__WEBPACK_IMPORTED_MODULE_1__.default(name, kind);
    span._start = startTime;
    span.end(end);
    userTimingSpans.push(span);
  }

  return userTimingSpans;
}

var NAVIGATION_TIMING_MARKS = ['fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'connectEnd', 'requestStart', 'responseStart', 'responseEnd', 'domLoading', 'domInteractive', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete', 'loadEventStart', 'loadEventEnd'];
var COMPRESSED_NAV_TIMING_MARKS = ['fs', 'ls', 'le', 'cs', 'ce', 'qs', 'rs', 're', 'dl', 'di', 'ds', 'de', 'dc', 'es', 'ee'];

function getNavigationTimingMarks(timing) {
  var fetchStart = timing.fetchStart,
      navigationStart = timing.navigationStart,
      responseStart = timing.responseStart,
      responseEnd = timing.responseEnd;

  if (fetchStart >= navigationStart && responseStart >= fetchStart && responseEnd >= responseStart) {
    var marks = {};
    NAVIGATION_TIMING_MARKS.forEach(function (timingKey) {
      var m = timing[timingKey];

      if (m && m >= fetchStart) {
        marks[timingKey] = parseInt(m - fetchStart);
      }
    });
    return marks;
  }

  return null;
}

function getPageLoadMarks(timing) {
  var marks = getNavigationTimingMarks(timing);

  if (marks == null) {
    return null;
  }

  return {
    navigationTiming: marks,
    agent: {
      timeToFirstByte: marks.responseStart,
      domInteractive: marks.domInteractive,
      domComplete: marks.domComplete
    }
  };
}

function captureNavigation(transaction) {
  if (!transaction.captureTimings) {
    return;
  }

  var trEnd = transaction._end;

  if (transaction.type === _common_constants__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD) {
    if (transaction.marks && transaction.marks.custom) {
      var customMarks = transaction.marks.custom;
      Object.keys(customMarks).forEach(function (key) {
        customMarks[key] += transaction._start;
      });
    }

    var trStart = 0;
    transaction._start = trStart;
    var timings = _common_utils__WEBPACK_IMPORTED_MODULE_2__.PERF.timing;
    createNavigationTimingSpans(timings, timings.fetchStart, trStart, trEnd).forEach(function (span) {
      span.traceId = transaction.traceId;
      span.sampled = transaction.sampled;

      if (span.pageResponse && transaction.options.pageLoadSpanId) {
        span.id = transaction.options.pageLoadSpanId;
      }

      transaction.spans.push(span);
    });
    transaction.addMarks(getPageLoadMarks(timings));
  }

  if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_2__.isPerfTimelineSupported)()) {
    var _trStart = transaction._start;
    var resourceEntries = _common_utils__WEBPACK_IMPORTED_MODULE_2__.PERF.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_0__.RESOURCE);
    createResourceTimingSpans(resourceEntries, _state__WEBPACK_IMPORTED_MODULE_3__.state.bootstrapTime, _trStart, trEnd).forEach(function (span) {
      return transaction.spans.push(span);
    });
    var userEntries = _common_utils__WEBPACK_IMPORTED_MODULE_2__.PERF.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_0__.MEASURE);
    createUserTimingSpans(userEntries, _trStart, trEnd).forEach(function (span) {
      return transaction.spans.push(span);
    });
  }
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/index.js":
/*!***********************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/index.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "registerServices": function() { return /* binding */ registerServices; }
/* harmony export */ });
/* harmony import */ var _performance_monitoring__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./performance-monitoring */ "../rum-core/dist/es/performance-monitoring/performance-monitoring.js");
/* harmony import */ var _transaction_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transaction-service */ "../rum-core/dist/es/performance-monitoring/transaction-service.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_service_factory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/service-factory */ "../rum-core/dist/es/common/service-factory.js");





function registerServices() {
  _common_service_factory__WEBPACK_IMPORTED_MODULE_0__.serviceCreators[_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_SERVICE] = function (serviceFactory) {
    var _serviceFactory$getSe = serviceFactory.getService([_common_constants__WEBPACK_IMPORTED_MODULE_1__.LOGGING_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.CONFIG_SERVICE]),
        loggingService = _serviceFactory$getSe[0],
        configService = _serviceFactory$getSe[1];

    return new _transaction_service__WEBPACK_IMPORTED_MODULE_2__.default(loggingService, configService);
  };

  _common_service_factory__WEBPACK_IMPORTED_MODULE_0__.serviceCreators.PerformanceMonitoring = function (serviceFactory) {
    var _serviceFactory$getSe2 = serviceFactory.getService([_common_constants__WEBPACK_IMPORTED_MODULE_1__.APM_SERVER, _common_constants__WEBPACK_IMPORTED_MODULE_1__.CONFIG_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.LOGGING_SERVICE, _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_SERVICE]),
        apmServer = _serviceFactory$getSe2[0],
        configService = _serviceFactory$getSe2[1],
        loggingService = _serviceFactory$getSe2[2],
        transactionService = _serviceFactory$getSe2[3];

    return new _performance_monitoring__WEBPACK_IMPORTED_MODULE_3__.default(apmServer, configService, loggingService, transactionService);
  };
}



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/metrics.js":
/*!*************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/metrics.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "metrics": function() { return /* binding */ metrics; },
/* harmony export */   "createLongTaskSpans": function() { return /* binding */ createLongTaskSpans; },
/* harmony export */   "createFirstInputDelaySpan": function() { return /* binding */ createFirstInputDelaySpan; },
/* harmony export */   "createTotalBlockingTimeSpan": function() { return /* binding */ createTotalBlockingTimeSpan; },
/* harmony export */   "calculateTotalBlockingTime": function() { return /* binding */ calculateTotalBlockingTime; },
/* harmony export */   "calculateCumulativeLayoutShift": function() { return /* binding */ calculateCumulativeLayoutShift; },
/* harmony export */   "captureObserverEntries": function() { return /* binding */ captureObserverEntries; },
/* harmony export */   "PerfEntryRecorder": function() { return /* binding */ PerfEntryRecorder; }
/* harmony export */ });
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/performance-monitoring/span.js");



var metrics = {
  fid: 0,
  fcp: 0,
  tbt: {
    start: Infinity,
    duration: 0
  },
  cls: {
    score: 0,
    firstEntryTime: Number.NEGATIVE_INFINITY,
    prevEntryTime: Number.NEGATIVE_INFINITY,
    currentSessionScore: 0
  },
  longtask: {
    count: 0,
    duration: 0,
    max: 0
  }
};
var LONG_TASK_THRESHOLD = 50;
function createLongTaskSpans(longtasks, agg) {
  var spans = [];

  for (var i = 0; i < longtasks.length; i++) {
    var _longtasks$i = longtasks[i],
        name = _longtasks$i.name,
        startTime = _longtasks$i.startTime,
        duration = _longtasks$i.duration,
        attribution = _longtasks$i.attribution;
    var end = startTime + duration;
    var span = new _span__WEBPACK_IMPORTED_MODULE_0__.default("Longtask(" + name + ")", _common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK, {
      startTime: startTime
    });
    agg.count++;
    agg.duration += duration;
    agg.max = Math.max(duration, agg.max);

    if (attribution.length > 0) {
      var _attribution$ = attribution[0],
          _name = _attribution$.name,
          containerType = _attribution$.containerType,
          containerName = _attribution$.containerName,
          containerId = _attribution$.containerId;
      var customContext = {
        attribution: _name,
        type: containerType
      };

      if (containerName) {
        customContext.name = containerName;
      }

      if (containerId) {
        customContext.id = containerId;
      }

      span.addContext({
        custom: customContext
      });
    }

    span.end(end);
    spans.push(span);
  }

  return spans;
}
function createFirstInputDelaySpan(fidEntries) {
  var firstInput = fidEntries[0];

  if (firstInput) {
    var startTime = firstInput.startTime,
        processingStart = firstInput.processingStart;
    var span = new _span__WEBPACK_IMPORTED_MODULE_0__.default('First Input Delay', _common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_INPUT, {
      startTime: startTime
    });
    span.end(processingStart);
    return span;
  }
}
function createTotalBlockingTimeSpan(tbtObject) {
  var start = tbtObject.start,
      duration = tbtObject.duration;
  var tbtSpan = new _span__WEBPACK_IMPORTED_MODULE_0__.default('Total Blocking Time', _common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK, {
    startTime: start
  });
  tbtSpan.end(start + duration);
  return tbtSpan;
}
function calculateTotalBlockingTime(longtaskEntries) {
  longtaskEntries.forEach(function (entry) {
    var name = entry.name,
        startTime = entry.startTime,
        duration = entry.duration;

    if (startTime < metrics.fcp) {
      return;
    }

    if (name !== 'self' && name.indexOf('same-origin') === -1) {
      return;
    }

    metrics.tbt.start = Math.min(metrics.tbt.start, startTime);
    var blockingTime = duration - LONG_TASK_THRESHOLD;

    if (blockingTime > 0) {
      metrics.tbt.duration += blockingTime;
    }
  });
}
function calculateCumulativeLayoutShift(clsEntries) {
  clsEntries.forEach(function (entry) {
    if (!entry.hadRecentInput && entry.value) {
      var shouldCreateNewSession = entry.startTime - metrics.cls.firstEntryTime > 5000 || entry.startTime - metrics.cls.prevEntryTime > 1000;

      if (shouldCreateNewSession) {
        metrics.cls.firstEntryTime = entry.startTime;
        metrics.cls.currentSessionScore = 0;
      }

      metrics.cls.prevEntryTime = entry.startTime;
      metrics.cls.currentSessionScore += entry.value;
      metrics.cls.score = Math.max(metrics.cls.score, metrics.cls.currentSessionScore);
    }
  });
}
function captureObserverEntries(list, _ref) {
  var isHardNavigation = _ref.isHardNavigation,
      trStart = _ref.trStart;
  var longtaskEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK).filter(function (entry) {
    return entry.startTime >= trStart;
  });
  var longTaskSpans = createLongTaskSpans(longtaskEntries, metrics.longtask);
  var result = {
    spans: longTaskSpans,
    marks: {}
  };

  if (!isHardNavigation) {
    return result;
  }

  var lcpEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LARGEST_CONTENTFUL_PAINT);
  var lastLcpEntry = lcpEntries[lcpEntries.length - 1];

  if (lastLcpEntry) {
    var lcp = parseInt(lastLcpEntry.startTime);
    metrics.lcp = lcp;
    result.marks.largestContentfulPaint = lcp;
  }

  var timing = _common_utils__WEBPACK_IMPORTED_MODULE_2__.PERF.timing;
  var unloadDiff = timing.fetchStart - timing.navigationStart;
  var fcpEntry = list.getEntriesByName(_common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_CONTENTFUL_PAINT)[0];

  if (fcpEntry) {
    var fcp = parseInt(unloadDiff >= 0 ? fcpEntry.startTime - unloadDiff : fcpEntry.startTime);
    metrics.fcp = fcp;
    result.marks.firstContentfulPaint = fcp;
  }

  var fidEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_INPUT);
  var fidSpan = createFirstInputDelaySpan(fidEntries);

  if (fidSpan) {
    metrics.fid = fidSpan.duration();
    result.spans.push(fidSpan);
  }

  calculateTotalBlockingTime(longtaskEntries);
  var clsEntries = list.getEntriesByType(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LAYOUT_SHIFT);
  calculateCumulativeLayoutShift(clsEntries);
  return result;
}
var PerfEntryRecorder = function () {
  function PerfEntryRecorder(callback) {
    this.po = {
      observe: _common_utils__WEBPACK_IMPORTED_MODULE_2__.noop,
      disconnect: _common_utils__WEBPACK_IMPORTED_MODULE_2__.noop
    };

    if (window.PerformanceObserver) {
      this.po = new PerformanceObserver(callback);
    }
  }

  var _proto = PerfEntryRecorder.prototype;

  _proto.start = function start(type) {
    try {
      this.po.observe({
        type: type,
        buffered: true
      });
    } catch (_) {}
  };

  _proto.stop = function stop() {
    this.po.disconnect();
  };

  return PerfEntryRecorder;
}();

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/performance-monitoring.js":
/*!****************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/performance-monitoring.js ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "groupSmallContinuouslySimilarSpans": function() { return /* binding */ groupSmallContinuouslySimilarSpans; },
/* harmony export */   "adjustTransaction": function() { return /* binding */ adjustTransaction; },
/* harmony export */   "default": function() { return /* binding */ PerformanceMonitoring; }
/* harmony export */ });
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_url__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/url */ "../rum-core/dist/es/common/url.js");
/* harmony import */ var _common_patching__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/patching */ "../rum-core/dist/es/common/patching/index.js");
/* harmony import */ var _common_patching_patch_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/patching/patch-utils */ "../rum-core/dist/es/common/patching/patch-utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_truncate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/truncate */ "../rum-core/dist/es/common/truncate.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");







var SIMILAR_SPAN_TO_TRANSACTION_RATIO = 0.05;
var TRANSACTION_DURATION_THRESHOLD = 60000;
function groupSmallContinuouslySimilarSpans(originalSpans, transDuration, threshold) {
  originalSpans.sort(function (spanA, spanB) {
    return spanA._start - spanB._start;
  });
  var spans = [];
  var lastCount = 1;
  originalSpans.forEach(function (span, index) {
    if (spans.length === 0) {
      spans.push(span);
    } else {
      var lastSpan = spans[spans.length - 1];
      var isContinuouslySimilar = lastSpan.type === span.type && lastSpan.subtype === span.subtype && lastSpan.action === span.action && lastSpan.name === span.name && span.duration() / transDuration < threshold && (span._start - lastSpan._end) / transDuration < threshold;
      var isLastSpan = originalSpans.length === index + 1;

      if (isContinuouslySimilar) {
        lastCount++;
        lastSpan._end = span._end;
      }

      if (lastCount > 1 && (!isContinuouslySimilar || isLastSpan)) {
        lastSpan.name = lastCount + 'x ' + lastSpan.name;
        lastCount = 1;
      }

      if (!isContinuouslySimilar) {
        spans.push(span);
      }
    }
  });
  return spans;
}
function adjustTransaction(transaction) {
  if (transaction.sampled) {
    var filterdSpans = transaction.spans.filter(function (span) {
      return span.duration() > 0 && span._start >= transaction._start && span._end <= transaction._end;
    });

    if (transaction.isManaged()) {
      var duration = transaction.duration();
      var similarSpans = groupSmallContinuouslySimilarSpans(filterdSpans, duration, SIMILAR_SPAN_TO_TRANSACTION_RATIO);
      transaction.spans = similarSpans;
    } else {
      transaction.spans = filterdSpans;
    }
  } else {
    transaction.resetFields();
  }

  return transaction;
}

var PerformanceMonitoring = function () {
  function PerformanceMonitoring(apmServer, configService, loggingService, transactionService) {
    this._apmServer = apmServer;
    this._configService = configService;
    this._logginService = loggingService;
    this._transactionService = transactionService;
  }

  var _proto = PerformanceMonitoring.prototype;

  _proto.init = function init(flags) {
    var _this = this;

    if (flags === void 0) {
      flags = {};
    }

    this._configService.events.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_END + _common_constants__WEBPACK_IMPORTED_MODULE_0__.AFTER_EVENT, function (tr) {
      var payload = _this.createTransactionPayload(tr);

      if (payload) {
        _this._apmServer.addTransaction(payload);

        _this._configService.dispatchEvent(_common_constants__WEBPACK_IMPORTED_MODULE_0__.QUEUE_ADD_TRANSACTION);
      }
    });

    if (flags[_common_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY]) {
      _common_patching__WEBPACK_IMPORTED_MODULE_1__.patchEventHandler.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY, this.getHistorySub());
    }

    if (flags[_common_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST]) {
      _common_patching__WEBPACK_IMPORTED_MODULE_1__.patchEventHandler.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST, this.getXHRSub());
    }

    if (flags[_common_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH]) {
      _common_patching__WEBPACK_IMPORTED_MODULE_1__.patchEventHandler.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH, this.getFetchSub());
    }

    if (flags[_common_constants__WEBPACK_IMPORTED_MODULE_0__.EVENT_TARGET]) {
      _common_patching__WEBPACK_IMPORTED_MODULE_1__.patchEventHandler.observe(_common_constants__WEBPACK_IMPORTED_MODULE_0__.EVENT_TARGET, this.getEventTargetSub());
    }
  };

  _proto.getEventTargetSub = function getEventTargetSub() {
    var transactionService = this._transactionService;
    return function (event, task) {
      if (event === _common_constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE && task.source === _common_constants__WEBPACK_IMPORTED_MODULE_0__.EVENT_TARGET && task.eventType === 'click') {
        var target = task.target;
        var tagName = target.tagName.toLowerCase();
        var transactionName = tagName;

        if (!!target.dataset.transactionName) {
          transactionName = target.dataset.transactionName;
        } else {
          var name = target.getAttribute('name');

          if (!!name) {
            transactionName = tagName + "[\"" + name + "\"]";
          }
        }

        var tr = transactionService.startTransaction("Click - " + transactionName, _common_constants__WEBPACK_IMPORTED_MODULE_0__.USER_INTERACTION, {
          managed: true,
          canReuse: true,
          reuseThreshold: 300
        });

        if (tr) {
          var classes = target.getAttribute('class');

          if (classes) {
            tr.addContext({
              custom: {
                classes: classes
              }
            });
          }
        }
      }
    };
  };

  _proto.getHistorySub = function getHistorySub() {
    var transactionService = this._transactionService;
    return function (event, task) {
      if (task.source === _common_constants__WEBPACK_IMPORTED_MODULE_0__.HISTORY && event === _common_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE) {
        transactionService.startTransaction(task.data.title, 'route-change', {
          managed: true,
          canReuse: true
        });
      }
    };
  };

  _proto.getXHRSub = function getXHRSub() {
    var _this2 = this;

    return function (event, task) {
      if (task.source === _common_constants__WEBPACK_IMPORTED_MODULE_0__.XMLHTTPREQUEST && !_common_patching_patch_utils__WEBPACK_IMPORTED_MODULE_2__.globalState.fetchInProgress) {
        _this2.processAPICalls(event, task);
      }
    };
  };

  _proto.getFetchSub = function getFetchSub() {
    var _this3 = this;

    return function (event, task) {
      if (task.source === _common_constants__WEBPACK_IMPORTED_MODULE_0__.FETCH) {
        _this3.processAPICalls(event, task);
      }
    };
  };

  _proto.processAPICalls = function processAPICalls(event, task) {
    var configService = this._configService;
    var transactionService = this._transactionService;

    if (task.data && task.data.url) {
      var endpoints = this._apmServer.getEndpoints();

      var isOwnEndpoint = Object.keys(endpoints).some(function (endpoint) {
        return task.data.url.indexOf(endpoints[endpoint]) !== -1;
      });

      if (isOwnEndpoint) {
        return;
      }
    }

    if (event === _common_constants__WEBPACK_IMPORTED_MODULE_0__.SCHEDULE && task.data) {
      var data = task.data;
      var requestUrl = new _common_url__WEBPACK_IMPORTED_MODULE_3__.Url(data.url);
      var spanName = data.method + ' ' + (requestUrl.relative ? requestUrl.path : (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.stripQueryStringFromUrl)(requestUrl.href));

      if (!transactionService.getCurrentTransaction()) {
        transactionService.startTransaction(spanName, _common_constants__WEBPACK_IMPORTED_MODULE_0__.HTTP_REQUEST_TYPE, {
          managed: true
        });
      }

      var span = transactionService.startSpan(spanName, 'external.http', {
        blocking: true
      });

      if (!span) {
        return;
      }

      var isDtEnabled = configService.get('distributedTracing');
      var dtOrigins = configService.get('distributedTracingOrigins');
      var currentUrl = new _common_url__WEBPACK_IMPORTED_MODULE_3__.Url(window.location.href);
      var isSameOrigin = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.checkSameOrigin)(requestUrl.origin, currentUrl.origin) || (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.checkSameOrigin)(requestUrl.origin, dtOrigins);
      var target = data.target;

      if (isDtEnabled && isSameOrigin && target) {
        this.injectDtHeader(span, target);
        var propagateTracestate = configService.get('propagateTracestate');

        if (propagateTracestate) {
          this.injectTSHeader(span, target);
        }
      } else if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
        this._logginService.debug("Could not inject distributed tracing header to the request origin ('" + requestUrl.origin + "') from the current origin ('" + currentUrl.origin + "')");
      }

      if (data.sync) {
        span.sync = data.sync;
      }

      data.span = span;
    } else if (event === _common_constants__WEBPACK_IMPORTED_MODULE_0__.INVOKE) {
      var _data = task.data;

      if (_data && _data.span) {
        var _span = _data.span,
            response = _data.response,
            _target = _data.target;
        var status;

        if (response) {
          status = response.status;
        } else {
          status = _target.status;
        }

        var outcome;

        if (_data.status != 'abort') {
          if (status >= 400 || status == 0) {
            outcome = _common_constants__WEBPACK_IMPORTED_MODULE_0__.OUTCOME_FAILURE;
          } else {
            outcome = _common_constants__WEBPACK_IMPORTED_MODULE_0__.OUTCOME_SUCCESS;
          }
        }

        _span.outcome = outcome;
        var tr = transactionService.getCurrentTransaction();

        if (tr && tr.type === _common_constants__WEBPACK_IMPORTED_MODULE_0__.HTTP_REQUEST_TYPE) {
          tr.outcome = outcome;
        }

        transactionService.endSpan(_span, _data);
      }
    }
  };

  _proto.injectDtHeader = function injectDtHeader(span, target) {
    var headerName = this._configService.get('distributedTracingHeaderName');

    var headerValue = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.getDtHeaderValue)(span);
    var isHeaderValid = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.isDtHeaderValid)(headerValue);

    if (isHeaderValid && headerValue && headerName) {
      (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.setRequestHeader)(target, headerName, headerValue);
    }
  };

  _proto.injectTSHeader = function injectTSHeader(span, target) {
    var headerValue = (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.getTSHeaderValue)(span);

    if (headerValue) {
      (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.setRequestHeader)(target, 'tracestate', headerValue);
    }
  };

  _proto.extractDtHeader = function extractDtHeader(target) {
    var configService = this._configService;
    var headerName = configService.get('distributedTracingHeaderName');

    if (target) {
      return (0,_common_utils__WEBPACK_IMPORTED_MODULE_4__.parseDtHeaderValue)(target[headerName]);
    }
  };

  _proto.filterTransaction = function filterTransaction(tr) {
    var duration = tr.duration();

    if (!duration) {
      if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
        var message = "transaction(" + tr.id + ", " + tr.name + ") was discarded! ";

        if (duration === 0) {
          message += "Transaction duration is 0";
        } else {
          message += "Transaction wasn't ended";
        }

        this._logginService.debug(message);
      }

      return false;
    }

    if (tr.isManaged()) {
      if (duration > TRANSACTION_DURATION_THRESHOLD) {
        if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
          this._logginService.debug("transaction(" + tr.id + ", " + tr.name + ") was discarded! Transaction duration (" + duration + ") is greater than managed transaction threshold (" + TRANSACTION_DURATION_THRESHOLD + ")");
        }

        return false;
      }

      if (tr.sampled && tr.spans.length === 0) {
        if (_state__WEBPACK_IMPORTED_MODULE_5__.__DEV__) {
          this._logginService.debug("transaction(" + tr.id + ", " + tr.name + ") was discarded! Transaction does not have any spans");
        }

        return false;
      }
    }

    return true;
  };

  _proto.createTransactionDataModel = function createTransactionDataModel(transaction) {
    var transactionStart = transaction._start;
    var spans = transaction.spans.map(function (span) {
      var spanData = {
        id: span.id,
        transaction_id: transaction.id,
        parent_id: span.parentId || transaction.id,
        trace_id: transaction.traceId,
        name: span.name,
        type: span.type,
        subtype: span.subtype,
        action: span.action,
        sync: span.sync,
        start: parseInt(span._start - transactionStart),
        duration: span.duration(),
        context: span.context,
        outcome: span.outcome,
        sample_rate: span.sampleRate
      };
      return (0,_common_truncate__WEBPACK_IMPORTED_MODULE_6__.truncateModel)(_common_truncate__WEBPACK_IMPORTED_MODULE_6__.SPAN_MODEL, spanData);
    });
    var transactionData = {
      id: transaction.id,
      trace_id: transaction.traceId,
      session: transaction.session,
      name: transaction.name,
      type: transaction.type,
      duration: transaction.duration(),
      spans: spans,
      context: transaction.context,
      marks: transaction.marks,
      breakdown: transaction.breakdownTimings,
      span_count: {
        started: spans.length
      },
      sampled: transaction.sampled,
      sample_rate: transaction.sampleRate,
      experience: transaction.experience,
      outcome: transaction.outcome
    };
    return (0,_common_truncate__WEBPACK_IMPORTED_MODULE_6__.truncateModel)(_common_truncate__WEBPACK_IMPORTED_MODULE_6__.TRANSACTION_MODEL, transactionData);
  };

  _proto.createTransactionPayload = function createTransactionPayload(transaction) {
    var adjustedTransaction = adjustTransaction(transaction);
    var filtered = this.filterTransaction(adjustedTransaction);

    if (filtered) {
      return this.createTransactionDataModel(transaction);
    }
  };

  return PerformanceMonitoring;
}();



/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/span-base.js":
/*!***************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/span-base.js ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");



var SpanBase = function () {
  function SpanBase(name, type, options) {
    if (options === void 0) {
      options = {};
    }

    if (!name) {
      name = _common_constants__WEBPACK_IMPORTED_MODULE_0__.NAME_UNKNOWN;
    }

    if (!type) {
      type = _common_constants__WEBPACK_IMPORTED_MODULE_0__.TYPE_CUSTOM;
    }

    this.name = name;
    this.type = type;
    this.options = options;
    this.id = options.id || (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.generateRandomId)(16);
    this.traceId = options.traceId;
    this.sampled = options.sampled;
    this.sampleRate = options.sampleRate;
    this.timestamp = options.timestamp;
    this._start = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getTime)(options.startTime);
    this._end = undefined;
    this.ended = false;
    this.outcome = undefined;
    this.onEnd = options.onEnd;
  }

  var _proto = SpanBase.prototype;

  _proto.ensureContext = function ensureContext() {
    if (!this.context) {
      this.context = {};
    }
  };

  _proto.addLabels = function addLabels(tags) {
    this.ensureContext();
    var ctx = this.context;

    if (!ctx.tags) {
      ctx.tags = {};
    }

    var keys = Object.keys(tags);
    keys.forEach(function (k) {
      return (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.setLabel)(k, tags[k], ctx.tags);
    });
  };

  _proto.addContext = function addContext() {
    for (var _len = arguments.length, context = new Array(_len), _key = 0; _key < _len; _key++) {
      context[_key] = arguments[_key];
    }

    if (context.length === 0) return;
    this.ensureContext();
    _common_utils__WEBPACK_IMPORTED_MODULE_1__.merge.apply(void 0, [this.context].concat(context));
  };

  _proto.end = function end(endTime) {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this._end = (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getTime)(endTime);
    this.callOnEnd();
  };

  _proto.callOnEnd = function callOnEnd() {
    if (typeof this.onEnd === 'function') {
      this.onEnd(this);
    }
  };

  _proto.duration = function duration() {
    return (0,_common_utils__WEBPACK_IMPORTED_MODULE_1__.getDuration)(this._start, this._end);
  };

  return SpanBase;
}();

/* harmony default export */ __webpack_exports__["default"] = (SpanBase);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/span.js":
/*!**********************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/span.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _span_base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./span-base */ "../rum-core/dist/es/performance-monitoring/span-base.js");
/* harmony import */ var _common_context__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/context */ "../rum-core/dist/es/common/context.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}




var Span = function (_SpanBase) {
  _inheritsLoose(Span, _SpanBase);

  function Span(name, type, options) {
    var _this;

    _this = _SpanBase.call(this, name, type, options) || this;
    _this.parentId = _this.options.parentId;
    _this.subtype = undefined;
    _this.action = undefined;

    if (_this.type.indexOf('.') !== -1) {
      var fields = _this.type.split('.', 3);

      _this.type = fields[0];
      _this.subtype = fields[1];
      _this.action = fields[2];
    }

    _this.sync = _this.options.sync;
    return _this;
  }

  var _proto = Span.prototype;

  _proto.end = function end(endTime, data) {
    _SpanBase.prototype.end.call(this, endTime);

    (0,_common_context__WEBPACK_IMPORTED_MODULE_0__.addSpanContext)(this, data);
  };

  return Span;
}(_span_base__WEBPACK_IMPORTED_MODULE_1__.default);

/* harmony default export */ __webpack_exports__["default"] = (Span);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/transaction-service.js":
/*!*************************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/transaction-service.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common_polyfills__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../common/polyfills */ "../rum-core/dist/es/common/polyfills.js");
/* harmony import */ var _transaction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transaction */ "../rum-core/dist/es/performance-monitoring/transaction.js");
/* harmony import */ var _metrics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metrics */ "../rum-core/dist/es/performance-monitoring/metrics.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _capture_navigation__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./capture-navigation */ "../rum-core/dist/es/performance-monitoring/capture-navigation.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _common_context__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../common/context */ "../rum-core/dist/es/common/context.js");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../state */ "../rum-core/dist/es/state.js");
/* harmony import */ var _common_url__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/url */ "../rum-core/dist/es/common/url.js");










var TransactionService = function () {
  function TransactionService(logger, config) {
    var _this = this;

    this._config = config;
    this._logger = logger;
    this.currentTransaction = undefined;
    this.respIntervalId = undefined;
    this.recorder = new _metrics__WEBPACK_IMPORTED_MODULE_0__.PerfEntryRecorder(function (list) {
      var tr = _this.getCurrentTransaction();

      if (tr && tr.captureTimings) {
        var _tr$spans;

        var isHardNavigation = tr.type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD;

        var _captureObserverEntri = (0,_metrics__WEBPACK_IMPORTED_MODULE_0__.captureObserverEntries)(list, {
          isHardNavigation: isHardNavigation,
          trStart: isHardNavigation ? 0 : tr._start
        }),
            spans = _captureObserverEntri.spans,
            marks = _captureObserverEntri.marks;

        (_tr$spans = tr.spans).push.apply(_tr$spans, spans);

        tr.addMarks({
          agent: marks
        });
      }
    });
  }

  var _proto = TransactionService.prototype;

  _proto.createCurrentTransaction = function createCurrentTransaction(name, type, options) {
    var tr = new _transaction__WEBPACK_IMPORTED_MODULE_2__.default(name, type, options);
    this.currentTransaction = tr;
    return tr;
  };

  _proto.getCurrentTransaction = function getCurrentTransaction() {
    if (this.currentTransaction && !this.currentTransaction.ended) {
      return this.currentTransaction;
    }
  };

  _proto.createOptions = function createOptions(options) {
    var config = this._config.config;
    var presetOptions = {
      transactionSampleRate: config.transactionSampleRate
    };
    var perfOptions = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.extend)(presetOptions, options);

    if (perfOptions.managed) {
      perfOptions = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.extend)({
        pageLoadTraceId: config.pageLoadTraceId,
        pageLoadSampled: config.pageLoadSampled,
        pageLoadSpanId: config.pageLoadSpanId,
        pageLoadTransactionName: config.pageLoadTransactionName
      }, perfOptions);
    }

    return perfOptions;
  };

  _proto.startManagedTransaction = function startManagedTransaction(name, type, perfOptions) {
    var tr = this.getCurrentTransaction();
    var isRedefined = false;

    if (!tr) {
      tr = this.createCurrentTransaction(name, type, perfOptions);
    } else if (tr.canReuse() && perfOptions.canReuse) {
      var redefineType = tr.type;
      var currentTypeOrder = _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE_ORDER.indexOf(tr.type);
      var redefineTypeOrder = _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_TYPE_ORDER.indexOf(type);

      if (currentTypeOrder >= 0 && redefineTypeOrder < currentTypeOrder) {
        redefineType = type;
      }

      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        this._logger.debug("redefining transaction(" + tr.id + ", " + tr.name + ", " + tr.type + ")", 'to', "(" + (name || tr.name) + ", " + redefineType + ")", tr);
      }

      tr.redefine(name, redefineType, perfOptions);
      isRedefined = true;
    } else {
      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        this._logger.debug("ending previous transaction(" + tr.id + ", " + tr.name + ")", tr);
      }

      tr.end();
      tr = this.createCurrentTransaction(name, type, perfOptions);
    }

    if (tr.type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD) {
      if (!isRedefined) {
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LARGEST_CONTENTFUL_PAINT);
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.PAINT);
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.FIRST_INPUT);
        this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LAYOUT_SHIFT);
      }

      if (perfOptions.pageLoadTraceId) {
        tr.traceId = perfOptions.pageLoadTraceId;
      }

      if (perfOptions.pageLoadSampled) {
        tr.sampled = perfOptions.pageLoadSampled;
      }

      if (tr.name === _common_constants__WEBPACK_IMPORTED_MODULE_1__.NAME_UNKNOWN && perfOptions.pageLoadTransactionName) {
        tr.name = perfOptions.pageLoadTransactionName;
      }
    }

    if (!isRedefined && this._config.get('monitorLongtasks')) {
      this.recorder.start(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK);
    }

    if (tr.sampled) {
      tr.captureTimings = true;
    }

    return tr;
  };

  _proto.startTransaction = function startTransaction(name, type, options) {
    var _this2 = this;

    var perfOptions = this.createOptions(options);
    var tr;
    var fireOnstartHook = true;

    if (perfOptions.managed) {
      var current = this.currentTransaction;
      tr = this.startManagedTransaction(name, type, perfOptions);

      if (current === tr) {
        fireOnstartHook = false;
      }
    } else {
      tr = new _transaction__WEBPACK_IMPORTED_MODULE_2__.default(name, type, perfOptions);
    }

    tr.onEnd = function () {
      return _this2.handleTransactionEnd(tr);
    };

    if (fireOnstartHook) {
      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        this._logger.debug("startTransaction(" + tr.id + ", " + tr.name + ", " + tr.type + ")");
      }

      this._config.events.send(_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_START, [tr]);
    }

    return tr;
  };

  _proto.handleTransactionEnd = function handleTransactionEnd(tr) {
    var _this3 = this;

    this.recorder.stop();
    var currentUrl = window.location.href;
    return _common_polyfills__WEBPACK_IMPORTED_MODULE_5__.Promise.resolve().then(function () {
      var name = tr.name,
          type = tr.type;
      var lastHiddenStart = _state__WEBPACK_IMPORTED_MODULE_4__.state.lastHiddenStart;

      if (lastHiddenStart >= tr._start) {
        if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
          _this3._logger.debug("transaction(" + tr.id + ", " + name + ", " + type + ") was discarded! The page was hidden during the transaction!");
        }

        return;
      }

      if (_this3.shouldIgnoreTransaction(name) || type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.TEMPORARY_TYPE) {
        if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
          _this3._logger.debug("transaction(" + tr.id + ", " + name + ", " + type + ") is ignored");
        }

        return;
      }

      if (type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD) {
        var pageLoadTransactionName = _this3._config.get('pageLoadTransactionName');

        if (name === _common_constants__WEBPACK_IMPORTED_MODULE_1__.NAME_UNKNOWN && pageLoadTransactionName) {
          tr.name = pageLoadTransactionName;
        }

        if (tr.captureTimings) {
          var cls = _metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.cls,
              fid = _metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.fid,
              tbt = _metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.tbt,
              longtask = _metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.longtask;

          if (tbt.duration > 0) {
            tr.spans.push((0,_metrics__WEBPACK_IMPORTED_MODULE_0__.createTotalBlockingTimeSpan)(tbt));
          }

          tr.experience = {};

          if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.isPerfTypeSupported)(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LONG_TASK)) {
            tr.experience.tbt = tbt.duration;
          }

          if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.isPerfTypeSupported)(_common_constants__WEBPACK_IMPORTED_MODULE_1__.LAYOUT_SHIFT)) {
            tr.experience.cls = cls.score;
          }

          if (fid > 0) {
            tr.experience.fid = fid;
          }

          if (longtask.count > 0) {
            tr.experience.longtask = {
              count: longtask.count,
              sum: longtask.duration,
              max: longtask.max
            };
          }
        }

        _this3.setSession(tr);
      }

      if (tr.name === _common_constants__WEBPACK_IMPORTED_MODULE_1__.NAME_UNKNOWN) {
        tr.name = (0,_common_url__WEBPACK_IMPORTED_MODULE_6__.slugifyUrl)(currentUrl);
      }

      (0,_capture_navigation__WEBPACK_IMPORTED_MODULE_7__.captureNavigation)(tr);

      _this3.adjustTransactionTime(tr);

      var breakdownMetrics = _this3._config.get('breakdownMetrics');

      if (breakdownMetrics) {
        tr.captureBreakdown();
      }

      var configContext = _this3._config.get('context');

      (0,_common_context__WEBPACK_IMPORTED_MODULE_8__.addTransactionContext)(tr, configContext);

      _this3._config.events.send(_common_constants__WEBPACK_IMPORTED_MODULE_1__.TRANSACTION_END, [tr]);

      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        _this3._logger.debug("end transaction(" + tr.id + ", " + tr.name + ", " + tr.type + ")", tr);
      }
    }, function (err) {
      if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
        _this3._logger.debug("error ending transaction(" + tr.id + ", " + tr.name + ")", err);
      }
    });
  };

  _proto.setSession = function setSession(tr) {
    var session = this._config.get('session');

    if (session) {
      if (typeof session == 'boolean') {
        tr.session = {
          id: (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.generateRandomId)(16),
          sequence: 1
        };
      } else {
        if (session.timestamp && Date.now() - session.timestamp > _common_constants__WEBPACK_IMPORTED_MODULE_1__.SESSION_TIMEOUT) {
          tr.session = {
            id: (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.generateRandomId)(16),
            sequence: 1
          };
        } else {
          tr.session = {
            id: session.id,
            sequence: session.sequence ? session.sequence + 1 : 1
          };
        }
      }

      var sessionConfig = {
        session: {
          id: tr.session.id,
          sequence: tr.session.sequence,
          timestamp: Date.now()
        }
      };

      this._config.setConfig(sessionConfig);

      this._config.setLocalConfig(sessionConfig, true);
    }
  };

  _proto.adjustTransactionTime = function adjustTransactionTime(transaction) {
    var spans = transaction.spans;
    var earliestSpan = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.getEarliestSpan)(spans);

    if (earliestSpan && earliestSpan._start < transaction._start) {
      transaction._start = earliestSpan._start;
    }

    var latestSpan = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.getLatestNonXHRSpan)(spans) || {};
    var latestSpanEnd = latestSpan._end || 0;

    if (transaction.type === _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD) {
      var transactionEndWithoutDelay = transaction._end - _common_constants__WEBPACK_IMPORTED_MODULE_1__.PAGE_LOAD_DELAY;
      var lcp = _metrics__WEBPACK_IMPORTED_MODULE_0__.metrics.lcp || 0;
      var latestXHRSpan = (0,_common_utils__WEBPACK_IMPORTED_MODULE_3__.getLatestXHRSpan)(spans) || {};
      var latestXHRSpanEnd = latestXHRSpan._end || 0;
      transaction._end = Math.max(latestSpanEnd, latestXHRSpanEnd, lcp, transactionEndWithoutDelay);
    } else if (latestSpanEnd > transaction._end) {
      transaction._end = latestSpanEnd;
    }

    this.truncateSpans(spans, transaction._end);
  };

  _proto.truncateSpans = function truncateSpans(spans, transactionEnd) {
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];

      if (span._end > transactionEnd) {
        span._end = transactionEnd;
        span.type += _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRUNCATED_TYPE;
      }

      if (span._start > transactionEnd) {
        span._start = transactionEnd;
      }
    }
  };

  _proto.shouldIgnoreTransaction = function shouldIgnoreTransaction(transactionName) {
    var ignoreList = this._config.get('ignoreTransactions');

    if (ignoreList && ignoreList.length) {
      for (var i = 0; i < ignoreList.length; i++) {
        var element = ignoreList[i];

        if (typeof element.test === 'function') {
          if (element.test(transactionName)) {
            return true;
          }
        } else if (element === transactionName) {
          return true;
        }
      }
    }

    return false;
  };

  _proto.startSpan = function startSpan(name, type, options) {
    var tr = this.getCurrentTransaction();

    if (!tr) {
      tr = this.createCurrentTransaction(undefined, _common_constants__WEBPACK_IMPORTED_MODULE_1__.TEMPORARY_TYPE, this.createOptions({
        canReuse: true,
        managed: true
      }));
    }

    var span = tr.startSpan(name, type, options);

    if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
      this._logger.debug("startSpan(" + name + ", " + span.type + ")", "on transaction(" + tr.id + ", " + tr.name + ")");
    }

    return span;
  };

  _proto.endSpan = function endSpan(span, context) {
    if (!span) {
      return;
    }

    if (_state__WEBPACK_IMPORTED_MODULE_4__.__DEV__) {
      var tr = this.getCurrentTransaction();
      tr && this._logger.debug("endSpan(" + span.name + ", " + span.type + ")", "on transaction(" + tr.id + ", " + tr.name + ")");
    }

    span.end(null, context);
  };

  return TransactionService;
}();

/* harmony default export */ __webpack_exports__["default"] = (TransactionService);

/***/ }),

/***/ "../rum-core/dist/es/performance-monitoring/transaction.js":
/*!*****************************************************************!*\
  !*** ../rum-core/dist/es/performance-monitoring/transaction.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _span__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./span */ "../rum-core/dist/es/performance-monitoring/span.js");
/* harmony import */ var _span_base__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./span-base */ "../rum-core/dist/es/performance-monitoring/span-base.js");
/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/utils */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _common_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/constants */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _breakdown__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./breakdown */ "../rum-core/dist/es/performance-monitoring/breakdown.js");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}







var Transaction = function (_SpanBase) {
  _inheritsLoose(Transaction, _SpanBase);

  function Transaction(name, type, options) {
    var _this;

    _this = _SpanBase.call(this, name, type, options) || this;
    _this.traceId = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.generateRandomId)();
    _this.marks = undefined;
    _this.spans = [];
    _this._activeSpans = {};
    _this._activeTasks = new Set();
    _this.blocked = false;
    _this.captureTimings = false;
    _this.breakdownTimings = [];
    _this.sampleRate = _this.options.transactionSampleRate;
    _this.sampled = Math.random() <= _this.sampleRate;
    return _this;
  }

  var _proto = Transaction.prototype;

  _proto.addMarks = function addMarks(obj) {
    this.marks = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.merge)(this.marks || {}, obj);
  };

  _proto.mark = function mark(key) {
    var skey = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.removeInvalidChars)(key);

    var markTime = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.now)() - this._start;

    var custom = {};
    custom[skey] = markTime;
    this.addMarks({
      custom: custom
    });
  };

  _proto.canReuse = function canReuse() {
    var threshold = this.options.reuseThreshold || _common_constants__WEBPACK_IMPORTED_MODULE_1__.REUSABILITY_THRESHOLD;
    return !!this.options.canReuse && !this.ended && (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.now)() - this._start < threshold;
  };

  _proto.redefine = function redefine(name, type, options) {
    if (name) {
      this.name = name;
    }

    if (type) {
      this.type = type;
    }

    if (options) {
      this.options.reuseThreshold = options.reuseThreshold;
      (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.extend)(this.options, options);
    }
  };

  _proto.startSpan = function startSpan(name, type, options) {
    var _this2 = this;

    if (this.ended) {
      return;
    }

    var opts = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.extend)({}, options);

    opts.onEnd = function (trc) {
      _this2._onSpanEnd(trc);
    };

    opts.traceId = this.traceId;
    opts.sampled = this.sampled;
    opts.sampleRate = this.sampleRate;

    if (!opts.parentId) {
      opts.parentId = this.id;
    }

    var span = new _span__WEBPACK_IMPORTED_MODULE_2__.default(name, type, opts);
    this._activeSpans[span.id] = span;

    if (opts.blocking) {
      this.addTask(span.id);
    }

    return span;
  };

  _proto.isFinished = function isFinished() {
    return !this.blocked && this._activeTasks.size === 0;
  };

  _proto.detectFinish = function detectFinish() {
    if (this.isFinished()) this.end();
  };

  _proto.end = function end(endTime) {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this._end = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.getTime)(endTime);

    for (var sid in this._activeSpans) {
      var span = this._activeSpans[sid];
      span.type = span.type + _common_constants__WEBPACK_IMPORTED_MODULE_1__.TRUNCATED_TYPE;
      span.end(endTime);
    }

    this.callOnEnd();
  };

  _proto.captureBreakdown = function captureBreakdown() {
    this.breakdownTimings = (0,_breakdown__WEBPACK_IMPORTED_MODULE_3__.captureBreakdown)(this);
  };

  _proto.block = function block(flag) {
    this.blocked = flag;

    if (!this.blocked) {
      this.detectFinish();
    }
  };

  _proto.addTask = function addTask(taskId) {
    if (!taskId) {
      taskId = 'task-' + (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.generateRandomId)(16);
    }

    this._activeTasks.add(taskId);

    return taskId;
  };

  _proto.removeTask = function removeTask(taskId) {
    var deleted = this._activeTasks.delete(taskId);

    deleted && this.detectFinish();
  };

  _proto.resetFields = function resetFields() {
    this.spans = [];
    this.sampleRate = 0;
  };

  _proto._onSpanEnd = function _onSpanEnd(span) {
    this.spans.push(span);
    delete this._activeSpans[span.id];
    this.removeTask(span.id);
  };

  _proto.isManaged = function isManaged() {
    return !!this.options.managed;
  };

  return Transaction;
}(_span_base__WEBPACK_IMPORTED_MODULE_4__.default);

/* harmony default export */ __webpack_exports__["default"] = (Transaction);

/***/ }),

/***/ "../rum-core/dist/es/state.js":
/*!************************************!*\
  !*** ../rum-core/dist/es/state.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__DEV__": function() { return /* binding */ __DEV__; },
/* harmony export */   "state": function() { return /* binding */ state; }
/* harmony export */ });
var __DEV__ = "development" !== 'production';

var state = {
  bootstrapTime: null,
  lastHiddenStart: Number.MIN_SAFE_INTEGER
};


/***/ }),

/***/ "./src/apm-base.js":
/*!*************************!*\
  !*** ./src/apm-base.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ ApmBase; }
/* harmony export */ });
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/constants.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/instrument.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/page-visibility.js");


var ApmBase = function () {
  function ApmBase(serviceFactory, disable) {
    this._disable = disable;
    this.serviceFactory = serviceFactory;
    this._initialized = false;
  }

  var _proto = ApmBase.prototype;

  _proto.isEnabled = function isEnabled() {
    return !this._disable;
  };

  _proto.isActive = function isActive() {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    return this.isEnabled() && this._initialized && configService.get('active');
  };

  _proto.init = function init(config) {
    var _this = this;

    if (this.isEnabled() && !this._initialized) {
      this._initialized = true;

      var _this$serviceFactory$ = this.serviceFactory.getService([_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE]),
          configService = _this$serviceFactory$[0],
          loggingService = _this$serviceFactory$[1],
          transactionService = _this$serviceFactory$[2];

      configService.setVersion('5.11.0');
      this.config(config);
      var logLevel = configService.get('logLevel');
      loggingService.setLevel(logLevel);
      var isConfigActive = configService.get('active');

      if (isConfigActive) {
        this.serviceFactory.init();
        var flags = (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__.getInstrumentationFlags)(configService.get('instrument'), configService.get('disableInstrumentations'));
        var performanceMonitoring = this.serviceFactory.getService('PerformanceMonitoring');
        performanceMonitoring.init(flags);

        if (flags[_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.ERROR]) {
          var errorLogging = this.serviceFactory.getService('ErrorLogging');
          errorLogging.registerListeners();
        }

        if (configService.get('session')) {
          var localConfig = configService.getLocalConfig();

          if (localConfig && localConfig.session) {
            configService.setConfig({
              session: localConfig.session
            });
          }
        }

        var sendPageLoad = function sendPageLoad() {
          return flags[_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD] && _this._sendPageLoadMetrics();
        };

        if (configService.get('centralConfig')) {
          this.fetchCentralConfig().then(sendPageLoad);
        } else {
          sendPageLoad();
        }

        (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__.observePageVisibility)(configService, transactionService);
      } else {
        this._disable = true;
        loggingService.warn('RUM agent is inactive');
      }
    }

    return this;
  };

  _proto.fetchCentralConfig = function fetchCentralConfig() {
    var _this$serviceFactory$2 = this.serviceFactory.getService([_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.APM_SERVER, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE]),
        apmServer = _this$serviceFactory$2[0],
        loggingService = _this$serviceFactory$2[1],
        configService = _this$serviceFactory$2[2];

    return apmServer.fetchConfig(configService.get('serviceName'), configService.get('environment')).then(function (config) {
      var transactionSampleRate = config['transaction_sample_rate'];

      if (transactionSampleRate) {
        transactionSampleRate = Number(transactionSampleRate);
        var _config2 = {
          transactionSampleRate: transactionSampleRate
        };

        var _configService$valida = configService.validate(_config2),
            invalid = _configService$valida.invalid;

        if (invalid.length === 0) {
          configService.setConfig(_config2);
        } else {
          var _invalid$ = invalid[0],
              key = _invalid$.key,
              value = _invalid$.value,
              allowed = _invalid$.allowed;
          loggingService.warn("invalid value \"" + value + "\" for " + key + ". Allowed: " + allowed + ".");
        }
      }

      return config;
    }).catch(function (error) {
      loggingService.warn('failed fetching config:', error);
    });
  };

  _proto._sendPageLoadMetrics = function _sendPageLoadMetrics() {
    var tr = this.startTransaction(undefined, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD, {
      managed: true,
      canReuse: true
    });

    if (!tr) {
      return;
    }

    tr.addTask(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD);

    var sendPageLoadMetrics = function sendPageLoadMetrics() {
      setTimeout(function () {
        return tr.removeTask(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD);
      }, _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.PAGE_LOAD_DELAY);
    };

    if (document.readyState === 'complete') {
      sendPageLoadMetrics();
    } else {
      window.addEventListener('load', sendPageLoadMetrics);
    }
  };

  _proto.observe = function observe(name, fn) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.events.observe(name, fn);
  };

  _proto.config = function config(_config) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);

    var _configService$valida2 = configService.validate(_config),
        missing = _configService$valida2.missing,
        invalid = _configService$valida2.invalid;

    if (missing.length === 0 && invalid.length === 0) {
      configService.setConfig(_config);
    } else {
      var loggingService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.LOGGING_SERVICE);
      var separator = ', ';
      var message = "RUM agent isn't correctly configured. ";

      if (missing.length > 0) {
        message += missing.join(separator) + ' is missing';

        if (invalid.length > 0) {
          message += separator;
        }
      }

      invalid.forEach(function (_ref, index) {
        var key = _ref.key,
            value = _ref.value,
            allowed = _ref.allowed;
        message += key + " \"" + value + "\" contains invalid characters! (allowed: " + allowed + ")" + (index !== invalid.length - 1 ? separator : '');
      });
      loggingService.error(message);
      configService.setConfig({
        active: false
      });
    }
  };

  _proto.setUserContext = function setUserContext(userContext) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.setUserContext(userContext);
  };

  _proto.setCustomContext = function setCustomContext(customContext) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.setCustomContext(customContext);
  };

  _proto.addLabels = function addLabels(labels) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.addLabels(labels);
  };

  _proto.setInitialPageLoadName = function setInitialPageLoadName(name) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.setConfig({
      pageLoadTransactionName: name
    });
  };

  _proto.startTransaction = function startTransaction(name, type, options) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
      return transactionService.startTransaction(name, type, options);
    }
  };

  _proto.startSpan = function startSpan(name, type, options) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
      return transactionService.startSpan(name, type, options);
    }
  };

  _proto.getCurrentTransaction = function getCurrentTransaction() {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.TRANSACTION_SERVICE);
      return transactionService.getCurrentTransaction();
    }
  };

  _proto.captureError = function captureError(error) {
    if (this.isEnabled()) {
      var errorLogging = this.serviceFactory.getService('ErrorLogging');
      return errorLogging.logError(error);
    }
  };

  _proto.addFilter = function addFilter(fn) {
    var configService = this.serviceFactory.getService(_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_0__.CONFIG_SERVICE);
    configService.addFilter(fn);
  };

  return ApmBase;
}();



/***/ }),

/***/ "../../node_modules/error-stack-parser/error-stack-parser.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/error-stack-parser/error-stack-parser.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! stackframe */ "../../node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    function _map(array, fn, thisArg) {
        if (typeof Array.prototype.map === 'function') {
            return array.map(fn, thisArg);
        } else {
            var output = new Array(array.length);
            for (var i = 0; i < array.length; i++) {
                output[i] = fn.call(thisArg, array[i]);
            }
            return output;
        }
    }

    function _filter(array, fn, thisArg) {
        if (typeof Array.prototype.filter === 'function') {
            return array.filter(fn, thisArg);
        } else {
            var output = [];
            for (var i = 0; i < array.length; i++) {
                if (fn.call(thisArg, array[i])) {
                    output.push(array[i]);
                }
            }
            return output;
        }
    }

    function _indexOf(array, target) {
        if (typeof Array.prototype.indexOf === 'function') {
            return array.indexOf(target);
        } else {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === target) {
                    return i;
                }
            }
            return -1;
        }
    }

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return _map(filtered, function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = _indexOf(['eval', '<anonymous>'], locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame(functionName, undefined, fileName, locationParts[1], locationParts[2], line);
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return _map(filtered, function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame(line);
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;
                    return new StackFrame(functionName,
                        undefined,
                        locationParts[0],
                        locationParts[1],
                        locationParts[2],
                        line);
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame(undefined, undefined, match[2], match[1], undefined, lines[i]));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame(
                            match[3] || undefined,
                            undefined,
                            match[2],
                            match[1],
                            undefined,
                            lines[i]
                        )
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = _filter(error.stack.split('\n'), function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return _map(filtered, function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');
                return new StackFrame(
                    functionName,
                    args,
                    locationParts[0],
                    locationParts[1],
                    locationParts[2],
                    line);
            }, this);
        }
    };
}));



/***/ }),

/***/ "../../node_modules/opentracing/lib/constants.js":
/*!*******************************************************!*\
  !*** ../../node_modules/opentracing/lib/constants.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * The FORMAT_BINARY format represents SpanContexts in an opaque binary
 * carrier.
 *
 * Tracer.inject() will set the buffer field to an Array-like (Array,
 * ArrayBuffer, or TypedBuffer) object containing the injected binary data.
 * Any valid Object can be used as long as the buffer field of the object
 * can be set.
 *
 * Tracer.extract() will look for `carrier.buffer`, and that field is
 * expected to be an Array-like object (Array, ArrayBuffer, or
 * TypedBuffer).
 */
exports.FORMAT_BINARY = 'binary';
/**
 * The FORMAT_TEXT_MAP format represents SpanContexts using a
 * string->string map (backed by a Javascript Object) as a carrier.
 *
 * NOTE: Unlike FORMAT_HTTP_HEADERS, FORMAT_TEXT_MAP places no restrictions
 * on the characters used in either the keys or the values of the map
 * entries.
 *
 * The FORMAT_TEXT_MAP carrier map may contain unrelated data (e.g.,
 * arbitrary gRPC metadata); as such, the Tracer implementation should use
 * a prefix or other convention to distinguish Tracer-specific key:value
 * pairs.
 */
exports.FORMAT_TEXT_MAP = 'text_map';
/**
 * The FORMAT_HTTP_HEADERS format represents SpanContexts using a
 * character-restricted string->string map (backed by a Javascript Object)
 * as a carrier.
 *
 * Keys and values in the FORMAT_HTTP_HEADERS carrier must be suitable for
 * use as HTTP headers (without modification or further escaping). That is,
 * the keys have a greatly restricted character set, casing for the keys
 * may not be preserved by various intermediaries, and the values should be
 * URL-escaped.
 *
 * The FORMAT_HTTP_HEADERS carrier map may contain unrelated data (e.g.,
 * arbitrary HTTP headers); as such, the Tracer implementation should use a
 * prefix or other convention to distinguish Tracer-specific key:value
 * pairs.
 */
exports.FORMAT_HTTP_HEADERS = 'http_headers';
/**
 * A Span may be the "child of" a parent Span. In a “child of” reference,
 * the parent Span depends on the child Span in some capacity.
 *
 * See more about reference types at https://github.com/opentracing/specification
 */
exports.REFERENCE_CHILD_OF = 'child_of';
/**
 * Some parent Spans do not depend in any way on the result of their child
 * Spans. In these cases, we say merely that the child Span “follows from”
 * the parent Span in a causal sense.
 *
 * See more about reference types at https://github.com/opentracing/specification
 */
exports.REFERENCE_FOLLOWS_FROM = 'follows_from';
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/functions.js":
/*!*******************************************************!*\
  !*** ../../node_modules/opentracing/lib/functions.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Constants = __webpack_require__(/*! ./constants */ "../../node_modules/opentracing/lib/constants.js");
var reference_1 = __webpack_require__(/*! ./reference */ "../../node_modules/opentracing/lib/reference.js");
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
/**
 * Return a new REFERENCE_CHILD_OF reference.
 *
 * @param {SpanContext} spanContext - the parent SpanContext instance to
 *        reference.
 * @return a REFERENCE_CHILD_OF reference pointing to `spanContext`
 */
function childOf(spanContext) {
    // Allow the user to pass a Span instead of a SpanContext
    if (spanContext instanceof span_1.default) {
        spanContext = spanContext.context();
    }
    return new reference_1.default(Constants.REFERENCE_CHILD_OF, spanContext);
}
exports.childOf = childOf;
/**
 * Return a new REFERENCE_FOLLOWS_FROM reference.
 *
 * @param {SpanContext} spanContext - the parent SpanContext instance to
 *        reference.
 * @return a REFERENCE_FOLLOWS_FROM reference pointing to `spanContext`
 */
function followsFrom(spanContext) {
    // Allow the user to pass a Span instead of a SpanContext
    if (spanContext instanceof span_1.default) {
        spanContext = spanContext.context();
    }
    return new reference_1.default(Constants.REFERENCE_FOLLOWS_FROM, spanContext);
}
exports.followsFrom = followsFrom;
//# sourceMappingURL=functions.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/noop.js":
/*!**************************************************!*\
  !*** ../../node_modules/opentracing/lib/noop.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
var span_context_1 = __webpack_require__(/*! ./span_context */ "../../node_modules/opentracing/lib/span_context.js");
var tracer_1 = __webpack_require__(/*! ./tracer */ "../../node_modules/opentracing/lib/tracer.js");
exports.tracer = null;
exports.spanContext = null;
exports.span = null;
// Deferred initialization to avoid a dependency cycle where Tracer depends on
// Span which depends on the noop tracer.
function initialize() {
    exports.tracer = new tracer_1.default();
    exports.span = new span_1.default();
    exports.spanContext = new span_context_1.default();
}
exports.initialize = initialize;
//# sourceMappingURL=noop.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/reference.js":
/*!*******************************************************!*\
  !*** ../../node_modules/opentracing/lib/reference.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
/**
 * Reference pairs a reference type constant (e.g., REFERENCE_CHILD_OF or
 * REFERENCE_FOLLOWS_FROM) with the SpanContext it points to.
 *
 * See the exported childOf() and followsFrom() functions at the package level.
 */
var Reference = /** @class */ (function () {
    /**
     * Initialize a new Reference instance.
     *
     * @param {string} type - the Reference type constant (e.g.,
     *        REFERENCE_CHILD_OF or REFERENCE_FOLLOWS_FROM).
     * @param {SpanContext} referencedContext - the SpanContext being referred
     *        to. As a convenience, a Span instance may be passed in instead
     *        (in which case its .context() is used here).
     */
    function Reference(type, referencedContext) {
        this._type = type;
        this._referencedContext = (referencedContext instanceof span_1.default ?
            referencedContext.context() :
            referencedContext);
    }
    /**
     * @return {string} The Reference type (e.g., REFERENCE_CHILD_OF or
     *         REFERENCE_FOLLOWS_FROM).
     */
    Reference.prototype.type = function () {
        return this._type;
    };
    /**
     * @return {SpanContext} The SpanContext being referred to (e.g., the
     *         parent in a REFERENCE_CHILD_OF Reference).
     */
    Reference.prototype.referencedContext = function () {
        return this._referencedContext;
    };
    return Reference;
}());
exports.default = Reference;
//# sourceMappingURL=reference.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/span.js":
/*!**************************************************!*\
  !*** ../../node_modules/opentracing/lib/span.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var noop = __webpack_require__(/*! ./noop */ "../../node_modules/opentracing/lib/noop.js");
/**
 * Span represents a logical unit of work as part of a broader Trace. Examples
 * of span might include remote procedure calls or a in-process function calls
 * to sub-components. A Trace has a single, top-level "root" Span that in turn
 * may have zero or more child Spans, which in turn may have children.
 */
var Span = /** @class */ (function () {
    function Span() {
    }
    // ---------------------------------------------------------------------- //
    // OpenTracing API methods
    // ---------------------------------------------------------------------- //
    /**
     * Returns the SpanContext object associated with this Span.
     *
     * @return {SpanContext}
     */
    Span.prototype.context = function () {
        return this._context();
    };
    /**
     * Returns the Tracer object used to create this Span.
     *
     * @return {Tracer}
     */
    Span.prototype.tracer = function () {
        return this._tracer();
    };
    /**
     * Sets the string name for the logical operation this span represents.
     *
     * @param {string} name
     */
    Span.prototype.setOperationName = function (name) {
        this._setOperationName(name);
        return this;
    };
    /**
     * Sets a key:value pair on this Span that also propagates to future
     * children of the associated Span.
     *
     * setBaggageItem() enables powerful functionality given a full-stack
     * opentracing integration (e.g., arbitrary application data from a web
     * client can make it, transparently, all the way into the depths of a
     * storage system), and with it some powerful costs: use this feature with
     * care.
     *
     * IMPORTANT NOTE #1: setBaggageItem() will only propagate baggage items to
     * *future* causal descendants of the associated Span.
     *
     * IMPORTANT NOTE #2: Use this thoughtfully and with care. Every key and
     * value is copied into every local *and remote* child of the associated
     * Span, and that can add up to a lot of network and cpu overhead.
     *
     * @param {string} key
     * @param {string} value
     */
    Span.prototype.setBaggageItem = function (key, value) {
        this._setBaggageItem(key, value);
        return this;
    };
    /**
     * Returns the value for a baggage item given its key.
     *
     * @param  {string} key
     *         The key for the given trace attribute.
     * @return {string}
     *         String value for the given key, or undefined if the key does not
     *         correspond to a set trace attribute.
     */
    Span.prototype.getBaggageItem = function (key) {
        return this._getBaggageItem(key);
    };
    /**
     * Adds a single tag to the span.  See `addTags()` for details.
     *
     * @param {string} key
     * @param {any} value
     */
    Span.prototype.setTag = function (key, value) {
        // NOTE: the call is normalized to a call to _addTags()
        this._addTags((_a = {}, _a[key] = value, _a));
        return this;
        var _a;
    };
    /**
     * Adds the given key value pairs to the set of span tags.
     *
     * Multiple calls to addTags() results in the tags being the superset of
     * all calls.
     *
     * The behavior of setting the same key multiple times on the same span
     * is undefined.
     *
     * The supported type of the values is implementation-dependent.
     * Implementations are expected to safely handle all types of values but
     * may choose to ignore unrecognized / unhandle-able values (e.g. objects
     * with cyclic references, function objects).
     *
     * @return {[type]} [description]
     */
    Span.prototype.addTags = function (keyValueMap) {
        this._addTags(keyValueMap);
        return this;
    };
    /**
     * Add a log record to this Span, optionally at a user-provided timestamp.
     *
     * For example:
     *
     *     span.log({
     *         size: rpc.size(),  // numeric value
     *         URI: rpc.URI(),  // string value
     *         payload: rpc.payload(),  // Object value
     *         "keys can be arbitrary strings": rpc.foo(),
     *     });
     *
     *     span.log({
     *         "error.description": someError.description(),
     *     }, someError.timestampMillis());
     *
     * @param {object} keyValuePairs
     *        An object mapping string keys to arbitrary value types. All
     *        Tracer implementations should support bool, string, and numeric
     *        value types, and some may also support Object values.
     * @param {number} timestamp
     *        An optional parameter specifying the timestamp in milliseconds
     *        since the Unix epoch. Fractional values are allowed so that
     *        timestamps with sub-millisecond accuracy can be represented. If
     *        not specified, the implementation is expected to use its notion
     *        of the current time of the call.
     */
    Span.prototype.log = function (keyValuePairs, timestamp) {
        this._log(keyValuePairs, timestamp);
        return this;
    };
    /**
     * DEPRECATED
     */
    Span.prototype.logEvent = function (eventName, payload) {
        return this._log({ event: eventName, payload: payload });
    };
    /**
     * Sets the end timestamp and finalizes Span state.
     *
     * With the exception of calls to Span.context() (which are always allowed),
     * finish() must be the last call made to any span instance, and to do
     * otherwise leads to undefined behavior.
     *
     * @param  {number} finishTime
     *         Optional finish time in milliseconds as a Unix timestamp. Decimal
     *         values are supported for timestamps with sub-millisecond accuracy.
     *         If not specified, the current time (as defined by the
     *         implementation) will be used.
     */
    Span.prototype.finish = function (finishTime) {
        this._finish(finishTime);
        // Do not return `this`. The Span generally should not be used after it
        // is finished so chaining is not desired in this context.
    };
    // ---------------------------------------------------------------------- //
    // Derived classes can choose to implement the below
    // ---------------------------------------------------------------------- //
    // By default returns a no-op SpanContext.
    Span.prototype._context = function () {
        return noop.spanContext;
    };
    // By default returns a no-op tracer.
    //
    // The base class could store the tracer that created it, but it does not
    // in order to ensure the no-op span implementation has zero members,
    // which allows V8 to aggressively optimize calls to such objects.
    Span.prototype._tracer = function () {
        return noop.tracer;
    };
    // By default does nothing
    Span.prototype._setOperationName = function (name) {
    };
    // By default does nothing
    Span.prototype._setBaggageItem = function (key, value) {
    };
    // By default does nothing
    Span.prototype._getBaggageItem = function (key) {
        return undefined;
    };
    // By default does nothing
    //
    // NOTE: both setTag() and addTags() map to this function. keyValuePairs
    // will always be an associative array.
    Span.prototype._addTags = function (keyValuePairs) {
    };
    // By default does nothing
    Span.prototype._log = function (keyValuePairs, timestamp) {
    };
    // By default does nothing
    //
    // finishTime is expected to be either a number or undefined.
    Span.prototype._finish = function (finishTime) {
    };
    return Span;
}());
exports.Span = Span;
exports.default = Span;
//# sourceMappingURL=span.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/span_context.js":
/*!**********************************************************!*\
  !*** ../../node_modules/opentracing/lib/span_context.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * SpanContext represents Span state that must propagate to descendant Spans
 * and across process boundaries.
 *
 * SpanContext is logically divided into two pieces: the user-level "Baggage"
 * (see setBaggageItem and getBaggageItem) that propagates across Span
 * boundaries and any Tracer-implementation-specific fields that are needed to
 * identify or otherwise contextualize the associated Span instance (e.g., a
 * <trace_id, span_id, sampled> tuple).
 */
var SpanContext = /** @class */ (function () {
    function SpanContext() {
    }
    return SpanContext;
}());
exports.SpanContext = SpanContext;
exports.default = SpanContext;
//# sourceMappingURL=span_context.js.map

/***/ }),

/***/ "../../node_modules/opentracing/lib/tracer.js":
/*!****************************************************!*\
  !*** ../../node_modules/opentracing/lib/tracer.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Functions = __webpack_require__(/*! ./functions */ "../../node_modules/opentracing/lib/functions.js");
var Noop = __webpack_require__(/*! ./noop */ "../../node_modules/opentracing/lib/noop.js");
var span_1 = __webpack_require__(/*! ./span */ "../../node_modules/opentracing/lib/span.js");
/**
 * Tracer is the entry-point between the instrumentation API and the tracing
 * implementation.
 *
 * The default object acts as a no-op implementation.
 *
 * Note to implementators: derived classes can choose to directly implement the
 * methods in the "OpenTracing API methods" section, or optionally the subset of
 * underscore-prefixed methods to pick up the argument checking and handling
 * automatically from the base class.
 */
var Tracer = /** @class */ (function () {
    function Tracer() {
    }
    // ---------------------------------------------------------------------- //
    // OpenTracing API methods
    // ---------------------------------------------------------------------- //
    /**
     * Starts and returns a new Span representing a logical unit of work.
     *
     * For example:
     *
     *     // Start a new (parentless) root Span:
     *     var parent = Tracer.startSpan('DoWork');
     *
     *     // Start a new (child) Span:
     *     var child = Tracer.startSpan('load-from-db', {
     *         childOf: parent.context(),
     *     });
     *
     *     // Start a new async (FollowsFrom) Span:
     *     var child = Tracer.startSpan('async-cache-write', {
     *         references: [
     *             opentracing.followsFrom(parent.context())
     *         ],
     *     });
     *
     * @param {string} name - the name of the operation (REQUIRED).
     * @param {SpanOptions} [options] - options for the newly created span.
     * @return {Span} - a new Span object.
     */
    Tracer.prototype.startSpan = function (name, options) {
        if (options === void 0) { options = {}; }
        // Convert options.childOf to fields.references as needed.
        if (options.childOf) {
            // Convert from a Span or a SpanContext into a Reference.
            var childOf = Functions.childOf(options.childOf);
            if (options.references) {
                options.references.push(childOf);
            }
            else {
                options.references = [childOf];
            }
            delete (options.childOf);
        }
        return this._startSpan(name, options);
    };
    /**
     * Injects the given SpanContext instance for cross-process propagation
     * within `carrier`. The expected type of `carrier` depends on the value of
     * `format.
     *
     * OpenTracing defines a common set of `format` values (see
     * FORMAT_TEXT_MAP, FORMAT_HTTP_HEADERS, and FORMAT_BINARY), and each has
     * an expected carrier type.
     *
     * Consider this pseudocode example:
     *
     *     var clientSpan = ...;
     *     ...
     *     // Inject clientSpan into a text carrier.
     *     var headersCarrier = {};
     *     Tracer.inject(clientSpan.context(), Tracer.FORMAT_HTTP_HEADERS, headersCarrier);
     *     // Incorporate the textCarrier into the outbound HTTP request header
     *     // map.
     *     Object.assign(outboundHTTPReq.headers, headersCarrier);
     *     // ... send the httpReq
     *
     * @param  {SpanContext} spanContext - the SpanContext to inject into the
     *         carrier object. As a convenience, a Span instance may be passed
     *         in instead (in which case its .context() is used for the
     *         inject()).
     * @param  {string} format - the format of the carrier.
     * @param  {any} carrier - see the documentation for the chosen `format`
     *         for a description of the carrier object.
     */
    Tracer.prototype.inject = function (spanContext, format, carrier) {
        // Allow the user to pass a Span instead of a SpanContext
        if (spanContext instanceof span_1.default) {
            spanContext = spanContext.context();
        }
        return this._inject(spanContext, format, carrier);
    };
    /**
     * Returns a SpanContext instance extracted from `carrier` in the given
     * `format`.
     *
     * OpenTracing defines a common set of `format` values (see
     * FORMAT_TEXT_MAP, FORMAT_HTTP_HEADERS, and FORMAT_BINARY), and each has
     * an expected carrier type.
     *
     * Consider this pseudocode example:
     *
     *     // Use the inbound HTTP request's headers as a text map carrier.
     *     var headersCarrier = inboundHTTPReq.headers;
     *     var wireCtx = Tracer.extract(Tracer.FORMAT_HTTP_HEADERS, headersCarrier);
     *     var serverSpan = Tracer.startSpan('...', { childOf : wireCtx });
     *
     * @param  {string} format - the format of the carrier.
     * @param  {any} carrier - the type of the carrier object is determined by
     *         the format.
     * @return {SpanContext}
     *         The extracted SpanContext, or null if no such SpanContext could
     *         be found in `carrier`
     */
    Tracer.prototype.extract = function (format, carrier) {
        return this._extract(format, carrier);
    };
    // ---------------------------------------------------------------------- //
    // Derived classes can choose to implement the below
    // ---------------------------------------------------------------------- //
    // NOTE: the input to this method is *always* an associative array. The
    // public-facing startSpan() method normalizes the arguments so that
    // all N implementations do not need to worry about variations in the call
    // signature.
    //
    // The default behavior returns a no-op span.
    Tracer.prototype._startSpan = function (name, fields) {
        return Noop.span;
    };
    // The default behavior is a no-op.
    Tracer.prototype._inject = function (spanContext, format, carrier) {
    };
    // The default behavior is to return a no-op SpanContext.
    Tracer.prototype._extract = function (format, carrier) {
        return Noop.spanContext;
    };
    return Tracer;
}());
exports.Tracer = Tracer;
exports.default = Tracer;
//# sourceMappingURL=tracer.js.map

/***/ }),

/***/ "../../node_modules/promise-polyfill/src/finally.js":
/*!**********************************************************!*\
  !*** ../../node_modules/promise-polyfill/src/finally.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        // @ts-ignore
        return constructor.reject(reason);
      });
    }
  );
}

/* harmony default export */ __webpack_exports__["default"] = (finallyConstructor);


/***/ }),

/***/ "../../node_modules/promise-polyfill/src/index.js":
/*!********************************************************!*\
  !*** ../../node_modules/promise-polyfill/src/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _finally__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./finally */ "../../node_modules/promise-polyfill/src/finally.js");


// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined');
}

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = _finally__WEBPACK_IMPORTED_MODULE_0__.default;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array'));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  // @ts-ignore
  (typeof setImmediate === 'function' &&
    function(fn) {
      // @ts-ignore
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

/* harmony default export */ __webpack_exports__["default"] = (Promise);


/***/ }),

/***/ "../../node_modules/stackframe/stackframe.js":
/*!***************************************************!*\
  !*** ../../node_modules/stackframe/stackframe.js ***!
  \***************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function () {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function StackFrame(functionName, args, fileName, lineNumber, columnNumber, source) {
        if (functionName !== undefined) {
            this.setFunctionName(functionName);
        }
        if (args !== undefined) {
            this.setArgs(args);
        }
        if (fileName !== undefined) {
            this.setFileName(fileName);
        }
        if (lineNumber !== undefined) {
            this.setLineNumber(lineNumber);
        }
        if (columnNumber !== undefined) {
            this.setColumnNumber(columnNumber);
        }
        if (source !== undefined) {
            this.setSource(source);
        }
    }

    StackFrame.prototype = {
        getFunctionName: function () {
            return this.functionName;
        },
        setFunctionName: function (v) {
            this.functionName = String(v);
        },

        getArgs: function () {
            return this.args;
        },
        setArgs: function (v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        // NOTE: Property name may be misleading as it includes the path,
        // but it somewhat mirrors V8's JavaScriptStackTraceApi
        // https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi and Gecko's
        // http://mxr.mozilla.org/mozilla-central/source/xpcom/base/nsIException.idl#14
        getFileName: function () {
            return this.fileName;
        },
        setFileName: function (v) {
            this.fileName = String(v);
        },

        getLineNumber: function () {
            return this.lineNumber;
        },
        setLineNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Line Number must be a Number');
            }
            this.lineNumber = Number(v);
        },

        getColumnNumber: function () {
            return this.columnNumber;
        },
        setColumnNumber: function (v) {
            if (!_isNumber(v)) {
                throw new TypeError('Column Number must be a Number');
            }
            this.columnNumber = Number(v);
        },

        getSource: function () {
            return this.source;
        },
        setSource: function (v) {
            this.source = String(v);
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    return StackFrame;
}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "init": function() { return /* binding */ init; },
/* harmony export */   "apmBase": function() { return /* binding */ apmBase; },
/* harmony export */   "ApmBase": function() { return /* reexport safe */ _apm_base__WEBPACK_IMPORTED_MODULE_0__.default; },
/* harmony export */   "apm": function() { return /* binding */ apmBase; }
/* harmony export */ });
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/common/utils.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/bootstrap.js");
/* harmony import */ var _elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @elastic/apm-rum-core */ "../rum-core/dist/es/index.js");
/* harmony import */ var _apm_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./apm-base */ "./src/apm-base.js");



function getApmBase() {
  if (_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__.isBrowser && window.elasticApm) {
    return window.elasticApm;
  }

  var enabled = (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_2__.bootstrap)();
  var serviceFactory = (0,_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_3__.createServiceFactory)();
  var apmBase = new _apm_base__WEBPACK_IMPORTED_MODULE_0__.default(serviceFactory, !enabled);

  if (_elastic_apm_rum_core__WEBPACK_IMPORTED_MODULE_1__.isBrowser) {
    window.elasticApm = apmBase;
  }

  return apmBase;
}

var apmBase = getApmBase();
var init = apmBase.init.bind(apmBase);
/* harmony default export */ __webpack_exports__["default"] = (init);

}();
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxhc3RpYy1hcG0tcnVtLnVtZC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovL1tuYW1lXS93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvYm9vdHN0cmFwLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9hZnRlci1mcmFtZS5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vYXBtLXNlcnZlci5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vY29tcHJlc3MuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2NvbmZpZy1zZXJ2aWNlLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2NvbnRleHQuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2V2ZW50LWhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2h0dHAvZmV0Y2guanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL2h0dHAvcmVzcG9uc2Utc3RhdHVzLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9odHRwL3hoci5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vaW5zdHJ1bWVudC5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vbG9nZ2luZy1zZXJ2aWNlLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9uZGpzb24uanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3BhZ2UtdmlzaWJpbGl0eS5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vcGF0Y2hpbmcvZXZlbnQtdGFyZ2V0LXBhdGNoLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9wYXRjaGluZy9mZXRjaC1wYXRjaC5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vcGF0Y2hpbmcvaGlzdG9yeS1wYXRjaC5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vcGF0Y2hpbmcvaW5kZXguanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3BhdGNoaW5nL3BhdGNoLXV0aWxzLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi9wYXRjaGluZy94aHItcGF0Y2guanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3BvbHlmaWxscy5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vcXVldWUuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3NlcnZpY2UtZmFjdG9yeS5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9jb21tb24vdGhyb3R0bGUuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3RydW5jYXRlLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2NvbW1vbi91cmwuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvY29tbW9uL3V0aWxzLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2Vycm9yLWxvZ2dpbmcvZXJyb3ItbG9nZ2luZy5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9lcnJvci1sb2dnaW5nL2luZGV4LmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL2Vycm9yLWxvZ2dpbmcvc3RhY2stdHJhY2UuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvb3BlbnRyYWNpbmcvaW5kZXguanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvb3BlbnRyYWNpbmcvc3Bhbi5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9vcGVudHJhY2luZy90cmFjZXIuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9icmVha2Rvd24uanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9jYXB0dXJlLW5hdmlnYXRpb24uanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9pbmRleC5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL21ldHJpY3MuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3Jpbmcvc3Bhbi1iYXNlLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi9ydW0tY29yZS9kaXN0L2VzL3BlcmZvcm1hbmNlLW1vbml0b3Jpbmcvc3Bhbi5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL3RyYW5zYWN0aW9uLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uL3J1bS1jb3JlL2Rpc3QvZXMvcGVyZm9ybWFuY2UtbW9uaXRvcmluZy90cmFuc2FjdGlvbi5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vcnVtLWNvcmUvZGlzdC9lcy9zdGF0ZS5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi9zcmMvYXBtLWJhc2UuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uLy4uL25vZGVfbW9kdWxlcy9lcnJvci1zdGFjay1wYXJzZXIvZXJyb3Itc3RhY2stcGFyc2VyLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi8uLi9ub2RlX21vZHVsZXMvb3BlbnRyYWNpbmcvbGliL2NvbnN0YW50cy5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vLi4vbm9kZV9tb2R1bGVzL29wZW50cmFjaW5nL2xpYi9mdW5jdGlvbnMuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uLy4uL25vZGVfbW9kdWxlcy9vcGVudHJhY2luZy9saWIvbm9vcC5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vLi4vbm9kZV9tb2R1bGVzL29wZW50cmFjaW5nL2xpYi9yZWZlcmVuY2UuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uLy4uL25vZGVfbW9kdWxlcy9vcGVudHJhY2luZy9saWIvc3Bhbi5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vLi4vbm9kZV9tb2R1bGVzL29wZW50cmFjaW5nL2xpYi9zcGFuX2NvbnRleHQuanMiLCJ3ZWJwYWNrOi8vW25hbWVdLy4uLy4uL25vZGVfbW9kdWxlcy9vcGVudHJhY2luZy9saWIvdHJhY2VyLmpzIiwid2VicGFjazovL1tuYW1lXS8uLi8uLi9ub2RlX21vZHVsZXMvcHJvbWlzZS1wb2x5ZmlsbC9zcmMvZmluYWxseS5qcyIsIndlYnBhY2s6Ly9bbmFtZV0vLi4vLi4vbm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvc3JjL2luZGV4LmpzIiwid2VicGFjazovL1tuYW1lXS8uLi8uLi9ub2RlX21vZHVsZXMvc3RhY2tmcmFtZS9zdGFja2ZyYW1lLmpzIiwid2VicGFjazovL1tuYW1lXS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9bbmFtZV0vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vW25hbWVdL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9bbmFtZV0vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9bbmFtZV0vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9bbmFtZV0vLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiZWxhc3RpYy1hcG0tcnVtXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImVsYXN0aWMtYXBtLXJ1bVwiXSA9IGZhY3RvcnkoKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsImltcG9ydCB7IGlzUGxhdGZvcm1TdXBwb3J0ZWQsIGlzQnJvd3Nlciwgbm93IH0gZnJvbSAnLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHsgcGF0Y2hBbGwgfSBmcm9tICcuL2NvbW1vbi9wYXRjaGluZyc7XG5pbXBvcnQgeyBzdGF0ZSB9IGZyb20gJy4vc3RhdGUnO1xudmFyIGVuYWJsZWQgPSBmYWxzZTtcbmV4cG9ydCBmdW5jdGlvbiBib290c3RyYXAoKSB7XG4gIGlmIChpc1BsYXRmb3JtU3VwcG9ydGVkKCkpIHtcbiAgICBwYXRjaEFsbCgpO1xuICAgIHN0YXRlLmJvb3RzdHJhcFRpbWUgPSBub3coKTtcbiAgICBlbmFibGVkID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0Jyb3dzZXIpIHtcbiAgICBjb25zb2xlLmxvZygnW0VsYXN0aWMgQVBNXSBwbGF0Zm9ybSBpcyBub3Qgc3VwcG9ydGVkIScpO1xuICB9XG5cbiAgcmV0dXJuIGVuYWJsZWQ7XG59IiwidmFyIFJBRl9USU1FT1VUID0gMTAwO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWZ0ZXJGcmFtZShjYWxsYmFjaykge1xuICB2YXIgaGFuZGxlciA9IGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZik7XG4gICAgc2V0VGltZW91dChjYWxsYmFjayk7XG4gIH07XG5cbiAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGhhbmRsZXIsIFJBRl9USU1FT1VUKTtcbiAgdmFyIHJhZiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShoYW5kbGVyKTtcbn0iLCJpbXBvcnQgUXVldWUgZnJvbSAnLi9xdWV1ZSc7XG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnLi90aHJvdHRsZSc7XG5pbXBvcnQgTkRKU09OIGZyb20gJy4vbmRqc29uJztcbmltcG9ydCB7IHRydW5jYXRlTW9kZWwsIE1FVEFEQVRBX01PREVMIH0gZnJvbSAnLi90cnVuY2F0ZSc7XG5pbXBvcnQgeyBFUlJPUlMsIEhUVFBfUkVRVUVTVF9USU1FT1VULCBRVUVVRV9GTFVTSCwgVFJBTlNBQ1RJT05TIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgUHJvbWlzZSB9IGZyb20gJy4vcG9seWZpbGxzJztcbmltcG9ydCB7IGNvbXByZXNzTWV0YWRhdGEsIGNvbXByZXNzVHJhbnNhY3Rpb24sIGNvbXByZXNzRXJyb3IsIGNvbXByZXNzUGF5bG9hZCB9IGZyb20gJy4vY29tcHJlc3MnO1xuaW1wb3J0IHsgX19ERVZfXyB9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7IHNlbmRGZXRjaFJlcXVlc3QsIHNob3VsZFVzZUZldGNoV2l0aEtlZXBBbGl2ZSB9IGZyb20gJy4vaHR0cC9mZXRjaCc7XG5pbXBvcnQgeyBzZW5kWEhSIH0gZnJvbSAnLi9odHRwL3hocic7XG52YXIgVEhST1RUTEVfSU5URVJWQUwgPSA2MDAwMDtcblxudmFyIEFwbVNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQXBtU2VydmVyKGNvbmZpZ1NlcnZpY2UsIGxvZ2dpbmdTZXJ2aWNlKSB7XG4gICAgdGhpcy5fY29uZmlnU2VydmljZSA9IGNvbmZpZ1NlcnZpY2U7XG4gICAgdGhpcy5fbG9nZ2luZ1NlcnZpY2UgPSBsb2dnaW5nU2VydmljZTtcbiAgICB0aGlzLnF1ZXVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudGhyb3R0bGVFdmVudHMgPSBub29wO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IEFwbVNlcnZlci5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgcXVldWVMaW1pdCA9IHRoaXMuX2NvbmZpZ1NlcnZpY2UuZ2V0KCdxdWV1ZUxpbWl0Jyk7XG5cbiAgICB2YXIgZmx1c2hJbnRlcnZhbCA9IHRoaXMuX2NvbmZpZ1NlcnZpY2UuZ2V0KCdmbHVzaEludGVydmFsJyk7XG5cbiAgICB2YXIgbGltaXQgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnZXZlbnRzTGltaXQnKTtcblxuICAgIHZhciBvbkZsdXNoID0gZnVuY3Rpb24gb25GbHVzaChldmVudHMpIHtcbiAgICAgIHZhciBwcm9taXNlID0gX3RoaXMuc2VuZEV2ZW50cyhldmVudHMpO1xuXG4gICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICBwcm9taXNlLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICBfdGhpcy5fbG9nZ2luZ1NlcnZpY2Uud2FybignRmFpbGVkIHNlbmRpbmcgZXZlbnRzIScsIF90aGlzLl9jb25zdHJ1Y3RFcnJvcihyZWFzb24pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMucXVldWUgPSBuZXcgUXVldWUob25GbHVzaCwge1xuICAgICAgcXVldWVMaW1pdDogcXVldWVMaW1pdCxcbiAgICAgIGZsdXNoSW50ZXJ2YWw6IGZsdXNoSW50ZXJ2YWxcbiAgICB9KTtcbiAgICB0aGlzLnRocm90dGxlRXZlbnRzID0gdGhyb3R0bGUodGhpcy5xdWV1ZS5hZGQuYmluZCh0aGlzLnF1ZXVlKSwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLl9sb2dnaW5nU2VydmljZS53YXJuKCdEcm9wcGVkIGV2ZW50cyBkdWUgdG8gdGhyb3R0bGluZyEnKTtcbiAgICB9LCB7XG4gICAgICBsaW1pdDogbGltaXQsXG4gICAgICBpbnRlcnZhbDogVEhST1RUTEVfSU5URVJWQUxcbiAgICB9KTtcblxuICAgIHRoaXMuX2NvbmZpZ1NlcnZpY2Uub2JzZXJ2ZUV2ZW50KFFVRVVFX0ZMVVNILCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5xdWV1ZS5mbHVzaCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIF9wcm90by5fcG9zdEpzb24gPSBmdW5jdGlvbiBfcG9zdEpzb24oZW5kUG9pbnQsIHBheWxvYWQpIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgIHZhciBoZWFkZXJzID0ge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LW5kanNvbidcbiAgICB9O1xuXG4gICAgdmFyIGFwbVJlcXVlc3QgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnYXBtUmVxdWVzdCcpO1xuXG4gICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgYmVmb3JlU2VuZDogYXBtUmVxdWVzdFxuICAgIH07XG4gICAgcmV0dXJuIGNvbXByZXNzUGF5bG9hZChwYXJhbXMpLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgX3RoaXMyLl9sb2dnaW5nU2VydmljZS5kZWJ1ZygnQ29tcHJlc3NpbmcgdGhlIHBheWxvYWQgdXNpbmcgQ29tcHJlc3Npb25TdHJlYW0gQVBJIGZhaWxlZCcsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgcmV0dXJuIF90aGlzMi5fbWFrZUh0dHBSZXF1ZXN0KCdQT1NUJywgZW5kUG9pbnQsIHJlc3VsdCk7XG4gICAgfSkudGhlbihmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIHJlc3BvbnNlVGV4dCA9IF9yZWYucmVzcG9uc2VUZXh0O1xuICAgICAgcmV0dXJuIHJlc3BvbnNlVGV4dDtcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uX2NvbnN0cnVjdEVycm9yID0gZnVuY3Rpb24gX2NvbnN0cnVjdEVycm9yKHJlYXNvbikge1xuICAgIHZhciB1cmwgPSByZWFzb24udXJsLFxuICAgICAgICBzdGF0dXMgPSByZWFzb24uc3RhdHVzLFxuICAgICAgICByZXNwb25zZVRleHQgPSByZWFzb24ucmVzcG9uc2VUZXh0O1xuXG4gICAgaWYgKHR5cGVvZiBzdGF0dXMgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiByZWFzb247XG4gICAgfVxuXG4gICAgdmFyIG1lc3NhZ2UgPSB1cmwgKyAnIEhUVFAgc3RhdHVzOiAnICsgc3RhdHVzO1xuXG4gICAgaWYgKF9fREVWX18gJiYgcmVzcG9uc2VUZXh0KSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgc2VydmVyRXJyb3JzID0gW107XG4gICAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KTtcblxuICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3JzICYmIHJlc3BvbnNlLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmVzcG9uc2UuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHNlcnZlckVycm9ycy5wdXNoKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBtZXNzYWdlICs9ICcgJyArIHNlcnZlckVycm9ycy5qb2luKCcsJyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fbG9nZ2luZ1NlcnZpY2UuZGVidWcoJ0Vycm9yIHBhcnNpbmcgcmVzcG9uc2UgZnJvbSBBUE0gc2VydmVyJywgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfTtcblxuICBfcHJvdG8uX21ha2VIdHRwUmVxdWVzdCA9IGZ1bmN0aW9uIF9tYWtlSHR0cFJlcXVlc3QobWV0aG9kLCB1cmwsIF90ZW1wKSB7XG4gICAgdmFyIF9yZWYyID0gX3RlbXAgPT09IHZvaWQgMCA/IHt9IDogX3RlbXAsXG4gICAgICAgIF9yZWYyJHRpbWVvdXQgPSBfcmVmMi50aW1lb3V0LFxuICAgICAgICB0aW1lb3V0ID0gX3JlZjIkdGltZW91dCA9PT0gdm9pZCAwID8gSFRUUF9SRVFVRVNUX1RJTUVPVVQgOiBfcmVmMiR0aW1lb3V0LFxuICAgICAgICBwYXlsb2FkID0gX3JlZjIucGF5bG9hZCxcbiAgICAgICAgaGVhZGVycyA9IF9yZWYyLmhlYWRlcnMsXG4gICAgICAgIGJlZm9yZVNlbmQgPSBfcmVmMi5iZWZvcmVTZW5kO1xuXG4gICAgaWYgKCFiZWZvcmVTZW5kICYmIHNob3VsZFVzZUZldGNoV2l0aEtlZXBBbGl2ZShtZXRob2QsIHBheWxvYWQpKSB7XG4gICAgICByZXR1cm4gc2VuZEZldGNoUmVxdWVzdChtZXRob2QsIHVybCwge1xuICAgICAgICBrZWVwYWxpdmU6IHRydWUsXG4gICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXG4gICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlYXNvbiBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgICAgICAgIHJldHVybiBzZW5kWEhSKG1ldGhvZCwgdXJsLCB7XG4gICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBiZWZvcmVTZW5kXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VuZFhIUihtZXRob2QsIHVybCwge1xuICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgYmVmb3JlU2VuZDogYmVmb3JlU2VuZFxuICAgIH0pO1xuICB9O1xuXG4gIF9wcm90by5mZXRjaENvbmZpZyA9IGZ1bmN0aW9uIGZldGNoQ29uZmlnKHNlcnZpY2VOYW1lLCBlbnZpcm9ubWVudCkge1xuICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgdmFyIF90aGlzJGdldEVuZHBvaW50cyA9IHRoaXMuZ2V0RW5kcG9pbnRzKCksXG4gICAgICAgIGNvbmZpZ0VuZHBvaW50ID0gX3RoaXMkZ2V0RW5kcG9pbnRzLmNvbmZpZ0VuZHBvaW50O1xuXG4gICAgaWYgKCFzZXJ2aWNlTmFtZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdzZXJ2aWNlTmFtZSBpcyByZXF1aXJlZCBmb3IgZmV0Y2hpbmcgY2VudHJhbCBjb25maWcuJyk7XG4gICAgfVxuXG4gICAgY29uZmlnRW5kcG9pbnQgKz0gXCI/c2VydmljZS5uYW1lPVwiICsgc2VydmljZU5hbWU7XG5cbiAgICBpZiAoZW52aXJvbm1lbnQpIHtcbiAgICAgIGNvbmZpZ0VuZHBvaW50ICs9IFwiJnNlcnZpY2UuZW52aXJvbm1lbnQ9XCIgKyBlbnZpcm9ubWVudDtcbiAgICB9XG5cbiAgICB2YXIgbG9jYWxDb25maWcgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldExvY2FsQ29uZmlnKCk7XG5cbiAgICBpZiAobG9jYWxDb25maWcpIHtcbiAgICAgIGNvbmZpZ0VuZHBvaW50ICs9IFwiJmlmbm9uZW1hdGNoPVwiICsgbG9jYWxDb25maWcuZXRhZztcbiAgICB9XG5cbiAgICB2YXIgYXBtUmVxdWVzdCA9IHRoaXMuX2NvbmZpZ1NlcnZpY2UuZ2V0KCdhcG1SZXF1ZXN0Jyk7XG5cbiAgICByZXR1cm4gdGhpcy5fbWFrZUh0dHBSZXF1ZXN0KCdHRVQnLCBjb25maWdFbmRwb2ludCwge1xuICAgICAgdGltZW91dDogNTAwMCxcbiAgICAgIGJlZm9yZVNlbmQ6IGFwbVJlcXVlc3RcbiAgICB9KS50aGVuKGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzLFxuICAgICAgICAgIHJlc3BvbnNlVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XG5cbiAgICAgIGlmIChzdGF0dXMgPT09IDMwNCkge1xuICAgICAgICByZXR1cm4gbG9jYWxDb25maWc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVtb3RlQ29uZmlnID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQpO1xuICAgICAgICB2YXIgZXRhZyA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignZXRhZycpO1xuXG4gICAgICAgIGlmIChldGFnKSB7XG4gICAgICAgICAgcmVtb3RlQ29uZmlnLmV0YWcgPSBldGFnLnJlcGxhY2UoL1tcIl0vZywgJycpO1xuXG4gICAgICAgICAgX3RoaXMzLl9jb25maWdTZXJ2aWNlLnNldExvY2FsQ29uZmlnKHJlbW90ZUNvbmZpZywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVtb3RlQ29uZmlnO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIHZhciBlcnJvciA9IF90aGlzMy5fY29uc3RydWN0RXJyb3IocmVhc29uKTtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uY3JlYXRlTWV0YURhdGEgPSBmdW5jdGlvbiBjcmVhdGVNZXRhRGF0YSgpIHtcbiAgICB2YXIgY2ZnID0gdGhpcy5fY29uZmlnU2VydmljZTtcbiAgICB2YXIgbWV0YWRhdGEgPSB7XG4gICAgICBzZXJ2aWNlOiB7XG4gICAgICAgIG5hbWU6IGNmZy5nZXQoJ3NlcnZpY2VOYW1lJyksXG4gICAgICAgIHZlcnNpb246IGNmZy5nZXQoJ3NlcnZpY2VWZXJzaW9uJyksXG4gICAgICAgIGFnZW50OiB7XG4gICAgICAgICAgbmFtZTogJ3J1bS1qcycsXG4gICAgICAgICAgdmVyc2lvbjogY2ZnLnZlcnNpb25cbiAgICAgICAgfSxcbiAgICAgICAgbGFuZ3VhZ2U6IHtcbiAgICAgICAgICBuYW1lOiAnamF2YXNjcmlwdCdcbiAgICAgICAgfSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IGNmZy5nZXQoJ2Vudmlyb25tZW50JylcbiAgICAgIH0sXG4gICAgICBsYWJlbHM6IGNmZy5nZXQoJ2NvbnRleHQudGFncycpXG4gICAgfTtcbiAgICByZXR1cm4gdHJ1bmNhdGVNb2RlbChNRVRBREFUQV9NT0RFTCwgbWV0YWRhdGEpO1xuICB9O1xuXG4gIF9wcm90by5hZGRFcnJvciA9IGZ1bmN0aW9uIGFkZEVycm9yKGVycm9yKSB7XG4gICAgdmFyIF90aGlzJHRocm90dGxlRXZlbnRzO1xuXG4gICAgdGhpcy50aHJvdHRsZUV2ZW50cygoX3RoaXMkdGhyb3R0bGVFdmVudHMgPSB7fSwgX3RoaXMkdGhyb3R0bGVFdmVudHNbRVJST1JTXSA9IGVycm9yLCBfdGhpcyR0aHJvdHRsZUV2ZW50cykpO1xuICB9O1xuXG4gIF9wcm90by5hZGRUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIGFkZFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKSB7XG4gICAgdmFyIF90aGlzJHRocm90dGxlRXZlbnRzMjtcblxuICAgIHRoaXMudGhyb3R0bGVFdmVudHMoKF90aGlzJHRocm90dGxlRXZlbnRzMiA9IHt9LCBfdGhpcyR0aHJvdHRsZUV2ZW50czJbVFJBTlNBQ1RJT05TXSA9IHRyYW5zYWN0aW9uLCBfdGhpcyR0aHJvdHRsZUV2ZW50czIpKTtcbiAgfTtcblxuICBfcHJvdG8ubmRqc29uRXJyb3JzID0gZnVuY3Rpb24gbmRqc29uRXJyb3JzKGVycm9ycywgY29tcHJlc3MpIHtcbiAgICB2YXIga2V5ID0gY29tcHJlc3MgPyAnZScgOiAnZXJyb3InO1xuICAgIHJldHVybiBlcnJvcnMubWFwKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdmFyIF9OREpTT04kc3RyaW5naWZ5O1xuXG4gICAgICByZXR1cm4gTkRKU09OLnN0cmluZ2lmeSgoX05ESlNPTiRzdHJpbmdpZnkgPSB7fSwgX05ESlNPTiRzdHJpbmdpZnlba2V5XSA9IGNvbXByZXNzID8gY29tcHJlc3NFcnJvcihlcnJvcikgOiBlcnJvciwgX05ESlNPTiRzdHJpbmdpZnkpKTtcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8ubmRqc29uTWV0cmljc2V0cyA9IGZ1bmN0aW9uIG5kanNvbk1ldHJpY3NldHMobWV0cmljc2V0cykge1xuICAgIHJldHVybiBtZXRyaWNzZXRzLm1hcChmdW5jdGlvbiAobWV0cmljc2V0KSB7XG4gICAgICByZXR1cm4gTkRKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1ldHJpY3NldDogbWV0cmljc2V0XG4gICAgICB9KTtcbiAgICB9KS5qb2luKCcnKTtcbiAgfTtcblxuICBfcHJvdG8ubmRqc29uVHJhbnNhY3Rpb25zID0gZnVuY3Rpb24gbmRqc29uVHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9ucywgY29tcHJlc3MpIHtcbiAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgIHZhciBrZXkgPSBjb21wcmVzcyA/ICd4JyA6ICd0cmFuc2FjdGlvbic7XG4gICAgcmV0dXJuIHRyYW5zYWN0aW9ucy5tYXAoZnVuY3Rpb24gKHRyKSB7XG4gICAgICB2YXIgX05ESlNPTiRzdHJpbmdpZnkyO1xuXG4gICAgICB2YXIgc3BhbnMgPSAnJyxcbiAgICAgICAgICBicmVha2Rvd25zID0gJyc7XG5cbiAgICAgIGlmICghY29tcHJlc3MpIHtcbiAgICAgICAgaWYgKHRyLnNwYW5zKSB7XG4gICAgICAgICAgc3BhbnMgPSB0ci5zcGFucy5tYXAoZnVuY3Rpb24gKHNwYW4pIHtcbiAgICAgICAgICAgIHJldHVybiBOREpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3Bhbjogc3BhblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkuam9pbignJyk7XG4gICAgICAgICAgZGVsZXRlIHRyLnNwYW5zO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyLmJyZWFrZG93bikge1xuICAgICAgICAgIGJyZWFrZG93bnMgPSBfdGhpczQubmRqc29uTWV0cmljc2V0cyh0ci5icmVha2Rvd24pO1xuICAgICAgICAgIGRlbGV0ZSB0ci5icmVha2Rvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE5ESlNPTi5zdHJpbmdpZnkoKF9OREpTT04kc3RyaW5naWZ5MiA9IHt9LCBfTkRKU09OJHN0cmluZ2lmeTJba2V5XSA9IGNvbXByZXNzID8gY29tcHJlc3NUcmFuc2FjdGlvbih0cikgOiB0ciwgX05ESlNPTiRzdHJpbmdpZnkyKSkgKyBzcGFucyArIGJyZWFrZG93bnM7XG4gICAgfSk7XG4gIH07XG5cbiAgX3Byb3RvLnNlbmRFdmVudHMgPSBmdW5jdGlvbiBzZW5kRXZlbnRzKGV2ZW50cykge1xuICAgIHZhciBfcGF5bG9hZCwgX05ESlNPTiRzdHJpbmdpZnkzO1xuXG4gICAgaWYgKGV2ZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNhY3Rpb25zID0gW107XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgICAgaWYgKGV2ZW50W1RSQU5TQUNUSU9OU10pIHtcbiAgICAgICAgdHJhbnNhY3Rpb25zLnB1c2goZXZlbnRbVFJBTlNBQ1RJT05TXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudFtFUlJPUlNdKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKGV2ZW50W0VSUk9SU10pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0cmFuc2FjdGlvbnMubGVuZ3RoID09PSAwICYmIGVycm9ycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgY2ZnID0gdGhpcy5fY29uZmlnU2VydmljZTtcbiAgICB2YXIgcGF5bG9hZCA9IChfcGF5bG9hZCA9IHt9LCBfcGF5bG9hZFtUUkFOU0FDVElPTlNdID0gdHJhbnNhY3Rpb25zLCBfcGF5bG9hZFtFUlJPUlNdID0gZXJyb3JzLCBfcGF5bG9hZCk7XG4gICAgdmFyIGZpbHRlcmVkUGF5bG9hZCA9IGNmZy5hcHBseUZpbHRlcnMocGF5bG9hZCk7XG5cbiAgICBpZiAoIWZpbHRlcmVkUGF5bG9hZCkge1xuICAgICAgdGhpcy5fbG9nZ2luZ1NlcnZpY2Uud2FybignRHJvcHBlZCBwYXlsb2FkIGR1ZSB0byBmaWx0ZXJpbmchJyk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYXBpVmVyc2lvbiA9IGNmZy5nZXQoJ2FwaVZlcnNpb24nKTtcbiAgICB2YXIgY29tcHJlc3MgPSBhcGlWZXJzaW9uID4gMjtcbiAgICB2YXIgbmRqc29uID0gW107XG4gICAgdmFyIG1ldGFkYXRhID0gdGhpcy5jcmVhdGVNZXRhRGF0YSgpO1xuICAgIHZhciBtZXRhZGF0YUtleSA9IGNvbXByZXNzID8gJ20nIDogJ21ldGFkYXRhJztcbiAgICBuZGpzb24ucHVzaChOREpTT04uc3RyaW5naWZ5KChfTkRKU09OJHN0cmluZ2lmeTMgPSB7fSwgX05ESlNPTiRzdHJpbmdpZnkzW21ldGFkYXRhS2V5XSA9IGNvbXByZXNzID8gY29tcHJlc3NNZXRhZGF0YShtZXRhZGF0YSkgOiBtZXRhZGF0YSwgX05ESlNPTiRzdHJpbmdpZnkzKSkpO1xuICAgIG5kanNvbiA9IG5kanNvbi5jb25jYXQodGhpcy5uZGpzb25FcnJvcnMoZmlsdGVyZWRQYXlsb2FkW0VSUk9SU10sIGNvbXByZXNzKSwgdGhpcy5uZGpzb25UcmFuc2FjdGlvbnMoZmlsdGVyZWRQYXlsb2FkW1RSQU5TQUNUSU9OU10sIGNvbXByZXNzKSk7XG4gICAgdmFyIG5kanNvblBheWxvYWQgPSBuZGpzb24uam9pbignJyk7XG5cbiAgICB2YXIgX3RoaXMkZ2V0RW5kcG9pbnRzMiA9IHRoaXMuZ2V0RW5kcG9pbnRzKCksXG4gICAgICAgIGludGFrZUVuZHBvaW50ID0gX3RoaXMkZ2V0RW5kcG9pbnRzMi5pbnRha2VFbmRwb2ludDtcblxuICAgIHJldHVybiB0aGlzLl9wb3N0SnNvbihpbnRha2VFbmRwb2ludCwgbmRqc29uUGF5bG9hZCk7XG4gIH07XG5cbiAgX3Byb3RvLmdldEVuZHBvaW50cyA9IGZ1bmN0aW9uIGdldEVuZHBvaW50cygpIHtcbiAgICB2YXIgc2VydmVyVXJsID0gdGhpcy5fY29uZmlnU2VydmljZS5nZXQoJ3NlcnZlclVybCcpO1xuXG4gICAgdmFyIGFwaVZlcnNpb24gPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnYXBpVmVyc2lvbicpO1xuXG4gICAgdmFyIHNlcnZlclVybFByZWZpeCA9IHRoaXMuX2NvbmZpZ1NlcnZpY2UuZ2V0KCdzZXJ2ZXJVcmxQcmVmaXgnKSB8fCBcIi9pbnRha2UvdlwiICsgYXBpVmVyc2lvbiArIFwiL3J1bS9ldmVudHNcIjtcbiAgICB2YXIgaW50YWtlRW5kcG9pbnQgPSBzZXJ2ZXJVcmwgKyBzZXJ2ZXJVcmxQcmVmaXg7XG4gICAgdmFyIGNvbmZpZ0VuZHBvaW50ID0gc2VydmVyVXJsICsgXCIvY29uZmlnL3YxL3J1bS9hZ2VudHNcIjtcbiAgICByZXR1cm4ge1xuICAgICAgaW50YWtlRW5kcG9pbnQ6IGludGFrZUVuZHBvaW50LFxuICAgICAgY29uZmlnRW5kcG9pbnQ6IGNvbmZpZ0VuZHBvaW50XG4gICAgfTtcbiAgfTtcblxuICByZXR1cm4gQXBtU2VydmVyO1xufSgpO1xuXG5leHBvcnQgZGVmYXVsdCBBcG1TZXJ2ZXI7IiwiaW1wb3J0IHsgUHJvbWlzZSB9IGZyb20gJy4vcG9seWZpbGxzJztcbmltcG9ydCB7IE5BVklHQVRJT05fVElNSU5HX01BUktTLCBDT01QUkVTU0VEX05BVl9USU1JTkdfTUFSS1MgfSBmcm9tICcuLi9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL2NhcHR1cmUtbmF2aWdhdGlvbic7XG5cbmZ1bmN0aW9uIGNvbXByZXNzU3RhY2tGcmFtZXMoZnJhbWVzKSB7XG4gIHJldHVybiBmcmFtZXMubWFwKGZ1bmN0aW9uIChmcmFtZSkge1xuICAgIHJldHVybiB7XG4gICAgICBhcDogZnJhbWUuYWJzX3BhdGgsXG4gICAgICBmOiBmcmFtZS5maWxlbmFtZSxcbiAgICAgIGZuOiBmcmFtZS5mdW5jdGlvbixcbiAgICAgIGxpOiBmcmFtZS5saW5lbm8sXG4gICAgICBjbzogZnJhbWUuY29sbm9cbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY29tcHJlc3NSZXNwb25zZShyZXNwb25zZSkge1xuICByZXR1cm4ge1xuICAgIHRzOiByZXNwb25zZS50cmFuc2Zlcl9zaXplLFxuICAgIGViczogcmVzcG9uc2UuZW5jb2RlZF9ib2R5X3NpemUsXG4gICAgZGJzOiByZXNwb25zZS5kZWNvZGVkX2JvZHlfc2l6ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBjb21wcmVzc0hUVFAoaHR0cCkge1xuICB2YXIgY29tcHJlc3NlZCA9IHt9O1xuICB2YXIgbWV0aG9kID0gaHR0cC5tZXRob2QsXG4gICAgICBzdGF0dXNfY29kZSA9IGh0dHAuc3RhdHVzX2NvZGUsXG4gICAgICB1cmwgPSBodHRwLnVybCxcbiAgICAgIHJlc3BvbnNlID0gaHR0cC5yZXNwb25zZTtcbiAgY29tcHJlc3NlZC51cmwgPSB1cmw7XG5cbiAgaWYgKG1ldGhvZCkge1xuICAgIGNvbXByZXNzZWQubXQgPSBtZXRob2Q7XG4gIH1cblxuICBpZiAoc3RhdHVzX2NvZGUpIHtcbiAgICBjb21wcmVzc2VkLnNjID0gc3RhdHVzX2NvZGU7XG4gIH1cblxuICBpZiAocmVzcG9uc2UpIHtcbiAgICBjb21wcmVzc2VkLnIgPSBjb21wcmVzc1Jlc3BvbnNlKHJlc3BvbnNlKTtcbiAgfVxuXG4gIHJldHVybiBjb21wcmVzc2VkO1xufVxuXG5mdW5jdGlvbiBjb21wcmVzc0NvbnRleHQoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBjb21wcmVzc2VkID0ge307XG4gIHZhciBwYWdlID0gY29udGV4dC5wYWdlLFxuICAgICAgaHR0cCA9IGNvbnRleHQuaHR0cCxcbiAgICAgIHJlc3BvbnNlID0gY29udGV4dC5yZXNwb25zZSxcbiAgICAgIGRlc3RpbmF0aW9uID0gY29udGV4dC5kZXN0aW5hdGlvbixcbiAgICAgIHVzZXIgPSBjb250ZXh0LnVzZXIsXG4gICAgICBjdXN0b20gPSBjb250ZXh0LmN1c3RvbTtcblxuICBpZiAocGFnZSkge1xuICAgIGNvbXByZXNzZWQucCA9IHtcbiAgICAgIHJmOiBwYWdlLnJlZmVyZXIsXG4gICAgICB1cmw6IHBhZ2UudXJsXG4gICAgfTtcbiAgfVxuXG4gIGlmIChodHRwKSB7XG4gICAgY29tcHJlc3NlZC5oID0gY29tcHJlc3NIVFRQKGh0dHApO1xuICB9XG5cbiAgaWYgKHJlc3BvbnNlKSB7XG4gICAgY29tcHJlc3NlZC5yID0gY29tcHJlc3NSZXNwb25zZShyZXNwb25zZSk7XG4gIH1cblxuICBpZiAoZGVzdGluYXRpb24pIHtcbiAgICB2YXIgc2VydmljZSA9IGRlc3RpbmF0aW9uLnNlcnZpY2U7XG4gICAgY29tcHJlc3NlZC5kdCA9IHtcbiAgICAgIHNlOiB7XG4gICAgICAgIG46IHNlcnZpY2UubmFtZSxcbiAgICAgICAgdDogc2VydmljZS50eXBlLFxuICAgICAgICByYzogc2VydmljZS5yZXNvdXJjZVxuICAgICAgfSxcbiAgICAgIGFkOiBkZXN0aW5hdGlvbi5hZGRyZXNzLFxuICAgICAgcG86IGRlc3RpbmF0aW9uLnBvcnRcbiAgICB9O1xuICB9XG5cbiAgaWYgKHVzZXIpIHtcbiAgICBjb21wcmVzc2VkLnUgPSB7XG4gICAgICBpZDogdXNlci5pZCxcbiAgICAgIHVuOiB1c2VyLnVzZXJuYW1lLFxuICAgICAgZW06IHVzZXIuZW1haWxcbiAgICB9O1xuICB9XG5cbiAgaWYgKGN1c3RvbSkge1xuICAgIGNvbXByZXNzZWQuY3UgPSBjdXN0b207XG4gIH1cblxuICByZXR1cm4gY29tcHJlc3NlZDtcbn1cblxuZnVuY3Rpb24gY29tcHJlc3NNYXJrcyhtYXJrcykge1xuICBpZiAoIW1hcmtzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgY29tcHJlc3NlZE50TWFya3MgPSBjb21wcmVzc05hdmlnYXRpb25UaW1pbmdNYXJrcyhtYXJrcy5uYXZpZ2F0aW9uVGltaW5nKTtcbiAgdmFyIGNvbXByZXNzZWQgPSB7XG4gICAgbnQ6IGNvbXByZXNzZWROdE1hcmtzLFxuICAgIGE6IGNvbXByZXNzQWdlbnRNYXJrcyhjb21wcmVzc2VkTnRNYXJrcywgbWFya3MuYWdlbnQpXG4gIH07XG4gIHJldHVybiBjb21wcmVzc2VkO1xufVxuXG5mdW5jdGlvbiBjb21wcmVzc05hdmlnYXRpb25UaW1pbmdNYXJrcyhudE1hcmtzKSB7XG4gIGlmICghbnRNYXJrcykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGNvbXByZXNzZWQgPSB7fTtcbiAgQ09NUFJFU1NFRF9OQVZfVElNSU5HX01BUktTLmZvckVhY2goZnVuY3Rpb24gKG1hcmssIGluZGV4KSB7XG4gICAgdmFyIG1hcHBpbmcgPSBOQVZJR0FUSU9OX1RJTUlOR19NQVJLU1tpbmRleF07XG4gICAgY29tcHJlc3NlZFttYXJrXSA9IG50TWFya3NbbWFwcGluZ107XG4gIH0pO1xuICByZXR1cm4gY29tcHJlc3NlZDtcbn1cblxuZnVuY3Rpb24gY29tcHJlc3NBZ2VudE1hcmtzKGNvbXByZXNzZWROdE1hcmtzLCBhZ2VudE1hcmtzKSB7XG4gIHZhciBjb21wcmVzc2VkID0ge307XG5cbiAgaWYgKGNvbXByZXNzZWROdE1hcmtzKSB7XG4gICAgY29tcHJlc3NlZCA9IHtcbiAgICAgIGZiOiBjb21wcmVzc2VkTnRNYXJrcy5ycyxcbiAgICAgIGRpOiBjb21wcmVzc2VkTnRNYXJrcy5kaSxcbiAgICAgIGRjOiBjb21wcmVzc2VkTnRNYXJrcy5kY1xuICAgIH07XG4gIH1cblxuICBpZiAoYWdlbnRNYXJrcykge1xuICAgIHZhciBmcCA9IGFnZW50TWFya3MuZmlyc3RDb250ZW50ZnVsUGFpbnQ7XG4gICAgdmFyIGxwID0gYWdlbnRNYXJrcy5sYXJnZXN0Q29udGVudGZ1bFBhaW50O1xuXG4gICAgaWYgKGZwKSB7XG4gICAgICBjb21wcmVzc2VkLmZwID0gZnA7XG4gICAgfVxuXG4gICAgaWYgKGxwKSB7XG4gICAgICBjb21wcmVzc2VkLmxwID0gbHA7XG4gICAgfVxuICB9XG5cbiAgaWYgKE9iamVjdC5rZXlzKGNvbXByZXNzZWQpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGNvbXByZXNzZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzc01ldGFkYXRhKG1ldGFkYXRhKSB7XG4gIHZhciBzZXJ2aWNlID0gbWV0YWRhdGEuc2VydmljZSxcbiAgICAgIGxhYmVscyA9IG1ldGFkYXRhLmxhYmVscztcbiAgdmFyIGFnZW50ID0gc2VydmljZS5hZ2VudCxcbiAgICAgIGxhbmd1YWdlID0gc2VydmljZS5sYW5ndWFnZTtcbiAgcmV0dXJuIHtcbiAgICBzZToge1xuICAgICAgbjogc2VydmljZS5uYW1lLFxuICAgICAgdmU6IHNlcnZpY2UudmVyc2lvbixcbiAgICAgIGE6IHtcbiAgICAgICAgbjogYWdlbnQubmFtZSxcbiAgICAgICAgdmU6IGFnZW50LnZlcnNpb25cbiAgICAgIH0sXG4gICAgICBsYToge1xuICAgICAgICBuOiBsYW5ndWFnZS5uYW1lXG4gICAgICB9LFxuICAgICAgZW46IHNlcnZpY2UuZW52aXJvbm1lbnRcbiAgICB9LFxuICAgIGw6IGxhYmVsc1xuICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXByZXNzVHJhbnNhY3Rpb24odHJhbnNhY3Rpb24pIHtcbiAgdmFyIHNwYW5zID0gdHJhbnNhY3Rpb24uc3BhbnMubWFwKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgdmFyIHNwYW5EYXRhID0ge1xuICAgICAgaWQ6IHNwYW4uaWQsXG4gICAgICBuOiBzcGFuLm5hbWUsXG4gICAgICB0OiBzcGFuLnR5cGUsXG4gICAgICBzOiBzcGFuLnN0YXJ0LFxuICAgICAgZDogc3Bhbi5kdXJhdGlvbixcbiAgICAgIGM6IGNvbXByZXNzQ29udGV4dChzcGFuLmNvbnRleHQpLFxuICAgICAgbzogc3Bhbi5vdXRjb21lLFxuICAgICAgc3I6IHNwYW4uc2FtcGxlX3JhdGVcbiAgICB9O1xuXG4gICAgaWYgKHNwYW4ucGFyZW50X2lkICE9PSB0cmFuc2FjdGlvbi5pZCkge1xuICAgICAgc3BhbkRhdGEucGlkID0gc3Bhbi5wYXJlbnRfaWQ7XG4gICAgfVxuXG4gICAgaWYgKHNwYW4uc3luYyA9PT0gdHJ1ZSkge1xuICAgICAgc3BhbkRhdGEuc3kgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChzcGFuLnN1YnR5cGUpIHtcbiAgICAgIHNwYW5EYXRhLnN1ID0gc3Bhbi5zdWJ0eXBlO1xuICAgIH1cblxuICAgIGlmIChzcGFuLmFjdGlvbikge1xuICAgICAgc3BhbkRhdGEuYWMgPSBzcGFuLmFjdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gc3BhbkRhdGE7XG4gIH0pO1xuICB2YXIgdHIgPSB7XG4gICAgaWQ6IHRyYW5zYWN0aW9uLmlkLFxuICAgIHRpZDogdHJhbnNhY3Rpb24udHJhY2VfaWQsXG4gICAgbjogdHJhbnNhY3Rpb24ubmFtZSxcbiAgICB0OiB0cmFuc2FjdGlvbi50eXBlLFxuICAgIGQ6IHRyYW5zYWN0aW9uLmR1cmF0aW9uLFxuICAgIGM6IGNvbXByZXNzQ29udGV4dCh0cmFuc2FjdGlvbi5jb250ZXh0KSxcbiAgICBrOiBjb21wcmVzc01hcmtzKHRyYW5zYWN0aW9uLm1hcmtzKSxcbiAgICBtZTogY29tcHJlc3NNZXRyaWNzZXRzKHRyYW5zYWN0aW9uLmJyZWFrZG93biksXG4gICAgeTogc3BhbnMsXG4gICAgeWM6IHtcbiAgICAgIHNkOiBzcGFucy5sZW5ndGhcbiAgICB9LFxuICAgIHNtOiB0cmFuc2FjdGlvbi5zYW1wbGVkLFxuICAgIHNyOiB0cmFuc2FjdGlvbi5zYW1wbGVfcmF0ZSxcbiAgICBvOiB0cmFuc2FjdGlvbi5vdXRjb21lXG4gIH07XG5cbiAgaWYgKHRyYW5zYWN0aW9uLmV4cGVyaWVuY2UpIHtcbiAgICB2YXIgX3RyYW5zYWN0aW9uJGV4cGVyaWVuID0gdHJhbnNhY3Rpb24uZXhwZXJpZW5jZSxcbiAgICAgICAgY2xzID0gX3RyYW5zYWN0aW9uJGV4cGVyaWVuLmNscyxcbiAgICAgICAgZmlkID0gX3RyYW5zYWN0aW9uJGV4cGVyaWVuLmZpZCxcbiAgICAgICAgdGJ0ID0gX3RyYW5zYWN0aW9uJGV4cGVyaWVuLnRidCxcbiAgICAgICAgbG9uZ3Rhc2sgPSBfdHJhbnNhY3Rpb24kZXhwZXJpZW4ubG9uZ3Rhc2s7XG4gICAgdHIuZXhwID0ge1xuICAgICAgY2xzOiBjbHMsXG4gICAgICBmaWQ6IGZpZCxcbiAgICAgIHRidDogdGJ0LFxuICAgICAgbHQ6IGxvbmd0YXNrXG4gICAgfTtcbiAgfVxuXG4gIGlmICh0cmFuc2FjdGlvbi5zZXNzaW9uKSB7XG4gICAgdmFyIF90cmFuc2FjdGlvbiRzZXNzaW9uID0gdHJhbnNhY3Rpb24uc2Vzc2lvbixcbiAgICAgICAgaWQgPSBfdHJhbnNhY3Rpb24kc2Vzc2lvbi5pZCxcbiAgICAgICAgc2VxdWVuY2UgPSBfdHJhbnNhY3Rpb24kc2Vzc2lvbi5zZXF1ZW5jZTtcbiAgICB0ci5zZXMgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBzZXE6IHNlcXVlbmNlXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB0cjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb21wcmVzc0Vycm9yKGVycm9yKSB7XG4gIHZhciBleGNlcHRpb24gPSBlcnJvci5leGNlcHRpb247XG4gIHZhciBjb21wcmVzc2VkID0ge1xuICAgIGlkOiBlcnJvci5pZCxcbiAgICBjbDogZXJyb3IuY3VscHJpdCxcbiAgICBleDoge1xuICAgICAgbWc6IGV4Y2VwdGlvbi5tZXNzYWdlLFxuICAgICAgc3Q6IGNvbXByZXNzU3RhY2tGcmFtZXMoZXhjZXB0aW9uLnN0YWNrdHJhY2UpLFxuICAgICAgdDogZXJyb3IudHlwZVxuICAgIH0sXG4gICAgYzogY29tcHJlc3NDb250ZXh0KGVycm9yLmNvbnRleHQpXG4gIH07XG4gIHZhciB0cmFuc2FjdGlvbiA9IGVycm9yLnRyYW5zYWN0aW9uO1xuXG4gIGlmICh0cmFuc2FjdGlvbikge1xuICAgIGNvbXByZXNzZWQudGlkID0gZXJyb3IudHJhY2VfaWQ7XG4gICAgY29tcHJlc3NlZC5waWQgPSBlcnJvci5wYXJlbnRfaWQ7XG4gICAgY29tcHJlc3NlZC54aWQgPSBlcnJvci50cmFuc2FjdGlvbl9pZDtcbiAgICBjb21wcmVzc2VkLnggPSB7XG4gICAgICB0OiB0cmFuc2FjdGlvbi50eXBlLFxuICAgICAgc206IHRyYW5zYWN0aW9uLnNhbXBsZWRcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNvbXByZXNzZWQ7XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcHJlc3NNZXRyaWNzZXRzKGJyZWFrZG93bnMpIHtcbiAgcmV0dXJuIGJyZWFrZG93bnMubWFwKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIHNwYW4gPSBfcmVmLnNwYW4sXG4gICAgICAgIHNhbXBsZXMgPSBfcmVmLnNhbXBsZXM7XG4gICAgdmFyIGlzU3BhbiA9IHNwYW4gIT0gbnVsbDtcblxuICAgIGlmIChpc1NwYW4pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHk6IHtcbiAgICAgICAgICB0OiBzcGFuLnR5cGVcbiAgICAgICAgfSxcbiAgICAgICAgc2E6IHtcbiAgICAgICAgICB5c2M6IHtcbiAgICAgICAgICAgIHY6IHNhbXBsZXNbJ3NwYW4uc2VsZl90aW1lLmNvdW50J10udmFsdWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHlzczoge1xuICAgICAgICAgICAgdjogc2FtcGxlc1snc3Bhbi5zZWxmX3RpbWUuc3VtLnVzJ10udmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNhOiB7XG4gICAgICAgIHhkYzoge1xuICAgICAgICAgIHY6IHNhbXBsZXNbJ3RyYW5zYWN0aW9uLmR1cmF0aW9uLmNvdW50J10udmFsdWVcbiAgICAgICAgfSxcbiAgICAgICAgeGRzOiB7XG4gICAgICAgICAgdjogc2FtcGxlc1sndHJhbnNhY3Rpb24uZHVyYXRpb24uc3VtLnVzJ10udmFsdWVcbiAgICAgICAgfSxcbiAgICAgICAgeGJjOiB7XG4gICAgICAgICAgdjogc2FtcGxlc1sndHJhbnNhY3Rpb24uYnJlYWtkb3duLmNvdW50J10udmFsdWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXByZXNzUGF5bG9hZChwYXJhbXMsIHR5cGUpIHtcbiAgaWYgKHR5cGUgPT09IHZvaWQgMCkge1xuICAgIHR5cGUgPSAnZ3ppcCc7XG4gIH1cblxuICB2YXIgaXNDb21wcmVzc2lvblN0cmVhbVN1cHBvcnRlZCA9IHR5cGVvZiBDb21wcmVzc2lvblN0cmVhbSA9PT0gJ2Z1bmN0aW9uJztcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgaWYgKCFpc0NvbXByZXNzaW9uU3RyZWFtU3VwcG9ydGVkKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShwYXJhbXMpO1xuICAgIH1cblxuICAgIHZhciBwYXlsb2FkID0gcGFyYW1zLnBheWxvYWQsXG4gICAgICAgIGhlYWRlcnMgPSBwYXJhbXMuaGVhZGVycyxcbiAgICAgICAgYmVmb3JlU2VuZCA9IHBhcmFtcy5iZWZvcmVTZW5kO1xuICAgIHZhciBwYXlsb2FkU3RyZWFtID0gbmV3IEJsb2IoW3BheWxvYWRdKS5zdHJlYW0oKTtcbiAgICB2YXIgY29tcHJlc3NlZFN0cmVhbSA9IHBheWxvYWRTdHJlYW0ucGlwZVRocm91Z2gobmV3IENvbXByZXNzaW9uU3RyZWFtKHR5cGUpKTtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGNvbXByZXNzZWRTdHJlYW0pLmJsb2IoKS50aGVuKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICBoZWFkZXJzWydDb250ZW50LUVuY29kaW5nJ10gPSB0eXBlO1xuICAgICAgcmV0dXJuIHJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICBiZWZvcmVTZW5kOiBiZWZvcmVTZW5kXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59IiwiZnVuY3Rpb24gX2V4dGVuZHMoKSB7IF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTsgcmV0dXJuIF9leHRlbmRzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cblxuaW1wb3J0IHsgZ2V0Q3VycmVudFNjcmlwdCwgc2V0TGFiZWwsIG1lcmdlLCBleHRlbmQsIGlzVW5kZWZpbmVkIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZXZlbnQtaGFuZGxlcic7XG5pbXBvcnQgeyBDT05GSUdfQ0hBTkdFLCBMT0NBTF9DT05GSUdfS0VZIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5mdW5jdGlvbiBnZXRDb25maWdGcm9tU2NyaXB0KCkge1xuICB2YXIgc2NyaXB0ID0gZ2V0Q3VycmVudFNjcmlwdCgpO1xuICB2YXIgY29uZmlnID0gZ2V0RGF0YUF0dHJpYnV0ZXNGcm9tTm9kZShzY3JpcHQpO1xuICByZXR1cm4gY29uZmlnO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhQXR0cmlidXRlc0Zyb21Ob2RlKG5vZGUpIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgdmFyIGRhdGFBdHRycyA9IHt9O1xuICB2YXIgZGF0YVJlZ2V4ID0gL15kYXRhLShbXFx3LV0rKSQvO1xuICB2YXIgYXR0cnMgPSBub2RlLmF0dHJpYnV0ZXM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBhdHRyID0gYXR0cnNbaV07XG5cbiAgICBpZiAoZGF0YVJlZ2V4LnRlc3QoYXR0ci5ub2RlTmFtZSkpIHtcbiAgICAgIHZhciBrZXkgPSBhdHRyLm5vZGVOYW1lLm1hdGNoKGRhdGFSZWdleClbMV07XG4gICAgICB2YXIgY2FtZWxDYXNlZGtleSA9IGtleS5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBpbmRleCA+IDAgPyB2YWx1ZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHZhbHVlLnN1YnN0cmluZygxKSA6IHZhbHVlO1xuICAgICAgfSkuam9pbignJyk7XG4gICAgICBkYXRhQXR0cnNbY2FtZWxDYXNlZGtleV0gPSBhdHRyLnZhbHVlIHx8IGF0dHIubm9kZVZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRhQXR0cnM7XG59XG5cbnZhciBDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENvbmZpZygpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIHNlcnZpY2VOYW1lOiAnJyxcbiAgICAgIHNlcnZpY2VWZXJzaW9uOiAnJyxcbiAgICAgIGVudmlyb25tZW50OiAnJyxcbiAgICAgIHNlcnZlclVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODIwMCcsXG4gICAgICBzZXJ2ZXJVcmxQcmVmaXg6ICcnLFxuICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgaW5zdHJ1bWVudDogdHJ1ZSxcbiAgICAgIGRpc2FibGVJbnN0cnVtZW50YXRpb25zOiBbXSxcbiAgICAgIGxvZ0xldmVsOiAnd2FybicsXG4gICAgICBicmVha2Rvd25NZXRyaWNzOiBmYWxzZSxcbiAgICAgIGlnbm9yZVRyYW5zYWN0aW9uczogW10sXG4gICAgICBldmVudHNMaW1pdDogODAsXG4gICAgICBxdWV1ZUxpbWl0OiAtMSxcbiAgICAgIGZsdXNoSW50ZXJ2YWw6IDUwMCxcbiAgICAgIGRpc3RyaWJ1dGVkVHJhY2luZzogdHJ1ZSxcbiAgICAgIGRpc3RyaWJ1dGVkVHJhY2luZ09yaWdpbnM6IFtdLFxuICAgICAgZGlzdHJpYnV0ZWRUcmFjaW5nSGVhZGVyTmFtZTogJ3RyYWNlcGFyZW50JyxcbiAgICAgIHBhZ2VMb2FkVHJhY2VJZDogJycsXG4gICAgICBwYWdlTG9hZFNwYW5JZDogJycsXG4gICAgICBwYWdlTG9hZFNhbXBsZWQ6IGZhbHNlLFxuICAgICAgcGFnZUxvYWRUcmFuc2FjdGlvbk5hbWU6ICcnLFxuICAgICAgcHJvcGFnYXRlVHJhY2VzdGF0ZTogZmFsc2UsXG4gICAgICB0cmFuc2FjdGlvblNhbXBsZVJhdGU6IDEuMCxcbiAgICAgIGNlbnRyYWxDb25maWc6IGZhbHNlLFxuICAgICAgbW9uaXRvckxvbmd0YXNrczogdHJ1ZSxcbiAgICAgIGFwaVZlcnNpb246IDIsXG4gICAgICBjb250ZXh0OiB7fSxcbiAgICAgIHNlc3Npb246IGZhbHNlLFxuICAgICAgYXBtUmVxdWVzdDogbnVsbFxuICAgIH07XG4gICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5maWx0ZXJzID0gW107XG4gICAgdGhpcy52ZXJzaW9uID0gJyc7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gQ29uZmlnLnByb3RvdHlwZTtcblxuICBfcHJvdG8uaW5pdCA9IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIHNjcmlwdERhdGEgPSBnZXRDb25maWdGcm9tU2NyaXB0KCk7XG4gICAgdGhpcy5zZXRDb25maWcoc2NyaXB0RGF0YSk7XG4gIH07XG5cbiAgX3Byb3RvLnNldFZlcnNpb24gPSBmdW5jdGlvbiBzZXRWZXJzaW9uKHZlcnNpb24pIHtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uO1xuICB9O1xuXG4gIF9wcm90by5hZGRGaWx0ZXIgPSBmdW5jdGlvbiBhZGRGaWx0ZXIoY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FyZ3VtZW50IHRvIG11c3QgYmUgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICB0aGlzLmZpbHRlcnMucHVzaChjYik7XG4gIH07XG5cbiAgX3Byb3RvLmFwcGx5RmlsdGVycyA9IGZ1bmN0aW9uIGFwcGx5RmlsdGVycyhkYXRhKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZpbHRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRhdGEgPSB0aGlzLmZpbHRlcnNbaV0oZGF0YSk7XG5cbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG5cbiAgX3Byb3RvLmdldCA9IGZ1bmN0aW9uIGdldChrZXkpIHtcbiAgICByZXR1cm4ga2V5LnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uIChvYmosIG9iaktleSkge1xuICAgICAgcmV0dXJuIG9iaiAmJiBvYmpbb2JqS2V5XTtcbiAgICB9LCB0aGlzLmNvbmZpZyk7XG4gIH07XG5cbiAgX3Byb3RvLnNldFVzZXJDb250ZXh0ID0gZnVuY3Rpb24gc2V0VXNlckNvbnRleHQodXNlckNvbnRleHQpIHtcbiAgICBpZiAodXNlckNvbnRleHQgPT09IHZvaWQgMCkge1xuICAgICAgdXNlckNvbnRleHQgPSB7fTtcbiAgICB9XG5cbiAgICB2YXIgY29udGV4dCA9IHt9O1xuICAgIHZhciBfdXNlckNvbnRleHQgPSB1c2VyQ29udGV4dCxcbiAgICAgICAgaWQgPSBfdXNlckNvbnRleHQuaWQsXG4gICAgICAgIHVzZXJuYW1lID0gX3VzZXJDb250ZXh0LnVzZXJuYW1lLFxuICAgICAgICBlbWFpbCA9IF91c2VyQ29udGV4dC5lbWFpbDtcblxuICAgIGlmICh0eXBlb2YgaWQgPT09ICdudW1iZXInIHx8IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnRleHQuaWQgPSBpZDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHVzZXJuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgY29udGV4dC51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZW1haWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb250ZXh0LmVtYWlsID0gZW1haWw7XG4gICAgfVxuXG4gICAgdGhpcy5jb25maWcuY29udGV4dC51c2VyID0gZXh0ZW5kKHRoaXMuY29uZmlnLmNvbnRleHQudXNlciB8fCB7fSwgY29udGV4dCk7XG4gIH07XG5cbiAgX3Byb3RvLnNldEN1c3RvbUNvbnRleHQgPSBmdW5jdGlvbiBzZXRDdXN0b21Db250ZXh0KGN1c3RvbUNvbnRleHQpIHtcbiAgICBpZiAoY3VzdG9tQ29udGV4dCA9PT0gdm9pZCAwKSB7XG4gICAgICBjdXN0b21Db250ZXh0ID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5jb25maWcuY29udGV4dC5jdXN0b20gPSBleHRlbmQodGhpcy5jb25maWcuY29udGV4dC5jdXN0b20gfHwge30sIGN1c3RvbUNvbnRleHQpO1xuICB9O1xuXG4gIF9wcm90by5hZGRMYWJlbHMgPSBmdW5jdGlvbiBhZGRMYWJlbHModGFncykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnLmNvbnRleHQudGFncykge1xuICAgICAgdGhpcy5jb25maWcuY29udGV4dC50YWdzID0ge307XG4gICAgfVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0YWdzKTtcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgIHJldHVybiBzZXRMYWJlbChrLCB0YWdzW2tdLCBfdGhpcy5jb25maWcuY29udGV4dC50YWdzKTtcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uc2V0Q29uZmlnID0gZnVuY3Rpb24gc2V0Q29uZmlnKHByb3BlcnRpZXMpIHtcbiAgICBpZiAocHJvcGVydGllcyA9PT0gdm9pZCAwKSB7XG4gICAgICBwcm9wZXJ0aWVzID0ge307XG4gICAgfVxuXG4gICAgdmFyIF9wcm9wZXJ0aWVzID0gcHJvcGVydGllcyxcbiAgICAgICAgdHJhbnNhY3Rpb25TYW1wbGVSYXRlID0gX3Byb3BlcnRpZXMudHJhbnNhY3Rpb25TYW1wbGVSYXRlLFxuICAgICAgICBzZXJ2ZXJVcmwgPSBfcHJvcGVydGllcy5zZXJ2ZXJVcmw7XG5cbiAgICBpZiAoc2VydmVyVXJsKSB7XG4gICAgICBwcm9wZXJ0aWVzLnNlcnZlclVybCA9IHNlcnZlclVybC5yZXBsYWNlKC9cXC8rJC8sICcnKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRyYW5zYWN0aW9uU2FtcGxlUmF0ZSkpIHtcbiAgICAgIGlmICh0cmFuc2FjdGlvblNhbXBsZVJhdGUgPCAwLjAwMDEgJiYgdHJhbnNhY3Rpb25TYW1wbGVSYXRlID4gMCkge1xuICAgICAgICB0cmFuc2FjdGlvblNhbXBsZVJhdGUgPSAwLjAwMDE7XG4gICAgICB9XG5cbiAgICAgIHByb3BlcnRpZXMudHJhbnNhY3Rpb25TYW1wbGVSYXRlID0gTWF0aC5yb3VuZCh0cmFuc2FjdGlvblNhbXBsZVJhdGUgKiAxMDAwMCkgLyAxMDAwMDtcbiAgICB9XG5cbiAgICBtZXJnZSh0aGlzLmNvbmZpZywgcHJvcGVydGllcyk7XG4gICAgdGhpcy5ldmVudHMuc2VuZChDT05GSUdfQ0hBTkdFLCBbdGhpcy5jb25maWddKTtcbiAgfTtcblxuICBfcHJvdG8udmFsaWRhdGUgPSBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wZXJ0aWVzKSB7XG4gICAgaWYgKHByb3BlcnRpZXMgPT09IHZvaWQgMCkge1xuICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgIH1cblxuICAgIHZhciByZXF1aXJlZEtleXMgPSBbJ3NlcnZpY2VOYW1lJywgJ3NlcnZlclVybCddO1xuICAgIHZhciBlcnJvcnMgPSB7XG4gICAgICBtaXNzaW5nOiBbXSxcbiAgICAgIGludmFsaWQ6IFtdXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmIChyZXF1aXJlZEtleXMuaW5kZXhPZihrZXkpICE9PSAtMSAmJiAhcHJvcGVydGllc1trZXldKSB7XG4gICAgICAgIGVycm9ycy5taXNzaW5nLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChwcm9wZXJ0aWVzLnNlcnZpY2VOYW1lICYmICEvXlthLXpBLVowLTkgXy1dKyQvLnRlc3QocHJvcGVydGllcy5zZXJ2aWNlTmFtZSkpIHtcbiAgICAgIGVycm9ycy5pbnZhbGlkLnB1c2goe1xuICAgICAgICBrZXk6ICdzZXJ2aWNlTmFtZScsXG4gICAgICAgIHZhbHVlOiBwcm9wZXJ0aWVzLnNlcnZpY2VOYW1lLFxuICAgICAgICBhbGxvd2VkOiAnYS16LCBBLVosIDAtOSwgXywgLSwgPHNwYWNlPidcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBzYW1wbGVSYXRlID0gcHJvcGVydGllcy50cmFuc2FjdGlvblNhbXBsZVJhdGU7XG5cbiAgICBpZiAodHlwZW9mIHNhbXBsZVJhdGUgIT09ICd1bmRlZmluZWQnICYmICh0eXBlb2Ygc2FtcGxlUmF0ZSAhPT0gJ251bWJlcicgfHwgaXNOYU4oc2FtcGxlUmF0ZSkgfHwgc2FtcGxlUmF0ZSA8IDAgfHwgc2FtcGxlUmF0ZSA+IDEpKSB7XG4gICAgICBlcnJvcnMuaW52YWxpZC5wdXNoKHtcbiAgICAgICAga2V5OiAndHJhbnNhY3Rpb25TYW1wbGVSYXRlJyxcbiAgICAgICAgdmFsdWU6IHNhbXBsZVJhdGUsXG4gICAgICAgIGFsbG93ZWQ6ICdOdW1iZXIgYmV0d2VlbiAwIGFuZCAxJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9ycztcbiAgfTtcblxuICBfcHJvdG8uZ2V0TG9jYWxDb25maWcgPSBmdW5jdGlvbiBnZXRMb2NhbENvbmZpZygpIHtcbiAgICB2YXIgc3RvcmFnZSA9IHNlc3Npb25TdG9yYWdlO1xuXG4gICAgaWYgKHRoaXMuY29uZmlnLnNlc3Npb24pIHtcbiAgICAgIHN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgfVxuXG4gICAgdmFyIGNvbmZpZyA9IHN0b3JhZ2UuZ2V0SXRlbShMT0NBTF9DT05GSUdfS0VZKTtcblxuICAgIGlmIChjb25maWcpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbmZpZyk7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5zZXRMb2NhbENvbmZpZyA9IGZ1bmN0aW9uIHNldExvY2FsQ29uZmlnKGNvbmZpZywgbWVyZ2UpIHtcbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICBpZiAobWVyZ2UpIHtcbiAgICAgICAgdmFyIHByZXZDb25maWcgPSB0aGlzLmdldExvY2FsQ29uZmlnKCk7XG4gICAgICAgIGNvbmZpZyA9IF9leHRlbmRzKHt9LCBwcmV2Q29uZmlnLCBjb25maWcpO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RvcmFnZSA9IHNlc3Npb25TdG9yYWdlO1xuXG4gICAgICBpZiAodGhpcy5jb25maWcuc2Vzc2lvbikge1xuICAgICAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgICAgfVxuXG4gICAgICBzdG9yYWdlLnNldEl0ZW0oTE9DQUxfQ09ORklHX0tFWSwgSlNPTi5zdHJpbmdpZnkoY29uZmlnKSk7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChuYW1lLCBhcmdzKSB7XG4gICAgdGhpcy5ldmVudHMuc2VuZChuYW1lLCBhcmdzKTtcbiAgfTtcblxuICBfcHJvdG8ub2JzZXJ2ZUV2ZW50ID0gZnVuY3Rpb24gb2JzZXJ2ZUV2ZW50KG5hbWUsIGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9ic2VydmUobmFtZSwgZm4pO1xuICB9O1xuXG4gIHJldHVybiBDb25maWc7XG59KCk7XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZzsiLCJ2YXIgU0NIRURVTEUgPSAnc2NoZWR1bGUnO1xudmFyIElOVk9LRSA9ICdpbnZva2UnO1xudmFyIEFERF9FVkVOVF9MSVNURU5FUl9TVFIgPSAnYWRkRXZlbnRMaXN0ZW5lcic7XG52YXIgUkVNT1ZFX0VWRU5UX0xJU1RFTkVSX1NUUiA9ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbnZhciBSRVNPVVJDRV9JTklUSUFUT1JfVFlQRVMgPSBbJ2xpbmsnLCAnY3NzJywgJ3NjcmlwdCcsICdpbWcnLCAneG1saHR0cHJlcXVlc3QnLCAnZmV0Y2gnLCAnYmVhY29uJywgJ2lmcmFtZSddO1xudmFyIFJFVVNBQklMSVRZX1RIUkVTSE9MRCA9IDUwMDA7XG52YXIgTUFYX1NQQU5fRFVSQVRJT04gPSA1ICogNjAgKiAxMDAwO1xudmFyIFBBR0VfTE9BRF9ERUxBWSA9IDEwMDA7XG52YXIgUEFHRV9MT0FEID0gJ3BhZ2UtbG9hZCc7XG52YXIgUk9VVEVfQ0hBTkdFID0gJ3JvdXRlLWNoYW5nZSc7XG52YXIgVFlQRV9DVVNUT00gPSAnY3VzdG9tJztcbnZhciBVU0VSX0lOVEVSQUNUSU9OID0gJ3VzZXItaW50ZXJhY3Rpb24nO1xudmFyIEhUVFBfUkVRVUVTVF9UWVBFID0gJ2h0dHAtcmVxdWVzdCc7XG52YXIgVEVNUE9SQVJZX1RZUEUgPSAndGVtcG9yYXJ5JztcbnZhciBOQU1FX1VOS05PV04gPSAnVW5rbm93bic7XG52YXIgVFJBTlNBQ1RJT05fVFlQRV9PUkRFUiA9IFtQQUdFX0xPQUQsIFJPVVRFX0NIQU5HRSwgVVNFUl9JTlRFUkFDVElPTiwgSFRUUF9SRVFVRVNUX1RZUEUsIFRZUEVfQ1VTVE9NLCBURU1QT1JBUllfVFlQRV07XG52YXIgT1VUQ09NRV9TVUNDRVNTID0gJ3N1Y2Nlc3MnO1xudmFyIE9VVENPTUVfRkFJTFVSRSA9ICdmYWlsdXJlJztcbnZhciBVU0VSX1RJTUlOR19USFJFU0hPTEQgPSA2MDtcbnZhciBUUkFOU0FDVElPTl9TVEFSVCA9ICd0cmFuc2FjdGlvbjpzdGFydCc7XG52YXIgVFJBTlNBQ1RJT05fRU5EID0gJ3RyYW5zYWN0aW9uOmVuZCc7XG52YXIgQ09ORklHX0NIQU5HRSA9ICdjb25maWc6Y2hhbmdlJztcbnZhciBRVUVVRV9GTFVTSCA9ICdxdWV1ZTpmbHVzaCc7XG52YXIgUVVFVUVfQUREX1RSQU5TQUNUSU9OID0gJ3F1ZXVlOmFkZF90cmFuc2FjdGlvbic7XG52YXIgWE1MSFRUUFJFUVVFU1QgPSAneG1saHR0cHJlcXVlc3QnO1xudmFyIEZFVENIID0gJ2ZldGNoJztcbnZhciBISVNUT1JZID0gJ2hpc3RvcnknO1xudmFyIEVWRU5UX1RBUkdFVCA9ICdldmVudHRhcmdldCc7XG52YXIgRVJST1IgPSAnZXJyb3InO1xudmFyIEJFRk9SRV9FVkVOVCA9ICc6YmVmb3JlJztcbnZhciBBRlRFUl9FVkVOVCA9ICc6YWZ0ZXInO1xudmFyIExPQ0FMX0NPTkZJR19LRVkgPSAnZWxhc3RpY19hcG1fY29uZmlnJztcbnZhciBMT05HX1RBU0sgPSAnbG9uZ3Rhc2snO1xudmFyIFBBSU5UID0gJ3BhaW50JztcbnZhciBNRUFTVVJFID0gJ21lYXN1cmUnO1xudmFyIE5BVklHQVRJT04gPSAnbmF2aWdhdGlvbic7XG52YXIgUkVTT1VSQ0UgPSAncmVzb3VyY2UnO1xudmFyIEZJUlNUX0NPTlRFTlRGVUxfUEFJTlQgPSAnZmlyc3QtY29udGVudGZ1bC1wYWludCc7XG52YXIgTEFSR0VTVF9DT05URU5URlVMX1BBSU5UID0gJ2xhcmdlc3QtY29udGVudGZ1bC1wYWludCc7XG52YXIgRklSU1RfSU5QVVQgPSAnZmlyc3QtaW5wdXQnO1xudmFyIExBWU9VVF9TSElGVCA9ICdsYXlvdXQtc2hpZnQnO1xudmFyIEVSUk9SUyA9ICdlcnJvcnMnO1xudmFyIFRSQU5TQUNUSU9OUyA9ICd0cmFuc2FjdGlvbnMnO1xudmFyIENPTkZJR19TRVJWSUNFID0gJ0NvbmZpZ1NlcnZpY2UnO1xudmFyIExPR0dJTkdfU0VSVklDRSA9ICdMb2dnaW5nU2VydmljZSc7XG52YXIgVFJBTlNBQ1RJT05fU0VSVklDRSA9ICdUcmFuc2FjdGlvblNlcnZpY2UnO1xudmFyIEFQTV9TRVJWRVIgPSAnQXBtU2VydmVyJztcbnZhciBUUlVOQ0FURURfVFlQRSA9ICcudHJ1bmNhdGVkJztcbnZhciBLRVlXT1JEX0xJTUlUID0gMTAyNDtcbnZhciBTRVNTSU9OX1RJTUVPVVQgPSAzMCAqIDYwMDAwO1xudmFyIEhUVFBfUkVRVUVTVF9USU1FT1VUID0gMTAwMDA7XG5leHBvcnQgeyBTQ0hFRFVMRSwgSU5WT0tFLCBBRERfRVZFTlRfTElTVEVORVJfU1RSLCBSRU1PVkVfRVZFTlRfTElTVEVORVJfU1RSLCBSRVNPVVJDRV9JTklUSUFUT1JfVFlQRVMsIFJFVVNBQklMSVRZX1RIUkVTSE9MRCwgTUFYX1NQQU5fRFVSQVRJT04sIFBBR0VfTE9BRF9ERUxBWSwgUEFHRV9MT0FELCBST1VURV9DSEFOR0UsIE5BTUVfVU5LTk9XTiwgVFlQRV9DVVNUT00sIFVTRVJfVElNSU5HX1RIUkVTSE9MRCwgVFJBTlNBQ1RJT05fU1RBUlQsIFRSQU5TQUNUSU9OX0VORCwgQ09ORklHX0NIQU5HRSwgUVVFVUVfRkxVU0gsIFFVRVVFX0FERF9UUkFOU0FDVElPTiwgWE1MSFRUUFJFUVVFU1QsIEZFVENILCBISVNUT1JZLCBFVkVOVF9UQVJHRVQsIEVSUk9SLCBCRUZPUkVfRVZFTlQsIEFGVEVSX0VWRU5ULCBMT0NBTF9DT05GSUdfS0VZLCBIVFRQX1JFUVVFU1RfVFlQRSwgTE9OR19UQVNLLCBQQUlOVCwgTUVBU1VSRSwgTkFWSUdBVElPTiwgUkVTT1VSQ0UsIEZJUlNUX0NPTlRFTlRGVUxfUEFJTlQsIExBUkdFU1RfQ09OVEVOVEZVTF9QQUlOVCwgS0VZV09SRF9MSU1JVCwgVEVNUE9SQVJZX1RZUEUsIFVTRVJfSU5URVJBQ1RJT04sIFRSQU5TQUNUSU9OX1RZUEVfT1JERVIsIEVSUk9SUywgVFJBTlNBQ1RJT05TLCBDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFLCBUUkFOU0FDVElPTl9TRVJWSUNFLCBBUE1fU0VSVkVSLCBUUlVOQ0FURURfVFlQRSwgRklSU1RfSU5QVVQsIExBWU9VVF9TSElGVCwgT1VUQ09NRV9TVUNDRVNTLCBPVVRDT01FX0ZBSUxVUkUsIFNFU1NJT05fVElNRU9VVCwgSFRUUF9SRVFVRVNUX1RJTUVPVVQgfTsiLCJ2YXIgX2V4Y2x1ZGVkID0gW1widGFnc1wiXTtcblxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2Uoc291cmNlLCBleGNsdWRlZCkgeyBpZiAoc291cmNlID09IG51bGwpIHJldHVybiB7fTsgdmFyIHRhcmdldCA9IHt9OyB2YXIgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7IHZhciBrZXksIGk7IGZvciAoaSA9IDA7IGkgPCBzb3VyY2VLZXlzLmxlbmd0aDsgaSsrKSB7IGtleSA9IHNvdXJjZUtleXNbaV07IGlmIChleGNsdWRlZC5pbmRleE9mKGtleSkgPj0gMCkgY29udGludWU7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5pbXBvcnQgeyBVcmwgfSBmcm9tICcuL3VybCc7XG5pbXBvcnQgeyBQQUdFX0xPQUQsIE5BVklHQVRJT04gfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBnZXRTZXJ2ZXJUaW1pbmdJbmZvLCBQRVJGLCBpc1BlcmZUaW1lbGluZVN1cHBvcnRlZCB9IGZyb20gJy4vdXRpbHMnO1xudmFyIExFRlRfU1FVQVJFX0JSQUNLRVQgPSA5MTtcbnZhciBSSUdIVF9TUVVBUkVfQlJBQ0tFVCA9IDkzO1xudmFyIEVYVEVSTkFMID0gJ2V4dGVybmFsJztcbnZhciBSRVNPVVJDRSA9ICdyZXNvdXJjZSc7XG52YXIgSEFSRF9OQVZJR0FUSU9OID0gJ2hhcmQtbmF2aWdhdGlvbic7XG5cbmZ1bmN0aW9uIGdldFBvcnROdW1iZXIocG9ydCwgcHJvdG9jb2wpIHtcbiAgaWYgKHBvcnQgPT09ICcnKSB7XG4gICAgcG9ydCA9IHByb3RvY29sID09PSAnaHR0cDonID8gJzgwJyA6IHByb3RvY29sID09PSAnaHR0cHM6JyA/ICc0NDMnIDogJyc7XG4gIH1cblxuICByZXR1cm4gcG9ydDtcbn1cblxuZnVuY3Rpb24gZ2V0UmVzcG9uc2VDb250ZXh0KHBlcmZUaW1pbmdFbnRyeSkge1xuICB2YXIgdHJhbnNmZXJTaXplID0gcGVyZlRpbWluZ0VudHJ5LnRyYW5zZmVyU2l6ZSxcbiAgICAgIGVuY29kZWRCb2R5U2l6ZSA9IHBlcmZUaW1pbmdFbnRyeS5lbmNvZGVkQm9keVNpemUsXG4gICAgICBkZWNvZGVkQm9keVNpemUgPSBwZXJmVGltaW5nRW50cnkuZGVjb2RlZEJvZHlTaXplLFxuICAgICAgc2VydmVyVGltaW5nID0gcGVyZlRpbWluZ0VudHJ5LnNlcnZlclRpbWluZztcbiAgdmFyIHJlc3BDb250ZXh0ID0ge1xuICAgIHRyYW5zZmVyX3NpemU6IHRyYW5zZmVyU2l6ZSxcbiAgICBlbmNvZGVkX2JvZHlfc2l6ZTogZW5jb2RlZEJvZHlTaXplLFxuICAgIGRlY29kZWRfYm9keV9zaXplOiBkZWNvZGVkQm9keVNpemVcbiAgfTtcbiAgdmFyIHNlcnZlclRpbWluZ1N0ciA9IGdldFNlcnZlclRpbWluZ0luZm8oc2VydmVyVGltaW5nKTtcblxuICBpZiAoc2VydmVyVGltaW5nU3RyKSB7XG4gICAgcmVzcENvbnRleHQuaGVhZGVycyA9IHtcbiAgICAgICdzZXJ2ZXItdGltaW5nJzogc2VydmVyVGltaW5nU3RyXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiByZXNwQ29udGV4dDtcbn1cblxuZnVuY3Rpb24gZ2V0RGVzdGluYXRpb24ocGFyc2VkVXJsKSB7XG4gIHZhciBwb3J0ID0gcGFyc2VkVXJsLnBvcnQsXG4gICAgICBwcm90b2NvbCA9IHBhcnNlZFVybC5wcm90b2NvbCxcbiAgICAgIGhvc3RuYW1lID0gcGFyc2VkVXJsLmhvc3RuYW1lO1xuICB2YXIgcG9ydE51bWJlciA9IGdldFBvcnROdW1iZXIocG9ydCwgcHJvdG9jb2wpO1xuICB2YXIgaXB2Nkhvc3RuYW1lID0gaG9zdG5hbWUuY2hhckNvZGVBdCgwKSA9PT0gTEVGVF9TUVVBUkVfQlJBQ0tFVCAmJiBob3N0bmFtZS5jaGFyQ29kZUF0KGhvc3RuYW1lLmxlbmd0aCAtIDEpID09PSBSSUdIVF9TUVVBUkVfQlJBQ0tFVDtcbiAgdmFyIGFkZHJlc3MgPSBob3N0bmFtZTtcblxuICBpZiAoaXB2Nkhvc3RuYW1lKSB7XG4gICAgYWRkcmVzcyA9IGhvc3RuYW1lLnNsaWNlKDEsIC0xKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc2VydmljZToge1xuICAgICAgcmVzb3VyY2U6IGhvc3RuYW1lICsgJzonICsgcG9ydE51bWJlcixcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgdHlwZTogJydcbiAgICB9LFxuICAgIGFkZHJlc3M6IGFkZHJlc3MsXG4gICAgcG9ydDogTnVtYmVyKHBvcnROdW1iZXIpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFJlc291cmNlQ29udGV4dChkYXRhKSB7XG4gIHZhciBlbnRyeSA9IGRhdGEuZW50cnksXG4gICAgICB1cmwgPSBkYXRhLnVybDtcbiAgdmFyIHBhcnNlZFVybCA9IG5ldyBVcmwodXJsKTtcbiAgdmFyIGRlc3RpbmF0aW9uID0gZ2V0RGVzdGluYXRpb24ocGFyc2VkVXJsKTtcbiAgcmV0dXJuIHtcbiAgICBodHRwOiB7XG4gICAgICB1cmw6IHVybCxcbiAgICAgIHJlc3BvbnNlOiBnZXRSZXNwb25zZUNvbnRleHQoZW50cnkpXG4gICAgfSxcbiAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0RXh0ZXJuYWxDb250ZXh0KGRhdGEpIHtcbiAgdmFyIHVybCA9IGRhdGEudXJsLFxuICAgICAgbWV0aG9kID0gZGF0YS5tZXRob2QsXG4gICAgICB0YXJnZXQgPSBkYXRhLnRhcmdldCxcbiAgICAgIHJlc3BvbnNlID0gZGF0YS5yZXNwb25zZTtcbiAgdmFyIHBhcnNlZFVybCA9IG5ldyBVcmwodXJsKTtcbiAgdmFyIGRlc3RpbmF0aW9uID0gZ2V0RGVzdGluYXRpb24ocGFyc2VkVXJsKTtcbiAgdmFyIGNvbnRleHQgPSB7XG4gICAgaHR0cDoge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHBhcnNlZFVybC5ocmVmXG4gICAgfSxcbiAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgfTtcbiAgdmFyIHN0YXR1c0NvZGU7XG5cbiAgaWYgKHRhcmdldCAmJiB0eXBlb2YgdGFyZ2V0LnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzdGF0dXNDb2RlID0gdGFyZ2V0LnN0YXR1cztcbiAgfSBlbHNlIGlmIChyZXNwb25zZSkge1xuICAgIHN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXM7XG4gIH1cblxuICBjb250ZXh0Lmh0dHAuc3RhdHVzX2NvZGUgPSBzdGF0dXNDb2RlO1xuICByZXR1cm4gY29udGV4dDtcbn1cblxuZnVuY3Rpb24gZ2V0TmF2aWdhdGlvbkNvbnRleHQoZGF0YSkge1xuICB2YXIgdXJsID0gZGF0YS51cmw7XG4gIHZhciBwYXJzZWRVcmwgPSBuZXcgVXJsKHVybCk7XG4gIHZhciBkZXN0aW5hdGlvbiA9IGdldERlc3RpbmF0aW9uKHBhcnNlZFVybCk7XG4gIHJldHVybiB7XG4gICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYWdlQ29udGV4dCgpIHtcbiAgcmV0dXJuIHtcbiAgICBwYWdlOiB7XG4gICAgICByZWZlcmVyOiBkb2N1bWVudC5yZWZlcnJlcixcbiAgICAgIHVybDogbG9jYXRpb24uaHJlZlxuICAgIH1cbiAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRTcGFuQ29udGV4dChzcGFuLCBkYXRhKSB7XG4gIGlmICghZGF0YSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0eXBlID0gc3Bhbi50eXBlO1xuICB2YXIgY29udGV4dDtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIEVYVEVSTkFMOlxuICAgICAgY29udGV4dCA9IGdldEV4dGVybmFsQ29udGV4dChkYXRhKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBSRVNPVVJDRTpcbiAgICAgIGNvbnRleHQgPSBnZXRSZXNvdXJjZUNvbnRleHQoZGF0YSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgSEFSRF9OQVZJR0FUSU9OOlxuICAgICAgY29udGV4dCA9IGdldE5hdmlnYXRpb25Db250ZXh0KGRhdGEpO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBzcGFuLmFkZENvbnRleHQoY29udGV4dCk7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkVHJhbnNhY3Rpb25Db250ZXh0KHRyYW5zYWN0aW9uLCBfdGVtcCkge1xuICB2YXIgX3JlZiA9IF90ZW1wID09PSB2b2lkIDAgPyB7fSA6IF90ZW1wLFxuICAgICAgdGFncyA9IF9yZWYudGFncyxcbiAgICAgIGNvbmZpZ0NvbnRleHQgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShfcmVmLCBfZXhjbHVkZWQpO1xuXG4gIHZhciBwYWdlQ29udGV4dCA9IGdldFBhZ2VDb250ZXh0KCk7XG4gIHZhciByZXNwb25zZUNvbnRleHQgPSB7fTtcblxuICBpZiAodHJhbnNhY3Rpb24udHlwZSA9PT0gUEFHRV9MT0FEICYmIGlzUGVyZlRpbWVsaW5lU3VwcG9ydGVkKCkpIHtcbiAgICB2YXIgZW50cmllcyA9IFBFUkYuZ2V0RW50cmllc0J5VHlwZShOQVZJR0FUSU9OKTtcblxuICAgIGlmIChlbnRyaWVzICYmIGVudHJpZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmVzcG9uc2VDb250ZXh0ID0ge1xuICAgICAgICByZXNwb25zZTogZ2V0UmVzcG9uc2VDb250ZXh0KGVudHJpZXNbMF0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHRyYW5zYWN0aW9uLmFkZENvbnRleHQocGFnZUNvbnRleHQsIHJlc3BvbnNlQ29udGV4dCwgY29uZmlnQ29udGV4dCk7XG59IiwiaW1wb3J0IHsgQkVGT1JFX0VWRU5ULCBBRlRFUl9FVkVOVCB9IGZyb20gJy4vY29uc3RhbnRzJztcblxudmFyIEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRXZlbnRIYW5kbGVyKCkge1xuICAgIHRoaXMub2JzZXJ2ZXJzID0ge307XG4gIH1cblxuICB2YXIgX3Byb3RvID0gRXZlbnRIYW5kbGVyLnByb3RvdHlwZTtcblxuICBfcHJvdG8ub2JzZXJ2ZSA9IGZ1bmN0aW9uIG9ic2VydmUobmFtZSwgZm4pIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKCF0aGlzLm9ic2VydmVyc1tuYW1lXSkge1xuICAgICAgICB0aGlzLm9ic2VydmVyc1tuYW1lXSA9IFtdO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9ic2VydmVyc1tuYW1lXS5wdXNoKGZuKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbmRleCA9IF90aGlzLm9ic2VydmVyc1tuYW1lXS5pbmRleE9mKGZuKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIF90aGlzLm9ic2VydmVyc1tuYW1lXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uc2VuZE9ubHkgPSBmdW5jdGlvbiBzZW5kT25seShuYW1lLCBhcmdzKSB7XG4gICAgdmFyIG9icyA9IHRoaXMub2JzZXJ2ZXJzW25hbWVdO1xuXG4gICAgaWYgKG9icykge1xuICAgICAgb2JzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvciwgZXJyb3Iuc3RhY2spO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLnNlbmQgPSBmdW5jdGlvbiBzZW5kKG5hbWUsIGFyZ3MpIHtcbiAgICB0aGlzLnNlbmRPbmx5KG5hbWUgKyBCRUZPUkVfRVZFTlQsIGFyZ3MpO1xuICAgIHRoaXMuc2VuZE9ubHkobmFtZSwgYXJncyk7XG4gICAgdGhpcy5zZW5kT25seShuYW1lICsgQUZURVJfRVZFTlQsIGFyZ3MpO1xuICB9O1xuXG4gIHJldHVybiBFdmVudEhhbmRsZXI7XG59KCk7XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50SGFuZGxlcjsiLCJmdW5jdGlvbiBfZXh0ZW5kcygpIHsgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9OyByZXR1cm4gX2V4dGVuZHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfVxuXG5pbXBvcnQgeyBIVFRQX1JFUVVFU1RfVElNRU9VVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBpc1Jlc3BvbnNlU3VjY2Vzc2Z1bCB9IGZyb20gJy4vcmVzcG9uc2Utc3RhdHVzJztcbmV4cG9ydCB2YXIgQllURV9MSU1JVCA9IDYwICogMTAwMDtcbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRVc2VGZXRjaFdpdGhLZWVwQWxpdmUobWV0aG9kLCBwYXlsb2FkKSB7XG4gIGlmICghaXNGZXRjaFN1cHBvcnRlZCgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGlzS2VlcEFsaXZlU3VwcG9ydGVkID0gKCdrZWVwYWxpdmUnIGluIG5ldyBSZXF1ZXN0KCcnKSk7XG5cbiAgaWYgKCFpc0tlZXBBbGl2ZVN1cHBvcnRlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBzaXplID0gY2FsY3VsYXRlU2l6ZShwYXlsb2FkKTtcbiAgcmV0dXJuIG1ldGhvZCA9PT0gJ1BPU1QnICYmIHNpemUgPCBCWVRFX0xJTUlUO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNlbmRGZXRjaFJlcXVlc3QobWV0aG9kLCB1cmwsIF9yZWYpIHtcbiAgdmFyIF9yZWYka2VlcGFsaXZlID0gX3JlZi5rZWVwYWxpdmUsXG4gICAgICBrZWVwYWxpdmUgPSBfcmVmJGtlZXBhbGl2ZSA9PT0gdm9pZCAwID8gZmFsc2UgOiBfcmVmJGtlZXBhbGl2ZSxcbiAgICAgIF9yZWYkdGltZW91dCA9IF9yZWYudGltZW91dCxcbiAgICAgIHRpbWVvdXQgPSBfcmVmJHRpbWVvdXQgPT09IHZvaWQgMCA/IEhUVFBfUkVRVUVTVF9USU1FT1VUIDogX3JlZiR0aW1lb3V0LFxuICAgICAgcGF5bG9hZCA9IF9yZWYucGF5bG9hZCxcbiAgICAgIGhlYWRlcnMgPSBfcmVmLmhlYWRlcnM7XG4gIHZhciB0aW1lb3V0Q29uZmlnID0ge307XG5cbiAgaWYgKHR5cGVvZiBBYm9ydENvbnRyb2xsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB0aW1lb3V0Q29uZmlnLnNpZ25hbCA9IGNvbnRyb2xsZXIuc2lnbmFsO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIHZhciBmZXRjaFJlc3BvbnNlO1xuICByZXR1cm4gd2luZG93LmZldGNoKHVybCwgX2V4dGVuZHMoe1xuICAgIGJvZHk6IHBheWxvYWQsXG4gICAgaGVhZGVyczogaGVhZGVycyxcbiAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICBrZWVwYWxpdmU6IGtlZXBhbGl2ZSxcbiAgICBjcmVkZW50aWFsczogJ29taXQnXG4gIH0sIHRpbWVvdXRDb25maWcpKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgIGZldGNoUmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICByZXR1cm4gZmV0Y2hSZXNwb25zZS50ZXh0KCk7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlVGV4dCkge1xuICAgIHZhciBib2R5UmVzcG9uc2UgPSB7XG4gICAgICB1cmw6IHVybCxcbiAgICAgIHN0YXR1czogZmV0Y2hSZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZVRleHQ6IHJlc3BvbnNlVGV4dFxuICAgIH07XG5cbiAgICBpZiAoIWlzUmVzcG9uc2VTdWNjZXNzZnVsKGZldGNoUmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgICAgdGhyb3cgYm9keVJlc3BvbnNlO1xuICAgIH1cblxuICAgIHJldHVybiBib2R5UmVzcG9uc2U7XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzRmV0Y2hTdXBwb3J0ZWQoKSB7XG4gIHJldHVybiB0eXBlb2Ygd2luZG93LmZldGNoID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB3aW5kb3cuUmVxdWVzdCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlU2l6ZShwYXlsb2FkKSB7XG4gIGlmICghcGF5bG9hZCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgcmV0dXJuIHBheWxvYWQuc2l6ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgQmxvYihbcGF5bG9hZF0pLnNpemU7XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGlzUmVzcG9uc2VTdWNjZXNzZnVsKHN0YXR1cykge1xuICBpZiAoc3RhdHVzID09PSAwIHx8IHN0YXR1cyA+IDM5OSAmJiBzdGF0dXMgPCA2MDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn0iLCJpbXBvcnQgeyBYSFJfSUdOT1JFIH0gZnJvbSAnLi4vcGF0Y2hpbmcvcGF0Y2gtdXRpbHMnO1xuaW1wb3J0IHsgaXNSZXNwb25zZVN1Y2Nlc3NmdWwgfSBmcm9tICcuL3Jlc3BvbnNlLXN0YXR1cyc7XG5pbXBvcnQgeyBQcm9taXNlIH0gZnJvbSAnLi4vcG9seWZpbGxzJztcbmV4cG9ydCBmdW5jdGlvbiBzZW5kWEhSKG1ldGhvZCwgdXJsLCBfcmVmKSB7XG4gIHZhciBfcmVmJHRpbWVvdXQgPSBfcmVmLnRpbWVvdXQsXG4gICAgICB0aW1lb3V0ID0gX3JlZiR0aW1lb3V0ID09PSB2b2lkIDAgPyBIVFRQX1JFUVVFU1RfVElNRU9VVCA6IF9yZWYkdGltZW91dCxcbiAgICAgIHBheWxvYWQgPSBfcmVmLnBheWxvYWQsXG4gICAgICBoZWFkZXJzID0gX3JlZi5oZWFkZXJzLFxuICAgICAgYmVmb3JlU2VuZCA9IF9yZWYuYmVmb3JlU2VuZDtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhocltYSFJfSUdOT1JFXSA9IHRydWU7XG4gICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgIHhoci50aW1lb3V0ID0gdGltZW91dDtcblxuICAgIGlmIChoZWFkZXJzKSB7XG4gICAgICBmb3IgKHZhciBoZWFkZXIgaW4gaGVhZGVycykge1xuICAgICAgICBpZiAoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShoZWFkZXIpKSB7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCBoZWFkZXJzW2hlYWRlcl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cyxcbiAgICAgICAgICAgIHJlc3BvbnNlVGV4dCA9IHhoci5yZXNwb25zZVRleHQ7XG5cbiAgICAgICAgaWYgKGlzUmVzcG9uc2VTdWNjZXNzZnVsKHN0YXR1cykpIHtcbiAgICAgICAgICByZXNvbHZlKHhocik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgICAgICByZXNwb25zZVRleHQ6IHJlc3BvbnNlVGV4dFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXMsXG4gICAgICAgICAgcmVzcG9uc2VUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgIHJlamVjdCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgcmVzcG9uc2VUZXh0OiByZXNwb25zZVRleHRcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgY2FuU2VuZCA9IHRydWU7XG5cbiAgICBpZiAodHlwZW9mIGJlZm9yZVNlbmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhblNlbmQgPSBiZWZvcmVTZW5kKHtcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICB4aHI6IHhoclxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNhblNlbmQpIHtcbiAgICAgIHhoci5zZW5kKHBheWxvYWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWplY3Qoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICByZXNwb25zZVRleHQ6ICdSZXF1ZXN0IHJlamVjdGVkIGJ5IHVzZXIgY29uZmlndXJhdGlvbi4nXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufSIsImltcG9ydCB7IFhNTEhUVFBSRVFVRVNULCBGRVRDSCwgSElTVE9SWSwgUEFHRV9MT0FELCBFUlJPUiwgRVZFTlRfVEFSR0VUIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc3RydW1lbnRhdGlvbkZsYWdzKGluc3RydW1lbnQsIGRpc2FibGVkSW5zdHJ1bWVudGF0aW9ucykge1xuICB2YXIgX2ZsYWdzO1xuXG4gIHZhciBmbGFncyA9IChfZmxhZ3MgPSB7fSwgX2ZsYWdzW1hNTEhUVFBSRVFVRVNUXSA9IGZhbHNlLCBfZmxhZ3NbRkVUQ0hdID0gZmFsc2UsIF9mbGFnc1tISVNUT1JZXSA9IGZhbHNlLCBfZmxhZ3NbUEFHRV9MT0FEXSA9IGZhbHNlLCBfZmxhZ3NbRVJST1JdID0gZmFsc2UsIF9mbGFnc1tFVkVOVF9UQVJHRVRdID0gZmFsc2UsIF9mbGFncyk7XG5cbiAgaWYgKCFpbnN0cnVtZW50KSB7XG4gICAgcmV0dXJuIGZsYWdzO1xuICB9XG5cbiAgT2JqZWN0LmtleXMoZmxhZ3MpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChkaXNhYmxlZEluc3RydW1lbnRhdGlvbnMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgZmxhZ3Nba2V5XSA9IHRydWU7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGZsYWdzO1xufSIsImltcG9ydCB7IG5vb3AgfSBmcm9tICcuL3V0aWxzJztcblxudmFyIExvZ2dpbmdTZXJ2aWNlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBMb2dnaW5nU2VydmljZShzcGVjKSB7XG4gICAgaWYgKHNwZWMgPT09IHZvaWQgMCkge1xuICAgICAgc3BlYyA9IHt9O1xuICAgIH1cblxuICAgIHRoaXMubGV2ZWxzID0gWyd0cmFjZScsICdkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXTtcbiAgICB0aGlzLmxldmVsID0gc3BlYy5sZXZlbCB8fCAnd2Fybic7XG4gICAgdGhpcy5wcmVmaXggPSBzcGVjLnByZWZpeCB8fCAnJztcbiAgICB0aGlzLnJlc2V0TG9nTWV0aG9kcygpO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IExvZ2dpbmdTZXJ2aWNlLnByb3RvdHlwZTtcblxuICBfcHJvdG8uc2hvdWxkTG9nID0gZnVuY3Rpb24gc2hvdWxkTG9nKGxldmVsKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxzLmluZGV4T2YobGV2ZWwpID49IHRoaXMubGV2ZWxzLmluZGV4T2YodGhpcy5sZXZlbCk7XG4gIH07XG5cbiAgX3Byb3RvLnNldExldmVsID0gZnVuY3Rpb24gc2V0TGV2ZWwobGV2ZWwpIHtcbiAgICBpZiAobGV2ZWwgPT09IHRoaXMubGV2ZWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmxldmVsID0gbGV2ZWw7XG4gICAgdGhpcy5yZXNldExvZ01ldGhvZHMoKTtcbiAgfTtcblxuICBfcHJvdG8ucmVzZXRMb2dNZXRob2RzID0gZnVuY3Rpb24gcmVzZXRMb2dNZXRob2RzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgX3RoaXNbbGV2ZWxdID0gX3RoaXMuc2hvdWxkTG9nKGxldmVsKSA/IGxvZyA6IG5vb3A7XG5cbiAgICAgIGZ1bmN0aW9uIGxvZygpIHtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRMZXZlbCA9IGxldmVsO1xuXG4gICAgICAgIGlmIChsZXZlbCA9PT0gJ3RyYWNlJyB8fCBsZXZlbCA9PT0gJ2RlYnVnJykge1xuICAgICAgICAgIG5vcm1hbGl6ZWRMZXZlbCA9ICdpbmZvJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICBhcmdzWzBdID0gdGhpcy5wcmVmaXggKyBhcmdzWzBdO1xuXG4gICAgICAgIGlmIChjb25zb2xlKSB7XG4gICAgICAgICAgdmFyIHJlYWxNZXRob2QgPSBjb25zb2xlW25vcm1hbGl6ZWRMZXZlbF0gfHwgY29uc29sZS5sb2c7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHJlYWxNZXRob2QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlYWxNZXRob2QuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIExvZ2dpbmdTZXJ2aWNlO1xufSgpO1xuXG5leHBvcnQgZGVmYXVsdCBMb2dnaW5nU2VydmljZTsiLCJ2YXIgTkRKU09OID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBOREpTT04oKSB7fVxuXG4gIE5ESlNPTi5zdHJpbmdpZnkgPSBmdW5jdGlvbiBzdHJpbmdpZnkob2JqZWN0KSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iamVjdCkgKyAnXFxuJztcbiAgfTtcblxuICByZXR1cm4gTkRKU09OO1xufSgpO1xuXG5leHBvcnQgZGVmYXVsdCBOREpTT047IiwiaW1wb3J0IHsgUVVFVUVfQUREX1RSQU5TQUNUSU9OLCBRVUVVRV9GTFVTSCB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IHN0YXRlIH0gZnJvbSAnLi4vc3RhdGUnO1xuaW1wb3J0IHsgbm93IH0gZnJvbSAnLi91dGlscyc7XG5leHBvcnQgZnVuY3Rpb24gb2JzZXJ2ZVBhZ2VWaXNpYmlsaXR5KGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSkge1xuICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAnaGlkZGVuJykge1xuICAgIHN0YXRlLmxhc3RIaWRkZW5TdGFydCA9IDA7XG4gIH1cblxuICB2YXIgdmlzaWJpbGl0eUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbiB2aXNpYmlsaXR5Q2hhbmdlSGFuZGxlcigpIHtcbiAgICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAnaGlkZGVuJykge1xuICAgICAgb25QYWdlSGlkZGVuKGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBwYWdlSGlkZUhhbmRsZXIgPSBmdW5jdGlvbiBwYWdlSGlkZUhhbmRsZXIoKSB7XG4gICAgcmV0dXJuIG9uUGFnZUhpZGRlbihjb25maWdTZXJ2aWNlLCB0cmFuc2FjdGlvblNlcnZpY2UpO1xuICB9O1xuXG4gIHZhciB1c2VDYXB0dXJlID0gdHJ1ZTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5Q2hhbmdlSGFuZGxlciwgdXNlQ2FwdHVyZSk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwYWdlaGlkZScsIHBhZ2VIaWRlSGFuZGxlciwgdXNlQ2FwdHVyZSk7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5Q2hhbmdlSGFuZGxlciwgdXNlQ2FwdHVyZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BhZ2VoaWRlJywgcGFnZUhpZGVIYW5kbGVyLCB1c2VDYXB0dXJlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25QYWdlSGlkZGVuKGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSkge1xuICB2YXIgdHIgPSB0cmFuc2FjdGlvblNlcnZpY2UuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG5cbiAgaWYgKHRyKSB7XG4gICAgdmFyIHVub2JzZXJ2ZSA9IGNvbmZpZ1NlcnZpY2Uub2JzZXJ2ZUV2ZW50KFFVRVVFX0FERF9UUkFOU0FDVElPTiwgZnVuY3Rpb24gKCkge1xuICAgICAgY29uZmlnU2VydmljZS5kaXNwYXRjaEV2ZW50KFFVRVVFX0ZMVVNIKTtcbiAgICAgIHN0YXRlLmxhc3RIaWRkZW5TdGFydCA9IG5vdygpO1xuICAgICAgdW5vYnNlcnZlKCk7XG4gICAgfSk7XG4gICAgdHIuZW5kKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnU2VydmljZS5kaXNwYXRjaEV2ZW50KFFVRVVFX0ZMVVNIKTtcbiAgICBzdGF0ZS5sYXN0SGlkZGVuU3RhcnQgPSBub3coKTtcbiAgfVxufSIsImltcG9ydCB7IFNDSEVEVUxFLCBJTlZPS0UsIEFERF9FVkVOVF9MSVNURU5FUl9TVFIsIFJFTU9WRV9FVkVOVF9MSVNURU5FUl9TVFIsIEVWRU5UX1RBUkdFVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBhcG1TeW1ib2wgfSBmcm9tICcuL3BhdGNoLXV0aWxzJztcbnZhciBldmVudFR5cGVzID0gWydjbGljayddO1xudmFyIGV2ZW50VHlwZVN5bWJvbHMgPSB7fTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudFR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gIHZhciBldCA9IGV2ZW50VHlwZXNbaV07XG4gIGV2ZW50VHlwZVN5bWJvbHNbZXRdID0gYXBtU3ltYm9sKGV0KTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkSW5zdHJ1bWVudEV2ZW50KHRhcmdldCwgZXZlbnRUeXBlLCBsaXN0ZW5lckZuKSB7XG4gIHJldHVybiB0YXJnZXQgaW5zdGFuY2VvZiBFdmVudFRhcmdldCAmJiBldmVudFR5cGVzLmluZGV4T2YoZXZlbnRUeXBlKSA+PSAwICYmIHR5cGVvZiBsaXN0ZW5lckZuID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hFdmVudFRhcmdldChjYWxsYmFjaykge1xuICBpZiAoIXdpbmRvdy5FdmVudFRhcmdldCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBwcm90byA9IHdpbmRvdy5FdmVudFRhcmdldC5wcm90b3R5cGU7XG4gIHZhciBuYXRpdmVBZGRFdmVudExpc3RlbmVyID0gcHJvdG9bQUREX0VWRU5UX0xJU1RFTkVSX1NUUl07XG4gIHZhciBuYXRpdmVSZW1vdmVFdmVudExpc3RlbmVyID0gcHJvdG9bUkVNT1ZFX0VWRU5UX0xJU1RFTkVSX1NUUl07XG5cbiAgZnVuY3Rpb24gZmluZFRhc2tJbmRleChleGlzdGluZ1Rhc2tzLCBldmVudFR5cGUsIGxpc3RlbmVyRm4sIGNhcHR1cmUpIHtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgZXhpc3RpbmdUYXNrcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciB0YXNrID0gZXhpc3RpbmdUYXNrc1tfaV07XG5cbiAgICAgIGlmICh0YXNrLmV2ZW50VHlwZSA9PT0gZXZlbnRUeXBlICYmIHRhc2subGlzdGVuZXJGbiA9PT0gbGlzdGVuZXJGbiAmJiB0YXNrLmNhcHR1cmUgPT09IGNhcHR1cmUpIHtcbiAgICAgICAgcmV0dXJuIF9pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ2FwdHVyZShvcHRpb25zKSB7XG4gICAgdmFyIGNhcHR1cmU7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdib29sZWFuJykge1xuICAgICAgY2FwdHVyZSA9IG9wdGlvbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhcHR1cmUgPSBvcHRpb25zID8gISFvcHRpb25zLmNhcHR1cmUgOiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FwdHVyZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUxpc3RlbmVyV3JhcHBlcih0YXJnZXQsIGV2ZW50VHlwZSwgbGlzdGVuZXJGbiwgb3B0aW9ucykge1xuICAgIHZhciBldmVudFN5bWJvbCA9IGV2ZW50VHlwZVN5bWJvbHNbZXZlbnRUeXBlXTtcbiAgICBpZiAoIWV2ZW50U3ltYm9sKSByZXR1cm4gbGlzdGVuZXJGbjtcbiAgICB2YXIgZXhpc3RpbmdUYXNrcyA9IHRhcmdldFtldmVudFN5bWJvbF07XG4gICAgdmFyIGNhcHR1cmUgPSBpc0NhcHR1cmUob3B0aW9ucyk7XG5cbiAgICBpZiAoZXhpc3RpbmdUYXNrcykge1xuICAgICAgdmFyIHRhc2tJbmRleCA9IGZpbmRUYXNrSW5kZXgoZXhpc3RpbmdUYXNrcywgZXZlbnRUeXBlLCBsaXN0ZW5lckZuLCBjYXB0dXJlKTtcblxuICAgICAgaWYgKHRhc2tJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdmFyIF90YXNrID0gZXhpc3RpbmdUYXNrc1t0YXNrSW5kZXhdO1xuICAgICAgICByZXR1cm4gX3Rhc2sud3JhcHBpbmdGbjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXhpc3RpbmdUYXNrcyA9IHRhcmdldFtldmVudFN5bWJvbF0gPSBbXTtcbiAgICB9XG5cbiAgICB2YXIgdGFzayA9IHtcbiAgICAgIHNvdXJjZTogRVZFTlRfVEFSR0VULFxuICAgICAgZXZlbnRUeXBlOiBldmVudFR5cGUsXG4gICAgICBsaXN0ZW5lckZuOiBsaXN0ZW5lckZuLFxuICAgICAgY2FwdHVyZTogY2FwdHVyZSxcbiAgICAgIHdyYXBwaW5nRm46IHdyYXBwaW5nRm5cbiAgICB9O1xuICAgIGV4aXN0aW5nVGFza3MucHVzaCh0YXNrKTtcblxuICAgIGZ1bmN0aW9uIHdyYXBwaW5nRm4oKSB7XG4gICAgICB2YXIgZXZlbnQgPSBhcmd1bWVudHNbMF07XG4gICAgICB0YXNrLnRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgIGNhbGxiYWNrKFNDSEVEVUxFLCB0YXNrKTtcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGxpc3RlbmVyRm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGNhbGxiYWNrKElOVk9LRSwgdGFzayk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdyYXBwaW5nRm47XG4gIH1cblxuICBmdW5jdGlvbiBnZXRXcmFwcGluZ0ZuKHRhcmdldCwgZXZlbnRUeXBlLCBsaXN0ZW5lckZuLCBvcHRpb25zKSB7XG4gICAgdmFyIGV2ZW50U3ltYm9sID0gZXZlbnRUeXBlU3ltYm9sc1tldmVudFR5cGVdO1xuICAgIHZhciBleGlzdGluZ1Rhc2tzID0gdGFyZ2V0W2V2ZW50U3ltYm9sXTtcblxuICAgIGlmIChleGlzdGluZ1Rhc2tzKSB7XG4gICAgICB2YXIgY2FwdHVyZSA9IGlzQ2FwdHVyZShvcHRpb25zKTtcbiAgICAgIHZhciB0YXNrSW5kZXggPSBmaW5kVGFza0luZGV4KGV4aXN0aW5nVGFza3MsIGV2ZW50VHlwZSwgbGlzdGVuZXJGbiwgY2FwdHVyZSk7XG5cbiAgICAgIGlmICh0YXNrSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHZhciB0YXNrID0gZXhpc3RpbmdUYXNrc1t0YXNrSW5kZXhdO1xuICAgICAgICBleGlzdGluZ1Rhc2tzLnNwbGljZSh0YXNrSW5kZXgsIDEpO1xuXG4gICAgICAgIGlmIChleGlzdGluZ1Rhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRhcmdldFtldmVudFN5bWJvbF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFzay53cmFwcGluZ0ZuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaXN0ZW5lckZuO1xuICB9XG5cbiAgcHJvdG9bQUREX0VWRU5UX0xJU1RFTkVSX1NUUl0gPSBmdW5jdGlvbiAoZXZlbnRUeXBlLCBsaXN0ZW5lckZuLCBvcHRpb25zT3JDYXB0dXJlKSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXM7XG5cbiAgICBpZiAoIXNob3VsZEluc3RydW1lbnRFdmVudCh0YXJnZXQsIGV2ZW50VHlwZSwgbGlzdGVuZXJGbikpIHtcbiAgICAgIHJldHVybiBuYXRpdmVBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRhcmdldCwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICB2YXIgd3JhcHBpbmdMaXN0ZW5lckZuID0gY3JlYXRlTGlzdGVuZXJXcmFwcGVyKHRhcmdldCwgZXZlbnRUeXBlLCBsaXN0ZW5lckZuLCBvcHRpb25zT3JDYXB0dXJlKTtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgYXJnc1sxXSA9IHdyYXBwaW5nTGlzdGVuZXJGbjtcbiAgICByZXR1cm4gbmF0aXZlQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0YXJnZXQsIGFyZ3MpO1xuICB9O1xuXG4gIHByb3RvW1JFTU9WRV9FVkVOVF9MSVNURU5FUl9TVFJdID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXJGbiwgb3B0aW9uc09yQ2FwdHVyZSkge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzO1xuXG4gICAgaWYgKCFzaG91bGRJbnN0cnVtZW50RXZlbnQodGFyZ2V0LCBldmVudFR5cGUsIGxpc3RlbmVyRm4pKSB7XG4gICAgICByZXR1cm4gbmF0aXZlUmVtb3ZlRXZlbnRMaXN0ZW5lci5hcHBseSh0YXJnZXQsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgdmFyIHdyYXBwaW5nRm4gPSBnZXRXcmFwcGluZ0ZuKHRhcmdldCwgZXZlbnRUeXBlLCBsaXN0ZW5lckZuLCBvcHRpb25zT3JDYXB0dXJlKTtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgYXJnc1sxXSA9IHdyYXBwaW5nRm47XG4gICAgcmV0dXJuIG5hdGl2ZVJlbW92ZUV2ZW50TGlzdGVuZXIuYXBwbHkodGFyZ2V0LCBhcmdzKTtcbiAgfTtcbn0iLCJpbXBvcnQgeyBQcm9taXNlIH0gZnJvbSAnLi4vcG9seWZpbGxzJztcbmltcG9ydCB7IGdsb2JhbFN0YXRlIH0gZnJvbSAnLi9wYXRjaC11dGlscyc7XG5pbXBvcnQgeyBTQ0hFRFVMRSwgSU5WT0tFLCBGRVRDSCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBzY2hlZHVsZU1pY3JvVGFzayB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IGlzRmV0Y2hTdXBwb3J0ZWQgfSBmcm9tICcuLi9odHRwL2ZldGNoJztcbmV4cG9ydCBmdW5jdGlvbiBwYXRjaEZldGNoKGNhbGxiYWNrKSB7XG4gIGlmICghaXNGZXRjaFN1cHBvcnRlZCgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGVUYXNrKHRhc2spIHtcbiAgICB0YXNrLnN0YXRlID0gU0NIRURVTEU7XG4gICAgY2FsbGJhY2soU0NIRURVTEUsIHRhc2spO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlVGFzayh0YXNrKSB7XG4gICAgdGFzay5zdGF0ZSA9IElOVk9LRTtcbiAgICBjYWxsYmFjayhJTlZPS0UsIHRhc2spO1xuICB9XG5cbiAgdmFyIG5hdGl2ZUZldGNoID0gd2luZG93LmZldGNoO1xuXG4gIHdpbmRvdy5mZXRjaCA9IGZ1bmN0aW9uIChpbnB1dCwgaW5pdCkge1xuICAgIHZhciBmZXRjaFNlbGYgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciByZXF1ZXN0LCB1cmw7XG5cbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KTtcbiAgICAgIHVybCA9IGlucHV0O1xuICAgIH0gZWxzZSBpZiAoaW5wdXQpIHtcbiAgICAgIHJlcXVlc3QgPSBpbnB1dDtcbiAgICAgIHVybCA9IHJlcXVlc3QudXJsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmF0aXZlRmV0Y2guYXBwbHkoZmV0Y2hTZWxmLCBhcmdzKTtcbiAgICB9XG5cbiAgICB2YXIgdGFzayA9IHtcbiAgICAgIHNvdXJjZTogRkVUQ0gsXG4gICAgICBzdGF0ZTogJycsXG4gICAgICB0eXBlOiAnbWFjcm9UYXNrJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGFyZ2V0OiByZXF1ZXN0LFxuICAgICAgICBtZXRob2Q6IHJlcXVlc3QubWV0aG9kLFxuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgYWJvcnRlZDogZmFsc2VcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBnbG9iYWxTdGF0ZS5mZXRjaEluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgc2NoZWR1bGVUYXNrKHRhc2spO1xuICAgICAgdmFyIHByb21pc2U7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHByb21pc2UgPSBuYXRpdmVGZXRjaC5hcHBseShmZXRjaFNlbGYsIFtyZXF1ZXN0XSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB0YXNrLmRhdGEuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgaW52b2tlVGFzayh0YXNrKTtcbiAgICAgICAgZ2xvYmFsU3RhdGUuZmV0Y2hJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgc2NoZWR1bGVNaWNyb1Rhc2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRhc2suZGF0YS5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICAgIGludm9rZVRhc2sodGFzayk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIHNjaGVkdWxlTWljcm9UYXNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0YXNrLmRhdGEuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICBpbnZva2VUYXNrKHRhc2spO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgZ2xvYmFsU3RhdGUuZmV0Y2hJblByb2dyZXNzID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG59IiwiaW1wb3J0IHsgSU5WT0tFLCBISVNUT1JZIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmV4cG9ydCBmdW5jdGlvbiBwYXRjaEhpc3RvcnkoY2FsbGJhY2spIHtcbiAgaWYgKCF3aW5kb3cuaGlzdG9yeSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBuYXRpdmVQdXNoU3RhdGUgPSBoaXN0b3J5LnB1c2hTdGF0ZTtcblxuICBpZiAodHlwZW9mIG5hdGl2ZVB1c2hTdGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGhpc3RvcnkucHVzaFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlLCB0aXRsZSwgdXJsKSB7XG4gICAgICB2YXIgdGFzayA9IHtcbiAgICAgICAgc291cmNlOiBISVNUT1JZLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICB1cmw6IHVybFxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2FsbGJhY2soSU5WT0tFLCB0YXNrKTtcbiAgICAgIG5hdGl2ZVB1c2hTdGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cbn0iLCJpbXBvcnQgeyBwYXRjaFhNTEh0dHBSZXF1ZXN0IH0gZnJvbSAnLi94aHItcGF0Y2gnO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCB9IGZyb20gJy4vZmV0Y2gtcGF0Y2gnO1xuaW1wb3J0IHsgcGF0Y2hIaXN0b3J5IH0gZnJvbSAnLi9oaXN0b3J5LXBhdGNoJztcbmltcG9ydCB7IHBhdGNoRXZlbnRUYXJnZXQgfSBmcm9tICcuL2V2ZW50LXRhcmdldC1wYXRjaCc7XG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4uL2V2ZW50LWhhbmRsZXInO1xuaW1wb3J0IHsgSElTVE9SWSwgRkVUQ0gsIFhNTEhUVFBSRVFVRVNULCBFVkVOVF9UQVJHRVQgfSBmcm9tICcuLi9jb25zdGFudHMnO1xudmFyIHBhdGNoRXZlbnRIYW5kbGVyID0gbmV3IEV2ZW50SGFuZGxlcigpO1xudmFyIGFscmVhZHlQYXRjaGVkID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHBhdGNoQWxsKCkge1xuICBpZiAoIWFscmVhZHlQYXRjaGVkKSB7XG4gICAgYWxyZWFkeVBhdGNoZWQgPSB0cnVlO1xuICAgIHBhdGNoWE1MSHR0cFJlcXVlc3QoZnVuY3Rpb24gKGV2ZW50LCB0YXNrKSB7XG4gICAgICBwYXRjaEV2ZW50SGFuZGxlci5zZW5kKFhNTEhUVFBSRVFVRVNULCBbZXZlbnQsIHRhc2tdKTtcbiAgICB9KTtcbiAgICBwYXRjaEZldGNoKGZ1bmN0aW9uIChldmVudCwgdGFzaykge1xuICAgICAgcGF0Y2hFdmVudEhhbmRsZXIuc2VuZChGRVRDSCwgW2V2ZW50LCB0YXNrXSk7XG4gICAgfSk7XG4gICAgcGF0Y2hIaXN0b3J5KGZ1bmN0aW9uIChldmVudCwgdGFzaykge1xuICAgICAgcGF0Y2hFdmVudEhhbmRsZXIuc2VuZChISVNUT1JZLCBbZXZlbnQsIHRhc2tdKTtcbiAgICB9KTtcbiAgICBwYXRjaEV2ZW50VGFyZ2V0KGZ1bmN0aW9uIChldmVudCwgdGFzaykge1xuICAgICAgcGF0Y2hFdmVudEhhbmRsZXIuc2VuZChFVkVOVF9UQVJHRVQsIFtldmVudCwgdGFza10pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHBhdGNoRXZlbnRIYW5kbGVyO1xufVxuXG5leHBvcnQgeyBwYXRjaEFsbCwgcGF0Y2hFdmVudEhhbmRsZXIgfTsiLCJleHBvcnQgdmFyIGdsb2JhbFN0YXRlID0ge1xuICBmZXRjaEluUHJvZ3Jlc3M6IGZhbHNlXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGFwbVN5bWJvbChuYW1lKSB7XG4gIHJldHVybiAnX19hcG1fc3ltYm9sX18nICsgbmFtZTtcbn1cblxuZnVuY3Rpb24gaXNQcm9wZXJ0eVdyaXRhYmxlKHByb3BlcnR5RGVzYykge1xuICBpZiAoIXByb3BlcnR5RGVzYykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHByb3BlcnR5RGVzYy53cml0YWJsZSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gISh0eXBlb2YgcHJvcGVydHlEZXNjLmdldCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgcHJvcGVydHlEZXNjLnNldCA9PT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hPcmlnaW5Ub1BhdGNoZWQocGF0Y2hlZCwgb3JpZ2luYWwpIHtcbiAgcGF0Y2hlZFthcG1TeW1ib2woJ09yaWdpbmFsRGVsZWdhdGUnKV0gPSBvcmlnaW5hbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoTWV0aG9kKHRhcmdldCwgbmFtZSwgcGF0Y2hGbikge1xuICB2YXIgcHJvdG8gPSB0YXJnZXQ7XG5cbiAgd2hpbGUgKHByb3RvICYmICFwcm90by5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgfVxuXG4gIGlmICghcHJvdG8gJiYgdGFyZ2V0W25hbWVdKSB7XG4gICAgcHJvdG8gPSB0YXJnZXQ7XG4gIH1cblxuICB2YXIgZGVsZWdhdGVOYW1lID0gYXBtU3ltYm9sKG5hbWUpO1xuICB2YXIgZGVsZWdhdGU7XG5cbiAgaWYgKHByb3RvICYmICEoZGVsZWdhdGUgPSBwcm90b1tkZWxlZ2F0ZU5hbWVdKSkge1xuICAgIGRlbGVnYXRlID0gcHJvdG9bZGVsZWdhdGVOYW1lXSA9IHByb3RvW25hbWVdO1xuICAgIHZhciBkZXNjID0gcHJvdG8gJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgbmFtZSk7XG5cbiAgICBpZiAoaXNQcm9wZXJ0eVdyaXRhYmxlKGRlc2MpKSB7XG4gICAgICB2YXIgcGF0Y2hEZWxlZ2F0ZSA9IHBhdGNoRm4oZGVsZWdhdGUsIGRlbGVnYXRlTmFtZSwgbmFtZSk7XG5cbiAgICAgIHByb3RvW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcGF0Y2hEZWxlZ2F0ZSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcblxuICAgICAgYXR0YWNoT3JpZ2luVG9QYXRjaGVkKHByb3RvW25hbWVdLCBkZWxlZ2F0ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlbGVnYXRlO1xufVxuZXhwb3J0IHZhciBYSFJfSUdOT1JFID0gYXBtU3ltYm9sKCd4aHJJZ25vcmUnKTtcbmV4cG9ydCB2YXIgWEhSX1NZTkMgPSBhcG1TeW1ib2woJ3hoclN5bmMnKTtcbmV4cG9ydCB2YXIgWEhSX1VSTCA9IGFwbVN5bWJvbCgneGhyVVJMJyk7XG5leHBvcnQgdmFyIFhIUl9NRVRIT0QgPSBhcG1TeW1ib2woJ3hock1ldGhvZCcpOyIsImltcG9ydCB7IHBhdGNoTWV0aG9kLCBYSFJfU1lOQywgWEhSX1VSTCwgWEhSX01FVEhPRCwgWEhSX0lHTk9SRSB9IGZyb20gJy4vcGF0Y2gtdXRpbHMnO1xuaW1wb3J0IHsgU0NIRURVTEUsIElOVk9LRSwgWE1MSFRUUFJFUVVFU1QsIEFERF9FVkVOVF9MSVNURU5FUl9TVFIgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoWE1MSHR0cFJlcXVlc3QoY2FsbGJhY2spIHtcbiAgdmFyIFhNTEh0dHBSZXF1ZXN0UHJvdG90eXBlID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlO1xuXG4gIGlmICghWE1MSHR0cFJlcXVlc3RQcm90b3R5cGUgfHwgIVhNTEh0dHBSZXF1ZXN0UHJvdG90eXBlW0FERF9FVkVOVF9MSVNURU5FUl9TVFJdKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIFJFQURZX1NUQVRFX0NIQU5HRSA9ICdyZWFkeXN0YXRlY2hhbmdlJztcbiAgdmFyIExPQUQgPSAnbG9hZCc7XG4gIHZhciBFUlJPUiA9ICdlcnJvcic7XG4gIHZhciBUSU1FT1VUID0gJ3RpbWVvdXQnO1xuICB2YXIgQUJPUlQgPSAnYWJvcnQnO1xuXG4gIGZ1bmN0aW9uIGludm9rZVRhc2sodGFzaywgc3RhdHVzKSB7XG4gICAgaWYgKHRhc2suc3RhdGUgIT09IElOVk9LRSkge1xuICAgICAgdGFzay5zdGF0ZSA9IElOVk9LRTtcbiAgICAgIHRhc2suZGF0YS5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICBjYWxsYmFjayhJTlZPS0UsIHRhc2spO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlVGFzayh0YXNrKSB7XG4gICAgaWYgKHRhc2suc3RhdGUgPT09IFNDSEVEVUxFKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGFzay5zdGF0ZSA9IFNDSEVEVUxFO1xuICAgIGNhbGxiYWNrKFNDSEVEVUxFLCB0YXNrKTtcbiAgICB2YXIgdGFyZ2V0ID0gdGFzay5kYXRhLnRhcmdldDtcblxuICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVyKG5hbWUpIHtcbiAgICAgIHRhcmdldFtBRERfRVZFTlRfTElTVEVORVJfU1RSXShuYW1lLCBmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICB2YXIgdHlwZSA9IF9yZWYudHlwZTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gUkVBRFlfU1RBVEVfQ0hBTkdFKSB7XG4gICAgICAgICAgaWYgKHRhcmdldC5yZWFkeVN0YXRlID09PSA0ICYmIHRhcmdldC5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgICAgIGludm9rZVRhc2sodGFzaywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHN0YXR1cyA9IHR5cGUgPT09IExPQUQgPyAnc3VjY2VzcycgOiB0eXBlO1xuICAgICAgICAgIGludm9rZVRhc2sodGFzaywgc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXIoUkVBRFlfU1RBVEVfQ0hBTkdFKTtcbiAgICBhZGRMaXN0ZW5lcihMT0FEKTtcbiAgICBhZGRMaXN0ZW5lcihUSU1FT1VUKTtcbiAgICBhZGRMaXN0ZW5lcihFUlJPUik7XG4gICAgYWRkTGlzdGVuZXIoQUJPUlQpO1xuICB9XG5cbiAgdmFyIG9wZW5OYXRpdmUgPSBwYXRjaE1ldGhvZChYTUxIdHRwUmVxdWVzdFByb3RvdHlwZSwgJ29wZW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxmLCBhcmdzKSB7XG4gICAgICBpZiAoIXNlbGZbWEhSX0lHTk9SRV0pIHtcbiAgICAgICAgc2VsZltYSFJfTUVUSE9EXSA9IGFyZ3NbMF07XG4gICAgICAgIHNlbGZbWEhSX1VSTF0gPSBhcmdzWzFdO1xuICAgICAgICBzZWxmW1hIUl9TWU5DXSA9IGFyZ3NbMl0gPT09IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3Blbk5hdGl2ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9O1xuICB9KTtcbiAgdmFyIHNlbmROYXRpdmUgPSBwYXRjaE1ldGhvZChYTUxIdHRwUmVxdWVzdFByb3RvdHlwZSwgJ3NlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzZWxmLCBhcmdzKSB7XG4gICAgICBpZiAoc2VsZltYSFJfSUdOT1JFXSkge1xuICAgICAgICByZXR1cm4gc2VuZE5hdGl2ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRhc2sgPSB7XG4gICAgICAgIHNvdXJjZTogWE1MSFRUUFJFUVVFU1QsXG4gICAgICAgIHN0YXRlOiAnJyxcbiAgICAgICAgdHlwZTogJ21hY3JvVGFzaycsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0YXJnZXQ6IHNlbGYsXG4gICAgICAgICAgbWV0aG9kOiBzZWxmW1hIUl9NRVRIT0RdLFxuICAgICAgICAgIHN5bmM6IHNlbGZbWEhSX1NZTkNdLFxuICAgICAgICAgIHVybDogc2VsZltYSFJfVVJMXSxcbiAgICAgICAgICBzdGF0dXM6ICcnXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHNjaGVkdWxlVGFzayh0YXNrKTtcbiAgICAgICAgcmV0dXJuIHNlbmROYXRpdmUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGludm9rZVRhc2sodGFzaywgRVJST1IpO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSIsImltcG9ydCBQcm9taXNlUG9sbHlmaWxsIGZyb20gJ3Byb21pc2UtcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNCcm93c2VyIH0gZnJvbSAnLi91dGlscyc7XG52YXIgbG9jYWwgPSB7fTtcblxuaWYgKGlzQnJvd3Nlcikge1xuICBsb2NhbCA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gIGxvY2FsID0gc2VsZjtcbn1cblxudmFyIFByb21pc2UgPSAnUHJvbWlzZScgaW4gbG9jYWwgPyBsb2NhbC5Qcm9taXNlIDogUHJvbWlzZVBvbGx5ZmlsbDtcbmV4cG9ydCB7IFByb21pc2UgfTsiLCJ2YXIgUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFF1ZXVlKG9uRmx1c2gsIG9wdHMpIHtcbiAgICBpZiAob3B0cyA9PT0gdm9pZCAwKSB7XG4gICAgICBvcHRzID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5vbkZsdXNoID0gb25GbHVzaDtcbiAgICB0aGlzLml0ZW1zID0gW107XG4gICAgdGhpcy5xdWV1ZUxpbWl0ID0gb3B0cy5xdWV1ZUxpbWl0IHx8IC0xO1xuICAgIHRoaXMuZmx1c2hJbnRlcnZhbCA9IG9wdHMuZmx1c2hJbnRlcnZhbCB8fCAwO1xuICAgIHRoaXMudGltZW91dElkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFF1ZXVlLnByb3RvdHlwZTtcblxuICBfcHJvdG8uX3NldFRpbWVyID0gZnVuY3Rpb24gX3NldFRpbWVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLnRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLmZsdXNoKCk7XG4gICAgfSwgdGhpcy5mbHVzaEludGVydmFsKTtcbiAgfTtcblxuICBfcHJvdG8uX2NsZWFyID0gZnVuY3Rpb24gX2NsZWFyKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50aW1lb3V0SWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgdGhpcy50aW1lb3V0SWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5pdGVtcyA9IFtdO1xuICB9O1xuXG4gIF9wcm90by5mbHVzaCA9IGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHRoaXMub25GbHVzaCh0aGlzLml0ZW1zKTtcblxuICAgIHRoaXMuX2NsZWFyKCk7XG4gIH07XG5cbiAgX3Byb3RvLmFkZCA9IGZ1bmN0aW9uIGFkZChpdGVtKSB7XG4gICAgdGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xuXG4gICAgaWYgKHRoaXMucXVldWVMaW1pdCAhPT0gLTEgJiYgdGhpcy5pdGVtcy5sZW5ndGggPj0gdGhpcy5xdWV1ZUxpbWl0KSB7XG4gICAgICB0aGlzLmZsdXNoKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy50aW1lb3V0SWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuX3NldFRpbWVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBRdWV1ZTtcbn0oKTtcblxuZXhwb3J0IGRlZmF1bHQgUXVldWU7IiwidmFyIF9zZXJ2aWNlQ3JlYXRvcnM7XG5cbmltcG9ydCBBcG1TZXJ2ZXIgZnJvbSAnLi9hcG0tc2VydmVyJztcbmltcG9ydCBDb25maWdTZXJ2aWNlIGZyb20gJy4vY29uZmlnLXNlcnZpY2UnO1xuaW1wb3J0IExvZ2dpbmdTZXJ2aWNlIGZyb20gJy4vbG9nZ2luZy1zZXJ2aWNlJztcbmltcG9ydCB7IENPTkZJR19DSEFOR0UsIENPTkZJR19TRVJWSUNFLCBMT0dHSU5HX1NFUlZJQ0UsIEFQTV9TRVJWRVIgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBfX0RFVl9fIH0gZnJvbSAnLi4vc3RhdGUnO1xudmFyIHNlcnZpY2VDcmVhdG9ycyA9IChfc2VydmljZUNyZWF0b3JzID0ge30sIF9zZXJ2aWNlQ3JlYXRvcnNbQ09ORklHX1NFUlZJQ0VdID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IENvbmZpZ1NlcnZpY2UoKTtcbn0sIF9zZXJ2aWNlQ3JlYXRvcnNbTE9HR0lOR19TRVJWSUNFXSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBMb2dnaW5nU2VydmljZSh7XG4gICAgcHJlZml4OiAnW0VsYXN0aWMgQVBNXSAnXG4gIH0pO1xufSwgX3NlcnZpY2VDcmVhdG9yc1tBUE1fU0VSVkVSXSA9IGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gIHZhciBfZmFjdG9yeSRnZXRTZXJ2aWNlID0gZmFjdG9yeS5nZXRTZXJ2aWNlKFtDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFXSksXG4gICAgICBjb25maWdTZXJ2aWNlID0gX2ZhY3RvcnkkZ2V0U2VydmljZVswXSxcbiAgICAgIGxvZ2dpbmdTZXJ2aWNlID0gX2ZhY3RvcnkkZ2V0U2VydmljZVsxXTtcblxuICByZXR1cm4gbmV3IEFwbVNlcnZlcihjb25maWdTZXJ2aWNlLCBsb2dnaW5nU2VydmljZSk7XG59LCBfc2VydmljZUNyZWF0b3JzKTtcblxudmFyIFNlcnZpY2VGYWN0b3J5ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTZXJ2aWNlRmFjdG9yeSgpIHtcbiAgICB0aGlzLmluc3RhbmNlcyA9IHt9O1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBTZXJ2aWNlRmFjdG9yeS5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgdmFyIGNvbmZpZ1NlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoQ09ORklHX1NFUlZJQ0UpO1xuICAgIGNvbmZpZ1NlcnZpY2UuaW5pdCgpO1xuXG4gICAgdmFyIF90aGlzJGdldFNlcnZpY2UgPSB0aGlzLmdldFNlcnZpY2UoW0xPR0dJTkdfU0VSVklDRSwgQVBNX1NFUlZFUl0pLFxuICAgICAgICBsb2dnaW5nU2VydmljZSA9IF90aGlzJGdldFNlcnZpY2VbMF0sXG4gICAgICAgIGFwbVNlcnZlciA9IF90aGlzJGdldFNlcnZpY2VbMV07XG5cbiAgICBjb25maWdTZXJ2aWNlLmV2ZW50cy5vYnNlcnZlKENPTkZJR19DSEFOR0UsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBsb2dMZXZlbCA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdsb2dMZXZlbCcpO1xuICAgICAgbG9nZ2luZ1NlcnZpY2Uuc2V0TGV2ZWwobG9nTGV2ZWwpO1xuICAgIH0pO1xuICAgIGFwbVNlcnZlci5pbml0KCk7XG4gIH07XG5cbiAgX3Byb3RvLmdldFNlcnZpY2UgPSBmdW5jdGlvbiBnZXRTZXJ2aWNlKG5hbWUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCF0aGlzLmluc3RhbmNlc1tuYW1lXSkge1xuICAgICAgICBpZiAodHlwZW9mIHNlcnZpY2VDcmVhdG9yc1tuYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuaW5zdGFuY2VzW25hbWVdID0gc2VydmljZUNyZWF0b3JzW25hbWVdKHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGdldCBzZXJ2aWNlLCBObyBjcmVhdG9yIGZvcjogJyArIG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlc1tuYW1lXTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgIHJldHVybiBuYW1lLm1hcChmdW5jdGlvbiAobikge1xuICAgICAgICByZXR1cm4gX3RoaXMuZ2V0U2VydmljZShuKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU2VydmljZUZhY3Rvcnk7XG59KCk7XG5cbmV4cG9ydCB7IHNlcnZpY2VDcmVhdG9ycywgU2VydmljZUZhY3RvcnkgfTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aHJvdHRsZShmbiwgb25UaHJvdHRsZSwgb3B0cykge1xuICB2YXIgY29udGV4dCA9IHRoaXM7XG4gIHZhciBsaW1pdCA9IG9wdHMubGltaXQ7XG4gIHZhciBpbnRlcnZhbCA9IG9wdHMuaW50ZXJ2YWw7XG4gIHZhciBjb3VudGVyID0gMDtcbiAgdmFyIHRpbWVvdXRJZDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBjb3VudGVyKys7XG5cbiAgICBpZiAodHlwZW9mIHRpbWVvdXRJZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgdGltZW91dElkID0gdW5kZWZpbmVkO1xuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIGlmIChjb3VudGVyID4gbGltaXQgJiYgdHlwZW9mIG9uVGhyb3R0bGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBvblRocm90dGxlLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbn0iLCJpbXBvcnQgeyBLRVlXT1JEX0xJTUlUIH0gZnJvbSAnLi9jb25zdGFudHMnO1xudmFyIE1FVEFEQVRBX01PREVMID0ge1xuICBzZXJ2aWNlOiB7XG4gICAgbmFtZTogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICAgIHZlcnNpb246IHRydWUsXG4gICAgYWdlbnQ6IHtcbiAgICAgIHZlcnNpb246IFtLRVlXT1JEX0xJTUlULCB0cnVlXVxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQ6IHRydWVcbiAgfSxcbiAgbGFiZWxzOiB7XG4gICAgJyonOiB0cnVlXG4gIH1cbn07XG52YXIgUkVTUE9OU0VfTU9ERUwgPSB7XG4gICcqJzogdHJ1ZSxcbiAgaGVhZGVyczoge1xuICAgICcqJzogdHJ1ZVxuICB9XG59O1xudmFyIERFU1RJTkFUSU9OX01PREVMID0ge1xuICBhZGRyZXNzOiBbS0VZV09SRF9MSU1JVF0sXG4gIHNlcnZpY2U6IHtcbiAgICAnKic6IFtLRVlXT1JEX0xJTUlULCB0cnVlXVxuICB9XG59O1xudmFyIENPTlRFWFRfTU9ERUwgPSB7XG4gIHVzZXI6IHtcbiAgICBpZDogdHJ1ZSxcbiAgICBlbWFpbDogdHJ1ZSxcbiAgICB1c2VybmFtZTogdHJ1ZVxuICB9LFxuICB0YWdzOiB7XG4gICAgJyonOiB0cnVlXG4gIH0sXG4gIGh0dHA6IHtcbiAgICByZXNwb25zZTogUkVTUE9OU0VfTU9ERUxcbiAgfSxcbiAgZGVzdGluYXRpb246IERFU1RJTkFUSU9OX01PREVMLFxuICByZXNwb25zZTogUkVTUE9OU0VfTU9ERUxcbn07XG52YXIgU1BBTl9NT0RFTCA9IHtcbiAgbmFtZTogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICB0eXBlOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIGlkOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIHRyYWNlX2lkOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIHBhcmVudF9pZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICB0cmFuc2FjdGlvbl9pZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICBzdWJ0eXBlOiB0cnVlLFxuICBhY3Rpb246IHRydWUsXG4gIGNvbnRleHQ6IENPTlRFWFRfTU9ERUxcbn07XG52YXIgVFJBTlNBQ1RJT05fTU9ERUwgPSB7XG4gIG5hbWU6IHRydWUsXG4gIHBhcmVudF9pZDogdHJ1ZSxcbiAgdHlwZTogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICBpZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICB0cmFjZV9pZDogW0tFWVdPUkRfTElNSVQsIHRydWVdLFxuICBzcGFuX2NvdW50OiB7XG4gICAgc3RhcnRlZDogW0tFWVdPUkRfTElNSVQsIHRydWVdXG4gIH0sXG4gIGNvbnRleHQ6IENPTlRFWFRfTU9ERUxcbn07XG52YXIgRVJST1JfTU9ERUwgPSB7XG4gIGlkOiBbS0VZV09SRF9MSU1JVCwgdHJ1ZV0sXG4gIHRyYWNlX2lkOiB0cnVlLFxuICB0cmFuc2FjdGlvbl9pZDogdHJ1ZSxcbiAgcGFyZW50X2lkOiB0cnVlLFxuICBjdWxwcml0OiB0cnVlLFxuICBleGNlcHRpb246IHtcbiAgICB0eXBlOiB0cnVlXG4gIH0sXG4gIHRyYW5zYWN0aW9uOiB7XG4gICAgdHlwZTogdHJ1ZVxuICB9LFxuICBjb250ZXh0OiBDT05URVhUX01PREVMXG59O1xuXG5mdW5jdGlvbiB0cnVuY2F0ZSh2YWx1ZSwgbGltaXQsIHJlcXVpcmVkLCBwbGFjZWhvbGRlcikge1xuICBpZiAobGltaXQgPT09IHZvaWQgMCkge1xuICAgIGxpbWl0ID0gS0VZV09SRF9MSU1JVDtcbiAgfVxuXG4gIGlmIChyZXF1aXJlZCA9PT0gdm9pZCAwKSB7XG4gICAgcmVxdWlyZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGlmIChwbGFjZWhvbGRlciA9PT0gdm9pZCAwKSB7XG4gICAgcGxhY2Vob2xkZXIgPSAnTi9BJztcbiAgfVxuXG4gIGlmIChyZXF1aXJlZCAmJiBpc0VtcHR5KHZhbHVlKSkge1xuICAgIHZhbHVlID0gcGxhY2Vob2xkZXI7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZS5zdWJzdHJpbmcoMCwgbGltaXQpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJyB8fCB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlVmFsdWUodGFyZ2V0LCBrZXksIGN1cnJNb2RlbCkge1xuICB2YXIgdmFsdWUgPSB0cnVuY2F0ZSh0YXJnZXRba2V5XSwgY3Vyck1vZGVsWzBdLCBjdXJyTW9kZWxbMV0pO1xuXG4gIGlmIChpc0VtcHR5KHZhbHVlKSkge1xuICAgIGRlbGV0ZSB0YXJnZXRba2V5XTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0YXJnZXRba2V5XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZU1vZGVsKG1vZGVsLCB0YXJnZXQsIGNoaWxkVGFyZ2V0KSB7XG4gIGlmIChtb2RlbCA9PT0gdm9pZCAwKSB7XG4gICAgbW9kZWwgPSB7fTtcbiAgfVxuXG4gIGlmIChjaGlsZFRhcmdldCA9PT0gdm9pZCAwKSB7XG4gICAgY2hpbGRUYXJnZXQgPSB0YXJnZXQ7XG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG1vZGVsKTtcbiAgdmFyIGVtcHR5QXJyID0gW107XG5cbiAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoaSkge1xuICAgIHZhciBjdXJyS2V5ID0ga2V5c1tpXTtcbiAgICB2YXIgY3Vyck1vZGVsID0gbW9kZWxbY3VycktleV0gPT09IHRydWUgPyBlbXB0eUFyciA6IG1vZGVsW2N1cnJLZXldO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGN1cnJNb2RlbCkpIHtcbiAgICAgIHRydW5jYXRlTW9kZWwoY3Vyck1vZGVsLCB0YXJnZXQsIGNoaWxkVGFyZ2V0W2N1cnJLZXldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJLZXkgPT09ICcqJykge1xuICAgICAgICBPYmplY3Qua2V5cyhjaGlsZFRhcmdldCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGxhY2VWYWx1ZShjaGlsZFRhcmdldCwga2V5LCBjdXJyTW9kZWwpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2VWYWx1ZShjaGlsZFRhcmdldCwgY3VycktleSwgY3Vyck1vZGVsKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgX2xvb3AoaSk7XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5leHBvcnQgeyB0cnVuY2F0ZSwgdHJ1bmNhdGVNb2RlbCwgU1BBTl9NT0RFTCwgVFJBTlNBQ1RJT05fTU9ERUwsIEVSUk9SX01PREVMLCBNRVRBREFUQV9NT0RFTCwgUkVTUE9OU0VfTU9ERUwgfTsiLCJpbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuL3V0aWxzJztcblxuZnVuY3Rpb24gaXNEZWZhdWx0UG9ydChwb3J0LCBwcm90b2NvbCkge1xuICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgY2FzZSAnaHR0cDonOlxuICAgICAgcmV0dXJuIHBvcnQgPT09ICc4MCc7XG5cbiAgICBjYXNlICdodHRwczonOlxuICAgICAgcmV0dXJuIHBvcnQgPT09ICc0NDMnO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbnZhciBSVUxFUyA9IFtbJyMnLCAnaGFzaCddLCBbJz8nLCAncXVlcnknXSwgWycvJywgJ3BhdGgnXSwgWydAJywgJ2F1dGgnLCAxXSwgW05hTiwgJ2hvc3QnLCB1bmRlZmluZWQsIDFdXTtcbnZhciBQUk9UT0NPTF9SRUdFWCA9IC9eKFthLXpdW2EtejAtOS4rLV0qOik/KFxcL1xcLyk/KFtcXFNcXHNdKikvaTtcbmV4cG9ydCB2YXIgVXJsID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBVcmwodXJsKSB7XG4gICAgdmFyIF90aGlzJGV4dHJhY3RQcm90b2NvbCA9IHRoaXMuZXh0cmFjdFByb3RvY29sKHVybCB8fCAnJyksXG4gICAgICAgIHByb3RvY29sID0gX3RoaXMkZXh0cmFjdFByb3RvY29sLnByb3RvY29sLFxuICAgICAgICBhZGRyZXNzID0gX3RoaXMkZXh0cmFjdFByb3RvY29sLmFkZHJlc3MsXG4gICAgICAgIHNsYXNoZXMgPSBfdGhpcyRleHRyYWN0UHJvdG9jb2wuc2xhc2hlcztcblxuICAgIHZhciByZWxhdGl2ZSA9ICFwcm90b2NvbCAmJiAhc2xhc2hlcztcbiAgICB2YXIgbG9jYXRpb24gPSB0aGlzLmdldExvY2F0aW9uKCk7XG4gICAgdmFyIGluc3RydWN0aW9ucyA9IFJVTEVTLnNsaWNlKCk7XG4gICAgYWRkcmVzcyA9IGFkZHJlc3MucmVwbGFjZSgnXFxcXCcsICcvJyk7XG5cbiAgICBpZiAoIXNsYXNoZXMpIHtcbiAgICAgIGluc3RydWN0aW9uc1syXSA9IFtOYU4sICdwYXRoJ107XG4gICAgfVxuXG4gICAgdmFyIGluZGV4O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnN0cnVjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uc1tpXTtcbiAgICAgIHZhciBwYXJzZSA9IGluc3RydWN0aW9uWzBdO1xuICAgICAgdmFyIGtleSA9IGluc3RydWN0aW9uWzFdO1xuXG4gICAgICBpZiAodHlwZW9mIHBhcnNlID09PSAnc3RyaW5nJykge1xuICAgICAgICBpbmRleCA9IGFkZHJlc3MuaW5kZXhPZihwYXJzZSk7XG5cbiAgICAgICAgaWYgKH5pbmRleCkge1xuICAgICAgICAgIHZhciBpbnN0TGVuZ3RoID0gaW5zdHJ1Y3Rpb25bMl07XG5cbiAgICAgICAgICBpZiAoaW5zdExlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG5ld0luZGV4ID0gYWRkcmVzcy5sYXN0SW5kZXhPZihwYXJzZSk7XG4gICAgICAgICAgICBpbmRleCA9IE1hdGgubWF4KGluZGV4LCBuZXdJbmRleCk7XG4gICAgICAgICAgICB0aGlzW2tleV0gPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKGluZGV4ICsgaW5zdExlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXNba2V5XSA9IGFkZHJlc3Muc2xpY2UoaW5kZXgpO1xuICAgICAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1trZXldID0gYWRkcmVzcztcbiAgICAgICAgYWRkcmVzcyA9ICcnO1xuICAgICAgfVxuXG4gICAgICB0aGlzW2tleV0gPSB0aGlzW2tleV0gfHwgKHJlbGF0aXZlICYmIGluc3RydWN0aW9uWzNdID8gbG9jYXRpb25ba2V5XSB8fCAnJyA6ICcnKTtcbiAgICAgIGlmIChpbnN0cnVjdGlvblszXSkgdGhpc1trZXldID0gdGhpc1trZXldLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlICYmIHRoaXMucGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdGhpcy5wYXRoID0gJy8nICsgdGhpcy5wYXRoO1xuICAgIH1cblxuICAgIHRoaXMucmVsYXRpdmUgPSByZWxhdGl2ZTtcbiAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2wgfHwgbG9jYXRpb24ucHJvdG9jb2w7XG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdDtcbiAgICB0aGlzLnBvcnQgPSAnJztcblxuICAgIGlmICgvOlxcZCskLy50ZXN0KHRoaXMuaG9zdCkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuaG9zdC5zcGxpdCgnOicpO1xuICAgICAgdmFyIHBvcnQgPSB2YWx1ZS5wb3AoKTtcbiAgICAgIHZhciBob3N0bmFtZSA9IHZhbHVlLmpvaW4oJzonKTtcblxuICAgICAgaWYgKGlzRGVmYXVsdFBvcnQocG9ydCwgdGhpcy5wcm90b2NvbCkpIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gaG9zdG5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvcnQgPSBwb3J0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gaG9zdG5hbWU7XG4gICAgfVxuXG4gICAgdGhpcy5vcmlnaW4gPSB0aGlzLnByb3RvY29sICYmIHRoaXMuaG9zdCAmJiB0aGlzLnByb3RvY29sICE9PSAnZmlsZTonID8gdGhpcy5wcm90b2NvbCArICcvLycgKyB0aGlzLmhvc3QgOiAnbnVsbCc7XG4gICAgdGhpcy5ocmVmID0gdGhpcy50b1N0cmluZygpO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFVybC5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucHJvdG9jb2w7XG4gICAgcmVzdWx0ICs9ICcvLyc7XG5cbiAgICBpZiAodGhpcy5hdXRoKSB7XG4gICAgICB2YXIgUkVEQUNURUQgPSAnW1JFREFDVEVEXSc7XG4gICAgICB2YXIgdXNlcnBhc3MgPSB0aGlzLmF1dGguc3BsaXQoJzonKTtcbiAgICAgIHZhciB1c2VybmFtZSA9IHVzZXJwYXNzWzBdID8gUkVEQUNURUQgOiAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IHVzZXJwYXNzWzFdID8gJzonICsgUkVEQUNURUQgOiAnJztcbiAgICAgIHJlc3VsdCArPSB1c2VybmFtZSArIHBhc3N3b3JkICsgJ0AnO1xuICAgIH1cblxuICAgIHJlc3VsdCArPSB0aGlzLmhvc3Q7XG4gICAgcmVzdWx0ICs9IHRoaXMucGF0aDtcbiAgICByZXN1bHQgKz0gdGhpcy5xdWVyeTtcbiAgICByZXN1bHQgKz0gdGhpcy5oYXNoO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgX3Byb3RvLmdldExvY2F0aW9uID0gZnVuY3Rpb24gZ2V0TG9jYXRpb24oKSB7XG4gICAgdmFyIGdsb2JhbFZhciA9IHt9O1xuXG4gICAgaWYgKGlzQnJvd3Nlcikge1xuICAgICAgZ2xvYmFsVmFyID0gd2luZG93O1xuICAgIH1cblxuICAgIHJldHVybiBnbG9iYWxWYXIubG9jYXRpb247XG4gIH07XG5cbiAgX3Byb3RvLmV4dHJhY3RQcm90b2NvbCA9IGZ1bmN0aW9uIGV4dHJhY3RQcm90b2NvbCh1cmwpIHtcbiAgICB2YXIgbWF0Y2ggPSBQUk9UT0NPTF9SRUdFWC5leGVjKHVybCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3RvY29sOiBtYXRjaFsxXSA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiAnJyxcbiAgICAgIHNsYXNoZXM6ICEhbWF0Y2hbMl0sXG4gICAgICBhZGRyZXNzOiBtYXRjaFszXVxuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIFVybDtcbn0oKTtcbmV4cG9ydCBmdW5jdGlvbiBzbHVnaWZ5VXJsKHVybFN0ciwgZGVwdGgpIHtcbiAgaWYgKGRlcHRoID09PSB2b2lkIDApIHtcbiAgICBkZXB0aCA9IDI7XG4gIH1cblxuICB2YXIgcGFyc2VkVXJsID0gbmV3IFVybCh1cmxTdHIpO1xuICB2YXIgcXVlcnkgPSBwYXJzZWRVcmwucXVlcnksXG4gICAgICBwYXRoID0gcGFyc2VkVXJsLnBhdGg7XG4gIHZhciBwYXRoUGFydHMgPSBwYXRoLnN1YnN0cmluZygxKS5zcGxpdCgnLycpO1xuICB2YXIgcmVkYWN0U3RyaW5nID0gJzppZCc7XG4gIHZhciB3aWxkY2FyZCA9ICcqJztcbiAgdmFyIHNwZWNpYWxDaGFyc1JlZ2V4ID0gL1xcV3xfL2c7XG4gIHZhciBkaWdpdHNSZWdleCA9IC9bMC05XS9nO1xuICB2YXIgbG93ZXJDYXNlUmVnZXggPSAvW2Etel0vZztcbiAgdmFyIHVwcGVyQ2FzZVJlZ2V4ID0gL1tBLVpdL2c7XG4gIHZhciByZWRhY3RlZFBhcnRzID0gW107XG4gIHZhciByZWRhY3RlZEJlZm9yZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBwYXRoUGFydHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgdmFyIHBhcnQgPSBwYXRoUGFydHNbaW5kZXhdO1xuXG4gICAgaWYgKHJlZGFjdGVkQmVmb3JlIHx8IGluZGV4ID4gZGVwdGggLSAxKSB7XG4gICAgICBpZiAocGFydCkge1xuICAgICAgICByZWRhY3RlZFBhcnRzLnB1c2god2lsZGNhcmQpO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgbnVtYmVyT2ZTcGVjaWFsQ2hhcnMgPSAocGFydC5tYXRjaChzcGVjaWFsQ2hhcnNSZWdleCkgfHwgW10pLmxlbmd0aDtcblxuICAgIGlmIChudW1iZXJPZlNwZWNpYWxDaGFycyA+PSAyKSB7XG4gICAgICByZWRhY3RlZFBhcnRzLnB1c2gocmVkYWN0U3RyaW5nKTtcbiAgICAgIHJlZGFjdGVkQmVmb3JlID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBudW1iZXJPZkRpZ2l0cyA9IChwYXJ0Lm1hdGNoKGRpZ2l0c1JlZ2V4KSB8fCBbXSkubGVuZ3RoO1xuXG4gICAgaWYgKG51bWJlck9mRGlnaXRzID4gMyB8fCBwYXJ0Lmxlbmd0aCA+IDMgJiYgbnVtYmVyT2ZEaWdpdHMgLyBwYXJ0Lmxlbmd0aCA+PSAwLjMpIHtcbiAgICAgIHJlZGFjdGVkUGFydHMucHVzaChyZWRhY3RTdHJpbmcpO1xuICAgICAgcmVkYWN0ZWRCZWZvcmUgPSB0cnVlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIG51bWJlcm9mVXBwZXJDYXNlID0gKHBhcnQubWF0Y2godXBwZXJDYXNlUmVnZXgpIHx8IFtdKS5sZW5ndGg7XG4gICAgdmFyIG51bWJlcm9mTG93ZXJDYXNlID0gKHBhcnQubWF0Y2gobG93ZXJDYXNlUmVnZXgpIHx8IFtdKS5sZW5ndGg7XG4gICAgdmFyIGxvd2VyQ2FzZVJhdGUgPSBudW1iZXJvZkxvd2VyQ2FzZSAvIHBhcnQubGVuZ3RoO1xuICAgIHZhciB1cHBlckNhc2VSYXRlID0gbnVtYmVyb2ZVcHBlckNhc2UgLyBwYXJ0Lmxlbmd0aDtcblxuICAgIGlmIChwYXJ0Lmxlbmd0aCA+IDUgJiYgKHVwcGVyQ2FzZVJhdGUgPiAwLjMgJiYgdXBwZXJDYXNlUmF0ZSA8IDAuNiB8fCBsb3dlckNhc2VSYXRlID4gMC4zICYmIGxvd2VyQ2FzZVJhdGUgPCAwLjYpKSB7XG4gICAgICByZWRhY3RlZFBhcnRzLnB1c2gocmVkYWN0U3RyaW5nKTtcbiAgICAgIHJlZGFjdGVkQmVmb3JlID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHBhcnQgJiYgcmVkYWN0ZWRQYXJ0cy5wdXNoKHBhcnQpO1xuICB9XG5cbiAgdmFyIHJlZGFjdGVkID0gJy8nICsgKHJlZGFjdGVkUGFydHMubGVuZ3RoID49IDIgPyByZWRhY3RlZFBhcnRzLmpvaW4oJy8nKSA6IHJlZGFjdGVkUGFydHMuam9pbignJykpICsgKHF1ZXJ5ID8gJz97cXVlcnl9JyA6ICcnKTtcbiAgcmV0dXJuIHJlZGFjdGVkO1xufSIsImltcG9ydCB7IFByb21pc2UgfSBmcm9tICcuL3BvbHlmaWxscyc7XG52YXIgc2xpY2UgPSBbXS5zbGljZTtcbnZhciBpc0Jyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbnZhciBQRVJGID0gaXNCcm93c2VyICYmIHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBwZXJmb3JtYW5jZSA6IHt9O1xuXG5mdW5jdGlvbiBpc0NPUlNTdXBwb3J0ZWQoKSB7XG4gIHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJldHVybiAnd2l0aENyZWRlbnRpYWxzJyBpbiB4aHI7XG59XG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvSGV4KGJ1ZmZlcikge1xuICB2YXIgaGV4T2N0ZXRzID0gW107XG5cbiAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGJ1ZmZlci5sZW5ndGg7IF9pKyspIHtcbiAgICBoZXhPY3RldHMucHVzaChieXRlVG9IZXhbYnVmZmVyW19pXV0pO1xuICB9XG5cbiAgcmV0dXJuIGhleE9jdGV0cy5qb2luKCcnKTtcbn1cblxudmFyIGRlc3RpbmF0aW9uID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuXG5mdW5jdGlvbiBybmcoKSB7XG4gIGlmICh0eXBlb2YgY3J5cHRvICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhkZXN0aW5hdGlvbik7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1zQ3J5cHRvICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMoZGVzdGluYXRpb24pO1xuICB9XG5cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVJhbmRvbUlkKGxlbmd0aCkge1xuICB2YXIgaWQgPSBieXRlc1RvSGV4KHJuZygpKTtcbiAgcmV0dXJuIGlkLnN1YnN0cigwLCBsZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBnZXREdEhlYWRlclZhbHVlKHNwYW4pIHtcbiAgdmFyIGR0VmVyc2lvbiA9ICcwMCc7XG4gIHZhciBkdFVuU2FtcGxlZEZsYWdzID0gJzAwJztcbiAgdmFyIGR0U2FtcGxlZEZsYWdzID0gJzAxJztcblxuICBpZiAoc3BhbiAmJiBzcGFuLnRyYWNlSWQgJiYgc3Bhbi5pZCAmJiBzcGFuLnBhcmVudElkKSB7XG4gICAgdmFyIGZsYWdzID0gc3Bhbi5zYW1wbGVkID8gZHRTYW1wbGVkRmxhZ3MgOiBkdFVuU2FtcGxlZEZsYWdzO1xuICAgIHZhciBpZCA9IHNwYW4uc2FtcGxlZCA/IHNwYW4uaWQgOiBzcGFuLnBhcmVudElkO1xuICAgIHJldHVybiBkdFZlcnNpb24gKyAnLScgKyBzcGFuLnRyYWNlSWQgKyAnLScgKyBpZCArICctJyArIGZsYWdzO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRHRIZWFkZXJWYWx1ZSh2YWx1ZSkge1xuICB2YXIgcGFyc2VkID0gL14oW1xcZGEtZl17Mn0pLShbXFxkYS1mXXszMn0pLShbXFxkYS1mXXsxNn0pLShbXFxkYS1mXXsyfSkkLy5leGVjKHZhbHVlKTtcblxuICBpZiAocGFyc2VkKSB7XG4gICAgdmFyIGZsYWdzID0gcGFyc2VkWzRdO1xuICAgIHZhciBzYW1wbGVkID0gZmxhZ3MgIT09ICcwMCc7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyYWNlSWQ6IHBhcnNlZFsyXSxcbiAgICAgIGlkOiBwYXJzZWRbM10sXG4gICAgICBzYW1wbGVkOiBzYW1wbGVkXG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0R0SGVhZGVyVmFsaWQoaGVhZGVyKSB7XG4gIHJldHVybiAvXltcXGRhLWZdezJ9LVtcXGRhLWZdezMyfS1bXFxkYS1mXXsxNn0tW1xcZGEtZl17Mn0kLy50ZXN0KGhlYWRlcikgJiYgaGVhZGVyLnNsaWNlKDMsIDM1KSAhPT0gJzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwJyAmJiBoZWFkZXIuc2xpY2UoMzYsIDUyKSAhPT0gJzAwMDAwMDAwMDAwMDAwMDAnO1xufVxuXG5mdW5jdGlvbiBnZXRUU0hlYWRlclZhbHVlKF9yZWYpIHtcbiAgdmFyIHNhbXBsZVJhdGUgPSBfcmVmLnNhbXBsZVJhdGU7XG5cbiAgaWYgKHR5cGVvZiBzYW1wbGVSYXRlICE9PSAnbnVtYmVyJyB8fCBTdHJpbmcoc2FtcGxlUmF0ZSkubGVuZ3RoID4gMjU2KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIE5BTUVTUEFDRSA9ICdlcyc7XG4gIHZhciBTRVBBUkFUT1IgPSAnPSc7XG4gIHJldHVybiBcIlwiICsgTkFNRVNQQUNFICsgU0VQQVJBVE9SICsgXCJzOlwiICsgc2FtcGxlUmF0ZTtcbn1cblxuZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih0YXJnZXQsIG5hbWUsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdGFyZ2V0LnNldFJlcXVlc3RIZWFkZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0YXJnZXQuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAodGFyZ2V0LmhlYWRlcnMgJiYgdHlwZW9mIHRhcmdldC5oZWFkZXJzLmFwcGVuZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRhcmdldC5oZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0W25hbWVdID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tTYW1lT3JpZ2luKHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHZhciBpc1NhbWUgPSBmYWxzZTtcblxuICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycpIHtcbiAgICBpc1NhbWUgPSBzb3VyY2UgPT09IHRhcmdldDtcbiAgfSBlbHNlIGlmICh0YXJnZXQgJiYgdHlwZW9mIHRhcmdldC50ZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaXNTYW1lID0gdGFyZ2V0LnRlc3Qoc291cmNlKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRhcmdldCkpIHtcbiAgICB0YXJnZXQuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCFpc1NhbWUpIHtcbiAgICAgICAgaXNTYW1lID0gY2hlY2tTYW1lT3JpZ2luKHNvdXJjZSwgdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gaXNTYW1lO1xufVxuXG5mdW5jdGlvbiBpc1BsYXRmb3JtU3VwcG9ydGVkKCkge1xuICByZXR1cm4gaXNCcm93c2VyICYmIHR5cGVvZiBTZXQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIEpTT04uc3RyaW5naWZ5ID09PSAnZnVuY3Rpb24nICYmIFBFUkYgJiYgdHlwZW9mIFBFUkYubm93ID09PSAnZnVuY3Rpb24nICYmIGlzQ09SU1N1cHBvcnRlZCgpO1xufVxuXG5mdW5jdGlvbiBzZXRMYWJlbChrZXksIHZhbHVlLCBvYmopIHtcbiAgaWYgKCFvYmogfHwgIWtleSkgcmV0dXJuO1xuICB2YXIgc2tleSA9IHJlbW92ZUludmFsaWRDaGFycyhrZXkpO1xuICB2YXIgdmFsdWVUeXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQgJiYgdmFsdWVUeXBlICE9PSAnYm9vbGVhbicgJiYgdmFsdWVUeXBlICE9PSAnbnVtYmVyJykge1xuICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKTtcbiAgfVxuXG4gIG9ialtza2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBnZXRTZXJ2ZXJUaW1pbmdJbmZvKHNlcnZlclRpbWluZ0VudHJpZXMpIHtcbiAgaWYgKHNlcnZlclRpbWluZ0VudHJpZXMgPT09IHZvaWQgMCkge1xuICAgIHNlcnZlclRpbWluZ0VudHJpZXMgPSBbXTtcbiAgfVxuXG4gIHZhciBzZXJ2ZXJUaW1pbmdJbmZvID0gW107XG4gIHZhciBlbnRyeVNlcGFyYXRvciA9ICcsICc7XG4gIHZhciB2YWx1ZVNlcGFyYXRvciA9ICc7JztcblxuICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBzZXJ2ZXJUaW1pbmdFbnRyaWVzLmxlbmd0aDsgX2kyKyspIHtcbiAgICB2YXIgX3NlcnZlclRpbWluZ0VudHJpZXMkID0gc2VydmVyVGltaW5nRW50cmllc1tfaTJdLFxuICAgICAgICBuYW1lID0gX3NlcnZlclRpbWluZ0VudHJpZXMkLm5hbWUsXG4gICAgICAgIGR1cmF0aW9uID0gX3NlcnZlclRpbWluZ0VudHJpZXMkLmR1cmF0aW9uLFxuICAgICAgICBkZXNjcmlwdGlvbiA9IF9zZXJ2ZXJUaW1pbmdFbnRyaWVzJC5kZXNjcmlwdGlvbjtcbiAgICB2YXIgdGltaW5nVmFsdWUgPSBuYW1lO1xuXG4gICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICB0aW1pbmdWYWx1ZSArPSB2YWx1ZVNlcGFyYXRvciArICdkZXNjPScgKyBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoZHVyYXRpb24pIHtcbiAgICAgIHRpbWluZ1ZhbHVlICs9IHZhbHVlU2VwYXJhdG9yICsgJ2R1cj0nICsgZHVyYXRpb247XG4gICAgfVxuXG4gICAgc2VydmVyVGltaW5nSW5mby5wdXNoKHRpbWluZ1ZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiBzZXJ2ZXJUaW1pbmdJbmZvLmpvaW4oZW50cnlTZXBhcmF0b3IpO1xufVxuXG5mdW5jdGlvbiBnZXRUaW1lT3JpZ2luKCkge1xuICByZXR1cm4gUEVSRi50aW1pbmcuZmV0Y2hTdGFydDtcbn1cblxuZnVuY3Rpb24gc3RyaXBRdWVyeVN0cmluZ0Zyb21VcmwodXJsKSB7XG4gIHJldHVybiB1cmwgJiYgdXJsLnNwbGl0KCc/JylbMF07XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGJhc2VFeHRlbmQoZHN0LCBvYmpzLCBkZWVwKSB7XG4gIGZvciAodmFyIGkgPSAwLCBpaSA9IG9ianMubGVuZ3RoOyBpIDwgaWk7ICsraSkge1xuICAgIHZhciBvYmogPSBvYmpzW2ldO1xuICAgIGlmICghaXNPYmplY3Qob2JqKSAmJiAhaXNGdW5jdGlvbihvYmopKSBjb250aW51ZTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgICBmb3IgKHZhciBqID0gMCwgamogPSBrZXlzLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2pdO1xuICAgICAgdmFyIHNyYyA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoZGVlcCAmJiBpc09iamVjdChzcmMpKSB7XG4gICAgICAgIGlmICghaXNPYmplY3QoZHN0W2tleV0pKSBkc3Rba2V5XSA9IEFycmF5LmlzQXJyYXkoc3JjKSA/IFtdIDoge307XG4gICAgICAgIGJhc2VFeHRlbmQoZHN0W2tleV0sIFtzcmNdLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkc3Rba2V5XSA9IHNyYztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZHN0O1xufVxuXG5mdW5jdGlvbiBnZXRFbGFzdGljU2NyaXB0KCkge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzY3JpcHRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHNjID0gc2NyaXB0c1tpXTtcblxuICAgICAgaWYgKHNjLnNyYy5pbmRleE9mKCdlbGFzdGljJykgPiAwKSB7XG4gICAgICAgIHJldHVybiBzYztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFNjcmlwdCgpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgY3VycmVudFNjcmlwdCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ7XG5cbiAgICBpZiAoIWN1cnJlbnRTY3JpcHQpIHtcbiAgICAgIHJldHVybiBnZXRFbGFzdGljU2NyaXB0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN1cnJlbnRTY3JpcHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0ZW5kKGRzdCkge1xuICByZXR1cm4gYmFzZUV4dGVuZChkc3QsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBtZXJnZShkc3QpIHtcbiAgcmV0dXJuIGJhc2VFeHRlbmQoZHN0LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIHRydWUpO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gZmluZChhcnJheSwgcHJlZGljYXRlLCB0aGlzQXJnKSB7XG4gIGlmIChhcnJheSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJyYXkgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICB9XG5cbiAgdmFyIG8gPSBPYmplY3QoYXJyYXkpO1xuICB2YXIgbGVuID0gby5sZW5ndGggPj4+IDA7XG5cbiAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdwcmVkaWNhdGUgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cblxuICB2YXIgayA9IDA7XG5cbiAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICB2YXIga1ZhbHVlID0gb1trXTtcblxuICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCBrVmFsdWUsIGssIG8pKSB7XG4gICAgICByZXR1cm4ga1ZhbHVlO1xuICAgIH1cblxuICAgIGsrKztcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUludmFsaWRDaGFycyhrZXkpIHtcbiAgcmV0dXJuIGtleS5yZXBsYWNlKC9bLipcIl0vZywgJ18nKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGF0ZXN0U3BhbihzcGFucywgdHlwZUZpbHRlcikge1xuICB2YXIgbGF0ZXN0U3BhbiA9IG51bGw7XG5cbiAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgc3BhbnMubGVuZ3RoOyBfaTMrKykge1xuICAgIHZhciBzcGFuID0gc3BhbnNbX2kzXTtcblxuICAgIGlmICh0eXBlRmlsdGVyICYmIHR5cGVGaWx0ZXIoc3Bhbi50eXBlKSAmJiAoIWxhdGVzdFNwYW4gfHwgbGF0ZXN0U3Bhbi5fZW5kIDwgc3Bhbi5fZW5kKSkge1xuICAgICAgbGF0ZXN0U3BhbiA9IHNwYW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGxhdGVzdFNwYW47XG59XG5cbmZ1bmN0aW9uIGdldExhdGVzdE5vblhIUlNwYW4oc3BhbnMpIHtcbiAgcmV0dXJuIGdldExhdGVzdFNwYW4oc3BhbnMsIGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0eXBlKS5pbmRleE9mKCdleHRlcm5hbCcpID09PSAtMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhdGVzdFhIUlNwYW4oc3BhbnMpIHtcbiAgcmV0dXJuIGdldExhdGVzdFNwYW4oc3BhbnMsIGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0eXBlKS5pbmRleE9mKCdleHRlcm5hbCcpICE9PSAtMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEVhcmxpZXN0U3BhbihzcGFucykge1xuICB2YXIgZWFybGllc3RTcGFuID0gc3BhbnNbMF07XG5cbiAgZm9yICh2YXIgX2k0ID0gMTsgX2k0IDwgc3BhbnMubGVuZ3RoOyBfaTQrKykge1xuICAgIHZhciBzcGFuID0gc3BhbnNbX2k0XTtcblxuICAgIGlmIChlYXJsaWVzdFNwYW4uX3N0YXJ0ID4gc3Bhbi5fc3RhcnQpIHtcbiAgICAgIGVhcmxpZXN0U3BhbiA9IHNwYW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVhcmxpZXN0U3Bhbjtcbn1cblxuZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gUEVSRi5ub3coKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGltZSh0aW1lKSB7XG4gIHJldHVybiB0eXBlb2YgdGltZSA9PT0gJ251bWJlcicgJiYgdGltZSA+PSAwID8gdGltZSA6IG5vdygpO1xufVxuXG5mdW5jdGlvbiBnZXREdXJhdGlvbihzdGFydCwgZW5kKSB7XG4gIGlmIChpc1VuZGVmaW5lZChlbmQpIHx8IGlzVW5kZWZpbmVkKHN0YXJ0KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlSW50KGVuZCAtIHN0YXJ0KTtcbn1cblxuZnVuY3Rpb24gc2NoZWR1bGVNYWNyb1Rhc2soY2FsbGJhY2spIHtcbiAgc2V0VGltZW91dChjYWxsYmFjaywgMCk7XG59XG5cbmZ1bmN0aW9uIHNjaGVkdWxlTWljcm9UYXNrKGNhbGxiYWNrKSB7XG4gIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBpc1BlcmZUaW1lbGluZVN1cHBvcnRlZCgpIHtcbiAgcmV0dXJuIHR5cGVvZiBQRVJGLmdldEVudHJpZXNCeVR5cGUgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzUGVyZlR5cGVTdXBwb3J0ZWQodHlwZSkge1xuICByZXR1cm4gdHlwZW9mIFBlcmZvcm1hbmNlT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnICYmIFBlcmZvcm1hbmNlT2JzZXJ2ZXIuc3VwcG9ydGVkRW50cnlUeXBlcyAmJiBQZXJmb3JtYW5jZU9ic2VydmVyLnN1cHBvcnRlZEVudHJ5VHlwZXMuaW5kZXhPZih0eXBlKSA+PSAwO1xufVxuXG5leHBvcnQgeyBleHRlbmQsIG1lcmdlLCBpc1VuZGVmaW5lZCwgbm9vcCwgYmFzZUV4dGVuZCwgYnl0ZXNUb0hleCwgaXNDT1JTU3VwcG9ydGVkLCBpc09iamVjdCwgaXNGdW5jdGlvbiwgaXNQbGF0Zm9ybVN1cHBvcnRlZCwgaXNEdEhlYWRlclZhbGlkLCBwYXJzZUR0SGVhZGVyVmFsdWUsIGdldFNlcnZlclRpbWluZ0luZm8sIGdldER0SGVhZGVyVmFsdWUsIGdldFRTSGVhZGVyVmFsdWUsIGdldEN1cnJlbnRTY3JpcHQsIGdldEVsYXN0aWNTY3JpcHQsIGdldFRpbWVPcmlnaW4sIGdlbmVyYXRlUmFuZG9tSWQsIGdldEVhcmxpZXN0U3BhbiwgZ2V0TGF0ZXN0Tm9uWEhSU3BhbiwgZ2V0TGF0ZXN0WEhSU3BhbiwgZ2V0RHVyYXRpb24sIGdldFRpbWUsIG5vdywgcm5nLCBjaGVja1NhbWVPcmlnaW4sIHNjaGVkdWxlTWFjcm9UYXNrLCBzY2hlZHVsZU1pY3JvVGFzaywgc2V0TGFiZWwsIHNldFJlcXVlc3RIZWFkZXIsIHN0cmlwUXVlcnlTdHJpbmdGcm9tVXJsLCBmaW5kLCByZW1vdmVJbnZhbGlkQ2hhcnMsIFBFUkYsIGlzUGVyZlRpbWVsaW5lU3VwcG9ydGVkLCBpc0Jyb3dzZXIsIGlzUGVyZlR5cGVTdXBwb3J0ZWQgfTsiLCJ2YXIgX2V4Y2x1ZGVkID0gW1widGFnc1wiXTtcblxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2Uoc291cmNlLCBleGNsdWRlZCkgeyBpZiAoc291cmNlID09IG51bGwpIHJldHVybiB7fTsgdmFyIHRhcmdldCA9IHt9OyB2YXIgc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7IHZhciBrZXksIGk7IGZvciAoaSA9IDA7IGkgPCBzb3VyY2VLZXlzLmxlbmd0aDsgaSsrKSB7IGtleSA9IHNvdXJjZUtleXNbaV07IGlmIChleGNsdWRlZC5pbmRleE9mKGtleSkgPj0gMCkgY29udGludWU7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5pbXBvcnQgeyBjcmVhdGVTdGFja1RyYWNlcywgZmlsdGVySW52YWxpZEZyYW1lcyB9IGZyb20gJy4vc3RhY2stdHJhY2UnO1xuaW1wb3J0IHsgZ2VuZXJhdGVSYW5kb21JZCwgbWVyZ2UsIGV4dGVuZCB9IGZyb20gJy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBnZXRQYWdlQ29udGV4dCB9IGZyb20gJy4uL2NvbW1vbi9jb250ZXh0JztcbmltcG9ydCB7IHRydW5jYXRlTW9kZWwsIEVSUk9SX01PREVMIH0gZnJvbSAnLi4vY29tbW9uL3RydW5jYXRlJztcbnZhciBJR05PUkVfS0VZUyA9IFsnc3RhY2snLCAnbWVzc2FnZSddO1xuXG5mdW5jdGlvbiBnZXRFcnJvclByb3BlcnRpZXMoZXJyb3IpIHtcbiAgdmFyIHByb3BlcnR5Rm91bmQgPSBmYWxzZTtcbiAgdmFyIHByb3BlcnRpZXMgPSB7fTtcbiAgT2JqZWN0LmtleXMoZXJyb3IpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChJR05PUkVfS0VZUy5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB2YWwgPSBlcnJvcltrZXldO1xuXG4gICAgaWYgKHZhbCA9PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsLnRvSVNPU3RyaW5nICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gICAgICB2YWwgPSB2YWwudG9JU09TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzW2tleV0gPSB2YWw7XG4gICAgcHJvcGVydHlGb3VuZCA9IHRydWU7XG4gIH0pO1xuXG4gIGlmIChwcm9wZXJ0eUZvdW5kKSB7XG4gICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gIH1cbn1cblxudmFyIEVycm9yTG9nZ2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRXJyb3JMb2dnaW5nKGFwbVNlcnZlciwgY29uZmlnU2VydmljZSwgdHJhbnNhY3Rpb25TZXJ2aWNlKSB7XG4gICAgdGhpcy5fYXBtU2VydmVyID0gYXBtU2VydmVyO1xuICAgIHRoaXMuX2NvbmZpZ1NlcnZpY2UgPSBjb25maWdTZXJ2aWNlO1xuICAgIHRoaXMuX3RyYW5zYWN0aW9uU2VydmljZSA9IHRyYW5zYWN0aW9uU2VydmljZTtcbiAgfVxuXG4gIHZhciBfcHJvdG8gPSBFcnJvckxvZ2dpbmcucHJvdG90eXBlO1xuXG4gIF9wcm90by5jcmVhdGVFcnJvckRhdGFNb2RlbCA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yRGF0YU1vZGVsKGVycm9yRXZlbnQpIHtcbiAgICB2YXIgZnJhbWVzID0gY3JlYXRlU3RhY2tUcmFjZXMoZXJyb3JFdmVudCk7XG4gICAgdmFyIGZpbHRlcmVkRnJhbWVzID0gZmlsdGVySW52YWxpZEZyYW1lcyhmcmFtZXMpO1xuICAgIHZhciBjdWxwcml0ID0gJyhpbmxpbmUgc2NyaXB0KSc7XG4gICAgdmFyIGxhc3RGcmFtZSA9IGZpbHRlcmVkRnJhbWVzW2ZpbHRlcmVkRnJhbWVzLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGxhc3RGcmFtZSAmJiBsYXN0RnJhbWUuZmlsZW5hbWUpIHtcbiAgICAgIGN1bHByaXQgPSBsYXN0RnJhbWUuZmlsZW5hbWU7XG4gICAgfVxuXG4gICAgdmFyIG1lc3NhZ2UgPSBlcnJvckV2ZW50Lm1lc3NhZ2UsXG4gICAgICAgIGVycm9yID0gZXJyb3JFdmVudC5lcnJvcjtcbiAgICB2YXIgZXJyb3JNZXNzYWdlID0gbWVzc2FnZTtcbiAgICB2YXIgZXJyb3JUeXBlID0gJyc7XG4gICAgdmFyIGVycm9yQ29udGV4dCA9IHt9O1xuXG4gICAgaWYgKGVycm9yICYmIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZSB8fCBlcnJvci5tZXNzYWdlO1xuICAgICAgZXJyb3JUeXBlID0gZXJyb3IubmFtZTtcbiAgICAgIHZhciBjdXN0b21Qcm9wZXJ0aWVzID0gZ2V0RXJyb3JQcm9wZXJ0aWVzKGVycm9yKTtcblxuICAgICAgaWYgKGN1c3RvbVByb3BlcnRpZXMpIHtcbiAgICAgICAgZXJyb3JDb250ZXh0LmN1c3RvbSA9IGN1c3RvbVByb3BlcnRpZXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFlcnJvclR5cGUpIHtcbiAgICAgIGlmIChlcnJvck1lc3NhZ2UgJiYgZXJyb3JNZXNzYWdlLmluZGV4T2YoJzonKSA+IC0xKSB7XG4gICAgICAgIGVycm9yVHlwZSA9IGVycm9yTWVzc2FnZS5zcGxpdCgnOicpWzBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjdXJyZW50VHJhbnNhY3Rpb24gPSB0aGlzLl90cmFuc2FjdGlvblNlcnZpY2UuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG5cbiAgICB2YXIgdHJhbnNhY3Rpb25Db250ZXh0ID0gY3VycmVudFRyYW5zYWN0aW9uID8gY3VycmVudFRyYW5zYWN0aW9uLmNvbnRleHQgOiB7fTtcblxuICAgIHZhciBfdGhpcyRfY29uZmlnU2VydmljZSQgPSB0aGlzLl9jb25maWdTZXJ2aWNlLmdldCgnY29udGV4dCcpLFxuICAgICAgICB0YWdzID0gX3RoaXMkX2NvbmZpZ1NlcnZpY2UkLnRhZ3MsXG4gICAgICAgIGNvbmZpZ0NvbnRleHQgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShfdGhpcyRfY29uZmlnU2VydmljZSQsIF9leGNsdWRlZCk7XG5cbiAgICB2YXIgcGFnZUNvbnRleHQgPSBnZXRQYWdlQ29udGV4dCgpO1xuICAgIHZhciBjb250ZXh0ID0gbWVyZ2Uoe30sIHBhZ2VDb250ZXh0LCB0cmFuc2FjdGlvbkNvbnRleHQsIGNvbmZpZ0NvbnRleHQsIGVycm9yQ29udGV4dCk7XG4gICAgdmFyIGVycm9yT2JqZWN0ID0ge1xuICAgICAgaWQ6IGdlbmVyYXRlUmFuZG9tSWQoKSxcbiAgICAgIGN1bHByaXQ6IGN1bHByaXQsXG4gICAgICBleGNlcHRpb246IHtcbiAgICAgICAgbWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICBzdGFja3RyYWNlOiBmaWx0ZXJlZEZyYW1lcyxcbiAgICAgICAgdHlwZTogZXJyb3JUeXBlXG4gICAgICB9LFxuICAgICAgY29udGV4dDogY29udGV4dFxuICAgIH07XG5cbiAgICBpZiAoY3VycmVudFRyYW5zYWN0aW9uKSB7XG4gICAgICBlcnJvck9iamVjdCA9IGV4dGVuZChlcnJvck9iamVjdCwge1xuICAgICAgICB0cmFjZV9pZDogY3VycmVudFRyYW5zYWN0aW9uLnRyYWNlSWQsXG4gICAgICAgIHBhcmVudF9pZDogY3VycmVudFRyYW5zYWN0aW9uLmlkLFxuICAgICAgICB0cmFuc2FjdGlvbl9pZDogY3VycmVudFRyYW5zYWN0aW9uLmlkLFxuICAgICAgICB0cmFuc2FjdGlvbjoge1xuICAgICAgICAgIHR5cGU6IGN1cnJlbnRUcmFuc2FjdGlvbi50eXBlLFxuICAgICAgICAgIHNhbXBsZWQ6IGN1cnJlbnRUcmFuc2FjdGlvbi5zYW1wbGVkXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVuY2F0ZU1vZGVsKEVSUk9SX01PREVMLCBlcnJvck9iamVjdCk7XG4gIH07XG5cbiAgX3Byb3RvLmxvZ0Vycm9yRXZlbnQgPSBmdW5jdGlvbiBsb2dFcnJvckV2ZW50KGVycm9yRXZlbnQpIHtcbiAgICBpZiAodHlwZW9mIGVycm9yRXZlbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGVycm9yT2JqZWN0ID0gdGhpcy5jcmVhdGVFcnJvckRhdGFNb2RlbChlcnJvckV2ZW50KTtcblxuICAgIGlmICh0eXBlb2YgZXJyb3JPYmplY3QuZXhjZXB0aW9uLm1lc3NhZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYXBtU2VydmVyLmFkZEVycm9yKGVycm9yT2JqZWN0KTtcbiAgfTtcblxuICBfcHJvdG8ucmVnaXN0ZXJMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGVycm9yRXZlbnQpIHtcbiAgICAgIHJldHVybiBfdGhpcy5sb2dFcnJvckV2ZW50KGVycm9yRXZlbnQpO1xuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCBmdW5jdGlvbiAocHJvbWlzZVJlamVjdGlvbkV2ZW50KSB7XG4gICAgICByZXR1cm4gX3RoaXMubG9nUHJvbWlzZUV2ZW50KHByb21pc2VSZWplY3Rpb25FdmVudCk7XG4gICAgfSk7XG4gIH07XG5cbiAgX3Byb3RvLmxvZ1Byb21pc2VFdmVudCA9IGZ1bmN0aW9uIGxvZ1Byb21pc2VFdmVudChwcm9taXNlUmVqZWN0aW9uRXZlbnQpIHtcbiAgICB2YXIgcHJlZml4ID0gJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbjogJztcbiAgICB2YXIgcmVhc29uID0gcHJvbWlzZVJlamVjdGlvbkV2ZW50LnJlYXNvbjtcblxuICAgIGlmIChyZWFzb24gPT0gbnVsbCkge1xuICAgICAgcmVhc29uID0gJzxubyByZWFzb24gc3BlY2lmaWVkPic7XG4gICAgfVxuXG4gICAgdmFyIGVycm9yRXZlbnQ7XG5cbiAgICBpZiAodHlwZW9mIHJlYXNvbi5tZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgdmFyIG5hbWUgPSByZWFzb24ubmFtZSA/IHJlYXNvbi5uYW1lICsgJzogJyA6ICcnO1xuICAgICAgZXJyb3JFdmVudCA9IHtcbiAgICAgICAgZXJyb3I6IHJlYXNvbixcbiAgICAgICAgbWVzc2FnZTogcHJlZml4ICsgbmFtZSArIHJlYXNvbi5tZXNzYWdlXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZWFzb24gPSB0eXBlb2YgcmVhc29uID09PSAnb2JqZWN0JyA/ICc8b2JqZWN0PicgOiB0eXBlb2YgcmVhc29uID09PSAnZnVuY3Rpb24nID8gJzxmdW5jdGlvbj4nIDogcmVhc29uO1xuICAgICAgZXJyb3JFdmVudCA9IHtcbiAgICAgICAgbWVzc2FnZTogcHJlZml4ICsgcmVhc29uXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMubG9nRXJyb3JFdmVudChlcnJvckV2ZW50KTtcbiAgfTtcblxuICBfcHJvdG8ubG9nRXJyb3IgPSBmdW5jdGlvbiBsb2dFcnJvcihtZXNzYWdlT3JFcnJvcikge1xuICAgIHZhciBlcnJvckV2ZW50ID0ge307XG5cbiAgICBpZiAodHlwZW9mIG1lc3NhZ2VPckVycm9yID09PSAnc3RyaW5nJykge1xuICAgICAgZXJyb3JFdmVudC5tZXNzYWdlID0gbWVzc2FnZU9yRXJyb3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yRXZlbnQuZXJyb3IgPSBtZXNzYWdlT3JFcnJvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sb2dFcnJvckV2ZW50KGVycm9yRXZlbnQpO1xuICB9O1xuXG4gIHJldHVybiBFcnJvckxvZ2dpbmc7XG59KCk7XG5cbmV4cG9ydCBkZWZhdWx0IEVycm9yTG9nZ2luZzsiLCJpbXBvcnQgRXJyb3JMb2dnaW5nIGZyb20gJy4vZXJyb3ItbG9nZ2luZyc7XG5pbXBvcnQgeyBDT05GSUdfU0VSVklDRSwgVFJBTlNBQ1RJT05fU0VSVklDRSwgQVBNX1NFUlZFUiB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgc2VydmljZUNyZWF0b3JzIH0gZnJvbSAnLi4vY29tbW9uL3NlcnZpY2UtZmFjdG9yeSc7XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyU2VydmljZXMoKSB7XG4gIHNlcnZpY2VDcmVhdG9yc1snRXJyb3JMb2dnaW5nJ10gPSBmdW5jdGlvbiAoc2VydmljZUZhY3RvcnkpIHtcbiAgICB2YXIgX3NlcnZpY2VGYWN0b3J5JGdldFNlID0gc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShbQVBNX1NFUlZFUiwgQ09ORklHX1NFUlZJQ0UsIFRSQU5TQUNUSU9OX1NFUlZJQ0VdKSxcbiAgICAgICAgYXBtU2VydmVyID0gX3NlcnZpY2VGYWN0b3J5JGdldFNlWzBdLFxuICAgICAgICBjb25maWdTZXJ2aWNlID0gX3NlcnZpY2VGYWN0b3J5JGdldFNlWzFdLFxuICAgICAgICB0cmFuc2FjdGlvblNlcnZpY2UgPSBfc2VydmljZUZhY3RvcnkkZ2V0U2VbMl07XG5cbiAgICByZXR1cm4gbmV3IEVycm9yTG9nZ2luZyhhcG1TZXJ2ZXIsIGNvbmZpZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSk7XG4gIH07XG59XG5cbmV4cG9ydCB7IHJlZ2lzdGVyU2VydmljZXMgfTsiLCJpbXBvcnQgc3RhY2tQYXJzZXIgZnJvbSAnZXJyb3Itc3RhY2stcGFyc2VyJztcblxuZnVuY3Rpb24gZmlsZVBhdGhUb0ZpbGVOYW1lKGZpbGVVcmwpIHtcbiAgdmFyIG9yaWdpbiA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gfHwgd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICh3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHdpbmRvdy5sb2NhdGlvbi5wb3J0IDogJycpO1xuXG4gIGlmIChmaWxlVXJsLmluZGV4T2Yob3JpZ2luKSA+IC0xKSB7XG4gICAgZmlsZVVybCA9IGZpbGVVcmwucmVwbGFjZShvcmlnaW4gKyAnLycsICcnKTtcbiAgfVxuXG4gIHJldHVybiBmaWxlVXJsO1xufVxuXG5mdW5jdGlvbiBjbGVhbkZpbGVQYXRoKGZpbGVQYXRoKSB7XG4gIGlmIChmaWxlUGF0aCA9PT0gdm9pZCAwKSB7XG4gICAgZmlsZVBhdGggPSAnJztcbiAgfVxuXG4gIGlmIChmaWxlUGF0aCA9PT0gJzxhbm9ueW1vdXM+Jykge1xuICAgIGZpbGVQYXRoID0gJyc7XG4gIH1cblxuICByZXR1cm4gZmlsZVBhdGg7XG59XG5cbmZ1bmN0aW9uIGlzRmlsZUlubGluZShmaWxlVXJsKSB7XG4gIGlmIChmaWxlVXJsKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoZmlsZVVybCkgPT09IDA7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0YWNrRnJhbWVzKHN0YWNrRnJhbWVzKSB7XG4gIHJldHVybiBzdGFja0ZyYW1lcy5tYXAoZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgaWYgKGZyYW1lLmZ1bmN0aW9uTmFtZSkge1xuICAgICAgZnJhbWUuZnVuY3Rpb25OYW1lID0gbm9ybWFsaXplRnVuY3Rpb25OYW1lKGZyYW1lLmZ1bmN0aW9uTmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyYW1lO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplRnVuY3Rpb25OYW1lKGZuTmFtZSkge1xuICB2YXIgcGFydHMgPSBmbk5hbWUuc3BsaXQoJy8nKTtcblxuICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgIGZuTmFtZSA9IFsnT2JqZWN0JywgcGFydHNbcGFydHMubGVuZ3RoIC0gMV1dLmpvaW4oJy4nKTtcbiAgfSBlbHNlIHtcbiAgICBmbk5hbWUgPSBwYXJ0c1swXTtcbiAgfVxuXG4gIGZuTmFtZSA9IGZuTmFtZS5yZXBsYWNlKC8uPCQvZ2ksICcuPGFub255bW91cz4nKTtcbiAgZm5OYW1lID0gZm5OYW1lLnJlcGxhY2UoL15Bbm9ueW1vdXMgZnVuY3Rpb24kLywgJzxhbm9ueW1vdXM+Jyk7XG4gIHBhcnRzID0gZm5OYW1lLnNwbGl0KCcuJyk7XG5cbiAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICBmbk5hbWUgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgfSBlbHNlIHtcbiAgICBmbk5hbWUgPSBwYXJ0c1swXTtcbiAgfVxuXG4gIHJldHVybiBmbk5hbWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGFja1RyYWNlcyhlcnJvckV2ZW50KSB7XG4gIHZhciBlcnJvciA9IGVycm9yRXZlbnQuZXJyb3IsXG4gICAgICBmaWxlbmFtZSA9IGVycm9yRXZlbnQuZmlsZW5hbWUsXG4gICAgICBsaW5lbm8gPSBlcnJvckV2ZW50LmxpbmVubyxcbiAgICAgIGNvbG5vID0gZXJyb3JFdmVudC5jb2xubztcbiAgdmFyIHN0YWNrVHJhY2VzID0gW107XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgdHJ5IHtcbiAgICAgIHN0YWNrVHJhY2VzID0gc3RhY2tQYXJzZXIucGFyc2UoZXJyb3IpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cblxuICBpZiAoc3RhY2tUcmFjZXMubGVuZ3RoID09PSAwKSB7XG4gICAgc3RhY2tUcmFjZXMgPSBbe1xuICAgICAgZmlsZU5hbWU6IGZpbGVuYW1lLFxuICAgICAgbGluZU51bWJlcjogbGluZW5vLFxuICAgICAgY29sdW1uTnVtYmVyOiBjb2xub1xuICAgIH1dO1xuICB9XG5cbiAgdmFyIG5vcm1hbGl6ZWRTdGFja1RyYWNlcyA9IG5vcm1hbGl6ZVN0YWNrRnJhbWVzKHN0YWNrVHJhY2VzKTtcbiAgcmV0dXJuIG5vcm1hbGl6ZWRTdGFja1RyYWNlcy5tYXAoZnVuY3Rpb24gKHN0YWNrKSB7XG4gICAgdmFyIGZpbGVOYW1lID0gc3RhY2suZmlsZU5hbWUsXG4gICAgICAgIGxpbmVOdW1iZXIgPSBzdGFjay5saW5lTnVtYmVyLFxuICAgICAgICBjb2x1bW5OdW1iZXIgPSBzdGFjay5jb2x1bW5OdW1iZXIsXG4gICAgICAgIF9zdGFjayRmdW5jdGlvbk5hbWUgPSBzdGFjay5mdW5jdGlvbk5hbWUsXG4gICAgICAgIGZ1bmN0aW9uTmFtZSA9IF9zdGFjayRmdW5jdGlvbk5hbWUgPT09IHZvaWQgMCA/ICc8YW5vbnltb3VzPicgOiBfc3RhY2skZnVuY3Rpb25OYW1lO1xuXG4gICAgaWYgKCFmaWxlTmFtZSAmJiAhbGluZU51bWJlcikge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGlmICghY29sdW1uTnVtYmVyICYmICFsaW5lTnVtYmVyKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgdmFyIGZpbGVQYXRoID0gY2xlYW5GaWxlUGF0aChmaWxlTmFtZSk7XG4gICAgdmFyIGNsZWFuZWRGaWxlTmFtZSA9IGZpbGVQYXRoVG9GaWxlTmFtZShmaWxlUGF0aCk7XG5cbiAgICBpZiAoaXNGaWxlSW5saW5lKGZpbGVQYXRoKSkge1xuICAgICAgY2xlYW5lZEZpbGVOYW1lID0gJyhpbmxpbmUgc2NyaXB0KSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFic19wYXRoOiBmaWxlTmFtZSxcbiAgICAgIGZpbGVuYW1lOiBjbGVhbmVkRmlsZU5hbWUsXG4gICAgICBmdW5jdGlvbjogZnVuY3Rpb25OYW1lLFxuICAgICAgbGluZW5vOiBsaW5lTnVtYmVyLFxuICAgICAgY29sbm86IGNvbHVtbk51bWJlclxuICAgIH07XG4gIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckludmFsaWRGcmFtZXMoZnJhbWVzKSB7XG4gIHJldHVybiBmcmFtZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGZpbGVuYW1lID0gX3JlZi5maWxlbmFtZSxcbiAgICAgICAgbGluZW5vID0gX3JlZi5saW5lbm87XG4gICAgcmV0dXJuIHR5cGVvZiBmaWxlbmFtZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGxpbmVubyAhPT0gJ3VuZGVmaW5lZCc7XG4gIH0pO1xufSIsImltcG9ydCB7IHJlZ2lzdGVyU2VydmljZXMgYXMgcmVnaXN0ZXJFcnJvclNlcnZpY2VzIH0gZnJvbSAnLi9lcnJvci1sb2dnaW5nJztcbmltcG9ydCB7IHJlZ2lzdGVyU2VydmljZXMgYXMgcmVnaXN0ZXJQZXJmU2VydmljZXMgfSBmcm9tICcuL3BlcmZvcm1hbmNlLW1vbml0b3JpbmcnO1xuaW1wb3J0IHsgU2VydmljZUZhY3RvcnkgfSBmcm9tICcuL2NvbW1vbi9zZXJ2aWNlLWZhY3RvcnknO1xuaW1wb3J0IHsgaXNQbGF0Zm9ybVN1cHBvcnRlZCwgc2NoZWR1bGVNaWNyb1Rhc2ssIHNjaGVkdWxlTWFjcm9UYXNrLCBpc0Jyb3dzZXIgfSBmcm9tICcuL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBwYXRjaEFsbCwgcGF0Y2hFdmVudEhhbmRsZXIgfSBmcm9tICcuL2NvbW1vbi9wYXRjaGluZyc7XG5pbXBvcnQgeyBvYnNlcnZlUGFnZVZpc2liaWxpdHkgfSBmcm9tICcuL2NvbW1vbi9wYWdlLXZpc2liaWxpdHknO1xuaW1wb3J0IHsgUEFHRV9MT0FEX0RFTEFZLCBQQUdFX0xPQUQsIEVSUk9SLCBDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFLCBUUkFOU0FDVElPTl9TRVJWSUNFLCBBUE1fU0VSVkVSIH0gZnJvbSAnLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IGdldEluc3RydW1lbnRhdGlvbkZsYWdzIH0gZnJvbSAnLi9jb21tb24vaW5zdHJ1bWVudCc7XG5pbXBvcnQgYWZ0ZXJGcmFtZSBmcm9tICcuL2NvbW1vbi9hZnRlci1mcmFtZSc7XG5pbXBvcnQgeyBib290c3RyYXAgfSBmcm9tICcuL2Jvb3RzdHJhcCc7XG5pbXBvcnQgeyBjcmVhdGVUcmFjZXIgfSBmcm9tICcuL29wZW50cmFjaW5nJztcblxuZnVuY3Rpb24gY3JlYXRlU2VydmljZUZhY3RvcnkoKSB7XG4gIHJlZ2lzdGVyUGVyZlNlcnZpY2VzKCk7XG4gIHJlZ2lzdGVyRXJyb3JTZXJ2aWNlcygpO1xuICB2YXIgc2VydmljZUZhY3RvcnkgPSBuZXcgU2VydmljZUZhY3RvcnkoKTtcbiAgcmV0dXJuIHNlcnZpY2VGYWN0b3J5O1xufVxuXG5leHBvcnQgeyBjcmVhdGVTZXJ2aWNlRmFjdG9yeSwgU2VydmljZUZhY3RvcnksIHBhdGNoQWxsLCBwYXRjaEV2ZW50SGFuZGxlciwgaXNQbGF0Zm9ybVN1cHBvcnRlZCwgaXNCcm93c2VyLCBnZXRJbnN0cnVtZW50YXRpb25GbGFncywgY3JlYXRlVHJhY2VyLCBzY2hlZHVsZU1pY3JvVGFzaywgc2NoZWR1bGVNYWNyb1Rhc2ssIGFmdGVyRnJhbWUsIEVSUk9SLCBQQUdFX0xPQURfREVMQVksIFBBR0VfTE9BRCwgQ09ORklHX1NFUlZJQ0UsIExPR0dJTkdfU0VSVklDRSwgVFJBTlNBQ1RJT05fU0VSVklDRSwgQVBNX1NFUlZFUiwgYm9vdHN0cmFwLCBvYnNlcnZlUGFnZVZpc2liaWxpdHkgfTsiLCJpbXBvcnQgVHJhY2VyIGZyb20gJy4vdHJhY2VyJztcbmltcG9ydCBTcGFuIGZyb20gJy4vc3Bhbic7XG5pbXBvcnQgeyBUUkFOU0FDVElPTl9TRVJWSUNFLCBMT0dHSU5HX1NFUlZJQ0UgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuZnVuY3Rpb24gY3JlYXRlVHJhY2VyKHNlcnZpY2VGYWN0b3J5KSB7XG4gIHZhciBwZXJmb3JtYW5jZU1vbml0b3JpbmcgPSBzZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKCdQZXJmb3JtYW5jZU1vbml0b3JpbmcnKTtcbiAgdmFyIHRyYW5zYWN0aW9uU2VydmljZSA9IHNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoVFJBTlNBQ1RJT05fU0VSVklDRSk7XG4gIHZhciBlcnJvckxvZ2dpbmcgPSBzZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKCdFcnJvckxvZ2dpbmcnKTtcbiAgdmFyIGxvZ2dpbmdTZXJ2aWNlID0gc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShMT0dHSU5HX1NFUlZJQ0UpO1xuICByZXR1cm4gbmV3IFRyYWNlcihwZXJmb3JtYW5jZU1vbml0b3JpbmcsIHRyYW5zYWN0aW9uU2VydmljZSwgbG9nZ2luZ1NlcnZpY2UsIGVycm9yTG9nZ2luZyk7XG59XG5cbmV4cG9ydCB7IFNwYW4sIFRyYWNlciwgY3JlYXRlVHJhY2VyIH07IiwiZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmltcG9ydCB7IFNwYW4gYXMgb3RTcGFuIH0gZnJvbSAnb3BlbnRyYWNpbmcvbGliL3NwYW4nO1xuaW1wb3J0IHsgZXh0ZW5kLCBnZXRUaW1lT3JpZ2luIH0gZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCBUcmFuc2FjdGlvbiBmcm9tICcuLi9wZXJmb3JtYW5jZS1tb25pdG9yaW5nL3RyYW5zYWN0aW9uJztcblxudmFyIFNwYW4gPSBmdW5jdGlvbiAoX290U3Bhbikge1xuICBfaW5oZXJpdHNMb29zZShTcGFuLCBfb3RTcGFuKTtcblxuICBmdW5jdGlvbiBTcGFuKHRyYWNlciwgc3Bhbikge1xuICAgIHZhciBfdGhpcztcblxuICAgIF90aGlzID0gX290U3Bhbi5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgX3RoaXMuX190cmFjZXIgPSB0cmFjZXI7XG4gICAgX3RoaXMuc3BhbiA9IHNwYW47XG4gICAgX3RoaXMuaXNUcmFuc2FjdGlvbiA9IHNwYW4gaW5zdGFuY2VvZiBUcmFuc2FjdGlvbjtcbiAgICBfdGhpcy5zcGFuQ29udGV4dCA9IHtcbiAgICAgIGlkOiBzcGFuLmlkLFxuICAgICAgdHJhY2VJZDogc3Bhbi50cmFjZUlkLFxuICAgICAgc2FtcGxlZDogc3Bhbi5zYW1wbGVkXG4gICAgfTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gU3Bhbi5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLl9jb250ZXh0ID0gZnVuY3Rpb24gX2NvbnRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BhbkNvbnRleHQ7XG4gIH07XG5cbiAgX3Byb3RvLl90cmFjZXIgPSBmdW5jdGlvbiBfdHJhY2VyKCkge1xuICAgIHJldHVybiB0aGlzLl9fdHJhY2VyO1xuICB9O1xuXG4gIF9wcm90by5fc2V0T3BlcmF0aW9uTmFtZSA9IGZ1bmN0aW9uIF9zZXRPcGVyYXRpb25OYW1lKG5hbWUpIHtcbiAgICB0aGlzLnNwYW4ubmFtZSA9IG5hbWU7XG4gIH07XG5cbiAgX3Byb3RvLl9hZGRUYWdzID0gZnVuY3Rpb24gX2FkZFRhZ3Moa2V5VmFsdWVQYWlycykge1xuICAgIHZhciB0YWdzID0gZXh0ZW5kKHt9LCBrZXlWYWx1ZVBhaXJzKTtcblxuICAgIGlmICh0YWdzLnR5cGUpIHtcbiAgICAgIHRoaXMuc3Bhbi50eXBlID0gdGFncy50eXBlO1xuICAgICAgZGVsZXRlIHRhZ3MudHlwZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1RyYW5zYWN0aW9uKSB7XG4gICAgICB2YXIgdXNlcklkID0gdGFnc1sndXNlci5pZCddO1xuICAgICAgdmFyIHVzZXJuYW1lID0gdGFnc1sndXNlci51c2VybmFtZSddO1xuICAgICAgdmFyIGVtYWlsID0gdGFnc1sndXNlci5lbWFpbCddO1xuXG4gICAgICBpZiAodXNlcklkIHx8IHVzZXJuYW1lIHx8IGVtYWlsKSB7XG4gICAgICAgIHRoaXMuc3Bhbi5hZGRDb250ZXh0KHtcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBpZDogdXNlcklkLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgZW1haWw6IGVtYWlsXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZGVsZXRlIHRhZ3NbJ3VzZXIuaWQnXTtcbiAgICAgICAgZGVsZXRlIHRhZ3NbJ3VzZXIudXNlcm5hbWUnXTtcbiAgICAgICAgZGVsZXRlIHRhZ3NbJ3VzZXIuZW1haWwnXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNwYW4uYWRkTGFiZWxzKHRhZ3MpO1xuICB9O1xuXG4gIF9wcm90by5fbG9nID0gZnVuY3Rpb24gX2xvZyhsb2csIHRpbWVzdGFtcCkge1xuICAgIGlmIChsb2cuZXZlbnQgPT09ICdlcnJvcicpIHtcbiAgICAgIGlmIChsb2dbJ2Vycm9yLm9iamVjdCddKSB7XG4gICAgICAgIHRoaXMuX190cmFjZXIuZXJyb3JMb2dnaW5nLmxvZ0Vycm9yKGxvZ1snZXJyb3Iub2JqZWN0J10pO1xuICAgICAgfSBlbHNlIGlmIChsb2cubWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9fdHJhY2VyLmVycm9yTG9nZ2luZy5sb2dFcnJvcihsb2cubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5fZmluaXNoID0gZnVuY3Rpb24gX2ZpbmlzaChmaW5pc2hUaW1lKSB7XG4gICAgdGhpcy5zcGFuLmVuZCgpO1xuXG4gICAgaWYgKGZpbmlzaFRpbWUpIHtcbiAgICAgIHRoaXMuc3Bhbi5fZW5kID0gZmluaXNoVGltZSAtIGdldFRpbWVPcmlnaW4oKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFNwYW47XG59KG90U3Bhbik7XG5cbmV4cG9ydCBkZWZhdWx0IFNwYW47IiwiZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmltcG9ydCB7IFRyYWNlciBhcyBvdFRyYWNlciB9IGZyb20gJ29wZW50cmFjaW5nL2xpYi90cmFjZXInO1xuaW1wb3J0IHsgUkVGRVJFTkNFX0NISUxEX09GLCBGT1JNQVRfVEVYVF9NQVAsIEZPUk1BVF9IVFRQX0hFQURFUlMsIEZPUk1BVF9CSU5BUlkgfSBmcm9tICdvcGVudHJhY2luZy9saWIvY29uc3RhbnRzJztcbmltcG9ydCB7IFNwYW4gYXMgTm9vcFNwYW4gfSBmcm9tICdvcGVudHJhY2luZy9saWIvc3Bhbic7XG5pbXBvcnQgeyBnZXRUaW1lT3JpZ2luLCBmaW5kIH0gZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IF9fREVWX18gfSBmcm9tICcuLi9zdGF0ZSc7XG5pbXBvcnQgU3BhbiBmcm9tICcuL3NwYW4nO1xuXG52YXIgVHJhY2VyID0gZnVuY3Rpb24gKF9vdFRyYWNlcikge1xuICBfaW5oZXJpdHNMb29zZShUcmFjZXIsIF9vdFRyYWNlcik7XG5cbiAgZnVuY3Rpb24gVHJhY2VyKHBlcmZvcm1hbmNlTW9uaXRvcmluZywgdHJhbnNhY3Rpb25TZXJ2aWNlLCBsb2dnaW5nU2VydmljZSwgZXJyb3JMb2dnaW5nKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgX3RoaXMgPSBfb3RUcmFjZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgIF90aGlzLnBlcmZvcm1hbmNlTW9uaXRvcmluZyA9IHBlcmZvcm1hbmNlTW9uaXRvcmluZztcbiAgICBfdGhpcy50cmFuc2FjdGlvblNlcnZpY2UgPSB0cmFuc2FjdGlvblNlcnZpY2U7XG4gICAgX3RoaXMubG9nZ2luZ1NlcnZpY2UgPSBsb2dnaW5nU2VydmljZTtcbiAgICBfdGhpcy5lcnJvckxvZ2dpbmcgPSBlcnJvckxvZ2dpbmc7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFRyYWNlci5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLl9zdGFydFNwYW4gPSBmdW5jdGlvbiBfc3RhcnRTcGFuKG5hbWUsIG9wdGlvbnMpIHtcbiAgICB2YXIgc3Bhbk9wdGlvbnMgPSB7XG4gICAgICBtYW5hZ2VkOiB0cnVlXG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBzcGFuT3B0aW9ucy50aW1lc3RhbXAgPSBvcHRpb25zLnN0YXJ0VGltZTtcblxuICAgICAgaWYgKG9wdGlvbnMuY2hpbGRPZikge1xuICAgICAgICBzcGFuT3B0aW9ucy5wYXJlbnRJZCA9IG9wdGlvbnMuY2hpbGRPZi5pZDtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5yZWZlcmVuY2VzICYmIG9wdGlvbnMucmVmZXJlbmNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnJlZmVyZW5jZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dpbmdTZXJ2aWNlLmRlYnVnKCdFbGFzdGljIEFQTSBPcGVuVHJhY2luZzogVW5zdXBwb3J0ZWQgbnVtYmVyIG9mIHJlZmVyZW5jZXMsIG9ubHkgdGhlIGZpcnN0IGNoaWxkT2YgcmVmZXJlbmNlIHdpbGwgYmUgcmVjb3JkZWQuJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkUmVmID0gZmluZChvcHRpb25zLnJlZmVyZW5jZXMsIGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICByZXR1cm4gcmVmLnR5cGUoKSA9PT0gUkVGRVJFTkNFX0NISUxEX09GO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoY2hpbGRSZWYpIHtcbiAgICAgICAgICBzcGFuT3B0aW9ucy5wYXJlbnRJZCA9IGNoaWxkUmVmLnJlZmVyZW5jZWRDb250ZXh0KCkuaWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc3BhbjtcbiAgICB2YXIgY3VycmVudFRyYW5zYWN0aW9uID0gdGhpcy50cmFuc2FjdGlvblNlcnZpY2UuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG5cbiAgICBpZiAoY3VycmVudFRyYW5zYWN0aW9uKSB7XG4gICAgICBzcGFuID0gdGhpcy50cmFuc2FjdGlvblNlcnZpY2Uuc3RhcnRTcGFuKG5hbWUsIHVuZGVmaW5lZCwgc3Bhbk9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzcGFuID0gdGhpcy50cmFuc2FjdGlvblNlcnZpY2Uuc3RhcnRUcmFuc2FjdGlvbihuYW1lLCB1bmRlZmluZWQsIHNwYW5PcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoIXNwYW4pIHtcbiAgICAgIHJldHVybiBuZXcgTm9vcFNwYW4oKTtcbiAgICB9XG5cbiAgICBpZiAoc3Bhbk9wdGlvbnMudGltZXN0YW1wKSB7XG4gICAgICBzcGFuLl9zdGFydCA9IHNwYW5PcHRpb25zLnRpbWVzdGFtcCAtIGdldFRpbWVPcmlnaW4oKTtcbiAgICB9XG5cbiAgICB2YXIgb3RTcGFuID0gbmV3IFNwYW4odGhpcywgc3Bhbik7XG5cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnRhZ3MpIHtcbiAgICAgIG90U3Bhbi5hZGRUYWdzKG9wdGlvbnMudGFncyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG90U3BhbjtcbiAgfTtcblxuICBfcHJvdG8uX2luamVjdCA9IGZ1bmN0aW9uIF9pbmplY3Qoc3BhbkNvbnRleHQsIGZvcm1hdCwgY2Fycmllcikge1xuICAgIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgICBjYXNlIEZPUk1BVF9URVhUX01BUDpcbiAgICAgIGNhc2UgRk9STUFUX0hUVFBfSEVBREVSUzpcbiAgICAgICAgdGhpcy5wZXJmb3JtYW5jZU1vbml0b3JpbmcuaW5qZWN0RHRIZWFkZXIoc3BhbkNvbnRleHQsIGNhcnJpZXIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBGT1JNQVRfQklOQVJZOlxuICAgICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICAgIHRoaXMubG9nZ2luZ1NlcnZpY2UuZGVidWcoJ0VsYXN0aWMgQVBNIE9wZW5UcmFjaW5nOiBiaW5hcnkgY2FycmllciBmb3JtYXQgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uX2V4dHJhY3QgPSBmdW5jdGlvbiBfZXh0cmFjdChmb3JtYXQsIGNhcnJpZXIpIHtcbiAgICB2YXIgY3R4O1xuXG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGNhc2UgRk9STUFUX1RFWFRfTUFQOlxuICAgICAgY2FzZSBGT1JNQVRfSFRUUF9IRUFERVJTOlxuICAgICAgICBjdHggPSB0aGlzLnBlcmZvcm1hbmNlTW9uaXRvcmluZy5leHRyYWN0RHRIZWFkZXIoY2Fycmllcik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIEZPUk1BVF9CSU5BUlk6XG4gICAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgICAgdGhpcy5sb2dnaW5nU2VydmljZS5kZWJ1ZygnRWxhc3RpYyBBUE0gT3BlblRyYWNpbmc6IGJpbmFyeSBjYXJyaWVyIGZvcm1hdCBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKCFjdHgpIHtcbiAgICAgIGN0eCA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICByZXR1cm4gVHJhY2VyO1xufShvdFRyYWNlcik7XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNlcjsiLCJpbXBvcnQgeyBnZXREdXJhdGlvbiwgUEVSRiB9IGZyb20gJy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBQQUdFX0xPQUQsIFRSVU5DQVRFRF9UWVBFIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG52YXIgcGFnZUxvYWRCcmVha2Rvd25zID0gW1snZG9tYWluTG9va3VwU3RhcnQnLCAnZG9tYWluTG9va3VwRW5kJywgJ0ROUyddLCBbJ2Nvbm5lY3RTdGFydCcsICdjb25uZWN0RW5kJywgJ1RDUCddLCBbJ3JlcXVlc3RTdGFydCcsICdyZXNwb25zZVN0YXJ0JywgJ1JlcXVlc3QnXSwgWydyZXNwb25zZVN0YXJ0JywgJ3Jlc3BvbnNlRW5kJywgJ1Jlc3BvbnNlJ10sIFsnZG9tTG9hZGluZycsICdkb21Db21wbGV0ZScsICdQcm9jZXNzaW5nJ10sIFsnbG9hZEV2ZW50U3RhcnQnLCAnbG9hZEV2ZW50RW5kJywgJ0xvYWQnXV07XG5cbmZ1bmN0aW9uIGdldFZhbHVlKHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVNlbGZUaW1lKHRyYW5zYWN0aW9uKSB7XG4gIHZhciBzcGFucyA9IHRyYW5zYWN0aW9uLnNwYW5zLFxuICAgICAgX3N0YXJ0ID0gdHJhbnNhY3Rpb24uX3N0YXJ0LFxuICAgICAgX2VuZCA9IHRyYW5zYWN0aW9uLl9lbmQ7XG5cbiAgaWYgKHNwYW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cmFuc2FjdGlvbi5kdXJhdGlvbigpO1xuICB9XG5cbiAgc3BhbnMuc29ydChmdW5jdGlvbiAoc3BhbjEsIHNwYW4yKSB7XG4gICAgcmV0dXJuIHNwYW4xLl9zdGFydCAtIHNwYW4yLl9zdGFydDtcbiAgfSk7XG4gIHZhciBzcGFuID0gc3BhbnNbMF07XG4gIHZhciBzcGFuRW5kID0gc3Bhbi5fZW5kO1xuICB2YXIgc3BhblN0YXJ0ID0gc3Bhbi5fc3RhcnQ7XG4gIHZhciBsYXN0Q29udGludW91c0VuZCA9IHNwYW5FbmQ7XG4gIHZhciBzZWxmVGltZSA9IHNwYW5TdGFydCAtIF9zdGFydDtcblxuICBmb3IgKHZhciBpID0gMTsgaSA8IHNwYW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgc3BhbiA9IHNwYW5zW2ldO1xuICAgIHNwYW5TdGFydCA9IHNwYW4uX3N0YXJ0O1xuICAgIHNwYW5FbmQgPSBzcGFuLl9lbmQ7XG5cbiAgICBpZiAoc3BhblN0YXJ0ID4gbGFzdENvbnRpbnVvdXNFbmQpIHtcbiAgICAgIHNlbGZUaW1lICs9IHNwYW5TdGFydCAtIGxhc3RDb250aW51b3VzRW5kO1xuICAgICAgbGFzdENvbnRpbnVvdXNFbmQgPSBzcGFuRW5kO1xuICAgIH0gZWxzZSBpZiAoc3BhbkVuZCA+IGxhc3RDb250aW51b3VzRW5kKSB7XG4gICAgICBsYXN0Q29udGludW91c0VuZCA9IHNwYW5FbmQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKGxhc3RDb250aW51b3VzRW5kIDwgX2VuZCkge1xuICAgIHNlbGZUaW1lICs9IF9lbmQgLSBsYXN0Q29udGludW91c0VuZDtcbiAgfVxuXG4gIHJldHVybiBzZWxmVGltZTtcbn1cblxuZnVuY3Rpb24gZ3JvdXBTcGFucyh0cmFuc2FjdGlvbikge1xuICB2YXIgc3Bhbk1hcCA9IHt9O1xuICB2YXIgdHJhbnNhY3Rpb25TZWxmVGltZSA9IGNhbGN1bGF0ZVNlbGZUaW1lKHRyYW5zYWN0aW9uKTtcbiAgc3Bhbk1hcFsnYXBwJ10gPSB7XG4gICAgY291bnQ6IDEsXG4gICAgZHVyYXRpb246IHRyYW5zYWN0aW9uU2VsZlRpbWVcbiAgfTtcbiAgdmFyIHNwYW5zID0gdHJhbnNhY3Rpb24uc3BhbnM7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzcGFuID0gc3BhbnNbaV07XG4gICAgdmFyIGR1cmF0aW9uID0gc3Bhbi5kdXJhdGlvbigpO1xuXG4gICAgaWYgKGR1cmF0aW9uID09PSAwIHx8IGR1cmF0aW9uID09IG51bGwpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gc3Bhbi50eXBlLFxuICAgICAgICBzdWJ0eXBlID0gc3Bhbi5zdWJ0eXBlO1xuICAgIHZhciBrZXkgPSB0eXBlLnJlcGxhY2UoVFJVTkNBVEVEX1RZUEUsICcnKTtcblxuICAgIGlmIChzdWJ0eXBlKSB7XG4gICAgICBrZXkgKz0gJy4nICsgc3VidHlwZTtcbiAgICB9XG5cbiAgICBpZiAoIXNwYW5NYXBba2V5XSkge1xuICAgICAgc3Bhbk1hcFtrZXldID0ge1xuICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgY291bnQ6IDBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc3Bhbk1hcFtrZXldLmNvdW50Kys7XG4gICAgc3Bhbk1hcFtrZXldLmR1cmF0aW9uICs9IGR1cmF0aW9uO1xuICB9XG5cbiAgcmV0dXJuIHNwYW5NYXA7XG59XG5cbmZ1bmN0aW9uIGdldFNwYW5CcmVha2Rvd24odHJhbnNhY3Rpb25EZXRhaWxzLCBfcmVmKSB7XG4gIHZhciBkZXRhaWxzID0gX3JlZi5kZXRhaWxzLFxuICAgICAgX3JlZiRjb3VudCA9IF9yZWYuY291bnQsXG4gICAgICBjb3VudCA9IF9yZWYkY291bnQgPT09IHZvaWQgMCA/IDEgOiBfcmVmJGNvdW50LFxuICAgICAgZHVyYXRpb24gPSBfcmVmLmR1cmF0aW9uO1xuICByZXR1cm4ge1xuICAgIHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbkRldGFpbHMsXG4gICAgc3BhbjogZGV0YWlscyxcbiAgICBzYW1wbGVzOiB7XG4gICAgICAnc3Bhbi5zZWxmX3RpbWUuY291bnQnOiBnZXRWYWx1ZShjb3VudCksXG4gICAgICAnc3Bhbi5zZWxmX3RpbWUuc3VtLnVzJzogZ2V0VmFsdWUoZHVyYXRpb24pXG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZUJyZWFrZG93bih0cmFuc2FjdGlvbiwgdGltaW5ncykge1xuICBpZiAodGltaW5ncyA9PT0gdm9pZCAwKSB7XG4gICAgdGltaW5ncyA9IFBFUkYudGltaW5nO1xuICB9XG5cbiAgdmFyIGJyZWFrZG93bnMgPSBbXTtcbiAgdmFyIHRyRHVyYXRpb24gPSB0cmFuc2FjdGlvbi5kdXJhdGlvbigpO1xuICB2YXIgbmFtZSA9IHRyYW5zYWN0aW9uLm5hbWUsXG4gICAgICB0eXBlID0gdHJhbnNhY3Rpb24udHlwZSxcbiAgICAgIHNhbXBsZWQgPSB0cmFuc2FjdGlvbi5zYW1wbGVkO1xuICB2YXIgdHJhbnNhY3Rpb25EZXRhaWxzID0ge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgdHlwZTogdHlwZVxuICB9O1xuICBicmVha2Rvd25zLnB1c2goe1xuICAgIHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbkRldGFpbHMsXG4gICAgc2FtcGxlczoge1xuICAgICAgJ3RyYW5zYWN0aW9uLmR1cmF0aW9uLmNvdW50JzogZ2V0VmFsdWUoMSksXG4gICAgICAndHJhbnNhY3Rpb24uZHVyYXRpb24uc3VtLnVzJzogZ2V0VmFsdWUodHJEdXJhdGlvbiksXG4gICAgICAndHJhbnNhY3Rpb24uYnJlYWtkb3duLmNvdW50JzogZ2V0VmFsdWUoc2FtcGxlZCA/IDEgOiAwKVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKCFzYW1wbGVkKSB7XG4gICAgcmV0dXJuIGJyZWFrZG93bnM7XG4gIH1cblxuICBpZiAodHlwZSA9PT0gUEFHRV9MT0FEICYmIHRpbWluZ3MpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhZ2VMb2FkQnJlYWtkb3ducy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1cnJlbnQgPSBwYWdlTG9hZEJyZWFrZG93bnNbaV07XG4gICAgICB2YXIgc3RhcnQgPSB0aW1pbmdzW2N1cnJlbnRbMF1dO1xuICAgICAgdmFyIGVuZCA9IHRpbWluZ3NbY3VycmVudFsxXV07XG4gICAgICB2YXIgZHVyYXRpb24gPSBnZXREdXJhdGlvbihzdGFydCwgZW5kKTtcblxuICAgICAgaWYgKGR1cmF0aW9uID09PSAwIHx8IGR1cmF0aW9uID09IG51bGwpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGJyZWFrZG93bnMucHVzaChnZXRTcGFuQnJlYWtkb3duKHRyYW5zYWN0aW9uRGV0YWlscywge1xuICAgICAgICBkZXRhaWxzOiB7XG4gICAgICAgICAgdHlwZTogY3VycmVudFsyXVxuICAgICAgICB9LFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb25cbiAgICAgIH0pKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIHNwYW5NYXAgPSBncm91cFNwYW5zKHRyYW5zYWN0aW9uKTtcbiAgICBPYmplY3Qua2V5cyhzcGFuTWFwKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHZhciBfa2V5JHNwbGl0ID0ga2V5LnNwbGl0KCcuJyksXG4gICAgICAgICAgdHlwZSA9IF9rZXkkc3BsaXRbMF0sXG4gICAgICAgICAgc3VidHlwZSA9IF9rZXkkc3BsaXRbMV07XG5cbiAgICAgIHZhciBfc3Bhbk1hcCRrZXkgPSBzcGFuTWFwW2tleV0sXG4gICAgICAgICAgZHVyYXRpb24gPSBfc3Bhbk1hcCRrZXkuZHVyYXRpb24sXG4gICAgICAgICAgY291bnQgPSBfc3Bhbk1hcCRrZXkuY291bnQ7XG4gICAgICBicmVha2Rvd25zLnB1c2goZ2V0U3BhbkJyZWFrZG93bih0cmFuc2FjdGlvbkRldGFpbHMsIHtcbiAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgc3VidHlwZTogc3VidHlwZVxuICAgICAgICB9LFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIGNvdW50OiBjb3VudFxuICAgICAgfSkpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGJyZWFrZG93bnM7XG59IiwiaW1wb3J0IFNwYW4gZnJvbSAnLi9zcGFuJztcbmltcG9ydCB7IFJFU09VUkNFX0lOSVRJQVRPUl9UWVBFUywgTUFYX1NQQU5fRFVSQVRJT04sIFVTRVJfVElNSU5HX1RIUkVTSE9MRCwgUEFHRV9MT0FELCBSRVNPVVJDRSwgTUVBU1VSRSB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgc3RyaXBRdWVyeVN0cmluZ0Zyb21VcmwsIFBFUkYsIGlzUGVyZlRpbWVsaW5lU3VwcG9ydGVkIH0gZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IHN0YXRlIH0gZnJvbSAnLi4vc3RhdGUnO1xudmFyIGV2ZW50UGFpcnMgPSBbWydkb21haW5Mb29rdXBTdGFydCcsICdkb21haW5Mb29rdXBFbmQnLCAnRG9tYWluIGxvb2t1cCddLCBbJ2Nvbm5lY3RTdGFydCcsICdjb25uZWN0RW5kJywgJ01ha2luZyBhIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciddLCBbJ3JlcXVlc3RTdGFydCcsICdyZXNwb25zZUVuZCcsICdSZXF1ZXN0aW5nIGFuZCByZWNlaXZpbmcgdGhlIGRvY3VtZW50J10sIFsnZG9tTG9hZGluZycsICdkb21JbnRlcmFjdGl2ZScsICdQYXJzaW5nIHRoZSBkb2N1bWVudCwgZXhlY3V0aW5nIHN5bmMuIHNjcmlwdHMnXSwgWydkb21Db250ZW50TG9hZGVkRXZlbnRTdGFydCcsICdkb21Db250ZW50TG9hZGVkRXZlbnRFbmQnLCAnRmlyZSBcIkRPTUNvbnRlbnRMb2FkZWRcIiBldmVudCddLCBbJ2xvYWRFdmVudFN0YXJ0JywgJ2xvYWRFdmVudEVuZCcsICdGaXJlIFwibG9hZFwiIGV2ZW50J11dO1xuXG5mdW5jdGlvbiBzaG91bGRDcmVhdGVTcGFuKHN0YXJ0LCBlbmQsIHRyU3RhcnQsIHRyRW5kLCBiYXNlVGltZSkge1xuICBpZiAoYmFzZVRpbWUgPT09IHZvaWQgMCkge1xuICAgIGJhc2VUaW1lID0gMDtcbiAgfVxuXG4gIHJldHVybiB0eXBlb2Ygc3RhcnQgPT09ICdudW1iZXInICYmIHR5cGVvZiBlbmQgPT09ICdudW1iZXInICYmIHN0YXJ0ID49IGJhc2VUaW1lICYmIGVuZCA+IHN0YXJ0ICYmIHN0YXJ0IC0gYmFzZVRpbWUgPj0gdHJTdGFydCAmJiBlbmQgLSBiYXNlVGltZSA8PSB0ckVuZCAmJiBlbmQgLSBzdGFydCA8IE1BWF9TUEFOX0RVUkFUSU9OICYmIHN0YXJ0IC0gYmFzZVRpbWUgPCBNQVhfU1BBTl9EVVJBVElPTiAmJiBlbmQgLSBiYXNlVGltZSA8IE1BWF9TUEFOX0RVUkFUSU9OO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOYXZpZ2F0aW9uVGltaW5nU3BhbnModGltaW5ncywgYmFzZVRpbWUsIHRyU3RhcnQsIHRyRW5kKSB7XG4gIHZhciBzcGFucyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRQYWlycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzdGFydCA9IHRpbWluZ3NbZXZlbnRQYWlyc1tpXVswXV07XG4gICAgdmFyIGVuZCA9IHRpbWluZ3NbZXZlbnRQYWlyc1tpXVsxXV07XG5cbiAgICBpZiAoIXNob3VsZENyZWF0ZVNwYW4oc3RhcnQsIGVuZCwgdHJTdGFydCwgdHJFbmQsIGJhc2VUaW1lKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIHNwYW4gPSBuZXcgU3BhbihldmVudFBhaXJzW2ldWzJdLCAnaGFyZC1uYXZpZ2F0aW9uLmJyb3dzZXItdGltaW5nJyk7XG4gICAgdmFyIGRhdGEgPSBudWxsO1xuXG4gICAgaWYgKGV2ZW50UGFpcnNbaV1bMF0gPT09ICdyZXF1ZXN0U3RhcnQnKSB7XG4gICAgICBzcGFuLnBhZ2VSZXNwb25zZSA9IHRydWU7XG4gICAgICBkYXRhID0ge1xuICAgICAgICB1cmw6IGxvY2F0aW9uLm9yaWdpblxuICAgICAgfTtcbiAgICB9XG5cbiAgICBzcGFuLl9zdGFydCA9IHN0YXJ0IC0gYmFzZVRpbWU7XG4gICAgc3Bhbi5lbmQoZW5kIC0gYmFzZVRpbWUsIGRhdGEpO1xuICAgIHNwYW5zLnB1c2goc3Bhbik7XG4gIH1cblxuICByZXR1cm4gc3BhbnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlc291cmNlVGltaW5nU3BhbihyZXNvdXJjZVRpbWluZ0VudHJ5KSB7XG4gIHZhciBuYW1lID0gcmVzb3VyY2VUaW1pbmdFbnRyeS5uYW1lLFxuICAgICAgaW5pdGlhdG9yVHlwZSA9IHJlc291cmNlVGltaW5nRW50cnkuaW5pdGlhdG9yVHlwZSxcbiAgICAgIHN0YXJ0VGltZSA9IHJlc291cmNlVGltaW5nRW50cnkuc3RhcnRUaW1lLFxuICAgICAgcmVzcG9uc2VFbmQgPSByZXNvdXJjZVRpbWluZ0VudHJ5LnJlc3BvbnNlRW5kO1xuICB2YXIga2luZCA9ICdyZXNvdXJjZSc7XG5cbiAgaWYgKGluaXRpYXRvclR5cGUpIHtcbiAgICBraW5kICs9ICcuJyArIGluaXRpYXRvclR5cGU7XG4gIH1cblxuICB2YXIgc3Bhbk5hbWUgPSBzdHJpcFF1ZXJ5U3RyaW5nRnJvbVVybChuYW1lKTtcbiAgdmFyIHNwYW4gPSBuZXcgU3BhbihzcGFuTmFtZSwga2luZCk7XG4gIHNwYW4uX3N0YXJ0ID0gc3RhcnRUaW1lO1xuICBzcGFuLmVuZChyZXNwb25zZUVuZCwge1xuICAgIHVybDogbmFtZSxcbiAgICBlbnRyeTogcmVzb3VyY2VUaW1pbmdFbnRyeVxuICB9KTtcbiAgcmV0dXJuIHNwYW47XG59XG5cbmZ1bmN0aW9uIGlzQ2FwdHVyZWRCeVBhdGNoaW5nKHJlc291cmNlU3RhcnRUaW1lLCByZXF1ZXN0UGF0Y2hUaW1lKSB7XG4gIHJldHVybiByZXF1ZXN0UGF0Y2hUaW1lICE9IG51bGwgJiYgcmVzb3VyY2VTdGFydFRpbWUgPiByZXF1ZXN0UGF0Y2hUaW1lO1xufVxuXG5mdW5jdGlvbiBpc0ludGFrZUFQSUVuZHBvaW50KHVybCkge1xuICByZXR1cm4gL2ludGFrZVxcL3ZcXGQrXFwvcnVtXFwvZXZlbnRzLy50ZXN0KHVybCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlc291cmNlVGltaW5nU3BhbnMoZW50cmllcywgcmVxdWVzdFBhdGNoVGltZSwgdHJTdGFydCwgdHJFbmQpIHtcbiAgdmFyIHNwYW5zID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIF9lbnRyaWVzJGkgPSBlbnRyaWVzW2ldLFxuICAgICAgICBpbml0aWF0b3JUeXBlID0gX2VudHJpZXMkaS5pbml0aWF0b3JUeXBlLFxuICAgICAgICBuYW1lID0gX2VudHJpZXMkaS5uYW1lLFxuICAgICAgICBzdGFydFRpbWUgPSBfZW50cmllcyRpLnN0YXJ0VGltZSxcbiAgICAgICAgcmVzcG9uc2VFbmQgPSBfZW50cmllcyRpLnJlc3BvbnNlRW5kO1xuXG4gICAgaWYgKFJFU09VUkNFX0lOSVRJQVRPUl9UWVBFUy5pbmRleE9mKGluaXRpYXRvclR5cGUpID09PSAtMSB8fCBuYW1lID09IG51bGwpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICgoaW5pdGlhdG9yVHlwZSA9PT0gJ3htbGh0dHByZXF1ZXN0JyB8fCBpbml0aWF0b3JUeXBlID09PSAnZmV0Y2gnKSAmJiAoaXNJbnRha2VBUElFbmRwb2ludChuYW1lKSB8fCBpc0NhcHR1cmVkQnlQYXRjaGluZyhzdGFydFRpbWUsIHJlcXVlc3RQYXRjaFRpbWUpKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNob3VsZENyZWF0ZVNwYW4oc3RhcnRUaW1lLCByZXNwb25zZUVuZCwgdHJTdGFydCwgdHJFbmQpKSB7XG4gICAgICBzcGFucy5wdXNoKGNyZWF0ZVJlc291cmNlVGltaW5nU3BhbihlbnRyaWVzW2ldKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNwYW5zO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVVc2VyVGltaW5nU3BhbnMoZW50cmllcywgdHJTdGFydCwgdHJFbmQpIHtcbiAgdmFyIHVzZXJUaW1pbmdTcGFucyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBfZW50cmllcyRpMiA9IGVudHJpZXNbaV0sXG4gICAgICAgIG5hbWUgPSBfZW50cmllcyRpMi5uYW1lLFxuICAgICAgICBzdGFydFRpbWUgPSBfZW50cmllcyRpMi5zdGFydFRpbWUsXG4gICAgICAgIGR1cmF0aW9uID0gX2VudHJpZXMkaTIuZHVyYXRpb247XG4gICAgdmFyIGVuZCA9IHN0YXJ0VGltZSArIGR1cmF0aW9uO1xuXG4gICAgaWYgKGR1cmF0aW9uIDw9IFVTRVJfVElNSU5HX1RIUkVTSE9MRCB8fCAhc2hvdWxkQ3JlYXRlU3BhbihzdGFydFRpbWUsIGVuZCwgdHJTdGFydCwgdHJFbmQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIga2luZCA9ICdhcHAnO1xuICAgIHZhciBzcGFuID0gbmV3IFNwYW4obmFtZSwga2luZCk7XG4gICAgc3Bhbi5fc3RhcnQgPSBzdGFydFRpbWU7XG4gICAgc3Bhbi5lbmQoZW5kKTtcbiAgICB1c2VyVGltaW5nU3BhbnMucHVzaChzcGFuKTtcbiAgfVxuXG4gIHJldHVybiB1c2VyVGltaW5nU3BhbnM7XG59XG5cbnZhciBOQVZJR0FUSU9OX1RJTUlOR19NQVJLUyA9IFsnZmV0Y2hTdGFydCcsICdkb21haW5Mb29rdXBTdGFydCcsICdkb21haW5Mb29rdXBFbmQnLCAnY29ubmVjdFN0YXJ0JywgJ2Nvbm5lY3RFbmQnLCAncmVxdWVzdFN0YXJ0JywgJ3Jlc3BvbnNlU3RhcnQnLCAncmVzcG9uc2VFbmQnLCAnZG9tTG9hZGluZycsICdkb21JbnRlcmFjdGl2ZScsICdkb21Db250ZW50TG9hZGVkRXZlbnRTdGFydCcsICdkb21Db250ZW50TG9hZGVkRXZlbnRFbmQnLCAnZG9tQ29tcGxldGUnLCAnbG9hZEV2ZW50U3RhcnQnLCAnbG9hZEV2ZW50RW5kJ107XG52YXIgQ09NUFJFU1NFRF9OQVZfVElNSU5HX01BUktTID0gWydmcycsICdscycsICdsZScsICdjcycsICdjZScsICdxcycsICdycycsICdyZScsICdkbCcsICdkaScsICdkcycsICdkZScsICdkYycsICdlcycsICdlZSddO1xuXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uVGltaW5nTWFya3ModGltaW5nKSB7XG4gIHZhciBmZXRjaFN0YXJ0ID0gdGltaW5nLmZldGNoU3RhcnQsXG4gICAgICBuYXZpZ2F0aW9uU3RhcnQgPSB0aW1pbmcubmF2aWdhdGlvblN0YXJ0LFxuICAgICAgcmVzcG9uc2VTdGFydCA9IHRpbWluZy5yZXNwb25zZVN0YXJ0LFxuICAgICAgcmVzcG9uc2VFbmQgPSB0aW1pbmcucmVzcG9uc2VFbmQ7XG5cbiAgaWYgKGZldGNoU3RhcnQgPj0gbmF2aWdhdGlvblN0YXJ0ICYmIHJlc3BvbnNlU3RhcnQgPj0gZmV0Y2hTdGFydCAmJiByZXNwb25zZUVuZCA+PSByZXNwb25zZVN0YXJ0KSB7XG4gICAgdmFyIG1hcmtzID0ge307XG4gICAgTkFWSUdBVElPTl9USU1JTkdfTUFSS1MuZm9yRWFjaChmdW5jdGlvbiAodGltaW5nS2V5KSB7XG4gICAgICB2YXIgbSA9IHRpbWluZ1t0aW1pbmdLZXldO1xuXG4gICAgICBpZiAobSAmJiBtID49IGZldGNoU3RhcnQpIHtcbiAgICAgICAgbWFya3NbdGltaW5nS2V5XSA9IHBhcnNlSW50KG0gLSBmZXRjaFN0YXJ0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWFya3M7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0UGFnZUxvYWRNYXJrcyh0aW1pbmcpIHtcbiAgdmFyIG1hcmtzID0gZ2V0TmF2aWdhdGlvblRpbWluZ01hcmtzKHRpbWluZyk7XG5cbiAgaWYgKG1hcmtzID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmF2aWdhdGlvblRpbWluZzogbWFya3MsXG4gICAgYWdlbnQ6IHtcbiAgICAgIHRpbWVUb0ZpcnN0Qnl0ZTogbWFya3MucmVzcG9uc2VTdGFydCxcbiAgICAgIGRvbUludGVyYWN0aXZlOiBtYXJrcy5kb21JbnRlcmFjdGl2ZSxcbiAgICAgIGRvbUNvbXBsZXRlOiBtYXJrcy5kb21Db21wbGV0ZVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gY2FwdHVyZU5hdmlnYXRpb24odHJhbnNhY3Rpb24pIHtcbiAgaWYgKCF0cmFuc2FjdGlvbi5jYXB0dXJlVGltaW5ncykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0ckVuZCA9IHRyYW5zYWN0aW9uLl9lbmQ7XG5cbiAgaWYgKHRyYW5zYWN0aW9uLnR5cGUgPT09IFBBR0VfTE9BRCkge1xuICAgIGlmICh0cmFuc2FjdGlvbi5tYXJrcyAmJiB0cmFuc2FjdGlvbi5tYXJrcy5jdXN0b20pIHtcbiAgICAgIHZhciBjdXN0b21NYXJrcyA9IHRyYW5zYWN0aW9uLm1hcmtzLmN1c3RvbTtcbiAgICAgIE9iamVjdC5rZXlzKGN1c3RvbU1hcmtzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgY3VzdG9tTWFya3Nba2V5XSArPSB0cmFuc2FjdGlvbi5fc3RhcnQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdHJTdGFydCA9IDA7XG4gICAgdHJhbnNhY3Rpb24uX3N0YXJ0ID0gdHJTdGFydDtcbiAgICB2YXIgdGltaW5ncyA9IFBFUkYudGltaW5nO1xuICAgIGNyZWF0ZU5hdmlnYXRpb25UaW1pbmdTcGFucyh0aW1pbmdzLCB0aW1pbmdzLmZldGNoU3RhcnQsIHRyU3RhcnQsIHRyRW5kKS5mb3JFYWNoKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgICBzcGFuLnRyYWNlSWQgPSB0cmFuc2FjdGlvbi50cmFjZUlkO1xuICAgICAgc3Bhbi5zYW1wbGVkID0gdHJhbnNhY3Rpb24uc2FtcGxlZDtcblxuICAgICAgaWYgKHNwYW4ucGFnZVJlc3BvbnNlICYmIHRyYW5zYWN0aW9uLm9wdGlvbnMucGFnZUxvYWRTcGFuSWQpIHtcbiAgICAgICAgc3Bhbi5pZCA9IHRyYW5zYWN0aW9uLm9wdGlvbnMucGFnZUxvYWRTcGFuSWQ7XG4gICAgICB9XG5cbiAgICAgIHRyYW5zYWN0aW9uLnNwYW5zLnB1c2goc3Bhbik7XG4gICAgfSk7XG4gICAgdHJhbnNhY3Rpb24uYWRkTWFya3MoZ2V0UGFnZUxvYWRNYXJrcyh0aW1pbmdzKSk7XG4gIH1cblxuICBpZiAoaXNQZXJmVGltZWxpbmVTdXBwb3J0ZWQoKSkge1xuICAgIHZhciBfdHJTdGFydCA9IHRyYW5zYWN0aW9uLl9zdGFydDtcbiAgICB2YXIgcmVzb3VyY2VFbnRyaWVzID0gUEVSRi5nZXRFbnRyaWVzQnlUeXBlKFJFU09VUkNFKTtcbiAgICBjcmVhdGVSZXNvdXJjZVRpbWluZ1NwYW5zKHJlc291cmNlRW50cmllcywgc3RhdGUuYm9vdHN0cmFwVGltZSwgX3RyU3RhcnQsIHRyRW5kKS5mb3JFYWNoKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgICByZXR1cm4gdHJhbnNhY3Rpb24uc3BhbnMucHVzaChzcGFuKTtcbiAgICB9KTtcbiAgICB2YXIgdXNlckVudHJpZXMgPSBQRVJGLmdldEVudHJpZXNCeVR5cGUoTUVBU1VSRSk7XG4gICAgY3JlYXRlVXNlclRpbWluZ1NwYW5zKHVzZXJFbnRyaWVzLCBfdHJTdGFydCwgdHJFbmQpLmZvckVhY2goZnVuY3Rpb24gKHNwYW4pIHtcbiAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5zcGFucy5wdXNoKHNwYW4pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB7IGdldFBhZ2VMb2FkTWFya3MsIGNhcHR1cmVOYXZpZ2F0aW9uLCBjcmVhdGVOYXZpZ2F0aW9uVGltaW5nU3BhbnMsIGNyZWF0ZVJlc291cmNlVGltaW5nU3BhbnMsIGNyZWF0ZVVzZXJUaW1pbmdTcGFucywgTkFWSUdBVElPTl9USU1JTkdfTUFSS1MsIENPTVBSRVNTRURfTkFWX1RJTUlOR19NQVJLUyB9OyIsImltcG9ydCBQZXJmb3JtYW5jZU1vbml0b3JpbmcgZnJvbSAnLi9wZXJmb3JtYW5jZS1tb25pdG9yaW5nJztcbmltcG9ydCBUcmFuc2FjdGlvblNlcnZpY2UgZnJvbSAnLi90cmFuc2FjdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7IEFQTV9TRVJWRVIsIENPTkZJR19TRVJWSUNFLCBMT0dHSU5HX1NFUlZJQ0UsIFRSQU5TQUNUSU9OX1NFUlZJQ0UgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IHNlcnZpY2VDcmVhdG9ycyB9IGZyb20gJy4uL2NvbW1vbi9zZXJ2aWNlLWZhY3RvcnknO1xuXG5mdW5jdGlvbiByZWdpc3RlclNlcnZpY2VzKCkge1xuICBzZXJ2aWNlQ3JlYXRvcnNbVFJBTlNBQ1RJT05fU0VSVklDRV0gPSBmdW5jdGlvbiAoc2VydmljZUZhY3RvcnkpIHtcbiAgICB2YXIgX3NlcnZpY2VGYWN0b3J5JGdldFNlID0gc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShbTE9HR0lOR19TRVJWSUNFLCBDT05GSUdfU0VSVklDRV0pLFxuICAgICAgICBsb2dnaW5nU2VydmljZSA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZVswXSxcbiAgICAgICAgY29uZmlnU2VydmljZSA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZVsxXTtcblxuICAgIHJldHVybiBuZXcgVHJhbnNhY3Rpb25TZXJ2aWNlKGxvZ2dpbmdTZXJ2aWNlLCBjb25maWdTZXJ2aWNlKTtcbiAgfTtcblxuICBzZXJ2aWNlQ3JlYXRvcnNbJ1BlcmZvcm1hbmNlTW9uaXRvcmluZyddID0gZnVuY3Rpb24gKHNlcnZpY2VGYWN0b3J5KSB7XG4gICAgdmFyIF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTIgPSBzZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFtBUE1fU0VSVkVSLCBDT05GSUdfU0VSVklDRSwgTE9HR0lOR19TRVJWSUNFLCBUUkFOU0FDVElPTl9TRVJWSUNFXSksXG4gICAgICAgIGFwbVNlcnZlciA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTJbMF0sXG4gICAgICAgIGNvbmZpZ1NlcnZpY2UgPSBfc2VydmljZUZhY3RvcnkkZ2V0U2UyWzFdLFxuICAgICAgICBsb2dnaW5nU2VydmljZSA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTJbMl0sXG4gICAgICAgIHRyYW5zYWN0aW9uU2VydmljZSA9IF9zZXJ2aWNlRmFjdG9yeSRnZXRTZTJbM107XG5cbiAgICByZXR1cm4gbmV3IFBlcmZvcm1hbmNlTW9uaXRvcmluZyhhcG1TZXJ2ZXIsIGNvbmZpZ1NlcnZpY2UsIGxvZ2dpbmdTZXJ2aWNlLCB0cmFuc2FjdGlvblNlcnZpY2UpO1xuICB9O1xufVxuXG5leHBvcnQgeyByZWdpc3RlclNlcnZpY2VzIH07IiwiaW1wb3J0IHsgTE9OR19UQVNLLCBMQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlQsIEZJUlNUX0NPTlRFTlRGVUxfUEFJTlQsIEZJUlNUX0lOUFVULCBMQVlPVVRfU0hJRlQgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IG5vb3AsIFBFUkYgfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IFNwYW4gZnJvbSAnLi9zcGFuJztcbmV4cG9ydCB2YXIgbWV0cmljcyA9IHtcbiAgZmlkOiAwLFxuICBmY3A6IDAsXG4gIHRidDoge1xuICAgIHN0YXJ0OiBJbmZpbml0eSxcbiAgICBkdXJhdGlvbjogMFxuICB9LFxuICBjbHM6IHtcbiAgICBzY29yZTogMCxcbiAgICBmaXJzdEVudHJ5VGltZTogTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLFxuICAgIHByZXZFbnRyeVRpbWU6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSxcbiAgICBjdXJyZW50U2Vzc2lvblNjb3JlOiAwXG4gIH0sXG4gIGxvbmd0YXNrOiB7XG4gICAgY291bnQ6IDAsXG4gICAgZHVyYXRpb246IDAsXG4gICAgbWF4OiAwXG4gIH1cbn07XG52YXIgTE9OR19UQVNLX1RIUkVTSE9MRCA9IDUwO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvbmdUYXNrU3BhbnMobG9uZ3Rhc2tzLCBhZ2cpIHtcbiAgdmFyIHNwYW5zID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb25ndGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgX2xvbmd0YXNrcyRpID0gbG9uZ3Rhc2tzW2ldLFxuICAgICAgICBuYW1lID0gX2xvbmd0YXNrcyRpLm5hbWUsXG4gICAgICAgIHN0YXJ0VGltZSA9IF9sb25ndGFza3MkaS5zdGFydFRpbWUsXG4gICAgICAgIGR1cmF0aW9uID0gX2xvbmd0YXNrcyRpLmR1cmF0aW9uLFxuICAgICAgICBhdHRyaWJ1dGlvbiA9IF9sb25ndGFza3MkaS5hdHRyaWJ1dGlvbjtcbiAgICB2YXIgZW5kID0gc3RhcnRUaW1lICsgZHVyYXRpb247XG4gICAgdmFyIHNwYW4gPSBuZXcgU3BhbihcIkxvbmd0YXNrKFwiICsgbmFtZSArIFwiKVwiLCBMT05HX1RBU0ssIHtcbiAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lXG4gICAgfSk7XG4gICAgYWdnLmNvdW50Kys7XG4gICAgYWdnLmR1cmF0aW9uICs9IGR1cmF0aW9uO1xuICAgIGFnZy5tYXggPSBNYXRoLm1heChkdXJhdGlvbiwgYWdnLm1heCk7XG5cbiAgICBpZiAoYXR0cmlidXRpb24ubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIF9hdHRyaWJ1dGlvbiQgPSBhdHRyaWJ1dGlvblswXSxcbiAgICAgICAgICBfbmFtZSA9IF9hdHRyaWJ1dGlvbiQubmFtZSxcbiAgICAgICAgICBjb250YWluZXJUeXBlID0gX2F0dHJpYnV0aW9uJC5jb250YWluZXJUeXBlLFxuICAgICAgICAgIGNvbnRhaW5lck5hbWUgPSBfYXR0cmlidXRpb24kLmNvbnRhaW5lck5hbWUsXG4gICAgICAgICAgY29udGFpbmVySWQgPSBfYXR0cmlidXRpb24kLmNvbnRhaW5lcklkO1xuICAgICAgdmFyIGN1c3RvbUNvbnRleHQgPSB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiBfbmFtZSxcbiAgICAgICAgdHlwZTogY29udGFpbmVyVHlwZVxuICAgICAgfTtcblxuICAgICAgaWYgKGNvbnRhaW5lck5hbWUpIHtcbiAgICAgICAgY3VzdG9tQ29udGV4dC5uYW1lID0gY29udGFpbmVyTmFtZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbnRhaW5lcklkKSB7XG4gICAgICAgIGN1c3RvbUNvbnRleHQuaWQgPSBjb250YWluZXJJZDtcbiAgICAgIH1cblxuICAgICAgc3Bhbi5hZGRDb250ZXh0KHtcbiAgICAgICAgY3VzdG9tOiBjdXN0b21Db250ZXh0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzcGFuLmVuZChlbmQpO1xuICAgIHNwYW5zLnB1c2goc3Bhbik7XG4gIH1cblxuICByZXR1cm4gc3BhbnM7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmlyc3RJbnB1dERlbGF5U3BhbihmaWRFbnRyaWVzKSB7XG4gIHZhciBmaXJzdElucHV0ID0gZmlkRW50cmllc1swXTtcblxuICBpZiAoZmlyc3RJbnB1dCkge1xuICAgIHZhciBzdGFydFRpbWUgPSBmaXJzdElucHV0LnN0YXJ0VGltZSxcbiAgICAgICAgcHJvY2Vzc2luZ1N0YXJ0ID0gZmlyc3RJbnB1dC5wcm9jZXNzaW5nU3RhcnQ7XG4gICAgdmFyIHNwYW4gPSBuZXcgU3BhbignRmlyc3QgSW5wdXQgRGVsYXknLCBGSVJTVF9JTlBVVCwge1xuICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWVcbiAgICB9KTtcbiAgICBzcGFuLmVuZChwcm9jZXNzaW5nU3RhcnQpO1xuICAgIHJldHVybiBzcGFuO1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVG90YWxCbG9ja2luZ1RpbWVTcGFuKHRidE9iamVjdCkge1xuICB2YXIgc3RhcnQgPSB0YnRPYmplY3Quc3RhcnQsXG4gICAgICBkdXJhdGlvbiA9IHRidE9iamVjdC5kdXJhdGlvbjtcbiAgdmFyIHRidFNwYW4gPSBuZXcgU3BhbignVG90YWwgQmxvY2tpbmcgVGltZScsIExPTkdfVEFTSywge1xuICAgIHN0YXJ0VGltZTogc3RhcnRcbiAgfSk7XG4gIHRidFNwYW4uZW5kKHN0YXJ0ICsgZHVyYXRpb24pO1xuICByZXR1cm4gdGJ0U3Bhbjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVUb3RhbEJsb2NraW5nVGltZShsb25ndGFza0VudHJpZXMpIHtcbiAgbG9uZ3Rhc2tFbnRyaWVzLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgdmFyIG5hbWUgPSBlbnRyeS5uYW1lLFxuICAgICAgICBzdGFydFRpbWUgPSBlbnRyeS5zdGFydFRpbWUsXG4gICAgICAgIGR1cmF0aW9uID0gZW50cnkuZHVyYXRpb247XG5cbiAgICBpZiAoc3RhcnRUaW1lIDwgbWV0cmljcy5mY3ApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmFtZSAhPT0gJ3NlbGYnICYmIG5hbWUuaW5kZXhPZignc2FtZS1vcmlnaW4nKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtZXRyaWNzLnRidC5zdGFydCA9IE1hdGgubWluKG1ldHJpY3MudGJ0LnN0YXJ0LCBzdGFydFRpbWUpO1xuICAgIHZhciBibG9ja2luZ1RpbWUgPSBkdXJhdGlvbiAtIExPTkdfVEFTS19USFJFU0hPTEQ7XG5cbiAgICBpZiAoYmxvY2tpbmdUaW1lID4gMCkge1xuICAgICAgbWV0cmljcy50YnQuZHVyYXRpb24gKz0gYmxvY2tpbmdUaW1lO1xuICAgIH1cbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlQ3VtdWxhdGl2ZUxheW91dFNoaWZ0KGNsc0VudHJpZXMpIHtcbiAgY2xzRW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgIGlmICghZW50cnkuaGFkUmVjZW50SW5wdXQgJiYgZW50cnkudmFsdWUpIHtcbiAgICAgIHZhciBzaG91bGRDcmVhdGVOZXdTZXNzaW9uID0gZW50cnkuc3RhcnRUaW1lIC0gbWV0cmljcy5jbHMuZmlyc3RFbnRyeVRpbWUgPiA1MDAwIHx8IGVudHJ5LnN0YXJ0VGltZSAtIG1ldHJpY3MuY2xzLnByZXZFbnRyeVRpbWUgPiAxMDAwO1xuXG4gICAgICBpZiAoc2hvdWxkQ3JlYXRlTmV3U2Vzc2lvbikge1xuICAgICAgICBtZXRyaWNzLmNscy5maXJzdEVudHJ5VGltZSA9IGVudHJ5LnN0YXJ0VGltZTtcbiAgICAgICAgbWV0cmljcy5jbHMuY3VycmVudFNlc3Npb25TY29yZSA9IDA7XG4gICAgICB9XG5cbiAgICAgIG1ldHJpY3MuY2xzLnByZXZFbnRyeVRpbWUgPSBlbnRyeS5zdGFydFRpbWU7XG4gICAgICBtZXRyaWNzLmNscy5jdXJyZW50U2Vzc2lvblNjb3JlICs9IGVudHJ5LnZhbHVlO1xuICAgICAgbWV0cmljcy5jbHMuc2NvcmUgPSBNYXRoLm1heChtZXRyaWNzLmNscy5zY29yZSwgbWV0cmljcy5jbHMuY3VycmVudFNlc3Npb25TY29yZSk7XG4gICAgfVxuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlT2JzZXJ2ZXJFbnRyaWVzKGxpc3QsIF9yZWYpIHtcbiAgdmFyIGlzSGFyZE5hdmlnYXRpb24gPSBfcmVmLmlzSGFyZE5hdmlnYXRpb24sXG4gICAgICB0clN0YXJ0ID0gX3JlZi50clN0YXJ0O1xuICB2YXIgbG9uZ3Rhc2tFbnRyaWVzID0gbGlzdC5nZXRFbnRyaWVzQnlUeXBlKExPTkdfVEFTSykuZmlsdGVyKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgIHJldHVybiBlbnRyeS5zdGFydFRpbWUgPj0gdHJTdGFydDtcbiAgfSk7XG4gIHZhciBsb25nVGFza1NwYW5zID0gY3JlYXRlTG9uZ1Rhc2tTcGFucyhsb25ndGFza0VudHJpZXMsIG1ldHJpY3MubG9uZ3Rhc2spO1xuICB2YXIgcmVzdWx0ID0ge1xuICAgIHNwYW5zOiBsb25nVGFza1NwYW5zLFxuICAgIG1hcmtzOiB7fVxuICB9O1xuXG4gIGlmICghaXNIYXJkTmF2aWdhdGlvbikge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgbGNwRW50cmllcyA9IGxpc3QuZ2V0RW50cmllc0J5VHlwZShMQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlQpO1xuICB2YXIgbGFzdExjcEVudHJ5ID0gbGNwRW50cmllc1tsY3BFbnRyaWVzLmxlbmd0aCAtIDFdO1xuXG4gIGlmIChsYXN0TGNwRW50cnkpIHtcbiAgICB2YXIgbGNwID0gcGFyc2VJbnQobGFzdExjcEVudHJ5LnN0YXJ0VGltZSk7XG4gICAgbWV0cmljcy5sY3AgPSBsY3A7XG4gICAgcmVzdWx0Lm1hcmtzLmxhcmdlc3RDb250ZW50ZnVsUGFpbnQgPSBsY3A7XG4gIH1cblxuICB2YXIgdGltaW5nID0gUEVSRi50aW1pbmc7XG4gIHZhciB1bmxvYWREaWZmID0gdGltaW5nLmZldGNoU3RhcnQgLSB0aW1pbmcubmF2aWdhdGlvblN0YXJ0O1xuICB2YXIgZmNwRW50cnkgPSBsaXN0LmdldEVudHJpZXNCeU5hbWUoRklSU1RfQ09OVEVOVEZVTF9QQUlOVClbMF07XG5cbiAgaWYgKGZjcEVudHJ5KSB7XG4gICAgdmFyIGZjcCA9IHBhcnNlSW50KHVubG9hZERpZmYgPj0gMCA/IGZjcEVudHJ5LnN0YXJ0VGltZSAtIHVubG9hZERpZmYgOiBmY3BFbnRyeS5zdGFydFRpbWUpO1xuICAgIG1ldHJpY3MuZmNwID0gZmNwO1xuICAgIHJlc3VsdC5tYXJrcy5maXJzdENvbnRlbnRmdWxQYWludCA9IGZjcDtcbiAgfVxuXG4gIHZhciBmaWRFbnRyaWVzID0gbGlzdC5nZXRFbnRyaWVzQnlUeXBlKEZJUlNUX0lOUFVUKTtcbiAgdmFyIGZpZFNwYW4gPSBjcmVhdGVGaXJzdElucHV0RGVsYXlTcGFuKGZpZEVudHJpZXMpO1xuXG4gIGlmIChmaWRTcGFuKSB7XG4gICAgbWV0cmljcy5maWQgPSBmaWRTcGFuLmR1cmF0aW9uKCk7XG4gICAgcmVzdWx0LnNwYW5zLnB1c2goZmlkU3Bhbik7XG4gIH1cblxuICBjYWxjdWxhdGVUb3RhbEJsb2NraW5nVGltZShsb25ndGFza0VudHJpZXMpO1xuICB2YXIgY2xzRW50cmllcyA9IGxpc3QuZ2V0RW50cmllc0J5VHlwZShMQVlPVVRfU0hJRlQpO1xuICBjYWxjdWxhdGVDdW11bGF0aXZlTGF5b3V0U2hpZnQoY2xzRW50cmllcyk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnQgdmFyIFBlcmZFbnRyeVJlY29yZGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQZXJmRW50cnlSZWNvcmRlcihjYWxsYmFjaykge1xuICAgIHRoaXMucG8gPSB7XG4gICAgICBvYnNlcnZlOiBub29wLFxuICAgICAgZGlzY29ubmVjdDogbm9vcFxuICAgIH07XG5cbiAgICBpZiAod2luZG93LlBlcmZvcm1hbmNlT2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMucG8gPSBuZXcgUGVyZm9ybWFuY2VPYnNlcnZlcihjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgdmFyIF9wcm90byA9IFBlcmZFbnRyeVJlY29yZGVyLnByb3RvdHlwZTtcblxuICBfcHJvdG8uc3RhcnQgPSBmdW5jdGlvbiBzdGFydCh0eXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucG8ub2JzZXJ2ZSh7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGJ1ZmZlcmVkOiB0cnVlXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChfKSB7fVxuICB9O1xuXG4gIF9wcm90by5zdG9wID0gZnVuY3Rpb24gc3RvcCgpIHtcbiAgICB0aGlzLnBvLmRpc2Nvbm5lY3QoKTtcbiAgfTtcblxuICByZXR1cm4gUGVyZkVudHJ5UmVjb3JkZXI7XG59KCk7IiwiaW1wb3J0IHsgY2hlY2tTYW1lT3JpZ2luLCBpc0R0SGVhZGVyVmFsaWQsIHBhcnNlRHRIZWFkZXJWYWx1ZSwgZ2V0RHRIZWFkZXJWYWx1ZSwgZ2V0VFNIZWFkZXJWYWx1ZSwgc3RyaXBRdWVyeVN0cmluZ0Zyb21VcmwsIHNldFJlcXVlc3RIZWFkZXIgfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSAnLi4vY29tbW9uL3VybCc7XG5pbXBvcnQgeyBwYXRjaEV2ZW50SGFuZGxlciB9IGZyb20gJy4uL2NvbW1vbi9wYXRjaGluZyc7XG5pbXBvcnQgeyBnbG9iYWxTdGF0ZSB9IGZyb20gJy4uL2NvbW1vbi9wYXRjaGluZy9wYXRjaC11dGlscyc7XG5pbXBvcnQgeyBTQ0hFRFVMRSwgSU5WT0tFLCBUUkFOU0FDVElPTl9FTkQsIEFGVEVSX0VWRU5ULCBGRVRDSCwgSElTVE9SWSwgWE1MSFRUUFJFUVVFU1QsIEVWRU5UX1RBUkdFVCwgSFRUUF9SRVFVRVNUX1RZUEUsIFVTRVJfSU5URVJBQ1RJT04sIE9VVENPTUVfRkFJTFVSRSwgT1VUQ09NRV9TVUNDRVNTLCBRVUVVRV9BRERfVFJBTlNBQ1RJT04gfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IHRydW5jYXRlTW9kZWwsIFNQQU5fTU9ERUwsIFRSQU5TQUNUSU9OX01PREVMIH0gZnJvbSAnLi4vY29tbW9uL3RydW5jYXRlJztcbmltcG9ydCB7IF9fREVWX18gfSBmcm9tICcuLi9zdGF0ZSc7XG52YXIgU0lNSUxBUl9TUEFOX1RPX1RSQU5TQUNUSU9OX1JBVElPID0gMC4wNTtcbnZhciBUUkFOU0FDVElPTl9EVVJBVElPTl9USFJFU0hPTEQgPSA2MDAwMDtcbmV4cG9ydCBmdW5jdGlvbiBncm91cFNtYWxsQ29udGludW91c2x5U2ltaWxhclNwYW5zKG9yaWdpbmFsU3BhbnMsIHRyYW5zRHVyYXRpb24sIHRocmVzaG9sZCkge1xuICBvcmlnaW5hbFNwYW5zLnNvcnQoZnVuY3Rpb24gKHNwYW5BLCBzcGFuQikge1xuICAgIHJldHVybiBzcGFuQS5fc3RhcnQgLSBzcGFuQi5fc3RhcnQ7XG4gIH0pO1xuICB2YXIgc3BhbnMgPSBbXTtcbiAgdmFyIGxhc3RDb3VudCA9IDE7XG4gIG9yaWdpbmFsU3BhbnMuZm9yRWFjaChmdW5jdGlvbiAoc3BhbiwgaW5kZXgpIHtcbiAgICBpZiAoc3BhbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBzcGFucy5wdXNoKHNwYW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbGFzdFNwYW4gPSBzcGFuc1tzcGFucy5sZW5ndGggLSAxXTtcbiAgICAgIHZhciBpc0NvbnRpbnVvdXNseVNpbWlsYXIgPSBsYXN0U3Bhbi50eXBlID09PSBzcGFuLnR5cGUgJiYgbGFzdFNwYW4uc3VidHlwZSA9PT0gc3Bhbi5zdWJ0eXBlICYmIGxhc3RTcGFuLmFjdGlvbiA9PT0gc3Bhbi5hY3Rpb24gJiYgbGFzdFNwYW4ubmFtZSA9PT0gc3Bhbi5uYW1lICYmIHNwYW4uZHVyYXRpb24oKSAvIHRyYW5zRHVyYXRpb24gPCB0aHJlc2hvbGQgJiYgKHNwYW4uX3N0YXJ0IC0gbGFzdFNwYW4uX2VuZCkgLyB0cmFuc0R1cmF0aW9uIDwgdGhyZXNob2xkO1xuICAgICAgdmFyIGlzTGFzdFNwYW4gPSBvcmlnaW5hbFNwYW5zLmxlbmd0aCA9PT0gaW5kZXggKyAxO1xuXG4gICAgICBpZiAoaXNDb250aW51b3VzbHlTaW1pbGFyKSB7XG4gICAgICAgIGxhc3RDb3VudCsrO1xuICAgICAgICBsYXN0U3Bhbi5fZW5kID0gc3Bhbi5fZW5kO1xuICAgICAgfVxuXG4gICAgICBpZiAobGFzdENvdW50ID4gMSAmJiAoIWlzQ29udGludW91c2x5U2ltaWxhciB8fCBpc0xhc3RTcGFuKSkge1xuICAgICAgICBsYXN0U3Bhbi5uYW1lID0gbGFzdENvdW50ICsgJ3ggJyArIGxhc3RTcGFuLm5hbWU7XG4gICAgICAgIGxhc3RDb3VudCA9IDE7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNDb250aW51b3VzbHlTaW1pbGFyKSB7XG4gICAgICAgIHNwYW5zLnB1c2goc3Bhbik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHNwYW5zO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFkanVzdFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKSB7XG4gIGlmICh0cmFuc2FjdGlvbi5zYW1wbGVkKSB7XG4gICAgdmFyIGZpbHRlcmRTcGFucyA9IHRyYW5zYWN0aW9uLnNwYW5zLmZpbHRlcihmdW5jdGlvbiAoc3Bhbikge1xuICAgICAgcmV0dXJuIHNwYW4uZHVyYXRpb24oKSA+IDAgJiYgc3Bhbi5fc3RhcnQgPj0gdHJhbnNhY3Rpb24uX3N0YXJ0ICYmIHNwYW4uX2VuZCA8PSB0cmFuc2FjdGlvbi5fZW5kO1xuICAgIH0pO1xuXG4gICAgaWYgKHRyYW5zYWN0aW9uLmlzTWFuYWdlZCgpKSB7XG4gICAgICB2YXIgZHVyYXRpb24gPSB0cmFuc2FjdGlvbi5kdXJhdGlvbigpO1xuICAgICAgdmFyIHNpbWlsYXJTcGFucyA9IGdyb3VwU21hbGxDb250aW51b3VzbHlTaW1pbGFyU3BhbnMoZmlsdGVyZFNwYW5zLCBkdXJhdGlvbiwgU0lNSUxBUl9TUEFOX1RPX1RSQU5TQUNUSU9OX1JBVElPKTtcbiAgICAgIHRyYW5zYWN0aW9uLnNwYW5zID0gc2ltaWxhclNwYW5zO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmFuc2FjdGlvbi5zcGFucyA9IGZpbHRlcmRTcGFucztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdHJhbnNhY3Rpb24ucmVzZXRGaWVsZHMoKTtcbiAgfVxuXG4gIHJldHVybiB0cmFuc2FjdGlvbjtcbn1cblxudmFyIFBlcmZvcm1hbmNlTW9uaXRvcmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGVyZm9ybWFuY2VNb25pdG9yaW5nKGFwbVNlcnZlciwgY29uZmlnU2VydmljZSwgbG9nZ2luZ1NlcnZpY2UsIHRyYW5zYWN0aW9uU2VydmljZSkge1xuICAgIHRoaXMuX2FwbVNlcnZlciA9IGFwbVNlcnZlcjtcbiAgICB0aGlzLl9jb25maWdTZXJ2aWNlID0gY29uZmlnU2VydmljZTtcbiAgICB0aGlzLl9sb2dnaW5TZXJ2aWNlID0gbG9nZ2luZ1NlcnZpY2U7XG4gICAgdGhpcy5fdHJhbnNhY3Rpb25TZXJ2aWNlID0gdHJhbnNhY3Rpb25TZXJ2aWNlO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFBlcmZvcm1hbmNlTW9uaXRvcmluZy5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmluaXQgPSBmdW5jdGlvbiBpbml0KGZsYWdzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmIChmbGFncyA9PT0gdm9pZCAwKSB7XG4gICAgICBmbGFncyA9IHt9O1xuICAgIH1cblxuICAgIHRoaXMuX2NvbmZpZ1NlcnZpY2UuZXZlbnRzLm9ic2VydmUoVFJBTlNBQ1RJT05fRU5EICsgQUZURVJfRVZFTlQsIGZ1bmN0aW9uICh0cikge1xuICAgICAgdmFyIHBheWxvYWQgPSBfdGhpcy5jcmVhdGVUcmFuc2FjdGlvblBheWxvYWQodHIpO1xuXG4gICAgICBpZiAocGF5bG9hZCkge1xuICAgICAgICBfdGhpcy5fYXBtU2VydmVyLmFkZFRyYW5zYWN0aW9uKHBheWxvYWQpO1xuXG4gICAgICAgIF90aGlzLl9jb25maWdTZXJ2aWNlLmRpc3BhdGNoRXZlbnQoUVVFVUVfQUREX1RSQU5TQUNUSU9OKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChmbGFnc1tISVNUT1JZXSkge1xuICAgICAgcGF0Y2hFdmVudEhhbmRsZXIub2JzZXJ2ZShISVNUT1JZLCB0aGlzLmdldEhpc3RvcnlTdWIoKSk7XG4gICAgfVxuXG4gICAgaWYgKGZsYWdzW1hNTEhUVFBSRVFVRVNUXSkge1xuICAgICAgcGF0Y2hFdmVudEhhbmRsZXIub2JzZXJ2ZShYTUxIVFRQUkVRVUVTVCwgdGhpcy5nZXRYSFJTdWIoKSk7XG4gICAgfVxuXG4gICAgaWYgKGZsYWdzW0ZFVENIXSkge1xuICAgICAgcGF0Y2hFdmVudEhhbmRsZXIub2JzZXJ2ZShGRVRDSCwgdGhpcy5nZXRGZXRjaFN1YigpKTtcbiAgICB9XG5cbiAgICBpZiAoZmxhZ3NbRVZFTlRfVEFSR0VUXSkge1xuICAgICAgcGF0Y2hFdmVudEhhbmRsZXIub2JzZXJ2ZShFVkVOVF9UQVJHRVQsIHRoaXMuZ2V0RXZlbnRUYXJnZXRTdWIoKSk7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5nZXRFdmVudFRhcmdldFN1YiA9IGZ1bmN0aW9uIGdldEV2ZW50VGFyZ2V0U3ViKCkge1xuICAgIHZhciB0cmFuc2FjdGlvblNlcnZpY2UgPSB0aGlzLl90cmFuc2FjdGlvblNlcnZpY2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCwgdGFzaykge1xuICAgICAgaWYgKGV2ZW50ID09PSBTQ0hFRFVMRSAmJiB0YXNrLnNvdXJjZSA9PT0gRVZFTlRfVEFSR0VUICYmIHRhc2suZXZlbnRUeXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0YXNrLnRhcmdldDtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB2YXIgdHJhbnNhY3Rpb25OYW1lID0gdGFnTmFtZTtcblxuICAgICAgICBpZiAoISF0YXJnZXQuZGF0YXNldC50cmFuc2FjdGlvbk5hbWUpIHtcbiAgICAgICAgICB0cmFuc2FjdGlvbk5hbWUgPSB0YXJnZXQuZGF0YXNldC50cmFuc2FjdGlvbk5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIG5hbWUgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG5cbiAgICAgICAgICBpZiAoISFuYW1lKSB7XG4gICAgICAgICAgICB0cmFuc2FjdGlvbk5hbWUgPSB0YWdOYW1lICsgXCJbXFxcIlwiICsgbmFtZSArIFwiXFxcIl1cIjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdHIgPSB0cmFuc2FjdGlvblNlcnZpY2Uuc3RhcnRUcmFuc2FjdGlvbihcIkNsaWNrIC0gXCIgKyB0cmFuc2FjdGlvbk5hbWUsIFVTRVJfSU5URVJBQ1RJT04sIHtcbiAgICAgICAgICBtYW5hZ2VkOiB0cnVlLFxuICAgICAgICAgIGNhblJldXNlOiB0cnVlLFxuICAgICAgICAgIHJldXNlVGhyZXNob2xkOiAzMDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRyKSB7XG4gICAgICAgICAgdmFyIGNsYXNzZXMgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdjbGFzcycpO1xuXG4gICAgICAgICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgICAgICAgIHRyLmFkZENvbnRleHQoe1xuICAgICAgICAgICAgICBjdXN0b206IHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzOiBjbGFzc2VzXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgX3Byb3RvLmdldEhpc3RvcnlTdWIgPSBmdW5jdGlvbiBnZXRIaXN0b3J5U3ViKCkge1xuICAgIHZhciB0cmFuc2FjdGlvblNlcnZpY2UgPSB0aGlzLl90cmFuc2FjdGlvblNlcnZpY2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCwgdGFzaykge1xuICAgICAgaWYgKHRhc2suc291cmNlID09PSBISVNUT1JZICYmIGV2ZW50ID09PSBJTlZPS0UpIHtcbiAgICAgICAgdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0VHJhbnNhY3Rpb24odGFzay5kYXRhLnRpdGxlLCAncm91dGUtY2hhbmdlJywge1xuICAgICAgICAgIG1hbmFnZWQ6IHRydWUsXG4gICAgICAgICAgY2FuUmV1c2U6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBfcHJvdG8uZ2V0WEhSU3ViID0gZnVuY3Rpb24gZ2V0WEhSU3ViKCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCwgdGFzaykge1xuICAgICAgaWYgKHRhc2suc291cmNlID09PSBYTUxIVFRQUkVRVUVTVCAmJiAhZ2xvYmFsU3RhdGUuZmV0Y2hJblByb2dyZXNzKSB7XG4gICAgICAgIF90aGlzMi5wcm9jZXNzQVBJQ2FsbHMoZXZlbnQsIHRhc2spO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgX3Byb3RvLmdldEZldGNoU3ViID0gZnVuY3Rpb24gZ2V0RmV0Y2hTdWIoKSB7XG4gICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50LCB0YXNrKSB7XG4gICAgICBpZiAodGFzay5zb3VyY2UgPT09IEZFVENIKSB7XG4gICAgICAgIF90aGlzMy5wcm9jZXNzQVBJQ2FsbHMoZXZlbnQsIHRhc2spO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgX3Byb3RvLnByb2Nlc3NBUElDYWxscyA9IGZ1bmN0aW9uIHByb2Nlc3NBUElDYWxscyhldmVudCwgdGFzaykge1xuICAgIHZhciBjb25maWdTZXJ2aWNlID0gdGhpcy5fY29uZmlnU2VydmljZTtcbiAgICB2YXIgdHJhbnNhY3Rpb25TZXJ2aWNlID0gdGhpcy5fdHJhbnNhY3Rpb25TZXJ2aWNlO1xuXG4gICAgaWYgKHRhc2suZGF0YSAmJiB0YXNrLmRhdGEudXJsKSB7XG4gICAgICB2YXIgZW5kcG9pbnRzID0gdGhpcy5fYXBtU2VydmVyLmdldEVuZHBvaW50cygpO1xuXG4gICAgICB2YXIgaXNPd25FbmRwb2ludCA9IE9iamVjdC5rZXlzKGVuZHBvaW50cykuc29tZShmdW5jdGlvbiAoZW5kcG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIHRhc2suZGF0YS51cmwuaW5kZXhPZihlbmRwb2ludHNbZW5kcG9pbnRdKSAhPT0gLTE7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGlzT3duRW5kcG9pbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChldmVudCA9PT0gU0NIRURVTEUgJiYgdGFzay5kYXRhKSB7XG4gICAgICB2YXIgZGF0YSA9IHRhc2suZGF0YTtcbiAgICAgIHZhciByZXF1ZXN0VXJsID0gbmV3IFVybChkYXRhLnVybCk7XG4gICAgICB2YXIgc3Bhbk5hbWUgPSBkYXRhLm1ldGhvZCArICcgJyArIChyZXF1ZXN0VXJsLnJlbGF0aXZlID8gcmVxdWVzdFVybC5wYXRoIDogc3RyaXBRdWVyeVN0cmluZ0Zyb21VcmwocmVxdWVzdFVybC5ocmVmKSk7XG5cbiAgICAgIGlmICghdHJhbnNhY3Rpb25TZXJ2aWNlLmdldEN1cnJlbnRUcmFuc2FjdGlvbigpKSB7XG4gICAgICAgIHRyYW5zYWN0aW9uU2VydmljZS5zdGFydFRyYW5zYWN0aW9uKHNwYW5OYW1lLCBIVFRQX1JFUVVFU1RfVFlQRSwge1xuICAgICAgICAgIG1hbmFnZWQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzcGFuID0gdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0U3BhbihzcGFuTmFtZSwgJ2V4dGVybmFsLmh0dHAnLCB7XG4gICAgICAgIGJsb2NraW5nOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgaWYgKCFzcGFuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGlzRHRFbmFibGVkID0gY29uZmlnU2VydmljZS5nZXQoJ2Rpc3RyaWJ1dGVkVHJhY2luZycpO1xuICAgICAgdmFyIGR0T3JpZ2lucyA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdkaXN0cmlidXRlZFRyYWNpbmdPcmlnaW5zJyk7XG4gICAgICB2YXIgY3VycmVudFVybCA9IG5ldyBVcmwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgdmFyIGlzU2FtZU9yaWdpbiA9IGNoZWNrU2FtZU9yaWdpbihyZXF1ZXN0VXJsLm9yaWdpbiwgY3VycmVudFVybC5vcmlnaW4pIHx8IGNoZWNrU2FtZU9yaWdpbihyZXF1ZXN0VXJsLm9yaWdpbiwgZHRPcmlnaW5zKTtcbiAgICAgIHZhciB0YXJnZXQgPSBkYXRhLnRhcmdldDtcblxuICAgICAgaWYgKGlzRHRFbmFibGVkICYmIGlzU2FtZU9yaWdpbiAmJiB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5pbmplY3REdEhlYWRlcihzcGFuLCB0YXJnZXQpO1xuICAgICAgICB2YXIgcHJvcGFnYXRlVHJhY2VzdGF0ZSA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdwcm9wYWdhdGVUcmFjZXN0YXRlJyk7XG5cbiAgICAgICAgaWYgKHByb3BhZ2F0ZVRyYWNlc3RhdGUpIHtcbiAgICAgICAgICB0aGlzLmluamVjdFRTSGVhZGVyKHNwYW4sIHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoX19ERVZfXykge1xuICAgICAgICB0aGlzLl9sb2dnaW5TZXJ2aWNlLmRlYnVnKFwiQ291bGQgbm90IGluamVjdCBkaXN0cmlidXRlZCB0cmFjaW5nIGhlYWRlciB0byB0aGUgcmVxdWVzdCBvcmlnaW4gKCdcIiArIHJlcXVlc3RVcmwub3JpZ2luICsgXCInKSBmcm9tIHRoZSBjdXJyZW50IG9yaWdpbiAoJ1wiICsgY3VycmVudFVybC5vcmlnaW4gKyBcIicpXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5zeW5jKSB7XG4gICAgICAgIHNwYW4uc3luYyA9IGRhdGEuc3luYztcbiAgICAgIH1cblxuICAgICAgZGF0YS5zcGFuID0gc3BhbjtcbiAgICB9IGVsc2UgaWYgKGV2ZW50ID09PSBJTlZPS0UpIHtcbiAgICAgIHZhciBfZGF0YSA9IHRhc2suZGF0YTtcblxuICAgICAgaWYgKF9kYXRhICYmIF9kYXRhLnNwYW4pIHtcbiAgICAgICAgdmFyIF9zcGFuID0gX2RhdGEuc3BhbixcbiAgICAgICAgICAgIHJlc3BvbnNlID0gX2RhdGEucmVzcG9uc2UsXG4gICAgICAgICAgICBfdGFyZ2V0ID0gX2RhdGEudGFyZ2V0O1xuICAgICAgICB2YXIgc3RhdHVzO1xuXG4gICAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICAgIHN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0dXMgPSBfdGFyZ2V0LnN0YXR1cztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvdXRjb21lO1xuXG4gICAgICAgIGlmIChfZGF0YS5zdGF0dXMgIT0gJ2Fib3J0Jykge1xuICAgICAgICAgIGlmIChzdGF0dXMgPj0gNDAwIHx8IHN0YXR1cyA9PSAwKSB7XG4gICAgICAgICAgICBvdXRjb21lID0gT1VUQ09NRV9GQUlMVVJFO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRjb21lID0gT1VUQ09NRV9TVUNDRVNTO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF9zcGFuLm91dGNvbWUgPSBvdXRjb21lO1xuICAgICAgICB2YXIgdHIgPSB0cmFuc2FjdGlvblNlcnZpY2UuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG5cbiAgICAgICAgaWYgKHRyICYmIHRyLnR5cGUgPT09IEhUVFBfUkVRVUVTVF9UWVBFKSB7XG4gICAgICAgICAgdHIub3V0Y29tZSA9IG91dGNvbWU7XG4gICAgICAgIH1cblxuICAgICAgICB0cmFuc2FjdGlvblNlcnZpY2UuZW5kU3Bhbihfc3BhbiwgX2RhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uaW5qZWN0RHRIZWFkZXIgPSBmdW5jdGlvbiBpbmplY3REdEhlYWRlcihzcGFuLCB0YXJnZXQpIHtcbiAgICB2YXIgaGVhZGVyTmFtZSA9IHRoaXMuX2NvbmZpZ1NlcnZpY2UuZ2V0KCdkaXN0cmlidXRlZFRyYWNpbmdIZWFkZXJOYW1lJyk7XG5cbiAgICB2YXIgaGVhZGVyVmFsdWUgPSBnZXREdEhlYWRlclZhbHVlKHNwYW4pO1xuICAgIHZhciBpc0hlYWRlclZhbGlkID0gaXNEdEhlYWRlclZhbGlkKGhlYWRlclZhbHVlKTtcblxuICAgIGlmIChpc0hlYWRlclZhbGlkICYmIGhlYWRlclZhbHVlICYmIGhlYWRlck5hbWUpIHtcbiAgICAgIHNldFJlcXVlc3RIZWFkZXIodGFyZ2V0LCBoZWFkZXJOYW1lLCBoZWFkZXJWYWx1ZSk7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5pbmplY3RUU0hlYWRlciA9IGZ1bmN0aW9uIGluamVjdFRTSGVhZGVyKHNwYW4sIHRhcmdldCkge1xuICAgIHZhciBoZWFkZXJWYWx1ZSA9IGdldFRTSGVhZGVyVmFsdWUoc3Bhbik7XG5cbiAgICBpZiAoaGVhZGVyVmFsdWUpIHtcbiAgICAgIHNldFJlcXVlc3RIZWFkZXIodGFyZ2V0LCAndHJhY2VzdGF0ZScsIGhlYWRlclZhbHVlKTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLmV4dHJhY3REdEhlYWRlciA9IGZ1bmN0aW9uIGV4dHJhY3REdEhlYWRlcih0YXJnZXQpIHtcbiAgICB2YXIgY29uZmlnU2VydmljZSA9IHRoaXMuX2NvbmZpZ1NlcnZpY2U7XG4gICAgdmFyIGhlYWRlck5hbWUgPSBjb25maWdTZXJ2aWNlLmdldCgnZGlzdHJpYnV0ZWRUcmFjaW5nSGVhZGVyTmFtZScpO1xuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgcmV0dXJuIHBhcnNlRHRIZWFkZXJWYWx1ZSh0YXJnZXRbaGVhZGVyTmFtZV0pO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uZmlsdGVyVHJhbnNhY3Rpb24gPSBmdW5jdGlvbiBmaWx0ZXJUcmFuc2FjdGlvbih0cikge1xuICAgIHZhciBkdXJhdGlvbiA9IHRyLmR1cmF0aW9uKCk7XG5cbiAgICBpZiAoIWR1cmF0aW9uKSB7XG4gICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IFwidHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIikgd2FzIGRpc2NhcmRlZCEgXCI7XG5cbiAgICAgICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgICAgICAgbWVzc2FnZSArPSBcIlRyYW5zYWN0aW9uIGR1cmF0aW9uIGlzIDBcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZXNzYWdlICs9IFwiVHJhbnNhY3Rpb24gd2Fzbid0IGVuZGVkXCI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9sb2dnaW5TZXJ2aWNlLmRlYnVnKG1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRyLmlzTWFuYWdlZCgpKSB7XG4gICAgICBpZiAoZHVyYXRpb24gPiBUUkFOU0FDVElPTl9EVVJBVElPTl9USFJFU0hPTEQpIHtcbiAgICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICB0aGlzLl9sb2dnaW5TZXJ2aWNlLmRlYnVnKFwidHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIikgd2FzIGRpc2NhcmRlZCEgVHJhbnNhY3Rpb24gZHVyYXRpb24gKFwiICsgZHVyYXRpb24gKyBcIikgaXMgZ3JlYXRlciB0aGFuIG1hbmFnZWQgdHJhbnNhY3Rpb24gdGhyZXNob2xkIChcIiArIFRSQU5TQUNUSU9OX0RVUkFUSU9OX1RIUkVTSE9MRCArIFwiKVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRyLnNhbXBsZWQgJiYgdHIuc3BhbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgICAgdGhpcy5fbG9nZ2luU2VydmljZS5kZWJ1ZyhcInRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIpIHdhcyBkaXNjYXJkZWQhIFRyYW5zYWN0aW9uIGRvZXMgbm90IGhhdmUgYW55IHNwYW5zXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIF9wcm90by5jcmVhdGVUcmFuc2FjdGlvbkRhdGFNb2RlbCA9IGZ1bmN0aW9uIGNyZWF0ZVRyYW5zYWN0aW9uRGF0YU1vZGVsKHRyYW5zYWN0aW9uKSB7XG4gICAgdmFyIHRyYW5zYWN0aW9uU3RhcnQgPSB0cmFuc2FjdGlvbi5fc3RhcnQ7XG4gICAgdmFyIHNwYW5zID0gdHJhbnNhY3Rpb24uc3BhbnMubWFwKGZ1bmN0aW9uIChzcGFuKSB7XG4gICAgICB2YXIgc3BhbkRhdGEgPSB7XG4gICAgICAgIGlkOiBzcGFuLmlkLFxuICAgICAgICB0cmFuc2FjdGlvbl9pZDogdHJhbnNhY3Rpb24uaWQsXG4gICAgICAgIHBhcmVudF9pZDogc3Bhbi5wYXJlbnRJZCB8fCB0cmFuc2FjdGlvbi5pZCxcbiAgICAgICAgdHJhY2VfaWQ6IHRyYW5zYWN0aW9uLnRyYWNlSWQsXG4gICAgICAgIG5hbWU6IHNwYW4ubmFtZSxcbiAgICAgICAgdHlwZTogc3Bhbi50eXBlLFxuICAgICAgICBzdWJ0eXBlOiBzcGFuLnN1YnR5cGUsXG4gICAgICAgIGFjdGlvbjogc3Bhbi5hY3Rpb24sXG4gICAgICAgIHN5bmM6IHNwYW4uc3luYyxcbiAgICAgICAgc3RhcnQ6IHBhcnNlSW50KHNwYW4uX3N0YXJ0IC0gdHJhbnNhY3Rpb25TdGFydCksXG4gICAgICAgIGR1cmF0aW9uOiBzcGFuLmR1cmF0aW9uKCksXG4gICAgICAgIGNvbnRleHQ6IHNwYW4uY29udGV4dCxcbiAgICAgICAgb3V0Y29tZTogc3Bhbi5vdXRjb21lLFxuICAgICAgICBzYW1wbGVfcmF0ZTogc3Bhbi5zYW1wbGVSYXRlXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRydW5jYXRlTW9kZWwoU1BBTl9NT0RFTCwgc3BhbkRhdGEpO1xuICAgIH0pO1xuICAgIHZhciB0cmFuc2FjdGlvbkRhdGEgPSB7XG4gICAgICBpZDogdHJhbnNhY3Rpb24uaWQsXG4gICAgICB0cmFjZV9pZDogdHJhbnNhY3Rpb24udHJhY2VJZCxcbiAgICAgIHNlc3Npb246IHRyYW5zYWN0aW9uLnNlc3Npb24sXG4gICAgICBuYW1lOiB0cmFuc2FjdGlvbi5uYW1lLFxuICAgICAgdHlwZTogdHJhbnNhY3Rpb24udHlwZSxcbiAgICAgIGR1cmF0aW9uOiB0cmFuc2FjdGlvbi5kdXJhdGlvbigpLFxuICAgICAgc3BhbnM6IHNwYW5zLFxuICAgICAgY29udGV4dDogdHJhbnNhY3Rpb24uY29udGV4dCxcbiAgICAgIG1hcmtzOiB0cmFuc2FjdGlvbi5tYXJrcyxcbiAgICAgIGJyZWFrZG93bjogdHJhbnNhY3Rpb24uYnJlYWtkb3duVGltaW5ncyxcbiAgICAgIHNwYW5fY291bnQ6IHtcbiAgICAgICAgc3RhcnRlZDogc3BhbnMubGVuZ3RoXG4gICAgICB9LFxuICAgICAgc2FtcGxlZDogdHJhbnNhY3Rpb24uc2FtcGxlZCxcbiAgICAgIHNhbXBsZV9yYXRlOiB0cmFuc2FjdGlvbi5zYW1wbGVSYXRlLFxuICAgICAgZXhwZXJpZW5jZTogdHJhbnNhY3Rpb24uZXhwZXJpZW5jZSxcbiAgICAgIG91dGNvbWU6IHRyYW5zYWN0aW9uLm91dGNvbWVcbiAgICB9O1xuICAgIHJldHVybiB0cnVuY2F0ZU1vZGVsKFRSQU5TQUNUSU9OX01PREVMLCB0cmFuc2FjdGlvbkRhdGEpO1xuICB9O1xuXG4gIF9wcm90by5jcmVhdGVUcmFuc2FjdGlvblBheWxvYWQgPSBmdW5jdGlvbiBjcmVhdGVUcmFuc2FjdGlvblBheWxvYWQodHJhbnNhY3Rpb24pIHtcbiAgICB2YXIgYWRqdXN0ZWRUcmFuc2FjdGlvbiA9IGFkanVzdFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKTtcbiAgICB2YXIgZmlsdGVyZWQgPSB0aGlzLmZpbHRlclRyYW5zYWN0aW9uKGFkanVzdGVkVHJhbnNhY3Rpb24pO1xuXG4gICAgaWYgKGZpbHRlcmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVUcmFuc2FjdGlvbkRhdGFNb2RlbCh0cmFuc2FjdGlvbik7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBQZXJmb3JtYW5jZU1vbml0b3Jpbmc7XG59KCk7XG5cbmV4cG9ydCB7IFBlcmZvcm1hbmNlTW9uaXRvcmluZyBhcyBkZWZhdWx0IH07IiwiaW1wb3J0IHsgZ2VuZXJhdGVSYW5kb21JZCwgc2V0TGFiZWwsIG1lcmdlLCBnZXREdXJhdGlvbiwgZ2V0VGltZSB9IGZyb20gJy4uL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBOQU1FX1VOS05PV04sIFRZUEVfQ1VTVE9NIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbnZhciBTcGFuQmFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU3BhbkJhc2UobmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIG5hbWUgPSBOQU1FX1VOS05PV047XG4gICAgfVxuXG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0eXBlID0gVFlQRV9DVVNUT007XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQgfHwgZ2VuZXJhdGVSYW5kb21JZCgxNik7XG4gICAgdGhpcy50cmFjZUlkID0gb3B0aW9ucy50cmFjZUlkO1xuICAgIHRoaXMuc2FtcGxlZCA9IG9wdGlvbnMuc2FtcGxlZDtcbiAgICB0aGlzLnNhbXBsZVJhdGUgPSBvcHRpb25zLnNhbXBsZVJhdGU7XG4gICAgdGhpcy50aW1lc3RhbXAgPSBvcHRpb25zLnRpbWVzdGFtcDtcbiAgICB0aGlzLl9zdGFydCA9IGdldFRpbWUob3B0aW9ucy5zdGFydFRpbWUpO1xuICAgIHRoaXMuX2VuZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gICAgdGhpcy5vdXRjb21lID0gdW5kZWZpbmVkO1xuICAgIHRoaXMub25FbmQgPSBvcHRpb25zLm9uRW5kO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFNwYW5CYXNlLnByb3RvdHlwZTtcblxuICBfcHJvdG8uZW5zdXJlQ29udGV4dCA9IGZ1bmN0aW9uIGVuc3VyZUNvbnRleHQoKSB7XG4gICAgaWYgKCF0aGlzLmNvbnRleHQpIHtcbiAgICAgIHRoaXMuY29udGV4dCA9IHt9O1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uYWRkTGFiZWxzID0gZnVuY3Rpb24gYWRkTGFiZWxzKHRhZ3MpIHtcbiAgICB0aGlzLmVuc3VyZUNvbnRleHQoKTtcbiAgICB2YXIgY3R4ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgaWYgKCFjdHgudGFncykge1xuICAgICAgY3R4LnRhZ3MgPSB7fTtcbiAgICB9XG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRhZ3MpO1xuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIHNldExhYmVsKGssIHRhZ3Nba10sIGN0eC50YWdzKTtcbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uYWRkQ29udGV4dCA9IGZ1bmN0aW9uIGFkZENvbnRleHQoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGNvbnRleHQgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBjb250ZXh0W19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIHRoaXMuZW5zdXJlQ29udGV4dCgpO1xuICAgIG1lcmdlLmFwcGx5KHZvaWQgMCwgW3RoaXMuY29udGV4dF0uY29uY2F0KGNvbnRleHQpKTtcbiAgfTtcblxuICBfcHJvdG8uZW5kID0gZnVuY3Rpb24gZW5kKGVuZFRpbWUpIHtcbiAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgIHRoaXMuX2VuZCA9IGdldFRpbWUoZW5kVGltZSk7XG4gICAgdGhpcy5jYWxsT25FbmQoKTtcbiAgfTtcblxuICBfcHJvdG8uY2FsbE9uRW5kID0gZnVuY3Rpb24gY2FsbE9uRW5kKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5vbkVuZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vbkVuZCh0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLmR1cmF0aW9uID0gZnVuY3Rpb24gZHVyYXRpb24oKSB7XG4gICAgcmV0dXJuIGdldER1cmF0aW9uKHRoaXMuX3N0YXJ0LCB0aGlzLl9lbmQpO1xuICB9O1xuXG4gIHJldHVybiBTcGFuQmFzZTtcbn0oKTtcblxuZXhwb3J0IGRlZmF1bHQgU3BhbkJhc2U7IiwiZnVuY3Rpb24gX2luaGVyaXRzTG9vc2Uoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7IHN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHN1YkNsYXNzOyBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5cbmltcG9ydCBTcGFuQmFzZSBmcm9tICcuL3NwYW4tYmFzZSc7XG5pbXBvcnQgeyBhZGRTcGFuQ29udGV4dCB9IGZyb20gJy4uL2NvbW1vbi9jb250ZXh0JztcblxudmFyIFNwYW4gPSBmdW5jdGlvbiAoX1NwYW5CYXNlKSB7XG4gIF9pbmhlcml0c0xvb3NlKFNwYW4sIF9TcGFuQmFzZSk7XG5cbiAgZnVuY3Rpb24gU3BhbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzO1xuXG4gICAgX3RoaXMgPSBfU3BhbkJhc2UuY2FsbCh0aGlzLCBuYW1lLCB0eXBlLCBvcHRpb25zKSB8fCB0aGlzO1xuICAgIF90aGlzLnBhcmVudElkID0gX3RoaXMub3B0aW9ucy5wYXJlbnRJZDtcbiAgICBfdGhpcy5zdWJ0eXBlID0gdW5kZWZpbmVkO1xuICAgIF90aGlzLmFjdGlvbiA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChfdGhpcy50eXBlLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgIHZhciBmaWVsZHMgPSBfdGhpcy50eXBlLnNwbGl0KCcuJywgMyk7XG5cbiAgICAgIF90aGlzLnR5cGUgPSBmaWVsZHNbMF07XG4gICAgICBfdGhpcy5zdWJ0eXBlID0gZmllbGRzWzFdO1xuICAgICAgX3RoaXMuYWN0aW9uID0gZmllbGRzWzJdO1xuICAgIH1cblxuICAgIF90aGlzLnN5bmMgPSBfdGhpcy5vcHRpb25zLnN5bmM7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFNwYW4ucHJvdG90eXBlO1xuXG4gIF9wcm90by5lbmQgPSBmdW5jdGlvbiBlbmQoZW5kVGltZSwgZGF0YSkge1xuICAgIF9TcGFuQmFzZS5wcm90b3R5cGUuZW5kLmNhbGwodGhpcywgZW5kVGltZSk7XG5cbiAgICBhZGRTcGFuQ29udGV4dCh0aGlzLCBkYXRhKTtcbiAgfTtcblxuICByZXR1cm4gU3Bhbjtcbn0oU3BhbkJhc2UpO1xuXG5leHBvcnQgZGVmYXVsdCBTcGFuOyIsImltcG9ydCB7IFByb21pc2UgfSBmcm9tICcuLi9jb21tb24vcG9seWZpbGxzJztcbmltcG9ydCBUcmFuc2FjdGlvbiBmcm9tICcuL3RyYW5zYWN0aW9uJztcbmltcG9ydCB7IFBlcmZFbnRyeVJlY29yZGVyLCBjYXB0dXJlT2JzZXJ2ZXJFbnRyaWVzLCBtZXRyaWNzLCBjcmVhdGVUb3RhbEJsb2NraW5nVGltZVNwYW4gfSBmcm9tICcuL21ldHJpY3MnO1xuaW1wb3J0IHsgZXh0ZW5kLCBnZXRFYXJsaWVzdFNwYW4sIGdldExhdGVzdE5vblhIUlNwYW4sIGdldExhdGVzdFhIUlNwYW4sIGlzUGVyZlR5cGVTdXBwb3J0ZWQsIGdlbmVyYXRlUmFuZG9tSWQgfSBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHsgY2FwdHVyZU5hdmlnYXRpb24gfSBmcm9tICcuL2NhcHR1cmUtbmF2aWdhdGlvbic7XG5pbXBvcnQgeyBQQUdFX0xPQUQsIE5BTUVfVU5LTk9XTiwgVFJBTlNBQ1RJT05fU1RBUlQsIFRSQU5TQUNUSU9OX0VORCwgVEVNUE9SQVJZX1RZUEUsIFRSQU5TQUNUSU9OX1RZUEVfT1JERVIsIExBUkdFU1RfQ09OVEVOVEZVTF9QQUlOVCwgTE9OR19UQVNLLCBQQUlOVCwgVFJVTkNBVEVEX1RZUEUsIEZJUlNUX0lOUFVULCBMQVlPVVRfU0hJRlQsIFNFU1NJT05fVElNRU9VVCwgUEFHRV9MT0FEX0RFTEFZIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBhZGRUcmFuc2FjdGlvbkNvbnRleHQgfSBmcm9tICcuLi9jb21tb24vY29udGV4dCc7XG5pbXBvcnQgeyBfX0RFVl9fLCBzdGF0ZSB9IGZyb20gJy4uL3N0YXRlJztcbmltcG9ydCB7IHNsdWdpZnlVcmwgfSBmcm9tICcuLi9jb21tb24vdXJsJztcblxudmFyIFRyYW5zYWN0aW9uU2VydmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gVHJhbnNhY3Rpb25TZXJ2aWNlKGxvZ2dlciwgY29uZmlnKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9sb2dnZXIgPSBsb2dnZXI7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5yZXNwSW50ZXJ2YWxJZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnJlY29yZGVyID0gbmV3IFBlcmZFbnRyeVJlY29yZGVyKGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICB2YXIgdHIgPSBfdGhpcy5nZXRDdXJyZW50VHJhbnNhY3Rpb24oKTtcblxuICAgICAgaWYgKHRyICYmIHRyLmNhcHR1cmVUaW1pbmdzKSB7XG4gICAgICAgIHZhciBfdHIkc3BhbnM7XG5cbiAgICAgICAgdmFyIGlzSGFyZE5hdmlnYXRpb24gPSB0ci50eXBlID09PSBQQUdFX0xPQUQ7XG5cbiAgICAgICAgdmFyIF9jYXB0dXJlT2JzZXJ2ZXJFbnRyaSA9IGNhcHR1cmVPYnNlcnZlckVudHJpZXMobGlzdCwge1xuICAgICAgICAgIGlzSGFyZE5hdmlnYXRpb246IGlzSGFyZE5hdmlnYXRpb24sXG4gICAgICAgICAgdHJTdGFydDogaXNIYXJkTmF2aWdhdGlvbiA/IDAgOiB0ci5fc3RhcnRcbiAgICAgICAgfSksXG4gICAgICAgICAgICBzcGFucyA9IF9jYXB0dXJlT2JzZXJ2ZXJFbnRyaS5zcGFucyxcbiAgICAgICAgICAgIG1hcmtzID0gX2NhcHR1cmVPYnNlcnZlckVudHJpLm1hcmtzO1xuXG4gICAgICAgIChfdHIkc3BhbnMgPSB0ci5zcGFucykucHVzaC5hcHBseShfdHIkc3BhbnMsIHNwYW5zKTtcblxuICAgICAgICB0ci5hZGRNYXJrcyh7XG4gICAgICAgICAgYWdlbnQ6IG1hcmtzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIF9wcm90byA9IFRyYW5zYWN0aW9uU2VydmljZS5wcm90b3R5cGU7XG5cbiAgX3Byb3RvLmNyZWF0ZUN1cnJlbnRUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIGNyZWF0ZUN1cnJlbnRUcmFuc2FjdGlvbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIHRyID0gbmV3IFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIG9wdGlvbnMpO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9uID0gdHI7XG4gICAgcmV0dXJuIHRyO1xuICB9O1xuXG4gIF9wcm90by5nZXRDdXJyZW50VHJhbnNhY3Rpb24gPSBmdW5jdGlvbiBnZXRDdXJyZW50VHJhbnNhY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFRyYW5zYWN0aW9uICYmICF0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbi5lbmRlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRyYW5zYWN0aW9uO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uY3JlYXRlT3B0aW9ucyA9IGZ1bmN0aW9uIGNyZWF0ZU9wdGlvbnMob3B0aW9ucykge1xuICAgIHZhciBjb25maWcgPSB0aGlzLl9jb25maWcuY29uZmlnO1xuICAgIHZhciBwcmVzZXRPcHRpb25zID0ge1xuICAgICAgdHJhbnNhY3Rpb25TYW1wbGVSYXRlOiBjb25maWcudHJhbnNhY3Rpb25TYW1wbGVSYXRlXG4gICAgfTtcbiAgICB2YXIgcGVyZk9wdGlvbnMgPSBleHRlbmQocHJlc2V0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICBpZiAocGVyZk9wdGlvbnMubWFuYWdlZCkge1xuICAgICAgcGVyZk9wdGlvbnMgPSBleHRlbmQoe1xuICAgICAgICBwYWdlTG9hZFRyYWNlSWQ6IGNvbmZpZy5wYWdlTG9hZFRyYWNlSWQsXG4gICAgICAgIHBhZ2VMb2FkU2FtcGxlZDogY29uZmlnLnBhZ2VMb2FkU2FtcGxlZCxcbiAgICAgICAgcGFnZUxvYWRTcGFuSWQ6IGNvbmZpZy5wYWdlTG9hZFNwYW5JZCxcbiAgICAgICAgcGFnZUxvYWRUcmFuc2FjdGlvbk5hbWU6IGNvbmZpZy5wYWdlTG9hZFRyYW5zYWN0aW9uTmFtZVxuICAgICAgfSwgcGVyZk9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBwZXJmT3B0aW9ucztcbiAgfTtcblxuICBfcHJvdG8uc3RhcnRNYW5hZ2VkVHJhbnNhY3Rpb24gPSBmdW5jdGlvbiBzdGFydE1hbmFnZWRUcmFuc2FjdGlvbihuYW1lLCB0eXBlLCBwZXJmT3B0aW9ucykge1xuICAgIHZhciB0ciA9IHRoaXMuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG4gICAgdmFyIGlzUmVkZWZpbmVkID0gZmFsc2U7XG5cbiAgICBpZiAoIXRyKSB7XG4gICAgICB0ciA9IHRoaXMuY3JlYXRlQ3VycmVudFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKHRyLmNhblJldXNlKCkgJiYgcGVyZk9wdGlvbnMuY2FuUmV1c2UpIHtcbiAgICAgIHZhciByZWRlZmluZVR5cGUgPSB0ci50eXBlO1xuICAgICAgdmFyIGN1cnJlbnRUeXBlT3JkZXIgPSBUUkFOU0FDVElPTl9UWVBFX09SREVSLmluZGV4T2YodHIudHlwZSk7XG4gICAgICB2YXIgcmVkZWZpbmVUeXBlT3JkZXIgPSBUUkFOU0FDVElPTl9UWVBFX09SREVSLmluZGV4T2YodHlwZSk7XG5cbiAgICAgIGlmIChjdXJyZW50VHlwZU9yZGVyID49IDAgJiYgcmVkZWZpbmVUeXBlT3JkZXIgPCBjdXJyZW50VHlwZU9yZGVyKSB7XG4gICAgICAgIHJlZGVmaW5lVHlwZSA9IHR5cGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgIHRoaXMuX2xvZ2dlci5kZWJ1ZyhcInJlZGVmaW5pbmcgdHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIiwgXCIgKyB0ci50eXBlICsgXCIpXCIsICd0bycsIFwiKFwiICsgKG5hbWUgfHwgdHIubmFtZSkgKyBcIiwgXCIgKyByZWRlZmluZVR5cGUgKyBcIilcIiwgdHIpO1xuICAgICAgfVxuXG4gICAgICB0ci5yZWRlZmluZShuYW1lLCByZWRlZmluZVR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICAgIGlzUmVkZWZpbmVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKFwiZW5kaW5nIHByZXZpb3VzIHRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIpXCIsIHRyKTtcbiAgICAgIH1cblxuICAgICAgdHIuZW5kKCk7XG4gICAgICB0ciA9IHRoaXMuY3JlYXRlQ3VycmVudFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAodHIudHlwZSA9PT0gUEFHRV9MT0FEKSB7XG4gICAgICBpZiAoIWlzUmVkZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVjb3JkZXIuc3RhcnQoTEFSR0VTVF9DT05URU5URlVMX1BBSU5UKTtcbiAgICAgICAgdGhpcy5yZWNvcmRlci5zdGFydChQQUlOVCk7XG4gICAgICAgIHRoaXMucmVjb3JkZXIuc3RhcnQoRklSU1RfSU5QVVQpO1xuICAgICAgICB0aGlzLnJlY29yZGVyLnN0YXJ0KExBWU9VVF9TSElGVCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwZXJmT3B0aW9ucy5wYWdlTG9hZFRyYWNlSWQpIHtcbiAgICAgICAgdHIudHJhY2VJZCA9IHBlcmZPcHRpb25zLnBhZ2VMb2FkVHJhY2VJZDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBlcmZPcHRpb25zLnBhZ2VMb2FkU2FtcGxlZCkge1xuICAgICAgICB0ci5zYW1wbGVkID0gcGVyZk9wdGlvbnMucGFnZUxvYWRTYW1wbGVkO1xuICAgICAgfVxuXG4gICAgICBpZiAodHIubmFtZSA9PT0gTkFNRV9VTktOT1dOICYmIHBlcmZPcHRpb25zLnBhZ2VMb2FkVHJhbnNhY3Rpb25OYW1lKSB7XG4gICAgICAgIHRyLm5hbWUgPSBwZXJmT3B0aW9ucy5wYWdlTG9hZFRyYW5zYWN0aW9uTmFtZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlzUmVkZWZpbmVkICYmIHRoaXMuX2NvbmZpZy5nZXQoJ21vbml0b3JMb25ndGFza3MnKSkge1xuICAgICAgdGhpcy5yZWNvcmRlci5zdGFydChMT05HX1RBU0spO1xuICAgIH1cblxuICAgIGlmICh0ci5zYW1wbGVkKSB7XG4gICAgICB0ci5jYXB0dXJlVGltaW5ncyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyO1xuICB9O1xuXG4gIF9wcm90by5zdGFydFRyYW5zYWN0aW9uID0gZnVuY3Rpb24gc3RhcnRUcmFuc2FjdGlvbihuYW1lLCB0eXBlLCBvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICB2YXIgcGVyZk9wdGlvbnMgPSB0aGlzLmNyZWF0ZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgdmFyIHRyO1xuICAgIHZhciBmaXJlT25zdGFydEhvb2sgPSB0cnVlO1xuXG4gICAgaWYgKHBlcmZPcHRpb25zLm1hbmFnZWQpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50VHJhbnNhY3Rpb247XG4gICAgICB0ciA9IHRoaXMuc3RhcnRNYW5hZ2VkVHJhbnNhY3Rpb24obmFtZSwgdHlwZSwgcGVyZk9wdGlvbnMpO1xuXG4gICAgICBpZiAoY3VycmVudCA9PT0gdHIpIHtcbiAgICAgICAgZmlyZU9uc3RhcnRIb29rID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyID0gbmV3IFRyYW5zYWN0aW9uKG5hbWUsIHR5cGUsIHBlcmZPcHRpb25zKTtcbiAgICB9XG5cbiAgICB0ci5vbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpczIuaGFuZGxlVHJhbnNhY3Rpb25FbmQodHIpO1xuICAgIH07XG5cbiAgICBpZiAoZmlyZU9uc3RhcnRIb29rKSB7XG4gICAgICBpZiAoX19ERVZfXykge1xuICAgICAgICB0aGlzLl9sb2dnZXIuZGVidWcoXCJzdGFydFRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIsIFwiICsgdHIudHlwZSArIFwiKVwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY29uZmlnLmV2ZW50cy5zZW5kKFRSQU5TQUNUSU9OX1NUQVJULCBbdHJdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHI7XG4gIH07XG5cbiAgX3Byb3RvLmhhbmRsZVRyYW5zYWN0aW9uRW5kID0gZnVuY3Rpb24gaGFuZGxlVHJhbnNhY3Rpb25FbmQodHIpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIHRoaXMucmVjb3JkZXIuc3RvcCgpO1xuICAgIHZhciBjdXJyZW50VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5hbWUgPSB0ci5uYW1lLFxuICAgICAgICAgIHR5cGUgPSB0ci50eXBlO1xuICAgICAgdmFyIGxhc3RIaWRkZW5TdGFydCA9IHN0YXRlLmxhc3RIaWRkZW5TdGFydDtcblxuICAgICAgaWYgKGxhc3RIaWRkZW5TdGFydCA+PSB0ci5fc3RhcnQpIHtcbiAgICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgICBfdGhpczMuX2xvZ2dlci5kZWJ1ZyhcInRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyBuYW1lICsgXCIsIFwiICsgdHlwZSArIFwiKSB3YXMgZGlzY2FyZGVkISBUaGUgcGFnZSB3YXMgaGlkZGVuIGR1cmluZyB0aGUgdHJhbnNhY3Rpb24hXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoX3RoaXMzLnNob3VsZElnbm9yZVRyYW5zYWN0aW9uKG5hbWUpIHx8IHR5cGUgPT09IFRFTVBPUkFSWV9UWVBFKSB7XG4gICAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgICAgX3RoaXMzLl9sb2dnZXIuZGVidWcoXCJ0cmFuc2FjdGlvbihcIiArIHRyLmlkICsgXCIsIFwiICsgbmFtZSArIFwiLCBcIiArIHR5cGUgKyBcIikgaXMgaWdub3JlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT09IFBBR0VfTE9BRCkge1xuICAgICAgICB2YXIgcGFnZUxvYWRUcmFuc2FjdGlvbk5hbWUgPSBfdGhpczMuX2NvbmZpZy5nZXQoJ3BhZ2VMb2FkVHJhbnNhY3Rpb25OYW1lJyk7XG5cbiAgICAgICAgaWYgKG5hbWUgPT09IE5BTUVfVU5LTk9XTiAmJiBwYWdlTG9hZFRyYW5zYWN0aW9uTmFtZSkge1xuICAgICAgICAgIHRyLm5hbWUgPSBwYWdlTG9hZFRyYW5zYWN0aW9uTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ci5jYXB0dXJlVGltaW5ncykge1xuICAgICAgICAgIHZhciBjbHMgPSBtZXRyaWNzLmNscyxcbiAgICAgICAgICAgICAgZmlkID0gbWV0cmljcy5maWQsXG4gICAgICAgICAgICAgIHRidCA9IG1ldHJpY3MudGJ0LFxuICAgICAgICAgICAgICBsb25ndGFzayA9IG1ldHJpY3MubG9uZ3Rhc2s7XG5cbiAgICAgICAgICBpZiAodGJ0LmR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgdHIuc3BhbnMucHVzaChjcmVhdGVUb3RhbEJsb2NraW5nVGltZVNwYW4odGJ0KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdHIuZXhwZXJpZW5jZSA9IHt9O1xuXG4gICAgICAgICAgaWYgKGlzUGVyZlR5cGVTdXBwb3J0ZWQoTE9OR19UQVNLKSkge1xuICAgICAgICAgICAgdHIuZXhwZXJpZW5jZS50YnQgPSB0YnQuZHVyYXRpb247XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzUGVyZlR5cGVTdXBwb3J0ZWQoTEFZT1VUX1NISUZUKSkge1xuICAgICAgICAgICAgdHIuZXhwZXJpZW5jZS5jbHMgPSBjbHMuc2NvcmU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGZpZCA+IDApIHtcbiAgICAgICAgICAgIHRyLmV4cGVyaWVuY2UuZmlkID0gZmlkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChsb25ndGFzay5jb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRyLmV4cGVyaWVuY2UubG9uZ3Rhc2sgPSB7XG4gICAgICAgICAgICAgIGNvdW50OiBsb25ndGFzay5jb3VudCxcbiAgICAgICAgICAgICAgc3VtOiBsb25ndGFzay5kdXJhdGlvbixcbiAgICAgICAgICAgICAgbWF4OiBsb25ndGFzay5tYXhcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMzLnNldFNlc3Npb24odHIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHIubmFtZSA9PT0gTkFNRV9VTktOT1dOKSB7XG4gICAgICAgIHRyLm5hbWUgPSBzbHVnaWZ5VXJsKGN1cnJlbnRVcmwpO1xuICAgICAgfVxuXG4gICAgICBjYXB0dXJlTmF2aWdhdGlvbih0cik7XG5cbiAgICAgIF90aGlzMy5hZGp1c3RUcmFuc2FjdGlvblRpbWUodHIpO1xuXG4gICAgICB2YXIgYnJlYWtkb3duTWV0cmljcyA9IF90aGlzMy5fY29uZmlnLmdldCgnYnJlYWtkb3duTWV0cmljcycpO1xuXG4gICAgICBpZiAoYnJlYWtkb3duTWV0cmljcykge1xuICAgICAgICB0ci5jYXB0dXJlQnJlYWtkb3duKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjb25maWdDb250ZXh0ID0gX3RoaXMzLl9jb25maWcuZ2V0KCdjb250ZXh0Jyk7XG5cbiAgICAgIGFkZFRyYW5zYWN0aW9uQ29udGV4dCh0ciwgY29uZmlnQ29udGV4dCk7XG5cbiAgICAgIF90aGlzMy5fY29uZmlnLmV2ZW50cy5zZW5kKFRSQU5TQUNUSU9OX0VORCwgW3RyXSk7XG5cbiAgICAgIGlmIChfX0RFVl9fKSB7XG4gICAgICAgIF90aGlzMy5fbG9nZ2VyLmRlYnVnKFwiZW5kIHRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIsIFwiICsgdHIudHlwZSArIFwiKVwiLCB0cik7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgaWYgKF9fREVWX18pIHtcbiAgICAgICAgX3RoaXMzLl9sb2dnZXIuZGVidWcoXCJlcnJvciBlbmRpbmcgdHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIilcIiwgZXJyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBfcHJvdG8uc2V0U2Vzc2lvbiA9IGZ1bmN0aW9uIHNldFNlc3Npb24odHIpIHtcbiAgICB2YXIgc2Vzc2lvbiA9IHRoaXMuX2NvbmZpZy5nZXQoJ3Nlc3Npb24nKTtcblxuICAgIGlmIChzZXNzaW9uKSB7XG4gICAgICBpZiAodHlwZW9mIHNlc3Npb24gPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRyLnNlc3Npb24gPSB7XG4gICAgICAgICAgaWQ6IGdlbmVyYXRlUmFuZG9tSWQoMTYpLFxuICAgICAgICAgIHNlcXVlbmNlOiAxXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2Vzc2lvbi50aW1lc3RhbXAgJiYgRGF0ZS5ub3coKSAtIHNlc3Npb24udGltZXN0YW1wID4gU0VTU0lPTl9USU1FT1VUKSB7XG4gICAgICAgICAgdHIuc2Vzc2lvbiA9IHtcbiAgICAgICAgICAgIGlkOiBnZW5lcmF0ZVJhbmRvbUlkKDE2KSxcbiAgICAgICAgICAgIHNlcXVlbmNlOiAxXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ci5zZXNzaW9uID0ge1xuICAgICAgICAgICAgaWQ6IHNlc3Npb24uaWQsXG4gICAgICAgICAgICBzZXF1ZW5jZTogc2Vzc2lvbi5zZXF1ZW5jZSA/IHNlc3Npb24uc2VxdWVuY2UgKyAxIDogMVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHNlc3Npb25Db25maWcgPSB7XG4gICAgICAgIHNlc3Npb246IHtcbiAgICAgICAgICBpZDogdHIuc2Vzc2lvbi5pZCxcbiAgICAgICAgICBzZXF1ZW5jZTogdHIuc2Vzc2lvbi5zZXF1ZW5jZSxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5fY29uZmlnLnNldENvbmZpZyhzZXNzaW9uQ29uZmlnKTtcblxuICAgICAgdGhpcy5fY29uZmlnLnNldExvY2FsQ29uZmlnKHNlc3Npb25Db25maWcsIHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBfcHJvdG8uYWRqdXN0VHJhbnNhY3Rpb25UaW1lID0gZnVuY3Rpb24gYWRqdXN0VHJhbnNhY3Rpb25UaW1lKHRyYW5zYWN0aW9uKSB7XG4gICAgdmFyIHNwYW5zID0gdHJhbnNhY3Rpb24uc3BhbnM7XG4gICAgdmFyIGVhcmxpZXN0U3BhbiA9IGdldEVhcmxpZXN0U3BhbihzcGFucyk7XG5cbiAgICBpZiAoZWFybGllc3RTcGFuICYmIGVhcmxpZXN0U3Bhbi5fc3RhcnQgPCB0cmFuc2FjdGlvbi5fc3RhcnQpIHtcbiAgICAgIHRyYW5zYWN0aW9uLl9zdGFydCA9IGVhcmxpZXN0U3Bhbi5fc3RhcnQ7XG4gICAgfVxuXG4gICAgdmFyIGxhdGVzdFNwYW4gPSBnZXRMYXRlc3ROb25YSFJTcGFuKHNwYW5zKSB8fCB7fTtcbiAgICB2YXIgbGF0ZXN0U3BhbkVuZCA9IGxhdGVzdFNwYW4uX2VuZCB8fCAwO1xuXG4gICAgaWYgKHRyYW5zYWN0aW9uLnR5cGUgPT09IFBBR0VfTE9BRCkge1xuICAgICAgdmFyIHRyYW5zYWN0aW9uRW5kV2l0aG91dERlbGF5ID0gdHJhbnNhY3Rpb24uX2VuZCAtIFBBR0VfTE9BRF9ERUxBWTtcbiAgICAgIHZhciBsY3AgPSBtZXRyaWNzLmxjcCB8fCAwO1xuICAgICAgdmFyIGxhdGVzdFhIUlNwYW4gPSBnZXRMYXRlc3RYSFJTcGFuKHNwYW5zKSB8fCB7fTtcbiAgICAgIHZhciBsYXRlc3RYSFJTcGFuRW5kID0gbGF0ZXN0WEhSU3Bhbi5fZW5kIHx8IDA7XG4gICAgICB0cmFuc2FjdGlvbi5fZW5kID0gTWF0aC5tYXgobGF0ZXN0U3BhbkVuZCwgbGF0ZXN0WEhSU3BhbkVuZCwgbGNwLCB0cmFuc2FjdGlvbkVuZFdpdGhvdXREZWxheSk7XG4gICAgfSBlbHNlIGlmIChsYXRlc3RTcGFuRW5kID4gdHJhbnNhY3Rpb24uX2VuZCkge1xuICAgICAgdHJhbnNhY3Rpb24uX2VuZCA9IGxhdGVzdFNwYW5FbmQ7XG4gICAgfVxuXG4gICAgdGhpcy50cnVuY2F0ZVNwYW5zKHNwYW5zLCB0cmFuc2FjdGlvbi5fZW5kKTtcbiAgfTtcblxuICBfcHJvdG8udHJ1bmNhdGVTcGFucyA9IGZ1bmN0aW9uIHRydW5jYXRlU3BhbnMoc3BhbnMsIHRyYW5zYWN0aW9uRW5kKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNwYW4gPSBzcGFuc1tpXTtcblxuICAgICAgaWYgKHNwYW4uX2VuZCA+IHRyYW5zYWN0aW9uRW5kKSB7XG4gICAgICAgIHNwYW4uX2VuZCA9IHRyYW5zYWN0aW9uRW5kO1xuICAgICAgICBzcGFuLnR5cGUgKz0gVFJVTkNBVEVEX1RZUEU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcGFuLl9zdGFydCA+IHRyYW5zYWN0aW9uRW5kKSB7XG4gICAgICAgIHNwYW4uX3N0YXJ0ID0gdHJhbnNhY3Rpb25FbmQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5zaG91bGRJZ25vcmVUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIHNob3VsZElnbm9yZVRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uTmFtZSkge1xuICAgIHZhciBpZ25vcmVMaXN0ID0gdGhpcy5fY29uZmlnLmdldCgnaWdub3JlVHJhbnNhY3Rpb25zJyk7XG5cbiAgICBpZiAoaWdub3JlTGlzdCAmJiBpZ25vcmVMaXN0Lmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZ25vcmVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gaWdub3JlTGlzdFtpXTtcblxuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQudGVzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmIChlbGVtZW50LnRlc3QodHJhbnNhY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQgPT09IHRyYW5zYWN0aW9uTmFtZSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIF9wcm90by5zdGFydFNwYW4gPSBmdW5jdGlvbiBzdGFydFNwYW4obmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIHZhciB0ciA9IHRoaXMuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG5cbiAgICBpZiAoIXRyKSB7XG4gICAgICB0ciA9IHRoaXMuY3JlYXRlQ3VycmVudFRyYW5zYWN0aW9uKHVuZGVmaW5lZCwgVEVNUE9SQVJZX1RZUEUsIHRoaXMuY3JlYXRlT3B0aW9ucyh7XG4gICAgICAgIGNhblJldXNlOiB0cnVlLFxuICAgICAgICBtYW5hZ2VkOiB0cnVlXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgdmFyIHNwYW4gPSB0ci5zdGFydFNwYW4obmFtZSwgdHlwZSwgb3B0aW9ucyk7XG5cbiAgICBpZiAoX19ERVZfXykge1xuICAgICAgdGhpcy5fbG9nZ2VyLmRlYnVnKFwic3RhcnRTcGFuKFwiICsgbmFtZSArIFwiLCBcIiArIHNwYW4udHlwZSArIFwiKVwiLCBcIm9uIHRyYW5zYWN0aW9uKFwiICsgdHIuaWQgKyBcIiwgXCIgKyB0ci5uYW1lICsgXCIpXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBzcGFuO1xuICB9O1xuXG4gIF9wcm90by5lbmRTcGFuID0gZnVuY3Rpb24gZW5kU3BhbihzcGFuLCBjb250ZXh0KSB7XG4gICAgaWYgKCFzcGFuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKF9fREVWX18pIHtcbiAgICAgIHZhciB0ciA9IHRoaXMuZ2V0Q3VycmVudFRyYW5zYWN0aW9uKCk7XG4gICAgICB0ciAmJiB0aGlzLl9sb2dnZXIuZGVidWcoXCJlbmRTcGFuKFwiICsgc3Bhbi5uYW1lICsgXCIsIFwiICsgc3Bhbi50eXBlICsgXCIpXCIsIFwib24gdHJhbnNhY3Rpb24oXCIgKyB0ci5pZCArIFwiLCBcIiArIHRyLm5hbWUgKyBcIilcIik7XG4gICAgfVxuXG4gICAgc3Bhbi5lbmQobnVsbCwgY29udGV4dCk7XG4gIH07XG5cbiAgcmV0dXJuIFRyYW5zYWN0aW9uU2VydmljZTtcbn0oKTtcblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNhY3Rpb25TZXJ2aWNlOyIsImZ1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpOyBzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBzdWJDbGFzczsgX3NldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTsgfVxuXG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgby5fX3Byb3RvX18gPSBwOyByZXR1cm4gbzsgfTsgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTsgfVxuXG5pbXBvcnQgU3BhbiBmcm9tICcuL3NwYW4nO1xuaW1wb3J0IFNwYW5CYXNlIGZyb20gJy4vc3Bhbi1iYXNlJztcbmltcG9ydCB7IGdlbmVyYXRlUmFuZG9tSWQsIG1lcmdlLCBub3csIGdldFRpbWUsIGV4dGVuZCwgcmVtb3ZlSW52YWxpZENoYXJzIH0gZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IFJFVVNBQklMSVRZX1RIUkVTSE9MRCwgVFJVTkNBVEVEX1RZUEUgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IGNhcHR1cmVCcmVha2Rvd24gYXMgX2NhcHR1cmVCcmVha2Rvd24gfSBmcm9tICcuL2JyZWFrZG93bic7XG5cbnZhciBUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIChfU3BhbkJhc2UpIHtcbiAgX2luaGVyaXRzTG9vc2UoVHJhbnNhY3Rpb24sIF9TcGFuQmFzZSk7XG5cbiAgZnVuY3Rpb24gVHJhbnNhY3Rpb24obmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIHZhciBfdGhpcztcblxuICAgIF90aGlzID0gX1NwYW5CYXNlLmNhbGwodGhpcywgbmFtZSwgdHlwZSwgb3B0aW9ucykgfHwgdGhpcztcbiAgICBfdGhpcy50cmFjZUlkID0gZ2VuZXJhdGVSYW5kb21JZCgpO1xuICAgIF90aGlzLm1hcmtzID0gdW5kZWZpbmVkO1xuICAgIF90aGlzLnNwYW5zID0gW107XG4gICAgX3RoaXMuX2FjdGl2ZVNwYW5zID0ge307XG4gICAgX3RoaXMuX2FjdGl2ZVRhc2tzID0gbmV3IFNldCgpO1xuICAgIF90aGlzLmJsb2NrZWQgPSBmYWxzZTtcbiAgICBfdGhpcy5jYXB0dXJlVGltaW5ncyA9IGZhbHNlO1xuICAgIF90aGlzLmJyZWFrZG93blRpbWluZ3MgPSBbXTtcbiAgICBfdGhpcy5zYW1wbGVSYXRlID0gX3RoaXMub3B0aW9ucy50cmFuc2FjdGlvblNhbXBsZVJhdGU7XG4gICAgX3RoaXMuc2FtcGxlZCA9IE1hdGgucmFuZG9tKCkgPD0gX3RoaXMuc2FtcGxlUmF0ZTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICB2YXIgX3Byb3RvID0gVHJhbnNhY3Rpb24ucHJvdG90eXBlO1xuXG4gIF9wcm90by5hZGRNYXJrcyA9IGZ1bmN0aW9uIGFkZE1hcmtzKG9iaikge1xuICAgIHRoaXMubWFya3MgPSBtZXJnZSh0aGlzLm1hcmtzIHx8IHt9LCBvYmopO1xuICB9O1xuXG4gIF9wcm90by5tYXJrID0gZnVuY3Rpb24gbWFyayhrZXkpIHtcbiAgICB2YXIgc2tleSA9IHJlbW92ZUludmFsaWRDaGFycyhrZXkpO1xuXG4gICAgdmFyIG1hcmtUaW1lID0gbm93KCkgLSB0aGlzLl9zdGFydDtcblxuICAgIHZhciBjdXN0b20gPSB7fTtcbiAgICBjdXN0b21bc2tleV0gPSBtYXJrVGltZTtcbiAgICB0aGlzLmFkZE1hcmtzKHtcbiAgICAgIGN1c3RvbTogY3VzdG9tXG4gICAgfSk7XG4gIH07XG5cbiAgX3Byb3RvLmNhblJldXNlID0gZnVuY3Rpb24gY2FuUmV1c2UoKSB7XG4gICAgdmFyIHRocmVzaG9sZCA9IHRoaXMub3B0aW9ucy5yZXVzZVRocmVzaG9sZCB8fCBSRVVTQUJJTElUWV9USFJFU0hPTEQ7XG4gICAgcmV0dXJuICEhdGhpcy5vcHRpb25zLmNhblJldXNlICYmICF0aGlzLmVuZGVkICYmIG5vdygpIC0gdGhpcy5fc3RhcnQgPCB0aHJlc2hvbGQ7XG4gIH07XG5cbiAgX3Byb3RvLnJlZGVmaW5lID0gZnVuY3Rpb24gcmVkZWZpbmUobmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIGlmIChuYW1lKSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIGlmICh0eXBlKSB7XG4gICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucmV1c2VUaHJlc2hvbGQgPSBvcHRpb25zLnJldXNlVGhyZXNob2xkO1xuICAgICAgZXh0ZW5kKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgfVxuICB9O1xuXG4gIF9wcm90by5zdGFydFNwYW4gPSBmdW5jdGlvbiBzdGFydFNwYW4obmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuZW5kZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgb3B0cyA9IGV4dGVuZCh7fSwgb3B0aW9ucyk7XG5cbiAgICBvcHRzLm9uRW5kID0gZnVuY3Rpb24gKHRyYykge1xuICAgICAgX3RoaXMyLl9vblNwYW5FbmQodHJjKTtcbiAgICB9O1xuXG4gICAgb3B0cy50cmFjZUlkID0gdGhpcy50cmFjZUlkO1xuICAgIG9wdHMuc2FtcGxlZCA9IHRoaXMuc2FtcGxlZDtcbiAgICBvcHRzLnNhbXBsZVJhdGUgPSB0aGlzLnNhbXBsZVJhdGU7XG5cbiAgICBpZiAoIW9wdHMucGFyZW50SWQpIHtcbiAgICAgIG9wdHMucGFyZW50SWQgPSB0aGlzLmlkO1xuICAgIH1cblxuICAgIHZhciBzcGFuID0gbmV3IFNwYW4obmFtZSwgdHlwZSwgb3B0cyk7XG4gICAgdGhpcy5fYWN0aXZlU3BhbnNbc3Bhbi5pZF0gPSBzcGFuO1xuXG4gICAgaWYgKG9wdHMuYmxvY2tpbmcpIHtcbiAgICAgIHRoaXMuYWRkVGFzayhzcGFuLmlkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3BhbjtcbiAgfTtcblxuICBfcHJvdG8uaXNGaW5pc2hlZCA9IGZ1bmN0aW9uIGlzRmluaXNoZWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmJsb2NrZWQgJiYgdGhpcy5fYWN0aXZlVGFza3Muc2l6ZSA9PT0gMDtcbiAgfTtcblxuICBfcHJvdG8uZGV0ZWN0RmluaXNoID0gZnVuY3Rpb24gZGV0ZWN0RmluaXNoKCkge1xuICAgIGlmICh0aGlzLmlzRmluaXNoZWQoKSkgdGhpcy5lbmQoKTtcbiAgfTtcblxuICBfcHJvdG8uZW5kID0gZnVuY3Rpb24gZW5kKGVuZFRpbWUpIHtcbiAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgIHRoaXMuX2VuZCA9IGdldFRpbWUoZW5kVGltZSk7XG5cbiAgICBmb3IgKHZhciBzaWQgaW4gdGhpcy5fYWN0aXZlU3BhbnMpIHtcbiAgICAgIHZhciBzcGFuID0gdGhpcy5fYWN0aXZlU3BhbnNbc2lkXTtcbiAgICAgIHNwYW4udHlwZSA9IHNwYW4udHlwZSArIFRSVU5DQVRFRF9UWVBFO1xuICAgICAgc3Bhbi5lbmQoZW5kVGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5jYWxsT25FbmQoKTtcbiAgfTtcblxuICBfcHJvdG8uY2FwdHVyZUJyZWFrZG93biA9IGZ1bmN0aW9uIGNhcHR1cmVCcmVha2Rvd24oKSB7XG4gICAgdGhpcy5icmVha2Rvd25UaW1pbmdzID0gX2NhcHR1cmVCcmVha2Rvd24odGhpcyk7XG4gIH07XG5cbiAgX3Byb3RvLmJsb2NrID0gZnVuY3Rpb24gYmxvY2soZmxhZykge1xuICAgIHRoaXMuYmxvY2tlZCA9IGZsYWc7XG5cbiAgICBpZiAoIXRoaXMuYmxvY2tlZCkge1xuICAgICAgdGhpcy5kZXRlY3RGaW5pc2goKTtcbiAgICB9XG4gIH07XG5cbiAgX3Byb3RvLmFkZFRhc2sgPSBmdW5jdGlvbiBhZGRUYXNrKHRhc2tJZCkge1xuICAgIGlmICghdGFza0lkKSB7XG4gICAgICB0YXNrSWQgPSAndGFzay0nICsgZ2VuZXJhdGVSYW5kb21JZCgxNik7XG4gICAgfVxuXG4gICAgdGhpcy5fYWN0aXZlVGFza3MuYWRkKHRhc2tJZCk7XG5cbiAgICByZXR1cm4gdGFza0lkO1xuICB9O1xuXG4gIF9wcm90by5yZW1vdmVUYXNrID0gZnVuY3Rpb24gcmVtb3ZlVGFzayh0YXNrSWQpIHtcbiAgICB2YXIgZGVsZXRlZCA9IHRoaXMuX2FjdGl2ZVRhc2tzLmRlbGV0ZSh0YXNrSWQpO1xuXG4gICAgZGVsZXRlZCAmJiB0aGlzLmRldGVjdEZpbmlzaCgpO1xuICB9O1xuXG4gIF9wcm90by5yZXNldEZpZWxkcyA9IGZ1bmN0aW9uIHJlc2V0RmllbGRzKCkge1xuICAgIHRoaXMuc3BhbnMgPSBbXTtcbiAgICB0aGlzLnNhbXBsZVJhdGUgPSAwO1xuICB9O1xuXG4gIF9wcm90by5fb25TcGFuRW5kID0gZnVuY3Rpb24gX29uU3BhbkVuZChzcGFuKSB7XG4gICAgdGhpcy5zcGFucy5wdXNoKHNwYW4pO1xuICAgIGRlbGV0ZSB0aGlzLl9hY3RpdmVTcGFuc1tzcGFuLmlkXTtcbiAgICB0aGlzLnJlbW92ZVRhc2soc3Bhbi5pZCk7XG4gIH07XG5cbiAgX3Byb3RvLmlzTWFuYWdlZCA9IGZ1bmN0aW9uIGlzTWFuYWdlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLm9wdGlvbnMubWFuYWdlZDtcbiAgfTtcblxuICByZXR1cm4gVHJhbnNhY3Rpb247XG59KFNwYW5CYXNlKTtcblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNhY3Rpb247IiwidmFyIF9fREVWX18gPSBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nO1xuXG52YXIgc3RhdGUgPSB7XG4gIGJvb3RzdHJhcFRpbWU6IG51bGwsXG4gIGxhc3RIaWRkZW5TdGFydDogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVJcbn07XG5leHBvcnQgeyBfX0RFVl9fLCBzdGF0ZSB9OyIsIi8qKlxuICogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTctcHJlc2VudCwgRWxhc3RpY3NlYXJjaCBCVlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKlxuICovXG5cbmltcG9ydCB7XG4gIGdldEluc3RydW1lbnRhdGlvbkZsYWdzLFxuICBQQUdFX0xPQURfREVMQVksXG4gIFBBR0VfTE9BRCxcbiAgRVJST1IsXG4gIENPTkZJR19TRVJWSUNFLFxuICBMT0dHSU5HX1NFUlZJQ0UsXG4gIFRSQU5TQUNUSU9OX1NFUlZJQ0UsXG4gIEFQTV9TRVJWRVIsXG4gIG9ic2VydmVQYWdlVmlzaWJpbGl0eVxufSBmcm9tICdAZWxhc3RpYy9hcG0tcnVtLWNvcmUnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwbUJhc2Uge1xuICBjb25zdHJ1Y3RvcihzZXJ2aWNlRmFjdG9yeSwgZGlzYWJsZSkge1xuICAgIHRoaXMuX2Rpc2FibGUgPSBkaXNhYmxlXG4gICAgdGhpcy5zZXJ2aWNlRmFjdG9yeSA9IHNlcnZpY2VGYWN0b3J5XG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZVxuICB9XG5cbiAgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiAhdGhpcy5fZGlzYWJsZVxuICB9XG5cbiAgaXNBY3RpdmUoKSB7XG4gICAgY29uc3QgY29uZmlnU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShDT05GSUdfU0VSVklDRSlcbiAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQoKSAmJiB0aGlzLl9pbml0aWFsaXplZCAmJiBjb25maWdTZXJ2aWNlLmdldCgnYWN0aXZlJylcbiAgfVxuXG4gIGluaXQoY29uZmlnKSB7XG4gICAgaWYgKHRoaXMuaXNFbmFibGVkKCkgJiYgIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWVcbiAgICAgIGNvbnN0IFtcbiAgICAgICAgY29uZmlnU2VydmljZSxcbiAgICAgICAgbG9nZ2luZ1NlcnZpY2UsXG4gICAgICAgIHRyYW5zYWN0aW9uU2VydmljZVxuICAgICAgXSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShbXG4gICAgICAgIENPTkZJR19TRVJWSUNFLFxuICAgICAgICBMT0dHSU5HX1NFUlZJQ0UsXG4gICAgICAgIFRSQU5TQUNUSU9OX1NFUlZJQ0VcbiAgICAgIF0pXG4gICAgICAvKipcbiAgICAgICAqIFNldCBBZ2VudCB2ZXJzaW9uIHRvIGJlIHNlbnQgYXMgcGFydCBvZiBtZXRhZGF0YSB0byB0aGUgQVBNIFNlcnZlclxuICAgICAgICovXG4gICAgICBjb25maWdTZXJ2aWNlLnNldFZlcnNpb24oJzUuMTEuMCcpXG4gICAgICB0aGlzLmNvbmZpZyhjb25maWcpXG4gICAgICAvKipcbiAgICAgICAqIFNldCBsZXZlbCBoZXJlIHRvIGFjY291bnQgZm9yIGJvdGggYWN0aXZlIGFuZCBpbmFjdGl2ZSBjYXNlc1xuICAgICAgICovXG4gICAgICBjb25zdCBsb2dMZXZlbCA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdsb2dMZXZlbCcpXG4gICAgICBsb2dnaW5nU2VydmljZS5zZXRMZXZlbChsb2dMZXZlbClcbiAgICAgIC8qKlxuICAgICAgICogRGVhY3RpdmUgYWdlbnQgd2hlbiB0aGUgYWN0aXZlIGNvbmZpZyBmbGFnIGlzIHNldCB0byBmYWxzZVxuICAgICAgICovXG4gICAgICBjb25zdCBpc0NvbmZpZ0FjdGl2ZSA9IGNvbmZpZ1NlcnZpY2UuZ2V0KCdhY3RpdmUnKVxuICAgICAgaWYgKGlzQ29uZmlnQWN0aXZlKSB7XG4gICAgICAgIHRoaXMuc2VydmljZUZhY3RvcnkuaW5pdCgpXG5cbiAgICAgICAgY29uc3QgZmxhZ3MgPSBnZXRJbnN0cnVtZW50YXRpb25GbGFncyhcbiAgICAgICAgICBjb25maWdTZXJ2aWNlLmdldCgnaW5zdHJ1bWVudCcpLFxuICAgICAgICAgIGNvbmZpZ1NlcnZpY2UuZ2V0KCdkaXNhYmxlSW5zdHJ1bWVudGF0aW9ucycpXG4gICAgICAgIClcblxuICAgICAgICBjb25zdCBwZXJmb3JtYW5jZU1vbml0b3JpbmcgPSB0aGlzLnNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoXG4gICAgICAgICAgJ1BlcmZvcm1hbmNlTW9uaXRvcmluZydcbiAgICAgICAgKVxuICAgICAgICBwZXJmb3JtYW5jZU1vbml0b3JpbmcuaW5pdChmbGFncylcblxuICAgICAgICBpZiAoZmxhZ3NbRVJST1JdKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JMb2dnaW5nID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKCdFcnJvckxvZ2dpbmcnKVxuICAgICAgICAgIGVycm9yTG9nZ2luZy5yZWdpc3Rlckxpc3RlbmVycygpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlnU2VydmljZS5nZXQoJ3Nlc3Npb24nKSkge1xuICAgICAgICAgIGxldCBsb2NhbENvbmZpZyA9IGNvbmZpZ1NlcnZpY2UuZ2V0TG9jYWxDb25maWcoKVxuICAgICAgICAgIGlmIChsb2NhbENvbmZpZyAmJiBsb2NhbENvbmZpZy5zZXNzaW9uKSB7XG4gICAgICAgICAgICBjb25maWdTZXJ2aWNlLnNldENvbmZpZyh7XG4gICAgICAgICAgICAgIHNlc3Npb246IGxvY2FsQ29uZmlnLnNlc3Npb25cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VuZFBhZ2VMb2FkID0gKCkgPT5cbiAgICAgICAgICBmbGFnc1tQQUdFX0xPQURdICYmIHRoaXMuX3NlbmRQYWdlTG9hZE1ldHJpY3MoKVxuXG4gICAgICAgIGlmIChjb25maWdTZXJ2aWNlLmdldCgnY2VudHJhbENvbmZpZycpKSB7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogV2FpdGluZyBmb3IgdGhlIHJlbW90ZSBjb25maWcgYmVmb3JlIHNlbmRpbmcgdGhlIHBhZ2UgbG9hZCB0cmFuc2FjdGlvblxuICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuZmV0Y2hDZW50cmFsQ29uZmlnKCkudGhlbihzZW5kUGFnZUxvYWQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VuZFBhZ2VMb2FkKClcbiAgICAgICAgfVxuXG4gICAgICAgIG9ic2VydmVQYWdlVmlzaWJpbGl0eShjb25maWdTZXJ2aWNlLCB0cmFuc2FjdGlvblNlcnZpY2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9kaXNhYmxlID0gdHJ1ZVxuICAgICAgICBsb2dnaW5nU2VydmljZS53YXJuKCdSVU0gYWdlbnQgaXMgaW5hY3RpdmUnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIGBmZXRjaENlbnRyYWxDb25maWdgIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBhbHdheXMgcmVzb2x2ZVxuICAgKiBpZiB0aGUgaW50ZXJuYWwgY29uZmlnIGZldGNoIGZhaWxzIHRoZSB0aGUgcHJvbWlzZSByZXNvbHZlcyB0byBgdW5kZWZpbmVkYCBvdGhlcndpc2VcbiAgICogaXQgcmVzb2x2ZXMgdG8gdGhlIGZldGNoZWQgY29uZmlnLlxuICAgKi9cbiAgZmV0Y2hDZW50cmFsQ29uZmlnKCkge1xuICAgIGNvbnN0IFtcbiAgICAgIGFwbVNlcnZlcixcbiAgICAgIGxvZ2dpbmdTZXJ2aWNlLFxuICAgICAgY29uZmlnU2VydmljZVxuICAgIF0gPSB0aGlzLnNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoW1xuICAgICAgQVBNX1NFUlZFUixcbiAgICAgIExPR0dJTkdfU0VSVklDRSxcbiAgICAgIENPTkZJR19TRVJWSUNFXG4gICAgXSlcblxuICAgIHJldHVybiBhcG1TZXJ2ZXJcbiAgICAgIC5mZXRjaENvbmZpZyhcbiAgICAgICAgY29uZmlnU2VydmljZS5nZXQoJ3NlcnZpY2VOYW1lJyksXG4gICAgICAgIGNvbmZpZ1NlcnZpY2UuZ2V0KCdlbnZpcm9ubWVudCcpXG4gICAgICApXG4gICAgICAudGhlbihjb25maWcgPT4ge1xuICAgICAgICB2YXIgdHJhbnNhY3Rpb25TYW1wbGVSYXRlID0gY29uZmlnWyd0cmFuc2FjdGlvbl9zYW1wbGVfcmF0ZSddXG4gICAgICAgIGlmICh0cmFuc2FjdGlvblNhbXBsZVJhdGUpIHtcbiAgICAgICAgICB0cmFuc2FjdGlvblNhbXBsZVJhdGUgPSBOdW1iZXIodHJhbnNhY3Rpb25TYW1wbGVSYXRlKVxuICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHsgdHJhbnNhY3Rpb25TYW1wbGVSYXRlIH1cbiAgICAgICAgICBjb25zdCB7IGludmFsaWQgfSA9IGNvbmZpZ1NlcnZpY2UudmFsaWRhdGUoY29uZmlnKVxuICAgICAgICAgIGlmIChpbnZhbGlkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uZmlnU2VydmljZS5zZXRDb25maWcoY29uZmlnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB7IGtleSwgdmFsdWUsIGFsbG93ZWQgfSA9IGludmFsaWRbMF1cbiAgICAgICAgICAgIGxvZ2dpbmdTZXJ2aWNlLndhcm4oXG4gICAgICAgICAgICAgIGBpbnZhbGlkIHZhbHVlIFwiJHt2YWx1ZX1cIiBmb3IgJHtrZXl9LiBBbGxvd2VkOiAke2FsbG93ZWR9LmBcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbmZpZ1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIGxvZ2dpbmdTZXJ2aWNlLndhcm4oJ2ZhaWxlZCBmZXRjaGluZyBjb25maWc6JywgZXJyb3IpXG4gICAgICB9KVxuICB9XG5cbiAgX3NlbmRQYWdlTG9hZE1ldHJpY3MoKSB7XG4gICAgLyoqXG4gICAgICogTmFtZSBvZiB0aGUgdHJhbnNhY3Rpb24gaXMgc2V0IGluIHRyYW5zYWN0aW9uIHNlcnZpY2UgdG9cbiAgICAgKiBhdm9pZCBkdXBsaWNhdGluZyB0aGUgbG9naWMgYXQgbXVsdGlwbGUgcGxhY2VzXG4gICAgICovXG4gICAgY29uc3QgdHIgPSB0aGlzLnN0YXJ0VHJhbnNhY3Rpb24odW5kZWZpbmVkLCBQQUdFX0xPQUQsIHtcbiAgICAgIG1hbmFnZWQ6IHRydWUsXG4gICAgICBjYW5SZXVzZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBpZiAoIXRyKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0ci5hZGRUYXNrKFBBR0VfTE9BRClcbiAgICBjb25zdCBzZW5kUGFnZUxvYWRNZXRyaWNzID0gKCkgPT4ge1xuICAgICAgLy8gVGhlIHJlYXNvbnMgb2YgdGhpcyB0aW1lb3V0IGFyZTpcbiAgICAgIC8vIDEuIHRvIG1ha2Ugc3VyZSBQZXJmb3JtYW5jZVRpbWluZy5sb2FkRXZlbnRFbmQgaGFzIGEgdmFsdWUuXG4gICAgICAvLyAyLiB0byBtYWtlIHN1cmUgdGhlIGFnZW50IGludGVyY2VwdHMgYWxsIHRoZSBMQ1AgZW50cmllcyB0cmlnZ2VyZWQgYnkgdGhlIGJyb3dzZXIgKGFkZGluZyBhIGRlbGF5IGluIHRoZSB0aW1lb3V0KS5cbiAgICAgIC8vIFRoZSBicm93c2VyIG1pZ2h0IG5lZWQgbW9yZSB0aW1lIGFmdGVyIHRoZSBwYWdlbG9hZCBldmVudCB0byByZW5kZXIgb3RoZXIgZWxlbWVudHMgKGUuZy4gaW1hZ2VzKS5cbiAgICAgIC8vIFRoYXQncyBpbXBvcnRhbnQgYmVjYXVzZSBhIExDUCBpcyBvbmx5IHRyaWdnZXJlZCB3aGVuIHRoZSByZWxhdGVkIGVsZW1lbnQgaXMgY29tcGxldGVseSByZW5kZXJlZC5cbiAgICAgIC8vIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby9sYXJnZXN0LWNvbnRlbnRmdWwtcGFpbnQvI3NlYy1hZGQtbGNwLWVudHJ5XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRyLnJlbW92ZVRhc2soUEFHRV9MT0FEKSwgUEFHRV9MT0FEX0RFTEFZKVxuICAgIH1cblxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICBzZW5kUGFnZUxvYWRNZXRyaWNzKClcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBzZW5kUGFnZUxvYWRNZXRyaWNzKVxuICAgIH1cbiAgfVxuXG4gIG9ic2VydmUobmFtZSwgZm4pIHtcbiAgICBjb25zdCBjb25maWdTZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKENPTkZJR19TRVJWSUNFKVxuICAgIGNvbmZpZ1NlcnZpY2UuZXZlbnRzLm9ic2VydmUobmFtZSwgZm4pXG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgcmVxdWlyZWQgY29uZmlnIGtleXMgYXJlIGludmFsaWQsIHRoZSBhZ2VudCBpcyBkZWFjdGl2YXRlZCB3aXRoXG4gICAqIGxvZ2dpbmcgZXJyb3IgdG8gdGhlIGNvbnNvbGVcbiAgICpcbiAgICogdmFsaWRhdGlvbiBlcnJvciBmb3JtYXRcbiAgICoge1xuICAgKiAgbWlzc2luZzogWyAna2V5MScsICdrZXkyJ11cbiAgICogIGludmFsaWQ6IFt7XG4gICAqICAgIGtleTogJ2EnLFxuICAgKiAgICB2YWx1ZTogJ2FiY2QnLFxuICAgKiAgICBhbGxvd2VkOiAnc3RyaW5nJ1xuICAgKiAgfV1cbiAgICogfVxuICAgKi9cbiAgY29uZmlnKGNvbmZpZykge1xuICAgIGNvbnN0IGNvbmZpZ1NlcnZpY2UgPSB0aGlzLnNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoQ09ORklHX1NFUlZJQ0UpXG4gICAgY29uc3QgeyBtaXNzaW5nLCBpbnZhbGlkIH0gPSBjb25maWdTZXJ2aWNlLnZhbGlkYXRlKGNvbmZpZylcbiAgICBpZiAobWlzc2luZy5sZW5ndGggPT09IDAgJiYgaW52YWxpZC5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbmZpZ1NlcnZpY2Uuc2V0Q29uZmlnKGNvbmZpZylcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbG9nZ2luZ1NlcnZpY2UgPSB0aGlzLnNlcnZpY2VGYWN0b3J5LmdldFNlcnZpY2UoTE9HR0lOR19TRVJWSUNFKVxuICAgICAgY29uc3Qgc2VwYXJhdG9yID0gJywgJ1xuICAgICAgbGV0IG1lc3NhZ2UgPSBcIlJVTSBhZ2VudCBpc24ndCBjb3JyZWN0bHkgY29uZmlndXJlZC4gXCJcblxuICAgICAgaWYgKG1pc3NpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICBtZXNzYWdlICs9IG1pc3Npbmcuam9pbihzZXBhcmF0b3IpICsgJyBpcyBtaXNzaW5nJ1xuICAgICAgICBpZiAoaW52YWxpZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbWVzc2FnZSArPSBzZXBhcmF0b3JcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbnZhbGlkLmZvckVhY2goKHsga2V5LCB2YWx1ZSwgYWxsb3dlZCB9LCBpbmRleCkgPT4ge1xuICAgICAgICBtZXNzYWdlICs9XG4gICAgICAgICAgYCR7a2V5fSBcIiR7dmFsdWV9XCIgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzISAoYWxsb3dlZDogJHthbGxvd2VkfSlgICtcbiAgICAgICAgICAoaW5kZXggIT09IGludmFsaWQubGVuZ3RoIC0gMSA/IHNlcGFyYXRvciA6ICcnKVxuICAgICAgfSlcbiAgICAgIGxvZ2dpbmdTZXJ2aWNlLmVycm9yKG1lc3NhZ2UpXG4gICAgICBjb25maWdTZXJ2aWNlLnNldENvbmZpZyh7IGFjdGl2ZTogZmFsc2UgfSlcbiAgICB9XG4gIH1cblxuICBzZXRVc2VyQ29udGV4dCh1c2VyQ29udGV4dCkge1xuICAgIHZhciBjb25maWdTZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKENPTkZJR19TRVJWSUNFKVxuICAgIGNvbmZpZ1NlcnZpY2Uuc2V0VXNlckNvbnRleHQodXNlckNvbnRleHQpXG4gIH1cblxuICBzZXRDdXN0b21Db250ZXh0KGN1c3RvbUNvbnRleHQpIHtcbiAgICB2YXIgY29uZmlnU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShDT05GSUdfU0VSVklDRSlcbiAgICBjb25maWdTZXJ2aWNlLnNldEN1c3RvbUNvbnRleHQoY3VzdG9tQ29udGV4dClcbiAgfVxuXG4gIGFkZExhYmVscyhsYWJlbHMpIHtcbiAgICB2YXIgY29uZmlnU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShDT05GSUdfU0VSVklDRSlcbiAgICBjb25maWdTZXJ2aWNlLmFkZExhYmVscyhsYWJlbHMpXG4gIH1cblxuICAvLyBTaG91bGQgY2FsbCB0aGlzIG1ldGhvZCBiZWZvcmUgJ2xvYWQnIGV2ZW50IG9uIHdpbmRvdyBpcyBmaXJlZFxuICBzZXRJbml0aWFsUGFnZUxvYWROYW1lKG5hbWUpIHtcbiAgICBjb25zdCBjb25maWdTZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKENPTkZJR19TRVJWSUNFKVxuICAgIGNvbmZpZ1NlcnZpY2Uuc2V0Q29uZmlnKHtcbiAgICAgIHBhZ2VMb2FkVHJhbnNhY3Rpb25OYW1lOiBuYW1lXG4gICAgfSlcbiAgfVxuXG4gIHN0YXJ0VHJhbnNhY3Rpb24obmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICB2YXIgdHJhbnNhY3Rpb25TZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFxuICAgICAgICBUUkFOU0FDVElPTl9TRVJWSUNFXG4gICAgICApXG4gICAgICByZXR1cm4gdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0VHJhbnNhY3Rpb24obmFtZSwgdHlwZSwgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICBzdGFydFNwYW4obmFtZSwgdHlwZSwgb3B0aW9ucykge1xuICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICB2YXIgdHJhbnNhY3Rpb25TZXJ2aWNlID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKFxuICAgICAgICBUUkFOU0FDVElPTl9TRVJWSUNFXG4gICAgICApXG4gICAgICByZXR1cm4gdHJhbnNhY3Rpb25TZXJ2aWNlLnN0YXJ0U3BhbihuYW1lLCB0eXBlLCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIGdldEN1cnJlbnRUcmFuc2FjdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc0VuYWJsZWQoKSkge1xuICAgICAgdmFyIHRyYW5zYWN0aW9uU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShcbiAgICAgICAgVFJBTlNBQ1RJT05fU0VSVklDRVxuICAgICAgKVxuICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uU2VydmljZS5nZXRDdXJyZW50VHJhbnNhY3Rpb24oKVxuICAgIH1cbiAgfVxuXG4gIGNhcHR1cmVFcnJvcihlcnJvcikge1xuICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICB2YXIgZXJyb3JMb2dnaW5nID0gdGhpcy5zZXJ2aWNlRmFjdG9yeS5nZXRTZXJ2aWNlKCdFcnJvckxvZ2dpbmcnKVxuICAgICAgcmV0dXJuIGVycm9yTG9nZ2luZy5sb2dFcnJvcihlcnJvcilcbiAgICB9XG4gIH1cblxuICBhZGRGaWx0ZXIoZm4pIHtcbiAgICB2YXIgY29uZmlnU2VydmljZSA9IHRoaXMuc2VydmljZUZhY3RvcnkuZ2V0U2VydmljZShDT05GSUdfU0VSVklDRSlcbiAgICBjb25maWdTZXJ2aWNlLmFkZEZpbHRlcihmbilcbiAgfVxufVxuIiwiKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uIChVTUQpIHRvIHN1cHBvcnQgQU1ELCBDb21tb25KUy9Ob2RlLmpzLCBSaGlubywgYW5kIGJyb3dzZXJzLlxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZSgnZXJyb3Itc3RhY2stcGFyc2VyJywgWydzdGFja2ZyYW1lJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdzdGFja2ZyYW1lJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuRXJyb3JTdGFja1BhcnNlciA9IGZhY3Rvcnkocm9vdC5TdGFja0ZyYW1lKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIoU3RhY2tGcmFtZSkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBGSVJFRk9YX1NBRkFSSV9TVEFDS19SRUdFWFAgPSAvKF58QClcXFMrXFw6XFxkKy87XG4gICAgdmFyIENIUk9NRV9JRV9TVEFDS19SRUdFWFAgPSAvXlxccyphdCAuKihcXFMrXFw6XFxkK3xcXChuYXRpdmVcXCkpL207XG4gICAgdmFyIFNBRkFSSV9OQVRJVkVfQ09ERV9SRUdFWFAgPSAvXihldmFsQCk/KFxcW25hdGl2ZSBjb2RlXFxdKT8kLztcblxuICAgIGZ1bmN0aW9uIF9tYXAoYXJyYXksIGZuLCB0aGlzQXJnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgQXJyYXkucHJvdG90eXBlLm1hcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5Lm1hcChmbiwgdGhpc0FyZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbmV3IEFycmF5KGFycmF5Lmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0W2ldID0gZm4uY2FsbCh0aGlzQXJnLCBhcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihhcnJheSwgZm4sIHRoaXNBcmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUuZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXkuZmlsdGVyKGZuLCB0aGlzQXJnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZm4uY2FsbCh0aGlzQXJnLCBhcnJheVtpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnJheSwgdGFyZ2V0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5pbmRleE9mKHRhcmdldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFycmF5W2ldID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdpdmVuIGFuIEVycm9yIG9iamVjdCwgZXh0cmFjdCB0aGUgbW9zdCBpbmZvcm1hdGlvbiBmcm9tIGl0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBvYmplY3RcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9IG9mIFN0YWNrRnJhbWVzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJzZTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2UoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyb3Iuc3RhY2t0cmFjZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGVycm9yWydvcGVyYSNzb3VyY2Vsb2MnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZU9wZXJhKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhY2sgJiYgZXJyb3Iuc3RhY2subWF0Y2goQ0hST01FX0lFX1NUQUNLX1JFR0VYUCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVY4T3JJRShlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YWNrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VGRk9yU2FmYXJpKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcGFyc2UgZ2l2ZW4gRXJyb3Igb2JqZWN0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gU2VwYXJhdGUgbGluZSBhbmQgY29sdW1uIG51bWJlcnMgZnJvbSBhIHN0cmluZyBvZiB0aGUgZm9ybTogKFVSSTpMaW5lOkNvbHVtbilcbiAgICAgICAgZXh0cmFjdExvY2F0aW9uOiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRleHRyYWN0TG9jYXRpb24odXJsTGlrZSkge1xuICAgICAgICAgICAgLy8gRmFpbC1mYXN0IGJ1dCByZXR1cm4gbG9jYXRpb25zIGxpa2UgXCIobmF0aXZlKVwiXG4gICAgICAgICAgICBpZiAodXJsTGlrZS5pbmRleE9mKCc6JykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFt1cmxMaWtlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlZ0V4cCA9IC8oLis/KSg/OlxcOihcXGQrKSk/KD86XFw6KFxcZCspKT8kLztcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHJlZ0V4cC5leGVjKHVybExpa2UucmVwbGFjZSgvW1xcKFxcKV0vZywgJycpKTtcbiAgICAgICAgICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzJdIHx8IHVuZGVmaW5lZCwgcGFydHNbM10gfHwgdW5kZWZpbmVkXTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZVY4T3JJRTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VWOE9ySUUoZXJyb3IpIHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IF9maWx0ZXIoZXJyb3Iuc3RhY2suc3BsaXQoJ1xcbicpLCBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhbGluZS5tYXRjaChDSFJPTUVfSUVfU1RBQ0tfUkVHRVhQKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gX21hcChmaWx0ZXJlZCwgZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIGlmIChsaW5lLmluZGV4T2YoJyhldmFsICcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhyb3cgYXdheSBldmFsIGluZm9ybWF0aW9uIHVudGlsIHdlIGltcGxlbWVudCBzdGFja3RyYWNlLmpzL3N0YWNrZnJhbWUjOFxuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKC9ldmFsIGNvZGUvZywgJ2V2YWwnKS5yZXBsYWNlKC8oXFwoZXZhbCBhdCBbXlxcKCldKil8KFxcKVxcLC4qJCkvZywgJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdG9rZW5zID0gbGluZS5yZXBsYWNlKC9eXFxzKy8sICcnKS5yZXBsYWNlKC9cXChldmFsIGNvZGUvZywgJygnKS5zcGxpdCgvXFxzKy8pLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvblBhcnRzID0gdGhpcy5leHRyYWN0TG9jYXRpb24odG9rZW5zLnBvcCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgZnVuY3Rpb25OYW1lID0gdG9rZW5zLmpvaW4oJyAnKSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGVOYW1lID0gX2luZGV4T2YoWydldmFsJywgJzxhbm9ueW1vdXM+J10sIGxvY2F0aW9uUGFydHNbMF0pID4gLTEgPyB1bmRlZmluZWQgOiBsb2NhdGlvblBhcnRzWzBdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTdGFja0ZyYW1lKGZ1bmN0aW9uTmFtZSwgdW5kZWZpbmVkLCBmaWxlTmFtZSwgbG9jYXRpb25QYXJ0c1sxXSwgbG9jYXRpb25QYXJ0c1syXSwgbGluZSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZUZGT3JTYWZhcmk6IGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIkJHBhcnNlRkZPclNhZmFyaShlcnJvcikge1xuICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gX2ZpbHRlcihlcnJvci5zdGFjay5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWxpbmUubWF0Y2goU0FGQVJJX05BVElWRV9DT0RFX1JFR0VYUCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9tYXAoZmlsdGVyZWQsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICAvLyBUaHJvdyBhd2F5IGV2YWwgaW5mb3JtYXRpb24gdW50aWwgd2UgaW1wbGVtZW50IHN0YWNrdHJhY2UuanMvc3RhY2tmcmFtZSM4XG4gICAgICAgICAgICAgICAgaWYgKGxpbmUuaW5kZXhPZignID4gZXZhbCcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgvIGxpbmUgKFxcZCspKD86ID4gZXZhbCBsaW5lIFxcZCspKiA+IGV2YWxcXDpcXGQrXFw6XFxkKy9nLCAnOiQxJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxpbmUuaW5kZXhPZignQCcpID09PSAtMSAmJiBsaW5lLmluZGV4T2YoJzonKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIGV2YWwgZnJhbWVzIG9ubHkgaGF2ZSBmdW5jdGlvbiBuYW1lcyBhbmQgbm90aGluZyBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU3RhY2tGcmFtZShsaW5lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG9rZW5zID0gbGluZS5zcGxpdCgnQCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb25QYXJ0cyA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKHRva2Vucy5wb3AoKSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSB0b2tlbnMuam9pbignQCcpIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTdGFja0ZyYW1lKGZ1bmN0aW9uTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uUGFydHNbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBhcnRzWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb25QYXJ0c1syXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlT3BlcmE6IGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIkJHBhcnNlT3BlcmEoZSkge1xuICAgICAgICAgICAgaWYgKCFlLnN0YWNrdHJhY2UgfHwgKGUubWVzc2FnZS5pbmRleE9mKCdcXG4nKSA+IC0xICYmXG4gICAgICAgICAgICAgICAgZS5tZXNzYWdlLnNwbGl0KCdcXG4nKS5sZW5ndGggPiBlLnN0YWNrdHJhY2Uuc3BsaXQoJ1xcbicpLmxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZU9wZXJhOShlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWUuc3RhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZU9wZXJhMTAoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlT3BlcmExMShlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZU9wZXJhOTogZnVuY3Rpb24gRXJyb3JTdGFja1BhcnNlciQkcGFyc2VPcGVyYTkoZSkge1xuICAgICAgICAgICAgdmFyIGxpbmVSRSA9IC9MaW5lIChcXGQrKS4qc2NyaXB0ICg/OmluICk/KFxcUyspL2k7XG4gICAgICAgICAgICB2YXIgbGluZXMgPSBlLm1lc3NhZ2Uuc3BsaXQoJ1xcbicpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMiwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBsaW5lUkUuZXhlYyhsaW5lc1tpXSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBTdGFja0ZyYW1lKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBtYXRjaFsyXSwgbWF0Y2hbMV0sIHVuZGVmaW5lZCwgbGluZXNbaV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VPcGVyYTEwOiBmdW5jdGlvbiBFcnJvclN0YWNrUGFyc2VyJCRwYXJzZU9wZXJhMTAoZSkge1xuICAgICAgICAgICAgdmFyIGxpbmVSRSA9IC9MaW5lIChcXGQrKS4qc2NyaXB0ICg/OmluICk/KFxcUyspKD86OiBJbiBmdW5jdGlvbiAoXFxTKykpPyQvaTtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IGUuc3RhY2t0cmFjZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGxpbmVSRS5leGVjKGxpbmVzW2ldKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgU3RhY2tGcmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaFszXSB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lc1tpXVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBPcGVyYSAxMC42NSsgRXJyb3Iuc3RhY2sgdmVyeSBzaW1pbGFyIHRvIEZGL1NhZmFyaVxuICAgICAgICBwYXJzZU9wZXJhMTE6IGZ1bmN0aW9uIEVycm9yU3RhY2tQYXJzZXIkJHBhcnNlT3BlcmExMShlcnJvcikge1xuICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gX2ZpbHRlcihlcnJvci5zdGFjay5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFsaW5lLm1hdGNoKEZJUkVGT1hfU0FGQVJJX1NUQUNLX1JFR0VYUCkgJiYgIWxpbmUubWF0Y2goL15FcnJvciBjcmVhdGVkIGF0Lyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9tYXAoZmlsdGVyZWQsIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9rZW5zID0gbGluZS5zcGxpdCgnQCcpO1xuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvblBhcnRzID0gdGhpcy5leHRyYWN0TG9jYXRpb24odG9rZW5zLnBvcCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgZnVuY3Rpb25DYWxsID0gKHRva2Vucy5zaGlmdCgpIHx8ICcnKTtcbiAgICAgICAgICAgICAgICB2YXIgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25DYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPGFub255bW91cyBmdW5jdGlvbig6IChcXHcrKSk/Pi8sICckMicpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwoW15cXCldKlxcKS9nLCAnJykgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHZhciBhcmdzUmF3O1xuICAgICAgICAgICAgICAgIGlmIChmdW5jdGlvbkNhbGwubWF0Y2goL1xcKChbXlxcKV0qKVxcKS8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NSYXcgPSBmdW5jdGlvbkNhbGwucmVwbGFjZSgvXlteXFwoXStcXCgoW15cXCldKilcXCkkLywgJyQxJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gKGFyZ3NSYXcgPT09IHVuZGVmaW5lZCB8fCBhcmdzUmF3ID09PSAnW2FyZ3VtZW50cyBub3QgYXZhaWxhYmxlXScpID9cbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkIDogYXJnc1Jhdy5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU3RhY2tGcmFtZShcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBhcnRzWzBdLFxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBhcnRzWzFdLFxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvblBhcnRzWzJdLFxuICAgICAgICAgICAgICAgICAgICBsaW5lKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKipcbiAqIFRoZSBGT1JNQVRfQklOQVJZIGZvcm1hdCByZXByZXNlbnRzIFNwYW5Db250ZXh0cyBpbiBhbiBvcGFxdWUgYmluYXJ5XG4gKiBjYXJyaWVyLlxuICpcbiAqIFRyYWNlci5pbmplY3QoKSB3aWxsIHNldCB0aGUgYnVmZmVyIGZpZWxkIHRvIGFuIEFycmF5LWxpa2UgKEFycmF5LFxuICogQXJyYXlCdWZmZXIsIG9yIFR5cGVkQnVmZmVyKSBvYmplY3QgY29udGFpbmluZyB0aGUgaW5qZWN0ZWQgYmluYXJ5IGRhdGEuXG4gKiBBbnkgdmFsaWQgT2JqZWN0IGNhbiBiZSB1c2VkIGFzIGxvbmcgYXMgdGhlIGJ1ZmZlciBmaWVsZCBvZiB0aGUgb2JqZWN0XG4gKiBjYW4gYmUgc2V0LlxuICpcbiAqIFRyYWNlci5leHRyYWN0KCkgd2lsbCBsb29rIGZvciBgY2Fycmllci5idWZmZXJgLCBhbmQgdGhhdCBmaWVsZCBpc1xuICogZXhwZWN0ZWQgdG8gYmUgYW4gQXJyYXktbGlrZSBvYmplY3QgKEFycmF5LCBBcnJheUJ1ZmZlciwgb3JcbiAqIFR5cGVkQnVmZmVyKS5cbiAqL1xuZXhwb3J0cy5GT1JNQVRfQklOQVJZID0gJ2JpbmFyeSc7XG4vKipcbiAqIFRoZSBGT1JNQVRfVEVYVF9NQVAgZm9ybWF0IHJlcHJlc2VudHMgU3BhbkNvbnRleHRzIHVzaW5nIGFcbiAqIHN0cmluZy0+c3RyaW5nIG1hcCAoYmFja2VkIGJ5IGEgSmF2YXNjcmlwdCBPYmplY3QpIGFzIGEgY2Fycmllci5cbiAqXG4gKiBOT1RFOiBVbmxpa2UgRk9STUFUX0hUVFBfSEVBREVSUywgRk9STUFUX1RFWFRfTUFQIHBsYWNlcyBubyByZXN0cmljdGlvbnNcbiAqIG9uIHRoZSBjaGFyYWN0ZXJzIHVzZWQgaW4gZWl0aGVyIHRoZSBrZXlzIG9yIHRoZSB2YWx1ZXMgb2YgdGhlIG1hcFxuICogZW50cmllcy5cbiAqXG4gKiBUaGUgRk9STUFUX1RFWFRfTUFQIGNhcnJpZXIgbWFwIG1heSBjb250YWluIHVucmVsYXRlZCBkYXRhIChlLmcuLFxuICogYXJiaXRyYXJ5IGdSUEMgbWV0YWRhdGEpOyBhcyBzdWNoLCB0aGUgVHJhY2VyIGltcGxlbWVudGF0aW9uIHNob3VsZCB1c2VcbiAqIGEgcHJlZml4IG9yIG90aGVyIGNvbnZlbnRpb24gdG8gZGlzdGluZ3Vpc2ggVHJhY2VyLXNwZWNpZmljIGtleTp2YWx1ZVxuICogcGFpcnMuXG4gKi9cbmV4cG9ydHMuRk9STUFUX1RFWFRfTUFQID0gJ3RleHRfbWFwJztcbi8qKlxuICogVGhlIEZPUk1BVF9IVFRQX0hFQURFUlMgZm9ybWF0IHJlcHJlc2VudHMgU3BhbkNvbnRleHRzIHVzaW5nIGFcbiAqIGNoYXJhY3Rlci1yZXN0cmljdGVkIHN0cmluZy0+c3RyaW5nIG1hcCAoYmFja2VkIGJ5IGEgSmF2YXNjcmlwdCBPYmplY3QpXG4gKiBhcyBhIGNhcnJpZXIuXG4gKlxuICogS2V5cyBhbmQgdmFsdWVzIGluIHRoZSBGT1JNQVRfSFRUUF9IRUFERVJTIGNhcnJpZXIgbXVzdCBiZSBzdWl0YWJsZSBmb3JcbiAqIHVzZSBhcyBIVFRQIGhlYWRlcnMgKHdpdGhvdXQgbW9kaWZpY2F0aW9uIG9yIGZ1cnRoZXIgZXNjYXBpbmcpLiBUaGF0IGlzLFxuICogdGhlIGtleXMgaGF2ZSBhIGdyZWF0bHkgcmVzdHJpY3RlZCBjaGFyYWN0ZXIgc2V0LCBjYXNpbmcgZm9yIHRoZSBrZXlzXG4gKiBtYXkgbm90IGJlIHByZXNlcnZlZCBieSB2YXJpb3VzIGludGVybWVkaWFyaWVzLCBhbmQgdGhlIHZhbHVlcyBzaG91bGQgYmVcbiAqIFVSTC1lc2NhcGVkLlxuICpcbiAqIFRoZSBGT1JNQVRfSFRUUF9IRUFERVJTIGNhcnJpZXIgbWFwIG1heSBjb250YWluIHVucmVsYXRlZCBkYXRhIChlLmcuLFxuICogYXJiaXRyYXJ5IEhUVFAgaGVhZGVycyk7IGFzIHN1Y2gsIHRoZSBUcmFjZXIgaW1wbGVtZW50YXRpb24gc2hvdWxkIHVzZSBhXG4gKiBwcmVmaXggb3Igb3RoZXIgY29udmVudGlvbiB0byBkaXN0aW5ndWlzaCBUcmFjZXItc3BlY2lmaWMga2V5OnZhbHVlXG4gKiBwYWlycy5cbiAqL1xuZXhwb3J0cy5GT1JNQVRfSFRUUF9IRUFERVJTID0gJ2h0dHBfaGVhZGVycyc7XG4vKipcbiAqIEEgU3BhbiBtYXkgYmUgdGhlIFwiY2hpbGQgb2ZcIiBhIHBhcmVudCBTcGFuLiBJbiBhIOKAnGNoaWxkIG9m4oCdIHJlZmVyZW5jZSxcbiAqIHRoZSBwYXJlbnQgU3BhbiBkZXBlbmRzIG9uIHRoZSBjaGlsZCBTcGFuIGluIHNvbWUgY2FwYWNpdHkuXG4gKlxuICogU2VlIG1vcmUgYWJvdXQgcmVmZXJlbmNlIHR5cGVzIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVudHJhY2luZy9zcGVjaWZpY2F0aW9uXG4gKi9cbmV4cG9ydHMuUkVGRVJFTkNFX0NISUxEX09GID0gJ2NoaWxkX29mJztcbi8qKlxuICogU29tZSBwYXJlbnQgU3BhbnMgZG8gbm90IGRlcGVuZCBpbiBhbnkgd2F5IG9uIHRoZSByZXN1bHQgb2YgdGhlaXIgY2hpbGRcbiAqIFNwYW5zLiBJbiB0aGVzZSBjYXNlcywgd2Ugc2F5IG1lcmVseSB0aGF0IHRoZSBjaGlsZCBTcGFuIOKAnGZvbGxvd3MgZnJvbeKAnVxuICogdGhlIHBhcmVudCBTcGFuIGluIGEgY2F1c2FsIHNlbnNlLlxuICpcbiAqIFNlZSBtb3JlIGFib3V0IHJlZmVyZW5jZSB0eXBlcyBhdCBodHRwczovL2dpdGh1Yi5jb20vb3BlbnRyYWNpbmcvc3BlY2lmaWNhdGlvblxuICovXG5leHBvcnRzLlJFRkVSRU5DRV9GT0xMT1dTX0ZST00gPSAnZm9sbG93c19mcm9tJztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0YW50cy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBDb25zdGFudHMgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG52YXIgcmVmZXJlbmNlXzEgPSByZXF1aXJlKFwiLi9yZWZlcmVuY2VcIik7XG52YXIgc3Bhbl8xID0gcmVxdWlyZShcIi4vc3BhblwiKTtcbi8qKlxuICogUmV0dXJuIGEgbmV3IFJFRkVSRU5DRV9DSElMRF9PRiByZWZlcmVuY2UuXG4gKlxuICogQHBhcmFtIHtTcGFuQ29udGV4dH0gc3BhbkNvbnRleHQgLSB0aGUgcGFyZW50IFNwYW5Db250ZXh0IGluc3RhbmNlIHRvXG4gKiAgICAgICAgcmVmZXJlbmNlLlxuICogQHJldHVybiBhIFJFRkVSRU5DRV9DSElMRF9PRiByZWZlcmVuY2UgcG9pbnRpbmcgdG8gYHNwYW5Db250ZXh0YFxuICovXG5mdW5jdGlvbiBjaGlsZE9mKHNwYW5Db250ZXh0KSB7XG4gICAgLy8gQWxsb3cgdGhlIHVzZXIgdG8gcGFzcyBhIFNwYW4gaW5zdGVhZCBvZiBhIFNwYW5Db250ZXh0XG4gICAgaWYgKHNwYW5Db250ZXh0IGluc3RhbmNlb2Ygc3Bhbl8xLmRlZmF1bHQpIHtcbiAgICAgICAgc3BhbkNvbnRleHQgPSBzcGFuQ29udGV4dC5jb250ZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgcmVmZXJlbmNlXzEuZGVmYXVsdChDb25zdGFudHMuUkVGRVJFTkNFX0NISUxEX09GLCBzcGFuQ29udGV4dCk7XG59XG5leHBvcnRzLmNoaWxkT2YgPSBjaGlsZE9mO1xuLyoqXG4gKiBSZXR1cm4gYSBuZXcgUkVGRVJFTkNFX0ZPTExPV1NfRlJPTSByZWZlcmVuY2UuXG4gKlxuICogQHBhcmFtIHtTcGFuQ29udGV4dH0gc3BhbkNvbnRleHQgLSB0aGUgcGFyZW50IFNwYW5Db250ZXh0IGluc3RhbmNlIHRvXG4gKiAgICAgICAgcmVmZXJlbmNlLlxuICogQHJldHVybiBhIFJFRkVSRU5DRV9GT0xMT1dTX0ZST00gcmVmZXJlbmNlIHBvaW50aW5nIHRvIGBzcGFuQ29udGV4dGBcbiAqL1xuZnVuY3Rpb24gZm9sbG93c0Zyb20oc3BhbkNvbnRleHQpIHtcbiAgICAvLyBBbGxvdyB0aGUgdXNlciB0byBwYXNzIGEgU3BhbiBpbnN0ZWFkIG9mIGEgU3BhbkNvbnRleHRcbiAgICBpZiAoc3BhbkNvbnRleHQgaW5zdGFuY2VvZiBzcGFuXzEuZGVmYXVsdCkge1xuICAgICAgICBzcGFuQ29udGV4dCA9IHNwYW5Db250ZXh0LmNvbnRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyByZWZlcmVuY2VfMS5kZWZhdWx0KENvbnN0YW50cy5SRUZFUkVOQ0VfRk9MTE9XU19GUk9NLCBzcGFuQ29udGV4dCk7XG59XG5leHBvcnRzLmZvbGxvd3NGcm9tID0gZm9sbG93c0Zyb207XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mdW5jdGlvbnMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgc3Bhbl8xID0gcmVxdWlyZShcIi4vc3BhblwiKTtcbnZhciBzcGFuX2NvbnRleHRfMSA9IHJlcXVpcmUoXCIuL3NwYW5fY29udGV4dFwiKTtcbnZhciB0cmFjZXJfMSA9IHJlcXVpcmUoXCIuL3RyYWNlclwiKTtcbmV4cG9ydHMudHJhY2VyID0gbnVsbDtcbmV4cG9ydHMuc3BhbkNvbnRleHQgPSBudWxsO1xuZXhwb3J0cy5zcGFuID0gbnVsbDtcbi8vIERlZmVycmVkIGluaXRpYWxpemF0aW9uIHRvIGF2b2lkIGEgZGVwZW5kZW5jeSBjeWNsZSB3aGVyZSBUcmFjZXIgZGVwZW5kcyBvblxuLy8gU3BhbiB3aGljaCBkZXBlbmRzIG9uIHRoZSBub29wIHRyYWNlci5cbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgZXhwb3J0cy50cmFjZXIgPSBuZXcgdHJhY2VyXzEuZGVmYXVsdCgpO1xuICAgIGV4cG9ydHMuc3BhbiA9IG5ldyBzcGFuXzEuZGVmYXVsdCgpO1xuICAgIGV4cG9ydHMuc3BhbkNvbnRleHQgPSBuZXcgc3Bhbl9jb250ZXh0XzEuZGVmYXVsdCgpO1xufVxuZXhwb3J0cy5pbml0aWFsaXplID0gaW5pdGlhbGl6ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5vb3AuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgc3Bhbl8xID0gcmVxdWlyZShcIi4vc3BhblwiKTtcbi8qKlxuICogUmVmZXJlbmNlIHBhaXJzIGEgcmVmZXJlbmNlIHR5cGUgY29uc3RhbnQgKGUuZy4sIFJFRkVSRU5DRV9DSElMRF9PRiBvclxuICogUkVGRVJFTkNFX0ZPTExPV1NfRlJPTSkgd2l0aCB0aGUgU3BhbkNvbnRleHQgaXQgcG9pbnRzIHRvLlxuICpcbiAqIFNlZSB0aGUgZXhwb3J0ZWQgY2hpbGRPZigpIGFuZCBmb2xsb3dzRnJvbSgpIGZ1bmN0aW9ucyBhdCB0aGUgcGFja2FnZSBsZXZlbC5cbiAqL1xudmFyIFJlZmVyZW5jZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGEgbmV3IFJlZmVyZW5jZSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gdGhlIFJlZmVyZW5jZSB0eXBlIGNvbnN0YW50IChlLmcuLFxuICAgICAqICAgICAgICBSRUZFUkVOQ0VfQ0hJTERfT0Ygb3IgUkVGRVJFTkNFX0ZPTExPV1NfRlJPTSkuXG4gICAgICogQHBhcmFtIHtTcGFuQ29udGV4dH0gcmVmZXJlbmNlZENvbnRleHQgLSB0aGUgU3BhbkNvbnRleHQgYmVpbmcgcmVmZXJyZWRcbiAgICAgKiAgICAgICAgdG8uIEFzIGEgY29udmVuaWVuY2UsIGEgU3BhbiBpbnN0YW5jZSBtYXkgYmUgcGFzc2VkIGluIGluc3RlYWRcbiAgICAgKiAgICAgICAgKGluIHdoaWNoIGNhc2UgaXRzIC5jb250ZXh0KCkgaXMgdXNlZCBoZXJlKS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBSZWZlcmVuY2UodHlwZSwgcmVmZXJlbmNlZENvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuX3JlZmVyZW5jZWRDb250ZXh0ID0gKHJlZmVyZW5jZWRDb250ZXh0IGluc3RhbmNlb2Ygc3Bhbl8xLmRlZmF1bHQgP1xuICAgICAgICAgICAgcmVmZXJlbmNlZENvbnRleHQuY29udGV4dCgpIDpcbiAgICAgICAgICAgIHJlZmVyZW5jZWRDb250ZXh0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgUmVmZXJlbmNlIHR5cGUgKGUuZy4sIFJFRkVSRU5DRV9DSElMRF9PRiBvclxuICAgICAqICAgICAgICAgUkVGRVJFTkNFX0ZPTExPV1NfRlJPTSkuXG4gICAgICovXG4gICAgUmVmZXJlbmNlLnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge1NwYW5Db250ZXh0fSBUaGUgU3BhbkNvbnRleHQgYmVpbmcgcmVmZXJyZWQgdG8gKGUuZy4sIHRoZVxuICAgICAqICAgICAgICAgcGFyZW50IGluIGEgUkVGRVJFTkNFX0NISUxEX09GIFJlZmVyZW5jZSkuXG4gICAgICovXG4gICAgUmVmZXJlbmNlLnByb3RvdHlwZS5yZWZlcmVuY2VkQ29udGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZWRDb250ZXh0O1xuICAgIH07XG4gICAgcmV0dXJuIFJlZmVyZW5jZTtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBSZWZlcmVuY2U7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWZlcmVuY2UuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgbm9vcCA9IHJlcXVpcmUoXCIuL25vb3BcIik7XG4vKipcbiAqIFNwYW4gcmVwcmVzZW50cyBhIGxvZ2ljYWwgdW5pdCBvZiB3b3JrIGFzIHBhcnQgb2YgYSBicm9hZGVyIFRyYWNlLiBFeGFtcGxlc1xuICogb2Ygc3BhbiBtaWdodCBpbmNsdWRlIHJlbW90ZSBwcm9jZWR1cmUgY2FsbHMgb3IgYSBpbi1wcm9jZXNzIGZ1bmN0aW9uIGNhbGxzXG4gKiB0byBzdWItY29tcG9uZW50cy4gQSBUcmFjZSBoYXMgYSBzaW5nbGUsIHRvcC1sZXZlbCBcInJvb3RcIiBTcGFuIHRoYXQgaW4gdHVyblxuICogbWF5IGhhdmUgemVybyBvciBtb3JlIGNoaWxkIFNwYW5zLCB3aGljaCBpbiB0dXJuIG1heSBoYXZlIGNoaWxkcmVuLlxuICovXG52YXIgU3BhbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGFuKCkge1xuICAgIH1cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gICAgLy8gT3BlblRyYWNpbmcgQVBJIG1ldGhvZHNcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgU3BhbkNvbnRleHQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGlzIFNwYW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtTcGFuQ29udGV4dH1cbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS5jb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGV4dCgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgVHJhY2VyIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGlzIFNwYW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtUcmFjZXJ9XG4gICAgICovXG4gICAgU3Bhbi5wcm90b3R5cGUudHJhY2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhY2VyKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBzdHJpbmcgbmFtZSBmb3IgdGhlIGxvZ2ljYWwgb3BlcmF0aW9uIHRoaXMgc3BhbiByZXByZXNlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS5zZXRPcGVyYXRpb25OYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdGhpcy5fc2V0T3BlcmF0aW9uTmFtZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXRzIGEga2V5OnZhbHVlIHBhaXIgb24gdGhpcyBTcGFuIHRoYXQgYWxzbyBwcm9wYWdhdGVzIHRvIGZ1dHVyZVxuICAgICAqIGNoaWxkcmVuIG9mIHRoZSBhc3NvY2lhdGVkIFNwYW4uXG4gICAgICpcbiAgICAgKiBzZXRCYWdnYWdlSXRlbSgpIGVuYWJsZXMgcG93ZXJmdWwgZnVuY3Rpb25hbGl0eSBnaXZlbiBhIGZ1bGwtc3RhY2tcbiAgICAgKiBvcGVudHJhY2luZyBpbnRlZ3JhdGlvbiAoZS5nLiwgYXJiaXRyYXJ5IGFwcGxpY2F0aW9uIGRhdGEgZnJvbSBhIHdlYlxuICAgICAqIGNsaWVudCBjYW4gbWFrZSBpdCwgdHJhbnNwYXJlbnRseSwgYWxsIHRoZSB3YXkgaW50byB0aGUgZGVwdGhzIG9mIGFcbiAgICAgKiBzdG9yYWdlIHN5c3RlbSksIGFuZCB3aXRoIGl0IHNvbWUgcG93ZXJmdWwgY29zdHM6IHVzZSB0aGlzIGZlYXR1cmUgd2l0aFxuICAgICAqIGNhcmUuXG4gICAgICpcbiAgICAgKiBJTVBPUlRBTlQgTk9URSAjMTogc2V0QmFnZ2FnZUl0ZW0oKSB3aWxsIG9ubHkgcHJvcGFnYXRlIGJhZ2dhZ2UgaXRlbXMgdG9cbiAgICAgKiAqZnV0dXJlKiBjYXVzYWwgZGVzY2VuZGFudHMgb2YgdGhlIGFzc29jaWF0ZWQgU3Bhbi5cbiAgICAgKlxuICAgICAqIElNUE9SVEFOVCBOT1RFICMyOiBVc2UgdGhpcyB0aG91Z2h0ZnVsbHkgYW5kIHdpdGggY2FyZS4gRXZlcnkga2V5IGFuZFxuICAgICAqIHZhbHVlIGlzIGNvcGllZCBpbnRvIGV2ZXJ5IGxvY2FsICphbmQgcmVtb3RlKiBjaGlsZCBvZiB0aGUgYXNzb2NpYXRlZFxuICAgICAqIFNwYW4sIGFuZCB0aGF0IGNhbiBhZGQgdXAgdG8gYSBsb3Qgb2YgbmV0d29yayBhbmQgY3B1IG92ZXJoZWFkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLnNldEJhZ2dhZ2VJdGVtID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2V0QmFnZ2FnZUl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgZm9yIGEgYmFnZ2FnZSBpdGVtIGdpdmVuIGl0cyBrZXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleVxuICAgICAqICAgICAgICAgVGhlIGtleSBmb3IgdGhlIGdpdmVuIHRyYWNlIGF0dHJpYnV0ZS5cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICogICAgICAgICBTdHJpbmcgdmFsdWUgZm9yIHRoZSBnaXZlbiBrZXksIG9yIHVuZGVmaW5lZCBpZiB0aGUga2V5IGRvZXMgbm90XG4gICAgICogICAgICAgICBjb3JyZXNwb25kIHRvIGEgc2V0IHRyYWNlIGF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS5nZXRCYWdnYWdlSXRlbSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldEJhZ2dhZ2VJdGVtKGtleSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgc2luZ2xlIHRhZyB0byB0aGUgc3Bhbi4gIFNlZSBgYWRkVGFncygpYCBmb3IgZGV0YWlscy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICAgKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS5zZXRUYWcgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAvLyBOT1RFOiB0aGUgY2FsbCBpcyBub3JtYWxpemVkIHRvIGEgY2FsbCB0byBfYWRkVGFncygpXG4gICAgICAgIHRoaXMuX2FkZFRhZ3MoKF9hID0ge30sIF9hW2tleV0gPSB2YWx1ZSwgX2EpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIHZhciBfYTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGdpdmVuIGtleSB2YWx1ZSBwYWlycyB0byB0aGUgc2V0IG9mIHNwYW4gdGFncy5cbiAgICAgKlxuICAgICAqIE11bHRpcGxlIGNhbGxzIHRvIGFkZFRhZ3MoKSByZXN1bHRzIGluIHRoZSB0YWdzIGJlaW5nIHRoZSBzdXBlcnNldCBvZlxuICAgICAqIGFsbCBjYWxscy5cbiAgICAgKlxuICAgICAqIFRoZSBiZWhhdmlvciBvZiBzZXR0aW5nIHRoZSBzYW1lIGtleSBtdWx0aXBsZSB0aW1lcyBvbiB0aGUgc2FtZSBzcGFuXG4gICAgICogaXMgdW5kZWZpbmVkLlxuICAgICAqXG4gICAgICogVGhlIHN1cHBvcnRlZCB0eXBlIG9mIHRoZSB2YWx1ZXMgaXMgaW1wbGVtZW50YXRpb24tZGVwZW5kZW50LlxuICAgICAqIEltcGxlbWVudGF0aW9ucyBhcmUgZXhwZWN0ZWQgdG8gc2FmZWx5IGhhbmRsZSBhbGwgdHlwZXMgb2YgdmFsdWVzIGJ1dFxuICAgICAqIG1heSBjaG9vc2UgdG8gaWdub3JlIHVucmVjb2duaXplZCAvIHVuaGFuZGxlLWFibGUgdmFsdWVzIChlLmcuIG9iamVjdHNcbiAgICAgKiB3aXRoIGN5Y2xpYyByZWZlcmVuY2VzLCBmdW5jdGlvbiBvYmplY3RzKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICAgICAqL1xuICAgIFNwYW4ucHJvdG90eXBlLmFkZFRhZ3MgPSBmdW5jdGlvbiAoa2V5VmFsdWVNYXApIHtcbiAgICAgICAgdGhpcy5fYWRkVGFncyhrZXlWYWx1ZU1hcCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQWRkIGEgbG9nIHJlY29yZCB0byB0aGlzIFNwYW4sIG9wdGlvbmFsbHkgYXQgYSB1c2VyLXByb3ZpZGVkIHRpbWVzdGFtcC5cbiAgICAgKlxuICAgICAqIEZvciBleGFtcGxlOlxuICAgICAqXG4gICAgICogICAgIHNwYW4ubG9nKHtcbiAgICAgKiAgICAgICAgIHNpemU6IHJwYy5zaXplKCksICAvLyBudW1lcmljIHZhbHVlXG4gICAgICogICAgICAgICBVUkk6IHJwYy5VUkkoKSwgIC8vIHN0cmluZyB2YWx1ZVxuICAgICAqICAgICAgICAgcGF5bG9hZDogcnBjLnBheWxvYWQoKSwgIC8vIE9iamVjdCB2YWx1ZVxuICAgICAqICAgICAgICAgXCJrZXlzIGNhbiBiZSBhcmJpdHJhcnkgc3RyaW5nc1wiOiBycGMuZm9vKCksXG4gICAgICogICAgIH0pO1xuICAgICAqXG4gICAgICogICAgIHNwYW4ubG9nKHtcbiAgICAgKiAgICAgICAgIFwiZXJyb3IuZGVzY3JpcHRpb25cIjogc29tZUVycm9yLmRlc2NyaXB0aW9uKCksXG4gICAgICogICAgIH0sIHNvbWVFcnJvci50aW1lc3RhbXBNaWxsaXMoKSk7XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0ga2V5VmFsdWVQYWlyc1xuICAgICAqICAgICAgICBBbiBvYmplY3QgbWFwcGluZyBzdHJpbmcga2V5cyB0byBhcmJpdHJhcnkgdmFsdWUgdHlwZXMuIEFsbFxuICAgICAqICAgICAgICBUcmFjZXIgaW1wbGVtZW50YXRpb25zIHNob3VsZCBzdXBwb3J0IGJvb2wsIHN0cmluZywgYW5kIG51bWVyaWNcbiAgICAgKiAgICAgICAgdmFsdWUgdHlwZXMsIGFuZCBzb21lIG1heSBhbHNvIHN1cHBvcnQgT2JqZWN0IHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXN0YW1wXG4gICAgICogICAgICAgIEFuIG9wdGlvbmFsIHBhcmFtZXRlciBzcGVjaWZ5aW5nIHRoZSB0aW1lc3RhbXAgaW4gbWlsbGlzZWNvbmRzXG4gICAgICogICAgICAgIHNpbmNlIHRoZSBVbml4IGVwb2NoLiBGcmFjdGlvbmFsIHZhbHVlcyBhcmUgYWxsb3dlZCBzbyB0aGF0XG4gICAgICogICAgICAgIHRpbWVzdGFtcHMgd2l0aCBzdWItbWlsbGlzZWNvbmQgYWNjdXJhY3kgY2FuIGJlIHJlcHJlc2VudGVkLiBJZlxuICAgICAqICAgICAgICBub3Qgc3BlY2lmaWVkLCB0aGUgaW1wbGVtZW50YXRpb24gaXMgZXhwZWN0ZWQgdG8gdXNlIGl0cyBub3Rpb25cbiAgICAgKiAgICAgICAgb2YgdGhlIGN1cnJlbnQgdGltZSBvZiB0aGUgY2FsbC5cbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbiAoa2V5VmFsdWVQYWlycywgdGltZXN0YW1wKSB7XG4gICAgICAgIHRoaXMuX2xvZyhrZXlWYWx1ZVBhaXJzLCB0aW1lc3RhbXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIERFUFJFQ0FURURcbiAgICAgKi9cbiAgICBTcGFuLnByb3RvdHlwZS5sb2dFdmVudCA9IGZ1bmN0aW9uIChldmVudE5hbWUsIHBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvZyh7IGV2ZW50OiBldmVudE5hbWUsIHBheWxvYWQ6IHBheWxvYWQgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBlbmQgdGltZXN0YW1wIGFuZCBmaW5hbGl6ZXMgU3BhbiBzdGF0ZS5cbiAgICAgKlxuICAgICAqIFdpdGggdGhlIGV4Y2VwdGlvbiBvZiBjYWxscyB0byBTcGFuLmNvbnRleHQoKSAod2hpY2ggYXJlIGFsd2F5cyBhbGxvd2VkKSxcbiAgICAgKiBmaW5pc2goKSBtdXN0IGJlIHRoZSBsYXN0IGNhbGwgbWFkZSB0byBhbnkgc3BhbiBpbnN0YW5jZSwgYW5kIHRvIGRvXG4gICAgICogb3RoZXJ3aXNlIGxlYWRzIHRvIHVuZGVmaW5lZCBiZWhhdmlvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge251bWJlcn0gZmluaXNoVGltZVxuICAgICAqICAgICAgICAgT3B0aW9uYWwgZmluaXNoIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGFzIGEgVW5peCB0aW1lc3RhbXAuIERlY2ltYWxcbiAgICAgKiAgICAgICAgIHZhbHVlcyBhcmUgc3VwcG9ydGVkIGZvciB0aW1lc3RhbXBzIHdpdGggc3ViLW1pbGxpc2Vjb25kIGFjY3VyYWN5LlxuICAgICAqICAgICAgICAgSWYgbm90IHNwZWNpZmllZCwgdGhlIGN1cnJlbnQgdGltZSAoYXMgZGVmaW5lZCBieSB0aGVcbiAgICAgKiAgICAgICAgIGltcGxlbWVudGF0aW9uKSB3aWxsIGJlIHVzZWQuXG4gICAgICovXG4gICAgU3Bhbi5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24gKGZpbmlzaFRpbWUpIHtcbiAgICAgICAgdGhpcy5fZmluaXNoKGZpbmlzaFRpbWUpO1xuICAgICAgICAvLyBEbyBub3QgcmV0dXJuIGB0aGlzYC4gVGhlIFNwYW4gZ2VuZXJhbGx5IHNob3VsZCBub3QgYmUgdXNlZCBhZnRlciBpdFxuICAgICAgICAvLyBpcyBmaW5pc2hlZCBzbyBjaGFpbmluZyBpcyBub3QgZGVzaXJlZCBpbiB0aGlzIGNvbnRleHQuXG4gICAgfTtcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gICAgLy8gRGVyaXZlZCBjbGFzc2VzIGNhbiBjaG9vc2UgdG8gaW1wbGVtZW50IHRoZSBiZWxvd1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvLyBCeSBkZWZhdWx0IHJldHVybnMgYSBuby1vcCBTcGFuQ29udGV4dC5cbiAgICBTcGFuLnByb3RvdHlwZS5fY29udGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5vb3Auc3BhbkNvbnRleHQ7XG4gICAgfTtcbiAgICAvLyBCeSBkZWZhdWx0IHJldHVybnMgYSBuby1vcCB0cmFjZXIuXG4gICAgLy9cbiAgICAvLyBUaGUgYmFzZSBjbGFzcyBjb3VsZCBzdG9yZSB0aGUgdHJhY2VyIHRoYXQgY3JlYXRlZCBpdCwgYnV0IGl0IGRvZXMgbm90XG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIHRoZSBuby1vcCBzcGFuIGltcGxlbWVudGF0aW9uIGhhcyB6ZXJvIG1lbWJlcnMsXG4gICAgLy8gd2hpY2ggYWxsb3dzIFY4IHRvIGFnZ3Jlc3NpdmVseSBvcHRpbWl6ZSBjYWxscyB0byBzdWNoIG9iamVjdHMuXG4gICAgU3Bhbi5wcm90b3R5cGUuX3RyYWNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5vb3AudHJhY2VyO1xuICAgIH07XG4gICAgLy8gQnkgZGVmYXVsdCBkb2VzIG5vdGhpbmdcbiAgICBTcGFuLnByb3RvdHlwZS5fc2V0T3BlcmF0aW9uTmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgfTtcbiAgICAvLyBCeSBkZWZhdWx0IGRvZXMgbm90aGluZ1xuICAgIFNwYW4ucHJvdG90eXBlLl9zZXRCYWdnYWdlSXRlbSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgfTtcbiAgICAvLyBCeSBkZWZhdWx0IGRvZXMgbm90aGluZ1xuICAgIFNwYW4ucHJvdG90eXBlLl9nZXRCYWdnYWdlSXRlbSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8vIEJ5IGRlZmF1bHQgZG9lcyBub3RoaW5nXG4gICAgLy9cbiAgICAvLyBOT1RFOiBib3RoIHNldFRhZygpIGFuZCBhZGRUYWdzKCkgbWFwIHRvIHRoaXMgZnVuY3Rpb24uIGtleVZhbHVlUGFpcnNcbiAgICAvLyB3aWxsIGFsd2F5cyBiZSBhbiBhc3NvY2lhdGl2ZSBhcnJheS5cbiAgICBTcGFuLnByb3RvdHlwZS5fYWRkVGFncyA9IGZ1bmN0aW9uIChrZXlWYWx1ZVBhaXJzKSB7XG4gICAgfTtcbiAgICAvLyBCeSBkZWZhdWx0IGRvZXMgbm90aGluZ1xuICAgIFNwYW4ucHJvdG90eXBlLl9sb2cgPSBmdW5jdGlvbiAoa2V5VmFsdWVQYWlycywgdGltZXN0YW1wKSB7XG4gICAgfTtcbiAgICAvLyBCeSBkZWZhdWx0IGRvZXMgbm90aGluZ1xuICAgIC8vXG4gICAgLy8gZmluaXNoVGltZSBpcyBleHBlY3RlZCB0byBiZSBlaXRoZXIgYSBudW1iZXIgb3IgdW5kZWZpbmVkLlxuICAgIFNwYW4ucHJvdG90eXBlLl9maW5pc2ggPSBmdW5jdGlvbiAoZmluaXNoVGltZSkge1xuICAgIH07XG4gICAgcmV0dXJuIFNwYW47XG59KCkpO1xuZXhwb3J0cy5TcGFuID0gU3BhbjtcbmV4cG9ydHMuZGVmYXVsdCA9IFNwYW47XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zcGFuLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyoqXG4gKiBTcGFuQ29udGV4dCByZXByZXNlbnRzIFNwYW4gc3RhdGUgdGhhdCBtdXN0IHByb3BhZ2F0ZSB0byBkZXNjZW5kYW50IFNwYW5zXG4gKiBhbmQgYWNyb3NzIHByb2Nlc3MgYm91bmRhcmllcy5cbiAqXG4gKiBTcGFuQ29udGV4dCBpcyBsb2dpY2FsbHkgZGl2aWRlZCBpbnRvIHR3byBwaWVjZXM6IHRoZSB1c2VyLWxldmVsIFwiQmFnZ2FnZVwiXG4gKiAoc2VlIHNldEJhZ2dhZ2VJdGVtIGFuZCBnZXRCYWdnYWdlSXRlbSkgdGhhdCBwcm9wYWdhdGVzIGFjcm9zcyBTcGFuXG4gKiBib3VuZGFyaWVzIGFuZCBhbnkgVHJhY2VyLWltcGxlbWVudGF0aW9uLXNwZWNpZmljIGZpZWxkcyB0aGF0IGFyZSBuZWVkZWQgdG9cbiAqIGlkZW50aWZ5IG9yIG90aGVyd2lzZSBjb250ZXh0dWFsaXplIHRoZSBhc3NvY2lhdGVkIFNwYW4gaW5zdGFuY2UgKGUuZy4sIGFcbiAqIDx0cmFjZV9pZCwgc3Bhbl9pZCwgc2FtcGxlZD4gdHVwbGUpLlxuICovXG52YXIgU3BhbkNvbnRleHQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3BhbkNvbnRleHQoKSB7XG4gICAgfVxuICAgIHJldHVybiBTcGFuQ29udGV4dDtcbn0oKSk7XG5leHBvcnRzLlNwYW5Db250ZXh0ID0gU3BhbkNvbnRleHQ7XG5leHBvcnRzLmRlZmF1bHQgPSBTcGFuQ29udGV4dDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNwYW5fY29udGV4dC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBGdW5jdGlvbnMgPSByZXF1aXJlKFwiLi9mdW5jdGlvbnNcIik7XG52YXIgTm9vcCA9IHJlcXVpcmUoXCIuL25vb3BcIik7XG52YXIgc3Bhbl8xID0gcmVxdWlyZShcIi4vc3BhblwiKTtcbi8qKlxuICogVHJhY2VyIGlzIHRoZSBlbnRyeS1wb2ludCBiZXR3ZWVuIHRoZSBpbnN0cnVtZW50YXRpb24gQVBJIGFuZCB0aGUgdHJhY2luZ1xuICogaW1wbGVtZW50YXRpb24uXG4gKlxuICogVGhlIGRlZmF1bHQgb2JqZWN0IGFjdHMgYXMgYSBuby1vcCBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBOb3RlIHRvIGltcGxlbWVudGF0b3JzOiBkZXJpdmVkIGNsYXNzZXMgY2FuIGNob29zZSB0byBkaXJlY3RseSBpbXBsZW1lbnQgdGhlXG4gKiBtZXRob2RzIGluIHRoZSBcIk9wZW5UcmFjaW5nIEFQSSBtZXRob2RzXCIgc2VjdGlvbiwgb3Igb3B0aW9uYWxseSB0aGUgc3Vic2V0IG9mXG4gKiB1bmRlcnNjb3JlLXByZWZpeGVkIG1ldGhvZHMgdG8gcGljayB1cCB0aGUgYXJndW1lbnQgY2hlY2tpbmcgYW5kIGhhbmRsaW5nXG4gKiBhdXRvbWF0aWNhbGx5IGZyb20gdGhlIGJhc2UgY2xhc3MuXG4gKi9cbnZhciBUcmFjZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVHJhY2VyKCkge1xuICAgIH1cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gICAgLy8gT3BlblRyYWNpbmcgQVBJIG1ldGhvZHNcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gICAgLyoqXG4gICAgICogU3RhcnRzIGFuZCByZXR1cm5zIGEgbmV3IFNwYW4gcmVwcmVzZW50aW5nIGEgbG9naWNhbCB1bml0IG9mIHdvcmsuXG4gICAgICpcbiAgICAgKiBGb3IgZXhhbXBsZTpcbiAgICAgKlxuICAgICAqICAgICAvLyBTdGFydCBhIG5ldyAocGFyZW50bGVzcykgcm9vdCBTcGFuOlxuICAgICAqICAgICB2YXIgcGFyZW50ID0gVHJhY2VyLnN0YXJ0U3BhbignRG9Xb3JrJyk7XG4gICAgICpcbiAgICAgKiAgICAgLy8gU3RhcnQgYSBuZXcgKGNoaWxkKSBTcGFuOlxuICAgICAqICAgICB2YXIgY2hpbGQgPSBUcmFjZXIuc3RhcnRTcGFuKCdsb2FkLWZyb20tZGInLCB7XG4gICAgICogICAgICAgICBjaGlsZE9mOiBwYXJlbnQuY29udGV4dCgpLFxuICAgICAqICAgICB9KTtcbiAgICAgKlxuICAgICAqICAgICAvLyBTdGFydCBhIG5ldyBhc3luYyAoRm9sbG93c0Zyb20pIFNwYW46XG4gICAgICogICAgIHZhciBjaGlsZCA9IFRyYWNlci5zdGFydFNwYW4oJ2FzeW5jLWNhY2hlLXdyaXRlJywge1xuICAgICAqICAgICAgICAgcmVmZXJlbmNlczogW1xuICAgICAqICAgICAgICAgICAgIG9wZW50cmFjaW5nLmZvbGxvd3NGcm9tKHBhcmVudC5jb250ZXh0KCkpXG4gICAgICogICAgICAgICBdLFxuICAgICAqICAgICB9KTtcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIG9wZXJhdGlvbiAoUkVRVUlSRUQpLlxuICAgICAqIEBwYXJhbSB7U3Bhbk9wdGlvbnN9IFtvcHRpb25zXSAtIG9wdGlvbnMgZm9yIHRoZSBuZXdseSBjcmVhdGVkIHNwYW4uXG4gICAgICogQHJldHVybiB7U3Bhbn0gLSBhIG5ldyBTcGFuIG9iamVjdC5cbiAgICAgKi9cbiAgICBUcmFjZXIucHJvdG90eXBlLnN0YXJ0U3BhbiA9IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgICAgIC8vIENvbnZlcnQgb3B0aW9ucy5jaGlsZE9mIHRvIGZpZWxkcy5yZWZlcmVuY2VzIGFzIG5lZWRlZC5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2hpbGRPZikge1xuICAgICAgICAgICAgLy8gQ29udmVydCBmcm9tIGEgU3BhbiBvciBhIFNwYW5Db250ZXh0IGludG8gYSBSZWZlcmVuY2UuXG4gICAgICAgICAgICB2YXIgY2hpbGRPZiA9IEZ1bmN0aW9ucy5jaGlsZE9mKG9wdGlvbnMuY2hpbGRPZik7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5yZWZlcmVuY2VzKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5yZWZlcmVuY2VzLnB1c2goY2hpbGRPZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnJlZmVyZW5jZXMgPSBbY2hpbGRPZl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgKG9wdGlvbnMuY2hpbGRPZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0U3BhbihuYW1lLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEluamVjdHMgdGhlIGdpdmVuIFNwYW5Db250ZXh0IGluc3RhbmNlIGZvciBjcm9zcy1wcm9jZXNzIHByb3BhZ2F0aW9uXG4gICAgICogd2l0aGluIGBjYXJyaWVyYC4gVGhlIGV4cGVjdGVkIHR5cGUgb2YgYGNhcnJpZXJgIGRlcGVuZHMgb24gdGhlIHZhbHVlIG9mXG4gICAgICogYGZvcm1hdC5cbiAgICAgKlxuICAgICAqIE9wZW5UcmFjaW5nIGRlZmluZXMgYSBjb21tb24gc2V0IG9mIGBmb3JtYXRgIHZhbHVlcyAoc2VlXG4gICAgICogRk9STUFUX1RFWFRfTUFQLCBGT1JNQVRfSFRUUF9IRUFERVJTLCBhbmQgRk9STUFUX0JJTkFSWSksIGFuZCBlYWNoIGhhc1xuICAgICAqIGFuIGV4cGVjdGVkIGNhcnJpZXIgdHlwZS5cbiAgICAgKlxuICAgICAqIENvbnNpZGVyIHRoaXMgcHNldWRvY29kZSBleGFtcGxlOlxuICAgICAqXG4gICAgICogICAgIHZhciBjbGllbnRTcGFuID0gLi4uO1xuICAgICAqICAgICAuLi5cbiAgICAgKiAgICAgLy8gSW5qZWN0IGNsaWVudFNwYW4gaW50byBhIHRleHQgY2Fycmllci5cbiAgICAgKiAgICAgdmFyIGhlYWRlcnNDYXJyaWVyID0ge307XG4gICAgICogICAgIFRyYWNlci5pbmplY3QoY2xpZW50U3Bhbi5jb250ZXh0KCksIFRyYWNlci5GT1JNQVRfSFRUUF9IRUFERVJTLCBoZWFkZXJzQ2Fycmllcik7XG4gICAgICogICAgIC8vIEluY29ycG9yYXRlIHRoZSB0ZXh0Q2FycmllciBpbnRvIHRoZSBvdXRib3VuZCBIVFRQIHJlcXVlc3QgaGVhZGVyXG4gICAgICogICAgIC8vIG1hcC5cbiAgICAgKiAgICAgT2JqZWN0LmFzc2lnbihvdXRib3VuZEhUVFBSZXEuaGVhZGVycywgaGVhZGVyc0NhcnJpZXIpO1xuICAgICAqICAgICAvLyAuLi4gc2VuZCB0aGUgaHR0cFJlcVxuICAgICAqXG4gICAgICogQHBhcmFtICB7U3BhbkNvbnRleHR9IHNwYW5Db250ZXh0IC0gdGhlIFNwYW5Db250ZXh0IHRvIGluamVjdCBpbnRvIHRoZVxuICAgICAqICAgICAgICAgY2FycmllciBvYmplY3QuIEFzIGEgY29udmVuaWVuY2UsIGEgU3BhbiBpbnN0YW5jZSBtYXkgYmUgcGFzc2VkXG4gICAgICogICAgICAgICBpbiBpbnN0ZWFkIChpbiB3aGljaCBjYXNlIGl0cyAuY29udGV4dCgpIGlzIHVzZWQgZm9yIHRoZVxuICAgICAqICAgICAgICAgaW5qZWN0KCkpLlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gZm9ybWF0IC0gdGhlIGZvcm1hdCBvZiB0aGUgY2Fycmllci5cbiAgICAgKiBAcGFyYW0gIHthbnl9IGNhcnJpZXIgLSBzZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBjaG9zZW4gYGZvcm1hdGBcbiAgICAgKiAgICAgICAgIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZSBjYXJyaWVyIG9iamVjdC5cbiAgICAgKi9cbiAgICBUcmFjZXIucHJvdG90eXBlLmluamVjdCA9IGZ1bmN0aW9uIChzcGFuQ29udGV4dCwgZm9ybWF0LCBjYXJyaWVyKSB7XG4gICAgICAgIC8vIEFsbG93IHRoZSB1c2VyIHRvIHBhc3MgYSBTcGFuIGluc3RlYWQgb2YgYSBTcGFuQ29udGV4dFxuICAgICAgICBpZiAoc3BhbkNvbnRleHQgaW5zdGFuY2VvZiBzcGFuXzEuZGVmYXVsdCkge1xuICAgICAgICAgICAgc3BhbkNvbnRleHQgPSBzcGFuQ29udGV4dC5jb250ZXh0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2luamVjdChzcGFuQ29udGV4dCwgZm9ybWF0LCBjYXJyaWVyKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBTcGFuQ29udGV4dCBpbnN0YW5jZSBleHRyYWN0ZWQgZnJvbSBgY2FycmllcmAgaW4gdGhlIGdpdmVuXG4gICAgICogYGZvcm1hdGAuXG4gICAgICpcbiAgICAgKiBPcGVuVHJhY2luZyBkZWZpbmVzIGEgY29tbW9uIHNldCBvZiBgZm9ybWF0YCB2YWx1ZXMgKHNlZVxuICAgICAqIEZPUk1BVF9URVhUX01BUCwgRk9STUFUX0hUVFBfSEVBREVSUywgYW5kIEZPUk1BVF9CSU5BUlkpLCBhbmQgZWFjaCBoYXNcbiAgICAgKiBhbiBleHBlY3RlZCBjYXJyaWVyIHR5cGUuXG4gICAgICpcbiAgICAgKiBDb25zaWRlciB0aGlzIHBzZXVkb2NvZGUgZXhhbXBsZTpcbiAgICAgKlxuICAgICAqICAgICAvLyBVc2UgdGhlIGluYm91bmQgSFRUUCByZXF1ZXN0J3MgaGVhZGVycyBhcyBhIHRleHQgbWFwIGNhcnJpZXIuXG4gICAgICogICAgIHZhciBoZWFkZXJzQ2FycmllciA9IGluYm91bmRIVFRQUmVxLmhlYWRlcnM7XG4gICAgICogICAgIHZhciB3aXJlQ3R4ID0gVHJhY2VyLmV4dHJhY3QoVHJhY2VyLkZPUk1BVF9IVFRQX0hFQURFUlMsIGhlYWRlcnNDYXJyaWVyKTtcbiAgICAgKiAgICAgdmFyIHNlcnZlclNwYW4gPSBUcmFjZXIuc3RhcnRTcGFuKCcuLi4nLCB7IGNoaWxkT2YgOiB3aXJlQ3R4IH0pO1xuICAgICAqXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBmb3JtYXQgLSB0aGUgZm9ybWF0IG9mIHRoZSBjYXJyaWVyLlxuICAgICAqIEBwYXJhbSAge2FueX0gY2FycmllciAtIHRoZSB0eXBlIG9mIHRoZSBjYXJyaWVyIG9iamVjdCBpcyBkZXRlcm1pbmVkIGJ5XG4gICAgICogICAgICAgICB0aGUgZm9ybWF0LlxuICAgICAqIEByZXR1cm4ge1NwYW5Db250ZXh0fVxuICAgICAqICAgICAgICAgVGhlIGV4dHJhY3RlZCBTcGFuQ29udGV4dCwgb3IgbnVsbCBpZiBubyBzdWNoIFNwYW5Db250ZXh0IGNvdWxkXG4gICAgICogICAgICAgICBiZSBmb3VuZCBpbiBgY2FycmllcmBcbiAgICAgKi9cbiAgICBUcmFjZXIucHJvdG90eXBlLmV4dHJhY3QgPSBmdW5jdGlvbiAoZm9ybWF0LCBjYXJyaWVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9leHRyYWN0KGZvcm1hdCwgY2Fycmllcik7XG4gICAgfTtcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gICAgLy8gRGVyaXZlZCBjbGFzc2VzIGNhbiBjaG9vc2UgdG8gaW1wbGVtZW50IHRoZSBiZWxvd1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgICAvLyBOT1RFOiB0aGUgaW5wdXQgdG8gdGhpcyBtZXRob2QgaXMgKmFsd2F5cyogYW4gYXNzb2NpYXRpdmUgYXJyYXkuIFRoZVxuICAgIC8vIHB1YmxpYy1mYWNpbmcgc3RhcnRTcGFuKCkgbWV0aG9kIG5vcm1hbGl6ZXMgdGhlIGFyZ3VtZW50cyBzbyB0aGF0XG4gICAgLy8gYWxsIE4gaW1wbGVtZW50YXRpb25zIGRvIG5vdCBuZWVkIHRvIHdvcnJ5IGFib3V0IHZhcmlhdGlvbnMgaW4gdGhlIGNhbGxcbiAgICAvLyBzaWduYXR1cmUuXG4gICAgLy9cbiAgICAvLyBUaGUgZGVmYXVsdCBiZWhhdmlvciByZXR1cm5zIGEgbm8tb3Agc3Bhbi5cbiAgICBUcmFjZXIucHJvdG90eXBlLl9zdGFydFNwYW4gPSBmdW5jdGlvbiAobmFtZSwgZmllbGRzKSB7XG4gICAgICAgIHJldHVybiBOb29wLnNwYW47XG4gICAgfTtcbiAgICAvLyBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyBhIG5vLW9wLlxuICAgIFRyYWNlci5wcm90b3R5cGUuX2luamVjdCA9IGZ1bmN0aW9uIChzcGFuQ29udGV4dCwgZm9ybWF0LCBjYXJyaWVyKSB7XG4gICAgfTtcbiAgICAvLyBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0byByZXR1cm4gYSBuby1vcCBTcGFuQ29udGV4dC5cbiAgICBUcmFjZXIucHJvdG90eXBlLl9leHRyYWN0ID0gZnVuY3Rpb24gKGZvcm1hdCwgY2Fycmllcikge1xuICAgICAgICByZXR1cm4gTm9vcC5zcGFuQ29udGV4dDtcbiAgICB9O1xuICAgIHJldHVybiBUcmFjZXI7XG59KCkpO1xuZXhwb3J0cy5UcmFjZXIgPSBUcmFjZXI7XG5leHBvcnRzLmRlZmF1bHQgPSBUcmFjZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10cmFjZXIuanMubWFwIiwiLyoqXG4gKiBAdGhpcyB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gZmluYWxseUNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gIHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gIHJldHVybiB0aGlzLnRoZW4oXG4gICAgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZmluYWxseUNvbnN0cnVjdG9yO1xuIiwiaW1wb3J0IHByb21pc2VGaW5hbGx5IGZyb20gJy4vZmluYWxseSc7XG5cbi8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIHByb21pc2UtcG9seWZpbGwgd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG4vLyBvdGhlciBjb2RlIG1vZGlmeWluZyBzZXRUaW1lb3V0IChsaWtlIHNpbm9uLnVzZUZha2VUaW1lcnMoKSlcbnZhciBzZXRUaW1lb3V0RnVuYyA9IHNldFRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGlzQXJyYXkoeCkge1xuICByZXR1cm4gQm9vbGVhbih4ICYmIHR5cGVvZiB4Lmxlbmd0aCAhPT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxuLy8gUG9seWZpbGwgZm9yIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG5mdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBmbi5hcHBseSh0aGlzQXJnLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqL1xuZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUHJvbWlzZSkpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3Jyk7XG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdCBhIGZ1bmN0aW9uJyk7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gKi9cbiAgdGhpcy5fc3RhdGUgPSAwO1xuICAvKiogQHR5cGUgeyFib29sZWFufSAqL1xuICB0aGlzLl9oYW5kbGVkID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7UHJvbWlzZXx1bmRlZmluZWR9ICovXG4gIHRoaXMuX3ZhbHVlID0gdW5kZWZpbmVkO1xuICAvKiogQHR5cGUgeyFBcnJheTwhRnVuY3Rpb24+fSAqL1xuICB0aGlzLl9kZWZlcnJlZHMgPSBbXTtcblxuICBkb1Jlc29sdmUoZm4sIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGUoc2VsZiwgZGVmZXJyZWQpIHtcbiAgd2hpbGUgKHNlbGYuX3N0YXRlID09PSAzKSB7XG4gICAgc2VsZiA9IHNlbGYuX3ZhbHVlO1xuICB9XG4gIGlmIChzZWxmLl9zdGF0ZSA9PT0gMCkge1xuICAgIHNlbGYuX2RlZmVycmVkcy5wdXNoKGRlZmVycmVkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgc2VsZi5faGFuZGxlZCA9IHRydWU7XG4gIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiA9IHNlbGYuX3N0YXRlID09PSAxID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkO1xuICAgIGlmIChjYiA9PT0gbnVsbCkge1xuICAgICAgKHNlbGYuX3N0YXRlID09PSAxID8gcmVzb2x2ZSA6IHJlamVjdCkoZGVmZXJyZWQucHJvbWlzZSwgc2VsZi5fdmFsdWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmV0O1xuICAgIHRyeSB7XG4gICAgICByZXQgPSBjYihzZWxmLl92YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVqZWN0KGRlZmVycmVkLnByb21pc2UsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXNvbHZlKGRlZmVycmVkLnByb21pc2UsIHJldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlKHNlbGYsIG5ld1ZhbHVlKSB7XG4gIHRyeSB7XG4gICAgLy8gUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLicpO1xuICAgIGlmIChcbiAgICAgIG5ld1ZhbHVlICYmXG4gICAgICAodHlwZW9mIG5ld1ZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3VmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgKSB7XG4gICAgICB2YXIgdGhlbiA9IG5ld1ZhbHVlLnRoZW47XG4gICAgICBpZiAobmV3VmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHNlbGYuX3N0YXRlID0gMztcbiAgICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgZmluYWxlKHNlbGYpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRvUmVzb2x2ZShiaW5kKHRoZW4sIG5ld1ZhbHVlKSwgc2VsZik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5fc3RhdGUgPSAxO1xuICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZmluYWxlKHNlbGYpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmVqZWN0KHNlbGYsIGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlamVjdChzZWxmLCBuZXdWYWx1ZSkge1xuICBzZWxmLl9zdGF0ZSA9IDI7XG4gIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gIGZpbmFsZShzZWxmKTtcbn1cblxuZnVuY3Rpb24gZmluYWxlKHNlbGYpIHtcbiAgaWYgKHNlbGYuX3N0YXRlID09PSAyICYmIHNlbGYuX2RlZmVycmVkcy5sZW5ndGggPT09IDApIHtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5faGFuZGxlZCkge1xuICAgICAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbihzZWxmLl92YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2VsZi5fZGVmZXJyZWRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaGFuZGxlKHNlbGYsIHNlbGYuX2RlZmVycmVkc1tpXSk7XG4gIH1cbiAgc2VsZi5fZGVmZXJyZWRzID0gbnVsbDtcbn1cblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbWlzZSkge1xuICB0aGlzLm9uRnVsZmlsbGVkID0gdHlwZW9mIG9uRnVsZmlsbGVkID09PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiBudWxsO1xuICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsO1xuICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xufVxuXG4vKipcbiAqIFRha2UgYSBwb3RlbnRpYWxseSBtaXNiZWhhdmluZyByZXNvbHZlciBmdW5jdGlvbiBhbmQgbWFrZSBzdXJlXG4gKiBvbkZ1bGZpbGxlZCBhbmQgb25SZWplY3RlZCBhcmUgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBNYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IGFzeW5jaHJvbnkuXG4gKi9cbmZ1bmN0aW9uIGRvUmVzb2x2ZShmbiwgc2VsZikge1xuICB2YXIgZG9uZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIGZuKFxuICAgICAgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoc2VsZiwgdmFsdWUpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KHNlbGYsIHJlYXNvbik7XG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgIGRvbmUgPSB0cnVlO1xuICAgIHJlamVjdChzZWxmLCBleCk7XG4gIH1cbn1cblxuUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbihvblJlamVjdGVkKSB7XG4gIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgLy8gQHRzLWlnbm9yZVxuICB2YXIgcHJvbSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG5vb3ApO1xuXG4gIGhhbmRsZSh0aGlzLCBuZXcgSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbSkpO1xuICByZXR1cm4gcHJvbTtcbn07XG5cblByb21pc2UucHJvdG90eXBlWydmaW5hbGx5J10gPSBwcm9taXNlRmluYWxseTtcblxuUHJvbWlzZS5hbGwgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UuYWxsIGFjY2VwdHMgYW4gYXJyYXknKSk7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aDtcblxuICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlbjtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoZW4uY2FsbChcbiAgICAgICAgICAgICAgdmFsLFxuICAgICAgICAgICAgICBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICByZXMoaSwgdmFsKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcmdzW2ldID0gdmFsO1xuICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZWplY3QoZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzKGksIGFyZ3NbaV0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0pO1xufTtcblxuUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVqZWN0KHZhbHVlKTtcbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJhY2UgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UucmFjZSBhY2NlcHRzIGFuIGFycmF5JykpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIFByb21pc2UucmVzb2x2ZShhcnJbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG5Qcm9taXNlLl9pbW1lZGlhdGVGbiA9XG4gIC8vIEB0cy1pZ25vcmVcbiAgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiZcbiAgICBmdW5jdGlvbihmbikge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9KSB8fFxuICBmdW5jdGlvbihmbikge1xuICAgIHNldFRpbWVvdXRGdW5jKGZuLCAwKTtcbiAgfTtcblxuUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfdW5oYW5kbGVkUmVqZWN0aW9uRm4oZXJyKSB7XG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSkge1xuICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQcm9taXNlO1xuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbiAoVU1EKSB0byBzdXBwb3J0IEFNRCwgQ29tbW9uSlMvTm9kZS5qcywgUmhpbm8sIGFuZCBicm93c2Vycy5cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoJ3N0YWNrZnJhbWUnLCBbXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5TdGFja0ZyYW1lID0gZmFjdG9yeSgpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBmdW5jdGlvbiBfaXNOdW1iZXIobikge1xuICAgICAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFN0YWNrRnJhbWUoZnVuY3Rpb25OYW1lLCBhcmdzLCBmaWxlTmFtZSwgbGluZU51bWJlciwgY29sdW1uTnVtYmVyLCBzb3VyY2UpIHtcbiAgICAgICAgaWYgKGZ1bmN0aW9uTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldEZ1bmN0aW9uTmFtZShmdW5jdGlvbk5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXJncyhhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsZU5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRGaWxlTmFtZShmaWxlTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVOdW1iZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRMaW5lTnVtYmVyKGxpbmVOdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2x1bW5OdW1iZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRDb2x1bW5OdW1iZXIoY29sdW1uTnVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U291cmNlKHNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBTdGFja0ZyYW1lLnByb3RvdHlwZSA9IHtcbiAgICAgICAgZ2V0RnVuY3Rpb25OYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mdW5jdGlvbk5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldEZ1bmN0aW9uTmFtZTogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25OYW1lID0gU3RyaW5nKHYpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEFyZ3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFyZ3M7XG4gICAgICAgIH0sXG4gICAgICAgIHNldEFyZ3M6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHYpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJncyBtdXN0IGJlIGFuIEFycmF5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmFyZ3MgPSB2O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIE5PVEU6IFByb3BlcnR5IG5hbWUgbWF5IGJlIG1pc2xlYWRpbmcgYXMgaXQgaW5jbHVkZXMgdGhlIHBhdGgsXG4gICAgICAgIC8vIGJ1dCBpdCBzb21ld2hhdCBtaXJyb3JzIFY4J3MgSmF2YVNjcmlwdFN0YWNrVHJhY2VBcGlcbiAgICAgICAgLy8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC93aWtpL0phdmFTY3JpcHRTdGFja1RyYWNlQXBpIGFuZCBHZWNrbydzXG4gICAgICAgIC8vIGh0dHA6Ly9teHIubW96aWxsYS5vcmcvbW96aWxsYS1jZW50cmFsL3NvdXJjZS94cGNvbS9iYXNlL25zSUV4Y2VwdGlvbi5pZGwjMTRcbiAgICAgICAgZ2V0RmlsZU5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVOYW1lO1xuICAgICAgICB9LFxuICAgICAgICBzZXRGaWxlTmFtZTogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsZU5hbWUgPSBTdHJpbmcodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGluZU51bWJlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluZU51bWJlcjtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TGluZU51bWJlcjogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICghX2lzTnVtYmVyKHYpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTGluZSBOdW1iZXIgbXVzdCBiZSBhIE51bWJlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5saW5lTnVtYmVyID0gTnVtYmVyKHYpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbHVtbk51bWJlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sdW1uTnVtYmVyO1xuICAgICAgICB9LFxuICAgICAgICBzZXRDb2x1bW5OdW1iZXI6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBpZiAoIV9pc051bWJlcih2KSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbHVtbiBOdW1iZXIgbXVzdCBiZSBhIE51bWJlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb2x1bW5OdW1iZXIgPSBOdW1iZXIodik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U291cmNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldFNvdXJjZTogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHRoaXMuc291cmNlID0gU3RyaW5nKHYpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSB0aGlzLmdldEZ1bmN0aW9uTmFtZSgpIHx8ICd7YW5vbnltb3VzfSc7XG4gICAgICAgICAgICB2YXIgYXJncyA9ICcoJyArICh0aGlzLmdldEFyZ3MoKSB8fCBbXSkuam9pbignLCcpICsgJyknO1xuICAgICAgICAgICAgdmFyIGZpbGVOYW1lID0gdGhpcy5nZXRGaWxlTmFtZSgpID8gKCdAJyArIHRoaXMuZ2V0RmlsZU5hbWUoKSkgOiAnJztcbiAgICAgICAgICAgIHZhciBsaW5lTnVtYmVyID0gX2lzTnVtYmVyKHRoaXMuZ2V0TGluZU51bWJlcigpKSA/ICgnOicgKyB0aGlzLmdldExpbmVOdW1iZXIoKSkgOiAnJztcbiAgICAgICAgICAgIHZhciBjb2x1bW5OdW1iZXIgPSBfaXNOdW1iZXIodGhpcy5nZXRDb2x1bW5OdW1iZXIoKSkgPyAoJzonICsgdGhpcy5nZXRDb2x1bW5OdW1iZXIoKSkgOiAnJztcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbk5hbWUgKyBhcmdzICsgZmlsZU5hbWUgKyBsaW5lTnVtYmVyICsgY29sdW1uTnVtYmVyO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBTdGFja0ZyYW1lO1xufSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8qKlxuICogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTctcHJlc2VudCwgRWxhc3RpY3NlYXJjaCBCVlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKlxuICovXG5cbmltcG9ydCB7XG4gIGNyZWF0ZVNlcnZpY2VGYWN0b3J5LFxuICBib290c3RyYXAsXG4gIGlzQnJvd3NlclxufSBmcm9tICdAZWxhc3RpYy9hcG0tcnVtLWNvcmUnXG5pbXBvcnQgQXBtQmFzZSBmcm9tICcuL2FwbS1iYXNlJ1xuXG4vKipcbiAqIFVzZSBhIHNpbmdsZSBpbnN0YW5jZSBvZiBBcG1CYXNlIGFjcm9zcyBhbGwgaW5zdGFuY2Ugb2YgdGhlIGFnZW50XG4gKiBpbmNsdWRpbmcgdGhlIGluc3RhbmNlcyB1c2VkIGluIGZyYW1ld29yayBzcGVjaWZpYyBpbnRlZ3JhdGlvbnNcbiAqL1xuZnVuY3Rpb24gZ2V0QXBtQmFzZSgpIHtcbiAgaWYgKGlzQnJvd3NlciAmJiB3aW5kb3cuZWxhc3RpY0FwbSkge1xuICAgIHJldHVybiB3aW5kb3cuZWxhc3RpY0FwbVxuICB9XG4gIGNvbnN0IGVuYWJsZWQgPSBib290c3RyYXAoKVxuICBjb25zdCBzZXJ2aWNlRmFjdG9yeSA9IGNyZWF0ZVNlcnZpY2VGYWN0b3J5KClcbiAgY29uc3QgYXBtQmFzZSA9IG5ldyBBcG1CYXNlKHNlcnZpY2VGYWN0b3J5LCAhZW5hYmxlZClcblxuICBpZiAoaXNCcm93c2VyKSB7XG4gICAgd2luZG93LmVsYXN0aWNBcG0gPSBhcG1CYXNlXG4gIH1cblxuICByZXR1cm4gYXBtQmFzZVxufVxuXG5jb25zdCBhcG1CYXNlID0gZ2V0QXBtQmFzZSgpXG5cbmNvbnN0IGluaXQgPSBhcG1CYXNlLmluaXQuYmluZChhcG1CYXNlKVxuXG5leHBvcnQgZGVmYXVsdCBpbml0XG5leHBvcnQgeyBpbml0LCBhcG1CYXNlLCBBcG1CYXNlLCBhcG1CYXNlIGFzIGFwbSB9XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFBQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBREE7QUFHQTtBQVZBO0FBWUE7QUFiQTtBQWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBUEE7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBREE7QUFHQTtBQVZBO0FBWUE7QUFiQTtBQWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVJBO0FBQ0E7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQWZBO0FBQ0E7QUFpQkE7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBR0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFSQTtBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFKQTtBQUpBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFQQTtBQURBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7QUN2VkE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQURBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBREE7QUFBQTtBQUNBO0FBREE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBN0JBO0FBK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsREE7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQURBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQURBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBUEE7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUxBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFEQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVhBO0FBQ0E7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25EQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBREE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7OztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7Ozs7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBSkE7QUFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7OztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBRkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVCQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7Ozs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUxBO0FBSkE7QUFDQTtBQVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7Ozs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0E7Ozs7Ozs7Ozs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QTs7Ozs7Ozs7Ozs7OztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFOQTtBQVFBO0FBQ0E7QUFEQTtBQVRBO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUZBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUZBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQWJBO0FBZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFUQTtBQVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBVEE7QUFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBREE7QUFHQTtBQVpBO0FBQ0E7QUFjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBOzs7Ozs7Ozs7Ozs7Ozs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0E7Ozs7Ozs7Ozs7Ozs7O0FDcFZBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQVJBO0FBQ0E7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFKQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7Ozs7OztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7OztBOzs7Ozs7Ozs7Ozs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFFQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QTs7Ozs7Ozs7Ozs7OztBQ1hBO0FBQUE7QUFBQTtBQUNBO0FBREE7QUFBQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBREE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQURBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzRkE7QUFBQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEE7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEE7QUFDQTtBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7OztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFIQTtBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFGQTtBQUNBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUpBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFDQTtBQUdBO0FBQUE7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBTkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUZBO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBOzs7Ozs7Ozs7Ozs7Ozs7OztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTs7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQWJBO0FBbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtBO0FBQ0E7QUFDQTtBQUZBO0FBQ0E7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFDQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFEQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFkQTtBQWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBakJBO0FBbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0E7Ozs7Ozs7Ozs7OztBQ3ZZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7O0FDdkZBO0FBQUE7QUFBQTtBQUNBO0FBREE7QUFBQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBREE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7QUFBQTtBQUFBO0FBQ0E7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFKQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUhBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUZBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQURBO0FBQ0E7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFGQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7Ozs7QUNoWkE7QUFBQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFEQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7Ozs7OztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRkE7OztBOzs7Ozs7Ozs7Ozs7Ozs7O0FDdUJBO0FBQ0E7QUFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQVdBO0FBQ0E7QUFJQTtBQUNBO0FBSUE7QUFDQTtBQUFBO0FBQ0E7QUFFQTtBQUtBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFEQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBRUE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFNQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFTQTtBQU1BO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFBQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFGQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFPQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZUE7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBREE7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QTs7Ozs7Ozs7QUNyVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQSxhQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBOzs7Ozs7Ozs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBOzs7Ozs7Ozs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QTs7Ozs7Ozs7OztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QTs7Ozs7Ozs7Ozs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QTs7Ozs7Ozs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQSxhQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0E7Ozs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNQQTs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ21CQTtBQUtBO0FBQ0E7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTs7Ozs7O0EiLCJzb3VyY2VSb290IjoiIn0=