package main

import (
	"log"

	"tyst.com/snippet/server"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	s := &server.Server{
		Port: 8090,
	}

	s.Start()

	return nil
}
