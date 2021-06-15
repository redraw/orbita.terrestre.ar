module.exports = {
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
