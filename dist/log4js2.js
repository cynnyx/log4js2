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

	var _loggerLogger = __webpack_require__(7);

	var _constLogLevel = __webpack_require__(4);

	var LogLevel = _interopRequireWildcard(_constLogLevel);

	var _appendersConsoleAppender = __webpack_require__(8);

	var consoleAppender = _interopRequireWildcard(_appendersConsoleAppender);

	var _appendersStorageAppender = __webpack_require__(9);

	var storageAppender = _interopRequireWildcard(_appendersStorageAppender);

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
	  'storageAppender': storageAppender.StorageAppender
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
	    appenderObj.init();
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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBTzJCLGFBQWE7O0lBQTVCLFNBQVM7OzRCQUNFLGlCQUFpQjs7NkJBQ2Qsa0JBQWtCOztJQUFoQyxRQUFROzt3Q0FFYSw2QkFBNkI7O0lBQWxELGVBQWU7O3dDQUNNLDZCQUE2Qjs7SUFBbEQsZUFBZTs7Ozs7Ozs7QUFRM0IsSUFBSSxRQUFRLENBQUM7Ozs7OztBQU1iLElBQUksYUFBYSxDQUFDOzs7Ozs7OztBQVFsQixJQUFJLFNBQVMsQ0FBQzs7Ozs7QUFLZCxJQUFJLE1BQU0sQ0FBQzs7QUFHWCxJQUFJLGlCQUFpQixHQUFHO0FBQ3JCLG1CQUFpQixFQUFFLGVBQWUsQ0FBQyxlQUFlO0FBQ2xELG1CQUFpQixFQUFFLGVBQWUsQ0FBQyxlQUFlO0NBQ3BELENBQUM7OztBQUdGLElBQU0sY0FBYyxHQUFHO0FBQ3RCLFdBQVMsRUFBRywwQ0FBMEM7QUFDdEQsV0FBUyxFQUFHLENBQUUsaUJBQWlCLENBQUU7QUFDakMsU0FBTyxFQUFHLENBQUU7QUFDWCxZQUFRLEVBQUcsUUFBUSxDQUFDLElBQUk7R0FDeEIsQ0FBRTtBQUNILHdCQUFzQixFQUFHLElBQUk7Q0FDN0IsQ0FBQzs7O0FBR0YsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVwQixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7O0FBRTFCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFdkIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDOztRQUVWLFFBQVEsR0FBUixRQUFROzs7Ozs7Ozs7O0FBU1QsU0FBUyxTQUFTLENBQUMsTUFBTSxFQUFFOztBQUVqQyxNQUFJLFVBQVUsRUFBRTtBQUNmLFVBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLGdEQUFnRCxDQUFDLENBQUM7QUFDekUsV0FBTztHQUNQOztBQUVBLHFCQUFtQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMs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LGFBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUMxQjs7QUFFRCxTQUFPLHlCQUFXLE9BQU8sRUFBRTtBQUMxQixVQUFNLEVBQUUsTUFBTTtHQUNkLENBQUMsQ0FBQztDQUVIOzs7Ozs7OztBQU9NLFNBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUU7O0FBRTdDLGdCQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXpCLE1BQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUN6QixRQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNyQixjQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZDO0dBQ0QsTUFBTTs7QUFFTixTQUFLLElBQUksTUFBTSxJQUFJLFFBQVEsRUFBRTtBQUM1QixVQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDcEMsYUFBSyxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDakMsY0FBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pDLG9CQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1dBQzVDO1NBQ0Q7T0FDRDtLQUNEO0dBRUQ7Q0FFRCIsImZpbGUiOiJsb2dNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2IFJvYmluIFNjaHVsdHogPGh0dHA6Ly9jdW5hZS5jb20+XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBmb3JtYXR0ZXIgZnJvbSAnLi9mb3JtYXR0ZXInO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXIvbG9nZ2VyJztcbmltcG9ydCAqIGFzIExvZ0xldmVsIGZyb20gJy4vY29uc3QvbG9nTGV2ZWwnO1xuXG5pbXBvcnQgKiBhcyBjb25zb2xlQXBwZW5kZXIgZnJvbSAnLi9hcHBlbmRlcnMvY29uc29sZUFwcGVuZGVyJztcbmltcG9ydCAqIGFzIHN0b3JhZ2VBcHBlbmRlciBmcm9tICcuL2FwcGVuZGVycy9zdG9yYWdlQXBwZW5kZXInO1xuXG4vKipcbiAqIEhvbGRzIHRoZSBkZWZpbml0aW9uIGZvciB0aGUgYXBwZW5kZXIgY2xvc3VyZVxuICpcbiAqIEB0eXBlZGVmIHt7IGFwcGVuZCA6IGZ1bmN0aW9uIChudW1iZXIsIExPR19FVkVOVCksIGlzQWN0aXZlIDogZnVuY3Rpb24oKSxcbiAqICAgICAgICAgIHNldExvZ0xldmVsIDogZnVuY3Rpb24obnVtYmVyKSwgc2V0VGFnTGF5b3V0IDogZnVuY3Rpb24oc3RyaW5nKSB9fVxuICovXG52YXIgQVBQRU5ERVI7XG5cbi8qKlxuICogQHR5cGVkZWYge3sgYWxsb3dBcHBlbmRlckluamVjdGlvbiA6IGJvb2xlYW4sIGFwcGVuZGVycyA6IEFycmF5LjxBUFBFTkRFUj4sXG4gKiBcdFx0XHRhcHBsaWNhdGlvbiA6IE9iamVjdCwgbG9nZ2VycyA6IEFycmF5LjxMT0dHRVI+LCB0YWdMYXlvdXQgOiBzdHJpbmcgfX1cbiAqL1xudmFyIENPTkZJR19QQVJBTVM7XG5cbi8qKlxuICogSG9sZHMgdGhlIGRlZmluaXRpb24gZm9yIHRoZSBsb2cgZXZlbnQgb2JqZWN0XG4gKlxuICogQHR5cGVkZWYge3sgZGF0ZSA6IERhdGUsIGVycm9yIDogRXJyb3IsIG1lc3NhZ2UgOiBzdHJpbmcsIHByb3BlcnRpZXMgOiBPYmplY3QsXG4gKiAgICAgICAgICB0aW1lc3RhbXAgOiBzdHJpbmcgfX1cbiAqL1xudmFyIExPR19FVkVOVDtcblxuLyoqXG4gKiBAdHlwZWRlZiB7eyBsb2dMZXZlbCA6IG51bWJlciB9fVxuICovXG52YXIgTE9HR0VSO1xuXG5cbnZhciBBTExPV0VEX0FQUEVOREVSUyA9IHtcbiAgICdjb25zb2xlQXBwZW5kZXInOiBjb25zb2xlQXBwZW5kZXIuQ29uc29sZUFwcGVuZGVyLFxuICAgJ3N0b3JhZ2VBcHBlbmRlcic6IHN0b3JhZ2VBcHBlbmRlci5TdG9yYWdlQXBwZW5kZXJcbn07XG5cbi8qKiBAY29uc3QgKi9cbmNvbnN0IERFRkFVTFRfQ09ORklHID0ge1xuXHR0YWdMYXlvdXQgOiAnJWR7SEg6bW06c3N9IFslbGV2ZWxdICVsb2dnZXIgLSAlbWVzc2FnZScsXG5cdGFwcGVuZGVycyA6IFsgJ2NvbnNvbGVBcHBlbmRlcicgXSxcblx0bG9nZ2VycyA6IFsge1xuXHRcdGxvZ0xldmVsIDogTG9nTGV2ZWwuSU5GT1xuXHR9IF0sXG5cdGFsbG93QXBwZW5kZXJJbmplY3Rpb24gOiB0cnVlXG59O1xuXG4vKiogQHR5cGUge0FycmF5LjxBUFBFTkRFUj59ICovXG52YXIgYXBwZW5kZXJzXyA9IFtdO1xuLyoqIEB0eXBlIHs/Q09ORklHX1BBUkFNU30gKi9cbnZhciBjb25maWd1cmF0aW9uXyA9IG51bGw7XG4vKiogQHR5cGUge2Jvb2xlYW59ICovXG52YXIgZmluYWxpemVkXyA9IGZhbHNlO1xuLyoqIEB0eXBlIHtPYmplY3R9ICovXG52YXIgbG9nZ2Vyc18gPSB7fTtcblxuZXhwb3J0IHtMb2dMZXZlbH07XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgbG9nZ2VyXG4gKlxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtcyB7Q09ORklHX1BBUkFNU30gY29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoY29uZmlnKSB7XG5cblx0aWYgKGZpbmFsaXplZF8pIHtcblx0XHRhcHBlbmQoTG9nTGV2ZWwuRVJST1IsICdDb3VsZCBub3QgY29uZmlndXJlLiBMb2dVdGlsaXR5IGFscmVhZHkgaW4gdXNlJyk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cbiAgY29uZmlndXJlQXBwZW5kZXJzXyhjb25maWcuYXBwZW5kZXJzKTtcblxuICBjb25maWd1cmVMb2dnZXJzXyhjb25maWcubG9nZ2Vycyk7XG5cbiAgY29uZmlndXJlVGFnTGF5b3V0Xyhjb25maWcudGFnTGF5b3V0KTtcblxuICBjb25maWd1cmF0aW9uXyA9IGNvbmZpZztcblxuXG59XG5cbnZhciBjb25maWd1cmVBcHBlbmRlcnNfID0gZnVuY3Rpb24gKGFwcGVuZGVycykge1xuXG5cdGlmIChhcHBlbmRlcnMgaW5zdGFuY2VvZiBBcnJheSkge1xuXHRcdHZhciBjb3VudCA9IGFwcGVuZGVycy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICBhZGRBcHBlbmRlcl8oYXBwZW5kZXJzW2ldKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBjb25maWd1cmVUYWdMYXlvdXRfID0gZnVuY3Rpb24odGFnTGF5b3V0KSB7XG4gIGlmICh0YWdMYXlvdXQpIHtcbiAgICBmb3JtYXR0ZXIucHJlQ29tcGlsZSh0YWdMYXlvdXQpO1xuICAgIGZvciAodmFyIGxvZ0tleSBpbiBsb2dnZXJzXykge1xuICAgICAgaWYgKGxvZ2dlcnNfLmhhc093blByb3BlcnR5KGxvZ0tleSkpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxvZ2dlcnNfW2xvZ0tleV0pIHtcbiAgICAgICAgICBpZiAobG9nZ2Vyc19bbG9nS2V5XS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBsb2dnZXJzX1tsb2dLZXldW2tleV0uc2V0VGFnTGF5b3V0KHRhZ0xheW91dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgY29uZmlndXJlTG9nZ2Vyc18gPSBmdW5jdGlvbiAobG9nZ2Vycykge1xuXG5cdGlmICghKGxvZ2dlcnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGxvZ2dlcnNcIik7XG5cdH1cblxuXHR2YXIgY291bnQgPSBsb2dnZXJzLmxlbmd0aDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG5cblx0XHRpZiAoIWxvZ2dlcnNbaV0udGFnKSB7XG5cdFx0XHRsb2dnZXJzX1snbWFpbiddID0gZ2V0TG9nZ2Vyc18obG9nZ2Vyc1tpXS5sb2dMZXZlbCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlcnNfW2xvZ2dlcnNbaV0udGFnXSA9IGdldExvZ2dlcnNfKGxvZ2dlcnNbaV0ubG9nTGV2ZWwpO1xuXHRcdH1cblxuXHR9XG5cbn07XG5cblxudmFyIGdldExvZ2dlcnNfID0gZnVuY3Rpb24gKGxvZ0xldmVsKSB7XG5cblx0dmFyIGxvZ2dlcjtcblx0dmFyIGxvZ2dlcnMgPSBbXTtcblx0dmFyIGNvdW50ID0gYXBwZW5kZXJzXy5sZW5ndGg7XG5cdHdoaWxlIChjb3VudC0tKSB7XG5cdFx0bG9nZ2VyID0gYXBwZW5kZXJzX1tjb3VudF0oKTtcblx0XHRsb2dnZXIuc2V0TG9nTGV2ZWwobG9nTGV2ZWwpO1xuXHRcdGxvZ2dlcnMucHVzaChsb2dnZXIpO1xuXHR9XG5cblx0cmV0dXJuIGxvZ2dlcnM7XG5cbn07XG5cbnZhciBhZGRBcHBlbmRlcl8gPSBmdW5jdGlvbihhcHBlbmRlcikge1xuICBpZiAoZmluYWxpemVkXyAmJiAhY29uZmlndXJhdGlvbl8uYWxsb3dBcHBlbmRlckluamVjdGlvbikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBhZGQgYXBwZW5kZXIgd2hlbiBjb25maWd1cmF0aW9uIGZpbmFsaXplZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhbGlkYXRlQXBwZW5kZXJfKEFMTE9XRURfQVBQRU5ERVJTW2FwcGVuZGVyXSk7XG4gIGFwcGVuZGVyc18ucHVzaChBTExPV0VEX0FQUEVOREVSU1thcHBlbmRlcl0pO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGFwcGVuZGVyIHRvIHRoZSBhcHBlbmRlciBxdWV1ZS4gSWYgdGhlIHN0YWNrIGlzIGZpbmFsaXplZCwgYW5kXG4gKiB0aGUgYWxsb3dBcHBlbmRlckluamVjdGlvbiBpcyBzZXQgdG8gZmFsc2UsIHRoZW4gdGhlIGV2ZW50IHdpbGwgbm90IGJlXG4gKiBhcHBlbmRlZFxuICpcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbXMge0FQUEVOREVSfSBhcHBlbmRlclxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkQXBwZW5kZXIoYXBwZW5kZXIpIHtcbiAgLy9hZGRpbmcgYXBwZW5kZXJcbiAgYWRkQXBwZW5kZXJfKGFwcGVuZGVyKTtcbiAgY29uZmlndXJlTG9nZ2Vyc18oY29uZmlndXJhdGlvbl8ubG9nZ2Vycyk7XG4gIGNvbmZpZ3VyZVRhZ0xheW91dF8oY29uZmlndXJhdGlvbl8udGFnTGF5b3V0KTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhhdCB0aGUgYXBwZW5kZXJcbiAqXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW1zIHtBUFBFTkRFUn0gYXBwZW5kZXJcbiAqL1xudmFyIHZhbGlkYXRlQXBwZW5kZXJfID0gZnVuY3Rpb24gKGFwcGVuZGVyKSB7XG5cblx0aWYgKGFwcGVuZGVyID09IG51bGwgfHwgdHlwZW9mIGFwcGVuZGVyICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFwcGVuZGVyOiBub3QgYW4gZnVuY3Rpb24nKTtcblx0fVxuXG5cdHZhciBhcHBlbmRlck9iaiA9IGFwcGVuZGVyKCk7XG5cblx0dmFyIGFwcGVuZGVyTWV0aG9kcyA9IFsnYXBwZW5kJywgJ2dldE5hbWUnLCAnaXNBY3RpdmUnLCAnc2V0TG9nTGV2ZWwnLCAnc2V0VGFnTGF5b3V0J107XG5cdGZvciAodmFyIGtleSBpbiBhcHBlbmRlck1ldGhvZHMpIHtcblx0XHRpZiAoYXBwZW5kZXJNZXRob2RzLmhhc093blByb3BlcnR5KGtleSkgJiYgYXBwZW5kZXJPYmpbYXBwZW5kZXJNZXRob2RzW2tleV1dID09IHVuZGVmaW5lZCB8fFxuXHRcdFx0dHlwZW9mIGFwcGVuZGVyT2JqW2FwcGVuZGVyTWV0aG9kc1trZXldXSAhPSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXBwZW5kZXI6IG1pc3NpbmcgbWV0aG9kOiAnICsgYXBwZW5kZXJNZXRob2RzW2tleV0pO1xuXHRcdH1cblx0fVxuXG5cdGlmIChjb25maWd1cmF0aW9uXyBpbnN0YW5jZW9mIE9iamVjdCAmJiBjb25maWd1cmF0aW9uXy50YWdMYXlvdXQpIHtcblx0XHRhcHBlbmRlck9iai5zZXRUYWdMYXlvdXQoY29uZmlndXJhdGlvbl8udGFnTGF5b3V0KTtcblx0fVxuXG4gIGlmKHR5cGVvZiBhcHBlbmRlck9ialsnaW5pdCddID09ICdmdW5jdGlvbicpIHtcbiAgICBhcHBlbmRlck9iai5pbml0KCk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwZW5kcyB0aGUgbG9nIGV2ZW50XG4gKlxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxvZ2dpbmdFdmVudFxuICovXG5mdW5jdGlvbiBhcHBlbmQobG9nZ2luZ0V2ZW50KSB7XG5cblx0Ly8gZmluYWxpemUgdGhlIGNvbmZpZ3VyYXRpb24gdG8gbWFrZSBzdXJlIG5vIG90aGVyIGFwcGVuZGVycyBhcmUgaW5qZWN0ZWQgKGlmIHNldClcblx0ZmluYWxpemVkXyA9IHRydWU7XG5cblx0dmFyIGxvZ2dlcnM7XG5cdGlmIChsb2dnZXJzX1tsb2dnaW5nRXZlbnQubG9nZ2VyXSkge1xuXHRcdGxvZ2dlcnMgPSBsb2dnZXJzX1tsb2dnaW5nRXZlbnQubG9nZ2VyXTtcblx0fSBlbHNlIHtcblx0XHRsb2dnZXJzID0gbG9nZ2Vyc19bJ21haW4nXTtcblx0fVxuXG5cdHZhciBjb3VudCA9IGxvZ2dlcnMubGVuZ3RoO1xuXHR3aGlsZSAoY291bnQtLSkge1xuXHRcdGlmIChsb2dnZXJzW2NvdW50XS5pc0FjdGl2ZShsb2dnaW5nRXZlbnQubGV2ZWwpKSB7XG5cdFx0XHRsb2dnZXJzW2NvdW50XS5hcHBlbmQobG9nZ2luZ0V2ZW50KTtcblx0XHR9XG5cdH1cblxufVxuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxcbiAqL1xudmFyIHZhbGlkYXRlTGV2ZWxfID0gZnVuY3Rpb24gKGxldmVsKSB7XG5cblx0Zm9yICh2YXIga2V5IGluIExvZ0xldmVsKSB7XG5cdFx0aWYgKGxldmVsID09PSBMb2dMZXZlbFtrZXldKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cblx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGxvZyBsZXZlbDogJyArIGxldmVsKTtcblxufTtcblxuLyoqXG4gKiBIYW5kbGVzIGNyZWF0aW5nIHRoZSBsb2dnZXIgYW5kIHJldHVybmluZyBpdFxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHRcbiAqIEByZXR1cm4ge0xvZ2dlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvZ2dlcihjb250ZXh0KSB7XG5cblx0Ly8gd2UgbmVlZCB0byBpbml0aWFsaXplIGlmIHdlIGhhdmVuJ3Rcblx0aWYgKGNvbmZpZ3VyYXRpb25fID09PSBudWxsKSB7XG5cdFx0Y29uZmlndXJlKERFRkFVTFRfQ09ORklHKTtcblx0fVxuXG5cdHJldHVybiBuZXcgTG9nZ2VyKGNvbnRleHQsIHtcblx0XHRhcHBlbmQ6IGFwcGVuZFxuXHR9KTtcblxufVxuXG4vKipcbiAqIFNldHMgdGhlIGxvZyBsZXZlbCBmb3IgYWxsIGxvZ2dlcnMsIG9yIHNwZWNpZmllZCBsb2dnZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBsb2dMZXZlbFxuICogQHBhcmFtIHtzdHJpbmc9fSBsb2dnZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldExvZ0xldmVsKGxvZ0xldmVsLCBsb2dnZXIpIHtcblxuXHR2YWxpZGF0ZUxldmVsXyhsb2dMZXZlbCk7XG5cblx0aWYgKGxvZ2dlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGxvZ2dlcnNfW2xvZ2dlcl0pIHtcblx0XHRcdGxvZ2dlcnNfW2xvZ2dlcl0uc2V0TG9nTGV2ZWwobG9nTGV2ZWwpO1xuXHRcdH1cblx0fSBlbHNlIHtcblxuXHRcdGZvciAodmFyIGxvZ0tleSBpbiBsb2dnZXJzXykge1xuXHRcdFx0aWYgKGxvZ2dlcnNfLmhhc093blByb3BlcnR5KGxvZ0tleSkpIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIGxvZ2dlcnNfW2xvZ0tleV0pIHtcblx0XHRcdFx0XHRpZiAobG9nZ2Vyc19bbG9nS2V5XS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0XHRsb2dnZXJzX1tsb2dLZXldW2tleV0uc2V0TG9nTGV2ZWwobG9nTGV2ZWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cbn1cbiJdfQ==


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
	 *
	 */
	var formatFile_ = function formatFile_(logEvent, params) {
	  if (logEvent.file === null) {
	    getFileDetails_(logEvent);
	  }
	  return logEvent.file;
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
	var formatLineNumber_ = function formatLineNumber_(logEvent, params) {
	  if (logEvent.lineNumber === null) {
	    getFileDetails_(logEvent);
	  }
	  return '' + logEvent.lineNumber;
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
	  'F|file': formatFile_,
	  'K|map|MAP': formatMapMessage_,
	  'L|line': formatLineNumber_,
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

	function getFileDetails_(logEvent) {

	  if (logEvent.logErrorStack !== undefined) {

	    var parts = logEvent.logErrorStack.stack.split(/\n/g);
	    var file = parts[3];
	    file = file.replace(/at (.*\(|)(file|http|https|)(\:|)(\/|)*/, '');
	    file = file.replace(')', '');
	    file = file.replace(typeof location !== 'undefined' ? location.host : '', '').trim();

	    var fileParts = file.split(/\:/g);

	    logEvent.column = fileParts.pop();
	    logEvent.lineNumber = fileParts.pop();

	    if (true) {
	      var path = __webpack_require__(5);
	      var appDir = path.dirname(__webpack_require__.c[0].filename);
	      logEvent.filename = fileParts.join(':').replace(appDir, '').replace(/(\\|\/)/, '');
	    } else {
	      logEvent.filename = fileParts.join(':');
	    }
	  } else {

	    logEvent.column = '?';
	    logEvent.filename = 'anonymous';
	    logEvent.lineNumber = '?';
	  }
	}

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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mb3JtYXR0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NkJBTzJCLGlCQUFpQjs7dUJBQ25CLFdBQVc7O0lBQXhCLE9BQU87OzZCQUNPLGtCQUFrQjs7SUFBaEMsUUFBUTs7O0FBR3BCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7OztBQVcxQixJQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUM5QyxTQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7Q0FDdkIsQ0FBQzs7Ozs7Ozs7Ozs7QUFXRixJQUFJLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBWSxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFNBQU8sMEJBQVcsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM1QyxDQUFDOzs7Ozs7Ozs7OztBQVdGLElBQUksZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUNqRCxNQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTs7QUFFM0IsUUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUU7QUFDdEMsVUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DLFdBQU0sSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO0FBQ3hCLGVBQU8sSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztPQUNyQztLQUNELE1BQU0sSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFB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dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICovXG5cbmltcG9ydCB7IGRhdGVGb3JtYXQgfSBmcm9tICcuL2RhdGVGb3JtYXR0ZXInO1xuaW1wb3J0ICogYXMgdXRpbGl0eSBmcm9tICcuL3V0aWxpdHknO1xuaW1wb3J0ICogYXMgbG9nTGV2ZWwgZnJvbSAnLi9jb25zdC9sb2dMZXZlbCc7XG5cbi8qKiBAdHlwZSB7T2JqZWN0fSAqL1xudmFyIGNvbXBpbGVkTGF5b3V0c18gPSB7fTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdExvZ2dlcl8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHJldHVybiBsb2dFdmVudC5sb2dnZXI7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0RGF0ZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHJldHVybiBkYXRlRm9ybWF0KGxvZ0V2ZW50LmRhdGUsIHBhcmFtc1swXSk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0RXhjZXB0aW9uXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0dmFyIG1lc3NhZ2UgPSAnJztcblx0aWYgKGxvZ0V2ZW50LmVycm9yICE9IG51bGwpIHtcblxuXHRcdGlmIChsb2dFdmVudC5lcnJvci5zdGFjayAhPSB1bmRlZmluZWQpIHtcblx0XHRcdHZhciBzdGFja3MgPSBsb2dFdmVudC5lcnJvci5zdGFjay5zcGxpdCgvXFxuL2cpO1xuXHRcdFx0Zm9yICggdmFyIGtleSBpbiBzdGFja3MpIHtcblx0XHRcdFx0bWVzc2FnZSArPSAnXFx0JyArIHN0YWNrc1trZXldICsgJ1xcbic7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChsb2dFdmVudC5lcnJvci5tZXNzYWdlICE9IG51bGwgJiYgbG9nRXZlbnQuZXJyb3IubWVzc2FnZSAhPSAnJykge1xuXHRcdFx0bWVzc2FnZSArPSAnXFx0Jztcblx0XHRcdG1lc3NhZ2UgKz0gbG9nRXZlbnQuZXJyb3IubmFtZSArICc6ICcgKyBsb2dFdmVudC5lcnJvci5tZXNzYWdlO1xuXHRcdFx0bWVzc2FnZSArPSAnXFxuJztcblx0XHR9XG5cblx0fVxuXHRyZXR1cm4gbWVzc2FnZTtcbn07XG5cbi8qKlxuICpcbiAqL1xudmFyIGZvcm1hdEZpbGVfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRpZiAobG9nRXZlbnQuZmlsZSA9PT0gbnVsbCkge1xuXHRcdGdldEZpbGVEZXRhaWxzXyhsb2dFdmVudCk7XG5cdH1cblx0cmV0dXJuIGxvZ0V2ZW50LmZpbGU7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TGluZU51bWJlcl8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdGlmIChsb2dFdmVudC5saW5lTnVtYmVyID09PSBudWxsKSB7XG5cdFx0Z2V0RmlsZURldGFpbHNfKGxvZ0V2ZW50KTtcblx0fVxuXHRyZXR1cm4gJycgKyBsb2dFdmVudC5saW5lTnVtYmVyO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdE1hcE1lc3NhZ2VfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHR2YXIgbWVzc2FnZSA9IG51bGw7XG5cdGlmIChsb2dFdmVudC5wcm9wZXJ0aWVzKSB7XG5cblx0XHRtZXNzYWdlID0gW107XG5cdFx0Zm9yICggdmFyIGtleSBpbiBsb2dFdmVudC5wcm9wZXJ0aWVzKSB7XG5cdFx0XHRpZiAocGFyYW1zWzBdKSB7XG5cdFx0XHRcdGlmIChwYXJhbXNbMF0gPT0ga2V5KSB7XG5cdFx0XHRcdFx0bWVzc2FnZS5wdXNoKGxvZ0V2ZW50LnByb3BlcnRpZXNba2V5XSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1lc3NhZ2UucHVzaCgneycgKyBrZXkgKyAnLCcgKyBsb2dFdmVudC5wcm9wZXJ0aWVzW2tleV0gKyAnfScpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAneycgKyBtZXNzYWdlLmpvaW4oJywnKSArICd9JztcblxuXHR9XG5cdHJldHVybiBtZXNzYWdlO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdExvZ01lc3NhZ2VfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRyZXR1cm4gbG9nRXZlbnQubWVzc2FnZTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRNZXRob2ROYW1lXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0cmV0dXJuIHV0aWxpdHkuZ2V0RnVuY3Rpb25OYW1lKGxvZ0V2ZW50Lm1ldGhvZCk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TGluZVNlcGFyYXRvcl8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHJldHVybiAnXFxuJztcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRMZXZlbF8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5GQVRBTCkge1xuXHRcdHJldHVybiAnRkFUQUwnO1xuXHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLkVSUk9SKSB7XG5cdFx0cmV0dXJuICdFUlJPUic7XG5cdH0gZWxzZSBpZiAobG9nRXZlbnQubGV2ZWwgPT0gbG9nTGV2ZWwuV0FSTikge1xuXHRcdHJldHVybiAnV0FSTic7XG5cdH0gZWxzZSBpZiAobG9nRXZlbnQubGV2ZWwgPT0gbG9nTGV2ZWwuSU5GTykge1xuXHRcdHJldHVybiAnSU5GTyc7XG5cdH0gZWxzZSBpZiAobG9nRXZlbnQubGV2ZWwgPT0gbG9nTGV2ZWwuREVCVUcpIHtcblx0XHRyZXR1cm4gJ0RFQlVHJztcblx0fSBlbHNlIGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5UUkFDRSkge1xuXHRcdHJldHVybiAnVFJBQ0UnO1xuXHR9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0UmVsYXRpdmVfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRyZXR1cm4gJycgKyBsb2dFdmVudC5yZWxhdGl2ZTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRTZXF1ZW5jZU51bWJlcl8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHJldHVybiAnJyArIGxvZ0V2ZW50LnNlcXVlbmNlO1xufTtcblxudmFyIGZvcm1hdHRlcnNfID0ge1xuXHQnY3xsb2dnZXInIDogZm9ybWF0TG9nZ2VyXyxcblx0J2R8ZGF0ZScgOiBmb3JtYXREYXRlXyxcblx0J2V4fGV4Y2VwdGlvbnx0aHJvd2FibGUnIDogZm9ybWF0RXhjZXB0aW9uXyxcblx0J0Z8ZmlsZScgOiBmb3JtYXRGaWxlXyxcblx0J0t8bWFwfE1BUCcgOiBmb3JtYXRNYXBNZXNzYWdlXyxcblx0J0x8bGluZScgOiBmb3JtYXRMaW5lTnVtYmVyXyxcblx0J218bXNnfG1lc3NhZ2UnIDogZm9ybWF0TG9nTWVzc2FnZV8sXG5cdCdNfG1ldGhvZCcgOiBmb3JtYXRNZXRob2ROYW1lXyxcblx0J24nIDogZm9ybWF0TGluZVNlcGFyYXRvcl8sXG5cdCdwfGxldmVsJyA6IGZvcm1hdExldmVsXyxcblx0J3J8cmVsYXRpdmUnIDogZm9ybWF0UmVsYXRpdmVfLFxuXHQnc258c2VxdWVuY2VOdW1iZXInIDogZm9ybWF0U2VxdWVuY2VOdW1iZXJfXG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYXlvdXRcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBnZXRDb21waWxlZExheW91dF8gPSBmdW5jdGlvbihsYXlvdXQpIHtcblxuXHRpZiAoY29tcGlsZWRMYXlvdXRzX1tsYXlvdXRdICE9IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjb21waWxlZExheW91dHNfW2xheW91dF07XG5cdH1cblxuXHRyZXR1cm4gY29tcGlsZUxheW91dF8obGF5b3V0KTtcblxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbGF5b3V0XG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgY29tcGlsZUxheW91dF8gPSBmdW5jdGlvbihsYXlvdXQpIHtcblxuXHR2YXIgaW5kZXggPSBsYXlvdXQuaW5kZXhPZignJScpO1xuXHR2YXIgY3VycmVudEZvcm1hdFN0cmluZyA9ICcnO1xuXHR2YXIgZm9ybWF0dGVyID0gW107XG5cblx0aWYgKGluZGV4ICE9IDApIHtcblx0XHRmb3JtYXR0ZXIucHVzaChsYXlvdXQuc3Vic3RyaW5nKDAsIGluZGV4KSk7XG5cdH1cblxuXHRkbyB7XG5cblx0XHR2YXIgc3RhcnRJbmRleCA9IGluZGV4O1xuXHRcdHZhciBlbmRJbmRleCA9IGluZGV4ID0gbGF5b3V0LmluZGV4T2YoJyUnLCBpbmRleCArIDEpO1xuXG5cdFx0aWYgKGVuZEluZGV4IDwgMCkge1xuXHRcdFx0Y3VycmVudEZvcm1hdFN0cmluZyA9IGxheW91dC5zdWJzdHJpbmcoc3RhcnRJbmRleCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGN1cnJlbnRGb3JtYXRTdHJpbmcgPSBsYXlvdXQuc3Vic3RyaW5nKHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcblx0XHR9XG5cblx0XHRmb3JtYXR0ZXIucHVzaChnZXRGb3JtYXR0ZXJPYmplY3RfKGN1cnJlbnRGb3JtYXRTdHJpbmcpKTtcblxuXHR9IHdoaWxlIChpbmRleCA+IC0xKTtcblxuXHRjb21waWxlZExheW91dHNfW2xheW91dF0gPSBmb3JtYXR0ZXI7XG5cblx0cmV0dXJuIGZvcm1hdHRlcjtcblxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0U3RyaW5nXG4gKlxuICogQHJldHVybiB7P3N0cmluZ31cbiAqL1xudmFyIGdldEZvcm1hdHRlck9iamVjdF8gPSBmdW5jdGlvbihmb3JtYXRTdHJpbmcpIHtcblxuXHR2YXIgY29tbWFuZFJlZ2V4ID0gLyUoW2EteixBLVpdKykoPz1cXHt8KS87XG5cdHZhciByZXN1bHQgPSBjb21tYW5kUmVnZXguZXhlYyhmb3JtYXRTdHJpbmcpO1xuXHRpZiAocmVzdWx0ICE9IG51bGwgJiYgcmVzdWx0Lmxlbmd0aCA9PSAyKSB7XG5cblx0XHR2YXIgZm9ybWF0dGVyID0gZ2V0Rm9ybWF0dGVyRnVuY3Rpb25fKHJlc3VsdFsxXSk7XG5cdFx0aWYgKGZvcm1hdHRlciA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHR2YXIgcGFyYW1zID0gZ2V0Rm9ybWF0dGVyUGFyYW1zXyhmb3JtYXRTdHJpbmcpO1xuXG5cdFx0dmFyIGFmdGVyID0gJyc7XG5cdFx0dmFyIGVuZEluZGV4ID0gZm9ybWF0U3RyaW5nLmxhc3RJbmRleE9mKCd9Jyk7XG5cdFx0aWYgKGVuZEluZGV4ICE9IC0xKSB7XG5cdFx0XHRhZnRlciA9IGZvcm1hdFN0cmluZy5zdWJzdHJpbmcoZW5kSW5kZXggKyAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWZ0ZXIgPSBmb3JtYXRTdHJpbmcuc3Vic3RyaW5nKHJlc3VsdC5pbmRleCArIHJlc3VsdFsxXS5sZW5ndGggKyAxKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Zm9ybWF0dGVyIDogZm9ybWF0dGVyLFxuXHRcdFx0cGFyYW1zIDogcGFyYW1zLFxuXHRcdFx0YWZ0ZXIgOiBhZnRlclxuXHRcdH07XG5cblx0fVxuXG5cdHJldHVybiBmb3JtYXRTdHJpbmc7XG5cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbW1hbmRcbiAqXG4gKiBAcmV0dXJuIHs/c3RyaW5nfVxuICovXG52YXIgZ2V0Rm9ybWF0dGVyRnVuY3Rpb25fID0gZnVuY3Rpb24oY29tbWFuZCkge1xuXG5cdHZhciByZWdleDtcblx0Zm9yICggdmFyIGtleSBpbiBmb3JtYXR0ZXJzXykge1xuXHRcdHJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyBrZXkgKyAnJCcpO1xuXHRcdGlmIChyZWdleC5leGVjKGNvbW1hbmQpICE9IG51bGwpIHtcblx0XHRcdHJldHVybiBmb3JtYXR0ZXJzX1trZXldO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBudWxsO1xuXG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tbWFuZFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGdldEZvcm1hdHRlclBhcmFtc18gPSBmdW5jdGlvbihjb21tYW5kKSB7XG5cblx0dmFyIHBhcmFtcyA9IFtdO1xuXHR2YXIgcmVzdWx0ID0gY29tbWFuZC5tYXRjaCgvXFx7KFteXFx9XSopKD89XFx9KS9nKTtcblx0aWYgKHJlc3VsdCAhPSBudWxsKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHQubGVuZ3RoOyBpKyspIHtcblx0XHRcdHBhcmFtcy5wdXNoKHJlc3VsdFtpXS5zdWJzdHJpbmcoMSkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBwYXJhbXM7XG5cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7QXJyYXkuPGZ1bmN0aW9ufHN0cmluZz59IGZvcm1hdHRlclxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TG9nRXZlbnRfID0gZnVuY3Rpb24oZm9ybWF0dGVyLCBsb2dFdmVudCkge1xuXHR2YXIgcmVzcG9uc2U7XG4gIHZhciBtZXNzYWdlID0gW107XG5cdHZhciBjb3VudCA9IGZvcm1hdHRlci5sZW5ndGg7XG5cbiAgdmFyIF9hZGRNZXNzYWdlID0gZnVuY3Rpb24obWVzKSB7XG4gICAgaWYobWVzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLmNvbmNhdChtZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlLnB1c2gobWVzKTtcbiAgICB9XG4gIH07XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG5cdFx0aWYgKGZvcm1hdHRlcltpXSAhPT0gbnVsbCkge1xuXG5cdFx0XHRpZiAoZm9ybWF0dGVyW2ldIGluc3RhbmNlb2YgT2JqZWN0KSB7XG5cblx0XHRcdFx0cmVzcG9uc2UgPSBmb3JtYXR0ZXJbaV0uZm9ybWF0dGVyKGxvZ0V2ZW50LCBmb3JtYXR0ZXJbaV0ucGFyYW1zKTtcblx0XHRcdFx0aWYgKHJlc3BvbnNlICE9IG51bGwpIHtcbiAgICAgICAgICBfYWRkTWVzc2FnZShyZXNwb25zZSk7XG5cdFx0XHRcdH1cbiAgICAgICAgX2FkZE1lc3NhZ2UoZm9ybWF0dGVyW2ldLmFmdGVyKTtcblxuXHRcdFx0fSBlbHNlIHtcbiAgICAgICAgX2FkZE1lc3NhZ2UoZm9ybWF0dGVyW2ldKTtcblx0XHRcdH1cblxuXHRcdH1cblx0fVxuXG4gIHJldHVybiBtZXNzYWdlO1xuXG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRGV0YWlsc18obG9nRXZlbnQpIHtcblxuXHRpZiAobG9nRXZlbnQubG9nRXJyb3JTdGFjayAhPT0gdW5kZWZpbmVkKSB7XG5cblx0XHRsZXQgcGFydHMgPSBsb2dFdmVudC5sb2dFcnJvclN0YWNrLnN0YWNrLnNwbGl0KC9cXG4vZyk7XG5cdFx0bGV0IGZpbGUgPSBwYXJ0c1szXTtcblx0XHRmaWxlID0gZmlsZS5yZXBsYWNlKC9hdCAoLipcXCh8KShmaWxlfGh0dHB8aHR0cHN8KShcXDp8KShcXC98KSovLCAnJyk7XG5cdFx0ZmlsZSA9IGZpbGUucmVwbGFjZSgnKScsICcnKTtcblx0XHRmaWxlID0gZmlsZS5yZXBsYWNlKCh0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSA/IGxvY2F0aW9uLmhvc3QgOiAnJywgJycpLnRyaW0oKTtcblxuXHRcdGxldCBmaWxlUGFydHMgPSBmaWxlLnNwbGl0KC9cXDovZyk7XG5cblx0XHRsb2dFdmVudC5jb2x1bW4gPSBmaWxlUGFydHMucG9wKCk7XG5cdFx0bG9nRXZlbnQubGluZU51bWJlciA9IGZpbGVQYXJ0cy5wb3AoKTtcblxuXHRcdGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0bGV0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cdFx0XHRsZXQgYXBwRGlyID0gcGF0aC5kaXJuYW1lKHJlcXVpcmUubWFpbi5maWxlbmFtZSk7XG5cdFx0XHRsb2dFdmVudC5maWxlbmFtZSA9IGZpbGVQYXJ0cy5qb2luKCc6JykucmVwbGFjZShhcHBEaXIsICcnKS5yZXBsYWNlKC8oXFxcXHxcXC8pLywgJycpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dFdmVudC5maWxlbmFtZSA9IGZpbGVQYXJ0cy5qb2luKCc6Jyk7XG5cdFx0fVxuXG5cdH0gZWxzZSB7XG5cblx0XHRsb2dFdmVudC5jb2x1bW4gPSAnPyc7XG5cdFx0bG9nRXZlbnQuZmlsZW5hbWUgPSAnYW5vbnltb3VzJztcblx0XHRsb2dFdmVudC5saW5lTnVtYmVyID0gJz8nO1xuXG5cdH1cblxufVxuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYXlvdXRcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVDb21waWxlKGxheW91dCkge1xuXHRnZXRDb21waWxlZExheW91dF8obGF5b3V0KTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbGF5b3V0XG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQobGF5b3V0LCBsb2dFdmVudCkge1xuXHRyZXR1cm4gZm9ybWF0TG9nRXZlbnRfKGdldENvbXBpbGVkTGF5b3V0XyhsYXlvdXQpLCBsb2dFdmVudCk7XG59XG4iXX0=


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

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	(function () {
	  try {
	    cachedSetTimeout = setTimeout;
	  } catch (e) {
	    cachedSetTimeout = function () {
	      throw new Error('setTimeout is not defined');
	    }
	  }
	  try {
	    cachedClearTimeout = clearTimeout;
	  } catch (e) {
	    cachedClearTimeout = function () {
	      throw new Error('clearTimeout is not defined');
	    }
	  }
	} ())
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = cachedSetTimeout.call(null, cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    cachedClearTimeout.call(null, timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        cachedSetTimeout.call(null, drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 7 */
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
				method: args.callee.caller,
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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sb2dnZXIvbG9nZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7dUJBT3lCLFlBQVk7O0lBQXpCLE9BQU87OzZCQUNPLG1CQUFtQjs7SUFBakMsUUFBUTs7QUFFYixTQUFTLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFOzs7QUFHNUMsS0FBSSxTQUFTLEdBQUcsQUFBQyxJQUFJLElBQUksRUFBRSxDQUFFLE9BQU8sRUFBRSxDQUFDOztBQUV2QyxLQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7OztBQUdyQixLQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTs7QUFFL0IsTUFBSSxPQUFPLE9BQU8sSUFBSSxVQUFVLEVBQUU7QUFDakMsVUFBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDM0MsTUFBTSxJQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTtBQUN0QyxVQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkQsT0FBSSxPQUFPLElBQUksUUFBUSxFQUFFO0FBQ3hCLFdBQU8sR0FBRyxXQUFXLENBQUM7SUFDdEI7R0FDRCxNQUFNO0FBQ04sVUFBTyxHQUFHLFdBQVcsQ0FBQztHQUN0QjtFQUVEOzs7QUFHRCxLQUFJLFdBQVcsR0FBRyxPQUFPLENBQUM7Ozs7O0FBSzFCLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7Ozs7Ozs7O0FBVUYsVUFBUyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFOztBQUV4QyxNQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3pCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQzs7O0FBR2pCLE1BQUk7QUFDSCxTQUFNLElBQUksS0FBSyxFQUFFLENBQUM7R0FDbEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNYLFFBQUssR0FBRyxDQUFDLENBQUM7R0FDVjs7QUFFRCxNQUFJLFlBQVksR0FBRztBQUNsQixPQUFJLEVBQUcsT0FBTztBQUNkLFFBQUssRUFBRyxJQUFJO0FBQ1osZ0JBQWEsRUFBRyxLQUFLO0FBQ3JCLE9BQUksRUFBRyxJQUFJO0FBQ1gsUUFBSyxFQUFHLEtBQUs7QUFDYixhQUFVLEVBQUcsSUFBSTtBQUNqQixTQUFNLEVBQUcsV0FBVztBQUNqQixVQUFPLEVBQUcsRUFBRTtBQUNmLFNBQU0sRUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07QUFDM0IsYUFBVSxFQUFHLFNBQVM7QUFDdEIsV0FBUSxFQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTO0FBQ3hDLFdBQVEsRUFBRyxZQUFZLEVBQUU7R0FDekIsQ0FBQzs7QUFFRixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsQyxPQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLEVBQUU7QUFDaEMsZ0JBQVksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLE1BQU07QUFDRixnQkFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkM7R0FFRDtBQUNELFNBQU8sWUFBWSxDQUFDO0VBRXBCOztBQUVELFFBQU8sSUFBSSxDQUFDO0NBRVoiLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHV0aWxpdHkgZnJvbSAnLi4vdXRpbGl0eSc7XG5pbXBvcnQgKiBhcyBsb2dMZXZlbCBmcm9tICcuLi9jb25zdC9sb2dMZXZlbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBMb2dnZXIoY29udGV4dCwgYXBwZW5kZXJPYmopIHtcblxuXHQvKiogQHR5cGVvZiB7bnVtYmVyfSAqL1xuXHRsZXQgcmVsYXRpdmVfID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblx0LyoqIEB0eXBlb2Yge251bWJlcn0gKi9cblx0bGV0IGxvZ1NlcXVlbmNlXyA9IDE7XG5cblx0Ly8gR2V0IHRoZSBjb250ZXh0XG5cdGlmICh0eXBlb2YgY29udGV4dCAhPSAnc3RyaW5nJykge1xuXG5cdFx0aWYgKHR5cGVvZiBjb250ZXh0ID09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNvbnRleHQgPSB1dGlsaXR5LmdldEZ1bmN0aW9uTmFtZShjb250ZXh0KTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG5cdFx0XHRjb250ZXh0ID0gdXRpbGl0eS5nZXRGdW5jdGlvbk5hbWUoY29udGV4dC5jb25zdHJ1Y3Rvcik7XG5cdFx0XHRpZiAoY29udGV4dCA9PSAnT2JqZWN0Jykge1xuXHRcdFx0XHRjb250ZXh0ID0gJ2Fub255bW91cyc7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRleHQgPSAnYW5vbnltb3VzJztcblx0XHR9XG5cblx0fVxuXG5cdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRsZXQgbG9nQ29udGV4dF8gPSBjb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGFuIGVycm9yIGV2ZW50XG5cdCAqL1xuXHR0aGlzLmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwZW5kZXJPYmouYXBwZW5kKGNvbnN0cnVjdExvZ0V2ZW50Xyhsb2dMZXZlbC5FUlJPUiwgYXJndW1lbnRzKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIExvZ3MgYSB3YXJuaW5nXG5cdCAqL1xuXHR0aGlzLndhcm4gPSBmdW5jdGlvbigpIHtcblx0XHRhcHBlbmRlck9iai5hcHBlbmQoY29uc3RydWN0TG9nRXZlbnRfKGxvZ0xldmVsLldBUk4sIGFyZ3VtZW50cykpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGFuIGluZm8gbGV2ZWwgZXZlbnRcblx0ICovXG5cdHRoaXMuaW5mbyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcGVuZGVyT2JqLmFwcGVuZChjb25zdHJ1Y3RMb2dFdmVudF8obG9nTGV2ZWwuSU5GTywgYXJndW1lbnRzKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIExvZ3MgYSBkZWJ1ZyBldmVudFxuXHQgKi9cblx0dGhpcy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcGVuZGVyT2JqLmFwcGVuZChjb25zdHJ1Y3RMb2dFdmVudF8obG9nTGV2ZWwuREVCVUcsIGFyZ3VtZW50cykpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGEgdHJhY2UgZXZlbnRcblx0ICovXG5cdHRoaXMudHJhY2UgPSBmdW5jdGlvbigpIHtcblx0XHRhcHBlbmRlck9iai5hcHBlbmQoY29uc3RydWN0TG9nRXZlbnRfKGxvZ0xldmVsLlRSQUNFLCBhcmd1bWVudHMpKTtcblx0fTtcblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXG5cdCAqXG5cdCAqIEByZXR1cm4ge0xPR19FVkVOVH1cblx0ICovXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdExvZ0V2ZW50XyhsZXZlbCwgYXJncykge1xuXG5cdFx0bGV0IGxvZ1RpbWUgPSBuZXcgRGF0ZSgpO1xuXHRcdGxldCBlcnJvciA9IG51bGw7XG5cblx0XHQvLyB0aGlzIGxvb2tzIGhvcnJpYmxlLCBidXQgdGhpcyBpcyB0aGUgb25seSB3YXkgdG8gY2F0Y2ggdGhlIHN0YWNrIGZvciBJRSB0byBsYXRlciBwYXJzZSB0aGUgc3RhY2tcblx0XHR0cnkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0ZXJyb3IgPSBlO1xuXHRcdH1cblxuXHRcdGxldCBsb2dnaW5nRXZlbnQgPSB7XG5cdFx0XHRkYXRlIDogbG9nVGltZSxcblx0XHRcdGVycm9yIDogbnVsbCxcblx0XHRcdGxvZ0Vycm9yU3RhY2sgOiBlcnJvcixcblx0XHRcdGZpbGUgOiBudWxsLFxuXHRcdFx0bGV2ZWwgOiBsZXZlbCxcblx0XHRcdGxpbmVOdW1iZXIgOiBudWxsLFxuXHRcdFx0bG9nZ2VyIDogbG9nQ29udGV4dF8sXG4gICAgICBtZXNzYWdlIDogW10sXG5cdFx0XHRtZXRob2QgOiBhcmdzLmNhbGxlZS5jYWxsZXIsXG5cdFx0XHRwcm9wZXJ0aWVzIDogdW5kZWZpbmVkLFxuXHRcdFx0cmVsYXRpdmUgOiBsb2dUaW1lLmdldFRpbWUoKSAtIHJlbGF0aXZlXyxcblx0XHRcdHNlcXVlbmNlIDogbG9nU2VxdWVuY2VfKytcblx0XHR9O1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJnc1tpXSBpbnN0YW5jZW9mIEVycm9yKSB7XG5cdFx0XHRcdGxvZ2dpbmdFdmVudC5lcnJvciA9IGFyZ3NbaV07XG5cdFx0XHR9IGVsc2Uge1xuICAgICAgICBsb2dnaW5nRXZlbnQubWVzc2FnZS5wdXNoKGFyZ3NbaV0pO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHRcdHJldHVybiBsb2dnaW5nRXZlbnQ7XG5cblx0fVxuXG5cdHJldHVybiB0aGlzO1xuXG59XG4iXX0=


/***/ },
/* 8 */
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

			var message = formatter.format(tagLayout_, loggingEvent);

			if (loggingEvent.level == LogLevel.ERROR) {
				console.error.apply(this, message);
			} else if (loggingEvent.level == LogLevel.WARN) {
				console.warn.apply(this, message);
			} else if (loggingEvent.level == LogLevel.INFO) {
				console.info.apply(this, message);
			} else if (loggingEvent.level == LogLevel.DEBUG || loggingEvent.level == LogLevel.TRACE) {
				console.log.apply(this, message);
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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBlbmRlcnMvY29uc29sZUFwcGVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7NkJBTzBCLG1CQUFtQjs7SUFBakMsUUFBUTs7eUJBQ08sY0FBYzs7SUFBN0IsU0FBUzs7QUFFZCxTQUFTLGVBQWUsR0FBRzs7O0FBR2hDLEtBQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsS0FBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7Ozs7OztBQU8vQixVQUFTLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDN0IsTUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBRTtBQUNwQyxtQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUMvQjtFQUNEOzs7Ozs7OztBQVFELFVBQVMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFOztBQUVyQyxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFM0QsTUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDdEMsVUFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3RDLE1BQU0sSUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDNUMsVUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3JDLE1BQU0sSUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDNUMsVUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3JDLE1BQU0sSUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQzlDLFlBQVksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtBQUNuQyxVQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDcEM7RUFFRDs7Ozs7Ozs7O0FBU0QsVUFBUyxPQUFPLEdBQUc7QUFDbEIsU0FBTyxpQkFBaUIsQ0FBQztFQUN6Qjs7Ozs7Ozs7Ozs7QUFXRCxVQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDeEIsU0FBUSxLQUFLLElBQUksU0FBUyxDQUFFO0VBQzVCOzs7Ozs7O0FBT0QsVUFBUyxXQUFXLEdBQUc7QUFDdEIsU0FBTyxTQUFTLENBQUM7RUFDakI7Ozs7Ozs7QUFPRCxVQUFTLFdBQVcsQ0FBQyxRQUFRLEVBQUU7QUFDOUIsV0FBUyxHQUFHLFFBQVEsQ0FBQztFQUNyQjs7Ozs7OztBQU9ELFVBQVMsWUFBWSxDQUFDLFNBQVMsRUFBRTtBQUNoQyxZQUFVLEdBQUcsU0FBUyxDQUFDO0VBQ3ZCOztBQUVELFFBQU87QUFDTixRQUFNLEVBQUcsTUFBTTtBQUNmLFNBQU8sRUFBRyxPQUFPO0FBQ2pCLFVBQVEsRUFBRyxRQUFRO0FBQ25CLGFBQVcsRUFBRyxXQUFXO0FBQ3pCLGFBQVcsRUFBRyxXQUFXO0FBQ3pCLGNBQVksRUFBRyxZQUFZO0VBQzNCLENBQUM7Q0FFRiIsImZpbGUiOiJjb25zb2xlQXBwZW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGxvZzRqcyA8aHR0cHM6Ly9naXRodWIuY29tL2FuaWdlbmVyby9sb2c0anM+XG4gKlxuICogQ29weXJpZ2h0IDIwMTYtcHJlc2VudCBSb2JpbiBTY2h1bHR6IDxodHRwOi8vY3VuYWUuY29tPlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgTG9nTGV2ZWwgZnJvbSAnLi4vY29uc3QvbG9nTGV2ZWwnO1xuaW1wb3J0ICogYXMgZm9ybWF0dGVyIGZyb20gJy4uL2Zvcm1hdHRlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb25zb2xlQXBwZW5kZXIoKSB7XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIGxldCB0YWdMYXlvdXRfID0gJyVtJztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIGxldCBsb2dMZXZlbF8gPSBMb2dMZXZlbC5JTkZPO1xuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ2dpbmdFdmVudFxuXHQgKi9cblx0ZnVuY3Rpb24gYXBwZW5kKGxvZ2dpbmdFdmVudCkge1xuXHRcdGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPD0gbG9nTGV2ZWxfKSB7XG5cdFx0XHRhcHBlbmRUb0NvbnNvbGVfKGxvZ2dpbmdFdmVudCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nZ2luZ0V2ZW50XG5cdCAqL1xuXHRmdW5jdGlvbiBhcHBlbmRUb0NvbnNvbGVfKGxvZ2dpbmdFdmVudCkge1xuXG4gICAgbGV0IG1lc3NhZ2UgPSBmb3JtYXR0ZXIuZm9ybWF0KHRhZ0xheW91dF8sIGxvZ2dpbmdFdmVudCk7XG5cblx0XHRpZiAobG9nZ2luZ0V2ZW50LmxldmVsID09IExvZ0xldmVsLkVSUk9SKSB7XG4gICAgICBjb25zb2xlLmVycm9yLmFwcGx5KHRoaXMsIG1lc3NhZ2UpO1xuXHRcdH0gZWxzZSBpZiAobG9nZ2luZ0V2ZW50LmxldmVsID09IExvZ0xldmVsLldBUk4pIHtcbiAgICAgIGNvbnNvbGUud2Fybi5hcHBseSh0aGlzLCBtZXNzYWdlKTtcblx0XHR9IGVsc2UgaWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5JTkZPKSB7XG4gICAgICBjb25zb2xlLmluZm8uYXBwbHkodGhpcywgbWVzc2FnZSk7XG5cdFx0fSBlbHNlIGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuREVCVUcgfHxcblx0XHRcdGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5UUkFDRSkge1xuICAgICAgY29uc29sZS5sb2cuYXBwbHkodGhpcywgbWVzc2FnZSk7XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgbG9nZ2VyXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9XG5cdCAqL1xuXHRmdW5jdGlvbiBnZXROYW1lKCkge1xuXHRcdHJldHVybiAnQ29uc29sZUFwcGVuZGVyJztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFwcGVuZGVyIGlzIGFjdGl2ZSwgZWxzZSBmYWxzZVxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXG5cdCAqXG5cdCAqIEByZXR1cm4ge2Jvb2xlYW59XG5cdCAqL1xuXHRmdW5jdGlvbiBpc0FjdGl2ZShsZXZlbCkge1xuXHRcdHJldHVybiAobGV2ZWwgPD0gbG9nTGV2ZWxfKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHJldHVybiB7bnVtYmVyfVxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG5cdFx0cmV0dXJuIGxvZ0xldmVsXztcblx0fVxuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxvZ0xldmVsXG5cdCAqL1xuXHRmdW5jdGlvbiBzZXRMb2dMZXZlbChsb2dMZXZlbCkge1xuXHRcdGxvZ0xldmVsXyA9IGxvZ0xldmVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGFnTGF5b3V0XG5cdCAqL1xuXHRmdW5jdGlvbiBzZXRUYWdMYXlvdXQodGFnTGF5b3V0KSB7XG5cdFx0dGFnTGF5b3V0XyA9IHRhZ0xheW91dDtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0YXBwZW5kIDogYXBwZW5kLFxuXHRcdGdldE5hbWUgOiBnZXROYW1lLFxuXHRcdGlzQWN0aXZlIDogaXNBY3RpdmUsXG5cdFx0Z2V0TG9nTGV2ZWwgOiBnZXRMb2dMZXZlbCxcblx0XHRzZXRMb2dMZXZlbCA6IHNldExvZ0xldmVsLFxuXHRcdHNldFRhZ0xheW91dCA6IHNldFRhZ0xheW91dFxuXHR9O1xuXG59XG4iXX0=


/***/ },
/* 9 */
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


/***/ }
/******/ ])
});
;