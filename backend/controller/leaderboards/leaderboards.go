package leaderboards

import (
	"HarrisonWAffel/guess-ask-reddit/config"
	"HarrisonWAffel/guess-ask-reddit/controller"
	"HarrisonWAffel/guess-ask-reddit/domain"
	"encoding/json"
	"net/http"
)

func AddGameResultToLeaderBoard(ctx *config.AppCtx, resp *controller.APIResp, r *http.Request) {
	var payload domain.GameResult
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		resp.SetStatus(http.StatusBadRequest)
		resp.SetError(err, "invalid request body")
		return
	}

	gameMode := "limited"
	if payload.IsSurvival {
		gameMode = "survival"
	}

	err = ctx.LeaderboardService.AddGameResultToLeaderBoard(gameMode, ctx.ReqCtx.Tokens.Userid, payload)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not add result to database")
		return
	}
}

func GetLeaderBoard(ctx *config.AppCtx, resp *controller.APIResp, r *http.Request) {
	mode := r.Header.Get("mode")
	if mode == "" {
		resp.SetStatus(http.StatusBadRequest)
		resp.Body = "invalid request body"
		return
	}

	lb, err := ctx.LeaderboardService.GetGameModeLeaderBoard(mode, ctx.UserService)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not get leaderboard")
		return
	}


	j, err := json.Marshal(lb)
	if err != nil {
		resp.SetStatus(http.StatusInternalServerError)
		resp.SetError(err, "could not marshal results into json")
		return
	}

	resp.Body = string(j)
}
