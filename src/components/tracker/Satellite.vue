<template>
  <div>
    <l-marker
      v-if="telemetry.lat && telemetry.lng"
      :lat-lng="telemetry"
    >
      <l-icon
        :icon-size="[32, 37]"
        :icon-anchor="[15, 25]"
        icon-url="/satellite-white.png"
      />
    </l-marker>
    <l-polyline
      v-if="groundTracks.length"
      :lat-lngs="groundTracks[1].slice(0, -5)"
      :weight="2"
    />
    <TelemetryPanel v-if="showTelemetry" :telemetry="telemetry" />
  </div>
</template>

<script>
import { mapState } from "vuex"
import events from "@/eventbus"

import TelemetryPanel from "@/components/tracker/TelemetryPanel"
import { LPolyline, LIcon, LMarker } from "vue2-leaflet"
import LGeo from "leaflet-geodesy";

import { getGroundTracks, getSatelliteInfo } from "tle.js";

const R = 6371000; // Earth radius (meters)

export default {
  props: {
    tle: {
      type: Array,
      required: true
    }
  },

  components: {
    LPolyline,
    LMarker,
    LIcon,
    TelemetryPanel
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
    ...mapState([
      "map",
      "speed",
      "config",
      "timestamp",
    ])
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

      this.telemetry = getSatelliteInfo([...this.tle], this.timestamp);
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

    async updateGroundTracks() {
      this.groundTracks = await getGroundTracks({
        tle: [...this.tle],
        isLngLatFormat: false,
        startTimeMS: this.timestamp
      })
    },

    async tick() {
      // get telemetry
      this.telemetry = getSatelliteInfo([...this.tle], this.timestamp);
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
  }
}
</script>