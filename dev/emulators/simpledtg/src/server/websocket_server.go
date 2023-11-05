package server

import (
	"GUI/simpledtg/src/dtg/pool"
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
	DTGPool *pool.DTGPool
}

func CreateWSServer(options ...ServerOption) *WSServer {
	opts := DefaultOptions()
	for _, option := range options {
		option(&opts)
	}

	opts.Type = "wss"
	opts.IsRunning = true

	serv := http.Server{Addr: opts.Port}
	wss := WSServer{opts, &serv, pool.NewPool()}

	http.HandleFunc("/dtg", wss.HandeConnectDTG())
	http.HandleFunc("/shutdown", wss.HandleShutdown())

	go func() {
		serv.ListenAndServe()
	}()

	return &wss
}

func (wss *WSServer) HandleShutdown() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Shutting Down"))
		wss.Stop()
	}
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
			conn := connection.DTGConnection{WSCon: c, DTGPool: wss.DTGPool, IsOpen: true}

			for wss.Options.IsRunning {
				ctx := context.WithoutCancel(r.Context())

				var evt event.SocketEvent
				err = wsjson.Read(ctx, c, &evt)
				if err != nil {
					fmt.Println(err)
					break
				}

				evt.Handle(&conn, func(v any) error {
					return wsjson.Write(ctx, c, v)
				})

				if evt.Event == "close" {
					fmt.Println("Close Command Invoked")
					conn.Close()
					break
				}

				if evt.Event == "shutdown" {
					fmt.Println("Shutdown Invoked")
					wss.Stop()
				}
			}
			conn.Close()
			fmt.Println("Socket Closed")
		}()

	}
}

func (wss *WSServer) Stop() {
	if !wss.Options.IsRunning {
		return
	}

	wss.Options.IsRunning = false
	wss.srv.Shutdown(context.Background())
}
