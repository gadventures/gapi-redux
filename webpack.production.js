const path         = require('path'),
      webpack      = require('webpack'),
      CleanWebpack = require('clean-webpack-plugin');

const PATHS = {
  src:   path.join(__dirname, 'src'),
  main:  path.join(__dirname, 'src', 'index.js'),
  build: path.join(__dirname, 'build')
};

module.exports = {
  entry: PATHS.src,
  output: {
    path: PATHS.build,
    filename: 'gapi-redux.js',
    sourceMapFilename: '[file].map',
    library: 'gapi-redux',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  externals: {
    'gapi-js': 'gapi-js',
    'redux': 'redux',
    'redux-saga': 'redux-saga',
    'normalizr': 'normalizr',
    'denormalizr': 'denormalizr'
  },
  plugins: [
    new CleanWebpack([PATHS.build])
  ],
  devtool: 'source-map'
};
