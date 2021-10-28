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
    popup: join(__dirname, 'src/popup/popup.ts')
  },
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
};

