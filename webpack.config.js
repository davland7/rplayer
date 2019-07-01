const TerserPlugin = require('terser-webpack-plugin');

const path = require('path');

module.exports = {
    devServer: {
      contentBase: path.join(__dirname, ''),
      compress: true,
      port: 9999,
      lazy: true
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
        minimizer: [new TerserPlugin({
            cache: true,
            parallel: true,
            terserOptions: {
                output: {
                    comments: false
                }
            }
        })]
    }
};
