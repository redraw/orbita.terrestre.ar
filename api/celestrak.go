package handler

import (
	"fmt"
	"io"
	"strings"
	"net/http"
)


func copyGeoHeaders(src, dest http.Header) {
	for key, values := range src {
		if strings.HasPrefix(strings.ToLower(key), "x-vercel-ip") {
			for _, value := range values {
				dest.Add(key, value)
			}
		}
	}
}

func Handler(w http.ResponseWriter, r *http.Request) {
	url := fmt.Sprintf("https://celestrak.com/NORAD/elements/gp.php?%s", r.URL.RawQuery)

	response, err := http.Get(url)
	if err != nil {
		w.WriteHeader(400)
		fmt.Fprint(w, err.Error())
	}
	defer response.Body.Close()

	copyGeoHeaders(r.Header, w.Header())
	w.WriteHeader(response.StatusCode)
	io.Copy(w, response.Body)
}
