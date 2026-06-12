import { demoWages } from "../data/demoWages.js";
import type { PrevailingWageInput } from "../validators/prevailingWage.schema.js";

const educationOrder = [
  "none",
  "high_school",
  "certificate",
  "associates",
  "bachelors",
  "masters",
  "doctorate",
] as const;

const experiencePoints = {
  at_or_below_start: 0,
  low_end: 1,
  high_end: 2,
  above_range: 3,
} as const;

const levelNames = ["", "Level I", "Level II", "Level III", "Level IV"];

export function calculatePrevailingWage(input: PrevailingWageInput) {
  const educationDifference =
    educationOrder.indexOf(input.requiredEducation) -
    educationOrder.indexOf(input.usualEducation);
  const educationPoints =
    educationDifference <= 0 ? 0 : educationDifference === 1 ? 1 : 2;
  const supervisionPoints =
    input.supervisesEmployees &&
    !input.supervisionIsCustomaryForOccupation
      ? 1
      : 0;

  const steps = [
    {
      step: "base",
      points: 1,
      explanation: "Every calculation starts at Level I.",
    },
    {
      step: "experience",
      points: experiencePoints[input.experienceComparison],
      explanation: `Experience is ${input.experienceComparison} compared with the usual O*NET range.`,
    },
    {
      step: "education",
      points: educationPoints,
      explanation: `${input.requiredEducation} required; ${input.usualEducation} is usual.`,
    },
    {
      step: "specialSkills",
      points: input.specialSkillsPoints,
      explanation:
        input.specialSkillsExplanation.join("; ") ||
        "No special-skill points.",
    },
    {
      step: "supervision",
      points: supervisionPoints,
      explanation: getSupervisionExplanation(input),
    },
  ];

  const rawPoints = steps.reduce((total, step) => total + step.points, 0);
  const wageLevel = Math.min(rawPoints, 4);
  const wageRow = demoWages.find(
    (row) =>
      row.socCode === input.socCode &&
      row.state === input.workLocation.state &&
      row.area === input.workLocation.area,
  );
  const annualWage = wageRow?.annualByLevel[wageLevel - 1];

  return {
    wageLevel,
    levelName: levelNames[wageLevel],
    rawPoints,
    totalPoints: wageLevel,
    sampleWage: annualWage
      ? {
          annual: annualWage,
          hourly: Number((annualWage / 2080).toFixed(2)),
          currency: "USD",
          source: "DEMO_DATA",
        }
      : null,
    steps,
    warnings: [
      ...(rawPoints > 4
        ? ["Score exceeded 4 and was capped at Level IV."]
        : []),
      ...(!annualWage
        ? ["No matching demo wage was found for this occupation and area."]
        : []),
    ],
    disclaimer:
      "Educational estimate only. This is not an official DOL prevailing wage determination.",
  };
}

function getSupervisionExplanation(input: PrevailingWageInput): string {
  if (!input.supervisesEmployees) return "The job does not supervise employees.";
  if (input.supervisionIsCustomaryForOccupation) {
    return "No point because supervision is customary for this occupation.";
  }
  return "1 point for non-customary supervision.";
}
