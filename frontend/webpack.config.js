const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.mjs'],
    mainFields: ['browser', 'module', 'main']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: [/node_modules/, /setupTests\\.(ts|tsx)$/],
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
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
    ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin({ openAnalyzer: false })] : [])
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    open: true,
    hot: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        msal: {
          test: /[\\/]node_modules[\\/]@azure[\\/]msal/,
          name: 'msal',
          chunks: 'all',
          priority: 10
        }
      }
    }
  }
}; 