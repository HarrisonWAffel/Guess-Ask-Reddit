package auth

import (
	"HarrisonWAffel/guess-ask-reddit/controller"
	"HarrisonWAffel/guess-ask-reddit/domain"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	_ "github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
	_ "golang.org/x/crypto/bcrypt"
	"net/http"
)

type Response struct {
	domain.User
	domain.AuthTokens
}

func Register(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.UserRequest
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, "bad request body")
		return
	}

	if payload.Username == "" || payload.Password == "" {
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, "bad request body")
		return
	}

	hashedPass, err := bcrypt.GenerateFromPassword([]byte(payload.Password), 10)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not hash password")
		return
	}

	u := domain.User{
		ID:       uuid.New(),
		Username: payload.Username,
		Password: hashedPass,
	}

	err = ctx.UserService.SaveUser(u)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not save user to database")
		return
	}

	token := ctx.AuthService.CreateNewToken(u)
	err = ctx.AuthService.SaveAuthToken(token)
	if err != nil {
		resp.SetError(err, "could not generate authentication token")
		_ = ctx.UserService.DeleteUser(u)
		resp.SetStatus(http.StatusInternalServerError)
		return
	}

	resp.Body = Response{
		User:       u,
		AuthTokens: token,
	}
}

func Login(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.UserRequest
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

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(payload.Password)); err != nil {
		resp.SetStatus(http.StatusUnauthorized)
		resp.Err = errors.New("invalid password").Error()
		return
	}

	err = ctx.AuthService.DeleteAuthTokenByUserId(user.ID)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		return
	}

	token := ctx.AuthService.CreateNewToken(user)
	err = ctx.AuthService.SaveAuthToken(token)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not generate new access token")
		return
	}

	resp.Body = Response{
		User:       user,
		AuthTokens: token,
	}
}

func LogOut(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.UserRequest
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		resp.SetError(err, "invalid request body")
		resp.SetStatus(http.StatusBadRequest)
		return
	}

	user, err := ctx.UserService.GetUserByUsername(payload.Username)
	if err != nil {
		resp.SetError(err, "could not find user")
		resp.SetStatus(http.StatusBadRequest)
		return
	}

	err = ctx.AuthService.DeleteAuthTokenByUserId(user.ID)
	if err != nil {
		resp.SetError(err, "could not remove current auth token from database")
		resp.SetStatus(http.StatusInternalServerError)
	}
}

func RefreshToken(ctx *controller.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.TokenRefreshRequest
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		fmt.Println(err)
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, "invalid request body")
		return
	}

	user, err := ctx.UserService.GetUserByUsername(payload.Username)
	if err != nil {
		fmt.Println(err)
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, "invalid request")
		return
	}

	storedToken, err := ctx.AuthService.GetAuthTokenByUserId(user.ID)
	if err != nil {
		fmt.Println(err)
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "unexpected auth error")
		return
	}

	if payload.AuthToken != storedToken.Token || payload.RefreshToken != storedToken.RefreshToken {
		fmt.Println("dont match")
		fmt.Println(payload.AuthToken)
		fmt.Println(storedToken.Token)
		fmt.Println(payload.RefreshToken)
		fmt.Println(storedToken.RefreshToken)
		resp.SetStatus(http.StatusBadRequest)
		return
	}

	err = ctx.AuthService.DeleteAuthToken(storedToken.ID)
	if err != nil {
		fmt.Println(err)
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not refresh token")
		return
	}

	newToken := ctx.AuthService.CreateNewToken(user)
	err = ctx.AuthService.SaveAuthToken(newToken)
	if err != nil {
		fmt.Println(err)
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not generate new tokens")
		return
	}

	resp.Body = Response{
		User:       user,
		AuthTokens: newToken,
	}
}