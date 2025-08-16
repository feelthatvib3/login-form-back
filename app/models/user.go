package models

type User struct {
	ID        int64  `json:"id"`
	Email     string `json:"email"`
	Password  string `json:"-"`
	Name      string `json:"name"`
	GithubID  string `json:"githubId,omitempty"`
	AvatarURL string `json:"avatarUrl,omitempty"`
}
