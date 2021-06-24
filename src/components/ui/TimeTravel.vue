<template>
  <div class="d-flex flex-row align-center">
    <!-- date -->
    <v-dialog
      v-model="dialogs.date"
      persistent
      width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          class="text-subtitle-1"
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
      persistent
      width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          class="mx-2 text-subtitle-1"
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
    <!-- back -->
    <v-icon v-if="shiftMs > 0" class="mr-2" small @click="shiftMs = 0">
      mdi-backup-restore
    </v-icon>
  </div>
</template>

<script>
import { toISOString } from "@/utils/date"

export default {
  data() {
    return {
      paused: false,
      date: null,
      time: null,
      clock: new Date(),
      shiftMs: 0,
      relative: {
        date: null,
        time: null,
      },
      dialogs: {
        date: false,
        time: false
      },
      speed: 1,
      ticker: null
    }
  },

  created() {
    this.tick()
  },

  destroyed() {
    clearTimeout(this.ticker)
  },

  methods: {
    updateDateTime() {
      this.date = this.relative.date
      this.time = this.relative.time
    },

    updateDisplayDateTime () {
      const [date, fulltime] = toISOString(this.clock).split("T")
      const [time] = fulltime.split(".")
      this.relative.date = date
      this.relative.time = time
    },

    travel() {
      const now = new Date()
      console.log("> traveling to", this.date, this.time)
      const [year, month, day] = this.date.split("-")
      const [hour, minute] = this.time.split(":")
      const start = new Date(year, month-1, day, hour, minute, now.getSeconds())
      this.shiftMs = now.getTime() - start.getTime()
      this.dialogs.date = this.dialogs.time = false
    },

    tick() {
      if (!this.paused) {
        const now = new Date()
        this.clock = new Date(now.getTime() - this.shiftMs)
        this.updateDisplayDateTime()
      }
      this.ticker = setTimeout(this.tick, this.speed * 1000)
    },
  },

  watch: {
    clock() {
      this.$store.commit("setTimestamp", this.clock.getTime())
    },

    shiftMs() {
      clearTimeout(this.ticker)
      this.tick()
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