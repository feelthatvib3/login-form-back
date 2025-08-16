package handlers

import (
	"github.com/feelthatvib3/login-form-back/app/services"
	"github.com/gofiber/fiber/v2"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *fiber.Ctx) error {
	req := new(RegisterRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	user, err := services.Register(req.Email, req.Password, req.Name)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	token, _ := services.Login(req.Email, req.Password)
	return c.JSON(fiber.Map{"success": true, "token": token, "user": user})
}

func Login(c *fiber.Ctx) error {
	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	token, err := services.Login(req.Email, req.Password)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "token": token})
}
