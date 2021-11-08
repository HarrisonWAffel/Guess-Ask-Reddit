package controller

import (
	"HarrisonWAffel/guess-ask-reddit/config"
	"encoding/json"
	"fmt"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"net/http"
	"time"
)

type Handler struct {
	AppCtx AppCtx
	H      func(ctx *AppCtx, w *APIResp, r *http.Request)
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	response := &APIResp{Writer: w, Log: logrus.NewEntry(config.Log)}

	isAuthenticated, reqCtx := Authenticate(&h.AppCtx, response, r)
	if isAuthenticated {
		h.H(reqCtx, response, r)
	} else {
		response.SetStatus(http.StatusUnauthorized)
	}

	response.Write()
}

func Authenticate(ctx *AppCtx, resp *APIResp, r *http.Request) (bool, *AppCtx) {
	reqCtx := &AppCtx{
		AuthService:        ctx.AuthService,
		UserService:        ctx.UserService,
		LeaderboardService: ctx.LeaderboardService,
	}

	switch r.RequestURI {
	case "/register", "/refresh", "/login", "/viewLeaderBoards":
		return true, reqCtx //no auth needed
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

		if storedAuthToken.Expiry.Before(time.Now().UTC()) {
			return false, nil
		}

		reqCtx.ReqCtx.Tokens = storedAuthToken
		resp.Log = resp.Log.WithFields(logrus.Fields{
			"userId": storedAuthToken.Userid,
		})

		return true, reqCtx
	}
}

type APIResp struct {
	Reason string              `json:"reason,omitempty"`
	Body   interface{}         `json:"body"`
	Status int                 `json:"status"`
	Err    string              `json:"err"`
	Writer http.ResponseWriter `json:"-"`
	Log    *logrus.Entry 	   `json:"-"`
}

func (a *APIResp) SetError(err error, reason string) *APIResp {
	a.Err = errors.Wrap(err, reason).Error()
	a.Log.Error(a.Err)
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
