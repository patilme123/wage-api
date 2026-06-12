const educationOptions = [
  ["none", "None"],
  ["high_school", "High school"],
  ["certificate", "Certificate"],
  ["associates", "Associate's"],
  ["bachelors", "Bachelor's"],
  ["masters", "Master's"],
  ["doctorate", "Doctorate"],
];

const form = document.querySelector("#wage-form");
const submitButton = document.querySelector("#submit-button");
const formError = document.querySelector("#form-error");
const emptyState = document.querySelector("#empty-state");
const resultPanel = document.querySelector("#result");

document.querySelectorAll("[data-education]").forEach((select) => {
  educationOptions.forEach(([value, label]) => {
    select.add(new Option(label, value));
  });
});

form.elements.usualEducation.value = "bachelors";
form.elements.requiredEducation.value = "masters";

form.elements.state.addEventListener("change", () => {
  const areaByState = {
    CA: "San Francisco-Oakland-Hayward",
    TX: "Austin-Round Rock",
    NY: "New York-Newark-Jersey City",
  };
  form.elements.area.value = areaByState[form.elements.state.value];
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Calculating...";

  const skillExplanation =
    form.elements.specialSkillsExplanation.value.trim();
  const payload = {
    socCode: form.elements.socCode.value.trim(),
    workLocation: {
      state: form.elements.state.value,
      area: form.elements.area.value,
    },
    jobZone: Number(form.elements.jobZone.value),
    experienceComparison: form.elements.experienceComparison.value,
    usualEducation: form.elements.usualEducation.value,
    requiredEducation: form.elements.requiredEducation.value,
    specialSkillsPoints: Number(form.elements.specialSkillsPoints.value),
    specialSkillsExplanation: skillExplanation ? [skillExplanation] : [],
    supervisesEmployees: form.elements.supervisesEmployees.checked,
    supervisionIsCustomaryForOccupation:
      form.elements.supervisionIsCustomary.checked,
  };

  try {
    const response = await fetch("/api/v1/prevailing-wages/calculate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();

    if (!response.ok) {
      const issue = body.error?.issues?.[0]?.message;
      throw new Error(issue ?? body.error?.message ?? "Request failed.");
    }

    renderResult(body);
  } catch (error) {
    formError.textContent =
      error instanceof Error ? error.message : "Unable to calculate.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Calculate wage level";
  }
});

function renderResult(response) {
  const data = response.data;
  emptyState.hidden = true;
  resultPanel.hidden = false;

  document.querySelector("#level-name").textContent = data.levelName;
  document.querySelector("#score-value").textContent = data.totalPoints;
  document.querySelector("#wage-value").textContent = data.sampleWage
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(data.sampleWage.annual)
    : "No demo wage";
  document.querySelector("#wage-note").textContent = data.sampleWage
    ? `${data.sampleWage.source.replace("_", " ")} annual wage`
    : "The calculated level is still available";

  const steps = document.querySelector("#steps");
  steps.replaceChildren(
    ...data.steps.map((step) => {
      const row = document.createElement("div");
      row.className = "step-row";

      const content = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = formatStepName(step.step);
      const explanation = document.createElement("p");
      explanation.textContent = step.explanation;
      content.append(title, explanation);

      const points = document.createElement("span");
      points.className = "points";
      points.textContent = `+${step.points}`;
      row.append(content, points);
      return row;
    }),
  );

  document.querySelector("#json-output").textContent = JSON.stringify(
    response,
    null,
    2,
  );
}

function formatStepName(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}
