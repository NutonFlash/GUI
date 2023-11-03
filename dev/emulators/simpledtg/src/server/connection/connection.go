package connection

import "GUI/simpledtg/src/dtg"

type Connection struct {
	DTG    *dtg.DTG
	isOpen bool
}
