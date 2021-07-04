package handler

import (
	"fmt"
	"io"
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	url := fmt.Sprintf("https://celestrak.com/NORAD/elements/gp.php?%s", r.URL.RawQuery)

	response, err := http.Get(url)
	if err != nil {
		w.WriteHeader(400)
		fmt.Fprint(w, err.Error())
	}
	defer response.Body.Close()

	io.Copy(w, response.Body)
}
