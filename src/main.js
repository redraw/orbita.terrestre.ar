import Vue from 'vue'
import App from './App.vue'
import VueGtag from "vue-gtag";
import vuetify from './plugins/vuetify'
import './plugins/leaflet'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueGtag, {
  config: { id: process.env.VUE_APP_GTAG_ID }
})

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
