import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '@/components/Map'

Vue.use(VueRouter)

export default new VueRouter(
  {
    routes: [
      { path: "/:norad/:ts", component: Map },
      { path: "/:norad", component: Map },
      { path: "*", component: Map },
    ],
  }
)

