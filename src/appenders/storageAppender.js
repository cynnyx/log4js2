/**
 * log4js <https://github.com/mattia85/log4js2>
 *
 * Copyright 2016-present Mattia Rosi <http://cunae.com>
 * Released under the MIT License
 */

import * as LogLevel from '../const/logLevel';
import * as formatter from '../formatter';

export function StorageAppender() {

  /** @type {string} */
  let tagLayout_ = '%m';
  /** @type {number} */
  let logLevel_ = LogLevel.INFO;

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
    let message = formatter.format(tagLayout_, loggingEvent);

    let log4js2;
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
