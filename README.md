# Prevailing Wage API

An Express API that estimates a DOL prevailing wage level
(`Level I-IV`) from job-offer requirements.

> The included dollar wages are sample data, not official DOL wage data. Do not
> use them for legal, immigration, payroll, or compliance decisions.

## Live Application

- Calculator: https://wage-api-production.up.railway.app
- Health check:
  ```bash
  curl -s https://wage-api-production.up.railway.app/api/health | jq
  ```
- Calculation API:
  `POST https://wage-api-production.up.railway.app/api/v1/prevailing-wages/calculate`

## Run Locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## API Examples

The examples below use demo wage data for SOC `15-1252` in
`San Francisco-Oakland-Hayward, CA`.

Install `jq` to format the JSON response:

```bash
brew install jq
```

If `jq` is unavailable, remove `| jq` from the command.

### Level I

Calculation: base `1` + experience `0` = Level I.

```bash
curl -s -X POST \
  https://wage-api-production.up.railway.app/api/v1/prevailing-wages/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "socCode": "15-1252",
    "workLocation": {
      "state": "CA",
      "area": "San Francisco-Oakland-Hayward"
    },
    "jobZone": 4,
    "experienceComparison": "at_or_below_start",
    "usualEducation": "bachelors",
    "requiredEducation": "bachelors",
    "specialSkillsPoints": 0,
    "specialSkillsExplanation": [],
    "supervisesEmployees": false,
    "supervisionIsCustomaryForOccupation": false
  }' | jq
```

Expected result: Level I, sample annual wage `$110,000`.

### Level II

Calculation: base `1` + experience `1` = Level II.

```bash
curl -s -X POST \
  https://wage-api-production.up.railway.app/api/v1/prevailing-wages/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "socCode": "15-1252",
    "workLocation": {
      "state": "CA",
      "area": "San Francisco-Oakland-Hayward"
    },
    "jobZone": 4,
    "experienceComparison": "low_end",
    "usualEducation": "bachelors",
    "requiredEducation": "bachelors",
    "specialSkillsPoints": 0,
    "specialSkillsExplanation": [],
    "supervisesEmployees": false,
    "supervisionIsCustomaryForOccupation": false
  }' | jq
```

Expected result: Level II, sample annual wage `$135,000`.

### Level III

Calculation: base `1` + experience `2` = Level III.

```bash
curl -s -X POST \
  https://wage-api-production.up.railway.app/api/v1/prevailing-wages/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "socCode": "15-1252",
    "workLocation": {
      "state": "CA",
      "area": "San Francisco-Oakland-Hayward"
    },
    "jobZone": 4,
    "experienceComparison": "high_end",
    "usualEducation": "bachelors",
    "requiredEducation": "bachelors",
    "specialSkillsPoints": 0,
    "specialSkillsExplanation": [],
    "supervisesEmployees": false,
    "supervisionIsCustomaryForOccupation": false
  }' | jq
```

Expected result: Level III, sample annual wage `$160,000`.

### Level IV

Calculation: base `1` + experience `3` = Level IV.

```bash
curl -s -X POST \
  https://wage-api-production.up.railway.app/api/v1/prevailing-wages/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "socCode": "15-1252",
    "workLocation": {
      "state": "CA",
      "area": "San Francisco-Oakland-Hayward"
    },
    "jobZone": 4,
    "experienceComparison": "above_range",
    "usualEducation": "bachelors",
    "requiredEducation": "bachelors",
    "specialSkillsPoints": 0,
    "specialSkillsExplanation": [],
    "supervisesEmployees": false,
    "supervisionIsCustomaryForOccupation": false
  }' | jq
```

Expected result: Level IV, sample annual wage `$185,000`.

## Request Fields

| Field | Description |
| --- | --- |
| `socCode` | SOC occupation code in `NN-NNNN` format |
| `workLocation.state` | Two-letter U.S. state code |
| `workLocation.area` | Worksite geographic area |
| `jobZone` | O*NET Job Zone from `1` to `5` |
| `experienceComparison` | Required experience compared with the occupation's usual range |
| `usualEducation` | Education normally required for the occupation |
| `requiredEducation` | Minimum education required by the job offer |
| `specialSkillsPoints` | Reviewed special-skill points from `0` to `2` |
| `specialSkillsExplanation` | Explanation required when special-skill points are greater than `0` |
| `supervisesEmployees` | Whether the offered job supervises employees |
| `supervisionIsCustomaryForOccupation` | Whether supervision is already a normal duty of the occupation |

Education values:

```text
none
high_school
certificate
associates
bachelors
masters
doctorate
```

## Supervision

Supervision is part of the DOL wage-level worksheet:

- Set `supervisesEmployees` to `true` when the job supervises at least one
  employee. This normally adds one point.
- Set `supervisionIsCustomaryForOccupation` to `true` when supervision is
  already normal for that occupation. No additional point is then added.
- For a non-supervisory job, set both fields to `false`.

## Calculation

The calculation starts with one point for Level I:

| Factor | Points |
| --- | ---: |
| Base level | 1 |
| Experience | 0-3 |
| Education above the usual requirement | 0-2 |
| Special skills | 0-2 |
| Non-customary supervision | 0-1 |

The final level is capped at Level IV. Location selects the sample dollar wage;
it does not determine the wage level.

## Example Response

```json
{
  "success": true,
  "data": {
    "wageLevel": 1,
    "levelName": "Level I",
    "rawPoints": 1,
    "totalPoints": 1,
    "sampleWage": {
      "annual": 110000,
      "hourly": 52.88,
      "currency": "USD",
      "source": "DEMO_DATA"
    },
    "steps": [
      {
        "step": "base",
        "points": 1,
        "explanation": "Every calculation starts at Level I."
      },
      {
        "step": "experience",
        "points": 0,
        "explanation": "Experience is at_or_below_start compared with the usual O*NET range."
      },
      {
        "step": "education",
        "points": 0,
        "explanation": "bachelors required; bachelors is usual."
      },
      {
        "step": "specialSkills",
        "points": 0,
        "explanation": "No special-skill points."
      },
      {
        "step": "supervision",
        "points": 0,
        "explanation": "The job does not supervise employees."
      }
    ],
    "warnings": [],
    "disclaimer": "Educational estimate only. This is not an official DOL prevailing wage determination."
  }
}
```

## Build

```bash
pnpm build
pnpm start
```
