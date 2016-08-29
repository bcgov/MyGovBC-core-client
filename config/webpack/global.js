'use strict';

// Depends
var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer-core');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var NODE_ENV = process.env.NODE_ENV || "production";
var DEVELOPMENT = NODE_ENV === "production" ? false : true;
var stylesLoader = 'css-loader?sourceMap!postcss-loader!sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true';


module.exports = function (_path) {

  var webpackConfig = {
    // entry points
    entry: {
      vendor: _path + '/src/app/index.vendor.js',
      app: [_path + '/src/app/index.bootstrap.js'],
      polyfill: 'babel-polyfill'
    },

    debug: true,

    // output system
    output: {
      path: require("path").resolve("dist"),
      filename: '[name].js',
//      publicPath: '/',
    },
    // babel ignores this, but other webpack plugins should be ok
    resolveLoader: {
      root: path.join(__dirname, 'node_modules'),
      fallback: [path.join(__dirname, 'node_modules')]
    },

    // resolves modules
    resolve: {
      fallback: [path.join(_path, 'node_modules')],
      extensions: ['', '.js'],
      modulesDirectories: [path.join(_path, 'node_modules')],
      alias: {
        _appRoot: path.join(_path, 'src', 'app'),
        _images: path.join(_path, 'src', 'app', 'assets', 'images'),
        _stylesheets: path.join(_path, 'src', 'app', 'assets', 'styles'),
        _scripts: path.join(_path, 'src', 'app', 'assets', 'js')
      }
    },



    // modules resolvers
    module: {
      noParse: [],
      loaders: [{
        test: /\.html$/,
        loaders: [
          require.resolve('ngtemplate-loader') + '?relativeTo=' + _path,
          require.resolve('html-loader')
        ]
      }, {
        test: /\.js$/,
        loaders: [
          require.resolve('baggage-loader') + '?[file].html&[file].css'
        ]
      }, {
        test: /\.js$/,
        exclude: [
          new RegExp('node_modules\\' + path.sep + '(?!mygov(bc)?-).*', 'i')
        ],
        loaders: [
          require.resolve('ng-annotate-loader')
        ]
      }, {
        test: /\.js$/,
        exclude: [
          new RegExp('node_modules\\' + path.sep + '(?!mygov(bc)?-).*', 'i')
        ],
        loader: require.resolve('babel-loader'),
        query: {
          cacheDirectory: true,
          plugins: [require.resolve('babel-plugin-transform-runtime'), require.resolve('babel-plugin-add-module-exports')],
          presets: [require.resolve('babel-preset-angular'), require.resolve('babel-preset-es2017')]
        }
      }, {
        test: /\.css$/,
        loaders: [
          require.resolve('style-loader'),
          require.resolve('css-loader') + '?sourceMap',
          require.resolve('postcss-loader')
        ]
      }, {
        test: /\.less$/,
        loader: require.resolve('style-loader') + '!' + require.resolve('css-loader') + '!' + require.resolve ('postcss-loader') + '!' + require.resolve('less-loader')
      }, {
        test: /\.(scss|sass)$/,
        loader: DEVELOPMENT ? ('style-loader!' + stylesLoader) : ExtractTextPlugin.extract('style-loader', stylesLoader)
      }, {
        test: /\.(woff2|woff|ttf|eot|svg)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loaders: [
          require.resolve('url-loader') + '?name=assets/fonts/[name]_[hash].[ext]'
        ]
      }, {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
          require.resolve('url-loader') + '?name=assets/images/[name]_[hash].[ext]&limit=10000'
        ]
      }, {
        test: require.resolve("angular"),
        loaders: [
          require.resolve('expose-loader') + "?angular"
        ]
      }, {
        test: require.resolve("jquery"),
        loaders: [
          require.resolve('expose-loader') + "?$",
          require.resolve('expose-loader') + "?jQuery"
        ]
      }
      ]
    },

    // post css
    postcss: [autoprefixer({browsers: ['last 5 versions']})],

    // load plugins
    plugins: [
      new webpack.DefinePlugin({
        'NODE_ENV': JSON.stringify(NODE_ENV)
      }),
      new webpack.NoErrorsPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.AggressiveMergingPlugin({
        moveToParents: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        async: true,
        children: true,
        minChunks: Infinity
      }),
      new ExtractTextPlugin('assets/styles/css/[name]' + (NODE_ENV === 'development' ? '' : '.[chunkhash]') + '.css', {allChunks: true})
    ],
    devServer: {
      publicPath: '/ext/',
      contentBase: './dist',
      info: true,
      hot: true,
      inline: true,
      historyApiFallback: {
        index: '/ext/'
      },
      watchOptions: {
        poll: 1000,
      },
    },
    // constants injected to app
    appConstants: {
      runtimeEnv: 'development', // 'development|test|production',
      coreApiBaseUrl: 'http://localhost:9000/ext/api',
      transcriptEndpoint: 'http://localhost:3001/ext/api',
    },
    headerFooterSvcUrl: 'https://chfs-mygov.apps.gov.bc.ca/v1/theme1/',
  };

  if (NODE_ENV !== 'development') {
    webpackConfig.plugins = webpackConfig.plugins.concat([
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        warnings: false,
        sourceMap: true
      })
    ]);
  }

  return webpackConfig;

};
