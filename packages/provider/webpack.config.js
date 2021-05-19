const path = require("path");
const merge = require('../../default-webpack.config.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = merge({
  entry: {
    provider: path.resolve(__dirname, "./src/provider.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: "Signup",
    libraryTarget: "umd",
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
            plugins: [
              [
                "transform-inline-environment-variables",
                {
                  "include": ["NODE_ENV"]
                }
              ]
            ]
          },
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin({})]
}, { port: 5000, static: path.resolve(__dirname, "./") });
