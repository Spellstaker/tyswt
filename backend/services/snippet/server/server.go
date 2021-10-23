package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Server struct {
	Port uint
}

func (s *Server) Start() {
	registerRoutes(s)

	log.Print("Starting server for snippet service")
	http.ListenAndServe(fmt.Sprintf(":%d", s.Port), nil)
}

func (s *Server) handleSnippetGet() http.HandlerFunc {
	log.Print("Registering handler for Snippet Get")

	type response struct {
		Snippet string `json:"snippet"`
	}

	return func(w http.ResponseWriter, req *http.Request) {
		log.Printf("Handling request: %+v", req.URL)

		lang := req.URL.Query().Get("lang")
		if lang == "" {
			lang = randomLang()
		}

		snippet, err := randomSnippet(lang)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		res := response{
			Snippet: snippet,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	}
}
