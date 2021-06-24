<template>
  <div>
    {{ lat }}, {{ lng}}
  </div>
</template>

<script>
export default {
  props: {
    coords: {
      type: Object,
      required: true
    }
  },

  computed: {
    lat() {
      const dir = this.coords.lat > 0 ? "N" : "S"
      return `${this.coords.lat} ${dir}`
    },
    lng() {
      const dir = this.coords.lng > 0 ? "E" : "W"
      return `${this.coords.lng} ${dir}`
    },
  }
}
</script>