const path = require('path');

module.exports = {
  entry: [
    './src/cloud-functions.ts'
  ],
  externals : {
    '@stackchat/dynamic-content-toolkit': '@stackchat/dynamic-content-toolkit',
    'node-fetch': 'node-fetch'
  },
  mode: 'production',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/g
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.json' ]
  },
  target: 'node',
  output: {
    libraryTarget: 'this',
    filename: 'cloud-functions.js',
    path: path.resolve(__dirname, 'dist')
  }
};
