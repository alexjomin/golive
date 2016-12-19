package data

import "testing"

var s Source

func getBoltSource() (Source, error) {

	var err error

	if s != nil {
		return s, nil
	}

	s, err = NewBoltSource("/tmp/db")
	return s, err
}

func TestNewBoltSource(t *testing.T) {
	_, err := getBoltSource()
	if err != nil {
		t.Fatal(err)
	}
}

func TestInsert(t *testing.T) {

	b, err := getBoltSource()

	if err != nil {
		t.Fatal(err)
	}

	err = b.Insert("Foo", []string{"foo", "bar"})

	if err != nil {
		t.Fatal(err)
	}
}
