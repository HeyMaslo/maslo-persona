import logger from './utils/logger';
import { States } from './persona.states';

/** @typedef {{dataSource: string, appName: string, ignoreMood?: boolean, ignoreState?: boolean}} AnalyticsConfig */

/** @abstract */
export class AnalyticsManager {

  /** @param {AnalyticsConfig} config */
  constructor(config = null) {
    this._config = config;
    logger.log('[ANALYTICS] Init', config);
  }

  init() {
    // not implemented
  }

  /**
   * @param {string} name
   * @param {string[]} values
  */
  trackEvent(name, ...values) {
    // not implemented
    // Add config values ?
    logger.log('[ANALYTICS] track event', name, ...values);
  }

  /** @param {string} state */
  trackStateChange(state) {
    if (this._config.ignoreState) {
      return;
    }

    // Skipping idle state
    if (state !== States.Idle) {
      this.trackEvent('setstate', state);
    }
  }

  /**
   * @param {string} mood
   * @param {number} value
   * */
  trackMoodChange(mood, value) {
    if (this._config.ignoreMood) {
      return;
    }
    // ignore zero or undefined values
    if (value) {
      this.trackEvent('setmood', mood, `${value}`);
    }
  }
}
