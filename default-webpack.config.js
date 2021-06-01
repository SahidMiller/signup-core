const TerserPlugin = require("terser-webpack-plugin");
const { WebpackPluginServe } = require('webpack-plugin-serve')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const path = require('path')

require('dotenv').config({ 
  path: path.join(__dirname, "/.env") 
})

const isDevEnv = process.env.NODE_ENV === "development"

module.exports = mergeWithCommonConfig

function mergeWithCommonConfig(config, { port, static, analyzerPort } = {}) {
  
  //Use env variable to determine running webpack-serve-plugin
  const serveApp = (isDevEnv || process.env.FORCE_SERVE_APP === "true") && process.env.FORCE_SERVE_APP !== "false"
  
  const serveEntry = serveApp && port ? { 
    serve: "webpack-plugin-serve/client" 
  } : {}

  const servePlugin = serveApp && port ? [
    new WebpackPluginServe({ port, static, historyFallback: true })
  ] : []

  return merge(config, {
    entry: {
      ...serveEntry
    },
    resolve: {
      fallback: {
        tls: false,
        net: false,
        dgram: false
      },
      alias: {
        react: "preact/compat",
        "react-dom": "preact/compat",
        // Not necessary unless you consume a module using `createClass`
        "create-react-class": "preact/compat/lib/create-react-class",
        // Not necessary unless you consume a module requiring `react-dom-factories`
        "react-dom-factories": "preact/compat/lib/react-dom-factories",
      },
    },
    mode: process.env.NODE_ENV,
    watch: isDevEnv,
    devtool: "source-map",
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_fnames: true,
            safari10: true,
          },
        }),
      ],
    },
    stats: {
      warnings: isDevEnv,
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|svg|gif)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                outputPath: "./images",
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      ...servePlugin,
      new webpack.ProvidePlugin({
        process: 'process',
        Buffer: ['buffer', 'Buffer'],
      }),
      new NodePolyfillPlugin()
    ]
  })
}