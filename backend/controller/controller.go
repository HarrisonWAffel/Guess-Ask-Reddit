package controller

import (
	"HarrisonWAffel/guess-ask-reddit/config"
	"encoding/json"
	"fmt"
	"github.com/pkg/errors"
	"net/http"
)

type Handler struct {
	AppCtx config.AppCtx
	H      func(ctx *config.AppCtx, w *APIResp, r *http.Request)
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	response := &APIResp{Writer: w}

	isAuthenticated, reqCtx := Authenticate(&h.AppCtx, r)
	if isAuthenticated {
		h.H(reqCtx, response, r)
	} else {
		response.SetStatus(http.StatusUnauthorized)
	}

	response.Write()
}

func Authenticate(ctx *config.AppCtx, r *http.Request) (bool, *config.AppCtx) {
	reqCtx := &config.AppCtx{
		AuthService: ctx.AuthService,
		UserService: ctx.UserService,
	}

	switch r.RequestURI {
	case "/register":
		return true, reqCtx //no auth needed to register
	case "/login":
		return true, reqCtx //no auth needed to login
	case "/test":
		return true, reqCtx //no auth needed to login
	default:
		givenAuthToken := r.Header.Get("authToken")
		storedAuthToken, err := ctx.AuthService.GetAuthTokenByToken(givenAuthToken)
		if err != nil {
			fmt.Println(errors.Wrap(err, "could not get auth token from db"))
			return false, nil
		}
		if givenAuthToken != storedAuthToken.Token {
			return false, nil
		}
		reqCtx.ReqCtx.Tokens = storedAuthToken
		return true, reqCtx
	}
}

type APIResp struct {
	Reason string `json:"reason,omitempty"`
	Body interface{} `json:"body"`
	Status int `json:"status"`
	Err string `json:"err"`
	Writer http.ResponseWriter `json:"-"`
}

func (a *APIResp) SetError(err error, reason string) *APIResp  {
	a.Err = errors.Wrap(err, reason).Error()
	fmt.Println(a.Err)
	return a
}

func (a *APIResp) SetStatus(status int) *APIResp {
	a.Status = status
	return a
}

func (a *APIResp) Write() *APIResp {
	if a.Status != 0 {
		a.Writer.WriteHeader(a.Status)
	} else {
		a.Status = http.StatusOK
	}
	a.Writer.Write(a.ToJSON())
	return a
}

func (a *APIResp) ToJSON() []byte {
	j, _ := json.Marshal(a)
	return j
}