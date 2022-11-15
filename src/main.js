import Vue from 'vue'
import App from './App.vue'
import VueGtag from "vue-gtag";

import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import router from './plugins/router'
import store from './store'
import './plugins/leaflet'

Vue.config.productionTip = false

Vue.use(VueGtag, {
  config: { id: process.env.VUE_APP_GTAG_ID }
})

new Vue({
  vuetify,
  store,
  i18n,
  router,
  render: h => h(App)
}).$mount('#app')
