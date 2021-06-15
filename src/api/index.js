import http from 'axios'
import TLE_SAMPLE from './tle-sample.txt'


async function getTLEs(query) {
  let response

  const params = new URLSearchParams({
    "FORMAT": "tle",
    ...query
  })

  if (process.env.NODE_ENV == "development") {
    response = { data: TLE_SAMPLE }
  } else {
    response = await http.get("/api/proxy", {
      params: { url: `https://celestrak.com/NORAD/elements/gp.php?${params}` }
    });
  }

  const data = response.data.split("\n");
  let tles = [];

  for (let i = 0; i < data.length; i += 3) {
    let tle = data.slice(i, i + 3);
    tles.push(tle);
  }
  
  return tles;
}

export default {
  getTLEs
}