const TerserPlugin = require('terser-webpack-plugin');

const path = require('path');

module.exports = {
    devServer: {
      static: {
        directory: path.join(__dirname, ''),
      },
      compress: true,
      port: 9999
    },
    performance : {
        hints : false
    },
    entry: './src/index.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'rplayer.js',
        publicPath: '/dist/',
        library: 'rPlayer',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            parallel: true,
            terserOptions: {
                output: {
                    comments: false
                }
            }
        })]
    }
};
