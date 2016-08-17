(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["log4js"] = factory();
	else
		root["log4js"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.configure = configure;
	exports.addAppender = addAppender;
	exports.getLogger = getLogger;
	exports.setLogLevel = setLogLevel;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016 Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _formatter = __webpack_require__(1);

	var formatter = _interopRequireWildcard(_formatter);

	var _loggerLogger = __webpack_require__(5);

	var _constLogLevel = __webpack_require__(4);

	var LogLevel = _interopRequireWildcard(_constLogLevel);

	var _appendersConsoleAppender = __webpack_require__(6);

	var consoleAppender = _interopRequireWildcard(_appendersConsoleAppender);

	var _appendersStorageAppender = __webpack_require__(7);

	var storageAppender = _interopRequireWildcard(_appendersStorageAppender);

	var _appendersLogglyAppender = __webpack_require__(8);

	var logglyAppender = _interopRequireWildcard(_appendersLogglyAppender);

	/**
	 * Holds the definition for the appender closure
	 *
	 * @typedef {{ append : function (number, LOG_EVENT), isActive : function(),
	 *          setLogLevel : function(number), setTagLayout : function(string) }}
	 */
	var APPENDER;

	/**
	 * @typedef {{ allowAppenderInjection : boolean, appenders : Array.<APPENDER>,
	 * 			application : Object, loggers : Array.<LOGGER>, tagLayout : string }}
	 */
	var CONFIG_PARAMS;

	/**
	 * Holds the definition for the log event object
	 *
	 * @typedef {{ date : Date, error : Error, message : string, properties : Object,
	 *          timestamp : string }}
	 */
	var LOG_EVENT;

	/**
	 * @typedef {{ logLevel : number }}
	 */
	var LOGGER;

	var ALLOWED_APPENDERS = {
	  'consoleAppender': consoleAppender.ConsoleAppender,
	  'storageAppender': storageAppender.StorageAppender,
	  'logglyAppender': logglyAppender.LogglyAppender
	};

	/** @const */
	var DEFAULT_CONFIG = {
	  tagLayout: '%d{HH:mm:ss} [%level] %logger - %message',
	  appenders: ['consoleAppender'],
	  loggers: [{
	    logLevel: LogLevel.INFO
	  }],
	  allowAppenderInjection: true
	};

	/** @type {Array.<APPENDER>} */
	var appenders_ = [];
	/** @type {?CONFIG_PARAMS} */
	var configuration_ = null;
	/** @type {boolean} */
	var finalized_ = false;
	/** @type {Object} */
	var loggers_ = {};

	exports.LogLevel = LogLevel;

	/**
	 * Configures the logger
	 *
	 * @function
	 *
	 * @params {CONFIG_PARAMS} config
	 */

	function configure(config) {

	  if (finalized_) {
	    append(LogLevel.ERROR, 'Could not configure. LogUtility already in use');
	    return;
	  }

	  configureAppenders_(config.appenders);

	  configureLoggers_(config.loggers);

	  configureTagLayout_(config.tagLayout);

	  configuration_ = config;
	}

	var configureAppenders_ = function configureAppenders_(appenders) {

	  if (appenders instanceof Array) {
	    var count = appenders.length;
	    for (var i = 0; i < count; i++) {
	      addAppender_(appenders[i]);
	    }
	  }
	};

	var configureTagLayout_ = function configureTagLayout_(tagLayout) {
	  if (tagLayout) {
	    formatter.preCompile(tagLayout);
	    for (var logKey in loggers_) {
	      if (loggers_.hasOwnProperty(logKey)) {
	        for (var key in loggers_[logKey]) {
	          if (loggers_[logKey].hasOwnProperty(key)) {
	            loggers_[logKey][key].setTagLayout(tagLayout);
	          }
	        }
	      }
	    }
	  }
	};

	var configureLoggers_ = function configureLoggers_(loggers) {

	  if (!(loggers instanceof Array)) {
	    throw new Error("Invalid loggers");
	  }

	  var count = loggers.length;
	  for (var i = 0; i < count; i++) {

	    if (!loggers[i].tag) {
	      loggers_['main'] = getLoggers_(loggers[i].logLevel);
	    } else {
	      loggers_[loggers[i].tag] = getLoggers_(loggers[i].logLevel);
	    }
	  }
	};

	var getLoggers_ = function getLoggers_(logLevel) {

	  var logger;
	  var loggers = [];
	  var count = appenders_.length;
	  while (count--) {
	    logger = appenders_[count]();
	    logger.setLogLevel(logLevel);
	    loggers.push(logger);
	  }

	  return loggers;
	};

	var addAppender_ = function addAppender_(appender) {
	  if (finalized_ && !configuration_.allowAppenderInjection) {
	    console.error('Cannot add appender when configuration finalized');
	    return;
	  }

	  validateAppender_(ALLOWED_APPENDERS[appender]);
	  appenders_.push(ALLOWED_APPENDERS[appender]);
	};

	/**
	 * Adds an appender to the appender queue. If the stack is finalized, and
	 * the allowAppenderInjection is set to false, then the event will not be
	 * appended
	 *
	 * @function
	 *
	 * @params {APPENDER} appender
	 */

	function addAppender(appender) {
	  //adding appender
	  addAppender_(appender);
	  configureLoggers_(configuration_.loggers);
	  configureTagLayout_(configuration_.tagLayout);
	}

	/**
	 * Validates that the appender
	 *
	 * @function
	 *
	 * @params {APPENDER} appender
	 */
	var validateAppender_ = function validateAppender_(appender) {

	  if (appender == null || typeof appender !== 'function') {
	    throw new Error('Invalid appender: not an function');
	  }

	  var appenderObj = appender();

	  var appenderMethods = ['append', 'getName', 'isActive', 'setLogLevel', 'setTagLayout'];
	  for (var key in appenderMethods) {
	    if (appenderMethods.hasOwnProperty(key) && appenderObj[appenderMethods[key]] == undefined || typeof appenderObj[appenderMethods[key]] != 'function') {
	      throw new Error('Invalid appender: missing method: ' + appenderMethods[key]);
	    }
	  }

	  if (configuration_ instanceof Object && configuration_.tagLayout) {
	    appenderObj.setTagLayout(configuration_.tagLayout);
	  }

	  if (typeof appenderObj['init'] == 'function') {
	    appenderObj.init(configuration_);
	  }
	};

	/**
	 * Appends the log event
	 *
	 * @function
	 *
	 * @param {Object} loggingEvent
	 */
	function append(loggingEvent) {

	  // finalize the configuration to make sure no other appenders are injected (if set)
	  finalized_ = true;

	  var loggers;
	  if (loggers_[loggingEvent.logger]) {
	    loggers = loggers_[loggingEvent.logger];
	  } else {
	    loggers = loggers_['main'];
	  }

	  var count = loggers.length;
	  while (count--) {
	    if (loggers[count].isActive(loggingEvent.level)) {
	      loggers[count].append(loggingEvent);
	    }
	  }
	}

	/**
	 * @private
	 * @function
	 *
	 * @param {number} level
	 */
	var validateLevel_ = function validateLevel_(level) {

	  for (var key in LogLevel) {
	    if (level === LogLevel[key]) {
	      return;
	    }
	  }

	  throw new Error('Invalid log level: ' + level);
	};

	/**
	 * Handles creating the logger and returning it
	 * @param {string} context
	 * @return {Logger}
	 */

	function getLogger(context) {

	  // we need to initialize if we haven't
	  if (configuration_ === null) {
	    configure(DEFAULT_CONFIG);
	  }

	  return new _loggerLogger.Logger(context, {
	    append: append
	  });
	}

	/**
	 * Sets the log level for all loggers, or specified logger
	 * @param {number} logLevel
	 * @param {string=} logger
	 */

	function setLogLevel(logLevel, logger) {

	  validateLevel_(logLevel);

	  if (logger !== undefined) {
	    if (loggers_[logger]) {
	      loggers_[logger].setLogLevel(logLevel);
	    }
	  } else {

	    for (var logKey in loggers_) {
	      if (loggers_.hasOwnProperty(logKey)) {
	        for (var key in loggers_[logKey]) {
	          if (loggers_[logKey].hasOwnProperty(key)) {
	            loggers_[logKey][key].setLogLevel(logLevel);
	          }
	        }
	      }
	    }
	  }
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBTzJCLGFBQWE7O0lBQTVCLFNBQVM7OzRCQUNFLGlCQUFpQjs7NkJBQ2Qsa0JBQWtCOztJQUFoQyxRQUFROzt3Q0FFYSw2QkFBNkI7O0lBQWxELGVBQWU7O3dDQUNNLDZCQUE2Qjs7SUFBbEQsZUFBZTs7dUNBQ0ssNEJBQTRCOztJQUFoRCxjQUFjOzs7Ozs7OztBQVExQixJQUFJLFFBQVEsQ0FBQzs7Ozs7O0FBTWIsSUFBSSxhQUFhLENBQUM7Ozs7Ozs7O0FBUWxCLElBQUksU0FBUyxDQUFDOzs7OztBQUtkLElBQUksTUFBTSxDQUFDOztBQUdYLElBQUksaUJBQWlCLEdBQUc7QUFDckIsbUJBQWlCLEVBQUUsZUFBZSxDQUFDLGVBQWU7QUFDbEQsbUJBQWlCLEVBQUUsZUFBZSxDQUFDLGVBQWU7QUFDbEQsa0JBQWdCLEVBQUcsY0FBYyxDQUFDLGNBQWM7Q0FDbEQsQ0FBQzs7O0FBR0YsSUFBTSxjQUFjLEdBQUc7QUFDdEIsV0FBUyxFQUFHLDBDQUEwQztBQUN0RCxXQUFTLEVBQUcsQ0FBRSxpQkFBaUIsQ0FBRTtBQUNqQyxTQUFPLEVBQUcsQ0FBRTtBQUNYLFlBQVEsRUFBRyxRQUFRLENBQUMsSUFBSTtHQUN4QixDQUFFO0FBQ0gsd0JBQXNCLEVBQUcsSUFBSTtDQUM3QixDQUFDOzs7QUFHRixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQzs7QUFFMUIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDOztBQUV2QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O1FBRVYsUUFBUSxHQUFSLFFBQVE7Ozs7Ozs7Ozs7QUFTVCxTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUU7O0FBRWpDLE1BQUksVUFBVSxFQUFFO0FBQ2YsVUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsZ0RBQWdELENBQUMs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O0FBT0ssU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFOzs7QUFHbEMsTUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO0FBQzVCLGFBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUMxQjs7QUFFRCxTQUFPLHlCQUFXLE9BQU8sRUFBRTtBQUMxQixVQUFNLEVBQUUsTUFBTTtHQUNkLENBQUMsQ0FBQztDQUVIOzs7Ozs7OztBQU9NLFNBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUU7O0FBRTdDLGdCQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXpCLE1BQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUN6QixRQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNyQixjQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZDO0dBQ0QsTUFBTTs7QUFFTixTQUFLLElBQUksTUFBTSxJQUFJLFFBQVEsRUFBRTtBQUM1QixVQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDcEMsYUFBSyxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDakMsY0FBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pDLG9CQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1dBQzVDO1NBQ0Q7T0FDRDtLQUNEO0dBRUQ7Q0FFRCIsImZpbGUiOiJsb2dNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2IFJvYmluIFNjaHVsdHogPGh0dHA6Ly9jdW5hZS5jb20+XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBmb3JtYXR0ZXIgZnJvbSAnLi9mb3JtYXR0ZXInO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXIvbG9nZ2VyJztcbmltcG9ydCAqIGFzIExvZ0xldmVsIGZyb20gJy4vY29uc3QvbG9nTGV2ZWwnO1xuXG5pbXBvcnQgKiBhcyBjb25zb2xlQXBwZW5kZXIgZnJvbSAnLi9hcHBlbmRlcnMvY29uc29sZUFwcGVuZGVyJztcbmltcG9ydCAqIGFzIHN0b3JhZ2VBcHBlbmRlciBmcm9tICcuL2FwcGVuZGVycy9zdG9yYWdlQXBwZW5kZXInO1xuaW1wb3J0ICogYXMgbG9nZ2x5QXBwZW5kZXIgZnJvbSAnLi9hcHBlbmRlcnMvbG9nZ2x5QXBwZW5kZXInO1xuXG4vKipcbiAqIEhvbGRzIHRoZSBkZWZpbml0aW9uIGZvciB0aGUgYXBwZW5kZXIgY2xvc3VyZVxuICpcbiAqIEB0eXBlZGVmIHt7IGFwcGVuZCA6IGZ1bmN0aW9uIChudW1iZXIsIExPR19FVkVOVCksIGlzQWN0aXZlIDogZnVuY3Rpb24oKSxcbiAqICAgICAgICAgIHNldExvZ0xldmVsIDogZnVuY3Rpb24obnVtYmVyKSwgc2V0VGFnTGF5b3V0IDogZnVuY3Rpb24oc3RyaW5nKSB9fVxuICovXG52YXIgQVBQRU5ERVI7XG5cbi8qKlxuICogQHR5cGVkZWYge3sgYWxsb3dBcHBlbmRlckluamVjdGlvbiA6IGJvb2xlYW4sIGFwcGVuZGVycyA6IEFycmF5LjxBUFBFTkRFUj4sXG4gKiBcdFx0XHRhcHBsaWNhdGlvbiA6IE9iamVjdCwgbG9nZ2VycyA6IEFycmF5LjxMT0dHRVI+LCB0YWdMYXlvdXQgOiBzdHJpbmcgfX1cbiAqL1xudmFyIENPTkZJR19QQVJBTVM7XG5cbi8qKlxuICogSG9sZHMgdGhlIGRlZmluaXRpb24gZm9yIHRoZSBsb2cgZXZlbnQgb2JqZWN0XG4gKlxuICogQHR5cGVkZWYge3sgZGF0ZSA6IERhdGUsIGVycm9yIDogRXJyb3IsIG1lc3NhZ2UgOiBzdHJpbmcsIHByb3BlcnRpZXMgOiBPYmplY3QsXG4gKiAgICAgICAgICB0aW1lc3RhbXAgOiBzdHJpbmcgfX1cbiAqL1xudmFyIExPR19FVkVOVDtcblxuLyoqXG4gKiBAdHlwZWRlZiB7eyBsb2dMZXZlbCA6IG51bWJlciB9fVxuICovXG52YXIgTE9HR0VSO1xuXG5cbnZhciBBTExPV0VEX0FQUEVOREVSUyA9IHtcbiAgICdjb25zb2xlQXBwZW5kZXInOiBjb25zb2xlQXBwZW5kZXIuQ29uc29sZUFwcGVuZGVyLFxuICAgJ3N0b3JhZ2VBcHBlbmRlcic6IHN0b3JhZ2VBcHBlbmRlci5TdG9yYWdlQXBwZW5kZXIsXG4gICAnbG9nZ2x5QXBwZW5kZXInOiAgbG9nZ2x5QXBwZW5kZXIuTG9nZ2x5QXBwZW5kZXJcbn07XG5cbi8qKiBAY29uc3QgKi9cbmNvbnN0IERFRkFVTFRfQ09ORklHID0ge1xuXHR0YWdMYXlvdXQgOiAnJWR7SEg6bW06c3N9IFslbGV2ZWxdICVsb2dnZXIgLSAlbWVzc2FnZScsXG5cdGFwcGVuZGVycyA6IFsgJ2NvbnNvbGVBcHBlbmRlcicgXSxcblx0bG9nZ2VycyA6IFsge1xuXHRcdGxvZ0xldmVsIDogTG9nTGV2ZWwuSU5GT1xuXHR9IF0sXG5cdGFsbG93QXBwZW5kZXJJbmplY3Rpb24gOiB0cnVlXG59O1xuXG4vKiogQHR5cGUge0FycmF5LjxBUFBFTkRFUj59ICovXG52YXIgYXBwZW5kZXJzXyA9IFtdO1xuLyoqIEB0eXBlIHs/Q09ORklHX1BBUkFNU30gKi9cbnZhciBjb25maWd1cmF0aW9uXyA9IG51bGw7XG4vKiogQHR5cGUge2Jvb2xlYW59ICovXG52YXIgZmluYWxpemVkXyA9IGZhbHNlO1xuLyoqIEB0eXBlIHtPYmplY3R9ICovXG52YXIgbG9nZ2Vyc18gPSB7fTtcblxuZXhwb3J0IHtMb2dMZXZlbH07XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgbG9nZ2VyXG4gKlxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtcyB7Q09ORklHX1BBUkFNU30gY29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoY29uZmlnKSB7XG5cblx0aWYgKGZpbmFsaXplZF8pIHtcblx0XHRhcHBlbmQoTG9nTGV2ZWwuRVJST1IsICdDb3VsZCBub3QgY29uZmlndXJlLiBMb2dVdGlsaXR5IGFscmVhZHkgaW4gdXNlJyk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cbiAgY29uZmlndXJlQXBwZW5kZXJzXyhjb25maWcuYXBwZW5kZXJzKTtcblxuICBjb25maWd1cmVMb2dnZXJzXyhjb25maWcubG9nZ2Vycyk7XG5cbiAgY29uZmlndXJlVGFnTGF5b3V0Xyhjb25maWcudGFnTGF5b3V0KTtcblxuICBjb25maWd1cmF0aW9uXyA9IGNvbmZpZztcblxuXG59XG5cbnZhciBjb25maWd1cmVBcHBlbmRlcnNfID0gZnVuY3Rpb24gKGFwcGVuZGVycykge1xuXG5cdGlmIChhcHBlbmRlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xuXHRcdHZhciBjb3VudCA9IGFwcGVuZGVycy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICBhZGRBcHBlbmRlcl8oYXBwZW5kZXJzW2ldKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBjb25maWd1cmVUYWdMYXlvdXRfID0gZnVuY3Rpb24odGFnTGF5b3V0KSB7XG4gIGlmICh0YWdMYXlvdXQpIHtcbiAgICBmb3JtYXR0ZXIucHJlQ29tcGlsZSh0YWdMYXlvdXQpO1xuICAgIGZvciAodmFyIGxvZ0tleSBpbiBsb2dnZXJzXykge1xuICAgICAgaWYgKGxvZ2dlcnNfLmhhc093blByb3BlcnR5KGxvZ0tleSkpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxvZ2dlcnNfW2xvZ0tleV0pIHtcbiAgICAgICAgICBpZiAobG9nZ2Vyc19bbG9nS2V5XS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBsb2dnZXJzX1tsb2dLZXldW2tleV0uc2V0VGFnTGF5b3V0KHRhZ0xheW91dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgY29uZmlndXJlTG9nZ2Vyc18gPSBmdW5jdGlvbiAobG9nZ2Vycykge1xuXG5cdGlmICghKGxvZ2dlcnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGxvZ2dlcnNcIik7XG5cdH1cblxuXHR2YXIgY291bnQgPSBsb2dnZXJzLmxlbmd0aDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG5cblx0XHRpZiAoIWxvZ2dlcnNbaV0udGFnKSB7XG5cdFx0XHRsb2dnZXJzX1snbWFpbiddID0gZ2V0TG9nZ2Vyc18obG9nZ2Vyc1tpXS5sb2dMZXZlbCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlcnNfW2xvZ2dlcnNbaV0udGFnXSA9IGdldExvZ2dlcnNfKGxvZ2dlcnNbaV0ubG9nTGV2ZWwpO1xuXHRcdH1cblxuXHR9XG5cbn07XG5cblxudmFyIGdldExvZ2dlcnNfID0gZnVuY3Rpb24gKGxvZ0xldmVsKSB7XG5cblx0dmFyIGxvZ2dlcjtcblx0dmFyIGxvZ2dlcnMgPSBbXTtcblx0dmFyIGNvdW50ID0gYXBwZW5kZXJzXy5sZW5ndGg7XG5cdHdoaWxlIChjb3VudC0tKSB7XG5cdFx0bG9nZ2VyID0gYXBwZW5kZXJzX1tjb3VudF0oKTtcblx0XHRsb2dnZXIuc2V0TG9nTGV2ZWwobG9nTGV2ZWwpO1xuXHRcdGxvZ2dlcnMucHVzaChsb2dnZXIpO1xuXHR9XG5cblx0cmV0dXJuIGxvZ2dlcnM7XG5cbn07XG5cbnZhciBhZGRBcHBlbmRlcl8gPSBmdW5jdGlvbihhcHBlbmRlcikge1xuICBpZiAoZmluYWxpemVkXyAmJiAhY29uZmlndXJhdGlvbl8uYWxsb3dBcHBlbmRlckluamVjdGlvbikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBhZGQgYXBwZW5kZXIgd2hlbiBjb25maWd1cmF0aW9uIGZpbmFsaXplZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhbGlkYXRlQXBwZW5kZXJfKEFMTE9XRURfQVBQRU5ERVJTW2FwcGVuZGVyXSk7XG4gIGFwcGVuZGVyc18ucHVzaChBTExPV0VEX0FQUEVOREVSU1thcHBlbmRlcl0pO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGFwcGVuZGVyIHRvIHRoZSBhcHBlbmRlciBxdWV1ZS4gSWYgdGhlIHN0YWNrIGlzIGZpbmFsaXplZCwgYW5kXG4gKiB0aGUgYWxsb3dBcHBlbmRlckluamVjdGlvbiBpcyBzZXQgdG8gZmFsc2UsIHRoZW4gdGhlIGV2ZW50IHdpbGwgbm90IGJlXG4gKiBhcHBlbmRlZFxuICpcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbXMge0FQUEVOREVSfSBhcHBlbmRlclxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkQXBwZW5kZXIoYXBwZW5kZXIpIHtcbiAgLy9hZGRpbmcgYXBwZW5kZXJcbiAgYWRkQXBwZW5kZXJfKGFwcGVuZGVyKTtcbiAgY29uZmlndXJlTG9nZ2Vyc18oY29uZmlndXJhdGlvbl8ubG9nZ2Vycyk7XG4gIGNvbmZpZ3VyZVRhZ0xheW91dF8oY29uZmlndXJhdGlvbl8udGFnTGF5b3V0KTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCB0aGUgYXBwZW5kZXJcbiAqXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW1zIHtBUFBFTkRFUn0gYXBwZW5kZXJcbiAqL1xudmFyIHZhbGlkYXRlQXBwZW5kZXJfID0gZnVuY3Rpb24gKGFwcGVuZGVyKSB7XG5cblx0aWYgKGFwcGVuZGVyID09IG51bGwgfHwgdHlwZW9mIGFwcGVuZGVyICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFwcGVuZGVyOiBub3QgYW4gZnVuY3Rpb24nKTtcblx0fVxuXG5cdHZhciBhcHBlbmRlck9iaiA9IGFwcGVuZGVyKCk7XG5cblx0dmFyIGFwcGVuZGVyTWV0aG9kcyA9IFsnYXBwZW5kJywgJ2dldE5hbWUnLCAnaXNBY3RpdmUnLCAnc2V0TG9nTGV2ZWwnLCAnc2V0VGFnTGF5b3V0J107XG5cdGZvciAodmFyIGtleSBpbiBhcHBlbmRlck1ldGhvZHMpIHtcblx0XHRpZiAoYXBwZW5kZXJNZXRob2RzLmhhc093blByb3BlcnR5KGtleSkgJiYgYXBwZW5kZXJPYmpbYXBwZW5kZXJNZXRob2RzW2tleV1dID09IHVuZGVmaW5lZCB8fFxuXHRcdFx0dHlwZW9mIGFwcGVuZGVyT2JqW2FwcGVuZGVyTWV0aG9kc1trZXldXSAhPSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXBwZW5kZXI6IG1pc3NpbmcgbWV0aG9kOiAnICsgYXBwZW5kZXJNZXRob2RzW2tleV0pO1xuXHRcdH1cblx0fVxuXG5cdGlmIChjb25maWd1cmF0aW9uXyBpbnN0YW5jZW9mIE9iamVjdCAmJiBjb25maWd1cmF0aW9uXy50YWdMYXlvdXQpIHtcblx0XHRhcHBlbmRlck9iai5zZXRUYWdMYXlvdXQoY29uZmlndXJhdGlvbl8udGFnTGF5b3V0KTtcblx0fVxuXG4gIGlmKHR5cGVvZiBhcHBlbmRlck9ialsnaW5pdCddID09ICdmdW5jdGlvbicpIHtcbiAgICBhcHBlbmRlck9iai5pbml0KGNvbmZpZ3VyYXRpb25fKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBcHBlbmRzIHRoZSBsb2cgZXZlbnRcbiAqXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbG9nZ2luZ0V2ZW50XG4gKi9cbmZ1bmN0aW9uIGFwcGVuZChsb2dnaW5nRXZlbnQpIHtcblxuXHQvLyBmaW5hbGl6ZSB0aGUgY29uZmlndXJhdGlvbiB0byBtYWtlIHN1cmUgbm8gb3RoZXIgYXBwZW5kZXJzIGFyZSBpbmplY3RlZCAoaWYgc2V0KVxuXHRmaW5hbGl6ZWRfID0gdHJ1ZTtcblxuXHR2YXIgbG9nZ2Vycztcblx0aWYgKGxvZ2dlcnNfW2xvZ2dpbmdFdmVudC5sb2dnZXJdKSB7XG5cdFx0bG9nZ2VycyA9IGxvZ2dlcnNfW2xvZ2dpbmdFdmVudC5sb2dnZXJdO1xuXHR9IGVsc2Uge1xuXHRcdGxvZ2dlcnMgPSBsb2dnZXJzX1snbWFpbiddO1xuXHR9XG5cblx0dmFyIGNvdW50ID0gbG9nZ2Vycy5sZW5ndGg7XG5cdHdoaWxlIChjb3VudC0tKSB7XG5cdFx0aWYgKGxvZ2dlcnNbY291bnRdLmlzQWN0aXZlKGxvZ2dpbmdFdmVudC5sZXZlbCkpIHtcblx0XHRcdGxvZ2dlcnNbY291bnRdLmFwcGVuZChsb2dnaW5nRXZlbnQpO1xuXHRcdH1cblx0fVxuXG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxuICovXG52YXIgdmFsaWRhdGVMZXZlbF8gPSBmdW5jdGlvbiAobGV2ZWwpIHtcblxuXHRmb3IgKHZhciBrZXkgaW4gTG9nTGV2ZWwpIHtcblx0XHRpZiAobGV2ZWwgPT09IExvZ0xldmVsW2tleV0pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbG9nIGxldmVsOiAnICsgbGV2ZWwpO1xuXG59O1xuXG4vKipcbiAqIEhhbmRsZXMgY3JlYXRpbmcgdGhlIGxvZ2dlciBhbmQgcmV0dXJuaW5nIGl0XG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dFxuICogQHJldHVybiB7TG9nZ2VyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9nZ2VyKGNvbnRleHQpIHtcblxuXHQvLyB3ZSBuZWVkIHRvIGluaXRpYWxpemUgaWYgd2UgaGF2ZW4ndFxuXHRpZiAoY29uZmlndXJhdGlvbl8gPT09IG51bGwpIHtcblx0XHRjb25maWd1cmUoREVGQVVMVF9DT05GSUcpO1xuXHR9XG5cblx0cmV0dXJuIG5ldyBMb2dnZXIoY29udGV4dCwge1xuXHRcdGFwcGVuZDogYXBwZW5kXG5cdH0pO1xuXG59XG5cbi8qKlxuICogU2V0cyB0aGUgbG9nIGxldmVsIGZvciBhbGwgbG9nZ2Vycywgb3Igc3BlY2lmaWVkIGxvZ2dlclxuICogQHBhcmFtIHtudW1iZXJ9IGxvZ0xldmVsXG4gKiBAcGFyYW0ge3N0cmluZz19IGxvZ2dlclxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TG9nTGV2ZWwobG9nTGV2ZWwsIGxvZ2dlcikge1xuXG5cdHZhbGlkYXRlTGV2ZWxfKGxvZ0xldmVsKTtcblxuXHRpZiAobG9nZ2VyICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAobG9nZ2Vyc19bbG9nZ2VyXSkge1xuXHRcdFx0bG9nZ2Vyc19bbG9nZ2VyXS5zZXRMb2dMZXZlbChsb2dMZXZlbCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXG5cdFx0Zm9yICh2YXIgbG9nS2V5IGluIGxvZ2dlcnNfKSB7XG5cdFx0XHRpZiAobG9nZ2Vyc18uaGFzT3duUHJvcGVydHkobG9nS2V5KSkge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbG9nZ2Vyc19bbG9nS2V5XSkge1xuXHRcdFx0XHRcdGlmIChsb2dnZXJzX1tsb2dLZXldLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRcdGxvZ2dlcnNfW2xvZ0tleV1ba2V5XS5zZXRMb2dMZXZlbChsb2dMZXZlbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxufVxuIl19


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.preCompile = preCompile;
	exports.format = format;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _dateFormatter = __webpack_require__(2);

	var _utility = __webpack_require__(3);

	var utility = _interopRequireWildcard(_utility);

	var _constLogLevel = __webpack_require__(4);

	var logLevel = _interopRequireWildcard(_constLogLevel);

	/** @type {Object} */
	var compiledLayouts_ = {};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLogger_ = function formatLogger_(logEvent, params) {
	  return logEvent.logger;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatDate_ = function formatDate_(logEvent, params) {
	  return _dateFormatter.dateFormat(logEvent.date, params[0]);
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatException_ = function formatException_(logEvent, params) {
	  var message = '';
	  if (logEvent.error != null) {

	    if (logEvent.error.stack != undefined) {
	      var stacks = logEvent.error.stack.split(/\n/g);
	      for (var key in stacks) {
	        message += '\t' + stacks[key] + '\n';
	      }
	    } else if (logEvent.error.message != null && logEvent.error.message != '') {
	      message += '\t';
	      message += logEvent.error.name + ': ' + logEvent.error.message;
	      message += '\n';
	    }
	  }
	  return message;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatMapMessage_ = function formatMapMessage_(logEvent, params) {
	  var message = null;
	  if (logEvent.properties) {

	    message = [];
	    for (var key in logEvent.properties) {
	      if (params[0]) {
	        if (params[0] == key) {
	          message.push(logEvent.properties[key]);
	        }
	      } else {
	        message.push('{' + key + ',' + logEvent.properties[key] + '}');
	      }
	    }

	    return '{' + message.join(',') + '}';
	  }
	  return message;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLogMessage_ = function formatLogMessage_(logEvent, params) {
	  return logEvent.message;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatMethodName_ = function formatMethodName_(logEvent, params) {
	  return utility.getFunctionName(logEvent.method);
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLineSeparator_ = function formatLineSeparator_(logEvent, params) {
	  return '\n';
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatLevel_ = function formatLevel_(logEvent, params) {
	  if (logEvent.level == logLevel.FATAL) {
	    return 'FATAL';
	  } else if (logEvent.level == logLevel.ERROR) {
	    return 'ERROR';
	  } else if (logEvent.level == logLevel.WARN) {
	    return 'WARN';
	  } else if (logEvent.level == logLevel.INFO) {
	    return 'INFO';
	  } else if (logEvent.level == logLevel.DEBUG) {
	    return 'DEBUG';
	  } else if (logEvent.level == logLevel.TRACE) {
	    return 'TRACE';
	  }
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatRelative_ = function formatRelative_(logEvent, params) {
	  return '' + logEvent.relative;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {LOG_EVENT} logEvent
	 * @param {Array.<string>} params
	 *
	 * @return {string}
	 */
	var formatSequenceNumber_ = function formatSequenceNumber_(logEvent, params) {
	  return '' + logEvent.sequence;
	};

	var formatters_ = {
	  'c|logger': formatLogger_,
	  'd|date': formatDate_,
	  'ex|exception|throwable': formatException_,
	  'K|map|MAP': formatMapMessage_,
	  'm|msg|message': formatLogMessage_,
	  'M|method': formatMethodName_,
	  'n': formatLineSeparator_,
	  'p|level': formatLevel_,
	  'r|relative': formatRelative_,
	  'sn|sequenceNumber': formatSequenceNumber_
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 *
	 * @return {string}
	 */
	var getCompiledLayout_ = function getCompiledLayout_(layout) {

	  if (compiledLayouts_[layout] != undefined) {
	    return compiledLayouts_[layout];
	  }

	  return compileLayout_(layout);
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 *
	 * @return {string}
	 */
	var compileLayout_ = function compileLayout_(layout) {

	  var index = layout.indexOf('%');
	  var currentFormatString = '';
	  var formatter = [];

	  if (index != 0) {
	    formatter.push(layout.substring(0, index));
	  }

	  do {

	    var startIndex = index;
	    var endIndex = index = layout.indexOf('%', index + 1);

	    if (endIndex < 0) {
	      currentFormatString = layout.substring(startIndex);
	    } else {
	      currentFormatString = layout.substring(startIndex, endIndex);
	    }

	    formatter.push(getFormatterObject_(currentFormatString));
	  } while (index > -1);

	  compiledLayouts_[layout] = formatter;

	  return formatter;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} formatString
	 *
	 * @return {?string}
	 */
	var getFormatterObject_ = function getFormatterObject_(formatString) {

	  var commandRegex = /%([a-z,A-Z]+)(?=\{|)/;
	  var result = commandRegex.exec(formatString);
	  if (result != null && result.length == 2) {

	    var formatter = getFormatterFunction_(result[1]);
	    if (formatter == null) {
	      return null;
	    }

	    var params = getFormatterParams_(formatString);

	    var after = '';
	    var endIndex = formatString.lastIndexOf('}');
	    if (endIndex != -1) {
	      after = formatString.substring(endIndex + 1);
	    } else {
	      after = formatString.substring(result.index + result[1].length + 1);
	    }

	    return {
	      formatter: formatter,
	      params: params,
	      after: after
	    };
	  }

	  return formatString;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} command
	 *
	 * @return {?string}
	 */
	var getFormatterFunction_ = function getFormatterFunction_(command) {

	  var regex;
	  for (var key in formatters_) {
	    regex = new RegExp('^' + key + '$');
	    if (regex.exec(command) != null) {
	      return formatters_[key];
	    }
	  }

	  return null;
	};

	/**
	 * @private
	 * @function
	 *
	 * @param {string} command
	 *
	 * @return {string}
	 */
	var getFormatterParams_ = function getFormatterParams_(command) {

	  var params = [];
	  var result = command.match(/\{([^\}]*)(?=\})/g);
	  if (result != null) {
	    for (var i = 0; i < result.length; i++) {
	      params.push(result[i].substring(1));
	    }
	  }

	  return params;
	};

	/**
	 * @private
	 * @function
	 *
	 * @param {Array.<function|string>} formatter
	 * @param {LOG_EVENT} logEvent
	 *
	 * @return {string}
	 */
	var formatLogEvent_ = function formatLogEvent_(formatter, logEvent) {
	  var response;
	  var message = [];
	  var count = formatter.length;

	  var _addMessage = function _addMessage(mes) {
	    if (mes instanceof Array) {
	      message = message.concat(mes);
	    } else {
	      message.push(mes);
	    }
	  };

	  for (var i = 0; i < count; i++) {
	    if (formatter[i] !== null) {

	      if (formatter[i] instanceof Object) {

	        response = formatter[i].formatter(logEvent, formatter[i].params);
	        if (response != null) {
	          _addMessage(response);
	        }
	        _addMessage(formatter[i].after);
	      } else {
	        _addMessage(formatter[i]);
	      }
	    }
	  }

	  return message;
	};

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 *
	 * @return {string}
	 */

	function preCompile(layout) {
	  getCompiledLayout_(layout);
	}

	/**
	 * @function
	 * @memberOf formatter
	 *
	 * @param {string} layout
	 * @param {LOG_EVENT} logEvent
	 *
	 * @return {string}
	 */

	function format(layout, logEvent) {
	  return formatLogEvent_(getCompiledLayout_(layout), logEvent);
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mb3JtYXR0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NkJBTzJCLGlCQUFpQjs7dUJBQ25CLFdBQVc7O0lBQXhCLE9BQU87OzZCQUNPLGtCQUFrQjs7SUFBaEMsUUFBUTs7O0FBR3BCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7OztBQVcxQixJQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUM5QyxTQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7Q0FDdkIsQ0FBQzs7Ozs7Ozs7Ozs7QUFXRixJQUFJLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBWSxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFNBQU8sMEJBQVcsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM1QyxDQUFDOzs7Ozs7Ozs7OztBQVdGLElBQUksZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUNqRCxNQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTs7QUFFM0IsUUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUU7QUFDdEMsVUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DLFdBQU0sSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO0FBQ3hCLGVBQU8sSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztPQUNyQztLQUNELE1BQU0sSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFB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QUMsQ0FBQyxDQUFDO09BQzlCO0tBRUQ7R0FDRDs7QUFFQSxTQUFPLE9BQU8sQ0FBQztDQUVoQixDQUFDOzs7Ozs7Ozs7OztBQVVLLFNBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUNsQyxvQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMzQjs7Ozs7Ozs7Ozs7O0FBV00sU0FBUyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUN4QyxTQUFPLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztDQUM3RCIsImZpbGUiOiJmb3JtYXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XG4gKlxuICogQ29weXJpZ2h0IDIwMTYtcHJlc2VudCBSb2JpbiBTY2h1bHR6IDxodHRwOi8vY3VuYWUuY29tPlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgZGF0ZUZvcm1hdCB9IGZyb20gJy4vZGF0ZUZvcm1hdHRlcic7XG5pbXBvcnQgKiBhcyB1dGlsaXR5IGZyb20gJy4vdXRpbGl0eSc7XG5pbXBvcnQgKiBhcyBsb2dMZXZlbCBmcm9tICcuL2NvbnN0L2xvZ0xldmVsJztcblxuLyoqIEB0eXBlIHtPYmplY3R9ICovXG52YXIgY29tcGlsZWRMYXlvdXRzXyA9IHt9O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TG9nZ2VyXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0cmV0dXJuIGxvZ0V2ZW50LmxvZ2dlcjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXREYXRlXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0cmV0dXJuIGRhdGVGb3JtYXQobG9nRXZlbnQuZGF0ZSwgcGFyYW1zWzBdKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRFeGNlcHRpb25fID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHR2YXIgbWVzc2FnZSA9ICcnO1xuXHRpZiAobG9nRXZlbnQuZXJyb3IgIT0gbnVsbCkge1xuXG5cdFx0aWYgKGxvZ0V2ZW50LmVycm9yLnN0YWNrICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFyIHN0YWNrcyA9IGxvZ0V2ZW50LmVycm9yLnN0YWNrLnNwbGl0KC9cXG4vZyk7XG5cdFx0XHRmb3IgKCB2YXIga2V5IGluIHN0YWNrcykge1xuXHRcdFx0XHRtZXNzYWdlICs9ICdcXHQnICsgc3RhY2tzW2tleV0gKyAnXFxuJztcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmVycm9yLm1lc3NhZ2UgIT0gbnVsbCAmJiBsb2dFdmVudC5lcnJvci5tZXNzYWdlICE9ICcnKSB7XG5cdFx0XHRtZXNzYWdlICs9ICdcXHQnO1xuXHRcdFx0bWVzc2FnZSArPSBsb2dFdmVudC5lcnJvci5uYW1lICsgJzogJyArIGxvZ0V2ZW50LmVycm9yLm1lc3NhZ2U7XG5cdFx0XHRtZXNzYWdlICs9ICdcXG4nO1xuXHRcdH1cblxuXHR9XG5cdHJldHVybiBtZXNzYWdlO1xufTtcblxuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TWFwTWVzc2FnZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHZhciBtZXNzYWdlID0gbnVsbDtcblx0aWYgKGxvZ0V2ZW50LnByb3BlcnRpZXMpIHtcblxuXHRcdG1lc3NhZ2UgPSBbXTtcblx0XHRmb3IgKCB2YXIga2V5IGluIGxvZ0V2ZW50LnByb3BlcnRpZXMpIHtcblx0XHRcdGlmIChwYXJhbXNbMF0pIHtcblx0XHRcdFx0aWYgKHBhcmFtc1swXSA9PSBrZXkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnB1c2gobG9nRXZlbnQucHJvcGVydGllc1trZXldKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bWVzc2FnZS5wdXNoKCd7JyArIGtleSArICcsJyArIGxvZ0V2ZW50LnByb3BlcnRpZXNba2V5XSArICd9Jyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuICd7JyArIG1lc3NhZ2Uuam9pbignLCcpICsgJ30nO1xuXG5cdH1cblx0cmV0dXJuIG1lc3NhZ2U7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TG9nTWVzc2FnZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHJldHVybiBsb2dFdmVudC5tZXNzYWdlO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdE1ldGhvZE5hbWVfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRyZXR1cm4gdXRpbGl0eS5nZXRGdW5jdGlvbk5hbWUobG9nRXZlbnQubWV0aG9kKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRMaW5lU2VwYXJhdG9yXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0cmV0dXJuICdcXG4nO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdExldmVsXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0aWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLkZBVEFMKSB7XG5cdFx0cmV0dXJuICdGQVRBTCc7XG5cdH0gZWxzZSBpZiAobG9nRXZlbnQubGV2ZWwgPT0gbG9nTGV2ZWwuRVJST1IpIHtcblx0XHRyZXR1cm4gJ0VSUk9SJztcblx0fSBlbHNlIGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5XQVJOKSB7XG5cdFx0cmV0dXJuICdXQVJOJztcblx0fSBlbHNlIGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5JTkZPKSB7XG5cdFx0cmV0dXJuICdJTkZPJztcblx0fSBlbHNlIGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5ERUJVRykge1xuXHRcdHJldHVybiAnREVCVUcnO1xuXHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLlRSQUNFKSB7XG5cdFx0cmV0dXJuICdUUkFDRSc7XG5cdH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRSZWxhdGl2ZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHJldHVybiAnJyArIGxvZ0V2ZW50LnJlbGF0aXZlO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdFNlcXVlbmNlTnVtYmVyXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0cmV0dXJuICcnICsgbG9nRXZlbnQuc2VxdWVuY2U7XG59O1xuXG52YXIgZm9ybWF0dGVyc18gPSB7XG5cdCdjfGxvZ2dlcicgOiBmb3JtYXRMb2dnZXJfLFxuXHQnZHxkYXRlJyA6IGZvcm1hdERhdGVfLFxuXHQnZXh8ZXhjZXB0aW9ufHRocm93YWJsZScgOiBmb3JtYXRFeGNlcHRpb25fLFxuXHQnS3xtYXB8TUFQJyA6IGZvcm1hdE1hcE1lc3NhZ2VfLFxuXHQnbXxtc2d8bWVzc2FnZScgOiBmb3JtYXRMb2dNZXNzYWdlXyxcblx0J018bWV0aG9kJyA6IGZvcm1hdE1ldGhvZE5hbWVfLFxuXHQnbicgOiBmb3JtYXRMaW5lU2VwYXJhdG9yXyxcblx0J3B8bGV2ZWwnIDogZm9ybWF0TGV2ZWxfLFxuXHQncnxyZWxhdGl2ZScgOiBmb3JtYXRSZWxhdGl2ZV8sXG5cdCdzbnxzZXF1ZW5jZU51bWJlcicgOiBmb3JtYXRTZXF1ZW5jZU51bWJlcl9cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxheW91dFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGdldENvbXBpbGVkTGF5b3V0XyA9IGZ1bmN0aW9uKGxheW91dCkge1xuXG5cdGlmIChjb21waWxlZExheW91dHNfW2xheW91dF0gIT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVkTGF5b3V0c19bbGF5b3V0XTtcblx0fVxuXG5cdHJldHVybiBjb21waWxlTGF5b3V0XyhsYXlvdXQpO1xuXG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYXlvdXRcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBjb21waWxlTGF5b3V0XyA9IGZ1bmN0aW9uKGxheW91dCkge1xuXG5cdHZhciBpbmRleCA9IGxheW91dC5pbmRleE9mKCclJyk7XG5cdHZhciBjdXJyZW50Rm9ybWF0U3RyaW5nID0gJyc7XG5cdHZhciBmb3JtYXR0ZXIgPSBbXTtcblxuXHRpZiAoaW5kZXggIT0gMCkge1xuXHRcdGZvcm1hdHRlci5wdXNoKGxheW91dC5zdWJzdHJpbmcoMCwgaW5kZXgpKTtcblx0fVxuXG5cdGRvIHtcblxuXHRcdHZhciBzdGFydEluZGV4ID0gaW5kZXg7XG5cdFx0dmFyIGVuZEluZGV4ID0gaW5kZXggPSBsYXlvdXQuaW5kZXhPZignJScsIGluZGV4ICsgMSk7XG5cblx0XHRpZiAoZW5kSW5kZXggPCAwKSB7XG5cdFx0XHRjdXJyZW50Rm9ybWF0U3RyaW5nID0gbGF5b3V0LnN1YnN0cmluZyhzdGFydEluZGV4KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y3VycmVudEZvcm1hdFN0cmluZyA9IGxheW91dC5zdWJzdHJpbmcoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xuXHRcdH1cblxuXHRcdGZvcm1hdHRlci5wdXNoKGdldEZvcm1hdHRlck9iamVjdF8oY3VycmVudEZvcm1hdFN0cmluZykpO1xuXG5cdH0gd2hpbGUgKGluZGV4ID4gLTEpO1xuXG5cdGNvbXBpbGVkTGF5b3V0c19bbGF5b3V0XSA9IGZvcm1hdHRlcjtcblxuXHRyZXR1cm4gZm9ybWF0dGVyO1xuXG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmb3JtYXRTdHJpbmdcbiAqXG4gKiBAcmV0dXJuIHs/c3RyaW5nfVxuICovXG52YXIgZ2V0Rm9ybWF0dGVyT2JqZWN0XyA9IGZ1bmN0aW9uKGZvcm1hdFN0cmluZykge1xuXG5cdHZhciBjb21tYW5kUmVnZXggPSAvJShbYS16LEEtWl0rKSg/PVxce3wpLztcblx0dmFyIHJlc3VsdCA9IGNvbW1hbmRSZWdleC5leGVjKGZvcm1hdFN0cmluZyk7XG5cdGlmIChyZXN1bHQgIT0gbnVsbCAmJiByZXN1bHQubGVuZ3RoID09IDIpIHtcblxuXHRcdHZhciBmb3JtYXR0ZXIgPSBnZXRGb3JtYXR0ZXJGdW5jdGlvbl8ocmVzdWx0WzFdKTtcblx0XHRpZiAoZm9ybWF0dGVyID09IG51bGwpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHZhciBwYXJhbXMgPSBnZXRGb3JtYXR0ZXJQYXJhbXNfKGZvcm1hdFN0cmluZyk7XG5cblx0XHR2YXIgYWZ0ZXIgPSAnJztcblx0XHR2YXIgZW5kSW5kZXggPSBmb3JtYXRTdHJpbmcubGFzdEluZGV4T2YoJ30nKTtcblx0XHRpZiAoZW5kSW5kZXggIT0gLTEpIHtcblx0XHRcdGFmdGVyID0gZm9ybWF0U3RyaW5nLnN1YnN0cmluZyhlbmRJbmRleCArIDEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhZnRlciA9IGZvcm1hdFN0cmluZy5zdWJzdHJpbmcocmVzdWx0LmluZGV4ICsgcmVzdWx0WzFdLmxlbmd0aCArIDEpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRmb3JtYXR0ZXIgOiBmb3JtYXR0ZXIsXG5cdFx0XHRwYXJhbXMgOiBwYXJhbXMsXG5cdFx0XHRhZnRlciA6IGFmdGVyXG5cdFx0fTtcblxuXHR9XG5cblx0cmV0dXJuIGZvcm1hdFN0cmluZztcblxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tbWFuZFxuICpcbiAqIEByZXR1cm4gez9zdHJpbmd9XG4gKi9cbnZhciBnZXRGb3JtYXR0ZXJGdW5jdGlvbl8gPSBmdW5jdGlvbihjb21tYW5kKSB7XG5cblx0dmFyIHJlZ2V4O1xuXHRmb3IgKCB2YXIga2V5IGluIGZvcm1hdHRlcnNfKSB7XG5cdFx0cmVnZXggPSBuZXcgUmVnRXhwKCdeJyArIGtleSArICckJyk7XG5cdFx0aWYgKHJlZ2V4LmV4ZWMoY29tbWFuZCkgIT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGZvcm1hdHRlcnNfW2tleV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG5cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZ2V0Rm9ybWF0dGVyUGFyYW1zXyA9IGZ1bmN0aW9uKGNvbW1hbmQpIHtcblxuXHR2YXIgcGFyYW1zID0gW107XG5cdHZhciByZXN1bHQgPSBjb21tYW5kLm1hdGNoKC9cXHsoW15cXH1dKikoPz1cXH0pL2cpO1xuXHRpZiAocmVzdWx0ICE9IG51bGwpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0cGFyYW1zLnB1c2gocmVzdWx0W2ldLnN1YnN0cmluZygxKSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHBhcmFtcztcblxufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtBcnJheS48ZnVuY3Rpb258c3RyaW5nPn0gZm9ybWF0dGVyXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRMb2dFdmVudF8gPSBmdW5jdGlvbihmb3JtYXR0ZXIsIGxvZ0V2ZW50KSB7XG5cdHZhciByZXNwb25zZTtcbiAgdmFyIG1lc3NhZ2UgPSBbXTtcblx0dmFyIGNvdW50ID0gZm9ybWF0dGVyLmxlbmd0aDtcblxuICB2YXIgX2FkZE1lc3NhZ2UgPSBmdW5jdGlvbihtZXMpIHtcbiAgICBpZihtZXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UuY29uY2F0KG1lcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UucHVzaChtZXMpO1xuICAgIH1cbiAgfTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcblx0XHRpZiAoZm9ybWF0dGVyW2ldICE9PSBudWxsKSB7XG5cblx0XHRcdGlmIChmb3JtYXR0ZXJbaV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcblxuXHRcdFx0XHRyZXNwb25zZSA9IGZvcm1hdHRlcltpXS5mb3JtYXR0ZXIobG9nRXZlbnQsIGZvcm1hdHRlcltpXS5wYXJhbXMpO1xuXHRcdFx0XHRpZiAocmVzcG9uc2UgIT0gbnVsbCkge1xuICAgICAgICAgIF9hZGRNZXNzYWdlKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuICAgICAgICBfYWRkTWVzc2FnZShmb3JtYXR0ZXJbaV0uYWZ0ZXIpO1xuXG5cdFx0XHR9IGVsc2Uge1xuICAgICAgICBfYWRkTWVzc2FnZShmb3JtYXR0ZXJbaV0pO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cbiAgcmV0dXJuIG1lc3NhZ2U7XG5cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxheW91dFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZUNvbXBpbGUobGF5b3V0KSB7XG5cdGdldENvbXBpbGVkTGF5b3V0XyhsYXlvdXQpO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYXlvdXRcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChsYXlvdXQsIGxvZ0V2ZW50KSB7XG5cdHJldHVybiBmb3JtYXRMb2dFdmVudF8oZ2V0Q29tcGlsZWRMYXlvdXRfKGxheW91dCksIGxvZ0V2ZW50KTtcbn1cbiJdfQ==


/***/ },
/* 2 */
/***/ function(module, exports) {

	exports.__esModule = true;
	exports.dateFormat = dateFormat;
	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var i18n = {
		dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	};

	var TOKEN = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
	var TIMEZONE = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
	var TIMEZONE_CLIP = /[^-+\dA-Z]/g;

	/**
	 * Pads numbers in the date format
	 *
	 * @param value
	 * @param length
	 *
	 * @returns {?string}
	 */
	function pad(value, length) {
		value = String(value);
		length = length || 2;
		while (value.length < length) {
			value = "0" + value;
		}
		return value;
	}

	function dateFormat(date, mask, utc) {

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date();
		if (isNaN(date)) {
			throw SyntaxError("invalid date");
		}

		mask = String(mask || 'yyyy-mm-dd HH:MM:ss,S');

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var _ = utc ? "getUTC" : "get";
		var d = date[_ + "Date"]();
		var D = date[_ + "Day"]();
		var m = date[_ + "Month"]();
		var y = date[_ + "FullYear"]();
		var H = date[_ + "Hours"]();
		var M = date[_ + "Minutes"]();
		var s = date[_ + "Seconds"]();
		var L = date[_ + "Milliseconds"]();
		var o = utc ? 0 : date.getTimezoneOffset();
		var flags = {
			d: d,
			dd: pad(d),
			ddd: i18n.dayNames[D],
			dddd: i18n.dayNames[D + 7],
			M: m + 1,
			MM: pad(m + 1),
			MMM: i18n.monthNames[m],
			MMMM: i18n.monthNames[m + 12],
			yy: String(y).slice(2),
			yyyy: y,
			h: H % 12 || 12,
			hh: pad(H % 12 || 12),
			H: H,
			HH: pad(H),
			m: M,
			mm: pad(M),
			s: s,
			ss: pad(s),
			S: pad(L, 1),
			t: H < 12 ? "a" : "p",
			tt: H < 12 ? "am" : "pm",
			T: H < 12 ? "A" : "P",
			TT: H < 12 ? "AM" : "PM",
			Z: utc ? "UTC" : (String(date).match(TIMEZONE) || [""]).pop().replace(TIMEZONE_CLIP, ""),
			o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
		};

		return mask.replace(TOKEN, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRlRm9ybWF0dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQU9BLElBQUksSUFBSSxHQUFHO0FBQ1YsU0FBUSxFQUFHLENBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQy9FLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUU7QUFDM0QsV0FBVSxFQUFHLENBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQzNFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUMzRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBRTtDQUNuRSxDQUFDOztBQUVGLElBQU0sS0FBSyxHQUFHLGdFQUFnRSxDQUFDO0FBQy9FLElBQU0sUUFBUSxHQUFHLHNJQUFzSSxDQUFDO0FBQ3hKLElBQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQzs7Ozs7Ozs7OztBQVVwQyxTQUFTLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQzNCLE1BQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsT0FBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLENBQUM7QUFDckIsUUFBTyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRTtBQUM3QixPQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztFQUNwQjtBQUNELFFBQU8sS0FBSyxDQUFDO0NBQ2I7O0FBRU0sU0FBUyxVQUFVLENBQUUsSUFBSSxF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QztFQUM1RCxDQUFDLENBQUM7Q0FFSCIsImZpbGUiOiJkYXRlRm9ybWF0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICovXG5cbmxldCBpMThuID0ge1xuXHRkYXlOYW1lcyA6IFsgXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIiwgXCJTdW5kYXlcIiwgXCJNb25kYXlcIixcblx0XHRcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCIgXSxcblx0bW9udGhOYW1lcyA6IFsgXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIixcblx0XHRcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiLCBcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsXG5cdFx0XCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIiBdXG59O1xuXG5jb25zdCBUT0tFTiA9IC9kezEsNH18bXsxLDR9fHl5KD86eXkpP3woW0hoTXNUdF0pXFwxP3xbTGxvU1pdfFwiW15cIl0qXCJ8J1teJ10qJy9nO1xuY29uc3QgVElNRVpPTkUgPSAvXFxiKD86W1BNQ0VBXVtTRFBdVHwoPzpQYWNpZmljfE1vdW50YWlufENlbnRyYWx8RWFzdGVybnxBdGxhbnRpYykgKD86U3RhbmRhcmR8RGF5bGlnaHR8UHJldmFpbGluZykgVGltZXwoPzpHTVR8VVRDKSg/OlstK11cXGR7NH0pPylcXGIvZztcbmNvbnN0IFRJTUVaT05FX0NMSVAgPSAvW14tK1xcZEEtWl0vZztcblxuLyoqXG4gKiBQYWRzIG51bWJlcnMgaW4gdGhlIGRhdGUgZm9ybWF0XG4gKlxuICogQHBhcmFtIHZhbHVlXG4gKiBAcGFyYW0gbGVuZ3RoXG4gKlxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHBhZCh2YWx1ZSwgbGVuZ3RoKSB7XG5cdHZhbHVlID0gU3RyaW5nKHZhbHVlKTtcblx0bGVuZ3RoID0gbGVuZ3RoIHx8IDI7XG5cdHdoaWxlICh2YWx1ZS5sZW5ndGggPCBsZW5ndGgpIHtcblx0XHR2YWx1ZSA9IFwiMFwiICsgdmFsdWU7XG5cdH1cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUZvcm1hdCAoZGF0ZSwgbWFzaywgdXRjKSB7XG5cblx0Ly8gWW91IGNhbid0IHByb3ZpZGUgdXRjIGlmIHlvdSBza2lwIG90aGVyIGFyZ3MgKHVzZSB0aGUgXCJVVEM6XCIgbWFzayBwcmVmaXgpXG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGUpID09IFwiW29iamVjdCBTdHJpbmddXCIgJiYgIS9cXGQvLnRlc3QoZGF0ZSkpIHtcblx0XHRtYXNrID0gZGF0ZTtcblx0XHRkYXRlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0Ly8gUGFzc2luZyBkYXRlIHRocm91Z2ggRGF0ZSBhcHBsaWVzIERhdGUucGFyc2UsIGlmIG5lY2Vzc2FyeVxuXHRkYXRlID0gZGF0ZSA/IG5ldyBEYXRlKGRhdGUpIDogbmV3IERhdGU7XG5cdGlmIChpc05hTihkYXRlKSkge1xuXHRcdHRocm93IFN5bnRheEVycm9yKFwiaW52YWxpZCBkYXRlXCIpO1xuXHR9XG5cblx0bWFzayA9IFN0cmluZyhtYXNrIHx8ICd5eXl5LW1tLWRkIEhIOk1NOnNzLFMnKTtcblxuXHQvLyBBbGxvdyBzZXR0aW5nIHRoZSB1dGMgYXJndW1lbnQgdmlhIHRoZSBtYXNrXG5cdGlmIChtYXNrLnNsaWNlKDAsIDQpID09IFwiVVRDOlwiKSB7XG5cdFx0bWFzayA9IG1hc2suc2xpY2UoNCk7XG5cdFx0dXRjID0gdHJ1ZTtcblx0fVxuXG5cdGxldCBfID0gdXRjID8gXCJnZXRVVENcIiA6IFwiZ2V0XCI7XG5cdGxldCBkID0gZGF0ZVtfICsgXCJEYXRlXCJdKCk7XG5cdGxldCBEID0gZGF0ZVtfICsgXCJEYXlcIl0oKTtcblx0bGV0IG0gPSBkYXRlW18gKyBcIk1vbnRoXCJdKCk7XG5cdGxldCB5ID0gZGF0ZVtfICsgXCJGdWxsWWVhclwiXSgpO1xuXHRsZXQgSCA9IGRhdGVbXyArIFwiSG91cnNcIl0oKTtcblx0bGV0IE0gPSBkYXRlW18gKyBcIk1pbnV0ZXNcIl0oKTtcblx0bGV0IHMgPSBkYXRlW18gKyBcIlNlY29uZHNcIl0oKTtcblx0bGV0IEwgPSBkYXRlW18gKyBcIk1pbGxpc2Vjb25kc1wiXSgpO1xuXHRsZXQgbyA9IHV0YyA/IDAgOiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cdGxldCBmbGFncyA9IHtcblx0XHRkIDogZCxcblx0XHRkZCA6IHBhZChkKSxcblx0XHRkZGQgOiBpMThuLmRheU5hbWVzW0RdLFxuXHRcdGRkZGQgOiBpMThuLmRheU5hbWVzW0QgKyA3XSxcblx0XHRNIDogbSArIDEsXG5cdFx0TU0gOiBwYWQobSArIDEpLFxuXHRcdE1NTSA6IGkxOG4ubW9udGhOYW1lc1ttXSxcblx0XHRNTU1NIDogaTE4bi5tb250aE5hbWVzW20gKyAxMl0sXG5cdFx0eXkgOiBTdHJpbmcoeSkuc2xpY2UoMiksXG5cdFx0eXl5eSA6IHksXG5cdFx0aCA6IEggJSAxMiB8fCAxMixcblx0XHRoaCA6IHBhZChIICUgMTIgfHwgMTIpLFxuXHRcdEggOiBILFxuXHRcdEhIIDogcGFkKEgpLFxuXHRcdG0gOiBNLFxuXHRcdG1tIDogcGFkKE0pLFxuXHRcdHMgOiBzLFxuXHRcdHNzIDogcGFkKHMpLFxuXHRcdFMgOiBwYWQoTCwgMSksXG5cdFx0dCA6IEggPCAxMiA/IFwiYVwiIDogXCJwXCIsXG5cdFx0dHQgOiBIIDwgMTIgPyBcImFtXCIgOiBcInBtXCIsXG5cdFx0VCA6IEggPCAxMiA/IFwiQVwiIDogXCJQXCIsXG5cdFx0VFQgOiBIIDwgMTIgPyBcIkFNXCIgOiBcIlBNXCIsXG5cdFx0WiA6IHV0YyA/IFwiVVRDXCIgOiAoU3RyaW5nKGRhdGUpLm1hdGNoKFRJTUVaT05FKSB8fCBbIFwiXCIgXSkucG9wKCkucmVwbGFjZShUSU1FWk9ORV9DTElQLCBcIlwiKSxcblx0XHRvIDogKG8gPiAwID8gXCItXCIgOiBcIitcIikgKyBwYWQoTWF0aC5mbG9vcihNYXRoLmFicyhvKSAvIDYwKSAqIDEwMCArIE1hdGguYWJzKG8pICUgNjAsIDQpXG5cdH07XG5cblx0cmV0dXJuIG1hc2sucmVwbGFjZShUT0tFTiwgZnVuY3Rpb24oJDApIHtcblx0XHRyZXR1cm4gJDAgaW4gZmxhZ3MgPyBmbGFnc1skMF0gOiAkMC5zbGljZSgxLCAkMC5sZW5ndGggLSAxKTtcblx0fSk7XG5cbn1cbiJdfQ==


/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.__esModule = true;
	exports.getFunctionName = getFunctionName;

	function getFunctionName(func) {

	    if (typeof func !== 'function') {
	        return 'anonymous';
	    }

	    var functionName = func.toString();
	    functionName = functionName.substring('function '.length);
	    functionName = functionName.substring(0, functionName.indexOf('('));

	    return functionName !== '' ? functionName : 'anonymous';
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLFNBQVMsZUFBZSxDQUFDLElBQUksRUFBRTs7QUFFbEMsUUFBSSxPQUFPLElBQUksS0FBSyxVQUFVLEVBQUU7QUFDNUIsZUFBTyxXQUFXLENBQUM7S0FDdEI7O0FBRUQsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ25DLGdCQUFZLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUQsZ0JBQVksR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXBFLFdBQU8sQUFBQyxZQUFZLEtBQUssRUFBRSxHQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Q0FFN0QiLCJmaWxlIjoidXRpbGl0eS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBnZXRGdW5jdGlvbk5hbWUoZnVuYykge1xuXG4gICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiAnYW5vbnltb3VzJztcbiAgICB9XG5cbiAgICBsZXQgZnVuY3Rpb25OYW1lID0gZnVuYy50b1N0cmluZygpO1xuICAgIGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uTmFtZS5zdWJzdHJpbmcoJ2Z1bmN0aW9uICcubGVuZ3RoKTtcbiAgICBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbk5hbWUuc3Vic3RyaW5nKDAsIGZ1bmN0aW9uTmFtZS5pbmRleE9mKCcoJykpO1xuXG4gICAgcmV0dXJuIChmdW5jdGlvbk5hbWUgIT09ICcnKSA/IGZ1bmN0aW9uTmFtZSA6ICdhbm9ueW1vdXMnO1xuXG59Il19


/***/ },
/* 4 */
/***/ function(module, exports) {

	exports.__esModule = true;
	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var OFF = 0;
	exports.OFF = OFF;
	var FATAL = 100;
	exports.FATAL = FATAL;
	var ERROR = 200;
	exports.ERROR = ERROR;
	var WARN = 300;
	exports.WARN = WARN;
	var INFO = 400;
	exports.INFO = INFO;
	var DEBUG = 500;
	exports.DEBUG = DEBUG;
	var TRACE = 600;
	exports.TRACE = TRACE;
	var ALL = 2147483647;
	exports.ALL = ALL;
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb25zdC9sb2dMZXZlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQU9PLElBQU0sR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFDZCxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7O0FBQ2xCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQzs7QUFDbEIsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDOztBQUNqQixJQUFNLElBQUksR0FBRyxHQUFHLENBQUM7O0FBQ2pCLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQzs7QUFDbEIsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDOztBQUNsQixJQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoibG9nTGV2ZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XG4gKlxuICogQ29weXJpZ2h0IDIwMTYtcHJlc2VudCBSb2JpbiBTY2h1bHR6IDxodHRwOi8vY3VuYWUuY29tPlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKi9cblxuZXhwb3J0IGNvbnN0IE9GRiA9IDA7XG5leHBvcnQgY29uc3QgRkFUQUwgPSAxMDA7XG5leHBvcnQgY29uc3QgRVJST1IgPSAyMDA7XG5leHBvcnQgY29uc3QgV0FSTiA9IDMwMDtcbmV4cG9ydCBjb25zdCBJTkZPID0gNDAwO1xuZXhwb3J0IGNvbnN0IERFQlVHID0gNTAwO1xuZXhwb3J0IGNvbnN0IFRSQUNFID0gNjAwO1xuZXhwb3J0IGNvbnN0IEFMTCA9IDIxNDc0ODM2NDc7XG4iXX0=


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.Logger = Logger;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _utility = __webpack_require__(3);

	var utility = _interopRequireWildcard(_utility);

	var _constLogLevel = __webpack_require__(4);

	var logLevel = _interopRequireWildcard(_constLogLevel);

	function Logger(context, appenderObj) {

		/** @typeof {number} */
		var relative_ = new Date().getTime();
		/** @typeof {number} */
		var logSequence_ = 1;

		// Get the context
		if (typeof context != 'string') {

			if (typeof context == 'function') {
				context = utility.getFunctionName(context);
			} else if (typeof context == 'object') {
				context = utility.getFunctionName(context.constructor);
				if (context == 'Object') {
					context = 'anonymous';
				}
			} else {
				context = 'anonymous';
			}
		}

		/** @type {string} */
		var logContext_ = context;

		/**
	  * Logs an error event
	  */
		this.error = function () {
			appenderObj.append(constructLogEvent_(logLevel.ERROR, arguments));
		};

		/**
	  * Logs a warning
	  */
		this.warn = function () {
			appenderObj.append(constructLogEvent_(logLevel.WARN, arguments));
		};

		/**
	  * Logs an info level event
	  */
		this.info = function () {
			appenderObj.append(constructLogEvent_(logLevel.INFO, arguments));
		};

		/**
	  * Logs a debug event
	  */
		this.debug = function () {
			appenderObj.append(constructLogEvent_(logLevel.DEBUG, arguments));
		};

		/**
	  * Logs a trace event
	  */
		this.trace = function () {
			appenderObj.append(constructLogEvent_(logLevel.TRACE, arguments));
		};

		/**
	  * @function
	  *
	  * @param {number} level
	  * @param {Array} args
	  *
	  * @return {LOG_EVENT}
	  */
		function constructLogEvent_(level, args) {

			var logTime = new Date();
			var error = null;

			// this looks horrible, but this is the only way to catch the stack for IE to later parse the stack
			try {
				throw new Error();
			} catch (e) {
				error = e;
			}

			var loggingEvent = {
				date: logTime,
				error: null,
				logErrorStack: error,
				file: null,
				level: level,
				lineNumber: null,
				logger: logContext_,
				message: [],
				method: '',
				properties: undefined,
				relative: logTime.getTime() - relative_,
				sequence: logSequence_++
			};

			for (var i = 0; i < args.length; i++) {
				if (args[i] instanceof Error) {
					loggingEvent.error = args[i];
				} else {
					loggingEvent.message.push(args[i]);
				}
			}
			return loggingEvent;
		}

		return this;
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sb2dnZXIvbG9nZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7dUJBT3lCLFlBQVk7O0lBQXpCLE9BQU87OzZCQUNPLG1CQUFtQjs7SUFBakMsUUFBUTs7QUFFYixTQUFTLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFOzs7QUFHNUMsS0FBSSxTQUFTLEdBQUcsQUFBQyxJQUFJLElBQUksRUFBRSxDQUFFLE9BQU8sRUFBRSxDQUFDOztBQUV2QyxLQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7OztBQUdyQixLQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTs7QUFFL0IsTUFBSSxPQUFPLE9BQU8sSUFBSSxVQUFVLEVBQUU7QUFDakMsVUFBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDM0MsTUFBTSxJQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTtBQUN0QyxVQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkQsT0FBSSxPQUFPLElBQUksUUFBUSxFQUFFO0FBQ3hCLFdBQU8sR0FBRyxXQUFXLENBQUM7SUFDdEI7R0FDRCxNQUFNO0FBQ04sVUFBTyxHQUFHLFdBQVcsQ0FBQztHQUN0QjtFQUVEOzs7QUFHRCxLQUFJLFdBQVcsR0FBRyxPQUFPLENBQUM7Ozs7O0FBSzFCLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7Ozs7Ozs7O0FBVUYsVUFBUyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFOztBQUV4QyxNQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3pCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQzs7O0FBR2pCLE1BQUk7QUFDSCxTQUFNLElBQUksS0FBSyxFQUFFLENBQUM7R0FDbEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNYLFFBQUssR0FBRyxDQUFDLENBQUM7R0FDVjs7QUFFRCxNQUFJLFlBQVksR0FBRztBQUNsQixPQUFJLEVBQUcsT0FBTztBQUNkLFFBQUssRUFBRyxJQUFJO0FBQ1osZ0JBQWEsRUFBRyxLQUFLO0FBQ3JCLE9BQUksRUFBRyxJQUFJO0FBQ1gsUUFBSyxFQUFHLEtBQUs7QUFDYixhQUFVLEVBQUcsSUFBSTtBQUNqQixTQUFNLEVBQUcsV0FBVztBQUNqQixVQUFPLEVBQUcsRUFBRTtBQUNaLFNBQU0sRUFBRyxFQUFFO0FBQ2QsYUFBVSxFQUFHLFNBQVM7QUFDdEIsV0FBUSxFQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTO0FBQ3hDLFdBQVEsRUFBRyxZQUFZLEVBQUU7R0FDekIsQ0FBQzs7QUFFRixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsQyxPQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLEVBQUU7QUFDaEMsZ0JBQVksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLE1BQU07QUFDRixnQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkM7R0FFRDtBQUNELFNBQU8sWUFBWSxDQUFDO0VBRXBCOztBQUVELFFBQU8sSUFBSSxDQUFDO0NBRVoiLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHV0aWxpdHkgZnJvbSAnLi4vdXRpbGl0eSc7XG5pbXBvcnQgKiBhcyBsb2dMZXZlbCBmcm9tICcuLi9jb25zdC9sb2dMZXZlbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBMb2dnZXIoY29udGV4dCwgYXBwZW5kZXJPYmopIHtcblxuXHQvKiogQHR5cGVvZiB7bnVtYmVyfSAqL1xuXHRsZXQgcmVsYXRpdmVfID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblx0LyoqIEB0eXBlb2Yge251bWJlcn0gKi9cblx0bGV0IGxvZ1NlcXVlbmNlXyA9IDE7XG5cblx0Ly8gR2V0IHRoZSBjb250ZXh0XG5cdGlmICh0eXBlb2YgY29udGV4dCAhPSAnc3RyaW5nJykge1xuXG5cdFx0aWYgKHR5cGVvZiBjb250ZXh0ID09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNvbnRleHQgPSB1dGlsaXR5LmdldEZ1bmN0aW9uTmFtZShjb250ZXh0KTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG5cdFx0XHRjb250ZXh0ID0gdXRpbGl0eS5nZXRGdW5jdGlvbk5hbWUoY29udGV4dC5jb25zdHJ1Y3Rvcik7XG5cdFx0XHRpZiAoY29udGV4dCA9PSAnT2JqZWN0Jykge1xuXHRcdFx0XHRjb250ZXh0ID0gJ2Fub255bW91cyc7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRleHQgPSAnYW5vbnltb3VzJztcblx0XHR9XG5cblx0fVxuXG5cdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRsZXQgbG9nQ29udGV4dF8gPSBjb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGFuIGVycm9yIGV2ZW50XG5cdCAqL1xuXHR0aGlzLmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwZW5kZXJPYmouYXBwZW5kKGNvbnN0cnVjdExvZ0V2ZW50Xyhsb2dMZXZlbC5FUlJPUiwgYXJndW1lbnRzKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIExvZ3MgYSB3YXJuaW5nXG5cdCAqL1xuXHR0aGlzLndhcm4gPSBmdW5jdGlvbigpIHtcblx0XHRhcHBlbmRlck9iai5hcHBlbmQoY29uc3RydWN0TG9nRXZlbnRfKGxvZ0xldmVsLldBUk4sIGFyZ3VtZW50cykpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGFuIGluZm8gbGV2ZWwgZXZlbnRcblx0ICovXG5cdHRoaXMuaW5mbyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcGVuZGVyT2JqLmFwcGVuZChjb25zdHJ1Y3RMb2dFdmVudF8obG9nTGV2ZWwuSU5GTywgYXJndW1lbnRzKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIExvZ3MgYSBkZWJ1ZyBldmVudFxuXHQgKi9cblx0dGhpcy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcGVuZGVyT2JqLmFwcGVuZChjb25zdHJ1Y3RMb2dFdmVudF8obG9nTGV2ZWwuREVCVUcsIGFyZ3VtZW50cykpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGEgdHJhY2UgZXZlbnRcblx0ICovXG5cdHRoaXMudHJhY2UgPSBmdW5jdGlvbigpIHtcblx0XHRhcHBlbmRlck9iai5hcHBlbmQoY29uc3RydWN0TG9nRXZlbnRfKGxvZ0xldmVsLlRSQUNFLCBhcmd1bWVudHMpKTtcblx0fTtcblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXG5cdCAqXG5cdCAqIEByZXR1cm4ge0xPR19FVkVOVH1cblx0ICovXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdExvZ0V2ZW50XyhsZXZlbCwgYXJncykge1xuXG5cdFx0bGV0IGxvZ1RpbWUgPSBuZXcgRGF0ZSgpO1xuXHRcdGxldCBlcnJvciA9IG51bGw7XG5cblx0XHQvLyB0aGlzIGxvb2tzIGhvcnJpYmxlLCBidXQgdGhpcyBpcyB0aGUgb25seSB3YXkgdG8gY2F0Y2ggdGhlIHN0YWNrIGZvciBJRSB0byBsYXRlciBwYXJzZSB0aGUgc3RhY2tcblx0XHR0cnkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0ZXJyb3IgPSBlO1xuXHRcdH1cblxuXHRcdGxldCBsb2dnaW5nRXZlbnQgPSB7XG5cdFx0XHRkYXRlIDogbG9nVGltZSxcblx0XHRcdGVycm9yIDogbnVsbCxcblx0XHRcdGxvZ0Vycm9yU3RhY2sgOiBlcnJvcixcblx0XHRcdGZpbGUgOiBudWxsLFxuXHRcdFx0bGV2ZWwgOiBsZXZlbCxcblx0XHRcdGxpbmVOdW1iZXIgOiBudWxsLFxuXHRcdFx0bG9nZ2VyIDogbG9nQ29udGV4dF8sXG4gICAgICBtZXNzYWdlIDogW10sXG4gICAgICBtZXRob2QgOiAnJyxcblx0XHRcdHByb3BlcnRpZXMgOiB1bmRlZmluZWQsXG5cdFx0XHRyZWxhdGl2ZSA6IGxvZ1RpbWUuZ2V0VGltZSgpIC0gcmVsYXRpdmVfLFxuXHRcdFx0c2VxdWVuY2UgOiBsb2dTZXF1ZW5jZV8rK1xuXHRcdH07XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhcmdzW2ldIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdFx0bG9nZ2luZ0V2ZW50LmVycm9yID0gYXJnc1tpXTtcblx0XHRcdH0gZWxzZSB7XG4gICAgICAgIGxvZ2dpbmdFdmVudC5tZXNzYWdlLnB1c2goYXJnc1tpXSk7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0cmV0dXJuIGxvZ2dpbmdFdmVudDtcblxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG5cbn1cbiJdfQ==


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.ConsoleAppender = ConsoleAppender;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/anigenero/log4js>
	 *
	 * Copyright 2016-present Robin Schultz <http://cunae.com>
	 * Released under the MIT License
	 */

	var _constLogLevel = __webpack_require__(4);

	var LogLevel = _interopRequireWildcard(_constLogLevel);

	var _formatter = __webpack_require__(1);

	var formatter = _interopRequireWildcard(_formatter);

	function ConsoleAppender() {

			/** @type {string} */
			var tagLayout_ = '%m';
			/** @type {number} */
			var logLevel_ = LogLevel.INFO;

			/**
	   * @function
	   *
	   * @param {LOG_EVENT} loggingEvent
	   */
			function append(loggingEvent) {
					if (loggingEvent.level <= logLevel_) {
							appendToConsole_(loggingEvent);
					}
			}

			/**
	   * @private
	   * @function
	   *
	   * @param {LOG_EVENT} loggingEvent
	   */
			function appendToConsole_(loggingEvent) {

					var messages = formatter.format(tagLayout_, loggingEvent);

					try {
							if (loggingEvent.level == LogLevel.ERROR) {
									console.error.apply(console, messages);
							} else if (loggingEvent.level == LogLevel.WARN) {
									console.warn.apply(console, messages);
							} else if (loggingEvent.level == LogLevel.INFO) {
									console.info.apply(console, messages);
							} else if (loggingEvent.level == LogLevel.DEBUG || loggingEvent.level == LogLevel.TRACE) {
									console.log.apply(console, messages);
							}
					} catch (e) {
							if (loggingEvent.level == LogLevel.ERROR) {
									console.error(messages.join(' '));
							} else if (loggingEvent.level == LogLevel.WARN) {
									console.warn(messages.join(' '));
							} else if (loggingEvent.level == LogLevel.INFO) {
									console.info(messages.join(' '));
							} else if (loggingEvent.level == LogLevel.DEBUG || loggingEvent.level == LogLevel.TRACE) {
									console.log(messages.join(' '));
							}
					}
			}

			/**
	   * Gets the name of the logger
	   *
	   * @function
	   *
	   * @return {string}
	   */
			function getName() {
					return 'ConsoleAppender';
			}

			/**
	   * Returns true if the appender is active, else false
	   *
	   * @function
	   *
	   * @param {number} level
	   *
	   * @return {boolean}
	   */
			function isActive(level) {
					return level <= logLevel_;
			}

			/**
	   * @function
	   *
	   * @return {number}
	   */
			function getLogLevel() {
					return logLevel_;
			}

			/**
	   * @function
	   *
	   * @param {number} logLevel
	   */
			function setLogLevel(logLevel) {
					logLevel_ = logLevel;
			}

			/**
	   * @function
	   *
	   * @param {string} tagLayout
	   */
			function setTagLayout(tagLayout) {
					tagLayout_ = tagLayout;
			}

			return {
					append: append,
					getName: getName,
					isActive: isActive,
					getLogLevel: getLogLevel,
					setLogLevel: setLogLevel,
					setTagLayout: setTagLayout
			};
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBlbmRlcnMvY29uc29sZUFwcGVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7NkJBTzBCLG1CQUFtQjs7SUFBakMsUUFBUTs7eUJBQ08sY0FBYzs7SUFBN0IsU0FBUzs7QUFFZCxTQUFTLGVBQWUsR0FBRzs7O0FBR2hDLE1BQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsTUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7Ozs7OztBQU8vQixXQUFTLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDN0IsUUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBRTtBQUNwQyxzQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUMvQjtHQUNEOzs7Ozs7OztBQVFELFdBQVMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFOztBQUVyQyxRQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFMUQsUUFBSTtBQUNGLFVBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3hDLGVBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztPQUN4QyxNQUFNLElBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQzlDLGVBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztPQUN2QyxNQUFNLElBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQzlDLGVBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztPQUN2QyxNQUFNLElBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxJQUM3QyxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDdEMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ3RDO0tBQ0YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFVBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3hDLGVBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQ25DLE1BQU0sSUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDOUMsZUFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDbEMsTUFBTSxJQUFJLFlBQVksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtBQUM5QyxlQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztPQUNsQyxNQUFNLElBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxJQUM3QyxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDdEMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDakM7S0FDRjtHQUNIOzs7Ozs7Ozs7QUFTRCxXQUFTLE9BQU8sR0FBRztBQUNsQixXQUFPLGlCQUFpQixDQUFDO0dBQ3pCOzs7Ozs7Ozs7OztBQVdELFdBQVMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUN4QixXQUFRLEtBQUssSUFBSSxTQUFTLENBQUU7R0FDNUI7Ozs7Ozs7QUFPRCxXQUFTLFdBQVcsR0FBRztBQUN0QixXQUFPLFNBQVMsQ0FBQztHQUNqQjs7Ozs7OztBQU9ELFdBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRTtBQUM5QixhQUFTLEdBQUcsUUFBUSxDQUFDO0dBQ3JCOzs7Ozs7O0FBT0QsV0FBUyxZQUFZLENBQUMsU0FBUyxFQUFFO0FBQ2hDLGNBQVUsR0FBRyxTQUFTLENBQUM7R0FDdkI7O0FBRUQsU0FBTztBQUNOLFVBQU0sRUFBRyxNQUFNO0FBQ2YsV0FBTyxFQUFHLE9BQU87QUFDakIsWUFBUSxFQUFHLFFBQVE7QUFDbkIsZUFBVyxFQUFHLFdBQVc7QUFDekIsZUFBVyxFQUFHLFdBQVc7QUFDekIsZ0JBQVksRUFBRyxZQUFZO0dBQzNCLENBQUM7Q0FFRiIsImZpbGUiOiJjb25zb2xlQXBwZW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XG4gKlxuICogQ29weXJpZ2h0IDIwMTYtcHJlc2VudCBSb2JpbiBTY2h1bHR6IDxodHRwOi8vY3VuYWUuY29tPlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgTG9nTGV2ZWwgZnJvbSAnLi4vY29uc3QvbG9nTGV2ZWwnO1xuaW1wb3J0ICogYXMgZm9ybWF0dGVyIGZyb20gJy4uL2Zvcm1hdHRlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb25zb2xlQXBwZW5kZXIoKSB7XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIGxldCB0YWdMYXlvdXRfID0gJyVtJztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIGxldCBsb2dMZXZlbF8gPSBMb2dMZXZlbC5JTkZPO1xuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ2dpbmdFdmVudFxuXHQgKi9cblx0ZnVuY3Rpb24gYXBwZW5kKGxvZ2dpbmdFdmVudCkge1xuXHRcdGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPD0gbG9nTGV2ZWxfKSB7XG5cdFx0XHRhcHBlbmRUb0NvbnNvbGVfKGxvZ2dpbmdFdmVudCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nZ2luZ0V2ZW50XG5cdCAqL1xuXHRmdW5jdGlvbiBhcHBlbmRUb0NvbnNvbGVfKGxvZ2dpbmdFdmVudCkge1xuXG4gICAgbGV0IG1lc3NhZ2VzID0gZm9ybWF0dGVyLmZvcm1hdCh0YWdMYXlvdXRfLCBsb2dnaW5nRXZlbnQpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuRVJST1IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBtZXNzYWdlcyk7XG4gICAgICB9IGVsc2UgaWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5XQVJOKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBtZXNzYWdlcyk7XG4gICAgICB9IGVsc2UgaWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5JTkZPKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mby5hcHBseShjb25zb2xlLCBtZXNzYWdlcyk7XG4gICAgICB9IGVsc2UgaWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5ERUJVRyB8fFxuICAgICAgICBsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuVFJBQ0UpIHtcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgbWVzc2FnZXMpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuRVJST1IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlcy5qb2luKCcgJykpO1xuICAgICAgfSBlbHNlIGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuV0FSTikge1xuICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZXMuam9pbignICcpKTtcbiAgICAgIH0gZWxzZSBpZiAobG9nZ2luZ0V2ZW50LmxldmVsID09IExvZ0xldmVsLklORk8pIHtcbiAgICAgICAgY29uc29sZS5pbmZvKG1lc3NhZ2VzLmpvaW4oJyAnKSk7XG4gICAgICB9IGVsc2UgaWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5ERUJVRyB8fFxuICAgICAgICBsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuVFJBQ0UpIHtcbiAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZXMuam9pbignICcpKTtcbiAgICAgIH1cbiAgICB9XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgbG9nZ2VyXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9XG5cdCAqL1xuXHRmdW5jdGlvbiBnZXROYW1lKCkge1xuXHRcdHJldHVybiAnQ29uc29sZUFwcGVuZGVyJztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFwcGVuZGVyIGlzIGFjdGl2ZSwgZWxzZSBmYWxzZVxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXG5cdCAqXG5cdCAqIEByZXR1cm4ge2Jvb2xlYW59XG5cdCAqL1xuXHRmdW5jdGlvbiBpc0FjdGl2ZShsZXZlbCkge1xuXHRcdHJldHVybiAobGV2ZWwgPD0gbG9nTGV2ZWxfKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHJldHVybiB7bnVtYmVyfVxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG5cdFx0cmV0dXJuIGxvZ0xldmVsXztcblx0fVxuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxvZ0xldmVsXG5cdCAqL1xuXHRmdW5jdGlvbiBzZXRMb2dMZXZlbChsb2dMZXZlbCkge1xuXHRcdGxvZ0xldmVsXyA9IGxvZ0xldmVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGFnTGF5b3V0XG5cdCAqL1xuXHRmdW5jdGlvbiBzZXRUYWdMYXlvdXQodGFnTGF5b3V0KSB7XG5cdFx0dGFnTGF5b3V0XyA9IHRhZ0xheW91dDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0YXBwZW5kIDogYXBwZW5kLFxuXHRcdGdldE5hbWUgOiBnZXROYW1lLFxuXHRcdGlzQWN0aXZlIDogaXNBY3RpdmUsXG5cdFx0Z2V0TG9nTGV2ZWwgOiBnZXRMb2dMZXZlbCxcblx0XHRzZXRMb2dMZXZlbCA6IHNldExvZ0xldmVsLFxuXHRcdHNldFRhZ0xheW91dCA6IHNldFRhZ0xheW91dFxuXHR9O1xuXG59XG4iXX0=


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.StorageAppender = StorageAppender;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/mattia85/log4js2>
	 *
	 * Copyright 2016-present Mattia Rosi <http://cunae.com>
	 * Released under the MIT License
	 */

	var _constLogLevel = __webpack_require__(4);

	var LogLevel = _interopRequireWildcard(_constLogLevel);

	var _formatter = __webpack_require__(1);

	var formatter = _interopRequireWildcard(_formatter);

	function StorageAppender() {

	  /** @type {string} */
	  var tagLayout_ = '%m';
	  /** @type {number} */
	  var logLevel_ = LogLevel.INFO;

	  /**
	   * @function
	   *
	   */
	  function init() {
	    sessionStorage.setItem('log4js2', []);
	  }
	  /**
	   * @function
	   *
	   * @param {LOG_EVENT} loggingEvent
	   */

	  function append(loggingEvent) {
	    var message = formatter.format(tagLayout_, loggingEvent);

	    var log4js2 = undefined;
	    try {
	      log4js2 = JSON.parse(sessionStorage.getItem('log4js2')) || [];
	    } catch (e) {
	      log4js2 = [];
	    }

	    log4js2.push(message.join(' '));
	    sessionStorage.setItem('log4js2', JSON.stringify(log4js2));
	  }

	  /**
	   * Gets the name of the logger
	   *
	   * @function
	   *
	   * @return {string}
	   */
	  function getName() {
	    return 'StorageAppender';
	  }

	  /**
	   * Returns true if the appender is active, else false
	   *
	   * @function
	   *
	   * @param {number} level
	   *
	   * @return {boolean}
	   */
	  function isActive(level) {
	    return level <= logLevel_;
	  }

	  /**
	   * @function
	   *
	   * @return {number}
	   */
	  function getLogLevel() {
	    return logLevel_;
	  }

	  /**
	   * @function
	   *
	   * @param {number} logLevel
	   */
	  function setLogLevel(logLevel) {
	    logLevel_ = logLevel;
	  }

	  /**
	   * @function
	   *
	   * @param {string} tagLayout
	   */
	  function setTagLayout(tagLayout) {
	    tagLayout_ = tagLayout;
	  }

	  return {
	    append: append,
	    getName: getName,
	    isActive: isActive,
	    getLogLevel: getLogLevel,
	    setLogLevel: setLogLevel,
	    setTagLayout: setTagLayout,
	    init: init
	  };
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBlbmRlcnMvc3RvcmFnZUFwcGVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7NkJBTzBCLG1CQUFtQjs7SUFBakMsUUFBUTs7eUJBQ08sY0FBYzs7SUFBN0IsU0FBUzs7QUFFZCxTQUFTLGVBQWUsR0FBRzs7O0FBR2hDLE1BQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsTUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7Ozs7O0FBTTlCLFdBQVMsSUFBSSxHQUFHO0FBQ2Qsa0JBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0dBQ3ZDOzs7Ozs7O0FBT0QsV0FBUyxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQzVCLFFBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUV6RCxRQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osUUFBSTtBQUNGLGFBQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDL0QsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQU8sR0FBRyxFQUFFLENBQUM7S0FDZDs7QUFFRCxXQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQyxrQkFBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0dBRTVEOzs7Ozs7Ozs7QUFTRCxXQUFTLE9BQU8sR0FBRztBQUNqQixXQUFPLGlCQUFpQixDQUFDO0dBQzFCOzs7Ozs7Ozs7OztBQVdELFdBQVMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUN2QixXQUFRLEtBQUssSUFBSSxTQUFTLENBQUU7R0FDN0I7Ozs7Ozs7QUFPRCxXQUFTLFdBQVcsR0FBRztBQUNyQixXQUFPLFNBQVMsQ0FBQztHQUNsQjs7Ozs7OztBQU9ELFdBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRTtBQUM3QixhQUFTLEdBQUcsUUFBUSxDQUFDO0dBQ3RCOzs7Ozs7O0FBT0QsV0FBUyxZQUFZLENBQUMsU0FBUyxFQUFFO0FBQy9CLGNBQVUsR0FBRyxTQUFTLENBQUM7R0FDeEI7O0FBRUQsU0FBTztBQUNMLFVBQU0sRUFBRyxNQUFNO0FBQ2YsV0FBTyxFQUFHLE9BQU87QUFDakIsWUFBUSxFQUFHLFFBQVE7QUFDbkIsZUFBVyxFQUFHLFdBQVc7QUFDekIsZUFBVyxFQUFHLFdBQVc7QUFDekIsZ0JBQVksRUFBRyxZQUFZO0FBQzNCLFFBQUksRUFBRyxJQUFJO0dBQ1osQ0FBQztDQUVIIiwiZmlsZSI6InN0b3JhZ2VBcHBlbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbG9nNGpzIDxodHRwczovL2dpdGh1Yi5jb20vbWF0dGlhODUvbG9nNGpzMj5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNi1wcmVzZW50IE1hdHRpYSBSb3NpIDxodHRwOi8vY3VuYWUuY29tPlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgTG9nTGV2ZWwgZnJvbSAnLi4vY29uc3QvbG9nTGV2ZWwnO1xuaW1wb3J0ICogYXMgZm9ybWF0dGVyIGZyb20gJy4uL2Zvcm1hdHRlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBTdG9yYWdlQXBwZW5kZXIoKSB7XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIGxldCB0YWdMYXlvdXRfID0gJyVtJztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIGxldCBsb2dMZXZlbF8gPSBMb2dMZXZlbC5JTkZPO1xuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnbG9nNGpzMicsIFtdKTtcbiAgfVxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dnaW5nRXZlbnRcbiAgICovXG5cbiAgZnVuY3Rpb24gYXBwZW5kKGxvZ2dpbmdFdmVudCkge1xuICAgIGxldCBtZXNzYWdlID0gZm9ybWF0dGVyLmZvcm1hdCh0YWdMYXlvdXRfLCBsb2dnaW5nRXZlbnQpO1xuXG4gICAgbGV0IGxvZzRqczI7XG4gICAgdHJ5IHtcbiAgICAgIGxvZzRqczIgPSBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2xvZzRqczInKSkgfHwgW107XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nNGpzMiA9IFtdO1xuICAgIH1cblxuICAgIGxvZzRqczIucHVzaChtZXNzYWdlLmpvaW4oJyAnKSk7XG4gICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnbG9nNGpzMicsIEpTT04uc3RyaW5naWZ5KGxvZzRqczIpKTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGxvZ2dlclxuICAgKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0TmFtZSgpIHtcbiAgICByZXR1cm4gJ1N0b3JhZ2VBcHBlbmRlcic7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhcHBlbmRlciBpcyBhY3RpdmUsIGVsc2UgZmFsc2VcbiAgICpcbiAgICogQGZ1bmN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNBY3RpdmUobGV2ZWwpIHtcbiAgICByZXR1cm4gKGxldmVsIDw9IGxvZ0xldmVsXyk7XG4gIH1cblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGZ1bmN0aW9uIGdldExvZ0xldmVsKCkge1xuICAgIHJldHVybiBsb2dMZXZlbF87XG4gIH1cblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb2dMZXZlbFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0TG9nTGV2ZWwobG9nTGV2ZWwpIHtcbiAgICBsb2dMZXZlbF8gPSBsb2dMZXZlbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZ0xheW91dFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0VGFnTGF5b3V0KHRhZ0xheW91dCkge1xuICAgIHRhZ0xheW91dF8gPSB0YWdMYXlvdXQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFwcGVuZCA6IGFwcGVuZCxcbiAgICBnZXROYW1lIDogZ2V0TmFtZSxcbiAgICBpc0FjdGl2ZSA6IGlzQWN0aXZlLFxuICAgIGdldExvZ0xldmVsIDogZ2V0TG9nTGV2ZWwsXG4gICAgc2V0TG9nTGV2ZWwgOiBzZXRMb2dMZXZlbCxcbiAgICBzZXRUYWdMYXlvdXQgOiBzZXRUYWdMYXlvdXQsXG4gICAgaW5pdCA6IGluaXRcbiAgfTtcblxufVxuIl19


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	exports.__esModule = true;
	exports.LogglyAppender = LogglyAppender;
	// istanbul ignore next

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	/**
	 * log4js <https://github.com/mattia85/log4js2>
	 *
	 * Copyright 2016-present Mattia Rosi <http://cunae.com>
	 * Released under the MIT License
	 */

	var _constLogLevel = __webpack_require__(4);

	var LogLevel = _interopRequireWildcard(_constLogLevel);

	var _formatter = __webpack_require__(1);

	var formatter = _interopRequireWildcard(_formatter);

	var logglyUrl = undefined;

	function LogglyAppender() {

	  /** @type {string} */
	  var tagLayout_ = '%m';
	  /** @type {number} */
	  var logLevel_ = LogLevel.INFO;

	  /**
	   * @function
	   *
	   */
	  function init(configuration_) {
	    if (configuration_.logglyToken) {
	      logglyUrl = 'http://logs-01.loggly.com/inputs/' + configuration_.logglyToken + '/tag/http/';
	    } else {
	      console.error('Cannot add logglyAppender');
	      return;
	    }
	  }
	  /**
	   * @function
	   *
	   * @param {LOG_EVENT} loggingEvent
	   */

	  function append(loggingEvent) {
	    var messages = formatter.format(tagLayout_, loggingEvent);
	    try {
	      var oReq = new XMLHttpRequest();
	      oReq.open('POST', logglyUrl, true);
	      oReq.send(messages.join(' '));
	    } catch (e) {
	      console.log('This browser does not support XMLHttpRequest.');
	    }
	  }

	  /**
	   * Gets the name of the logger
	   *
	   * @function
	   *
	   * @return {string}
	   */
	  function getName() {
	    return 'LogglyAppender';
	  }

	  /**
	   * Returns true if the appender is active, else false
	   *
	   * @function
	   *
	   * @param {number} level
	   *
	   * @return {boolean}
	   */
	  function isActive(level) {
	    return level <= logLevel_;
	  }

	  /**
	   * @function
	   *
	   * @return {number}
	   */
	  function getLogLevel() {
	    return logLevel_;
	  }

	  /**
	   * @function
	   *
	   * @param {number} logLevel
	   */
	  function setLogLevel(logLevel) {
	    logLevel_ = logLevel;
	  }

	  /**
	   * @function
	   *
	   * @param {string} tagLayout
	   */
	  function setTagLayout(tagLayout) {
	    tagLayout_ = tagLayout;
	  }

	  return {
	    append: append,
	    getName: getName,
	    isActive: isActive,
	    getLogLevel: getLogLevel,
	    setLogLevel: setLogLevel,
	    setTagLayout: setTagLayout,
	    init: init
	  };
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBlbmRlcnMvbG9nZ2x5QXBwZW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs2QkFPMEIsbUJBQW1COztJQUFqQyxRQUFROzt5QkFDTyxjQUFjOztJQUE3QixTQUFTOztBQUNyQixJQUFJLFNBQVMsWUFBQSxDQUFDOztBQUVQLFNBQVMsY0FBYyxHQUFHOzs7QUFHL0IsTUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV0QixNQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDOzs7Ozs7QUFNOUIsV0FBUyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQzVCLFFBQUksY0FBYyxDQUFDLFdBQVcsRUFBRTtBQUM5QixlQUFTLEdBQUcsbUNBQW1DLEdBQUcsY0FBYyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUM7S0FDN0YsTUFBTTtBQUNMLGFBQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMzQyxhQUFPO0tBQ1I7R0FDRjs7Ozs7OztBQU9ELFdBQVMsTUFBTSxDQUFDLFlBQVksRUFBRTtBQUM1QixRQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMxRCxRQUFJO0FBQ0YsVUFBSSxJQUFJLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUNoQyxVQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDL0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLENBQUMsQ0FBQztLQUM5RDtHQUNGOzs7Ozs7Ozs7QUFTRCxXQUFTLE9BQU8sR0FBRztBQUNqQixXQUFPLGdCQUFnQixDQUFDO0dBQ3pCOzs7Ozs7Ozs7OztBQVdELFdBQVMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUN2QixXQUFRLEtBQUssSUFBSSxTQUFTLENBQUU7R0FDN0I7Ozs7Ozs7QUFPRCxXQUFTLFdBQVcsR0FBRztBQUNyQixXQUFPLFNBQVMsQ0FBQztHQUNsQjs7Ozs7OztBQU9ELFdBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRTtBQUM3QixhQUFTLEdBQUcsUUFBUSxDQUFDO0dBQ3RCOzs7Ozs7O0FBT0QsV0FBUyxZQUFZLENBQUMsU0FBUyxFQUFFO0FBQy9CLGNBQVUsR0FBRyxTQUFTLENBQUM7R0FDeEI7O0FBRUQsU0FBTztBQUNMLFVBQU0sRUFBRyxNQUFNO0FBQ2YsV0FBTyxFQUFHLE9BQU87QUFDakIsWUFBUSxFQUFHLFFBQVE7QUFDbkIsZUFBVyxFQUFHLFdBQVc7QUFDekIsZUFBVyxFQUFHLFdBQVc7QUFDekIsZ0JBQVksRUFBRyxZQUFZO0FBQzNCLFFBQUksRUFBRyxJQUFJO0dBQ1osQ0FBQztDQUVIIiwiZmlsZSI6ImxvZ2dseUFwcGVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9tYXR0aWE4NS9sb2c0anMyPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgTWF0dGlhIFJvc2kgPGh0dHA6Ly9jdW5hZS5jb20+XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBMb2dMZXZlbCBmcm9tICcuLi9jb25zdC9sb2dMZXZlbCc7XG5pbXBvcnQgKiBhcyBmb3JtYXR0ZXIgZnJvbSAnLi4vZm9ybWF0dGVyJztcbmxldCBsb2dnbHlVcmw7XG5cbmV4cG9ydCBmdW5jdGlvbiBMb2dnbHlBcHBlbmRlcigpIHtcblxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgbGV0IHRhZ0xheW91dF8gPSAnJW0nO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgbGV0IGxvZ0xldmVsXyA9IExvZ0xldmVsLklORk87XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gaW5pdChjb25maWd1cmF0aW9uXykge1xuICAgIGlmIChjb25maWd1cmF0aW9uXy5sb2dnbHlUb2tlbikge1xuICAgICAgbG9nZ2x5VXJsID0gJ2h0dHA6Ly9sb2dzLTAxLmxvZ2dseS5jb20vaW5wdXRzLycgKyBjb25maWd1cmF0aW9uXy5sb2dnbHlUb2tlbiArICcvdGFnL2h0dHAvJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignQ2Fubm90IGFkZCBsb2dnbHlBcHBlbmRlcicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dnaW5nRXZlbnRcbiAgICovXG5cbiAgZnVuY3Rpb24gYXBwZW5kKGxvZ2dpbmdFdmVudCkge1xuICAgIGxldCBtZXNzYWdlcyA9IGZvcm1hdHRlci5mb3JtYXQodGFnTGF5b3V0XywgbG9nZ2luZ0V2ZW50KTtcbiAgICB0cnkge1xuICAgICAgbGV0IG9SZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIG9SZXEub3BlbignUE9TVCcsIGxvZ2dseVVybCwgdHJ1ZSk7XG4gICAgICBvUmVxLnNlbmQobWVzc2FnZXMuam9pbignICcpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZygnVGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGxvZ2dlclxuICAgKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0TmFtZSgpIHtcbiAgICByZXR1cm4gJ0xvZ2dseUFwcGVuZGVyJztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFwcGVuZGVyIGlzIGFjdGl2ZSwgZWxzZSBmYWxzZVxuICAgKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc0FjdGl2ZShsZXZlbCkge1xuICAgIHJldHVybiAobGV2ZWwgPD0gbG9nTGV2ZWxfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG4gICAgcmV0dXJuIGxvZ0xldmVsXztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvZ0xldmVsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRMb2dMZXZlbChsb2dMZXZlbCkge1xuICAgIGxvZ0xldmVsXyA9IGxvZ0xldmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnTGF5b3V0XG4gICAqL1xuICBmdW5jdGlvbiBzZXRUYWdMYXlvdXQodGFnTGF5b3V0KSB7XG4gICAgdGFnTGF5b3V0XyA9IHRhZ0xheW91dDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYXBwZW5kIDogYXBwZW5kLFxuICAgIGdldE5hbWUgOiBnZXROYW1lLFxuICAgIGlzQWN0aXZlIDogaXNBY3RpdmUsXG4gICAgZ2V0TG9nTGV2ZWwgOiBnZXRMb2dMZXZlbCxcbiAgICBzZXRMb2dMZXZlbCA6IHNldExvZ0xldmVsLFxuICAgIHNldFRhZ0xheW91dCA6IHNldFRhZ0xheW91dCxcbiAgICBpbml0IDogaW5pdFxuICB9O1xuXG59XG4iXX0=


/***/ }
/******/ ])
});
;