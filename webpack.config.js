// variables
const path = require('path');
const webpack = require('webpack');

// additional plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminWebpackPlugin = require('imagemin-webpack-plugin').default;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const isProduction = (process.env.NODE_ENV === 'production');


// module settings
module.exports = {
  // базовый путь к проекту
  context: path.resolve(__dirname, 'src'),

  // точки входа JS
  entry: {
    // основной файл приложения
    app: [
      './js/script.js',
      './css/style.css',
    ],
  },

  // путь для собранных файлов
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '../',
  },

  devtool: (isProduction) ? '' : 'inline-source-map',

  module: {
    rules: [
      // css
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },

  plugins: [
    new MiniCssExtractPlugin(
      {
        filename: 'css/[name].css',
        chunkFilename: '[id].css',
      },
    ),
    new TerserJSPlugin({
      parallel: true,
      terserOptions: {
        ecma: 6,
      },
    }),
  ],

};

// production

if (isProduction) {
  module.exports.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  );
}
