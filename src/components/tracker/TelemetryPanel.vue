<template>
  <l-control
    class="d-none d-sm-flex"
    position="topright"
  >
    <v-simple-table dense style="background-color: rgba(0, 0, 0, 0.5)">
      <template v-slot:default>
        <tbody>
          <tr v-for="(value, key, idx) in data" :key="idx">
            <td>
              <b>{{ key }}</b>
            </td>
            <td>{{ value.toFixed(2) }}{{ unit(key) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </l-control>
</template>

<script>
import { LControl } from "vue2-leaflet"

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },

  components: {
    LControl
  },

  methods: {
    unit(key) {
      switch (key) {
        case "lat":
        case "lng":
        case "azimuth":
        case "elevation":
          return "°";
        case "range":
        case "height":
          return " km";
        case "velocity":
          return " km/s";
      }
    },
  }
};
</script>