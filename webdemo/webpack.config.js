/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').default;
const MinifyPlugin = require('babel-minify-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const helpers = require('./webpack.helpers');

// eslint-disable-next-line prefer-destructuring
const pathResolve = helpers.pathResolve;

module.exports = (env) => {
  // eslint-disable-next-line no-param-reassign
  env = env || {};

  const noClear = env.noclear !== undefined;
  const fullMinify = !!env.fullminify;
  const isProd = process.env.NODE_ENV === 'production';

  const publicPath = env.public_path_override || '/';
  const outputPath = pathResolve('./dist');

  console.log('Webpack config options:', {
    publicPath,
    outputPath,
    noClear,
    fullMinify,
    isProd,
  });

  const htmlBuilder = new helpers.HtmlBuilder(fullMinify);

  return {
    entry: {
      app: './index.js',
    },
    output: {
      publicPath,
      path: outputPath,
      filename: isProd ? '[hash:6].js' : '[name].js',
      chunkFilename: isProd ? '[chunkhash:6].[id].js' : '[name].[id].js',
    },
    resolve: {
      modules: [pathResolve('../lib'), pathResolve('../web'), 'node_modules'],
      alias: {
      },
    },
    module: {
      rules: [
        {
          test: /\.(html|ejs)$/,
          loader: 'underscore-template-loader',
          query: {
            attributes: [
            ],
          },
        },
        {
          test: /\.(pug)$/,
          loader: 'pug-loader',
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
          },
          exclude: [/node_modules/, /dist/],
        },
        {
          test: /favicon\.ico/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
        {
          test: /\.(png|jpg|gif|webp|svg|ico)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'assets/img',
              },
            },
          ],
        },
        {
          test: /\.(mp3)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'assets/audio',
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[hash].[ext]',
              outputPath: 'assets/fonts',
            },
          }],
        },
        {
          test: /\.(webm|mp4|ogv)$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/video',
            },
          }],
        },
        {
          test: /\.json$/,
          type: 'javascript/auto',
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/bodymovin',
            },
          }],
        },
        {
          test: /\.css$|\.sass$|\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader', 'postcss-loader', 'sass-loader',
          ],
        },
        {
          test: /\.styl$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader', 'postcss-loader', 'stylus-loader',
          ],
        },
        {
          test: /\.glsl$/,
          use: 'raw-loader',
        },
        {
          test: /browserconfig\.xml$|\.webmanifest/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets',
            },
          }],
        },
      ],
    },
    plugins: helpers.wrapPlugins([
      {
        name: 'clean',
        plugin: new CleanWebpackPlugin(),
        enabled: !noClear,
      },

      new webpack.DefinePlugin({
        process: {
          env: {
            NODE_ENV: JSON.stringify(
              process.env.NODE_ENV || 'development',
            ),
            HOSTNAME: JSON.stringify(
              process.env.HOSTNAME || 'http://localhost',
            ),
            PUBLIC_PATH_OVERRIDE: JSON.stringify(
              publicPath,
            ),
          },
        },
      }),

      htmlBuilder.createHtmlPlugin('index.html', './views/main.pug', { inject: true }),
      htmlBuilder.createHtmlPugPlugin(),

      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[hash:6].css' : '[name].css',
        chunkFilename: isProd ? '[hash:6].[id].css' : '[name].[id].css',
      }),

      {
        name: 'minify',
        plugin: new MinifyPlugin({}, { comments: false }),
        enabled: fullMinify,
      },

      {
        name: 'minifycss',
        plugin: new OptimizeCssAssetsPlugin(),
        enabled: fullMinify,
      },
    ]),
    devServer: {
      contentBase: outputPath,
      compress: true,
      port: 8080,
      staticOptions: {
        extensions: [
          'html',
        ],
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
};
