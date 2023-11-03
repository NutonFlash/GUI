package main

import (
	"GUI/simpledtg/src/server"
	"fmt"
	"time"
)

func main() {
	s := server.CreateServer()
	go s.Start()

	time.Sleep(30 * time.Second)
	fmt.Println("Force Closing")
	s.Stop()
}
