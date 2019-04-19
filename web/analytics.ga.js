/* eslint-disable class-methods-use-this */
import { AnalyticsManager } from '../lib/analytics';

/** @typedef {import ('../lib/analytics').AnalyticsConfig} AnalyticsConfigBase */

const TRACKING_ID = 'UA-106568684-2';

let inited = false;

function gtag() {
  if (window.dataLayer) {
    window.dataLayer.push(arguments);
  }
}

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
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', TRACKING_ID);
}

export class AnalyticsManagerGA extends AnalyticsManager {

  init() {
    initGA();

    this._category = `${this._config.appName}|${this._config.dataSource}`;
  }

  trackEvent(name, label = null, value = null) {
    const opts = {
      event_category: this._category,
    };

    if (label) {
      opts.event_label = label;
    }

    if (value) {
      opts.value = value;
    }

    gtag('event', name, opts);
  }
}
