package domain

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRequest struct {
	Password string `json:"password,omitempty"`
	Username string `json:"username"`
}

type User struct {
	ID       uuid.UUID `json:"id" ,gorm:"primaryKey"`
	Username string    `json:"username" ,gorm:"username"`
	Password []byte	   `json:"-"`
}

func (u *User) Valid() bool {
	if len(u.Password) == 0  {
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