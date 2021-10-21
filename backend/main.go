package main

import (
	"HarrisonWAffel/guess-ask-reddit/config"
	"HarrisonWAffel/guess-ask-reddit/controller"
	authController "HarrisonWAffel/guess-ask-reddit/controller/auth"
	leaderboardsController "HarrisonWAffel/guess-ask-reddit/controller/leaderboards"
	"HarrisonWAffel/guess-ask-reddit/db"
	authService "HarrisonWAffel/guess-ask-reddit/service/auth"
	leaderboardService "HarrisonWAffel/guess-ask-reddit/service/leaderboards"
	userService "HarrisonWAffel/guess-ask-reddit/service/user"
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"net/http"
	"time"
)

func main() {
	err := config.Read()
	if err != nil {
		panic(errors.Wrap(err, "could not read configuration file"))
	}

	if config.GetString("deploy.mode") == "docker" {
		time.Sleep(15 * time.Second) // give some time for the DB to start-up
	}

	err = db.AutoMigrate()
	if err != nil {
		panic(errors.Wrap(err, fmt.Sprintf("could not migrate database to version %d", config.GetInt("database.migration.step"))))
	}

	gormDb, err := gorm.Open(postgres.Open(config.DSN()), &gorm.Config{})
	if err != nil {
		panic(errors.Wrap(err, "could not open connection to database using ORM"))
	}

	port := "1337"
	m := mux.NewRouter()
	ctx := controller.AppCtx{
		AuthService:        authService.NewAuthService(gormDb),
		UserService:        userService.NewUserService(gormDb),
		LeaderboardService: leaderboardService.NewLeaderboardService(gormDb),
	}

	m.Handle("/register", &controller.Handler{
		AppCtx: ctx,
		H:      authController.Register,
	}).Methods("POST")

	m.Handle("/login", &controller.Handler{
		AppCtx: ctx,
		H:      authController.Login,
	}).Methods("POST")

	m.Handle("/logout", &controller.Handler{
		AppCtx: ctx,
		H:      authController.LogOut,
	}).Methods("POST")

	m.Handle("/refresh", &controller.Handler{
		AppCtx: ctx,
		H:      authController.RefreshToken,
	}).Methods("POST")

	m.Handle("/submit", &controller.Handler{
		AppCtx: ctx,
		H:      leaderboardsController.AddGameResultToLeaderBoard,
	}).Methods("POST")

	m.Handle("/viewLeaderBoards", &controller.Handler{
		AppCtx: ctx,
		H:      leaderboardsController.GetLeaderBoard,
	}).Methods("GET")

	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization", "authToken", "gameMode", "mode"}) //only allowed headers
	methods := handlers.AllowedMethods([]string{"GET", "POST"})                                       //only allowed requests
	origins := handlers.AllowedOrigins([]string{"*"})                                                 //any possible domain origin

	fmt.Println("Listening on port ", port)
	log.Fatalln(http.ListenAndServe(":"+port, handlers.CORS(headers, methods, origins)(m)))
}