import Vue from 'vue'
import Vuex from 'vuex'

import api from "@/api"
import events from "@/eventbus"

import { distance as wordDistance } from 'closest-match'
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
      fromIp: false,
      lat: 0,
      lng: 0,
      elevation: 0,
      location: {
        city: "",
        country: ""
      }
    },
    config: {
      terminator: true,
      follow: true,
      telemetry: true,
      tickerTrackerDelayMs: 1000,
      tles: {
        group: "stations",
      },
      notifications: false,
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

    setObserverCoords(state, { coords, fromIp = false}) {
      state.observer.enabled = true
      state.observer.fromIp = fromIp
      state.observer.lat = coords.latitude
      state.observer.lng = coords.longitude
    },

    setObserverLocation(state, location) {
      state.observer.location = location
    },

    setNotifications(state, value) {
      state.config.notifications = value
      window.localStorage.setItem("notifications", value)
    },

  },

  actions: {
    async fetchTLEs({ commit, state }, { params, query }) {
      commit("setLoading", true)
      const tles = await api.getTLEs(params)
      if (tles.length && query) {
        tles.sort((a, b) => wordDistance(a[0], query) - wordDistance(b[0], query))
      }
      commit("updateTLEs", tles)
      commit("setLoading", false)
      // set default TLE
      if (tles.length && !state.tle.length) {
        commit("updateSat", tles[0])
      }
    },

    async mapReady({ commit }, map) {
      commit("setupMap", map)
      commit("setupTerminator")
      try {
        const {
          city,
          country,
          latitude,
          longitude,
        } = await api.getLocationFromIp()
        if (latitude && longitude) {
          commit("setObserverCoords", { 
            coords: { latitude, longitude }, 
            fromIp: true
          })
        }
        if (city && country) {
          commit("setObserverLocation", { city, country })
        }
      } catch (e) {
        console.error(e)
      }
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
    },

    currentPass({ state }, pass) {
      // sort by timestamp
      pass.sort((a, b) => a.ts - b.ts)
      if (state.config.notifications) {
        new Notification(`${state.tle[0].trim()} passing above!`)
      }
    }
  },

  modules: {}
}

export default new Vuex.Store(store)