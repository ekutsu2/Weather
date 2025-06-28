const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js", // Entry point for the application
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true, // Cleans old files in 'dist' before each build
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Transpile JS and JSX files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/, // Enable CSS imports
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/, // Handle image imports
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // Injects bundled JS into HTML
    }) 
  ],
  resolve: {
    extensions: [".js", ".jsx"], // Allow importing files without specifying extensions
  },
  devServer: {
    static: path.resolve(__dirname, "dist"), // Serve files from 'dist'
    compress: true,
    port: 3000, // Set local dev server port
    hot: true, // Enable hot module replacement (HMR)
    open: true, // Open browser when server starts
  },
  mode: "development", // Set mode to 'development' (change to 'production' for final build)
};