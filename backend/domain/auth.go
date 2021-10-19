package domain

import (
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"time"
)

type AuthTokens struct {
	ID        uuid.UUID `json:"id" ,gorm:"primaryKey"`
	Userid       uuid.UUID `json:"user_id"`
	Token        string    `json:"auth_token"`
	RefreshToken string    `json:"refresh_token"`
	Expiry       time.Time `json:"expiry"`
}

func (a *AuthTokens) TableName(tx *gorm.DB) (string, error) {
	return "authToken", nil
}

func (a *AuthTokens) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}

	if a.Token == "" || a.RefreshToken == "" {
		return errors.New("invalid token value")
	}

	return nil
}

