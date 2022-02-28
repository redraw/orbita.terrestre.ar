<template>
  <div>
    <Plotly
      :data="data"
      :layout="layout"
      :display-mode-bar="false"
    />
  </div>
</template>

<script>
import { Plotly } from "vue-plotly";

export default {
  components: {
    Plotly
  },

  props: {
    satName: {
      type: String,
      default: "Satellite"
    },

    telemetry: {
      type: Object,
      required: true,
    },

    currentPass: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  data() {
    return {
      layout: {
        autosize: true,
        width: 250,
        height: 250,
        margin: { b: 35, l: 35, t: 35, r: 35 },
        font: {
          family: "monospace",
          color: "white",
          size: 10
        },
        polar: {
          bgcolor: "black",
          gridshape: "linear",
          radialaxis: {
            // showticklabels: false,
            ticklabelstep: 2,
            ticksuffix: "°",
            range: [90, 0],
            nticks: 8
          },
          angularaxis: {
            ticktext: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
            tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
            direction: "clockwise",
            rotation: 90
          }
        },
        paper_bgcolor: "transparent"
      }
    };
  },

  computed: {
    data() {
      return [
        {
          type: "scatterpolargl",
          mode: "lines",
          showlegend: false,
          r: this.currentPass.map(({lat}) => lat),
          theta: this.currentPass.map(({az}) => az),
          text: this.currentPass.map(({ts}) => new Date(ts)),
          hoverlabel: {
            align: "left",
          },
          hovertemplate:
            "<i>az</i>: %{theta}<br><i>alt<i>: %{r}°<extra>%{text|%c}</extra>",
          marker: {
            line: {
              color: this.currentPass.map(({lat}) => lat),
              cmin: 0,
              cmax: 90,
              colorscale: "Blues"
            },
          }
        },
        {
          type: "scatterpolargl",
          mode: "markers",
          showlegend: false,
          text: this.satName,
          r: [this.telemetry.elevation],
          theta: [this.telemetry.azimuth],
          hoverinfo: "text",
          marker: {
            symbol: "triangle-up",
            size: 10,
            color: "white",
          }
        }
      ];
    }
  }
};
</script>