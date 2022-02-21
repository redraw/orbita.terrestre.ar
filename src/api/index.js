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

export default {
  getTLEs
}
