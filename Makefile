all: build

build:
	@go build -o $(GOPATH)/bin/golive

test: 
	@go test -v