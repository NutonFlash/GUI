package server

import (
	connection2 "GUI/simpledtg/src/server/connection"
	"GUI/simpledtg/src/server/event"
	"encoding/json"
	"fmt"
	"net"
)

// Options contain the server's options
type Options struct {
	Host      string
	Port      string
	Type      string
	isRunning bool
}

type ServerOption func(*Options)

func UseHost(host string) ServerOption {
	return func(option *Options) {
		option.Host = host
	}
}

func UsePort(port string) ServerOption {
	return func(option *Options) {
		option.Port = port
	}
}

func UseType(type_ string) ServerOption {
	return func(option *Options) {
		option.Type = type_
	}
}

type Server struct {
	Options
	Listener *net.Listener
}

func DefaultOptions() Options {
	return Options{"localhost", ":3999", "tcp", false}
}

// CreateServer creates a new socket server
func CreateServer(options ...ServerOption) *Server {
	opts := DefaultOptions()

	for _, option := range options {
		option(&opts)
	}

	s := &Server{opts, nil}
	return s
}

// Start starts socket server
func (s *Server) Start() {
	s.isRunning = true

	fmt.Printf("Starting %s server at %s%s\n", s.Type, s.Host, s.Port)
	server, err := net.Listen(s.Type, s.Host+s.Port)
	if err != nil {
		fmt.Println("error starting server:", err.Error())
		return
	}

	s.Listener = &server

	fmt.Printf("Server started at %s%s\n", s.Host, s.Port)

	//listen to connections
	for s.isRunning {
		connection, err := server.Accept()
		if err != nil {
			fmt.Println("error accepting client: ", err.Error())
		} else {
			fmt.Println("client connected")
			go s.process(connection)
		}
	}

	fmt.Printf("Server %s%s Stopped\n", s.Host, s.Port)
}

func (s *Server) Stop() {
	fmt.Println("Stopping server")
	s.isRunning = false
	(*s.Listener).Close()
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
	conn := connection2.DTGConnection{Con: &connection, IsOpen: true}

	// while connection persists wait for and handle event
	for {
		if !s.isRunning || !conn.IsOpen {
			conn.Close()
			break
		}

		buffer := make([]byte, 1024)
		mLen, err := (*conn.Con).Read(buffer)
		if err != nil {
			conn.Close()
			errMsg := err.Error()
			if errMsg != "EOF" {
				fmt.Println("error reading:", err.Error())
			}
		} else {

			evt := event.SocketEvent{}

			fmt.Println(string(buffer[:mLen]))

			err := json.Unmarshal(buffer[:mLen], &evt)
			if err != nil {
				fmt.Println("error unmarshalling json")
				continue
			}

			fmt.Println(evt)
			evt.Handle(&conn, sendResponse(conn.Con))

			if evt.Event == "close" {
				conn.Close()
			}

			if evt.Event == "stop" {
				conn.Close()
				s.Stop()
			}
		}
	}

	fmt.Println("Thread Process Closed")
}
