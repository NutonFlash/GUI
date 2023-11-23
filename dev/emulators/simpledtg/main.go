package main

import (
	"GUI/simpledtg/src/server"
	"flag"
	"fmt"
	"time"
)

func main() {
	port := flag.String("port", "3999", "websocket port")
	flag.Parse()

	wss := server.CreateWSServer(server.UsePort(":" + *port))

	for wss.Options.IsRunning {
		time.Sleep(time.Second * 3)
	}

	fmt.Println("Server Stopped")
}
