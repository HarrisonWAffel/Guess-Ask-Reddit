FROM golang:1.17-alpine

COPY . .

ENV GOPATH=""
ENV DATABASE_HOST=db
ENV DEPLOY_MODE="docker"

EXPOSE 1337

RUN go build main.go

CMD ["./main"]

