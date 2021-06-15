package handler

import (
	"fmt"
	"io"
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")

	if url == "" {
		w.WriteHeader(400)
		fmt.Fprint(w, "Missing url")
	}

	response, err := http.Get(url)
	if err != nil {
		w.WriteHeader(400)
		fmt.Fprint(w, err.Error())
	}
	defer response.Body.Close()

	io.Copy(w, response.Body)
}
