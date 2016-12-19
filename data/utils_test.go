package data

import (
	"testing"
	"time"
)

func TestGetDateFromNbOfDays(t *testing.T) {

	d, err := GetDateFromNbOfDays(-30)

	if err != nil {
		t.Fatal(err)
	}

	e := d.AddDate(0, 0, 30).Truncate(time.Minute)
	n := time.Now().Truncate(time.Minute).UTC()

	// Check if we have the same time
	if !e.Equal(n) {
		t.Fatalf("Date should be equal ! given : `%s` but expecting `%s`", e, n)
	}

}
