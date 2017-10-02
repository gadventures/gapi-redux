const path               = require('path'),
      webpack            = require('webpack'),
      HtmlWebpackPlugin  = require('html-webpack-plugin');

const PATHS = {
  src:     path.join(__dirname, 'src'),
  main:     path.join(__dirname, 'src', 'example.js'),
  build:    path.join(__dirname, 'build')
};

module.exports = {
  entry: {
    'gapi-redux': ['babel-polyfill', PATHS.main]
  },
  output: {
    path: PATHS.build,
    filename: '[name].js',
    sourceMapFilename : '[file].map',
    publicPath: '/'
  },
  devtool: 'eval-source-map',
  cache: true,
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    stats: 'errors-only',
    port: 5555
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: PATHS.src,
        loaders: ['babel']
      }
    ]
  },
  plugins : [
    new HtmlWebpackPlugin ({ title  : 'Gapi-Redux' }),
    new webpack.HotModuleReplacementPlugin({ multiStep: true }),
  ]
};
