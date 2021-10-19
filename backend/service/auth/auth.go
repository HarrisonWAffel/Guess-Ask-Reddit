package auth

import (
	"HarrisonWAffel/guess-ask-reddit/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type Service interface {
	CreateNewToken(user domain.User) domain.AuthTokens
	SaveAuthToken(token domain.AuthTokens) error
	GetAuthToken(id uuid.UUID) (domain.AuthTokens, error)
	GetAuthTokenByToken(token string) (domain.AuthTokens, error)
	GetAuthTokenByUserId(userId uuid.UUID) (domain.AuthTokens, error)
	DeleteAuthToken(id uuid.UUID) error
	DeleteAuthTokenByUserId(userId uuid.UUID) error
}

func NewAuthService(db *gorm.DB) Service {
	return &service{
		repo: db,
	}
}

type service struct {
	repo *gorm.DB
}

func (s *service) CreateNewToken(user domain.User) domain.AuthTokens {
	return domain.AuthTokens{
		ID:           uuid.New(),
		Userid:       user.ID,
		Token:        uuid.New().String(),
		RefreshToken: uuid.New().String(),
		Expiry:       time.Now().Add(time.Minute*30),
	}
}

func (s *service) SaveAuthToken(token domain.AuthTokens) error {
	return s.repo.Create(&token).Error
}
func (s *service) GetAuthToken(id uuid.UUID) (domain.AuthTokens, error) {
	token := domain.AuthTokens{}
	result := s.repo.First(&token, "id = ?", id.String())
	return token, result.Error
}
func (s *service) GetAuthTokenByUserId(userId uuid.UUID) (domain.AuthTokens, error) {
	token := domain.AuthTokens{}
	result := s.repo.First(&token, "userID = ?", userId.String())
	return token, result.Error
}
func (s *service) GetAuthTokenByToken(token string) (domain.AuthTokens, error) {
	t := domain.AuthTokens{}
	result := s.repo.First(&t, "token = ?", token)
	return t, result.Error
}
func (s *service) DeleteAuthToken(id uuid.UUID) error {
	return s.repo.Raw("delete from authToken where id = ?", id.String()).Error
}
func (s *service) DeleteAuthTokenByUserId(userId uuid.UUID) error {
	return s.repo.Raw("delete from authToken where userID = ?", userId.String()).Error
}



