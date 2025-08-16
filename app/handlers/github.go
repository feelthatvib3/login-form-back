package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GithubInitiate(c *fiber.Ctx) error {
	clientID := os.Getenv("GITHUB_CLIENT_ID")
	redirectURI := os.Getenv("GITHUB_REDIRECT_URI")
	state := "randomstate"
	authURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&state=%s&scope=read:user",
		clientID, url.QueryEscape(redirectURI), state,
	)
	return c.Redirect(authURL)
}

func GithubCallback(c *fiber.Ctx) error {
	clientID := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")
	redirectURI := os.Getenv("GITHUB_REDIRECT_URI")
	jwtSecret := os.Getenv("JWT_SECRET")

	code := c.Query("code")
	state := c.Query("state")
	if code == "" || state == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing code or state")
	}

	data := url.Values{}
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)
	data.Set("state", state)

	resp, err := http.PostForm("https://github.com/login/oauth/access_token", data)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	values, _ := url.ParseQuery(string(body))
	accessToken := values.Get("access_token")
	if accessToken == "" {
		return c.Status(fiber.StatusBadRequest).SendString("No access token returned")
	}

	req, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
	req.Header.Set("Authorization", "token "+accessToken)
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	var user map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&user); err != nil {
		return err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    user["id"],
		"login": user["login"],
	})
	signedToken, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return err
	}

	frontendURL := fmt.Sprintf("%s/auth/success?token=%s", os.Getenv("FRONTEND_URL"), signedToken)
	return c.Redirect(frontendURL)
}
