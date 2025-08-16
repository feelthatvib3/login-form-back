package main

import (
	"log"
	"os"

	"github.com/feelthatvib3/login-form-back/app/config"
	"github.com/feelthatvib3/login-form-back/app/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())

	config.LoadEnv()

	if err := config.ConnectDB(); err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer config.CloseDB()

	api := app.Group("/auth")
	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)
	api.Get("/github", handlers.GithubInitiate)
	api.Get("/github/callback", handlers.GithubCallback)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
