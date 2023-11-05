# SimpleDTG

Simple DTG Emulation server over socket / websocket written in Go.

## Requirements

[Go 1.21+](https://go.dev/doc/install)

## Usage

Run `go run `.

### Flags

-   `port` The port the server will run on (default 3999).

## Connecting

Connect via `ws://localhost:{port}/dtg`

## Sending Commands

Commands in the form of stringified JSON can be sent to the server to interact with the DTG.

### Default Structure

```
{
    "event": ${event},
    "payload": ${payload}
}
```

### `event`

-   `dtg` events directed to the DTG. `string`

### `payload`

    payload is an object with instructions for the dtg

```
{
    "action": ${action},
    ...
}
```

#### `action`

    Actions specify which function to invoke with the specified parameters.

-   `init` initializes and runs the DTG, DTG data will begin to be streamed to the client.
-   `engine` turns the vehicle's engine on or off. `params("on": boolean)`
    ```
    {
        "action": "engine",
        "on": true
    }
    ```
-   `accelerate` sets the acceleration rate of the vehicle. `params("accel": string("reverse", "none", "low", "medium", "high"))`
    ```
    {
        "action": "accelerate",
        "accel": "high"
    }
    ```
-   `brake` sets the braking rate of the vehicle, stops and resets when the speed of the vehicle is 0. `params("accel": string("low", "medium", "high"))`
    ```
    {
        "action": "brake",
        "accel": "high"
    }
    ```
-   `turn` instantly turns the vehicle by the specified degree with 2 decimal precision. `params("deg": float)`
    ```
    {
        "action": "turn",
        "deg": 90
    }
    ```
-   `end` ends the DTG session.
    ```
    {
        "action": "end"
    }
    ```

## Received Data

The server periodically sends DTG data to the client once every 20 to 30 miliseconds.

```
DTG {
    // latitudes and longitudes of the vehicle in decimal degrees multiplied by factor_latlng
    "latlng": {
        "lat": int64,
        "lng": int64,
        "factor_latlng": int32
    },

    // speed of the vehicle in meters per second multiplied by factor_speed
    "speed": int32,

    // orientation of the vehicle in degrees multiplied by factor_deg
    "orientation": uint16,

    // acceleration of the vehicle in Decimal Degrees (DD) multiplied by factor_speed
    "acceleration": int32,

    // runtime is the total time elapsed since init with the engine on in milliseconds
    "runtime": int64,

    // distance travelled by the vehicle since Run() in Decimal Degrees (DD) multiplied by factor_latlng multiplied by factor_latlng
    "distance": int64,

    // overspeed is the total distance travelled by the vehicle during speeds of over speedlimit in Decimal Degrees (DD)
    "overspeed": int64,

    // idle_time is the total time elapsed while engine is on with 0 speed and acceleration in ,milliseconds
    "idle_time": int64,

    // sudden_accel is the total amount of times that the vehicle had a high rate of acceleration
    "sudden_accel": int16,

    // sudden_brake is the total amount of times that the vehicle had a high rate of deceleration
    "sudden_brake": int16,

    "vehicle_id": string, // unimplemented

    "driver_id": string, // unimplemented

    "engine_running": bool,

    "factor_deg": int,
    
    "factor_speed": int,
}
```
