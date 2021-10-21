package domain

import (
	"encoding/json"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"time"
)

type GameResult struct {
	PostType string `json:"PostType"`
	IsSurvival bool `json:"isSurvival"`
	Posts    []struct {
		ID       string `json:"ID"`
		Comments []struct {
			Comment         string `json:"comment"`
			CommentKarma    int    `json:"commentKarma"`
			Username        string `json:"username"`
			IsCorrectAnswer bool   `json:"isCorrectAnswer"`
		} `json:"comments"`
		PostBody       string `json:"postBody"`
		PostKarma      int    `json:"postKarma"`
		PostTitle      string `json:"postTitle"`
		PostURL        string `json:"postURL"`
		PosterUsername string `json:"posterUsername"`
	} `json:"Posts"`
	CurrentPostIndex int `json:"currentPostIndex"`
	NumberCorrect    int `json:"numberCorrect"`
	SurvivalOptions  struct {
		LastPostIndex  int `json:"lastPostIndex"`
		RemainingLives int `json:"remainingLives"`
	} `json:"survivalOptions"`
}

type Leaderboard struct {
	ID uuid.UUID `json:"id" ,gorm:"primaryKey"`
	Time time.Time `json:"time"`
	Userid uuid.UUID `json:"userid"`
	Mode string `json:"mode"`
	NumberOfQuestions int `json:"number_of_questions"`
	Score int `json:"score"`
	Posts datatypes.JSON `json:"posts"`
}

// LeaderboardResponse is a model passed to frontend for rendering
// it is effectively a copy of the Leaderboard type with the UserID
// field exchanged for username field, to increase ease of rendering on the
// frontend.
type LeaderboardResponse struct {
	ID uuid.UUID `json:"id" ,gorm:"primaryKey"`
	Time time.Time `json:"time"`
	Username string `json:"username"`
	Mode string `json:"mode"`
	NumberOfQuestions int `json:"number_of_questions"`
	Score int `json:"score"`
	Posts datatypes.JSON `json:"posts"`
}

func (lr LeaderboardResponse) FromDomainModel(l Leaderboard)  LeaderboardResponse{
	lr.ID = l.ID
	lr.Time = l.Time
	lr.Mode = l.Mode
	lr.NumberOfQuestions = l.NumberOfQuestions
	lr.Score = l.Score
	lr.Posts = l.Posts
	return lr
}

func (l *Leaderboard) BeforeCreate(db *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}

func (l *Leaderboard) ToJSON() []byte {
	j, _ := json.Marshal(l)
	return j
}