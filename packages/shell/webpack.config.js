const path = require("path");
const merge = require('../../default-webpack.config.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DagEntryPlugin = require("webpack-dag-entry-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge({
  entry: {
    shell: path.resolve(__dirname, "./src/index.js"),
    worker: path.resolve(__dirname, "./src/worker/worker.js"),
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "js/[name].lib.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: path.resolve(__dirname, "src"),
        exclude: path.resolve(__dirname, "src/worker"),
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "transform-inline-environment-variables",
                {
                  "include": ["NODE_ENV", "IPFS_GATEWAY_HOST", "SIGNUP_WALLET_ENTRY_HOST", "SIGNUP_WALLET_ENTRY_PATH", "SIGNUP_WALLET_IPNS", "FORCE_IPFS"]
                }
              ]
            ],
          },
        },
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({}),
    new DagEntryPlugin({
      path: path.resolve(__dirname, "./public"),
      filename: "../dist/dagEntry.js"
    }),
    new HtmlWebpackPlugin({
      template:  path.join(__dirname, './views/index.html'),
      filename: 'index.html',
      publicPath: './',
      inlineSource: '.(css)$',
      chunks:["shell"]
    }),
  ]
}, { 
  port: 5050, 
  static: path.join(__dirname, "./public") 
})