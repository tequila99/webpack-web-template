const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './.env') })
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const publicPath = process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : './'
const isDev = process.env.NODE_ENV === 'development'
const isPug = process.env.USE_PUG === 'true'

const optimization = () => {
  const options = {
    splitChunks: {
      chunks: 'all'
    }
  }
  if (!isDev) {
    options.minimizer = [
      new OptimizeCSSAssetsPlugin({}),
      new TerserWebpackPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      })
    ]
  }
  return options
}

const jsLoaders = [
  {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env'],
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-class-properties'
      ]
    }
  }
]

if (isDev) {
  jsLoaders.push('eslint-loader')
}

const js = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: jsLoaders
}

const ts = {
  test: /\.ts$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript'
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-class-properties'
    ]
  }
}

const csv = {
  test: /\.csv$/,
  use: ['csv-loader']
}

const xml = {
  test: /\.xml$/,
  use: ['xml-loader']
}

const pug = {
  test: /\.pug$/,
  oneOf: [
    {
      resourceQuery: /^\?vue/,
      use: ['pug-plain-loader']
    },
    {
      use: ['pug-loader']
    }
  ]
}

const css = {
  test: /\.css$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hrm: isDev,
        reloadAll: true
      }
    },
    'css-loader'
  ]
}

const scss = {
  test: /\.s(c|a)ss$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hrm: isDev,
        reloadAll: true
      }
    },
    'css-loader',
    'sass-loader'
  ]
}

const pcss = {
  test: /\.(p|post)css$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hrm: isDev,
        reloadAll: true
      }
    },
    'css-loader',
    'postcss-loader'
  ]
}

const fonts = {
  test: /\.(ttf|woff|woff2|eot)$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: isDev ? '[name].[ext]' : '[hash].[ext]'
      }
    }
  ]
}

const vue = {
  test: /\.vue$/,
  loader: 'vue-loader'
}

const images = {
  test: /\.(png|jpe?g|gif)$/i,
  loader: 'file-loader',
  options: {
    name: isDev ? '[name].[ext]' : '[hash].[ext]'
  }
}

const svg = {
  test: /\.svg$/,
  use: [
    {
      loader: 'svg-sprite-loader',
      options: {
        extract: true,
        spriteFilename: svgPath => `sprite${svgPath.substr(-4)}`
      }
    },
    'svg-transform-loader',
    {
      loader: 'svgo-loader',
      options: {
        plugins: [
          { removeTitle: true },
          {
            removeAttrs: {
              attrs: '(fill|stroke)'
            }
          }
        ]
      }
    }
  ]
}

const config = {
  context: path.resolve(__dirname, './src'),
  mode: 'development',
  entry: ['@babel/polyfill', './main.js'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: isDev ? '[name].js' : '[name].[hash].build.js',
    publicPath: !isDev ? publicPath : '',
    chunkFilename: '[chunkhash].js'
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      images: path.resolve(__dirname, 'src/images'),
      icons: path.resolve(__dirname, 'src/images/icons'),
      fonts: path.resolve(__dirname, 'src/assets/fonts'),
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@scripts': path.resolve(__dirname, 'src/scripts')
    },
    extensions: ['*', '.js', '.vue', '.json', '.html', '.pug']
  },
  module: {
    rules: [vue, xml, js, ts, csv, pcss, scss, css, svg, images, fonts, pug]
  },
  optimization: optimization(),
  devServer: {
    port: 4200,
    overlay: true,
    hot: true
  },
  devtool: isDev ? 'source-map' : '',
  plugins: [
    new HtmlWebpackPlugin({
      template: isPug ? './index.pug' : './index.html',
      minify: {
        collapseWhitespace: !isDev
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/assets/favicon.ico'),
        to: path.resolve(__dirname, 'dist')
      }
    ]),
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : '[name].[hash].css',
      chunkFilename: '[contenthash].css'
    }),
    new SpriteLoaderPlugin({ plainSprite: true }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': dotenv.parsed
    })
  ]
}

// if (!isDev) {
//   config.plugins.push(new BundleAnalyzerPlugin())
// }

module.exports = config
