<template>
  <div>
    <v-autocomplete
      ref="satellites"
      v-if="tles.length"
      v-model="tle"
      :loading="loading"
      dense
      cache-items
      hide-details
      flat
      solo-inverted
      auto-select-first
      persistent-hint
      :items="satellites"
      :search-input.sync="search"
      @input="$refs.satellites.blur()"
    >
      <template v-slot:item="{ item }">
        {{ item.text }}&nbsp;<small class="grey--text">{{ getCatalogNumber(item.value) }}</small>
      </template>
    </v-autocomplete>
    <div class="d-flex flex-column my-4">
      <v-tooltip right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="my-1"
            fab
            x-small
            v-bind="attrs"
            v-on="on"
            @click="setTerminator(!config.terminator)"
          >
            <v-icon :color="config.terminator ? 'primary': ''">
              mdi-weather-sunny
            </v-icon>
          </v-btn>
        </template>
        <span>Solar terminator</span>
      </v-tooltip>
      <v-tooltip right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="my-1"
            fab
            x-small
            v-bind="attrs"
            v-on="on"
            @click="setFollow(!config.follow)"
          >
            <v-icon :color="config.follow ? 'primary': ''">
              mdi-image-filter-center-focus
            </v-icon>
          </v-btn>
        </template>
        <span>Follow satellite</span>
      </v-tooltip>
      <v-tooltip right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="my-1"
            fab
            x-small
            v-bind="attrs"
            v-on="on"
            @click="setTelemetry(!config.telemetry)"
          >
            <v-icon :color="config.telemetry ? 'primary': ''">
              mdi-satellite-uplink
            </v-icon>
          </v-btn>
        </template>
        <span>Show telemetry panel</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { getSatelliteName, getCatalogNumber } from "tle.js"

const debounce = require("lodash/debounce");

export default {
  computed: {
    tle: {
      get() {
        return this.$store.state.tle;
      },
      set(value) {
        if (value) {
          this.$store.commit("updateSat", value);
        }
      },
    },
    satellites() {
      return this.tles.map(tle => {
        return {text: getSatelliteName(tle), value: tle}
      })
    },
    ...mapState([
      "loading", 
      "config", 
      "tles"
    ]),
  },

  data() {
    return {
      search: "",
    };
  },

  methods: {
    getSatelliteName,
    getCatalogNumber,
    ...mapMutations([
      "updateSat",
      "setTerminator",
      "setFollow",
      "setTelemetry"
    ])
  },

  watch: {
    search: debounce(async function () {
      if (this.search?.length > 2 && this.$refs.satellites.filteredItems == 0) {
        this.$store.dispatch("fetchTLEs", { NAME: this.search });
      }
    }, 500)
  },
};
</script>