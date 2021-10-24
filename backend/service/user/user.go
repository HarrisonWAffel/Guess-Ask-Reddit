package user

import (
	"HarrisonWAffel/guess-ask-reddit/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type IDToUserMap = map[string]domain.User

type Service interface {
	GetAllUsers() ([]domain.User, error)
	GetUser(id uuid.UUID) (domain.User, error)
	GetUsers(ids []string) (IDToUserMap, error)
	GetUserByUsername(username string) (domain.User, error)
	SaveUser(user domain.User) error
	UpdateUser(user domain.User) (domain.User, error)
	DeleteUser(user domain.User) error
}

type service struct {
	repo *gorm.DB
}

func NewUserService(db *gorm.DB) Service {
	return &service{
		repo: db,
	}
}

func (s *service) GetAllUsers() ([]domain.User, error) {
	u := []domain.User{}
	result := s.repo.Find(&u)
	return u, result.Error
}

func (s *service) GetUsers(ids []string) (IDToUserMap, error) {
	users := []domain.User{}
	result := s.repo.Raw("select * from users where id in (?)", ids).Scan(&users) // probably wont work
	m := make(map[string]domain.User)

	// n^2 :/
	for _, userId := range ids {
		for _, user := range users {
			if userId == user.ID.String() {
				m[userId] = user
			}
		}
	}

	return m, result.Error
}


func (s *service) GetUser(id uuid.UUID) (domain.User, error) {
	u := domain.User{}
	result := s.repo.First(&u, "id = ?", id.String())
	if result.Error != nil {
		return domain.User{}, result.Error
	}
	return u, nil
}

func (s *service) GetUserByUsername(username string) (domain.User, error) {
	u := domain.User{}
	result := s.repo.First(&u, "username = ?", username)
	if result.Error != nil {
		return domain.User{}, result.Error
	}
	return u, nil
}

func (s *service) SaveUser(user domain.User) error {
	switch user.Email {
	case "":
		return s.repo.Omit("email").Create(&user).Error
	default:
		return s.repo.Create(&user).Error
	}
}

func (s *service) UpdateUser(user domain.User) (domain.User, error) {
	result := s.repo.Save(&user)
	return user, result.Error
}

func (s *service) DeleteUser(user domain.User) error {
	return s.repo.Delete(&user, "id = ?", user.ID.String()).Error
}
