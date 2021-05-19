const path = require("path");
const webpack = require('webpack')
const { ModuleFederationPlugin } = webpack.container;
const merge = require('../../default-webpack.config.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DagEntryPlugin = require('webpack-dag-entry-plugin')

module.exports = merge({
  entry: {
    core: path.resolve(__dirname, "./src/index.js")
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
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  "pragma": "h",
                  "pragmaFrag": "Fragment"
                }
              ], 
              [
                "transform-inline-environment-variables",
                {
                  "include": ["NODE_ENV", "WALLET_HD_PATH", "BITCOIN_NETWORK", "FORCE_IPFS"]
                }
              ]
            ]
          },
        },
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({}),
    new DagEntryPlugin({
      path: path.join(__dirname, "./public"),
      glob: '**/*',
      filename: '../dist/dagEntry.js',
    }),
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