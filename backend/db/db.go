package db

import (
	"HarrisonWAffel/guess-ask-reddit/config"
	"database/sql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/pkg/errors"
	_ "gorm.io/driver/postgres"
	"runtime"
	"strings"
)

func AutoMigrate() error {
	dsn := config.GetDSN(
		config.GetString("database.host"),
		config.GetString("database.port"),
		config.GetString("database.name"),
		config.GetString("database.name"),
		config.GetString("database.password"),
	)

	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		return errors.New("could not determine migration folder location")
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return err
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}

	migrationPath := "file://"+strings.ReplaceAll(filename, "db.go", "migrations")
	m, err := migrate.NewWithDatabaseInstance(migrationPath, "postgres", driver)
	if err != nil {
		return err
	}

	if err := m.Migrate(uint(config.GetInt("database.migration.step"))); err != nil {
		if err.Error() != "no change" {
			return err
		}
	}

	return nil
}