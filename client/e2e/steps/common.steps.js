import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

// Navigation steps
Given('I am on the register page', async ({ page }) => {
  await page.goto('/register');
});

Given('I am on the login page', async ({ page }) => {
  await page.goto('/login');
});

Given('I am on the create group page', async ({ page }) => {
  await page.goto('/create-group');
});

// Page title assertions
Then('I should see the page title {string}', async ({ page }, title) => {
  await expect(page.locator('h1')).toHaveText(title);
});

Then('I should see the subtitle {string}', async ({ page }, subtitle) => {
  await expect(page.locator('.register-subtitle, .login-subtitle')).toHaveText(subtitle);
});

// Form field visibility
Then('I should see the name input field', async ({ page }) => {
  await expect(page.locator('#name')).toBeVisible();
});

Then('I should see the email input field', async ({ page }) => {
  await expect(page.locator('#email')).toBeVisible();
});

Then('I should see the password input field', async ({ page }) => {
  await expect(page.locator('#password')).toBeVisible();
});

Then('I should see the confirm password input field', async ({ page }) => {
  await expect(page.locator('#confirmPassword')).toBeVisible();
});

Then('I should see the group name input field', async ({ page }) => {
  await expect(page.locator('#groupName')).toBeVisible();
});

Then('I should see the terms checkbox', async ({ page }) => {
  await expect(page.locator('input[type="checkbox"]')).toBeVisible();
});

Then('I should see the remember me checkbox', async ({ page }) => {
  await expect(page.locator('input[type="checkbox"]')).toBeVisible();
});

Then('I should see the forgot password link', async ({ page }) => {
  await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
});

Then('I should see the {string} button', async ({ page }, buttonText) => {
  await expect(page.locator(`button[type="submit"]:has-text("${buttonText}"), button:has-text("${buttonText}")`)).toBeVisible();
});

Then('I should see a link to login page', async ({ page }) => {
  await expect(page.locator('a[href="/login"]')).toBeVisible();
});

Then('I should see a link to register page', async ({ page }) => {
  await expect(page.locator('a[href="/register"]')).toBeVisible();
});

// Form interactions
When('I click the submit button', async ({ page }) => {
  await page.locator('button[type="submit"]').click();
});

When('I enter {string} in the name field', async ({ page }, value) => {
  await page.fill('#name', value);
});

When('I enter {string} in the email field', async ({ page }, value) => {
  await page.fill('#email', value);
});

When('I enter {string} in the password field', async ({ page }, value) => {
  await page.fill('#password', value);
});

When('I enter {string} in the confirm password field', async ({ page }, value) => {
  await page.fill('#confirmPassword', value);
});

When('I enter {string} in the group name field', async ({ page }, value) => {
  await page.fill('#groupName', value);
});

When('I blur the email field', async ({ page }) => {
  await page.locator('#email').blur();
});

When('I blur the password field', async ({ page }) => {
  await page.locator('#password').blur();
});

When('I blur the confirm password field', async ({ page }) => {
  await page.locator('#confirmPassword').blur();
});

When('I check the terms checkbox', async ({ page }) => {
  await page.locator('input[type="checkbox"]').check();
});

When('I check the remember me checkbox', async ({ page }) => {
  await page.locator('input[type="checkbox"]').check();
});

When('I click the sign in link', async ({ page }) => {
  await page.click('a[href="/login"]');
});

When('I click the create account link', async ({ page }) => {
  await page.click('a[href="/register"]');
});

// Validation error assertions
Then('I should see a validation error', async ({ page }) => {
  await expect(page.locator('text=required').first()).toBeVisible({ timeout: 5000 });
});

Then('I should see an email validation error', async ({ page }) => {
  await expect(page.locator('text=valid email').or(page.locator('text=Invalid email'))).toBeVisible({ timeout: 5000 });
});

Then('I should see {string} error', async ({ page }, errorText) => {
  await expect(page.locator(`text=${errorText}`)).toBeVisible({ timeout: 5000 });
});

Then('I should not see any validation errors', async ({ page }) => {
  await expect(page.locator('.error-box')).not.toBeVisible();
});

// Navigation assertions
Then('I should be on the login page', async ({ page }) => {
  await expect(page).toHaveURL('/login');
});

Then('I should be on the register page', async ({ page }) => {
  await expect(page).toHaveURL('/register');
});

// Checkbox assertions
Then('the remember me checkbox should be checked', async ({ page }) => {
  await expect(page.locator('input[type="checkbox"]')).toBeChecked();
});

// Create Group specific steps
Then('I should see {string} label', async ({ page }, label) => {
  await expect(page.locator(`text=${label}`)).toBeVisible();
});

Then('I should see {string} type option', async ({ page }, type) => {
  await expect(page.locator(`button:has-text("${type}")`)).toBeVisible();
});

Then('I should see {string}', async ({ page }, text) => {
  await expect(page.locator(`text=${text}`)).toBeVisible();
});

Then('I should not see {string}', async ({ page }, text) => {
  await expect(page.locator(`text=${text}`)).not.toBeVisible();
});

Given('the create button is disabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Create Group")')).toBeDisabled();
});

Then('the create button should be disabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Create Group")')).toBeDisabled();
});

Then('the create button should be enabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Create Group")')).toBeEnabled();
});

When('I select {string} type', async ({ page }, type) => {
  await page.click(`button:has-text("${type}")`);
});

Then('the {string} type should be active', async ({ page }, type) => {
  await expect(page.locator(`button:has-text("${type}")`)).toHaveClass(/type-option--active/);
});

Then('I should see the start date field', async ({ page }) => {
  await expect(page.locator('#startDate')).toBeVisible();
});

Then('I should not see the start date field', async ({ page }) => {
  await expect(page.locator('#startDate')).not.toBeVisible();
});

Then('I should see the end date field', async ({ page }) => {
  await expect(page.locator('#endDate')).toBeVisible();
});

Then('I should not see the end date field', async ({ page }) => {
  await expect(page.locator('#endDate')).not.toBeVisible();
});

Then('I should see the renewal date field', async ({ page }) => {
  await expect(page.locator('#renewalDate')).toBeVisible();
});

Then('I should not see the renewal date field', async ({ page }) => {
  await expect(page.locator('#renewalDate')).not.toBeVisible();
});

When('I click the create group button', async ({ page }) => {
  await page.click('button:has-text("Create Group")');
});

When('I toggle the balance alerts setting', async ({ page }) => {
  await page.locator('.toggle-btn').first().click();
});

Then('the balance alerts setting should be active', async ({ page }) => {
  await expect(page.locator('.toggle-btn').first()).toHaveClass(/toggle-btn--active/);
});

// Add Group Members specific steps
Given('I am on the add members page', async ({ page }) => {
  // First create a group to get to the add members step
  await page.goto('/create-group');
  await page.fill('#groupName', 'Test Group');
  // Must select a type to enable the create button
  await page.click('button:has-text("Trip")');
  await page.click('button:has-text("Create Group")');
  // Wait for the step to change to members
  await expect(page.locator('h2:has-text("Add Members")')).toBeVisible({ timeout: 5000 });
});

Then('I should see the title {string}', async ({ page }, title) => {
  await expect(page.locator(`h2:has-text("${title}")`).first()).toBeVisible();
});

Then('I should see the Add button', async ({ page }) => {
  await expect(page.locator('button:has-text("Add")')).toBeVisible();
});

Then('I should see the group link input', async ({ page }) => {
  await expect(page.locator('.share-link__input, input[readonly]')).toBeVisible();
});

Then('I should see the Skip for Now button', async ({ page }) => {
  await expect(page.locator('button:has-text("Skip for Now")')).toBeVisible();
});

Then('I should see the Done button', async ({ page }) => {
  await expect(page.locator('button:has-text("Done")')).toBeVisible();
});

Then('the Add button should be disabled', async ({ page }) => {
  await expect(page.locator('button.btn-add')).toBeDisabled();
});

Then('the Add button should be enabled', async ({ page }) => {
  await expect(page.locator('button.btn-add')).toBeEnabled();
});

When('I click on friend {string}', async ({ page }, friendName) => {
  await page.locator(`.friend-item:has-text("${friendName}")`).click();
});

Then('the friend {string} should be selected', async ({ page }, friendName) => {
  await expect(page.locator(`.friend-item--selected:has-text("${friendName}")`)).toBeVisible();
});

Then('the friend {string} should not be selected', async ({ page }, friendName) => {
  // Friend item should exist but not have the selected class
  const friendItem = page.locator(`.friend-item:has-text("${friendName}")`);
  await expect(friendItem).toBeVisible();
  await expect(friendItem).not.toHaveClass(/friend-item--selected/);
});

Then('the Done button should be disabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Done")')).toBeDisabled();
});

Then('the Done button should be enabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Done")')).toBeEnabled();
});

When('I click the Skip for Now button', async ({ page }) => {
  await page.click('button:has-text("Skip for Now")');
});

Then('I should be on the expenses page', async ({ page }) => {
  await expect(page).toHaveURL(/\/expenses/);
});

// Create Expense specific steps
Given('I am on the create expense page', async ({ page }) => {
  await page.goto('/create-expense');
});

Then('I should see the group indicator {string}', async ({ page }, groupName) => {
  await expect(page.locator(`.group-indicator:has-text("${groupName}"), .current-group:has-text("${groupName}")`)).toBeVisible();
});

Then('I should see the description input field', async ({ page }) => {
  await expect(page.locator('#description')).toBeVisible();
});

Then('I should see the amount input field', async ({ page }) => {
  await expect(page.locator('#amount')).toBeVisible();
});

Then('I should see the payer options', async ({ page }) => {
  await expect(page.locator('.paid-by__options')).toBeVisible();
});

Then('I should see the Add Expense button', async ({ page }) => {
  await expect(page.locator('button:has-text("Add Expense")')).toBeVisible();
});

Then('the Add Expense button should be disabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Add Expense")')).toBeDisabled();
});

Then('the Add Expense button should be enabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Add Expense")')).toBeEnabled();
});

When('I enter {string} in the amount field', async ({ page }, value) => {
  await page.fill('#amount', value);
});

When('I enter {string} in the description field', async ({ page }, value) => {
  await page.fill('#description', value);
});

When('I click on payer {string}', async ({ page }, payerName) => {
  await page.locator(`.payer-option:has-text("${payerName}"), .payer-item:has-text("${payerName}")`).click();
});

Then('the payer {string} should be active', async ({ page }, payerName) => {
  await expect(page.locator(`.payer-option:has-text("${payerName}"), .payer-item:has-text("${payerName}")`)).toHaveClass(/active|selected/);
});

When('I click the Multiple payers toggle', async ({ page }) => {
  await page.locator('text=Multiple payers').click();
});

Then('I should see {string} toggle text', async ({ page }, text) => {
  await expect(page.locator(`.mode-toggle:has-text("${text}"), button:has-text("${text}")`)).toBeVisible();
});

When('I click the Split evenly button', async ({ page }) => {
  await page.click('button:has-text("Split evenly")');
});

Then('I should see split amounts displayed', async ({ page }) => {
  // Check that split amounts section is visible
  await expect(page.locator('.split-amounts')).toBeVisible();
});
// API Mocking steps for authentication
Given('the API will return a successful registration response', async ({ page }) => {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          _id: 'mock-user-id',
          name: 'John Doe',
          email: 'john@example.com',
          token: 'mock-jwt-token'
        }
      })
    });
  });
});

Given('the API will return a successful login response', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          _id: 'mock-user-id',
          name: 'Test User',
          email: 'test@example.com',
          token: 'mock-jwt-token'
        }
      })
    });
  });
});

Given('the API will return {string} error', async ({ page }, errorMessage) => {
  await page.route('**/api/auth/**', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: errorMessage
      })
    });
  });
});

Given('the API will delay response for {int} second(s)', async ({ page }, seconds) => {
  await page.route('**/api/auth/**', async (route) => {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          _id: 'mock-user-id',
          name: 'Test User',
          email: 'test@example.com',
          token: 'mock-jwt-token'
        }
      })
    });
  });
});

// Redirect assertions
Then('I should be redirected to the expenses page', async ({ page }) => {
  await expect(page).toHaveURL(/\/expenses/);
});

Then('I should be redirected to the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/\/dashboard/);
});

// Error message assertions
Then('I should see {string} error message', async ({ page }, errorMessage) => {
  await expect(page.locator('.error-box')).toContainText(errorMessage);
});

// Loading state assertions
Then('I should see the loading spinner', async ({ page }) => {
  await expect(page.locator('.btn-loading')).toBeVisible();
});

Then('the submit button should be disabled', async ({ page }) => {
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
});