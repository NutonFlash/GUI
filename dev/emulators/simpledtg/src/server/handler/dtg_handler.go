package handler

import (
	"GUI/simpledtg/src/dtg"
	"GUI/simpledtg/src/server/connection"
)

func DTGHandler(payload *map[string]interface{}, conn *connection.DTGConnection) dtg.DTG {
	action := (*payload)["action"].(string)
	switch action {
	case "init":
		data := (*payload)["data"].(map[string]interface{})

		lat := int32(data["lat"].(float64) * dtg.FactorLatLng)
		lng := int32(data["lng"].(float64) * dtg.FactorLatLng)

		conn.DTG = dtg.CreateDTG(lat, lng)
	}
	return *conn.DTG
}
