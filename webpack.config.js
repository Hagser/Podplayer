const path = require('path')

module.exports = {
  mode: 'development',
  entry:'./src/',
  resolve: {
      extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  output:{
    // options related to how webpack emits results
    path:path.resolve(__dirname, "dist"), // string (default)
    // the target directory for all output files
    // must be an absolute path (use the Node.js path module)
    filename: "main.js", // string (default)
    // the filename template for entry chunks
    //publicPath: "/assets/", // string},
  },
}