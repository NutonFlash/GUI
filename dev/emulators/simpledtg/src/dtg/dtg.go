package dtg

import (
	"fmt"
	"time"
)

type DTG struct {
	Lat          float64
	Lng          float64
	VecLat       float64
	VecLng       float64
	Acceleration float64
	RunTime      time.Duration
	Distance     float64
	Overspeed    float64
	IdleTime     time.Duration
	SuddenAccel  int16
	SuddenBrake  int16
	VehicleID    string
	DriverID     string
	isRunning    bool
}

type Values struct {
	Lat          float64
	Lng          float64
	Speed        float64
	Acceleration float64
}

func (dtg *DTG) _Run(c chan Values) {
	for {
		if !dtg.isRunning {
			break
		}
	}
}

func (dtg *DTG) Run() chan Values {
	dtg.isRunning = true

	c := make(chan Values)

	go dtg._Run(c)

	return c
}

func (dtg *DTG) Stop() {
	dtg.isRunning = false
}

func (dtg *DTG) Accelerate() {}

func (dtg *DTG) Brake() {}

func (dtg *DTG) Turn() {}

func CreateDTG(lat float64, lng float64) *DTG {
	dtg := DTG{}
	dtg.Lat = lat
	dtg.Lng = lng

	fmt.Println(dtg)
	return &dtg
}
