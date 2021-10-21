package auth

import (
	"HarrisonWAffel/guess-ask-reddit/controller"
	"HarrisonWAffel/guess-ask-reddit/domain"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"net/http"
)

type AuthResponse struct {
	domain.User
	domain.AuthTokens
}

func Register(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.User

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, "bad request body")
		return
	}

	// register will create a user
	// and an auth token. once a user
	// registers successfully they will
	// immediately be logged in, so the
	// registration response body will contain
	// the required tokens

	if !payload.Valid() {
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, "bad request body")
		return
	}

	payload.ID = uuid.New()
	err = ctx.UserService.SaveUser(payload)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not save user to database")
		return
	}

	token := ctx.AuthService.CreateNewToken(payload)
	err = ctx.AuthService.SaveAuthToken(token)
	if err != nil {
		resp.SetError(err, "could not generate authentication token")
		_ = ctx.UserService.DeleteUser(payload)
		resp.SetStatus(http.StatusInternalServerError)
		return
	}

	resp.Body = AuthResponse{
		User:       payload,
		AuthTokens: token,
	}
}

func Login(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.User
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		resp.SetError(err, "bad request body").Write()
		return
	}

	user, err := ctx.UserService.GetUserByUsername(payload.Username)
	if err != nil {
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, fmt.Sprintf("could not find user with username %s", payload.Username))
		return
	}

	//todo; password hashing.
	if payload.Password != user.Password {
		resp.SetStatus(http.StatusUnauthorized)
		resp.Err = errors.New("invalid password").Error()
		return
	}

	token := ctx.AuthService.CreateNewToken(user)
	err = ctx.AuthService.SaveAuthToken(token)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not generate new access token")
		return
	}

	resp.Body = AuthResponse{
		User:       payload,
		AuthTokens: token,
	}
}

func LogOut(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.User
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		resp.SetError(err, "invalid request body")
		resp.SetStatus(http.StatusBadRequest)
		return
	}

	err = ctx.AuthService.DeleteAuthTokenByUserId(payload.ID)
	if err != nil {
		resp.SetError(err, "could not remove current auth token from database")
		resp.SetStatus(http.StatusInternalServerError)
	}
}

func RefreshToken(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {

}