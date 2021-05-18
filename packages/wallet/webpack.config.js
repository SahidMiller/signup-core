const path = require("path");
const webpack = require('webpack')
const { ModuleFederationPlugin } = webpack.container;
const merge = require('../../default-webpack.config.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge({
  entry: {
    core: "./src/index.js"
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
    new CleanWebpackPlugin({}),
    //http://localhost:5050/pluginEntry.js
    new ModuleFederationPlugin({
        name: "SignupCore",
        filename: "js/signupCoreEntry.js",
        exposes: {
            ".": path.join(__dirname, "./src/index.js"),
        }
    })
  ]
}, { 
  port: 5051, 
  static: path.join(__dirname, "./public") 
})