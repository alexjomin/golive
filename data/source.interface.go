package data

import "github.com/alexjomin/golive/model"

// Source is the common interface of the data sources
type Source interface {
	// Get a document by key
	Get(string) (interface{}, error)

	// Delete a key
	Delete(string) error

	// Get a document by key
	GetAll() ([]model.Delivery, error)

	// Insert a document
	Insert(string, interface{}) error
}
