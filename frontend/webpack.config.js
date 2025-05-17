const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.mjs'],
    mainFields: ['browser', 'module', 'main'],
    fullySpecified: false
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: [/node_modules/, /setupTests\\.(ts|tsx)$/],
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === 'production' 
            ? MiniCssExtractPlugin.loader 
            : 'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      favicon: './src/assets/favicon.png'
    }),
    new Dotenv({
      systemvars: true,
      silent: true
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:3001/api'),
      'process.env.REACT_APP_AZURE_AD_B2C_API_SCOPE': JSON.stringify(process.env.REACT_APP_AZURE_AD_B2C_API_SCOPE || 'https://YOUR_TENANT.onmicrosoft.com/api/user.read'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new MiniCssExtractPlugin({
      filename: process.env.NODE_ENV === 'production' ? '[name].[contenthash].css' : '[name].css',
    }),
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin({ openAnalyzer: false })] : [])
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    open: true,
    hot: true,
    client: {
      overlay: false
    }
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    usedExports: true,
    sideEffects: true,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            
            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          }
        },
        msal: {
          test: /[\\/]node_modules[\\/]@azure[\\/]msal/,
          name: 'msal',
          chunks: 'all',
          priority: 10
        }
      }
    },
    runtimeChunk: 'single'
  }
}; 