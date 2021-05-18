const path = require("path");
const webpack = require('webpack')
const { ModuleFederationPlugin } = webpack.container;
const merge = require('../../default-webpack.config.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = [merge({
  entry: {
    shell: "./src/index.js"
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
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template:  path.join(__dirname, './views/index.html'),
      filename: 'index.html',
      publicPath: './',
      inlineSource: '.(css)$',
      chunks:["shell"]
    }), 
    //http://localhost:5050/pluginEntry.js
    new ModuleFederationPlugin({
        name: "SignupCore",
        filename: "js/shellEntry.js"
    })
  ]
}, { 
  port: 5050, 
  static: path.join(__dirname, "./public") 
}), merge({
  entry: {
    worker: "./src/worker/worker.js"
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "js/[name].lib.js",
  }
})]