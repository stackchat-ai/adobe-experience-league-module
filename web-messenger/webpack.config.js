const path = require('path');

module.exports = {
  entry: [
    './src/index.ts'
  ],
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        enforce: "pre",
        test: /\.js$/,
        use: "source-map-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  target: 'web',
  devtool: 'source-map',
  output: {
    libraryTarget: 'umd',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    fs: 'empty',
    module: 'empty'
  }
};
