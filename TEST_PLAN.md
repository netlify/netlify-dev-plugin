# test fixtures

## test netlify dev --live

1. CRA
2. CRA + redirect for SPA
3. CRA + functions
4. CRA + redirected functions
5. Gatsby

## netlify dev

1. netlify dev
2. netlify dev --port 23
3. netlify dev --cmd vuepress
4. netlify dev --offline
5. netlify dev, with toml, good port

[dev]
port = 8000 # Port that the dev server will be listening on

6. netlify dev, with toml, bad port

[dev]
port = 9999 # Port that the dev server will be listening on

7. netlify dev, with toml, \_redirects inside publish

[dev]
publish = "public"

8. netlify dev, with toml, custom command

[dev]
command = "yarn start"

9. netlify dev,
   with custom command in flag, --cmd vuepress,
   but also custom command in toml (flag should win)

[dev]
command = "yarn start"
