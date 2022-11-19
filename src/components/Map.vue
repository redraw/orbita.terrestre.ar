<template>
  <main>
    <v-dialog
      v-model="infoDialog"
      open-on-focus
      width="500"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ $t("hello.title") }}
        </v-card-title>

        <v-card-text v-html="$t('hello.content')" />

        <v-divider />

        <v-card-actions>
          <v-btn
            color="primary"
            text
            target="_blank"
            href="https://github.com/redraw/groundtrack"
          >
            <v-icon class="mr-2">mdi-github</v-icon>
            Github
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="closeInfoDialog"
          >
            {{ $t("hello.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <l-map
      ref="map"
      :center="center"
      :zoom="zoom"
      :options="options"
      @ready="onMapReady"
    >
      <l-tile-layer
        :url="tileLayerUrl"
        :attribution="attribution"
        subdomains="abcd"
        :options="{ ext: 'png' }"
      />
      <l-control-zoom position="bottomright" />
      <l-control
        class="pa-4"
        position="leftup"
      >
        <SearchMenu v-if="map" @showInfo="infoDialog = true"/>
      </l-control>
      <l-control
        class="pa-4 ma-0"
        position="bottomleft"
      >
        <CoordinatesText 
          class="d-none d-sm-flex my-1 grey--text" 
          style="z-index: 999" 
          :coords="mouse"
        />
        <TimeTravel
          v-if="tle.length"
          :tle="tle"
        />
      </l-control>
      <Satellite
        v-if="tle.length"
        :tle="tle"
      />
      <l-marker
        v-if="observer.enabled && observer.location"
        :lat-lng="[observer.lat, observer.lng]"
      >
        <l-icon>
          <div>📍 {{ observer.location.city }}, {{ observer.location.country }}</div>
          <small v-if="observer.fromIp">(IP)</small>
        </l-icon>
      </l-marker>
    </l-map>
  </main>
</template>

<script>
import { mapState } from "vuex"
import { SearchMenu, TimeTravel, CoordinatesText } from "@/components/ui"
import Satellite from "@/components/tracker/Satellite"

import {
  LMap,
  LIcon,
  LMarker,
  LControl,
  LTileLayer,
  LControlZoom,
} from "vue2-leaflet";
import { getCatalogNumber } from 'tle.js';

export default {
  components: {
    LMap,
    LControl,
    LTileLayer,
    LIcon,
    LMarker,
    LControlZoom,
    Satellite,
    SearchMenu,
    TimeTravel,
    CoordinatesText
  },

  data: () => ({
    // tileLayerUrl: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    // tileLayerUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    // tileLayerUrl: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
    tileLayerUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "<a href='https://github.com/redraw/groundtrack' target='_blank'>Github</a>",
    zoom: 2.5,
    center: { lat: 0, lng: 0 },
    options: {
      zoomControl: false,
      minZoom: 2,
      maxBounds: [
        [-90, -200],
        [90, 200],
      ],
      maxBoundsViscosity: 0.5,
    },
    mouse: {
      lat: 0,
      lng: 0
    },
    infoDialog: false,
  }),

  computed: {
    ...mapState([
      "tle",
      "map",
      "observer",
      "config",
      "locale",
    ]),
  },

  created () {
    this.infoDialog = !window.localStorage.getItem("infoDialog")
    this.$i18n.locale = navigator.language.split("-")[0]
  },

  watch: {
    tle(value) {
      const norad = getCatalogNumber(value)
      if (norad != this.$route.params?.norad) {
        this.$router.push(`/${norad}`)
      }
    }
  },

  methods: {
    closeInfoDialog() {
      this.infoDialog = false
      window.localStorage.setItem("infoDialog", false)
    },

    async onMapReady() {
      const self = this
      const map = this.$refs.map.mapObject

      this.$store.dispatch("mapReady", map)

      // Event handlers
      map.on("mousemove", function (e) {
        const {lat, lng} = e.latlng
        self.mouse = {
          lat: lat.toFixed(2), 
          lng: lng.toFixed(2)
        }
      })
      map.on("dragstart", function() {
        self.$store.commit("setFollow", false)
      })

      // Set router params
      const norad = this.$route.params?.norad
      if (norad) {
        console.log("fetch TLE from routing:", norad)
        await this.$store.dispatch("fetchTLEs", { params: { "CATNR": norad }})
      } else {
        console.log("fetch TLE from group (default)")
        await this.$store.dispatch("fetchTLEs", {
          params: {
            GROUP: this.config.tles.group
          },
        })
      }
    },
  }
};
</script>

<style scoped>
main {
  width: 100%;
  height: 100%;
}
</style>

<style>
.vue2leaflet-map {
  position: fixed !important;
}
.leaflet-container {
  font-family: monospace !important;
}
.leaflet-control-attribution {
  /* background: rgba(255, 255, 255, 0.3) !important */
  display: none;
}
</style>
