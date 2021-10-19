package config

import (
	"fmt"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"strings"
)

var (
	v             *viper.Viper
	propertyNames map[string]struct{}
)

func init() {
	v = viper.New()
}

const (
	databaseHost = "database.host"
	databaseName = "database.name"
	databasePassword = "database.password"
	LogLevel = "log.level"
)

func Read() error {
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()
	v.SetConfigName("config")
	v.SetConfigType("yml")
	v.AddConfigPath(".")
	v.AddConfigPath("./config")
	path := "../config"
	depth := 10
	for i := 0; i < depth; i++ {
		v.AddConfigPath(path)
		path = "../" + path
	}
	err := v.ReadInConfig()
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("Error reading config file %s", v.ConfigFileUsed()))
	}

	propertyNames = make(map[string]struct{})
	for _, k := range v.AllKeys() {
		propertyNames[k] = struct{}{}
	}

	return nil
}

func requireNotMissing(key string) {
	_, ok := propertyNames[key]
	if !ok {
		panic(fmt.Sprintf("config %s is missing property %s", v.ConfigFileUsed(), key))
	}
}

func GetString(key string) string {
	requireNotMissing(key)
	value := v.GetString(key)
	return value
}

func GetInt(key string) int {
	requireNotMissing(key)
	value := v.GetInt(key)
	return value
}

func GetBool(key string) bool {
	requireNotMissing(key)
	return v.GetBool(key)
}

func GetDSN(databaseHost string, databasePort string, databaseName string, databaseUserName string, databasePassword string) string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		databaseHost, databaseUserName, databasePassword, databaseName, databasePort)
}

func DSN() string {
	return GetDSN(
		GetString("database.host"),
		GetString("database.port"),
		GetString("database.name"),
		GetString("database.name"),
		GetString("database.password"),
	)
}