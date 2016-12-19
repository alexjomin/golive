package data

import (
	"errors"
	"time"
)

// GetDateFromNbOfDays returns a date from now minus a number of days
func GetDateFromNbOfDays(nbOfDays int) (*time.Time, error) {

	if nbOfDays >= 0 {
		return nil, errors.New("Number of days must be negative")
	}

	now := time.Now()
	now.UTC()

	d := now.AddDate(0, 0, nbOfDays).UTC()

	return &d, nil

}
