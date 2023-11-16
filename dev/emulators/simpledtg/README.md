# SimpleDTG

Simple DTG Emulation server over socket / websocket written in Go.

## Requirements

[Go 1.21+](https://go.dev/doc/install)

## Usage

-   Download dependencies `go mod download`

-   Run `go run .`

### Flags

-   `port` The port the server will run on (default 3999).

## Connecting

Connect via `ws://localhost:{port}/dtg`

## Sending Commands

Commands in the form of stringified JSON can be sent to the server to interact with the DTG.

### Default Structure

```
{
    "event": event,
    "payload": payload
}
```

### `event` | `string`

-   `dtg`: events directed to the DTG.
-   `shutdown`: shuts down the server.

### `payload` | `Object`

    payload is an object containing instructions for the dtg

```
{
    "action": action,
    ...
}
```

#### `action` | `string`

    Actions specify which function to invoke with the specified parameters.

-   `bind`: binds the connection to an existing DTG emulation (max 1 binds) `params("id": string)`

    ```
    {
        "action": "bind",
        "id": "a1b2c"
    }
    ```

-   `init`: initializes and runs the DTG with the given latitudes and longitudes, DTG data will begin to be streamed to the client. `params("data": {"lat": float, "lng": float})`
    ```
    {
        "action": "init",
        "data": {
             "lat": 36.339712,
             "lng": 127.4445824,
        }
    }
    ```
-   `engine`: turns the vehicle's engine on or off. `params("on": boolean)`
    ```
    {
        "action": "engine",
        "on": true
    }
    ```
-   `accelerate`: sets the acceleration rate of the vehicle. `params("accel": string("reverse", "none", "low", "medium", "high"))`
    ```
    {
        "action": "accelerate",
        "accel": "high"
    }
    ```
-   `brake`: sets the braking rate of the vehicle, stops and resets when the speed of the vehicle is 0. `params("brake": string("low", "medium", "high"))`
    ```
    {
        "action": "brake",
        "brake": "high"
    }
    ```
-   `turn`: instantly turns the vehicle by the specified degree with 2 decimal precision. `params("deg": string(int16(-180, 180]))`
    ```
    {
        "action": "turn",
        "deg": "90"
    }
    ```
-   `end`: ends the DTG session.
    ```
    {
        "action": "end"
    }
    ```

## Received Data

The server periodically sends DTG data to the client once every 20 to 30 miliseconds.

```
DTG {
    "id": string, // id of the DTG for binding

    "latlng": {
        "lat": int64,
        "lng": int64,
        "factor_latlng": int32
    }, // latitudes and longitudes of the vehicle in decimal degrees multiplied by factor_latlng

    "speed": int32, // speed of the vehicle in meters per second multiplied by factor_speed

    "orientation": uint16, // orientation of the vehicle in degrees multiplied by factor_deg

    "acceleration": int32, // acceleration of the vehicle in decimal degrees multiplied by factor_speed

    "runtime": int64, // runtime is the total time elapsed since init with the engine on in milliseconds

    "distance": int64, // distance travelled by the vehicle since init in decimal degrees multiplied by factor_latlng

    "overspeed": int64, // overspeed is the total distance travelled by the vehicle during speeds of over speedlimit in decimal degrees multiplied by factor_latlng

    "idle_time": int64, // idle_time is the total time elapsed while engine is on with 0 speed and acceleration in milliseconds

    "sudden_accel": int16, // sudden_accel is the total amount of times that the vehicle had a high rate of acceleration

    "sudden_brake": int16, // sudden_brake is the total amount of times that the vehicle had a high rate of deceleration

    "vehicle_id": string, // unimplemented

    "driver_id": string, // unimplemented

    "engine_running": bool,

    "factor_deg": int,

    "factor_speed": int,
}
```

## Termination

The server can be shut down via the endpoint `localhost:{port}/shutdown` or via the event `shutdown`.

# Basic Client

A client with basic capabilities to interface with the DTG emulator has been provided at `./dev/client`, it is recommended to host the files as a webpage locally to avoid errors. See [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
