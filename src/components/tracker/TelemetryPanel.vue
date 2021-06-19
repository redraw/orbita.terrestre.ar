<template>
  <l-control
    class="d-none d-sm-flex"
    position="topright"
  >
    <v-simple-table dense style="background-color: rgba(0, 0, 0, 0.5)">
      <template v-slot:default>
        <tbody>
          <tr>
            <td><b>name</b></td>
            <td>{{ getSatelliteName(tle) }}</td>
          </tr>
          <tr>
            <td><b>norad</b></td>
            <td>{{ getCatalogNumber(tle) }}</td>
          </tr>
          <tr>
            <td><b>lat</b></td>
            <td>{{ telemetry.lat.toFixed(2) }}°</td>
          </tr>
          <tr>
            <td><b>lng</b></td>
            <td>{{ telemetry.lng.toFixed(2) }}°</td>
          </tr>
          <tr>
            <td><b>height</b></td>
            <td>{{ telemetry.height.toFixed(2) }} km</td>
          </tr>
          <tr v-if="config.observer.enabled">
            <td><b>velocity</b></td>
            <td>{{ telemetry.velocity.toFixed(2) }} km/s</td>
          </tr>
          <tr v-if="config.observer.enabled">
            <td><b>azimuth</b></td>
            <td>{{ telemetry.azimuth.toFixed(2) }}°</td>
          </tr>
          <tr v-if="config.observer.enabled">
            <td><b>elevation</b></td>
            <td>{{ telemetry.elevation.toFixed(2) }}°</td>
          </tr>
          <tr v-if="config.observer.enabled">
            <td><b>range</b></td>
            <td>{{ telemetry.range.toFixed(2) }} km</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </l-control>
</template>

<script>
import { mapState } from "vuex"
import { LControl } from "vue2-leaflet"

import { getSatelliteName, getCatalogNumber } from "tle.js"

export default {
  props: {
    tle: {
      type: Array,
      required: true
    },
    telemetry: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState([
      "config"
    ])
  },

  components: {
    LControl
  },

  methods: {
    getSatelliteName,
    getCatalogNumber,
  }
};
</script>