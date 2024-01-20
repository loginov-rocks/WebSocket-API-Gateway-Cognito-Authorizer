const path = require('path');

module.exports = {
  devtool: false,
  entry: './src/index.js',
  externalsType: 'node-commonjs',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
        use: 'babel-loader',
      },
    ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node',
};
