export interface DemoWage {
  socCode: string;
  state: string;
  area: string;
  annualByLevel: [number, number, number, number];
}

// These values are examples only. They are not official DOL wage data.
export const demoWages: DemoWage[] = [
  {
    socCode: "15-1252",
    state: "CA",
    area: "San Francisco-Oakland-Hayward",
    annualByLevel: [110_000, 135_000, 160_000, 185_000],
  },
  {
    socCode: "15-1252",
    state: "TX",
    area: "Austin-Round Rock",
    annualByLevel: [82_000, 102_000, 124_000, 148_000],
  },
  {
    socCode: "13-2011",
    state: "NY",
    area: "New York-Newark-Jersey City",
    annualByLevel: [72_000, 91_000, 113_000, 138_000],
  },
];
