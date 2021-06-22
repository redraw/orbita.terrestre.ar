<template>
  <div class="d-flex flex-row align-end">
    <!-- DATE -->
    <v-dialog
      ref="dateDialog"
      v-model="dialogs.date"
      :return-value.sync="date"
      persistent
      width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          v-text="real.date"
          v-bind="attrs"
          v-on="on"
          @click="updateDateTime"
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
          @click="$refs.dateDialog.save(date)"
        >
          OK
        </v-btn>
      </v-date-picker>
    </v-dialog>
    <!-- TIME -->
    <v-dialog
      ref="dialog"
      v-model="dialogs.time"
      :return-value.sync="time"
      persistent
      width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          class="mx-2"
          v-text="real.time"
          v-bind="attrs"
          v-on="on"
        />
      </template>
      <v-time-picker
        v-if="dialogs.time"
        v-model="time"
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
          @click="$refs.dialog.save(time)"
        >
          OK
        </v-btn>
      </v-time-picker>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      speed: 1,
      pause: false,
      clock: new Date(),
      date: null,
      time: null,
      real: {
        date: null,
        time: null,
      },
      dialogs: {
        date: false,
        time: false
      }
    }
  },

  created() {
    this.refresh()
  },

  methods: {
    updateDateTime() {
      this.date = this.real.date
      this.time = this.real.time
    },

    updateRealDateTime () {
      console.log(this.clock)
      this.real.date = this.clock.toISOString().substr(0, 10)
      this.real.time = this.clock.toTimeString().substr(0, 8)
    },

    refresh() {
      setTimeout(() => {
        if (!this.pause) {
          this.clock.setSeconds(this.clock.getSeconds() + this.speed)
          this.updateRealDateTime()
        }
        this.refresh()
      }, this.speed * 1000)
    }
  },

  watch: {
    clock() {
      this.$store.commit("setTimestamp", this.clock.getTime())
    },

    date() {
      this.clock = new Date(this.date)
    },

    time() {
      this.clock = new Date(this.time)
    }
  }
}
</script>