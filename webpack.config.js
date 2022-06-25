const path = require('path');

module.exports = {
    devServer: {
        static: {
            directory: path.join(__dirname, '')
        },
        compress: true,
        port: 9999
    },
    mode: 'production',
    entry: './src/index.js',
    output: {
        library: {
            name: 'rPlayer',
            type: 'umd',
            export: 'default'
        },
        path: path.resolve('dist'),
        filename: 'rplayer.js'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /(node_modules)/,
            use: 'babel-loader'
        }],
    },
    resolve: {
        extensions: ['.js']
    }
};
