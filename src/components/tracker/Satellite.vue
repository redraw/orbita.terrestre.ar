<template>
  <div>
    <l-marker
      v-if="telemetry.lat && telemetry.lng"
      :lat-lng="telemetry"
    >
      <l-icon
        v-if="['ARSAT 1', 'ARSAT 2', 'SAOCOM 1A', 'SAOCOM 1B'].includes(this.name)"
        :icon-size="[50, 50]"
        :icon-anchor="[15, 25]"
        icon-url="/arsat.svg"
      />
      <l-icon
        v-else
        :icon-size="[32, 37]"
        :icon-anchor="[15, 25]"
        icon-url="/satellite-white.png"
      />
    </l-marker>
    <!-- current orbit -->
    <l-polyline
      v-if="groundTracks.length === 3"
      :lat-lngs="groundTracks[1].slice(0, -5)"
      :weight="2"
    />
    <TelemetryPanel
      v-if="showTelemetry"
      :telemetry="telemetry"
    />
  </div>
</template>

<script>
import { mapState } from "vuex"
import events from "@/eventbus"

import TelemetryPanel from "@/components/tracker/TelemetryPanel"
import { LPolyline, LIcon, LMarker } from "vue2-leaflet"
import LGeo from "leaflet-geodesy";

import { getSatelliteName, getGroundTracks, getSatelliteInfo } from "tle.js";

const R = 6371000; // Earth radius (meters)

export default {
  components: {
    LPolyline,
    LMarker,
    LIcon,
    TelemetryPanel
  },

  props: {
    tle: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      groundTracks: [],
      telemetry: {},
      fovCircle: null,
      ticker: null
    }
  },

  computed: {
    fovRadius() {
      // calculate field of view radius
      // https://en.wikipedia.org/wiki/Horizon#Other_measures
      return R * Math.acos(R / (R + this.telemetry.height * 1000));
    },

    showTelemetry() {
      return this.config.telemetry && this.telemetry.lat && this.telemetry.lng
    },

    name () {
      return getSatelliteName(this.tle)
    },

    ...mapState([
      "map",
      "speed",
      "config",
      "observer",
      "timestamp",
    ])
  },

  watch: {
    tle() {
      this.setup()
    },

    ["config.follow"]() {
      if (this.config.follow) {
        this.follow()
      }
    }
  },

  mounted() {
    this.setup()
    events.on("timeTravel", this.onTimeTravel)
  },

  destroyed() {
    if (this.fovCircle) this.fovCircle.remove()
    clearTimeout(this.ticker)
    events.off("timeTravel", this.onTimeTravel)
  },

  methods: {
    setup() {
      clearTimeout(this.ticker)

      this.updateTelemetry()
      const { lat, lng } = this.telemetry;

      // remove FoV circle
      if (this.fovCircle) {
        this.fovCircle.remove();
      }

      // create new FoV circle
      this.fovCircle = LGeo.circle([lat, lng], this.fovRadius, {
        parts: 100,
        stroke: false,
      }).addTo(this.map);

      this.ticker = this.tick()
    },

    updateTelemetry() {
      if (this.observer.enabled) {
        this.telemetry = getSatelliteInfo(
          [...this.tle],
          this.timestamp,
          this.observer.lat,
          this.observer.lng
        );
      } else {
        this.telemetry = getSatelliteInfo([...this.tle], this.timestamp);
      }
    },

    async updateGroundTracks() {
      this.groundTracks = await getGroundTracks({
        tle: [...this.tle],
        isLngLatFormat: false,
        startTimeMS: this.timestamp
      })
    },

    async tick() {
      // get telemetry
      this.updateTelemetry()
      const { lat, lng } = this.telemetry;

      // set FoV circle
      this.fovCircle.setLatLng({ lat, lng });
      this.fovCircle.setRadius(this.fovRadius);

      // update groundtracks
      await this.updateGroundTracks()

      // follow
      this.follow()
      
      this.ticker = setTimeout(this.tick, this.config.tickerTrackerDelayMs)
    },

    follow() {
      if (this.config.follow) {
        const { lat, lng } = this.telemetry
        this.map.setView([lat, lng])
      }
    },

    onTimeTravel() {
      clearTimeout(this.ticker)
      this.ticker = this.tick()
    }
  }
}
</script>