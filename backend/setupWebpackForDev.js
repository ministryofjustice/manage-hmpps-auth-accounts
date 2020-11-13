const express = require('express')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const hrm = require('webpack-hot-middleware')

const webpackConfig = require('../webpack.config.js')
const config = require('./config')

const router = express.Router()

module.exports = () => {
  if (config.app.production === false && config.app.disableWebpack === false) {
    // @ts-ignore
    const compiler = webpack(webpackConfig)
    router.use(middleware(compiler, { writeToDisk: true }))
    router.use(hrm(compiler, {}))
  }

  return router
}
