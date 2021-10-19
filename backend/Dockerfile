FROM golang:1.17-alpine

COPY . .

ENV GOPATH=""

RUN go build main.go

CMD ["./main"]

