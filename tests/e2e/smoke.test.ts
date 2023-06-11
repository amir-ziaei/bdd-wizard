import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { KEYWORDS } from "~/routes/_index";

test("smoke", async ({ page }) => {
  const scenario = buildScenario();
  await page.goto("/");

  await page
    .getByRole("textbox", { name: /scenario title/i })
    .fill(scenario.title);

  for (let i = 0; i < scenario.fields.length; i++) {
    const field = scenario.fields[i];
    const fieldNumber = i + 1;

    await page
      .getByRole("combobox", {
        name: new RegExp(`keyword of the field ${fieldNumber}`, "i"),
      })
      .selectOption(field.keyword);
    await page
      .getByRole("textbox", {
        name: new RegExp(`description of the field ${fieldNumber}`, "i"),
      })
      .fill(field.description);

    const isLast = i === scenario.fields.length - 1;
    if (isLast) break;

    await page
      .getByRole("button", {
        name: /add a field/i,
      })
      .click();
  }

  const expectedJiraOutput = `{panel:title=${scenario.title}}${scenario.fields
    .map((field) => `*${field.keyword}* ${field.description}`)
    .join("")}{panel}`;

  expect(await page.getByTestId("jira-output")).toContainText(
    expectedJiraOutput
  );

  await page.getByRole("button", { name: /copy/i }).click();
  await expect(
    await page.evaluate(() => navigator.clipboard.readText())
  ).toEqual(
    `{panel:title=${scenario.title}}\n${scenario.fields
      .map((field) => `*${field.keyword}* ${field.description}`)
      .join("\n")}\n{panel}`
  );

  await page
    .getByRole("switch", {
      name: /preview/i,
    })
    .check();

  expect(await page.getByText(scenario.title)).toBeInViewport();

  expect(await page.getByRole("article")).toContainText(
    scenario.fields
      .map((field) => `${field.keyword} ${field.description}`)
      .join("")
  );

  await page
    .getByRole("switch", {
      name: /preview/i,
    })
    .uncheck();

  expect(await page.getByTestId("jira-output")).toContainText(
    expectedJiraOutput
  );
});

type Scenario = {
  title: string;
  fields: Array<{
    keyword: string;
    description: string;
  }>;
};

function buildScenario(overrides?: Partial<Scenario>): Scenario {
  return {
    title: faker.lorem.sentence(),
    fields: Array.from({
      length: faker.datatype.number({ min: 3, max: 7 }),
    }).map(() => ({
      keyword: faker.helpers.arrayElement(KEYWORDS),
      description: faker.lorem.sentence(),
    })),
    ...overrides,
  };
}
