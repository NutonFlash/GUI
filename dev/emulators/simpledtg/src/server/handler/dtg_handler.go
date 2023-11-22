package handler

import (
	"GUI/simpledtg/src/dtg"
	"GUI/simpledtg/src/server/connection"
	"fmt"
	"strconv"
)

type HandlerResponse struct {
	Message string `json:"message"`
}

func DTGHandler(payload *map[string]interface{}, conn *connection.DTGConnection, send func(v any) error) {
	action := (*payload)["action"].(string)
	switch action {
	case "bind":
		id := (*payload)["id"].(string)
		if _dtg, ok := conn.DTGPool.Get(id); ok {
			conn.DTG = _dtg
			_dtg.BindRecv(send)
			conn.IsBind = true
		} else {
			send(HandlerResponse{"Failed to bind to DTG, id not found"})
		}

		break
	case "init":
		data := (*payload)["data"].(map[string]interface{})

		lat := int64(data["lat"].(float64) * dtg.FactorLatLng)
		lng := int64(data["lng"].(float64) * dtg.FactorLatLng)

		if conn.DTG != nil {
			conn.DTG.End()
		}

		conn.DTG = dtg.CreateDTG(lat, lng, send, func(id string) {
			conn.DTGPool.Remove(id)
		})

		conn.DTGPool.Add(conn.DTG)

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
		accel := (*payload)["brake"].(string)
		conn.DTG.Brake(dtg.Accels[accel])
		break
	case "turn":
		deg, err := strconv.Atoi((*payload)["deg"].(string))
		if err != nil {
			fmt.Println("Deg Type Mismatch:", err)
			return
		}
		deg *= dtg.FactorDeg
		conn.DTG.Turn(int16(deg))
	case "end":
		conn.DTG.End()
	}
}
