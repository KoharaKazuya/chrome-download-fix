const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  context: path.resolve(__dirname, "src"),

  entry: {
    background: "./background.js",
    options: "./options.js"
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin(["manifest.json", "*.html", "icons/*"])
  ]
};
