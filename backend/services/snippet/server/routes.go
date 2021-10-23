package server

import (
	"log"
	"net/http"
)

// registerRoutes registers routes for snippet service.
func registerRoutes(s *Server) {
	log.Print("Registering routes")

	http.HandleFunc("/snippet", s.handleSnippetGet())

	log.Print("Routes registered")
}
