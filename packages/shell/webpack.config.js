const path = require("path");
const merge = require("../../default-webpack.config.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DagEntryPlugin = require("webpack-dag-entry-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;

module.exports = merge(
  {
    entry: {
      shell: path.resolve(__dirname, "./src/index.js"),
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
                    pragma: "h",
                    pragmaFrag: "Fragment",
                  },
                ],
                [
                  "transform-inline-environment-variables",
                  {
                    include: [
                      "NODE_ENV",
                      "IPFS_GATEWAY_HOST",
                      "SIGNUP_WALLET_ENTRY_HOST",
                      "SIGNUP_WALLET_ENTRY_PATH",
                      "SIGNUP_WALLET_IPNS",
                      "WALLET_HD_PATH",
                      "BITCOIN_NETWORK",
                      "FORCE_IPFS",
                    ],
                  },
                ],
              ],
            },
          },
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin({}),
      new ModuleFederationPlugin({
        name: "signupApp",
        filename: "js/pluginEntry.js",
        exposes: {
          "./Article": path.join(
            __dirname,
            "./src/components/common/Article.js"
          ),
          "./Box": path.join(__dirname, "./src/components/common/Box.js"),
          "./Button": path.join(__dirname, "./src/components/common/Button.js"),
          "./Checkbox": path.join(
            __dirname,
            "./src/components/common/Checkbox.js"
          ),
          "./Heading": path.join(
            __dirname,
            "./src/components/common/Heading.js"
          ),
          "./Input": path.join(__dirname, "./src/components/common/Input.js"),
          "./Loading": path.join(
            __dirname,
            "./src/components/common/Loading.js"
          ),
          "./Logo": path.join(__dirname, "./src/components/common/Logo.js"),
          "./ReloadButton": path.join(
            __dirname,
            "./src/components/common/ReloadButton.js"
          ),
          "./Tabs": path.join(__dirname, "./src/components/common/Tabs.js"),
          "./TextArea": path.join(
            __dirname,
            "./src/components/common/TextArea.js"
          ),
          "./RecoveryPhrases": path.join(
            __dirname,
            "./src/components/common/RecoveryPhrases.js"
          ),
          "./ConfirmRecoverPhrases": path.join(
            __dirname,
            "./src/components/common/ConfirmRecoveryPhrases.js"
          ),
          "./Login": path.join(__dirname, "./src/components/common/Login.js"),
        },
        shared: {
          "bitbox-sdk": {
            import: "bitbox-sdk",
            singleton: true,
          },
          slpjs: {
            import: "slpjs",
            singleton: true,
          },
          preact: {
            import: "preact",
            singleton: true,
          },
          "preact-compat": {
            import: "preact-compat",
            singleton: true,
          },
          "preact-router": {
            import: "preact-router",
            singleton: true,
          },
          "react-toastify": {
            import: "react-toastify",
            singleton: true,
          },
        },
      }),
      new DagEntryPlugin({
        path: path.resolve(__dirname, "./public"),
        filename: "../dist/dagEntry.js",
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "./views/index.html"),
        filename: "index.html",
        publicPath: "./",
        inlineSource: ".(css)$",
        chunks: ["shell"],
      }),
    ],
  },
  {
    port: 5050,
    static: path.join(__dirname, "./public"),
  }
);
