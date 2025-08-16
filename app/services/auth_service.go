package services

import (
	"context"
	"errors"
	"time"

	"github.com/feelthatvib3/login-form-back/app/config"
	"github.com/feelthatvib3/login-form-back/app/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Register(email, password, name string) (*models.User, error) {
	var exists int
	err := config.DB.QueryRow(context.Background(),
		`SELECT COUNT(*) FROM users WHERE email=$1`, email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists > 0 {
		return nil, errors.New("Email already registered.")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return nil, err
	}

	var id int64
	err = config.DB.QueryRow(context.Background(),
		`INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id`,
		email, string(hash), name).Scan(&id)
	if err != nil {
		return nil, err
	}

	return &models.User{ID: id, Email: email, Name: name}, nil
}

func Login(email, password string) (string, error) {
	var user models.User
	var hash string
	err := config.DB.QueryRow(context.Background(),
		`SELECT id, password_hash, name FROM users WHERE email=$1`, email).
		Scan(&user.ID, &hash, &user.Name)
	if err != nil {
		return "", errors.New("Incorrect credentials.")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err != nil {
		return "", errors.New("Incorrect credentials.")
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.ID,
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(),
	}).SignedString([]byte("test"))
	if err != nil {
		return "", err
	}

	return token, nil
}
