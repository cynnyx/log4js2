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

		if (config.tagLayout) {
			formatter.preCompile(config.tagLayout);
			for (var logKey in loggers_) {
				if (loggers_.hasOwnProperty(logKey)) {
					for (var key in loggers_[logKey]) {
						if (loggers_[logKey].hasOwnProperty(key)) {
							loggers_[logKey][key].setTagLayout(config.tagLayout);
						}
					}
				}
			}
		}

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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBTzJCLGFBQWE7O0lBQTVCLFNBQVM7OzRCQUNFLGlCQUFpQjs7NkJBQ2Qsa0JBQWtCOztJQUFoQyxRQUFROzt3Q0FFYSw2QkFBNkI7O0lBQWxELGVBQWU7O3dDQUNNLDZCQUE2Qjs7SUFBbEQsZUFBZTs7Ozs7Ozs7QUFRM0IsSUFBSSxRQUFRLENBQUM7Ozs7OztBQU1iLElBQUksYUFBYSxDQUFDOzs7Ozs7OztBQVFsQixJQUFJLFNBQVMsQ0FBQzs7Ozs7QUFLZCxJQUFJLE1BQU0sQ0FBQzs7QUFHWCxJQUFJLGlCQUFpQixHQUFHO0FBQ3JCLGtCQUFpQixFQUFFLGVBQWUsQ0FBQyxlQUFlO0FBQ2xELGtCQUFpQixFQUFFLGVBQWUsQ0FBQyxlQUFlO0NBQ3BELENBQUM7OztBQUdGLElBQU0sY0FBYyxHQUFHO0FBQ3RCLFVBQVMsRUFBRywwQ0FBMEM7QUFDdEQsVUFBUyxFQUFHLENBQUUsaUJBQWlCLENBQUU7QUFDakMsUUFBTyxFQUFHLENBQUU7QUFDWCxVQUFRLEVBQUcsUUFBUSxDQUFDLElBQUk7RUFDeEIsQ0FBRTtBQUNILHVCQUFzQixFQUFHLElBQUk7Q0FDN0IsQ0FBQzs7O0FBR0YsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVwQixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7O0FBRTFCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFdkIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDOztRQUVWLFFBQVEsR0FBUixRQUFROzs7Ozs7Ozs7O0FBU1QsU0FBUyxTQUFTLENBQUMsTUFBTSxFQUFFOztBQUVqQyxLQUFJLFVBQVUsRUFBRTtBQUNmLFFBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLGdEQUFnRCxDQUFDLENBQUM7QUFDekUsU0FBTztFQUNQOztBQUVBLG9CQUFtQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMs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VyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUU7O0FBRTdDLGVBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFekIsS0FBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQ3pCLE1BQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3JCLFdBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDdkM7RUFDRCxNQUFNOztBQUVOLE9BQUssSUFBSSxNQUFNLElBQUksUUFBUSxFQUFFO0FBQzVCLE9BQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNwQyxTQUFLLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNqQyxTQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDekMsY0FBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztNQUM1QztLQUNEO0lBQ0Q7R0FDRDtFQUVEO0NBRUQiLCJmaWxlIjoibG9nTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbG9nNGpzIDxodHRwczovL2dpdGh1Yi5jb20vYW5pZ2VuZXJvL2xvZzRqcz5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBSb2JpbiBTY2h1bHR6IDxodHRwOi8vY3VuYWUuY29tPlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgZm9ybWF0dGVyIGZyb20gJy4vZm9ybWF0dGVyJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJy4vbG9nZ2VyL2xvZ2dlcic7XG5pbXBvcnQgKiBhcyBMb2dMZXZlbCBmcm9tICcuL2NvbnN0L2xvZ0xldmVsJztcblxuaW1wb3J0ICogYXMgY29uc29sZUFwcGVuZGVyIGZyb20gJy4vYXBwZW5kZXJzL2NvbnNvbGVBcHBlbmRlcic7XG5pbXBvcnQgKiBhcyBzdG9yYWdlQXBwZW5kZXIgZnJvbSAnLi9hcHBlbmRlcnMvc3RvcmFnZUFwcGVuZGVyJztcblxuLyoqXG4gKiBIb2xkcyB0aGUgZGVmaW5pdGlvbiBmb3IgdGhlIGFwcGVuZGVyIGNsb3N1cmVcbiAqXG4gKiBAdHlwZWRlZiB7eyBhcHBlbmQgOiBmdW5jdGlvbiAobnVtYmVyLCBMT0dfRVZFTlQpLCBpc0FjdGl2ZSA6IGZ1bmN0aW9uKCksXG4gKiAgICAgICAgICBzZXRMb2dMZXZlbCA6IGZ1bmN0aW9uKG51bWJlciksIHNldFRhZ0xheW91dCA6IGZ1bmN0aW9uKHN0cmluZykgfX1cbiAqL1xudmFyIEFQUEVOREVSO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7IGFsbG93QXBwZW5kZXJJbmplY3Rpb24gOiBib29sZWFuLCBhcHBlbmRlcnMgOiBBcnJheS48QVBQRU5ERVI+LFxuICogXHRcdFx0YXBwbGljYXRpb24gOiBPYmplY3QsIGxvZ2dlcnMgOiBBcnJheS48TE9HR0VSPiwgdGFnTGF5b3V0IDogc3RyaW5nIH19XG4gKi9cbnZhciBDT05GSUdfUEFSQU1TO1xuXG4vKipcbiAqIEhvbGRzIHRoZSBkZWZpbml0aW9uIGZvciB0aGUgbG9nIGV2ZW50IG9iamVjdFxuICpcbiAqIEB0eXBlZGVmIHt7IGRhdGUgOiBEYXRlLCBlcnJvciA6IEVycm9yLCBtZXNzYWdlIDogc3RyaW5nLCBwcm9wZXJ0aWVzIDogT2JqZWN0LFxuICogICAgICAgICAgdGltZXN0YW1wIDogc3RyaW5nIH19XG4gKi9cbnZhciBMT0dfRVZFTlQ7XG5cbi8qKlxuICogQHR5cGVkZWYge3sgbG9nTGV2ZWwgOiBudW1iZXIgfX1cbiAqL1xudmFyIExPR0dFUjtcblxuXG52YXIgQUxMT1dFRF9BUFBFTkRFUlMgPSB7XG4gICAnY29uc29sZUFwcGVuZGVyJzogY29uc29sZUFwcGVuZGVyLkNvbnNvbGVBcHBlbmRlcixcbiAgICdzdG9yYWdlQXBwZW5kZXInOiBzdG9yYWdlQXBwZW5kZXIuU3RvcmFnZUFwcGVuZGVyXG59O1xuXG4vKiogQGNvbnN0ICovXG5jb25zdCBERUZBVUxUX0NPTkZJRyA9IHtcblx0dGFnTGF5b3V0IDogJyVke0hIOm1tOnNzfSBbJWxldmVsXSAlbG9nZ2VyIC0gJW1lc3NhZ2UnLFxuXHRhcHBlbmRlcnMgOiBbICdjb25zb2xlQXBwZW5kZXInIF0sXG5cdGxvZ2dlcnMgOiBbIHtcblx0XHRsb2dMZXZlbCA6IExvZ0xldmVsLklORk9cblx0fSBdLFxuXHRhbGxvd0FwcGVuZGVySW5qZWN0aW9uIDogdHJ1ZVxufTtcblxuLyoqIEB0eXBlIHtBcnJheS48QVBQRU5ERVI+fSAqL1xudmFyIGFwcGVuZGVyc18gPSBbXTtcbi8qKiBAdHlwZSB7P0NPTkZJR19QQVJBTVN9ICovXG52YXIgY29uZmlndXJhdGlvbl8gPSBudWxsO1xuLyoqIEB0eXBlIHtib29sZWFufSAqL1xudmFyIGZpbmFsaXplZF8gPSBmYWxzZTtcbi8qKiBAdHlwZSB7T2JqZWN0fSAqL1xudmFyIGxvZ2dlcnNfID0ge307XG5cbmV4cG9ydCB7TG9nTGV2ZWx9O1xuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIGxvZ2dlclxuICpcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbXMge0NPTkZJR19QQVJBTVN9IGNvbmZpZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlKGNvbmZpZykge1xuXG5cdGlmIChmaW5hbGl6ZWRfKSB7XG5cdFx0YXBwZW5kKExvZ0xldmVsLkVSUk9SLCAnQ291bGQgbm90IGNvbmZpZ3VyZS4gTG9nVXRpbGl0eSBhbHJlYWR5IGluIHVzZScpO1xuXHRcdHJldHVybjtcblx0fVxuXG4gIGNvbmZpZ3VyZUFwcGVuZGVyc18oY29uZmlnLmFwcGVuZGVycyk7XG5cbiAgY29uZmlndXJlTG9nZ2Vyc18oY29uZmlnLmxvZ2dlcnMpO1xuXG4gIGlmIChjb25maWcudGFnTGF5b3V0KSB7XG4gICAgZm9ybWF0dGVyLnByZUNvbXBpbGUoY29uZmlnLnRhZ0xheW91dCk7XG4gICAgZm9yICh2YXIgbG9nS2V5IGluIGxvZ2dlcnNfKSB7XG4gICAgICBpZiAobG9nZ2Vyc18uaGFzT3duUHJvcGVydHkobG9nS2V5KSkge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbG9nZ2Vyc19bbG9nS2V5XSkge1xuICAgICAgICAgIGlmIChsb2dnZXJzX1tsb2dLZXldLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGxvZ2dlcnNfW2xvZ0tleV1ba2V5XS5zZXRUYWdMYXlvdXQoY29uZmlnLnRhZ0xheW91dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uZmlndXJhdGlvbl8gPSBjb25maWc7XG5cblxufVxuXG52YXIgY29uZmlndXJlQXBwZW5kZXJzXyA9IGZ1bmN0aW9uIChhcHBlbmRlcnMpIHtcblxuXHRpZiAoYXBwZW5kZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcblx0XHR2YXIgY291bnQgPSBhcHBlbmRlcnMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgYWRkQXBwZW5kZXJfKGFwcGVuZGVyc1tpXSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgY29uZmlndXJlTG9nZ2Vyc18gPSBmdW5jdGlvbiAobG9nZ2Vycykge1xuXG5cdGlmICghKGxvZ2dlcnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGxvZ2dlcnNcIik7XG5cdH1cblxuXHR2YXIgY291bnQgPSBsb2dnZXJzLmxlbmd0aDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG5cblx0XHRpZiAoIWxvZ2dlcnNbaV0udGFnKSB7XG5cdFx0XHRsb2dnZXJzX1snbWFpbiddID0gZ2V0TG9nZ2Vyc18obG9nZ2Vyc1tpXS5sb2dMZXZlbCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlcnNfW2xvZ2dlcnNbaV0udGFnXSA9IGdldExvZ2dlcnNfKGxvZ2dlcnNbaV0ubG9nTGV2ZWwpO1xuXHRcdH1cblxuXHR9XG5cbn07XG5cbnZhciBnZXRMb2dnZXJzXyA9IGZ1bmN0aW9uIChsb2dMZXZlbCkge1xuXG5cdHZhciBsb2dnZXI7XG5cdHZhciBsb2dnZXJzID0gW107XG5cdHZhciBjb3VudCA9IGFwcGVuZGVyc18ubGVuZ3RoO1xuXHR3aGlsZSAoY291bnQtLSkge1xuXHRcdGxvZ2dlciA9IGFwcGVuZGVyc19bY291bnRdKCk7XG5cdFx0bG9nZ2VyLnNldExvZ0xldmVsKGxvZ0xldmVsKTtcblx0XHRsb2dnZXJzLnB1c2gobG9nZ2VyKTtcblx0fVxuXG5cdHJldHVybiBsb2dnZXJzO1xuXG59O1xuXG52YXIgYWRkQXBwZW5kZXJfID0gZnVuY3Rpb24oYXBwZW5kZXIpIHtcbiAgaWYgKGZpbmFsaXplZF8gJiYgIWNvbmZpZ3VyYXRpb25fLmFsbG93QXBwZW5kZXJJbmplY3Rpb24pIHtcbiAgICBjb25zb2xlLmVycm9yKCdDYW5ub3QgYWRkIGFwcGVuZGVyIHdoZW4gY29uZmlndXJhdGlvbiBmaW5hbGl6ZWQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YWxpZGF0ZUFwcGVuZGVyXyhBTExPV0VEX0FQUEVOREVSU1thcHBlbmRlcl0pO1xuICBhcHBlbmRlcnNfLnB1c2goQUxMT1dFRF9BUFBFTkRFUlNbYXBwZW5kZXJdKTtcbn07XG5cbi8qKlxuICogQWRkcyBhbiBhcHBlbmRlciB0byB0aGUgYXBwZW5kZXIgcXVldWUuIElmIHRoZSBzdGFjayBpcyBmaW5hbGl6ZWQsIGFuZFxuICogdGhlIGFsbG93QXBwZW5kZXJJbmplY3Rpb24gaXMgc2V0IHRvIGZhbHNlLCB0aGVuIHRoZSBldmVudCB3aWxsIG5vdCBiZVxuICogYXBwZW5kZWRcbiAqXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW1zIHtBUFBFTkRFUn0gYXBwZW5kZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEFwcGVuZGVyKGFwcGVuZGVyKSB7XG4gIC8vYWRkaW5nIGFwcGVuZGVyXG4gIGFkZEFwcGVuZGVyXyhhcHBlbmRlcik7XG4gIGNvbmZpZ3VyZUxvZ2dlcnNfKGNvbmZpZ3VyYXRpb25fLmxvZ2dlcnMpO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGF0IHRoZSBhcHBlbmRlclxuICpcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbXMge0FQUEVOREVSfSBhcHBlbmRlclxuICovXG52YXIgdmFsaWRhdGVBcHBlbmRlcl8gPSBmdW5jdGlvbiAoYXBwZW5kZXIpIHtcblxuXHRpZiAoYXBwZW5kZXIgPT0gbnVsbCB8fCB0eXBlb2YgYXBwZW5kZXIgIT09ICdmdW5jdGlvbicpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXBwZW5kZXI6IG5vdCBhbiBmdW5jdGlvbicpO1xuXHR9XG5cblx0dmFyIGFwcGVuZGVyT2JqID0gYXBwZW5kZXIoKTtcblxuXHR2YXIgYXBwZW5kZXJNZXRob2RzID0gWydhcHBlbmQnLCAnZ2V0TmFtZScsICdpc0FjdGl2ZScsICdzZXRMb2dMZXZlbCcsICdzZXRUYWdMYXlvdXQnXTtcblx0Zm9yICh2YXIga2V5IGluIGFwcGVuZGVyTWV0aG9kcykge1xuXHRcdGlmIChhcHBlbmRlck1ldGhvZHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBhcHBlbmRlck9ialthcHBlbmRlck1ldGhvZHNba2V5XV0gPT0gdW5kZWZpbmVkIHx8XG5cdFx0XHR0eXBlb2YgYXBwZW5kZXJPYmpbYXBwZW5kZXJNZXRob2RzW2tleV1dICE9ICdmdW5jdGlvbicpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcHBlbmRlcjogbWlzc2luZyBtZXRob2Q6ICcgKyBhcHBlbmRlck1ldGhvZHNba2V5XSk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKGNvbmZpZ3VyYXRpb25fIGluc3RhbmNlb2YgT2JqZWN0ICYmIGNvbmZpZ3VyYXRpb25fLnRhZ0xheW91dCkge1xuXHRcdGFwcGVuZGVyT2JqLnNldFRhZ0xheW91dChjb25maWd1cmF0aW9uXy50YWdMYXlvdXQpO1xuXHR9XG5cbiAgaWYodHlwZW9mIGFwcGVuZGVyT2JqWydpbml0J10gPT0gJ2Z1bmN0aW9uJykge1xuICAgIGFwcGVuZGVyT2JqLmluaXQoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBcHBlbmRzIHRoZSBsb2cgZXZlbnRcbiAqXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbG9nZ2luZ0V2ZW50XG4gKi9cbmZ1bmN0aW9uIGFwcGVuZChsb2dnaW5nRXZlbnQpIHtcblxuXHQvLyBmaW5hbGl6ZSB0aGUgY29uZmlndXJhdGlvbiB0byBtYWtlIHN1cmUgbm8gb3RoZXIgYXBwZW5kZXJzIGFyZSBpbmplY3RlZCAoaWYgc2V0KVxuXHRmaW5hbGl6ZWRfID0gdHJ1ZTtcblxuXHR2YXIgbG9nZ2Vycztcblx0aWYgKGxvZ2dlcnNfW2xvZ2dpbmdFdmVudC5sb2dnZXJdKSB7XG5cdFx0bG9nZ2VycyA9IGxvZ2dlcnNfW2xvZ2dpbmdFdmVudC5sb2dnZXJdO1xuXHR9IGVsc2Uge1xuXHRcdGxvZ2dlcnMgPSBsb2dnZXJzX1snbWFpbiddO1xuXHR9XG5cblx0dmFyIGNvdW50ID0gbG9nZ2Vycy5sZW5ndGg7XG5cdHdoaWxlIChjb3VudC0tKSB7XG5cdFx0aWYgKGxvZ2dlcnNbY291bnRdLmlzQWN0aXZlKGxvZ2dpbmdFdmVudC5sZXZlbCkpIHtcblx0XHRcdGxvZ2dlcnNbY291bnRdLmFwcGVuZChsb2dnaW5nRXZlbnQpO1xuXHRcdH1cblx0fVxuXG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxuICovXG52YXIgdmFsaWRhdGVMZXZlbF8gPSBmdW5jdGlvbiAobGV2ZWwpIHtcblxuXHRmb3IgKHZhciBrZXkgaW4gTG9nTGV2ZWwpIHtcblx0XHRpZiAobGV2ZWwgPT09IExvZ0xldmVsW2tleV0pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbG9nIGxldmVsOiAnICsgbGV2ZWwpO1xuXG59O1xuXG4vKipcbiAqIEhhbmRsZXMgY3JlYXRpbmcgdGhlIGxvZ2dlciBhbmQgcmV0dXJuaW5nIGl0XG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dFxuICogQHJldHVybiB7TG9nZ2VyfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9nZ2VyKGNvbnRleHQpIHtcblxuXHQvLyB3ZSBuZWVkIHRvIGluaXRpYWxpemUgaWYgd2UgaGF2ZW4ndFxuXHRpZiAoY29uZmlndXJhdGlvbl8gPT09IG51bGwpIHtcblx0XHRjb25maWd1cmUoREVGQVVMVF9DT05GSUcpO1xuXHR9XG5cblx0cmV0dXJuIG5ldyBMb2dnZXIoY29udGV4dCwge1xuXHRcdGFwcGVuZDogYXBwZW5kXG5cdH0pO1xuXG59XG5cbi8qKlxuICogU2V0cyB0aGUgbG9nIGxldmVsIGZvciBhbGwgbG9nZ2Vycywgb3Igc3BlY2lmaWVkIGxvZ2dlclxuICogQHBhcmFtIHtudW1iZXJ9IGxvZ0xldmVsXG4gKiBAcGFyYW0ge3N0cmluZz19IGxvZ2dlclxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TG9nTGV2ZWwobG9nTGV2ZWwsIGxvZ2dlcikge1xuXG5cdHZhbGlkYXRlTGV2ZWxfKGxvZ0xldmVsKTtcblxuXHRpZiAobG9nZ2VyICE9PSB1bmRlZmluZWQpIHtcblx0XHRpZiAobG9nZ2Vyc19bbG9nZ2VyXSkge1xuXHRcdFx0bG9nZ2Vyc19bbG9nZ2VyXS5zZXRMb2dMZXZlbChsb2dMZXZlbCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXG5cdFx0Zm9yICh2YXIgbG9nS2V5IGluIGxvZ2dlcnNfKSB7XG5cdFx0XHRpZiAobG9nZ2Vyc18uaGFzT3duUHJvcGVydHkobG9nS2V5KSkge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbG9nZ2Vyc19bbG9nS2V5XSkge1xuXHRcdFx0XHRcdGlmIChsb2dnZXJzX1tsb2dLZXldLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRcdGxvZ2dlcnNfW2xvZ0tleV1ba2V5XS5zZXRMb2dMZXZlbChsb2dMZXZlbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxufVxuIl19


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
		var message = '';
		var count = formatter.length;
		for (var i = 0; i < count; i++) {
			if (formatter[i] !== null) {

				if (formatter[i] instanceof Object) {

					response = formatter[i].formatter(logEvent, formatter[i].params);
					if (response != null) {
						message += response;
					}
					message += formatter[i].after;
				} else {
					message += formatter[i];
				}
			}
		}

		return message.trim();
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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mb3JtYXR0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NkJBTzJCLGlCQUFpQjs7dUJBQ25CLFdBQVc7O0lBQXhCLE9BQU87OzZCQUNPLGtCQUFrQjs7SUFBaEMsUUFBUTs7O0FBR3BCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7OztBQVcxQixJQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUM5QyxRQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7Q0FDdkIsQ0FBQzs7Ozs7Ozs7Ozs7QUFXRixJQUFJLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBWSxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFFBQU8sMEJBQVcsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM1QyxDQUFDOzs7Ozs7Ozs7OztBQVdGLElBQUksZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQVksUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUNqRCxLQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsS0FBSSxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTs7QUFFM0IsTUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxTQUFTLEVBQUU7QUFDdEMsT0FBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DLFFBQU0sSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO0FBQ3hCLFdBQU8sSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNyQztHQUNELE1BQU0sSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFB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SSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7QUFDbEMsT0FBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqRCxXQUFRLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0dBQ25GLE1BQU07QUFDTixXQUFRLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDeEM7RUFFRCxNQUFNOztBQUVOLFVBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0FBQ3RCLFVBQVEsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO0FBQ2hDLFVBQVEsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0VBRTFCO0NBRUQ7Ozs7Ozs7Ozs7O0FBVU0sU0FBUyxVQUFVLENBQUMsTUFBTSxFQUFFO0FBQ2xDLG1CQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzNCOzs7Ozs7Ozs7Ozs7QUFXTSxTQUFTLE1BQU0sQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3hDLFFBQU8sZUFBZSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQzdEIiwiZmlsZSI6ImZvcm1hdHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbG9nNGpzIDxodHRwczovL2dpdGh1Yi5jb20vYW5pZ2VuZXJvL2xvZzRqcz5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNi1wcmVzZW50IFJvYmluIFNjaHVsdHogPGh0dHA6Ly9jdW5hZS5jb20+XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBkYXRlRm9ybWF0IH0gZnJvbSAnLi9kYXRlRm9ybWF0dGVyJztcbmltcG9ydCAqIGFzIHV0aWxpdHkgZnJvbSAnLi91dGlsaXR5JztcbmltcG9ydCAqIGFzIGxvZ0xldmVsIGZyb20gJy4vY29uc3QvbG9nTGV2ZWwnO1xuXG4vKiogQHR5cGUge09iamVjdH0gKi9cbnZhciBjb21waWxlZExheW91dHNfID0ge307XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRMb2dnZXJfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRyZXR1cm4gbG9nRXZlbnQubG9nZ2VyO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdERhdGVfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRyZXR1cm4gZGF0ZUZvcm1hdChsb2dFdmVudC5kYXRlLCBwYXJhbXNbMF0pO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdEV4Y2VwdGlvbl8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHZhciBtZXNzYWdlID0gJyc7XG5cdGlmIChsb2dFdmVudC5lcnJvciAhPSBudWxsKSB7XG5cblx0XHRpZiAobG9nRXZlbnQuZXJyb3Iuc3RhY2sgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR2YXIgc3RhY2tzID0gbG9nRXZlbnQuZXJyb3Iuc3RhY2suc3BsaXQoL1xcbi9nKTtcblx0XHRcdGZvciAoIHZhciBrZXkgaW4gc3RhY2tzKSB7XG5cdFx0XHRcdG1lc3NhZ2UgKz0gJ1xcdCcgKyBzdGFja3Nba2V5XSArICdcXG4nO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAobG9nRXZlbnQuZXJyb3IubWVzc2FnZSAhPSBudWxsICYmIGxvZ0V2ZW50LmVycm9yLm1lc3NhZ2UgIT0gJycpIHtcblx0XHRcdG1lc3NhZ2UgKz0gJ1xcdCc7XG5cdFx0XHRtZXNzYWdlICs9IGxvZ0V2ZW50LmVycm9yLm5hbWUgKyAnOiAnICsgbG9nRXZlbnQuZXJyb3IubWVzc2FnZTtcblx0XHRcdG1lc3NhZ2UgKz0gJ1xcbic7XG5cdFx0fVxuXG5cdH1cblx0cmV0dXJuIG1lc3NhZ2U7XG59O1xuXG4vKipcbiAqXG4gKi9cbnZhciBmb3JtYXRGaWxlXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0aWYgKGxvZ0V2ZW50LmZpbGUgPT09IG51bGwpIHtcblx0XHRnZXRGaWxlRGV0YWlsc18obG9nRXZlbnQpO1xuXHR9XG5cdHJldHVybiBsb2dFdmVudC5maWxlO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdExpbmVOdW1iZXJfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRpZiAobG9nRXZlbnQubGluZU51bWJlciA9PT0gbnVsbCkge1xuXHRcdGdldEZpbGVEZXRhaWxzXyhsb2dFdmVudCk7XG5cdH1cblx0cmV0dXJuICcnICsgbG9nRXZlbnQubGluZU51bWJlcjtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRNYXBNZXNzYWdlXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0dmFyIG1lc3NhZ2UgPSBudWxsO1xuXHRpZiAobG9nRXZlbnQucHJvcGVydGllcykge1xuXG5cdFx0bWVzc2FnZSA9IFtdO1xuXHRcdGZvciAoIHZhciBrZXkgaW4gbG9nRXZlbnQucHJvcGVydGllcykge1xuXHRcdFx0aWYgKHBhcmFtc1swXSkge1xuXHRcdFx0XHRpZiAocGFyYW1zWzBdID09IGtleSkge1xuXHRcdFx0XHRcdG1lc3NhZ2UucHVzaChsb2dFdmVudC5wcm9wZXJ0aWVzW2tleV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtZXNzYWdlLnB1c2goJ3snICsga2V5ICsgJywnICsgbG9nRXZlbnQucHJvcGVydGllc1trZXldICsgJ30nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gJ3snICsgbWVzc2FnZS5qb2luKCcsJykgKyAnfSc7XG5cblx0fVxuXHRyZXR1cm4gbWVzc2FnZTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ0V2ZW50XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fSBwYXJhbXNcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBmb3JtYXRMb2dNZXNzYWdlXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0cmV0dXJuIGxvZ0V2ZW50Lm1lc3NhZ2U7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TWV0aG9kTmFtZV8gPSBmdW5jdGlvbihsb2dFdmVudCwgcGFyYW1zKSB7XG5cdHJldHVybiB1dGlsaXR5LmdldEZ1bmN0aW9uTmFtZShsb2dFdmVudC5tZXRob2QpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdExpbmVTZXBhcmF0b3JfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRyZXR1cm4gJ1xcbic7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0TGV2ZWxfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRpZiAobG9nRXZlbnQubGV2ZWwgPT0gbG9nTGV2ZWwuRkFUQUwpIHtcblx0XHRyZXR1cm4gJ0ZBVEFMJztcblx0fSBlbHNlIGlmIChsb2dFdmVudC5sZXZlbCA9PSBsb2dMZXZlbC5FUlJPUikge1xuXHRcdHJldHVybiAnRVJST1InO1xuXHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLldBUk4pIHtcblx0XHRyZXR1cm4gJ1dBUk4nO1xuXHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLklORk8pIHtcblx0XHRyZXR1cm4gJ0lORk8nO1xuXHR9IGVsc2UgaWYgKGxvZ0V2ZW50LmxldmVsID09IGxvZ0xldmVsLkRFQlVHKSB7XG5cdFx0cmV0dXJuICdERUJVRyc7XG5cdH0gZWxzZSBpZiAobG9nRXZlbnQubGV2ZWwgPT0gbG9nTGV2ZWwuVFJBQ0UpIHtcblx0XHRyZXR1cm4gJ1RSQUNFJztcblx0fVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge0xPR19FVkVOVH0gbG9nRXZlbnRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHBhcmFtc1xuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdFJlbGF0aXZlXyA9IGZ1bmN0aW9uKGxvZ0V2ZW50LCBwYXJhbXMpIHtcblx0cmV0dXJuICcnICsgbG9nRXZlbnQucmVsYXRpdmU7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gcGFyYW1zXG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZm9ybWF0U2VxdWVuY2VOdW1iZXJfID0gZnVuY3Rpb24obG9nRXZlbnQsIHBhcmFtcykge1xuXHRyZXR1cm4gJycgKyBsb2dFdmVudC5zZXF1ZW5jZTtcbn07XG5cbnZhciBmb3JtYXR0ZXJzXyA9IHtcblx0J2N8bG9nZ2VyJyA6IGZvcm1hdExvZ2dlcl8sXG5cdCdkfGRhdGUnIDogZm9ybWF0RGF0ZV8sXG5cdCdleHxleGNlcHRpb258dGhyb3dhYmxlJyA6IGZvcm1hdEV4Y2VwdGlvbl8sXG5cdCdGfGZpbGUnIDogZm9ybWF0RmlsZV8sXG5cdCdLfG1hcHxNQVAnIDogZm9ybWF0TWFwTWVzc2FnZV8sXG5cdCdMfGxpbmUnIDogZm9ybWF0TGluZU51bWJlcl8sXG5cdCdtfG1zZ3xtZXNzYWdlJyA6IGZvcm1hdExvZ01lc3NhZ2VfLFxuXHQnTXxtZXRob2QnIDogZm9ybWF0TWV0aG9kTmFtZV8sXG5cdCduJyA6IGZvcm1hdExpbmVTZXBhcmF0b3JfLFxuXHQncHxsZXZlbCcgOiBmb3JtYXRMZXZlbF8sXG5cdCdyfHJlbGF0aXZlJyA6IGZvcm1hdFJlbGF0aXZlXyxcblx0J3NufHNlcXVlbmNlTnVtYmVyJyA6IGZvcm1hdFNlcXVlbmNlTnVtYmVyX1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBtZW1iZXJPZiBmb3JtYXR0ZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbGF5b3V0XG4gKlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG52YXIgZ2V0Q29tcGlsZWRMYXlvdXRfID0gZnVuY3Rpb24obGF5b3V0KSB7XG5cblx0aWYgKGNvbXBpbGVkTGF5b3V0c19bbGF5b3V0XSAhPSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY29tcGlsZWRMYXlvdXRzX1tsYXlvdXRdO1xuXHR9XG5cblx0cmV0dXJuIGNvbXBpbGVMYXlvdXRfKGxheW91dCk7XG5cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxheW91dFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGNvbXBpbGVMYXlvdXRfID0gZnVuY3Rpb24obGF5b3V0KSB7XG5cblx0dmFyIGluZGV4ID0gbGF5b3V0LmluZGV4T2YoJyUnKTtcblx0dmFyIGN1cnJlbnRGb3JtYXRTdHJpbmcgPSAnJztcblx0dmFyIGZvcm1hdHRlciA9IFtdO1xuXG5cdGlmIChpbmRleCAhPSAwKSB7XG5cdFx0Zm9ybWF0dGVyLnB1c2gobGF5b3V0LnN1YnN0cmluZygwLCBpbmRleCkpO1xuXHR9XG5cblx0ZG8ge1xuXG5cdFx0dmFyIHN0YXJ0SW5kZXggPSBpbmRleDtcblx0XHR2YXIgZW5kSW5kZXggPSBpbmRleCA9IGxheW91dC5pbmRleE9mKCclJywgaW5kZXggKyAxKTtcblxuXHRcdGlmIChlbmRJbmRleCA8IDApIHtcblx0XHRcdGN1cnJlbnRGb3JtYXRTdHJpbmcgPSBsYXlvdXQuc3Vic3RyaW5nKHN0YXJ0SW5kZXgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjdXJyZW50Rm9ybWF0U3RyaW5nID0gbGF5b3V0LnN1YnN0cmluZyhzdGFydEluZGV4LCBlbmRJbmRleCk7XG5cdFx0fVxuXG5cdFx0Zm9ybWF0dGVyLnB1c2goZ2V0Rm9ybWF0dGVyT2JqZWN0XyhjdXJyZW50Rm9ybWF0U3RyaW5nKSk7XG5cblx0fSB3aGlsZSAoaW5kZXggPiAtMSk7XG5cblx0Y29tcGlsZWRMYXlvdXRzX1tsYXlvdXRdID0gZm9ybWF0dGVyO1xuXG5cdHJldHVybiBmb3JtYXR0ZXI7XG5cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGZvcm1hdFN0cmluZ1xuICpcbiAqIEByZXR1cm4gez9zdHJpbmd9XG4gKi9cbnZhciBnZXRGb3JtYXR0ZXJPYmplY3RfID0gZnVuY3Rpb24oZm9ybWF0U3RyaW5nKSB7XG5cblx0dmFyIGNvbW1hbmRSZWdleCA9IC8lKFthLXosQS1aXSspKD89XFx7fCkvO1xuXHR2YXIgcmVzdWx0ID0gY29tbWFuZFJlZ2V4LmV4ZWMoZm9ybWF0U3RyaW5nKTtcblx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHJlc3VsdC5sZW5ndGggPT0gMikge1xuXG5cdFx0dmFyIGZvcm1hdHRlciA9IGdldEZvcm1hdHRlckZ1bmN0aW9uXyhyZXN1bHRbMV0pO1xuXHRcdGlmIChmb3JtYXR0ZXIgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0dmFyIHBhcmFtcyA9IGdldEZvcm1hdHRlclBhcmFtc18oZm9ybWF0U3RyaW5nKTtcblxuXHRcdHZhciBhZnRlciA9ICcnO1xuXHRcdHZhciBlbmRJbmRleCA9IGZvcm1hdFN0cmluZy5sYXN0SW5kZXhPZignfScpO1xuXHRcdGlmIChlbmRJbmRleCAhPSAtMSkge1xuXHRcdFx0YWZ0ZXIgPSBmb3JtYXRTdHJpbmcuc3Vic3RyaW5nKGVuZEluZGV4ICsgMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFmdGVyID0gZm9ybWF0U3RyaW5nLnN1YnN0cmluZyhyZXN1bHQuaW5kZXggKyByZXN1bHRbMV0ubGVuZ3RoICsgMSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGZvcm1hdHRlciA6IGZvcm1hdHRlcixcblx0XHRcdHBhcmFtcyA6IHBhcmFtcyxcblx0XHRcdGFmdGVyIDogYWZ0ZXJcblx0XHR9O1xuXG5cdH1cblxuXHRyZXR1cm4gZm9ybWF0U3RyaW5nO1xuXG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kXG4gKlxuICogQHJldHVybiB7P3N0cmluZ31cbiAqL1xudmFyIGdldEZvcm1hdHRlckZ1bmN0aW9uXyA9IGZ1bmN0aW9uKGNvbW1hbmQpIHtcblxuXHR2YXIgcmVnZXg7XG5cdGZvciAoIHZhciBrZXkgaW4gZm9ybWF0dGVyc18pIHtcblx0XHRyZWdleCA9IG5ldyBSZWdFeHAoJ14nICsga2V5ICsgJyQnKTtcblx0XHRpZiAocmVnZXguZXhlYyhjb21tYW5kKSAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZm9ybWF0dGVyc19ba2V5XTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcblxufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbW1hbmRcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnZhciBnZXRGb3JtYXR0ZXJQYXJhbXNfID0gZnVuY3Rpb24oY29tbWFuZCkge1xuXG5cdHZhciBwYXJhbXMgPSBbXTtcblx0dmFyIHJlc3VsdCA9IGNvbW1hbmQubWF0Y2goL1xceyhbXlxcfV0qKSg/PVxcfSkvZyk7XG5cdGlmIChyZXN1bHQgIT0gbnVsbCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwYXJhbXMucHVzaChyZXN1bHRbaV0uc3Vic3RyaW5nKDEpKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcGFyYW1zO1xuXG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5LjxmdW5jdGlvbnxzdHJpbmc+fSBmb3JtYXR0ZXJcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xudmFyIGZvcm1hdExvZ0V2ZW50XyA9IGZ1bmN0aW9uKGZvcm1hdHRlciwgbG9nRXZlbnQpIHtcblxuXHR2YXIgcmVzcG9uc2U7XG5cdHZhciBtZXNzYWdlID0gJyc7XG5cdHZhciBjb3VudCA9IGZvcm1hdHRlci5sZW5ndGg7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXHRcdGlmIChmb3JtYXR0ZXJbaV0gIT09IG51bGwpIHtcblxuXHRcdFx0aWYgKGZvcm1hdHRlcltpXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuXG5cdFx0XHRcdHJlc3BvbnNlID0gZm9ybWF0dGVyW2ldLmZvcm1hdHRlcihsb2dFdmVudCwgZm9ybWF0dGVyW2ldLnBhcmFtcyk7XG5cdFx0XHRcdGlmIChyZXNwb25zZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bWVzc2FnZSArPSByZXNwb25zZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtZXNzYWdlICs9IGZvcm1hdHRlcltpXS5hZnRlcjtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bWVzc2FnZSArPSBmb3JtYXR0ZXJbaV07XG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbWVzc2FnZS50cmltKCk7XG5cbn07XG5cbmZ1bmN0aW9uIGdldEZpbGVEZXRhaWxzXyhsb2dFdmVudCkge1xuXG5cdGlmIChsb2dFdmVudC5sb2dFcnJvclN0YWNrICE9PSB1bmRlZmluZWQpIHtcblxuXHRcdGxldCBwYXJ0cyA9IGxvZ0V2ZW50LmxvZ0Vycm9yU3RhY2suc3RhY2suc3BsaXQoL1xcbi9nKTtcblx0XHRsZXQgZmlsZSA9IHBhcnRzWzNdO1xuXHRcdGZpbGUgPSBmaWxlLnJlcGxhY2UoL2F0ICguKlxcKHwpKGZpbGV8aHR0cHxodHRwc3wpKFxcOnwpKFxcL3wpKi8sICcnKTtcblx0XHRmaWxlID0gZmlsZS5yZXBsYWNlKCcpJywgJycpO1xuXHRcdGZpbGUgPSBmaWxlLnJlcGxhY2UoKHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpID8gbG9jYXRpb24uaG9zdCA6ICcnLCAnJykudHJpbSgpO1xuXG5cdFx0bGV0IGZpbGVQYXJ0cyA9IGZpbGUuc3BsaXQoL1xcOi9nKTtcblxuXHRcdGxvZ0V2ZW50LmNvbHVtbiA9IGZpbGVQYXJ0cy5wb3AoKTtcblx0XHRsb2dFdmVudC5saW5lTnVtYmVyID0gZmlsZVBhcnRzLnBvcCgpO1xuXG5cdFx0aWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRsZXQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblx0XHRcdGxldCBhcHBEaXIgPSBwYXRoLmRpcm5hbWUocmVxdWlyZS5tYWluLmZpbGVuYW1lKTtcblx0XHRcdGxvZ0V2ZW50LmZpbGVuYW1lID0gZmlsZVBhcnRzLmpvaW4oJzonKS5yZXBsYWNlKGFwcERpciwgJycpLnJlcGxhY2UoLyhcXFxcfFxcLykvLCAnJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ0V2ZW50LmZpbGVuYW1lID0gZmlsZVBhcnRzLmpvaW4oJzonKTtcblx0XHR9XG5cblx0fSBlbHNlIHtcblxuXHRcdGxvZ0V2ZW50LmNvbHVtbiA9ICc/Jztcblx0XHRsb2dFdmVudC5maWxlbmFtZSA9ICdhbm9ueW1vdXMnO1xuXHRcdGxvZ0V2ZW50LmxpbmVOdW1iZXIgPSAnPyc7XG5cblx0fVxuXG59XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbWVtYmVyT2YgZm9ybWF0dGVyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxheW91dFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZUNvbXBpbGUobGF5b3V0KSB7XG5cdGdldENvbXBpbGVkTGF5b3V0XyhsYXlvdXQpO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG1lbWJlck9mIGZvcm1hdHRlclxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYXlvdXRcbiAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dFdmVudFxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChsYXlvdXQsIGxvZ0V2ZW50KSB7XG5cdHJldHVybiBmb3JtYXRMb2dFdmVudF8oZ2V0Q29tcGlsZWRMYXlvdXRfKGxheW91dCksIGxvZ0V2ZW50KTtcbn0iXX0=


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
				message: '',
				method: args.callee.caller,
				properties: undefined,
				relative: logTime.getTime() - relative_,
				sequence: logSequence_++
			};

			var messageStubs = 0;
			for (var i = 0; i < args.length; i++) {

				if (i === 0) {
					loggingEvent.message = args[i];
					var stubs = /\{\}/g.exec(loggingEvent.message);
					messageStubs = stubs instanceof Array ? stubs.length : 0;
				} else if (messageStubs > 0) {
					loggingEvent.message = loggingEvent.message.replace(/\{\}/, args[i]);
					messageStubs--;
				} else if (args[i] instanceof Error) {
					loggingEvent.error = args[i];
				} else {
					loggingEvent.properties = args[i];
				}
			}

			return loggingEvent;
		}

		return this;
	}
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sb2dnZXIvbG9nZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7dUJBT3lCLFlBQVk7O0lBQXpCLE9BQU87OzZCQUNPLG1CQUFtQjs7SUFBakMsUUFBUTs7QUFFYixTQUFTLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFOzs7QUFHNUMsS0FBSSxTQUFTLEdBQUcsQUFBQyxJQUFJLElBQUksRUFBRSxDQUFFLE9BQU8sRUFBRSxDQUFDOztBQUV2QyxLQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7OztBQUdyQixLQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTs7QUFFL0IsTUFBSSxPQUFPLE9BQU8sSUFBSSxVQUFVLEVBQUU7QUFDakMsVUFBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDM0MsTUFBTSxJQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFBRTtBQUN0QyxVQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkQsT0FBSSxPQUFPLElBQUksUUFBUSxFQUFFO0FBQ3hCLFdBQU8sR0FBRyxXQUFXLENBQUM7SUFDdEI7R0FDRCxNQUFNO0FBQ04sVUFBTyxHQUFHLFdBQVcsQ0FBQztHQUN0QjtFQUVEOzs7QUFHRCxLQUFJLFdBQVcsR0FBRyxPQUFPLENBQUM7Ozs7O0FBSzFCLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNqRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7OztBQUtGLEtBQUksQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUN2QixhQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNsRSxDQUFDOzs7Ozs7Ozs7O0FBVUYsVUFBUyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFOztBQUV4QyxNQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3pCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQzs7O0FBR2pCLE1BQUk7QUFDSCxTQUFNLElBQUksS0FBSyxFQUFFLENBQUM7R0FDbEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNYLFFBQUssR0FBRyxDQUFDLENBQUM7R0FDVjs7QUFFRCxNQUFJLFlBQVksR0FBRztBQUNsQixPQUFJLEVBQUcsT0FBTztBQUNkLFFBQUssRUFBRyxJQUFJO0FBQ1osZ0JBQWEsRUFBRyxLQUFLO0FBQ3JCLE9BQUksRUFBRyxJQUFJO0FBQ1gsUUFBSyxFQUFHLEtBQUs7QUFDYixhQUFVLEVBQUcsSUFBSTtBQUNqQixTQUFNLEVBQUcsV0FBVztBQUNwQixVQUFPLEVBQUcsRUFBRTtBQUNaLFNBQU0sRUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07QUFDM0IsYUFBVSxFQUFHLFNBQVM7QUFDdEIsV0FBUSxFQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTO0FBQ3hDLFdBQVEsRUFBRyxZQUFZLEVBQUU7R0FDekIsQ0FBQzs7QUFFRixNQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDckIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O0FBRXJDLE9BQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNaLGdCQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxBQUFDLE9BQU8sQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pELGdCQUFZLEdBQUcsQUFBQyxLQUFLLFlBQVksS0FBSyxHQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzNELE1BQU0sSUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFO0FBQzVCLGdCQUFZLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxnQkFBWSxFQUFFLENBQUM7SUFDZixNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssRUFBRTtBQUNwQyxnQkFBWSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsTUFBTTtBQUNOLGdCQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQztHQUVEOztBQUVELFNBQU8sWUFBWSxDQUFDO0VBRXBCOztBQUVELFFBQU8sSUFBSSxDQUFDO0NBRVoiLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHV0aWxpdHkgZnJvbSAnLi4vdXRpbGl0eSc7XG5pbXBvcnQgKiBhcyBsb2dMZXZlbCBmcm9tICcuLi9jb25zdC9sb2dMZXZlbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBMb2dnZXIoY29udGV4dCwgYXBwZW5kZXJPYmopIHtcblxuXHQvKiogQHR5cGVvZiB7bnVtYmVyfSAqL1xuXHRsZXQgcmVsYXRpdmVfID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblx0LyoqIEB0eXBlb2Yge251bWJlcn0gKi9cblx0bGV0IGxvZ1NlcXVlbmNlXyA9IDE7XG5cblx0Ly8gR2V0IHRoZSBjb250ZXh0XG5cdGlmICh0eXBlb2YgY29udGV4dCAhPSAnc3RyaW5nJykge1xuXG5cdFx0aWYgKHR5cGVvZiBjb250ZXh0ID09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNvbnRleHQgPSB1dGlsaXR5LmdldEZ1bmN0aW9uTmFtZShjb250ZXh0KTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG5cdFx0XHRjb250ZXh0ID0gdXRpbGl0eS5nZXRGdW5jdGlvbk5hbWUoY29udGV4dC5jb25zdHJ1Y3Rvcik7XG5cdFx0XHRpZiAoY29udGV4dCA9PSAnT2JqZWN0Jykge1xuXHRcdFx0XHRjb250ZXh0ID0gJ2Fub255bW91cyc7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRleHQgPSAnYW5vbnltb3VzJztcblx0XHR9XG5cblx0fVxuXG5cdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRsZXQgbG9nQ29udGV4dF8gPSBjb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGFuIGVycm9yIGV2ZW50XG5cdCAqL1xuXHR0aGlzLmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0YXBwZW5kZXJPYmouYXBwZW5kKGNvbnN0cnVjdExvZ0V2ZW50Xyhsb2dMZXZlbC5FUlJPUiwgYXJndW1lbnRzKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIExvZ3MgYSB3YXJuaW5nXG5cdCAqL1xuXHR0aGlzLndhcm4gPSBmdW5jdGlvbigpIHtcblx0XHRhcHBlbmRlck9iai5hcHBlbmQoY29uc3RydWN0TG9nRXZlbnRfKGxvZ0xldmVsLldBUk4sIGFyZ3VtZW50cykpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGFuIGluZm8gbGV2ZWwgZXZlbnRcblx0ICovXG5cdHRoaXMuaW5mbyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcGVuZGVyT2JqLmFwcGVuZChjb25zdHJ1Y3RMb2dFdmVudF8obG9nTGV2ZWwuSU5GTywgYXJndW1lbnRzKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIExvZ3MgYSBkZWJ1ZyBldmVudFxuXHQgKi9cblx0dGhpcy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuXHRcdGFwcGVuZGVyT2JqLmFwcGVuZChjb25zdHJ1Y3RMb2dFdmVudF8obG9nTGV2ZWwuREVCVUcsIGFyZ3VtZW50cykpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBMb2dzIGEgdHJhY2UgZXZlbnRcblx0ICovXG5cdHRoaXMudHJhY2UgPSBmdW5jdGlvbigpIHtcblx0XHRhcHBlbmRlck9iai5hcHBlbmQoY29uc3RydWN0TG9nRXZlbnRfKGxvZ0xldmVsLlRSQUNFLCBhcmd1bWVudHMpKTtcblx0fTtcblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcmdzXG5cdCAqXG5cdCAqIEByZXR1cm4ge0xPR19FVkVOVH1cblx0ICovXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdExvZ0V2ZW50XyhsZXZlbCwgYXJncykge1xuXG5cdFx0bGV0IGxvZ1RpbWUgPSBuZXcgRGF0ZSgpO1xuXHRcdGxldCBlcnJvciA9IG51bGw7XG5cblx0XHQvLyB0aGlzIGxvb2tzIGhvcnJpYmxlLCBidXQgdGhpcyBpcyB0aGUgb25seSB3YXkgdG8gY2F0Y2ggdGhlIHN0YWNrIGZvciBJRSB0byBsYXRlciBwYXJzZSB0aGUgc3RhY2tcblx0XHR0cnkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0ZXJyb3IgPSBlO1xuXHRcdH1cblxuXHRcdGxldCBsb2dnaW5nRXZlbnQgPSB7XG5cdFx0XHRkYXRlIDogbG9nVGltZSxcblx0XHRcdGVycm9yIDogbnVsbCxcblx0XHRcdGxvZ0Vycm9yU3RhY2sgOiBlcnJvcixcblx0XHRcdGZpbGUgOiBudWxsLFxuXHRcdFx0bGV2ZWwgOiBsZXZlbCxcblx0XHRcdGxpbmVOdW1iZXIgOiBudWxsLFxuXHRcdFx0bG9nZ2VyIDogbG9nQ29udGV4dF8sXG5cdFx0XHRtZXNzYWdlIDogJycsXG5cdFx0XHRtZXRob2QgOiBhcmdzLmNhbGxlZS5jYWxsZXIsXG5cdFx0XHRwcm9wZXJ0aWVzIDogdW5kZWZpbmVkLFxuXHRcdFx0cmVsYXRpdmUgOiBsb2dUaW1lLmdldFRpbWUoKSAtIHJlbGF0aXZlXyxcblx0XHRcdHNlcXVlbmNlIDogbG9nU2VxdWVuY2VfKytcblx0XHR9O1xuXG5cdFx0bGV0IG1lc3NhZ2VTdHVicyA9IDA7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGlmIChpID09PSAwKSB7XG5cdFx0XHRcdGxvZ2dpbmdFdmVudC5tZXNzYWdlID0gYXJnc1tpXTtcblx0XHRcdFx0bGV0IHN0dWJzID0gKC9cXHtcXH0vZykuZXhlYyhsb2dnaW5nRXZlbnQubWVzc2FnZSk7XG5cdFx0XHRcdG1lc3NhZ2VTdHVicyA9IChzdHVicyBpbnN0YW5jZW9mIEFycmF5KSA/IHN0dWJzLmxlbmd0aCA6IDA7XG5cdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2VTdHVicyA+IDApIHtcblx0XHRcdFx0bG9nZ2luZ0V2ZW50Lm1lc3NhZ2UgPSBsb2dnaW5nRXZlbnQubWVzc2FnZS5yZXBsYWNlKC9cXHtcXH0vLCBhcmdzW2ldKTtcblx0XHRcdFx0bWVzc2FnZVN0dWJzLS07XG5cdFx0XHR9IGVsc2UgaWYgKGFyZ3NbaV0gaW5zdGFuY2VvZiBFcnJvcikge1xuXHRcdFx0XHRsb2dnaW5nRXZlbnQuZXJyb3IgPSBhcmdzW2ldO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bG9nZ2luZ0V2ZW50LnByb3BlcnRpZXMgPSBhcmdzW2ldO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxvZ2dpbmdFdmVudDtcblxuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG5cbn1cbiJdfQ==


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
				console.error(message);
			} else if (loggingEvent.level == LogLevel.WARN) {
				console.warn(message);
			} else if (loggingEvent.level == LogLevel.INFO) {
				console.info(message);
			} else if (loggingEvent.level == LogLevel.DEBUG || loggingEvent.level == LogLevel.TRACE) {
				console.log(message);
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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBlbmRlcnMvY29uc29sZUFwcGVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7NkJBTzBCLG1CQUFtQjs7SUFBakMsUUFBUTs7eUJBQ08sY0FBYzs7SUFBN0IsU0FBUzs7QUFFZCxTQUFTLGVBQWUsR0FBRzs7O0FBR2pDLEtBQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsS0FBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7Ozs7OztBQU85QixVQUFTLE1BQU0sQ0FBQyxZQUFZLEVBQUU7QUFDN0IsTUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFNBQVMsRUFBRTtBQUNwQyxtQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUMvQjtFQUNEOzs7Ozs7OztBQVFELFVBQVMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFOztBQUV2QyxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFekQsTUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDekMsVUFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUN2QixNQUFNLElBQUksWUFBWSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQy9DLFVBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDdEIsTUFBTSxJQUFJLFlBQVksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtBQUMvQyxVQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3RCLE1BQU0sSUFBSSxZQUFZLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLElBQzlDLFlBQVksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtBQUN0QyxVQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3JCO0VBRUQ7Ozs7Ozs7OztBQVNELFVBQVMsT0FBTyxHQUFHO0FBQ2xCLFNBQU8saUJBQWlCLENBQUM7RUFDekI7Ozs7Ozs7Ozs7O0FBV0QsVUFBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3hCLFNBQVEsS0FBSyxJQUFJLFNBQVMsQ0FBRTtFQUM1Qjs7Ozs7OztBQU9ELFVBQVMsV0FBVyxHQUFHO0FBQ3RCLFNBQU8sU0FBUyxDQUFDO0VBQ2pCOzs7Ozs7O0FBT0QsVUFBUyxXQUFXLENBQUMsUUFBUSxFQUFFO0FBQzlCLFdBQVMsR0FBRyxRQUFRLENBQUM7RUFDckI7Ozs7Ozs7QUFPRCxVQUFTLFlBQVksQ0FBQyxTQUFTLEVBQUU7QUFDaEMsWUFBVSxHQUFHLFNBQVMsQ0FBQztFQUN2Qjs7QUFFRCxRQUFPO0FBQ04sUUFBTSxFQUFHLE1BQU07QUFDZixTQUFPLEVBQUcsT0FBTztBQUNqQixVQUFRLEVBQUcsUUFBUTtBQUNuQixhQUFXLEVBQUcsV0FBVztBQUN6QixhQUFXLEVBQUcsV0FBVztBQUN6QixjQUFZLEVBQUcsWUFBWTtFQUMzQixDQUFDO0NBRUYiLCJmaWxlIjoiY29uc29sZUFwcGVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9hbmlnZW5lcm8vbG9nNGpzPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgUm9iaW4gU2NodWx0eiA8aHR0cDovL2N1bmFlLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIExvZ0xldmVsIGZyb20gJy4uL2NvbnN0L2xvZ0xldmVsJztcbmltcG9ydCAqIGFzIGZvcm1hdHRlciBmcm9tICcuLi9mb3JtYXR0ZXInO1xuXG5leHBvcnQgZnVuY3Rpb24gQ29uc29sZUFwcGVuZGVyKCkge1xuXG5cdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRsZXQgdGFnTGF5b3V0XyA9ICclbSc7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHRsZXQgbG9nTGV2ZWxfID0gTG9nTGV2ZWwuSU5GTztcblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB7TE9HX0VWRU5UfSBsb2dnaW5nRXZlbnRcblx0ICovXG5cdGZ1bmN0aW9uIGFwcGVuZChsb2dnaW5nRXZlbnQpIHtcblx0XHRpZiAobG9nZ2luZ0V2ZW50LmxldmVsIDw9IGxvZ0xldmVsXykge1xuXHRcdFx0YXBwZW5kVG9Db25zb2xlXyhsb2dnaW5nRXZlbnQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ2dpbmdFdmVudFxuXHQgKi9cblx0ZnVuY3Rpb24gYXBwZW5kVG9Db25zb2xlXyhsb2dnaW5nRXZlbnQpIHtcblxuXHRcdGxldCBtZXNzYWdlID0gZm9ybWF0dGVyLmZvcm1hdCh0YWdMYXlvdXRfLCBsb2dnaW5nRXZlbnQpO1xuXG5cdFx0aWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5FUlJPUikge1xuXHRcdFx0Y29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0XHR9IGVsc2UgaWYgKGxvZ2dpbmdFdmVudC5sZXZlbCA9PSBMb2dMZXZlbC5XQVJOKSB7XG5cdFx0XHRjb25zb2xlLndhcm4obWVzc2FnZSk7XG5cdFx0fSBlbHNlIGlmIChsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuSU5GTykge1xuXHRcdFx0Y29uc29sZS5pbmZvKG1lc3NhZ2UpO1xuXHRcdH0gZWxzZSBpZiAobG9nZ2luZ0V2ZW50LmxldmVsID09IExvZ0xldmVsLkRFQlVHIHx8XG5cdFx0XHRsb2dnaW5nRXZlbnQubGV2ZWwgPT0gTG9nTGV2ZWwuVFJBQ0UpIHtcblx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHRcdH1cblxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGxvZ2dlclxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHJldHVybiB7c3RyaW5nfVxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0TmFtZSgpIHtcblx0XHRyZXR1cm4gJ0NvbnNvbGVBcHBlbmRlcic7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoZSBhcHBlbmRlciBpcyBhY3RpdmUsIGVsc2UgZmFsc2Vcblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsZXZlbFxuXHQgKlxuXHQgKiBAcmV0dXJuIHtib29sZWFufVxuXHQgKi9cblx0ZnVuY3Rpb24gaXNBY3RpdmUobGV2ZWwpIHtcblx0XHRyZXR1cm4gKGxldmVsIDw9IGxvZ0xldmVsXyk7XG5cdH1cblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEByZXR1cm4ge251bWJlcn1cblx0ICovXG5cdGZ1bmN0aW9uIGdldExvZ0xldmVsKCkge1xuXHRcdHJldHVybiBsb2dMZXZlbF87XG5cdH1cblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsb2dMZXZlbFxuXHQgKi9cblx0ZnVuY3Rpb24gc2V0TG9nTGV2ZWwobG9nTGV2ZWwpIHtcblx0XHRsb2dMZXZlbF8gPSBsb2dMZXZlbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRhZ0xheW91dFxuXHQgKi9cblx0ZnVuY3Rpb24gc2V0VGFnTGF5b3V0KHRhZ0xheW91dCkge1xuXHRcdHRhZ0xheW91dF8gPSB0YWdMYXlvdXQ7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGFwcGVuZCA6IGFwcGVuZCxcblx0XHRnZXROYW1lIDogZ2V0TmFtZSxcblx0XHRpc0FjdGl2ZSA6IGlzQWN0aXZlLFxuXHRcdGdldExvZ0xldmVsIDogZ2V0TG9nTGV2ZWwsXG5cdFx0c2V0TG9nTGV2ZWwgOiBzZXRMb2dMZXZlbCxcblx0XHRzZXRUYWdMYXlvdXQgOiBzZXRUYWdMYXlvdXRcblx0fTtcblxufVxuIl19


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

	    log4js2.push(message);
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
	//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBlbmRlcnMvc3RvcmFnZUFwcGVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7NkJBTzBCLG1CQUFtQjs7SUFBakMsUUFBUTs7eUJBQ08sY0FBYzs7SUFBN0IsU0FBUzs7QUFFZCxTQUFTLGVBQWUsR0FBRzs7O0FBR2hDLE1BQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsTUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7Ozs7O0FBTTlCLFdBQVMsSUFBSSxHQUFHO0FBQ2Qsa0JBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0dBQ3ZDOzs7Ozs7O0FBT0QsV0FBUyxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQzVCLFFBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUV6RCxRQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osUUFBSTtBQUNGLGFBQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDL0QsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQU8sR0FBRyxFQUFFLENBQUM7S0FDZDs7QUFFRCxXQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RCLGtCQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7R0FFNUQ7Ozs7Ozs7OztBQVNELFdBQVMsT0FBTyxHQUFHO0FBQ2pCLFdBQU8saUJBQWlCLENBQUM7R0FDMUI7Ozs7Ozs7Ozs7O0FBV0QsV0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3ZCLFdBQVEsS0FBSyxJQUFJLFNBQVMsQ0FBRTtHQUM3Qjs7Ozs7OztBQU9ELFdBQVMsV0FBVyxHQUFHO0FBQ3JCLFdBQU8sU0FBUyxDQUFDO0dBQ2xCOzs7Ozs7O0FBT0QsV0FBUyxXQUFXLENBQUMsUUFBUSxFQUFFO0FBQzdCLGFBQVMsR0FBRyxRQUFRLENBQUM7R0FDdEI7Ozs7Ozs7QUFPRCxXQUFTLFlBQVksQ0FBQyxTQUFTLEVBQUU7QUFDL0IsY0FBVSxHQUFHLFNBQVMsQ0FBQztHQUN4Qjs7QUFFRCxTQUFPO0FBQ0wsVUFBTSxFQUFHLE1BQU07QUFDZixXQUFPLEVBQUcsT0FBTztBQUNqQixZQUFRLEVBQUcsUUFBUTtBQUNuQixlQUFXLEVBQUcsV0FBVztBQUN6QixlQUFXLEVBQUcsV0FBVztBQUN6QixnQkFBWSxFQUFHLFlBQVk7QUFDM0IsUUFBSSxFQUFHLElBQUk7R0FDWixDQUFDO0NBRUgiLCJmaWxlIjoic3RvcmFnZUFwcGVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsb2c0anMgPGh0dHBzOi8vZ2l0aHViLmNvbS9tYXR0aWE4NS9sb2c0anMyPlxuICpcbiAqIENvcHlyaWdodCAyMDE2LXByZXNlbnQgTWF0dGlhIFJvc2kgPGh0dHA6Ly9jdW5hZS5jb20+XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBMb2dMZXZlbCBmcm9tICcuLi9jb25zdC9sb2dMZXZlbCc7XG5pbXBvcnQgKiBhcyBmb3JtYXR0ZXIgZnJvbSAnLi4vZm9ybWF0dGVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIFN0b3JhZ2VBcHBlbmRlcigpIHtcblxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgbGV0IHRhZ0xheW91dF8gPSAnJW0nO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgbGV0IGxvZ0xldmVsXyA9IExvZ0xldmVsLklORk87XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdsb2c0anMyJywgW10pO1xuICB9XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtMT0dfRVZFTlR9IGxvZ2dpbmdFdmVudFxuICAgKi9cblxuICBmdW5jdGlvbiBhcHBlbmQobG9nZ2luZ0V2ZW50KSB7XG4gICAgbGV0IG1lc3NhZ2UgPSBmb3JtYXR0ZXIuZm9ybWF0KHRhZ0xheW91dF8sIGxvZ2dpbmdFdmVudCk7XG5cbiAgICBsZXQgbG9nNGpzMjtcbiAgICB0cnkge1xuICAgICAgbG9nNGpzMiA9IEpTT04ucGFyc2Uoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnbG9nNGpzMicpKSB8fCBbXTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2c0anMyID0gW107XG4gICAgfVxuXG4gICAgbG9nNGpzMi5wdXNoKG1lc3NhZ2UpO1xuICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2xvZzRqczInLCBKU09OLnN0cmluZ2lmeShsb2c0anMyKSk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBuYW1lIG9mIHRoZSBsb2dnZXJcbiAgICpcbiAgICogQGZ1bmN0aW9uXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGZ1bmN0aW9uIGdldE5hbWUoKSB7XG4gICAgcmV0dXJuICdTdG9yYWdlQXBwZW5kZXInO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYXBwZW5kZXIgaXMgYWN0aXZlLCBlbHNlIGZhbHNlXG4gICAqXG4gICAqIEBmdW5jdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxcbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlzQWN0aXZlKGxldmVsKSB7XG4gICAgcmV0dXJuIChsZXZlbCA8PSBsb2dMZXZlbF8pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRMb2dMZXZlbCgpIHtcbiAgICByZXR1cm4gbG9nTGV2ZWxfO1xuICB9XG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbG9nTGV2ZWxcbiAgICovXG4gIGZ1bmN0aW9uIHNldExvZ0xldmVsKGxvZ0xldmVsKSB7XG4gICAgbG9nTGV2ZWxfID0gbG9nTGV2ZWw7XG4gIH1cblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdMYXlvdXRcbiAgICovXG4gIGZ1bmN0aW9uIHNldFRhZ0xheW91dCh0YWdMYXlvdXQpIHtcbiAgICB0YWdMYXlvdXRfID0gdGFnTGF5b3V0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhcHBlbmQgOiBhcHBlbmQsXG4gICAgZ2V0TmFtZSA6IGdldE5hbWUsXG4gICAgaXNBY3RpdmUgOiBpc0FjdGl2ZSxcbiAgICBnZXRMb2dMZXZlbCA6IGdldExvZ0xldmVsLFxuICAgIHNldExvZ0xldmVsIDogc2V0TG9nTGV2ZWwsXG4gICAgc2V0VGFnTGF5b3V0IDogc2V0VGFnTGF5b3V0LFxuICAgIGluaXQgOiBpbml0XG4gIH07XG5cbn1cbiJdfQ==


/***/ }
/******/ ])
});
;