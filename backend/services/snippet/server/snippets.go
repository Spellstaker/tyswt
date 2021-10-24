package server

import (
	"errors"
	"math/rand"
	"reflect"
)

var (
	errLangNotSpecified = errors.New("'lang' specified was empty")
	errLangNotFound     = errors.New("did not find requested language")
)

var snippets = map[string][]string{
	"python": {
		`for _ in range(int(input())):
    n, m = map(int, input().split())
    l = [*map(int, input().split())]
    print(min(m, sum(l)))`,
		`for _ in range(int(input())):
    n, m = map(int, input().split())
    res = float('inf')
    res = min(res, n * (m // 2) + (m & 1) * max(1, (n + 1) // 2))
    res = min(res, m * (n // 2) + (n & 1) * max(1, (m + 1) // 2)) 
    print(res)`,
	},
}

func randomLang() string {
	keys := reflect.ValueOf(snippets).MapKeys()
	return keys[randomIndex(len(keys))].String()
}

func randomSnippet(lang string) (string, error) {
	if lang == "" {
		return "", errLangNotSpecified
	}

	langSnippet, ok := snippets[lang]
	if !ok {
		return "", errLangNotFound
	}

	return langSnippet[randomIndex(len(langSnippet))], nil
}

func randomIndex(sliceLen int) int {
	return rand.Intn(sliceLen)
}
