FROM golang:1.17-alpine

COPY . .

ENV GOPATH=""
ENV DATABASE_HOST=db
ENV DEPLOY_MODE="docker"

RUN go build main.go

CMD ["./main"]

