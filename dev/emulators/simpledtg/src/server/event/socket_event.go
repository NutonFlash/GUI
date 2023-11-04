package event

import (
	"GUI/simpledtg/src/server/connection"
	"GUI/simpledtg/src/server/handler"
)

type SocketEvent struct {
	Event   string                 `json:"event"`
	Payload map[string]interface{} `json:"payload"`
}

func (e *SocketEvent) Handle(conn *connection.DTGConnection, send func(v any)) {
	//handle event
	switch e.Event {
	case "test":
		send(handler.TestHandler(&e.Payload))
		break
	case "dtg":
		handler.DTGHandler(&e.Payload, conn, send)
		break
	}
}
