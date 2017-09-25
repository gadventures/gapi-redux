/**
 * Created by smalekpour on 2017-05-17.

 Webpack configuration for local development - used only for `npm start`
 */
const path               = require('path'),
      webpack            = require('webpack'),
      merge              = require('webpack-merge'),
      validate           = require('webpack-validator'),
      HtmlWebpackPlugin  = require('html-webpack-plugin'),
      cleanWebpackPlugin = require('clean-webpack-plugin');

const PATHS = {
  src:     path.join(__dirname, 'src'),
  main:     path.join(__dirname, 'src', 'example.js'),
  build:    path.join(__dirname, 'build')
};

const CONFIG = {

  base: {
    entry: {
      'gapi-redux': ['babel-polyfill', PATHS.main]
    },
    cache: true,
    plugins : [ new HtmlWebpackPlugin ({ title : 'Temp' }) ]
  },

  getOutput: {
    output: {
      path: PATHS.build,
      filename: '[name].js',
      sourceMapFilename : '[file].map',
      publicPath: '/'
    }
  },

  scripts: {
    module: {
      loaders: [
        {
          test: /\.js$/,
          include: PATHS.src,
          loaders: ['babel']
        }
      ]
    }
  },

  getGlobals: {
    plugins: [
      new webpack.DefinePlugin({
        conf: {
          api: {
            url: 'https://rest.gadventures.com',
            key: 'xxx'
          }
        }
      })
    ]
  },

  cleanBuild: {
    plugins: [
      new cleanWebpackPlugin([PATHS.build], {root: process.cwd()})
    ]
  },

  devServer: {
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      stats: 'errors-only',
      port: 5555
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({ multiStep: true })
    ]
  }
};

const getConfig = function(){
  const cycle = process.env.npm_lifecycle_event;
  // Development: Called on `webpack-dev-server`
  return merge(
    CONFIG.base,
    CONFIG.getOutput,
    CONFIG.getGlobals,
    CONFIG.scripts,
    CONFIG.devServer,
    {devtool: 'eval-source-map'}
  );
};

module.exports = validate(getConfig());
