package config

import (
	"HarrisonWAffel/guess-ask-reddit/domain"
	"HarrisonWAffel/guess-ask-reddit/service/auth"
	"HarrisonWAffel/guess-ask-reddit/service/leaderboards"
	"HarrisonWAffel/guess-ask-reddit/service/user"
)

type AppCtx struct {
	AuthService auth.Service
	UserService user.Service
	LeaderboardService leaderboards.Service
	ReqCtx ReqCtx
}
type ReqCtx struct {
	Tokens domain.AuthTokens
}
