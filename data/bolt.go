package data

import (
	"encoding/json"
	"fmt"

	"github.com/alexjomin/golive/model"
	"github.com/boltdb/bolt"
)

type boltSource struct {
	db     *bolt.DB
	bucket []byte
}

// NewBoltSource returns an bolt based data source
func NewBoltSource(path string) (Source, error) {

	db, err := bolt.Open(path, 0600, nil)

	if err != nil {
		return nil, err
	}

	err = db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucket([]byte("deliveries"))

		if err != nil {
			if err != bolt.ErrBucketExists {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &boltSource{
		db:     db,
		bucket: []byte("deliveries"),
	}, nil

}

func (s *boltSource) Get(key string) (interface{}, error) {

	var v []byte

	_ = s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(s.bucket)

		if b == nil {
			fmt.Println("bucket is nil")
			return nil
		}
		v = b.Get([]byte(key))
		return nil
	})

	if v == nil {
		return nil, nil
	}

	return v, nil

}

func (s *boltSource) Delete(key string) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(s.bucket))
		return b.Delete([]byte(key))
	})
}

func (s *boltSource) GetAll() ([]model.Delivery, error) {

	p := []model.Delivery{}

	s.db.View(func(tx *bolt.Tx) error {

		// Assume our events bucket exists and has RFC3339 encoded time keys.
		//b := tx.Bucket([]byte(s.bucket)).Cursor()
		b := tx.Bucket([]byte(s.bucket))

		b.ForEach(func(k, v []byte) error {
			var d model.Delivery
			json.Unmarshal(v, &d)
			p = append(p, d)
			return nil
		})

		for i := len(p)/2 - 1; i >= 0; i-- {
			opp := len(p) - 1 - i
			p[i], p[opp] = p[opp], p[i]
		}

		return nil

		/*
			// Our time range spans the 90's decade.
			min := []byte("1990-01-01T00:00:00Z")
			max := []byte("2020-01-01T00:00:00Z")

			// Iterate over the 90's.
			for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
				fmt.Printf("%s: %s\n", k, v)
			}
		*/

	})

	return p, nil

}

func (s *boltSource) Insert(key string, value interface{}) error {

	buf, err := json.Marshal(value)

	if err != nil {
		return err
	}

	_ = s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket(s.bucket)
		err := b.Put([]byte(key), buf)
		return err
	})

	return nil
}
