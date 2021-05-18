const path = require("path");
const merge = require('../../default-webpack.config.js')

module.exports = merge({
  entry: {
    provider: "./src/provider.js",
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
          },
        },
      },
    ],
  }
}, { port: 5000, static: "./" });
