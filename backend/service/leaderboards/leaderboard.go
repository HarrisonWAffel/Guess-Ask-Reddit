package leaderboards

import (
	"HarrisonWAffel/guess-ask-reddit/domain"
	userService "HarrisonWAffel/guess-ask-reddit/service/user"
	"encoding/json"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"time"
)

type Service interface {
	GetGameModeLeaderBoard(mode string, userService userService.Service) ([]domain.LeaderboardResponse, error)
	AddGameResultToLeaderBoard(mode string, userID uuid.UUID, result domain.GameResult) error
}

type service struct {
	repo *gorm.DB
}

func NewLeaderboardService(db *gorm.DB) Service {
	return &service{
		repo: db,
	}
}

func (s *service) AddGameResultToLeaderBoard(mode string, userID uuid.UUID, result domain.GameResult) error {
	postsJ := datatypes.JSON{}
	j, err := json.Marshal(result.Posts)
	if err != nil {
		return err
	}

	err = postsJ.UnmarshalJSON(j)
	if err != nil {
		return err
	}

	l := domain.Leaderboard{
		Userid:            userID,
		Mode:              mode,
		Time: 			   time.Now(),
		NumberOfQuestions: result.TotalPosts,
		Score:             result.NumberCorrect,
		Posts:             postsJ,
	}

	err = s.repo.Create(&l).Error
	return err
}

func (s *service) GetGameModeLeaderBoard(mode string, userService userService.Service) ([]domain.LeaderboardResponse, error) {
	var lb []domain.Leaderboard
	result := s.repo.Raw("select * from leaderboards where mode = ?", mode).Scan(&lb)
	if result.Error != nil {
		return nil, result.Error
	}

	var lbResponse []domain.LeaderboardResponse
	for i := 0; i < len(lb); i++ { // could be improved
		userId := lb[i].Userid
		user, _ := userService.GetUser(userId)
		lbr := domain.LeaderboardResponse{}.FromDomainModel(lb[i])
		lbr.Username = user.Username
		if lbr.Username == "" {
			lbr.Username = "?"
		}
		lbResponse = append(lbResponse, lbr)
	}

	return lbResponse, result.Error
}
