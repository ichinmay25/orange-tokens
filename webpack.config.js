const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    code: './src/code.ts',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/ui.html', to: 'ui.html' },
        { from: './src/oauth.html', to: 'oauth.html' }
      ],
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
});
