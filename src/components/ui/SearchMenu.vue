<template>
  <div>
    <v-autocomplete
      ref="satellites"
      v-model="tle"
      :loading="loading"
      :items="satellites"
      :search-input.sync="query"
      :filter="filter"
      hide-details
      hide-no-data
      solo-inverted
      persistent-hint
      dense
      flat
      label="Satellite..."
      @input="!query && $refs.satellites.blur()"
    >
      <template #item="{ item }">
        {{ item.text }}&nbsp;<small class="grey--text">{{ getCatalogNumber(item.value) }}</small>
      </template>
    </v-autocomplete>
    <div class="d-flex flex-column my-4">
      <v-tooltip right>
        <template #activator="{ on, attrs }">
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
        <span>{{ $t('menu.follow_satellite') }}</span>
      </v-tooltip>
      <!-- observer location -->
      <v-tooltip right>
        <template #activator="{ on, attrs }">
          <v-btn
            class="my-1"
            fab
            x-small
            v-bind="attrs"
            v-on="on"
            @click="geolocate"
          >
            <v-icon :color="isLocated ? 'primary': ''">
              mdi-crosshairs-gps
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('menu.locate_me') }}</span>
      </v-tooltip>
      <!-- notifications -->
      <v-tooltip 
        v-show="observer.enabled"
        right
      >
        <template #activator="{ on, attrs }">
          <v-btn
            class="my-1"
            fab
            x-small
            v-bind="attrs"
            v-on="on"
            @click="toggleNotifications"
          >
            <v-icon :color="config.notifications ? 'primary': ''">
              mdi-bell
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('menu.notifications') }}</span>
      </v-tooltip>
      <!-- info -->
      <v-tooltip right>
        <template #activator="{ on, attrs }">
          <v-btn
            class="my-1"
            x-small
            fab
            v-bind="attrs"
            v-on="on"
            @click="$emit('showInfo')"
          >
            <v-icon>
              mdi-information-variant
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('menu.info') }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { getSatelliteName, getCatalogNumber } from "tle.js"

const debounce = require("lodash/debounce");

export default {
  data() {
    return {
      query: "",
      isLocated: false
    };
  },

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
      "observer",
      "tles"
    ]),
  },

  watch: {
    query: debounce(async function () {
      if (this.query?.length > 2 && this.$refs.satellites.filteredItems.length === 0) {
        const _type = Array.from(this.query).some(isNaN) ? "NAME" : "CATNR"
        this.$store.dispatch("fetchTLEs", {
          query: this.query,
          params: {
            [_type]: this.query
          }
        });
      }
    }, 500)
  },

  async created () {
    const geoPerm = await navigator.permissions.query({name: "geolocation"})
    if (geoPerm.state === "granted") {
      this.geolocate()
    }
    const notificationsPerm = await navigator.permissions.query({name: "notifications"})
    if (notificationsPerm.state === "granted") {
      this.$store.commit("setNotifications", window.localStorage.getItem("notifications"))
    }
  },

  methods: {
    geolocate() {
      navigator.geolocation.getCurrentPosition(async (value) => {
        await this.onGeolocation(value)
        this.isLocated = true
      }, console.error)
    },

    toggleNotifications() {
      if (!this.config.notifications) {
        Notification.requestPermission().then(state => {
          console.log(state)
          this.$store.commit("setNotifications", state === "granted")
        })
      } else {
        this.$store.commit("setNotifications", false)
      }
    },

    filter (item, queryText, itemText) {
      const query = queryText.toLowerCase()
      const a = itemText.toLowerCase().indexOf(query) > -1
      const b = getCatalogNumber(item.value).toString().indexOf(query) > -1
      return a || b
    },

    getSatelliteName,
    getCatalogNumber,

    ...mapMutations([
      "updateSat",
      "setTerminator",
      "setFollow",
      "setTelemetry",
    ]),

    ...mapActions([
      "onGeolocation",
    ])
  }
};
</script>
