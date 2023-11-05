package main

import (
	"GUI/simpledtg/src/server"
	"flag"
	"time"
)

func main() {
	port := flag.String("port", "3999", "websocket port")
	flag.Parse()

	wss := server.CreateWSServer(server.UsePort(":" + *port))
	time.Sleep(30 * time.Second)
	wss.Stop()
	time.Sleep(1 * time.Second)
}
