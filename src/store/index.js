import Vue from 'vue'
import Vuex from 'vuex'

import api from "@/api"
import events from "@/eventbus"
import SolarTerminator from "@joergdietrich/leaflet.terminator"

Vue.use(Vuex)

const store = {
  state: {
    map: null,
    terminator: null,
    loading: false,
    tles: [],
    tle: [],
    timestamp: null,
    speed: 1,
    observer: {
      enabled: false,
      lat: 0,
      lng: 0,
      elevation: 0,
      location: null
    },
    config: {
      terminator: true,
      follow: true,
      telemetry: true,
      tickerTrackerDelayMs: 1000,
      tles: {
        group: "stations",
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
      state.terminator = SolarTerminator({
        stroke: true,
        color: "#ffffff",
        dashArray: "5 10",
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.5
      })
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
    },

    setTimestamp(state, value) {
      state.timestamp = value
      state.terminator.setTime(value)
    },

    setSpeed(state, value) {
      state.speed = value
    },

    setObserverCoords(state, { coords }) {
      state.observer.enabled = true
      state.observer.lat = coords.latitude
      state.observer.lng = coords.longitude
    },

    setObserverLocation(state, location) {
      state.observer.location = location
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
    },

    async onGeolocation({ commit }, position) {
      commit("setObserverCoords", position)
      const location = await api.getLocationFromCoords(position.coords)
      commit("setObserverLocation", location)
    },

    timeTravel({ commit }, start) {
      console.log("> traveling to", start)
      commit("setTimestamp", start.getTime())
      commit("setFollow", true)
      events.emit("timeTravel", start)
    }
  },

  modules: {}
}

export default new Vuex.Store(store)