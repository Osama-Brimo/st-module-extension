const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

// An alternative way to import ST dependencies in a bundled UI extension:
// ST dependencies can be defined as externals to get the correct relative path inside the final bundle
// (i.e: Give me `import Foo from '../../../extensions.js'` rather than trying to actually resolve the dependencies inside `extensions.js`)
module.exports = {
  devtool: "source-map",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "st-module-extension.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      // TODO: add more aliases and paths to config later
      "@st-script": path.resolve(
        __dirname,
        "../../../../../script.js"
      ),
      "@st": path.resolve(__dirname, "../../../"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            sourceType: "unambiguous",
          },
        },
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
  experiments: {
    outputModule: true,
  },
  externalsType: "module",
  externals: [
    // Consider any import aliased under '@st/*' external
    function ({ context, request }, callback) {
      const regex1 = /^@st\/(.+)$/;
      const match1 = request.match(regex1);
      if (match1) {
        // Extension required since this will be the string verbatim in the final bundle
        // TODO: This externalizes all ST imports as .js files. Add your own implementation if needed.
        return callback(null, `../../../../${match1[1]}.js`);
      }
      const regex2 = /^@st-script$/;
      const match2 = request.match(regex2);
      if (match2) {
        return callback(null, `../../../../../script.js`);
      }

      return callback();
    },
    {
        jQuery: 'window jQuery'
    }
  ],
  plugins: [],
};
