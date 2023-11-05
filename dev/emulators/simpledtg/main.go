package main

import (
	"GUI/simpledtg/src/server"
	"time"
)

func main() {
	wss := server.CreateWSServer()
	time.Sleep(30 * time.Second)
	wss.Stop()
	time.Sleep(1 * time.Second)
}
