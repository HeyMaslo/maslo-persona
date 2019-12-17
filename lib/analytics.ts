import logger from './utils/logger';
import { States } from './states';

export type AnalyticsConfig = {
  dataSource: string,
  appName: string,
  ignoreMood?: boolean,
  ignoreState?: boolean,
};

export abstract class AnalyticsManager {

  constructor(protected readonly config?: AnalyticsConfig) {
    logger.log('[ANALYTICS] Init', config);
  }

  abstract init(): void;

  protected abstract doTrack(name: string, ...values: string[]): void;

  trackEvent(name: string, ...values: string[]) {
    logger.log('[ANALYTICS] track event', name, ...values);
    this.doTrack(name, ...values);
  }

  /** @param {string} state */
  trackStateChange(state: string) {
    if (this.config.ignoreState) {
      return;
    }

    // Skipping idle state
    if (state !== States.Idle) {
      this.trackEvent('setstate', state);
    }
  }

  trackMoodChange(mood: string, value: number) {
    if (this.config.ignoreMood) {
      return;
    }
    // ignore zero or undefined values
    if (value) {
      this.trackEvent('setmood', mood, `${value}`);
    }
  }
}

export class LoggerAnalyticsManager extends AnalyticsManager {
  init() {
    // do nothing!
  }

  doTrack() {
    // do nothing
  }
}