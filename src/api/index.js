import http from 'axios'
import TLE_SAMPLE from './tle-sample.txt'


async function getTLEs(query) {
  let response

  const params = new URLSearchParams({
    "FORMAT": "tle",
    ...query
  })

  if (process.env.NODE_ENV === "production" || process.env.VUE_APP_USE_CELESTRAK === "true") {
    response = await http.get("/api/celestrak", { params });
  } else {
    console.warn("Using mocked TLE data! If you need to make real queries, export VUE_APP_USE_CELESTRAK=true")
    response = { data: TLE_SAMPLE }
  }

  const data = response.data.split("\n");
  let tles = [];

  for (let i = 0; i < data.length; i += 3) {
    let tle = data.slice(i, i + 3).map(line => line.trim());
    if (tle.length === 3) {
      tles.push(tle);
    }
  }

  return tles;
}

async function getLocationFromCoords(coords) {
  const params = new URLSearchParams({
    lat: coords.latitude,
    lon: coords.longitude,
    format: "json"
  })

  try {
    const response = await http.get("https://nominatim.openstreetmap.org/reverse", { params })
    return response.data.address
  } catch (e) {
    console.error(e)
    return {}
  }
}

async function getLocationFromIp() {
  let response
  if (process.env.NODE_ENV === "production") {
    response = await http.get("/api/geoip");
  } else {
    response = {
      headers: {
        "x-vercel-ip-city": "Neuquén", 
        "x-vercel-ip-country": "Argentina", 
        "x-vercel-ip-latitude": "-38.9412137", 
        "x-vercel-ip-longitude": "-68.1854411",
      }
    }
  }
  return {
    city: response.headers["x-vercel-ip-city"],
    country: response.headers["x-vercel-ip-country"],
    latitude: parseFloat(response.headers["x-vercel-ip-latitude"]),
    longitude: parseFloat(response.headers["x-vercel-ip-longitude"]),
  }
}

export default {
  getTLEs,
  getLocationFromCoords,
  getLocationFromIp,
}
