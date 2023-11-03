package main

import (
	"GUI/simpledtg/src/server"
	"fmt"
	"time"
)

func main() {
	s := server.CreateServer()
	go s.Start()

	time.Sleep(10 * time.Second)
	fmt.Println("Force Closing")
	s.Stop()

	time.Sleep(1 * time.Second)
}
