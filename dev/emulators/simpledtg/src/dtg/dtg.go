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

type DTGResponse struct {
	Message string `json:"message"`
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
	LatLng        LatLng `json:"latlng"`       // LatLng is the position of the vehicle in Decimal Degrees (DD) multiplied by factor_latlng
	Speed         int32  `json:"speed"`        // Speed of the vehicle in meters per second multiplied by factor_speed
	Orientation   uint16 `json:"orientation"`  // Orientation of the vehicle in degrees multiplied by factor_deg
	Acceleration  int32  `json:"acceleration"` // Acceleration of the vehicle in meters per second squared, multiplied by factor_speed
	RunTime       int64  `json:"runtime"`      // RunTime is the total time elapsed since Run() with the engine on in Milliseconds
	Distance      int64  `json:"distance"`     // Distance travelled by the vehicle since Run() in Decimal Degrees (DD) multiplied by factor_latlng
	OverSpeed     int64  `json:"overspeed"`    // OverSpeed is the total distance travelled by the vehicle during speeds of over SpeedLimit in Decimal Degrees (DD) multiplied by factor_speed
	IdleTime      int64  `json:"idle_time"`    // IdleTime is the total time elapsed while engine is on and 0 speed and acceleration in Milliseconds
	SuddenAccel   int16  `json:"sudden_accel"` // SuddenAccel is the total amount of times that the vehicle had a high rate of acceleration
	SuddenBrake   int16  `json:"sudden_brake"` // SuddenBrake is the total amount of times that the vehicle had a high rate of deceleration
	VehicleID     string `json:"vehicle_id"`
	DriverID      string `json:"driver_id"`
	EngineRunning bool   `json:"engine_running"`
	FactorDeg     int    `json:"factor_deg"`
	FactorSpeed   int    `json:"factor_speed"`
	ID            string `json:"id"`
	isBraking     bool
	nextTick      time.Time
	isRunning     bool
	startTime     time.Time
	sends         []func(v any) error
	ended         func(id string)
}

func (_dtg *DTG) _Run() {
	elapsed := time.Since(time.Now())
	for _dtg.isRunning {
		_dtg.nextTick = time.Now().Add(TickSpeed * time.Millisecond)

		if _dtg.EngineRunning {
			elapsed = time.Since(_dtg.startTime)

			_dtg.RunTime += elapsed.Milliseconds()
			_dtg.startTime = time.Now()
		}

		if _dtg.Acceleration > 0 {
			accel := _dtg.Acceleration

			if _dtg.isBraking {
				accel *= -1
			}

			_dtg.Speed = max(min(_dtg.Speed+speedPerTick(accel, elapsed), MaxSpeed), 0)
		}

		if _dtg.Speed > 0 {
			theta := _dtg.Orientation

			// signs per quadrant
			SignsLng := [4]int64{-1, -1, 1, 1}
			SignsLat := [4]int64{1, -1, -1, 1}

			var sLng int64 = 1
			var sLat int64 = 1

			var quadrant int

			// reverse signs if reverse
			if _dtg.Acceleration < 0 {
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
			dLat := sLat * int64(float64(speedPerTick(_dtg.Speed, elapsed))*(getLatFunc(quadrant)(ToRad(theta))))
			dLng := sLng * int64(float64(speedPerTick(_dtg.Speed, elapsed))*(getLngFunc(quadrant)(ToRad(theta))))

			_dtg.LatLng.Lat += dLat
			_dtg.LatLng.Lng += dLng

			d := IntAbs(dLat) + IntAbs(dLng)

			_dtg.Distance += d
			if _dtg.Speed > SpeedLimit {
				_dtg.OverSpeed += d
			}

		} else {
			if _dtg.EngineRunning {
				_dtg.IdleTime += TickSpeed
			}

			if _dtg.isBraking {
				_dtg.isBraking = false
				_dtg.Acceleration = 0
			}
		}

		go func() {
			nilCount := 0
			for idx, send := range _dtg.sends {
				if send != nil {
					err := send(*_dtg)
					if err != nil {
						_dtg.sends[idx] = nil
						nilCount++
					}
				} else {
					nilCount++
				}
			}

			if nilCount == len(_dtg.sends) {
				_dtg.End()
			}
		}()

		time.Sleep(time.Until(_dtg.nextTick))
	}
	_dtg.ended(_dtg.ID)
	fmt.Println("DTG Stopped")
}

func (_dtg *DTG) BindRecv(send func(v any) error) {
	_dtg.sends[1] = send
}

// Run runs dtg in a goroutine
func (_dtg *DTG) Run() {
	_dtg.isRunning = true
	go _dtg._Run()
}

func (_dtg *DTG) End() {
	_dtg.isRunning = false

	go func() {
		for _, send := range _dtg.sends {
			if send != nil {
				send(DTGResponse{"DTG Ended"})
			}
		}
	}()

	fmt.Println("Stopping DTG")
}

func (_dtg *DTG) Accelerate(accel Accel) {
	if !_dtg.EngineRunning {
		return
	}

	prevAcc := _dtg.Acceleration

	wasBraking := _dtg.isBraking

	_dtg.isBraking = false
	_dtg.Acceleration = toAcceleration(accel)

	if !wasBraking && prevAcc != toAcceleration(accel) && prevAcc != toAcceleration(accel-1) && prevAcc != toAcceleration(accel+1) {
		_dtg.SuddenAccel++
	}
}

func (_dtg *DTG) Brake(accel Accel) {
	prevAcc := _dtg.Acceleration
	wasBraking := _dtg.isBraking

	_dtg.Acceleration = toBrakeAcceleration(accel)
	_dtg.isBraking = true

	if !wasBraking {
		if accel != Accel_Low {
			_dtg.SuddenBrake++
		}
	} else {
		//if prevAcc > _dtg.Acceleration && prevAcc != toBrakeAcceleration(accel-1) {
		if prevAcc != toBrakeAcceleration(accel) && prevAcc != toBrakeAcceleration(accel+1) && prevAcc != toBrakeAcceleration(accel-1) {
			_dtg.SuddenBrake++
		}
	}
}

// Turn degree has 2 decimal precision *in theory
func (_dtg *DTG) Turn(deg int16) {
	_deg := int32(_dtg.Orientation) + int32(deg)
	for _deg < 0 {
		_deg += 360 * int32(FactorDeg)
	}

	_dtg.Orientation = uint16(_deg % (360 * FactorDeg))
}

func (_dtg *DTG) Engine(on bool) {
	_dtg.EngineRunning = on

	_dtg.startTime = time.Now()

	if !_dtg.EngineRunning {
		_dtg.Brake(Accel_Low)
	} else {
		_dtg.startTime = time.Now()
	}
}

func CreateDTG(lat int64, lng int64, send func(v any) error, ended func(id string)) *DTG {
	_dtg := DTG{FactorDeg: FactorDeg, FactorSpeed: 1_000}
	_dtg.LatLng = LatLng{lat, lng, FactorLatLng}

	_dtg.sends = make([]func(v any) error, 2)
	_dtg.sends[0] = send
	_dtg.ended = ended

	return &_dtg
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
	return float64(deg) * 3.14 / (180 * FactorDeg)
}

func getLngFunc(quadrant int) func(f float64) float64 {
	if quadrant%2 == 0 {
		return math.Cos
	}
	return math.Sin
}

func getLatFunc(quadrant int) func(f float64) float64 {
	return getLngFunc(quadrant + 1)
}

func speedPerTick(speed int32, elapsed time.Duration) int32 {
	return int32(float32(speed) * (float32(elapsed.Milliseconds()) / 1000.0))
}

func toBrakeAcceleration(accel Accel) int32 {
	// 6 is a good braking factor
	return toAcceleration(accel) * 6
}

func toAcceleration(accel Accel) int32 {
	return int32(accel) * BaseAccel
}
