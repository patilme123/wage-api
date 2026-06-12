# Prevailing Wage API

A TypeScript and Express application that estimates a DOL prevailing wage level
from structured job-offer requirements. It includes:

- A simple route/controller/service structure
- Request validation and consistent JSON errors
- A browser calculator served at `/`
- A small demo wage-data file that can later be replaced
- Clearly labeled, invented demo wage values

This is an educational calculator, not an official Department of Labor
determination.

## Project layout

```text
public/                   Browser calculator
src/
  controllers/            HTTP request and response handlers
  data/                   Hardcoded demo wage records
  routes/                 Express API routes
  services/               Prevailing wage calculation rules
  validators/             Request validation schema
  app.ts                  Express app composition
  server.ts               HTTP server entry point
```

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` to use the calculator. The service reads `PORT`
from the environment and defaults to `3000`.

## API endpoints

### Health check

```http
GET /api/health
```

### Calculate a prevailing wage level

```http
POST /api/v1/prevailing-wages/calculate
Content-Type: application/json
```

Example:

```json
{
  "socCode": "15-1252",
  "workLocation": {
    "state": "CA",
    "area": "San Francisco-Oakland-Hayward"
  },
  "jobZone": 4,
  "experienceComparison": "high_end",
  "usualEducation": "bachelors",
  "requiredEducation": "masters",
  "specialSkillsPoints": 1,
  "specialSkillsExplanation": [
    "Advanced distributed-systems expertise"
  ],
  "supervisesEmployees": true,
  "supervisionIsCustomaryForOccupation": false
}
```

The successful response is wrapped in:

```json
{
  "success": true,
  "data": {
    "wageLevel": 4,
    "levelName": "Level IV"
  }
}
```

Validation and server errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body is invalid."
  }
}
```

## Calculation model

Every calculation starts with one point for Level I. Points are added for:

- Experience compared with the occupation's O*NET Job Zone/SVP range: `0-3`
- Education above the usual category: `0-2`
- Reviewed special skills: `0-2`
- Non-customary employee supervision: `0-1`

The final sum is capped at Level IV. The location does not normally determine
the level; it selects the wage record after the level is calculated.

The caller supplies judgment-based values such as `experienceComparison` and
`specialSkillsPoints`. The application does not infer these from job-title
keywords.

## Demo wage data

`src/data/demoWages.ts` contains a few invented SOC/location/level records.
Replace that array or change the service to call a database/API when official
data is added.

Do not use the demo wages for immigration, payroll, legal, or compliance
decisions.

## Build and deploy

```bash
pnpm build
pnpm start
```

Railway or Render settings:

- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Health-check path: `/api/health`

Both platforms supply `PORT` automatically.

## Policy references

- [DOL Prevailing Wage Determination Policy Guidance](https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/NPWHC_Guidance_Revised_11_2009.pdf)
- [DOL prevailing wage resources](https://www.dol.gov/agencies/eta/foreign-labor/wages)
- [O*NET Job Zones](https://www.onetonline.org/help/online/zones)
