package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/alexjomin/golive/data"
	"github.com/alexjomin/golive/model"
	"github.com/gorilla/mux"
)

// Handler is a custom handler
type Handler struct {
	Source data.Source
}

// Error The HTTP error payload
type Error struct {
	Message string
}

// Delete remove an entry with given key
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {

	p := mux.Vars(r)
	id := p["id"]

	err := h.Source.Delete(id)

	if err != nil {
		e := Error{
			Message: fmt.Sprintf("An error occured when trying to delete the delivery : %s", err),
		}
		JSONWithHTTPCode(w, e, 500)
		return
	}

	JSONWithHTTPCode(w, nil, 204)

}

// Create a new delivery
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	defer r.Body.Close()

	var t model.Delivery
	err := decoder.Decode(&t)

	if err != nil {
		e := Error{
			Message: "An error has occured during the parsing of the body",
		}
		JSONWithHTTPCode(w, e, 400)
		return
	}

	if t.Software == "" {
		e := Error{
			Message: "The software is mandatory",
		}
		JSONWithHTTPCode(w, e, 400)
		return
	}

	if t.Version == "" {
		e := Error{
			Message: "The version is mandatory",
		}
		JSONWithHTTPCode(w, e, 400)
		return
	}

	n := time.Now().UTC().Format(time.RFC3339)
	t.Date = n

	err = h.Source.Insert(n, t)

	if err != nil {
		e := Error{
			Message: "An error occured when trying to create the delivery",
		}
		JSONWithHTTPCode(w, e, 500)
		return
	}

	JSONWithHTTPCode(w, t, 201)

}

// Get returns all the deliveries
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {

	data, err := h.Source.GetAll()

	if err != nil {
		e := Error{
			Message: "An error occured when trying to retrieve the deliveries",
		}
		JSONWithHTTPCode(w, e, 500)
		return
	}

	JSON(w, data)

}

// Heatmap returns a list of timestamp where delivery occurs
func (h *Handler) Heatmap(w http.ResponseWriter, r *http.Request) {

	data, err := h.Source.GetAll()

	if err != nil {
		e := Error{
			Message: "An error occured when trying to retrieve the deliveries",
		}
		JSONWithHTTPCode(w, e, 500)
		return
	}

	layout := "2006-01-02T15:04:05Z"

	rtr := map[string]int{}

	for _, d := range data {
		t, _ := time.Parse(layout, d.Date)
		ts := fmt.Sprintf("%d", t.Unix())
		rtr[ts] = 1
	}

	JSON(w, rtr)

}

// JSON Outputs a JSON
func JSON(w http.ResponseWriter, d interface{}) {
	JSONWithHTTPCode(w, d, http.StatusOK)
}

// JSONWithHTTPCode Json Output with an HTTP code
func JSONWithHTTPCode(w http.ResponseWriter, d interface{}, code int) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(code)
	if d != nil {
		err := json.NewEncoder(w).Encode(d)
		if err != nil {
			// panic will cause the http.StatusInternalServerError to be send to users
			panic(err)
		}
	}
}
