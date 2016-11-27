package main

import (
	"log"
	"net/http"
	"os"

	"github.com/alexjomin/golive/data"
	"github.com/alexjomin/golive/handler"
	"github.com/gorilla/mux"
)

func main() {

	log.SetOutput(os.Stdout)

	config := map[string]string{}
	config["path"] = "./db"

	port := "80"

	if len(os.Args) > 1 {
		config["path"] = os.Args[1]
	}

	if len(os.Args) > 2 {
		port = os.Args[2]
	}

	s, err := data.NewSource(data.SourceBolt, config)

	if err != nil {
		log.Fatalf("Can't get a data source at startup, %s", err)
	}

	h := &handler.Handler{
		Source: s,
	}

	r := mux.NewRouter()

	r.HandleFunc("/api/deliveries", h.Get).Methods(http.MethodGet)
	r.HandleFunc("/api/deliveries/{id}", h.Delete).Methods(http.MethodDelete)
	r.HandleFunc("/api/deliveries", h.Create).Methods(http.MethodPost)
	r.HandleFunc("/api/heatmap", h.Heatmap).Methods(http.MethodGet)

	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./static"))))

	log.Printf("Path of database : %s", config["path"])
	log.Printf("Start http server on port : %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
