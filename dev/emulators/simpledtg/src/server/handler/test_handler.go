package handler

type TestResponse struct {
	Msg string `json:"msg"`
}

func TestHandler(payload *map[string]interface{}) TestResponse {
	return TestResponse{"TEST HANDLER " + (*payload)["contents"].(map[string]interface{})["a"].(string)}
}
