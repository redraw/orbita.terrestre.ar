module.exports = {
  publicPath: process.env.BASE_URL || '',
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.txt/,
          use: 'raw-loader'
        }
      ]
    }
  }
}
