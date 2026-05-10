# Local Dev Bootstrap

One-time setup for running the AcrylixCo `site/` app locally.

## Prerequisites

- macOS with [Homebrew](https://brew.sh)
- Node 20+ (`brew install node` or `nvm`)

## Postgres

```bash
brew install postgresql@16
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"   # add to shell rc

psql postgres <<'SQL'
CREATE ROLE acrylixco WITH LOGIN PASSWORD 'acrylixco_dev';
CREATE DATABASE acrylixco OWNER acrylixco;
GRANT ALL PRIVILEGES ON DATABASE acrylixco TO acrylixco;
SQL
```

## Site

```bash
cd site
cp .env.example .env.local
# Generate AUTH_SECRET and write it into .env.local
SECRET=$(openssl rand -base64 32)
sed -i '' "s|^AUTH_SECRET=.*$|AUTH_SECRET=\"$SECRET\"|" .env.local

npm install
npx drizzle-kit migrate          # after Task 9 lands
npm run dev
```

Open http://localhost:3000.

## Stopping Postgres

```bash
brew services stop postgresql@16
```
