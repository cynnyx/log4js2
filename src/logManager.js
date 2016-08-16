/**
 * log4js <https://github.com/anigenero/log4js>
 *
 * Copyright 2016 Robin Schultz <http://cunae.com>
 * Released under the MIT License
 */

import * as formatter from './formatter';
import { Logger } from './logger/logger';
import * as LogLevel from './const/logLevel';

import * as consoleAppender from './appenders/consoleAppender';
import * as storageAppender from './appenders/storageAppender';
import * as logglyAppender from './appenders/logglyAppender';

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
   'logglyAppender':  logglyAppender.LogglyAppender
};

/** @const */
const DEFAULT_CONFIG = {
	tagLayout : '%d{HH:mm:ss} [%level] %logger - %message',
	appenders : [ 'consoleAppender' ],
	loggers : [ {
		logLevel : LogLevel.INFO
	} ],
	allowAppenderInjection : true
};

/** @type {Array.<APPENDER>} */
var appenders_ = [];
/** @type {?CONFIG_PARAMS} */
var configuration_ = null;
/** @type {boolean} */
var finalized_ = false;
/** @type {Object} */
var loggers_ = {};

export {LogLevel};

/**
 * Configures the logger
 *
 * @function
 *
 * @params {CONFIG_PARAMS} config
 */
export function configure(config) {

	if (finalized_) {
		append(LogLevel.ERROR, 'Could not configure. LogUtility already in use');
		return;
	}

  configureAppenders_(config.appenders);

  configureLoggers_(config.loggers);

  configureTagLayout_(config.tagLayout);

  configuration_ = config;


}

var configureAppenders_ = function (appenders) {

	if (appenders instanceof Array) {
		var count = appenders.length;
    for (let i = 0; i < count; i++) {
      addAppender_(appenders[i]);
		}
	}
};

var configureTagLayout_ = function(tagLayout) {
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

var configureLoggers_ = function (loggers) {

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


var getLoggers_ = function (logLevel) {

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

var addAppender_ = function(appender) {
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
export function addAppender(appender) {
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
var validateAppender_ = function (appender) {

	if (appender == null || typeof appender !== 'function') {
		throw new Error('Invalid appender: not an function');
	}

	var appenderObj = appender();

	var appenderMethods = ['append', 'getName', 'isActive', 'setLogLevel', 'setTagLayout'];
	for (var key in appenderMethods) {
		if (appenderMethods.hasOwnProperty(key) && appenderObj[appenderMethods[key]] == undefined ||
			typeof appenderObj[appenderMethods[key]] != 'function') {
			throw new Error('Invalid appender: missing method: ' + appenderMethods[key]);
		}
	}

	if (configuration_ instanceof Object && configuration_.tagLayout) {
		appenderObj.setTagLayout(configuration_.tagLayout);
	}

  if(typeof appenderObj['init'] == 'function') {
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
var validateLevel_ = function (level) {

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
export function getLogger(context) {

	// we need to initialize if we haven't
	if (configuration_ === null) {
		configure(DEFAULT_CONFIG);
	}

	return new Logger(context, {
		append: append
	});

}

/**
 * Sets the log level for all loggers, or specified logger
 * @param {number} logLevel
 * @param {string=} logger
 */
export function setLogLevel(logLevel, logger) {

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
