package handler

import (
	"fmt"
	"testing"

	"github.com/alexjomin/golive/data"
)

var h Handler

func init() {

}

// TestGetDocument retrieve document
func TestGetDocument(t *testing.T) {

	s, err := data.NewSource(data.SourceMock)

	if err != nil {
		t.Fatal(err)
	}

	h = Handler{Source: s}

	fmt.Println(h)

}
