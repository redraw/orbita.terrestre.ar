<template>
  <div class="d-flex flex-column flex-sm-row align-sm-center">
    <div class="d-flex flex-row align-center my-2 my-sm-0">
      <!-- date -->
      <v-dialog
        v-model="dialogs.date"
        width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            class="font-weight-bold"
            v-text="relative.date"
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="date"
          scrollable
        >
          <v-spacer></v-spacer>
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
        <template v-slot:activator="{ on, attrs }">
          <div
            class="mx-2 font-weight-bold"
            v-text="relative.time"
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-time-picker
          v-if="dialogs.time"
          v-model="time"
          format="24hr"
          full-width
          scrollable
        >
          <v-spacer></v-spacer>
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
      <!-- speed -->
      <v-btn-toggle
        v-model="speed"
        class="mx-2"
        rounded
        mandatory
        borderless
        dense
      >
        <v-btn x-small :value="0">
          <v-icon small>mdi-pause</v-icon>
        </v-btn>
        <v-btn x-small :value="1">
          <v-icon small>mdi-play</v-icon>
        </v-btn>
        <v-btn x-small :value="2" @click="speedX *= 2">
          <v-icon small>mdi-fast-forward</v-icon>
        </v-btn>
      </v-btn-toggle>
      <span v-if="speedFactor > 1" class="mx-2">
        {{ speedFactor }}x
      </span>
      <!-- reset -->
      <v-tooltip top v-if="showReset">
        <template v-slot:activator="{ on, attrs }">
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
          Back to real-time
        </span>
      </v-tooltip>
      <!-- days from epoch warning -->
      <v-tooltip top v-if="daysFromEpoch > 14">
        <template v-slot:activator="{ on, attrs }">
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
          TLE epoch is {{ daysFromEpoch }} days away from current datetime.<br>
          Prediction might be inaccurate
        </span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import { toISOString } from "@/utils/date"

import { getEpochTimestamp } from "tle.js";

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
      speed: 1,
      speedX: 1,
      ticker: null,
      relative: {
        date: null,
        time: null,
      },
      dialogs: {
        date: false,
        time: false
      },
    }
  },

  created() {
    this.tick()
  },

  destroyed() {
    clearTimeout(this.ticker)
  },

  computed: {
    showReset() {
      return Math.abs(this.shiftMs) > 0 || this.speedFactor > 1
    },

    daysFromEpoch() {
      const diff = Math.abs(this.clock.getTime() - this.tleEpoch)
      const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
      return days
    },

    speedFactor() {
      return this.speed > 0 ? this.speedX : 1
    }
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
      this.reset()
    },

    tick() {
      if (this.speed > 0) {
        let now
        // if play, and real-time (no shift)
        if (this.speed == 1 && this.shiftMs == 0) {
          // accurate now
          now = new Date()
        } else {
          // shifted clock
          now = this.clock
          now.setSeconds(this.clock.getSeconds() + 1)
          if (this.speedFactor > 1) {
            this.shiftMs += this.speedFactor
          }
        }
        // set clock
        this.clock = new Date(now.getTime() + this.shiftMs)
        this.updateRelativeDateTime()
      }
      // schedule ticker
      this.ticker = setTimeout(this.tick, 1000 / this.speedFactor)
    },

    reset() {
      clearTimeout(this.ticker)
      this.speed = 1
      this.speedX = 1
      this.shiftMs = 0
      this.tick()
    }
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

    speed() {
      if (this.speed <= 1) {
        this.speedX = 1
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
  }
}
</script>