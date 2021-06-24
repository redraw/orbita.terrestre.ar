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
      ticker: {
        refresh: null,
        follow: null
      }
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
      "config",
      "timestamp",
    ])
  },

  mounted() {
    this.setup();
    this.ticker.refresh = setInterval(this.refresh, this.config.refreshDelaySec * 1000);
    this.ticker.follow = setInterval(this.follow, this.config.followDelaySec * 1000);
  },

  destroyed() {
    if (this.fovCircle) {
      this.fovCircle.remove()
    }
  },

  methods: {
    setup() {
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

      this.refresh();
      this.follow();
    },

    refresh() {
      // get telemetry
      this.telemetry = getSatelliteInfo([...this.tle], this.timestamp);
      const { lat, lng } = this.telemetry;

      // set FoV circle
      this.fovCircle.setLatLng({ lat, lng });
      this.fovCircle.setRadius(this.fovRadius);
    },

    async updateGroundTracks() {
      this.groundTracks = await getGroundTracks({
        tle: [...this.tle],
        isLngLatFormat: false,
        startTimeMS: this.timestamp
      });
    },

    async follow() {
      await this.updateGroundTracks()
      if (this.config.follow) {
        const { lat, lng } = this.telemetry
        this.map.setView([lat, lng])
      }
    },
  },

  watch: {
    tle() {
      // if sat change, setup
      this.setup()
    },
    timestamp(a, b) {
      // if difference is greater than 5s
      // we consider time travel
      if (Math.abs(a - b) > 5000) {
        this.refresh()
        this.$store.commit('setFollow', true)
        this.follow()
      }
    },
    "config.follow": {
      handler() {
        this.follow()
      }
    }
  }
}
</script>