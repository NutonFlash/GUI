package handler

import (
	"GUI/simpledtg/src/dtg"
	"GUI/simpledtg/src/server/connection"
)

func DTGHandler(payload *map[string]interface{}, conn *connection.DTGConnection, send func(v any)) {
	action := (*payload)["action"].(string)
	switch action {
	case "init":
		data := (*payload)["data"].(map[string]interface{})

		lat := int64(data["lat"].(float64) * dtg.FactorLatLng)
		lng := int64(data["lng"].(float64) * dtg.FactorLatLng)

		if conn.DTG != nil {
			conn.DTG.End()
		}

		conn.DTG = dtg.CreateDTG(lat, lng, send)
		conn.DTG.Run()
		break
	case "engine":
		on := (*payload)["on"].(bool)
		conn.DTG.Engine(on)
		break
	case "accelerate":
		accel := (*payload)["accel"].(string)
		conn.DTG.Accelerate(dtg.Accels[accel])
		break
	case "brake":
		accel := (*payload)["accel"].(string)
		conn.DTG.Brake(dtg.Accels[accel])
		break
	case "turn":
		deg := (*payload)["deg"].(float64) * dtg.FactorDeg
		conn.DTG.Turn(uint16(deg))
	case "end":
		conn.DTG.End()
	}
}
