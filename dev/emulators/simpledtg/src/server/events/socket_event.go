package events

import (
	"GUI/simpledtg/src/server/handlers"
	"net"
)

type SocketEvent struct {
	Action  string                 `json:"action"`
	Payload map[string]interface{} `json:"payload"`
}

func (e *SocketEvent) Handle(connection *net.Conn, send func(v any)) {
	//handle events
	switch e.Action {
	case "test":
		res := handlers.TestHandler(&e.Payload)
		send(res)
		break
	case "close":
		(*connection).Close()
		break
	}
}
