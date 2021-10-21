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

	var userIds []string
	for _, l := range lb {
		userIds = append(userIds, l.Userid.String())
	}

	// get all user id's in one go
	usersById, err := userService.GetUsers(userIds)
	if err != nil {
		return nil, err
	}

	var lbResponse []domain.LeaderboardResponse
	for i := 0; i < len(lb); i++ {
		lbResponse = append(
			lbResponse,
			domain.LeaderboardResponse{}.FromDomainModel(lb[i], usersById[lb[i].Userid.String()].Username),
		)
	}

	return lbResponse, result.Error
}
