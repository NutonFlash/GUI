package server

import (
	"GUI/simpledtg/src/server/connection"
	"GUI/simpledtg/src/server/event"
	"context"
	"fmt"
	"net/http"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type WSServer struct {
	Options Options
	srv     *http.Server
}

func CreateWSServer(options ...ServerOption) *WSServer {
	opts := DefaultOptions()
	for _, option := range options {
		option(&opts)
	}

	opts.Type = "wss"
	opts.isRunning = true

	serv := http.Server{Addr: opts.Port}
	wss := WSServer{opts, &serv}

	http.HandleFunc("/dtg", wss.HandeConnectDTG())

	go func() {
		serv.ListenAndServe()
	}()

	return &wss
}

func (wss *WSServer) HandeConnectDTG() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Connection Request")
		c, err := websocket.Accept(w, r, &websocket.AcceptOptions{OriginPatterns: []string{"localhost:5500"}})
		if err != nil {
			fmt.Println(err)
			return
		}

		go func() {
			conn := connection.DTGConnection{WSCon: c}

			for wss.Options.isRunning {
				ctx := context.WithoutCancel(r.Context())

				var evt event.SocketEvent
				err = wsjson.Read(ctx, c, &evt)
				if err != nil {
					fmt.Println(err)
					break
				}

				evt.Handle(&conn, func(v any) {
					wsjson.Write(ctx, c, v)
				})

				if evt.Event == "close" {
					fmt.Println("Close Command Received")
					conn.Close()
					break
				}
			}
			conn.Close()
			fmt.Println("Socket Closed")
		}()

	}
}

func (wss *WSServer) Stop() {
	if !wss.Options.isRunning {
		return
	}

	wss.Options.isRunning = false
	wss.srv.Shutdown(context.Background())
}
