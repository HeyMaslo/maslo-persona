/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const HtmlWebPackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const fs = require('fs');
const path = require('path');

/** @typedef {(import ('html-webpack-plugin').Options)} HtmlWebPackPluginOptions */

/**
 * @typedef {Object} Plugin
 */


/**
 * @param {string} p relative path
 * @returns {string} absolute path
 */
function pathResolve(p) {
  return path.resolve(__dirname, p);
}

class HtmlBuilder {
  constructor(minify = false) {
    this.htmlMinifyOptions = minify
            && {
              removeAttributeQuotes: true,
              collapseWhitespace: false,
              html5: true,
              minifyCSS: true,
              removeComments: true,
              removeEmptyAttributes: true,
            };
  }

  /**
     * @param {string} outputName
     * @param {string} templatePath
     * @param {Partial<HtmlWebPackPluginOptions>} options
     * @returns {HtmlWebPackPlugin} */
  createHtmlPlugin(outputName, templatePath, options = {}) {
    return new HtmlWebPackPlugin({
      filename: outputName,
      cache: false,
      template: templatePath,
      minify: this.htmlMinifyOptions,
      inject: false,
      ...options,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  createHtmlPugPlugin() {
    return new HtmlWebpackPugPlugin();
  }

  /** @returns {HtmlWebPackPlugin[]}
     */
  generateHtmlPlugins(templateDir = './app/html/') {
    const templateFiles = fs.readdirSync(pathResolve(templateDir));

    return templateFiles
      .map((item) => {
        const parts = item.split('.');

        if (parts.pop() !== 'html')
          return null;
        const name = parts.join().toLowerCase();

        const outputName = name === 'index' ? item : `${name}/index.html`;
        const templatePath = pathResolve(`${templateDir}/${item}`);

        return this.createHtmlPlugin(outputName, templatePath);
      })
      .filter(p => p);
  }
}

/**
 * @param {({name:string,plugin:Plugin,allowedEnv:string,enabled:boolean}|Plugin)[]} plugins
 * @returns {Plugin[]}
 */
function wrapPlugins(plugins) {
  return plugins.filter((pp) => {
    if (!pp.name || !pp.plugin) {
      return true;
    }

    if (process.argv.indexOf(`--disable-${pp.name}-plugin`) >= 0) {
      console.log(`[Webpack Config] Skipping plugin '${pp.name}' because it was explicitly disabled by cl args.`);
      return false;
    }

    if (pp.allowedEnv && process.env.NODE_ENV !== pp.allowedEnv) {
      console.log(`[Webpack Config] Skipping plugin '${pp.name}' because it was disabled by NODE_ENV. `
        + `Allowed = ${pp.allowedEnv}, current = ${process.env.NODE_ENV}`);
      return false;
    }

    if (pp.enabled !== undefined && typeof pp.enabled === 'boolean') {
      if (!pp.enabled) {
        console.log(`[Webpack Config] Skipping plugin '${pp.name}' because it was explicitly disabled by option.`);
      }

      return pp.enabled;
    }

    return true;
  }).map(pp => (pp.name ? pp.plugin : pp));
}

module.exports = {
  HtmlBuilder,
  pathResolve,

  wrapPlugins,
};
