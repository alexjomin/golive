package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/alexjomin/golive/data"
	"github.com/alexjomin/golive/model"
)

var h *Handler
var id string

func createTestHandler() (*Handler, error) {

	if h != nil {
		return h, nil
	}

	testConfig := map[string]string{
		"path": "/tmp/db",
		"port": "8080",
	}

	s, err := data.NewSource(data.SourceBolt, testConfig)

	if err != nil {
		return nil, err
	}

	h = &Handler{
		Source: s,
	}

	return h, nil
}

// TestPostDocument test to create a document
func TestPostDocument(t *testing.T) {

	h, err := createTestHandler()

	if err != nil {
		t.Fatal(err)
	}

	payload := model.Delivery{
		Software:    "my-awesome-api",
		Version:     "0.1.7",
		Environment: "production",
		Repository:  "github.com/foo/my-awesome-backend",
	}

	body, err := json.Marshal(payload)

	req, err := http.NewRequest(http.MethodPost, "/api/deliveries", bytes.NewBuffer(body))

	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(h.Create)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusCreated {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusCreated)
	}

	if rr.Body == nil {
		t.Fatal("No body in the response")
	}

	responseBody := &model.Delivery{}
	err = json.Unmarshal(rr.Body.Bytes(), responseBody)

	if err != nil {
		t.Fatal(err)
	}

	if responseBody.Date == "" {
		t.Fatal("responseBody.date is empty")
	}

	// Set The Id
	id = responseBody.Date
	t.Logf("Id of the document is %s", id)

}

// TestGetDocument retrieve all documents
func TestGetAllDocuments(t *testing.T) {

	h, err := createTestHandler()

	if err != nil {
		t.Fatal(err)
	}

	req, err := http.NewRequest(http.MethodGet, "/api/deliveries", nil)

	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(h.Get)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

}

// TestDeleteADocument deletea a document
func TestDeleteADocument(t *testing.T) {

	h, err := createTestHandler()

	if err != nil {
		t.Fatal(err)
	}

	req, err := http.NewRequest(http.MethodDelete, "/api/deliveries/"+id, nil)

	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(h.Delete)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusNoContent {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusNoContent)
	}

}
