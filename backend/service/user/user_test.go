package user

import (
	"HarrisonWAffel/guess-ask-reddit/config"
	"HarrisonWAffel/guess-ask-reddit/domain"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"testing"
)

func TestUserService(t *testing.T) {
	// setup service
	require.NoError(t, config.Read())
	gormDb, err := gorm.Open(postgres.Open(config.DSN()), &gorm.Config{})
	if err != nil {
		panic(errors.Wrap(err, "could not open connection to database using ORM"))
	}

	us := NewUserService(gormDb)
	t.Run("test get users", func(t *testing.T) {
		testGetUsers(t, us)
	})
}

func testGetUsers(t *testing.T, us Service) {
	// need test data... >:(
	testUsers := []domain.User{
		{
			ID:       uuid.New(),
			Username: "TEST USER",
			Password: []byte("NAH"),
		},
		{
			ID:       uuid.New(),
			Username: "TEST USER2",
			Password: []byte("NAH2"),
		},
	}

	for _, u := range testUsers {
		// a better idea would be to
		// wrap the setup of the test data within a single transaction
		// so that it can all be rolled back on an error.
		// but really using a throw away test DB would be the better solution.
		// for now, its not that serious.
		require.NoError(t, us.SaveUser(u))
	}

	var ids []string
	for _, u := range testUsers {
		ids = append(ids, u.ID.String())
	}

	gotUsers, err := us.GetUsers(ids)
	if err != nil {
		us.DeleteUser(testUsers[0])
		us.DeleteUser(testUsers[1])
		t.FailNow()
	}

	require.Equal(t, testUsers, gotUsers)

	// cleanup test data
	for _, u := range testUsers {
		us.DeleteUser(u)
	}
}


