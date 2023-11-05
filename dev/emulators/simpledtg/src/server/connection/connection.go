package connection

import (
	"GUI/simpledtg/src/dtg"
	"net"
	"nhooyr.io/websocket"
)

type DTGConnection struct {
	DTG    *dtg.DTG
	Con    *net.Conn
	WSCon  *websocket.Conn
	IsOpen bool
}

func (c *DTGConnection) Close() {
	if !c.IsOpen {
		return
	}
	c.IsOpen = false

	if c.Con != nil {
		(*c.Con).Close()
	}

	if c.WSCon != nil {
		c.WSCon.Close(websocket.StatusNormalClosure, "")
	}

	if c.DTG != nil {
		c.DTG.End()
	}
}
