/* eslint-disable class-methods-use-this */
import { AnalyticsManager } from '../lib/analytics';
import logger from '../lib/utils/logger';

/** @typedef {import ('../lib/analytics').AnalyticsConfig} AnalyticsConfigBase */

const TRACKING_ID = 'UA-106568684-2';

let inited = false;

function initGA() {
  if (inited) {
    return;
  }

  inited = true;

  const el = document.createElement('script');
  el.async = true;
  el.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
  document.body.appendChild(el);

  /** @type {any[]} */
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', TRACKING_ID);
}

export class AnalyticsManagerGA extends AnalyticsManager {

  init() {
    initGA();
  }

  trackEvent(name, ...values) {
    if (window.gtag) {
      window.gtag('event', name);
    } else {
      logger.warn('[AnalyticsManagerGA] Not initialized!');
    }
  }
}
