all: build

build:
	@go build -o $(GOPATH)/bin/golive

test: 
	@go test -v ./data/...
	@go test -v ./handler/...
