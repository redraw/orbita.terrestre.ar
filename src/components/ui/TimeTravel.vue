<template>
  <div class="d-flex flex-column flex-sm-row align-sm-center">
    <div class="d-flex flex-row align-center my-2 my-sm-0">
      <!-- date -->
      <v-dialog
        v-model="dialogs.date"
        width="290px"
      >
        <template #activator="{ on, attrs }">
          <div
            class="font-weight-bold"
            v-bind="attrs"
            v-on="on"
            v-text="relative.date"
          />
        </template>
        <v-date-picker
          v-model="date"
          scrollable
        >
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="dialogs.date = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="travel"
          >
            OK
          </v-btn>
        </v-date-picker>
      </v-dialog>
      <!-- time -->
      <v-dialog
        v-model="dialogs.time"
        width="290px"
      >
        <template #activator="{ on, attrs }">
          <div
            class="mx-2 font-weight-bold"
            v-bind="attrs"
            v-on="on"
            v-text="relative.time"
          />
        </template>
        <v-time-picker
          v-if="dialogs.time"
          v-model="time"
          format="24hr"
          full-width
          scrollable
        >
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="dialogs.time = false"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="travel"
          >
            OK
          </v-btn>
        </v-time-picker>
      </v-dialog>
    </div>
    <div class="d-flex flex-row align-center">
      <!-- state -->
      <v-btn-toggle
        v-model="state"
        class="mx-sm-2"
        mandatory
        borderless
        dense
      >
        <v-btn
          x-small
          :value="0"
        >
          <v-icon small>
            mdi-pause
          </v-icon>
        </v-btn>
        <v-btn
          x-small
          :value="1"
        >
          <v-icon small>
            mdi-play
          </v-icon>
        </v-btn>
        <v-btn
          x-small
          :value="2"
          @click="speed *= 2"
        >
          <v-icon small>
            mdi-fast-forward
          </v-icon>
        </v-btn>
      </v-btn-toggle>
      <span
        v-if="speed > 1"
        class="mx-2"
      >
        {{ speed }}x
      </span>
      <!-- reset -->
      <v-tooltip
        v-if="showReset"
        top
      >
        <template #activator="{ on, attrs }">
          <v-icon 
            class="mx-2" 
            small 
            v-bind="attrs"
            v-on="on"
            @click="reset"
          >
            mdi-backup-restore
          </v-icon>
        </template>
        <span>
          {{ $t("timetravel.back") }}
        </span>
      </v-tooltip>
      <!-- days from epoch warning -->
      <v-tooltip
        v-if="daysFromEpoch > 14"
        top
      >
        <template #activator="{ on, attrs }">
          <v-icon 
            class="mx-2"
            color="yellow" 
            small
            v-bind="attrs"
            v-on="on"
          >
            mdi-alert
          </v-icon>
        </template>
        <span>
          {{ $t("timetravel.outdated_tle", { daysFromEpoch }) }}
        </span>
      </v-tooltip>
      <!-- share -->
      <v-tooltip
        top
      >
        <template #activator="{ on, attrs }">
          <v-icon 
            class="mx-2" 
            small 
            v-bind="attrs"
            v-on="on"
            @click="shareURL"
          >
            mdi-share
          </v-icon>
        </template>
        <span>
          {{ shareText }}
        </span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"

import { toISOString } from "@/utils/date"
import { getCatalogNumber, getEpochTimestamp } from "tle.js";

export default {
  props: {
    tle: {
      type: Array,
      required: true
    }
  },
  
  data() {
    return {
      date: null,
      time: null,
      clock: new Date(),
      tleEpoch: new Date(),
      shiftMs: 0,
      state: 1,
      ticker: null,
      relative: {
        date: null,
        time: null,
      },
      dialogs: {
        date: false,
        time: false
      },
      shareText: this.$t("timetravel.share"),
      shareTextTimeout: null
    }
  },

  computed: {
    speed: {
      get() {
        return this.$store.state.speed
      },
      set(value) {
        return this.$store.commit("setSpeed", value)
      }
    },

    showReset() {
      return Math.abs(this.shiftMs) > 0 || this.speed > 1
    },

    daysFromEpoch() {
      const diff = Math.abs(this.clock.getTime() - this.tleEpoch)
      const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
      return days
    },

    ...mapState([
      "config",
    ])
  },

  watch: {
    clock() {
      this.$store.commit("setTimestamp", this.clock.getTime())
    },

    tle: {
      immediate: true,
      handler() {
        this.tleEpoch = getEpochTimestamp([...this.tle])
      }
    },

    state() {
      if (this.state <= 1) {
        this.speed = 1
      }
    },

    dialogs: {
      deep: true,
      handler() {
        if (this.dialogs.date || this.dialogs.time) {
          this.updateDateTime()
        }
      }
    }
  },

  created() {
    // Shift time if timestamp exists in route params
    const ts = this.$route.params?.ts
    if (ts) {
      const start = new Date(parseInt(ts))
      this.shiftMs = start.getTime() - this.clock.getTime()
      this.$store.dispatch("timeTravel", start)
    }

    this.tick()
  },

  destroyed() {
    clearTimeout(this.ticker)
  },

  methods: {
    updateDateTime() {
      // set date/time based on relative time
      this.date = this.relative.date
      this.time = this.relative.time
    },

    updateRelativeDateTime () {
      const [date, fulltime] = toISOString(this.clock).split("T")
      const [time] = fulltime.split(".")
      this.relative.date = date
      this.relative.time = time
    },

    travel() {
      const now = new Date()
      const [year, month, day] = this.date.split("-")
      const [hour, minute] = this.time.split(":")
      const start = new Date(year, month-1, day, hour, minute, now.getSeconds())
      this.shiftMs = start.getTime() - now.getTime()
      this.$store.dispatch("timeTravel", start)
      this.dialogs.date = this.dialogs.time = false
      this.updateURL()
    },

    updateURL() {
      const norad = getCatalogNumber(this.tle)
      const now = new Date()
      const shiftedClock = new Date(now.getTime() + this.shiftMs)
      this.$router.push(`/${norad}/${shiftedClock.getTime()}`)
    },

    tick() {
      if (this.state > 0) {
        const realTime = new Date()
        let now = realTime
        // if fast-forward
        if (this.speed > 1) {
          // shifted clock
          now = this.clock
          now.setSeconds(this.clock.getSeconds() + this.speed)
          this.shiftMs = now.getTime() - realTime.getTime()
          this.clock = new Date(now)
        } else {
          this.clock = new Date(now.getTime() + this.shiftMs)
        }
        this.updateRelativeDateTime()
      }
      // schedule ticker
      this.ticker = setTimeout(this.tick, 1000 / this.speed)
    },

    reset() {
      clearTimeout(this.ticker)
      const now = new Date()
      this.speed = 1
      this.shiftMs = 0
      this.$store.dispatch("timeTravel", now)
      this.tick()
    },

    shareURL() {
      this.updateURL()
      const url = window.location.href
      navigator.clipboard.writeText(url)
      this.shareText = this.$t("timetravel.shared", {url})
      clearTimeout(this.shareTextTimeout)
      this.shareTextTimeout = setTimeout(() => {
        this.shareText = this.$t("timetravel.share")
      }, 5000)
    }
  },
}
</script>