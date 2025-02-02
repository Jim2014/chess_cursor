const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Modify output filename patterns
      webpackConfig.output.filename = 'main.js';
      webpackConfig.output.chunkFilename = '[name].js';

      // Modify CSS filename pattern
      const miniCssExtractPlugin = webpackConfig.plugins.find(
        (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
      );
      if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.filename = 'main.css';
      }

      // Modify media/asset filename patterns
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOf) => {
            if (oneOf.type === 'asset/resource') {
              oneOf.generator = {
                filename: '[name][ext]'
              };
            }
          });
        }
      });

      return webpackConfig;
    }
  }
}; 