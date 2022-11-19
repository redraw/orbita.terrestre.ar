package geo

import (
	"net/http"
	"strings"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	header := w.Header()
	for key, values := range r.Header {
		if strings.HasPrefix(strings.ToLower(key), "x-vercel-ip") {
			for _, value := range values {
				header.Add(key, value)
			}
		}
	}
	w.WriteHeader(200)
}
