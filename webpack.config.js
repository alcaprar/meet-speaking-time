const { CheckerPlugin } = require('awesome-typescript-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { optimize } = require('webpack');
const { join } = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'inline-source-map',
  entry: {
    contentscript: join(__dirname, 'src/contentscript/contentscript.ts'),
    globalcontentscript: join(__dirname, 'src/contentscript/globalcontentscript.ts'),
    globalbackground: join(__dirname, 'src/background/globalbackground.ts'),
    popup: join(__dirname, 'src/popup/popup.ts'),
    options: join(__dirname, 'src/options/options.ts')
  },
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: 'awesome-typescript-loader?{configFileName: "tsconfig.json"}',
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new CheckerPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

