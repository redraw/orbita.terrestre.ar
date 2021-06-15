import Vue from 'vue'
import Vuex from 'vuex'

import api from "@/api"
import SolarTerminator from "@joergdietrich/leaflet.terminator"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    map: null,
    terminator: null,
    loading: false,
    tles: [],
    tle: [],
    config: {
      terminator: true,
      follow: true,
      telemetry: true,
      tles: {
        group: "stations",
      },
      observer: {
        enabled: false,
        lat: 0,
        lng: 0,
        elevation: 0
      },
    },
  },

  mutations: {
    updateSat(state, tle) {
      state.tle = [...tle]
    },

    updateTLEs(state, data) {
      if (data.length) {
        state.tles = [...data]
      }
    },

    setupMap(state, map) {
      state.map = map
    },

    setupTerminator(state) {
      state.terminator = SolarTerminator()
      state.terminator.addTo(state.map)
    },

    setLoading(state, value) {
      state.loading = value
    },

    setTerminator(state, value) {
      state.config.terminator = value
      if (state.config.terminator) {
        state.map.addLayer(state.terminator);
      } else {
        state.map.removeLayer(state.terminator);
      }
    },

    setFollow(state, value) {
      state.config.follow = value
    },

    setTelemetry(state, value) {
      state.config.telemetry = value
    }
  },

  actions: {
    async fetchTLEs({ commit }, params) {
      commit("setLoading", true)
      const data = await api.getTLEs(params)
      commit("setLoading", false)
      commit("updateTLEs", data)
    },

    async mapReady({ commit, dispatch, state }, map) {
      commit("setupMap", map)
      commit("setupTerminator")
      await dispatch("fetchTLEs", { GROUP: state.config.tles.group })
      commit("updateSat", state.tles[0])
    }
  },

  modules: {}
})
