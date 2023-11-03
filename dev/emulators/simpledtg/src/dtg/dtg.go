package dtg

import (
	"fmt"
	"time"
)

// Truck Limitations
const (
	FactorLatLng = 100_000
	TickSpeed    = 16
	SpeedLimit   = 50
	MaxAccel     = 35
	MaxSpeed     = 80
)

type LatLng struct {
	Lat int32 `json:"lat"`
	Lng int32 `json:"lng"`
}

func (l *LatLng) String() (string, string) {
	return fmt.Sprintf("%d.%d", l.Lat/FactorLatLng, l.Lat%FactorLatLng), fmt.Sprintf("%d.%d", l.Lng/FactorLatLng, l.Lng%FactorLatLng)
}

// DTG assumes that 1 DD is equal to 1 meter.
type DTG struct {
	LatLng        LatLng        `json:"latlng"`       // LatLng is the position of the vehicle in Decimal Degrees (DD)
	Speed         uint8         `json:"speed"`        // Speed of the vehicle in Decimal Degrees (DD)
	Orientation   uint16        `json:"orientation"`  // Orientation of the vehicle in Decimal Degrees (DD)
	Acceleration  int8          `json:"acceleration"` // Acceleration of the vehicle in Decimal Degrees (DD)
	RunTime       time.Duration `json:"runtime"`      // RunTime is the total time elapsed since Run() in Milliseconds
	Distance      int32         `json:"distance"`     // Distance travelled by the vehicle since Run() in Decimal Degrees (DD)
	OverSpeed     int32         `json:"overspeed"`    // OverSpeed is the total distance travelled by the vehicle during speeds of over SpeedLimit in Decimal Degrees (DD)
	IdleTime      time.Duration `json:"idle_time"`    // IdleTime is the total time elapsed while engine is on and 0 vector and acceleration in Milliseconds
	SuddenAccel   int16         `json:"sudden_accel"` // SuddenAccel is the total amount of times that the vehicle had a high rate of acceleration
	SuddenBrake   int16         `json:"sudden_brake"` // SuddenBrake is the total amount of times that the vehicle had a high rate of deceleration
	VehicleID     string        `json:"vehicle_id"`
	DriverID      string        `json:"driver_id"`
	EngineRunning bool          `json:"engine_running"`
	nextTick      time.Time
	isRunning     bool
}

func (dtg *DTG) _Run() {
	for dtg.isRunning {
		dtg.nextTick = time.Now().Add(TickSpeed * time.Millisecond)
		dtg.RunTime += TickSpeed * time.Millisecond

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

func (dtg *DTG) Accelerate() {}

func (dtg *DTG) Brake() {}

func (dtg *DTG) Turn() {}

func (dtg *DTG) Engine(on bool) {
	dtg.EngineRunning = on
}

func CreateDTG(lat int32, lng int32) *DTG {
	dtg := DTG{}
	dtg.LatLng = LatLng{lat, lng}

	fmt.Println(dtg)
	return &dtg
}
