<template>
  <div>
    <l-control
      class="d-none d-sm-flex flex-column"
      position="topright"
    >
      <skychart
        v-show="isSatelliteAbove"
        :sat-name="getSatelliteName(tle)"
        :telemetry="telemetry"
        :current-pass="currentPass"
        style="max-width: 250px"
      />
      <v-simple-table
        dense
        style="background-color: rgba(0, 0, 0, 0.5)"
      >
        <template #default>
          <tbody>
            <tr>
              <td><b>{{ $t("telemetry.name") }}</b></td>
              <td>{{ getSatelliteName(tle) }}</td>
            </tr>
            <tr>
              <td><b>{{ $t("telemetry.norad") }}</b></td>
              <td>{{ getCatalogNumber(tle) }}</td>
            </tr>
            <tr>
              <td><b>{{ $t("telemetry.lat") }}</b></td>
              <td>{{ telemetry.lat.toFixed(2) }}°</td>
            </tr>
            <tr>
              <td><b>{{ $t("telemetry.lng") }}</b></td>
              <td>{{ telemetry.lng.toFixed(2) }}°</td>
            </tr>
            <tr>
              <td><b>{{ $t("telemetry.height") }}</b></td>
              <td>{{ telemetry.height.toFixed(2) }} km</td>
            </tr>
            <tr v-if="observer.enabled">
              <td><b>{{ $t("telemetry.velocity") }}</b></td>
              <td>{{ telemetry.velocity.toFixed(2) }} km/s</td>
            </tr>
            <tr v-if="observer.enabled">
              <td><b>{{ $t("telemetry.azimuth") }}</b></td>
              <td>{{ telemetry.azimuth.toFixed(2) }}°</td>
            </tr>
            <tr v-if="observer.enabled">
              <td><b>{{ $t("telemetry.altitude") }}</b></td>
              <td>{{ telemetry.elevation.toFixed(2) }}°</td>
            </tr>
            <tr v-if="observer.enabled">
              <td><b>{{ $t("telemetry.distance") }}</b></td>
              <td>{{ telemetry.range.toFixed(2) }} km</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </l-control>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getSatelliteInfo, getSatelliteName, getCatalogNumber } from "tle.js";

import { LControl } from "vue2-leaflet";
import Skychart from './Skychart.vue';

export default {
  components: {
    LControl,
    Skychart,
  },

  props: {
    telemetry: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      currentPass: []
    }
  },

  computed: {
    isSatelliteAbove () {
      return this.observer.enabled && this.telemetry.elevation > 0
    },
    ...mapState(["tle", "timestamp", "observer",]),
  },

  watch: {
    isSatelliteAbove: {
      immediate: true,
      handler(value) {
        if (value > 0 && this.currentPass.length == 0) {
          this.calculatePass(+30 * 1000) // calculate pass with 30s step forward
          this.calculatePass(-30 * 1000) // calculate pass with 30s step backwards
          this.$store.dispatch("currentPass", this.currentPass)
        } else if (this.currentPass.length > 0) {
          this.resetPass()
        }
      }
    }
  },

  methods: {
    calculatePass(stepMs) {
      let steps = 0
      let maxSteps = 1000
      let telemetry, alt
      let ts = this.timestamp
      do {
        telemetry = getSatelliteInfo(
          [...this.tle],
          ts,
          this.observer.lat,
          this.observer.lng
        )
        alt = telemetry.elevation
        this.currentPass.push({
          lat: telemetry.elevation,
          az: telemetry.azimuth,
          ts
        })
        ts = ts + stepMs
        steps += 1
      } while (alt > 0 && steps < maxSteps);
    },

    resetPass() {
      this.currentPass = []
    },

    getSatelliteName,
    getCatalogNumber,
  }
};
</script>