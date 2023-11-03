package server

import (
	"GUI/simpledtg/src/server/events"
	"encoding/json"
	"fmt"
	"net"
	"os"
)

// server options & defaults
type Options struct {
	Host      string
	Port      string
	Type      string
	isRunning bool
}

type ServerOption func(*Options)

func useHost(host string) ServerOption {
	return func(option *Options) {
		option.Host = host
	}
}

func usePort(port string) ServerOption {
	return func(option *Options) {
		option.Port = port
	}
}

func useType(type_ string) ServerOption {
	return func(option *Options) {
		option.Type = type_
	}
}

type Server struct {
	Options
}

func defaultOptions() Options {
	return Options{"localhost", ":3999", "tcp", false}
}

// creates a new socket server
func CreateServer(options ...*ServerOption) *Server {
	opts := defaultOptions()

	for _, option := range options {
		(*option)(&opts)
	}

	s := &Server{opts}
	return s
}

// starts socket server
func (s *Server) Start() {
	s.isRunning = true

	fmt.Printf("Starting %s server at %s%s\n", s.Type, s.Host, s.Port)
	server, err := net.Listen(s.Type, s.Host+s.Port)
	if err != nil {
		fmt.Println("error starting server:", err.Error())
		os.Exit(1)
	}

	defer server.Close()

	fmt.Printf("Server started at %s%s\n", s.Host, s.Port)

	//listen to connections
	for {
		if !s.isRunning {
			fmt.Printf("Server %s%s Stopped\n", s.Host, s.Port)
			break
		}

		connection, err := server.Accept()
		if err != nil {
			fmt.Println("error accepting client: ", err.Error())
		} else {
			fmt.Println("client connected")
			go s.process(connection)
		}
	}
}

func (s *Server) Stop() {
	s.isRunning = false
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func sendResponse(connection *net.Conn) func(v any) {
	return func(v any) {
		res, err := json.Marshal(v)
		if err != nil {
			response, _ := json.Marshal(ErrorResponse{"500 : failed encoding response"})
			(*connection).Write(response)
		}

		(*connection).Write(res)
	}
}

func (s *Server) process(connection net.Conn) {
	// while connection persists wait for and handle events
	for {
		if !s.isRunning {
			break
		}

		buffer := make([]byte, 1024)
		mLen, err := connection.Read(buffer)
		if err != nil {
			fmt.Println("Error reading:", err.Error())
			connection.Close()
			break
		} else {

			event := events.SocketEvent{}

			err := json.Unmarshal(buffer[:mLen], &event)
			if err != nil {
				fmt.Println("error unmarshalling json")
				continue
			}

			fmt.Println(event)
			event.Handle(&connection, sendResponse(&connection))

			if event.Action == "close" {
				connection.Close()
				s.Stop()
				break
			}
		}
	}
}
