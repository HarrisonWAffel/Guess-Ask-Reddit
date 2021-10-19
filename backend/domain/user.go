package domain

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID       uuid.UUID `json:"id,omitempty" ,gorm:"primaryKey"`
	Username string    `json:"username" ,gorm:"username"`
	Email    string    `json:"email,omitempty"`
	Password string `json:"password"`
}

func (u *User) Valid() bool {
	if u.Password == "" {
		return false
	}

	if u.Username == "" {
		return false
	}

	return true
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (u *User) TableName(tx *gorm.DB) (string, error) {
	return "user", nil
}