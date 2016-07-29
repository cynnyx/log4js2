/**
 * log4js <https://github.com/anigenero/log4js>
 *
 * Copyright 2016-present Robin Schultz <http://cunae.com>
 * Released under the MIT License
 */

import * as utility from '../utility';
import * as logLevel from '../const/logLevel';

export function Logger(context, appenderObj) {

	/** @typeof {number} */
	let relative_ = (new Date()).getTime();
	/** @typeof {number} */
	let logSequence_ = 1;

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
	let logContext_ = context;

	/**
	 * Logs an error event
	 */
	this.error = function() {
		appenderObj.append(constructLogEvent_(logLevel.ERROR, arguments));
	};

	/**
	 * Logs a warning
	 */
	this.warn = function() {
		appenderObj.append(constructLogEvent_(logLevel.WARN, arguments));
	};

	/**
	 * Logs an info level event
	 */
	this.info = function() {
		appenderObj.append(constructLogEvent_(logLevel.INFO, arguments));
	};

	/**
	 * Logs a debug event
	 */
	this.debug = function() {
		appenderObj.append(constructLogEvent_(logLevel.DEBUG, arguments));
	};

	/**
	 * Logs a trace event
	 */
	this.trace = function() {
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

		let logTime = new Date();
		let error = null;

		// this looks horrible, but this is the only way to catch the stack for IE to later parse the stack
		try {
			throw new Error();
		} catch (e) {
			error = e;
		}

		let loggingEvent = {
			date : logTime,
			error : null,
			logErrorStack : error,
			file : null,
			level : level,
			lineNumber : null,
			logger : logContext_,
      message : [],
      method : '',
			properties : undefined,
			relative : logTime.getTime() - relative_,
			sequence : logSequence_++
		};

		for (let i = 0; i < args.length; i++) {
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
