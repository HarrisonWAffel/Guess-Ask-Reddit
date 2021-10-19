package main

import (
	"HarrisonWAffel/guess-ask-reddit/config"
	"HarrisonWAffel/guess-ask-reddit/controller"
	"HarrisonWAffel/guess-ask-reddit/controller/auth"
	"HarrisonWAffel/guess-ask-reddit/db"
	auth2 "HarrisonWAffel/guess-ask-reddit/service/auth"
	"HarrisonWAffel/guess-ask-reddit/service/user"
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"net/http"
)

func main() {
	err := config.Read()
	if err != nil {
		panic(errors.Wrap(err, "could not read configuration file"))
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
	mux := mux.NewRouter()
	ctx := config.AppCtx{
		AuthService: auth2.NewAuthService(gormDb),
		UserService: user.NewUserService(gormDb),
	}

	mux.Handle("/test", &controller.Handler{
		AppCtx: ctx,
		H: func(ctx *config.AppCtx, resp *controller.APIResp, r *http.Request) {
			all, err := ctx.UserService.GetAllUsers()
			if err != nil {
				resp.SetError(err, "could not get all users")
				return
			}

			resp.Body = all
		},
	})

	mux.Handle("/register", &controller.Handler{
		AppCtx: ctx,
		H:      auth.Register,
	}).Methods("POST")

	mux.Handle("/login", &controller.Handler{
		AppCtx: ctx,
		H:      auth.Login,
	}).Methods("POST")

	mux.Handle("/logout", &controller.Handler{
		AppCtx: ctx,
		H:      auth.LogOut,
	}).Methods("POST")

	mux.Handle("/refresh", &controller.Handler{
		AppCtx: ctx,
		H:      auth.RefreshToken,
	}).Methods("POST")

	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}) //only allowed headers
	methods := handlers.AllowedMethods([]string{"GET", "POST"})                                       //only allowed requests
	origins := handlers.AllowedOrigins([]string{"*"})                                                 //any possible domain origin

	fmt.Println("Listening on port ", port)
	log.Fatalln(http.ListenAndServe(":"+port, handlers.CORS(headers, methods, origins)(mux)))
}