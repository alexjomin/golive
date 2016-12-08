package data

const (
	// SourceBolt is source from BoltDB
	SourceBolt = "Bolt"

	// SourceMock is for mocking data persitance
	SourceMock = "Mock"
)

//NewSource returns a new source
func NewSource(origin string, config map[string]string) (Source, error) {

	switch origin {

	case SourceBolt:
		path := config["path"]
		s, err := NewBoltSource(path)

		if err != nil {
			return nil, err
		}

		return s, nil
	}

	return nil, nil
}
