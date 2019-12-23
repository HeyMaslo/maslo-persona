/* eslint-disable class-methods-use-this */
import { AnalyticsManager } from '../lib/analytics';

const TRACKING_ID = 'UA-106568684-2';

let inited = false;

declare global {
  export interface Window {
    dataLayer: any[];
    gtag: (...arg: any[]) => void;
  }
}

function gtag(...args: any[]) {
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
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', TRACKING_ID);
}

export class AnalyticsManagerGA extends AnalyticsManager {

  private _category: string;

  init() {
    initGA();

    this._category = `${this.config.appName}|${this.config.dataSource}`;
  }

  doTrack(name: string, label: string = null, value: string = null) {
    const opts: any = {
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
