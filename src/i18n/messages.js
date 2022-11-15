export default {
  es: {
    hello: {
      title: "Bienvenido terrícola!",
      content: `
Esta web muestra satélites en tiempo real. <br>
<br>
Podés usar el buscador para elegir uno, y viajar en el tiempo usando los controles de abajo a la izquierda.<br>
<br>
Clickeando en el icono de GPS podes ver la telemetría del satelite con respecto a tu posición geográfica.
`,
      close: "Cerrar",
    },
    menu: {
      locate_me: "Localizarme",
      telemetry: "Mostrar telemetría",
      follow_satellite: "Seguír satélite",
      solar_terminator: "Mostrar sombra del sol",
      info: "Info",
    },
    telemetry: {
      name: "nombre",
      norad: "norad",
      lat: "lat",
      lng: "lng",
      height: "altura",
      velocity: "velocidad",
      azimuth: "azimuth",
      altitude: "altitud",
      distance: "distancia",
    },
    timetravel: {
      back: "Volver a tiempo real",
      outdated_tle: "Los datos TLE están {daysFromEpoch} dias atrasados respecto a hoy. La predicción puede no ser precisa.",
      share: "Compartir link",
      shared: "Copiado! {url}",
    }
  },
  en: {
    hello: {
      title: "Welcome human!",
      content: `
This website display satellites in real-time. <br>
<br>
You can use the search bar to choose one, and time travel using the control on the bottom left.<br>
<br>
You can setup your observer position by clicking the GPS button, and satellite telemetry will be added relative to your position.
`,
      close: "Close",
    },
    menu: {
      locate_me: "Locate me",
      telemetry: "Show telemetry panel",
      follow_satellite: "Follow satellite",
      solar_terminator: "Solar terminator",
      info: "Info",
    },
    telemetry: {
      name: "name",
      norad: "norad",
      lat: "lat",
      lng: "lng",
      height: "height",
      velocity: "velocity",
      azimuth: "azimuth",
      altitude: "altitude",
      distance: "distance",
    },
    timetravel: {
      back: "Back to real-time",
      outdated_tle: "TLE epoch is {daysFromEpoch} days away from current datetime. Prediction might be inaccurate",
      share: "Share link at exact time",
      shared: "Copied! {url}",
    }
  },
}