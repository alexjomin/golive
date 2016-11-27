package model

type Delivery struct {
	Software    string `json:"software"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
	Repository  string `json:"repository"`
	Build       int    `json:"build"`
	Date        string `json:"date"`
}
