package dtg

import (
	"fmt"
	"math"
	"time"
)

const (
	FactorLatLng = 100_000_000
	FactorDeg    = 1_00
	TickSpeed    = 20
	SpeedLimit   = 13_000
	MaxSpeed     = 17_000
	BaseAccel    = 300
)

type LatLng struct {
	Lat          int64 `json:"lat"`
	Lng          int64 `json:"lng"`
	FactorLatLng int   `json:"factor_latlng"`
}

func (l *LatLng) String() (string, string) {
	return fmt.Sprintf("%d.%d", l.Lat/FactorLatLng, l.Lat%FactorLatLng), fmt.Sprintf("%d.%d", l.Lng/FactorLatLng, l.Lng%FactorLatLng)
}

type Accel int32

const (
	Accel_Reverse Accel = -1
	Accel_None    Accel = 0
	Accel_Low     Accel = 1
	Accel_Medium  Accel = 2
	Accel_High    Accel = 3
)

var Accels = map[string]Accel{"reverse": Accel_Reverse, "none": Accel_None, "low": Accel_Low, "medium": Accel_Medium, "high": Accel_High}

// DTG assumes that 1 DD is equal to 1 meter.
type DTG struct {
	LatLng        LatLng `json:"latlng"`       // LatLng is the position of the vehicle in Decimal Degrees (DD)
	Speed         int32  `json:"speed"`        // Speed of the vehicle in Decimal Degrees (DD)
	Orientation   uint16 `json:"orientation"`  // Orientation of the vehicle in Degrees
	Acceleration  int32  `json:"acceleration"` // Acceleration of the vehicle in Decimal Degrees (DD)
	RunTime       int64  `json:"runtime"`      // RunTime is the total time elapsed since Run() in Milliseconds
	Distance      int64  `json:"distance"`     // Distance travelled by the vehicle since Run() in Decimal Degrees (DD)
	OverSpeed     int64  `json:"overspeed"`    // OverSpeed is the total distance travelled by the vehicle during speeds of over SpeedLimit in Decimal Degrees (DD)
	IdleTime      int64  `json:"idle_time"`    // IdleTime is the total time elapsed while engine is on and 0 vector and acceleration in Milliseconds
	SuddenAccel   int16  `json:"sudden_accel"` // SuddenAccel is the total amount of times that the vehicle had a high rate of acceleration
	SuddenBrake   int16  `json:"sudden_brake"` // SuddenBrake is the total amount of times that the vehicle had a high rate of deceleration
	VehicleID     string `json:"vehicle_id"`
	DriverID      string `json:"driver_id"`
	EngineRunning bool   `json:"engine_running"`
	FactorDeg     int    `json:"factor_deg"`
	FactorSpeed   int    `json:"factor_speed"`
	isBraking     bool
	nextTick      time.Time
	isRunning     bool
	startTime     time.Time
	send          func(v any)
}

func (dtg *DTG) _Run() {
	elapsed := time.Since(time.Now())
	for dtg.isRunning {
		dtg.nextTick = time.Now().Add(TickSpeed * time.Millisecond)

		if dtg.EngineRunning {
			elapsed = time.Since(dtg.startTime)

			dtg.RunTime += elapsed.Milliseconds()
			dtg.startTime = time.Now()
		}

		if dtg.Acceleration > 0 {
			accel := dtg.Acceleration

			if dtg.isBraking {
				accel *= -1
			}

			dtg.Speed = max(min(dtg.Speed+speedPerTick(accel, elapsed), MaxSpeed), 0)
		}

		if dtg.Speed > 0 {
			theta := dtg.Orientation

			// signs per quadrant
			SignsLng := [4]int64{-1, -1, 1, 1}
			SignsLat := [4]int64{1, -1, -1, 1}

			var sLng int64 = 1
			var sLat int64 = 1

			var quadrant int

			// reverse signs if braking
			if dtg.isBraking {
				sLng = -1
				sLat = -1
			}

			// determine quadrant and apply sign
			for q, quad := range [4]uint16{270 * FactorDeg, 180 * FactorDeg, 90 * FactorDeg, 0 * FactorDeg} {
				if theta >= quad {
					theta -= quad

					sLng *= SignsLng[q]
					sLat *= SignsLat[q]

					quadrant = q
					break
				}
			}

			// calculate displacement vector
			dLat := sLat * int64(float64(speedPerTick(dtg.Speed, elapsed))*(getLatFunc(quadrant)(ToRad(theta))))
			dLng := sLng * int64(float64(speedPerTick(dtg.Speed, elapsed))*(getLngFunc(quadrant)(ToRad(theta))))

			dtg.LatLng.Lat += dLat
			dtg.LatLng.Lng += dLng

			d := IntAbs(dLat) + IntAbs(dLng)

			dtg.Distance += d
			if dtg.Speed > SpeedLimit {
				dtg.OverSpeed += d
			}

		} else {
			if dtg.EngineRunning {
				dtg.IdleTime += TickSpeed
			}

			if dtg.isBraking {
				dtg.isBraking = false
				dtg.Acceleration = 0
			}
		}

		dtg.send(*dtg)
		time.Sleep(time.Until(dtg.nextTick))
	}
	fmt.Println("DTG Stopped")
}

// Run runs dtg in a goroutine
func (dtg *DTG) Run() {
	dtg.isRunning = true
	go dtg._Run()
}

func (dtg *DTG) End() {
	dtg.isRunning = false
	fmt.Println("Stopping DTG")
}

func (dtg *DTG) Accelerate(accel Accel) {
	if !dtg.EngineRunning {
		return
	}

	prevAcc := dtg.Acceleration

	dtg.isBraking = false
	dtg.Acceleration = int32(accel) * BaseAccel

	if prevAcc != int32(accel-1)*BaseAccel {
		dtg.SuddenAccel++
	}
}

func (dtg *DTG) Brake(accel Accel) {
	prevAcc := dtg.Acceleration
	wasBraking := dtg.isBraking

	dtg.Acceleration = int32(accel) * BaseAccel
	dtg.isBraking = true

	if !wasBraking {
		if dtg.Acceleration > int32(Accel_Low)*BaseAccel {
			dtg.SuddenBrake++
		}
	} else {
		if prevAcc != int32(accel-1)*BaseAccel {
			dtg.SuddenBrake++
		}
	}
}

// Turn degree has 2 decimal precision
func (dtg *DTG) Turn(deg uint16) {
	dtg.Orientation = (dtg.Orientation + deg) % (360 * FactorDeg)
}

func (dtg *DTG) Engine(on bool) {
	dtg.EngineRunning = on

	dtg.startTime = time.Now()

	if !dtg.EngineRunning {
		dtg.Brake(Accel_Low)
	} else {
		dtg.startTime = time.Now()
	}
}

func CreateDTG(lat int64, lng int64, send func(v any)) *DTG {
	dtg := DTG{FactorDeg: FactorDeg, FactorSpeed: 1_000}
	dtg.LatLng = LatLng{lat, lng, FactorLatLng}
	dtg.send = send

	return &dtg
}

func IntAbs(n int64) int64 {
	if n < 0 {
		return n * -1
	}
	return n
}

func ToDeg(rad float64) uint16 {
	return uint16(((180 * FactorDeg) / 314) * rad)
}

func ToRad(deg uint16) float64 {
	return float64(deg) * 314 / (180 * FactorDeg)
}

func getLngFunc(quadrant int) func(f float64) float64 {
	if quadrant%2 == 0 {
		return math.Sin
	}
	return math.Cos
}

func getLatFunc(quadrant int) func(f float64) float64 {
	return getLngFunc(quadrant + 1)
}

func speedPerTick(speed int32, elapsed time.Duration) int32 {
	return int32(float32(speed) * (float32(elapsed.Milliseconds()) / 1000.0))
}
