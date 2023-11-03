package connection

import (
	"GUI/simpledtg/src/dtg"
	"net"
)

type DTGConnection struct {
	DTG    *dtg.DTG
	Con    *net.Conn
	IsOpen bool
}

func (c *DTGConnection) Close() {
	if !c.IsOpen {
		return
	}

	c.IsOpen = false
	(*c.Con).Close()

	if c.DTG != nil {
		c.DTG.End()
	}
}
