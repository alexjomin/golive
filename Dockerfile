# minimal linux distribution
FROM golang:1.9-wheezy

# set the go path to import the source project
WORKDIR $GOPATH/src/github.com/alexjomin/golive
ADD . $GOPATH/src/github.com/alexjomin/golive

# Build Binary and remove sources
# RUN mv static $GOPATH/bin/.
RUN make all && rm -rf $GOPATH/pkg

EXPOSE 80
