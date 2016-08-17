/**
 * log4js <https://github.com/mattia85/log4js2>
 *
 * Copyright 2016-present Mattia Rosi <http://cunae.com>
 * Released under the MIT License
 */

import * as LogLevel from '../const/logLevel';
import * as formatter from '../formatter';
let logglyUrl;

export function LogglyAppender() {

  /** @type {string} */
  let tagLayout_ = '%m';
  /** @type {number} */
  let logLevel_ = LogLevel.INFO;

  /**
   * @function
   *
   */
  function init(configuration_) {
    if (configuration_.logglyToken) {
      logglyUrl = 'https://logs-01.loggly.com/inputs/' + configuration_.logglyToken + '/tag/http/';
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
    let messages = formatter.format(tagLayout_, loggingEvent);
    try {
      let oReq = new XMLHttpRequest();
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
    return (level <= logLevel_);
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
    append : append,
    getName : getName,
    isActive : isActive,
    getLogLevel : getLogLevel,
    setLogLevel : setLogLevel,
    setTagLayout : setTagLayout,
    init : init
  };

}
