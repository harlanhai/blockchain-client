const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;
  
  return {
    entry: ['./src/index.css', './src/index.tsx'],
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].bundle.js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    mode: isProduction ? 'production' : 'development',
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      open: true,
      compress: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      // 代理配置，用于解决 CORS 问题
      proxy: {
        '/api': {
          target: 'https://chatgpt-proxy.harlanhai7023.workers.dev',
          pathRewrite: { '^/api': '' },
          changeOrigin: true,
          secure: false,
          // 添加以下配置解决超时问题
          timeout: 60000, // 增加超时时间到60秒
          proxyTimeout: 60000, // 代理特定超时
          // 添加以下配置以获取更详细的错误信息
          logLevel: 'debug', // 启用详细日志
          onError: (err, req, res) => {
            console.error('代理请求错误:', err);
          },
          onProxyReq: (proxyReq, req, res) => {
            // 修改代理请求头
            proxyReq.setHeader('Connection', 'keep-alive');
            console.log(`代理请求: ${req.method} ${req.url}`);
          },
          onProxyRes: (proxyRes, req, res) => {
            console.log(`代理响应: ${proxyRes.statusCode} ${req.url}`);
          }
        },
      },
    },
    module: {
      rules: [
        // JavaScript/TypeScript with SWC
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  dynamicImport: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
                target: 'es2020',
              },
            },
          },
        },
        // CSS/PostCSS with Tailwind
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    '@tailwindcss/postcss',
                    'autoprefixer',
                  ],
                },
              },
            },
          ],
        },
        // Images
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/media/[name].[hash:8][ext]',
          },
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`,
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: "my-blockchain",
        template: './public/index.html',
        inject: true,
        favicon: '',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new Dotenv({
        path: './.env',
        safe: true, // load '.env.example' to verify the '.env' variables are all set
        systemvars: true, // load all system variables as well
        defaults: false, // load '.env.defaults' as the default values if empty
      }),
      isProduction && new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
      isProduction && new CopyPlugin({
        patterns: [
          { 
            from: 'public', 
            to: '', 
            globOptions: {
              ignore: ['**/index.html', '**/favicon.ico'],
            },
          },
        ],
      }),
      // Comment out the following line to disable the bundle analyzer
      // isProduction && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
  };
};