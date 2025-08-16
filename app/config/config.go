package config

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var DB *pgxpool.Pool

func LoadEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env")
	}
}

func ConnectDB() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return errors.New("no DATABASE_URL set")
	}

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return err
	}

	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	config.MaxConns = 10
	config.MinConns = 2

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return err
	}

	if err := pool.Ping(context.Background()); err != nil {
		pool.Close()
		return err
	}

	DB = pool
	log.Println("Connected to the database with connection pool")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection pool closed")
	}
}
