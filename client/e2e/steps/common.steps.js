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
  // Mock the auth verification API to prevent token invalidation
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { _id: 'mock-user-id', name: 'John Doe', email: 'john@example.com' }
      })
    });
  });
  // Use addInitScript to set auth before page loads
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'mock-user-id',
      name: 'John Doe',
      email: 'john@example.com'
    }));
  });
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
  await page.click('a:has-text("Create an Account"), .btn-secondary');
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
  // Mock the groups API for the create request
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { _id: 'mock-group-id', name: 'Test Group', type: 'Family', members: [] }
        })
      });
    } else {
      await route.fallback();
    }
  });

  // Mock friends API for the add members step
  await page.route('**/api/friends', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // Could be a button or a router-link with btn-create class
  await page.click('.btn-create, button:has-text("Create Group")');
});

When('I toggle the balance alerts setting', async ({ page }) => {
  await page.locator('.toggle-btn').first().click();
});

Then('the balance alerts setting should be active', async ({ page }) => {
  await expect(page.locator('.toggle-btn').first()).toHaveClass(/toggle-btn--active/);
});

// Add Group Members specific steps
Given('I am on the add members page', async ({ page }) => {
  // Mock the auth verification API to prevent token invalidation
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { _id: 'mock-user-id', name: 'John Doe', email: 'john@example.com' }
      })
    });
  });

  // Mock the groups API first (before any navigation)
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { _id: 'mock-group-id', name: 'Test Group', type: 'Trip', members: [] }
        })
      });
    } else if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    } else {
      await route.continue();
    }
  });
  
  // Mock the groups balance total API
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { balance: 0 } })
    });
  });
  
  // Mock the friends API
  await page.route('**/api/friends', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { _id: 'friend1', name: 'John Doe', email: 'john.doe@example.com' },
        { _id: 'friend2', name: 'Jane Smith', email: 'jane.smith@example.com' }
      ])
    });
  });

  // Use addInitScript to set auth before page loads
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'mock-user-id',
      name: 'John Doe',
      email: 'john@example.com'
    }));
  });
  
  // Navigate to create group - auth will be set before Vue router checks
  await page.goto('/create-group');
  await page.waitForSelector('#groupName', { timeout: 10000 });
  await page.fill('#groupName', 'Test Group');
  // Must select a type to enable the create button
  await page.click('button:has-text("Trip")');
  // Wait for the Create Group button to be enabled before clicking
  const createBtn = page.locator('.btn-create');
  await expect(createBtn).toBeEnabled({ timeout: 5000 });
  await createBtn.click();
  // Wait for the step to change to members
  await expect(page.locator('h2:has-text("Add Members")')).toBeVisible({ timeout: 15000 });
});

Then('I should see the title {string}', async ({ page }, title) => {
  // Check for h1 or h2 with the title - use Playwright's toBeVisible for auto-waiting
  const h1 = page.locator(`h1:has-text("${title}")`).first();
  const h2 = page.locator(`h2:has-text("${title}")`).first();
  const titleLocator = page.locator(`h1:has-text("${title}"), h2:has-text("${title}")`).first();
  await expect(titleLocator).toBeVisible({ timeout: 5000 });
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

Then('I should be on the groups page', async ({ page }) => {
  await expect(page).toHaveURL(/\/groups/);
});

// Create Expense specific steps
Given('I am on the create expense page', async ({ page }) => {
  const mockGroupId = 'mock-group-id';
  const mockUserId = 'mock-user-id';
  
  const mockGroupData = {
    _id: mockGroupId,
    name: 'Roommates',
    type: 'Home',
    members: [
      { _id: 'user-john', name: 'John', email: 'johnmember@example.com' },
      { _id: 'user-jane', name: 'Jane', email: 'jane@example.com' }
    ],
    createdBy: mockUserId
  };
  
  // Mock the auth verification API
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { _id: mockUserId, name: 'You', email: 'john@example.com' }
      })
    });
  });
  
  // Mock any group fetch - match the exact endpoint pattern  
  // API returns { success: true, data: group }
  await page.route(/\/api\/groups\/[^/]+$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: mockGroupData
      })
    });
  });
  
  // Use addInitScript to set auth before page loads
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'mock-user-id',
      name: 'You', 
      email: 'john@example.com'
    }));
  });
  
  // Navigate with groupId to load the mocked group
  await page.goto(`/create-expense?groupId=${mockGroupId}`);
  
  // Wait for the component to fully render (loading spinner gone, form visible)
  await page.waitForSelector('.create-expense', { timeout: 10000 });
  // Wait for group name to appear confirming mock worked
  await page.waitForSelector('.group-indicator__name', { timeout: 5000 });
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
  // Click payer in the "Paid by" section specifically (not the "Split among" section)
  await page.locator(`.paid-by .payer-option:has-text("${payerName}"), .paid-by__options .payer-option:has-text("${payerName}")`).first().click();
});

Then('the payer {string} should be active', async ({ page }, payerName) => {
  // Check payer in the "Paid by" section specifically
  await expect(page.locator(`.paid-by .payer-option:has-text("${payerName}"), .paid-by__options .payer-option:has-text("${payerName}")`).first()).toHaveClass(/active/);
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

// Split Type step definitions
Then('I should see the split type selector', async ({ page }) => {
  await expect(page.locator('.split-type')).toBeVisible();
});

Then('split type {string} should be active', async ({ page }, splitType) => {
  await expect(page.locator(`.split-type__btn--active:has-text("${splitType}")`)).toBeVisible();
});

When('I click on split type {string}', async ({ page }, splitType) => {
  await page.click(`.split-type__btn:has-text("${splitType}")`);
});

Then('I should see exact amount inputs for each participant', async ({ page }) => {
  await expect(page.locator('.split-values .split-value-item')).toHaveCount(2);
});

Then('I should see percentage inputs for each participant', async ({ page }) => {
  await expect(page.locator('.split-values .split-value-item')).toHaveCount(2);
});

Then('I should see shares inputs for each participant', async ({ page }) => {
  await expect(page.locator('.split-values .split-value-item')).toHaveCount(2);
});

When('I enter {string} in exact amount for {string}', async ({ page }, amount, name) => {
  const row = page.locator(`.split-value-item:has-text("${name}")`);
  await row.locator('.split-value-item__field').fill(amount);
});

When('I enter {string} in percentage for {string}', async ({ page }, percentage, name) => {
  const row = page.locator(`.split-value-item:has-text("${name}")`);
  await row.locator('.split-value-item__field').fill(percentage);
});

When('I enter {string} in shares for {string}', async ({ page }, shares, name) => {
  const row = page.locator(`.split-value-item:has-text("${name}")`);
  await row.locator('.split-value-item__field').fill(shares);
});

Then('I should see {string} message', async ({ page }, message) => {
  await expect(page.locator(`text=${message}`)).toBeVisible();
});

Then('I should see {string} calculated for {string}', async ({ page }, amount, name) => {
  const row = page.locator(`.split-value-item:has-text("${name}")`);
  await expect(row.locator(`.split-value-item__preview:has-text("${amount}")`)).toBeVisible();
});

When('I click the Split Evenly button for exact', async ({ page }) => {
  await page.click('.split-values__even:has-text("Split evenly")');
});

Then('I should see {string} in exact amount for {string}', async ({ page }, amount, name) => {
  const row = page.locator(`.split-value-item:has-text("${name}")`);
  await expect(row.locator('.split-value-item__field')).toHaveValue(amount);
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
  
  // Mock groups API that's called after redirect
  await page.route('**/api/groups', async (route) => {
    if (route.request().url().includes('/balance/total')) {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] })
    });
  });
  
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { balance: 0 } })
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
  
  // Mock groups API that's called after redirect
  await page.route('**/api/groups', async (route) => {
    if (route.request().url().includes('/balance/total')) {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] })
    });
  });
  
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { balance: 0 } })
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

Then('I should be redirected to the groups page', async ({ page }) => {
  await expect(page).toHaveURL(/\/groups/);
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

// Account Page steps
Given('I am logged in as {string}', async ({ page }, email) => {
  // Mock the auth verification API to prevent token invalidation
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { _id: 'mock-user-id', name: 'John Doe', email: email }
      })
    });
  });
  // Use addInitScript to set auth before page loads
  await page.addInitScript((email) => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'mock-user-id',
      name: 'John Doe',
      email: email
    }));
  }, email);
});

Given('I am on the account page', async ({ page }) => {
  // Mock the /auth/me endpoint
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          _id: 'mock-user-id',
          name: 'John Doe',
          email: 'john@example.com'
        }
      })
    });
  });
  await page.goto('/account');
});

Then('I should see the Profile section', async ({ page }) => {
  await expect(page.locator('.account-row:has-text("Profile")')).toBeVisible();
});

Then('I should see the Log Out option', async ({ page }) => {
  await expect(page.locator('.account-row:has-text("Log Out")')).toBeVisible();
});

Then('I should see my name displayed', async ({ page }) => {
  await expect(page.locator('.account-row__value')).toBeVisible();
});

Then('I should see my email displayed', async ({ page }) => {
  await expect(page.locator('.account-row__sub')).toBeVisible();
});

When('I click the Log Out option', async ({ page }) => {
  await page.locator('.account-row:has-text("Log Out")').click();
});

Then('I should not be authenticated', async ({ page }) => {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeNull();
});

// Friends Page steps
Given('I am logged in', async ({ page }) => {
  // Mock the auth verification API to prevent token invalidation
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { _id: 'mock-user-id', name: 'John Doe', email: 'john@example.com' }
      })
    });
  });
  
  // Mock groups API to prevent 401 errors from unmocked endpoints
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { balance: 0 } })
    });
  });
  
  await page.route('**/api/groups', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] })
    });
  });
  
  // Use addInitScript to set auth before page loads
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      _id: 'mock-user-id',
      name: 'John Doe',
      email: 'john@example.com'
    }));
  });
});

Given('I am on the friends page', async ({ page }) => {
  await page.route('**/api/friends', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    } else {
      await route.continue();
    }
  });
  await page.goto('/friends');
});

Given('I have no friends', async ({ page }) => {
  await page.route('**/api/friends', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
  });
});

Given('I have friends in my list', async ({ page }) => {
  await page.route('**/api/friends', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { _id: 'friend1', name: 'Jane Smith', email: 'jane@example.com', phone: '1234567890' },
          { _id: 'friend2', name: 'Bob Wilson', email: 'bob@example.com', phone: '0987654321' }
        ])
      });
    }
  });
  await page.goto('/friends');
});

Then('I should see the add friend button', async ({ page }) => {
  await expect(page.locator('.add-friend-btn')).toBeVisible();
});

Then('I should see the text {string}', async ({ page }, text) => {
  await expect(page.locator(`text=${text}`)).toBeVisible();
});

When('I click the add friend button', async ({ page }) => {
  await page.locator('.add-friend-btn').click();
});

Then('I should see the add friend modal', async ({ page }) => {
  await expect(page.locator('.modal-overlay')).toBeVisible();
});

Then('I should not see the add friend modal', async ({ page }) => {
  await expect(page.locator('.modal-overlay')).not.toBeVisible();
});

Then('I should see the friend email input field', async ({ page }) => {
  await expect(page.locator('.modal-content input[type="email"]')).toBeVisible();
});

When('I click the cancel button', async ({ page }) => {
  await page.locator('button:has-text("Cancel")').click();
});

When('I enter {string} in the friend email field', async ({ page }, email) => {
  await page.fill('.modal-content input[type="email"]', email);
});

When('I click the add friend confirm button', async ({ page }) => {
  await page.locator('.modal-content button:has-text("Add Friend")').click();
});

Given('the API will return a user not found error', async ({ page }) => {
  await page.route('**/api/friends', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'User not found' })
      });
    } else if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
  });
});

Given('the API will return a successful add friend response', async ({ page }) => {
  await page.route('**/api/friends', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Friend added successfully',
          friend: { _id: 'newfriend', name: 'New Friend', email: 'friend@example.com' }
        })
      });
    } else if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { _id: 'newfriend', name: 'New Friend', email: 'friend@example.com' }
        ])
      });
    }
  });
});

Then('I should see the error {string}', async ({ page }, errorText) => {
  await expect(page.locator(`.input-error:has-text("${errorText}")`)).toBeVisible();
});

Then('I should see the friend in the list', async ({ page }) => {
  await expect(page.locator('.friend-card')).toBeVisible();
});

Then('I should see friend cards with name and email', async ({ page }) => {
  await expect(page.locator('.friend-card .friend-name').first()).toBeVisible();
  await expect(page.locator('.friend-card .friend-email').first()).toBeVisible();
});

Then('I should see a remove button for each friend', async ({ page }) => {
  await expect(page.locator('.friend-remove-btn').first()).toBeVisible();
});

Given('the API will return a successful remove friend response', async ({ page }) => {
  await page.route('**/api/friends/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Friend removed successfully' })
      });
    }
  });
});

When('I click the remove friend button', async ({ page }) => {
  await page.locator('.friend-remove-btn').first().click();
});

Then('the friend should be removed from the list', async ({ page }) => {
  // Wait for animation/removal
  await page.waitForTimeout(500);
});

// Groups Page steps
Given('I am on the groups page', async ({ page }) => {
  // Mock auth/me to keep token valid
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { _id: '123', name: 'Test User', email: 'test@example.com' }
      })
    });
  });
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    }
  });
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        data: { balance: 0, isOwed: false, isOwing: false } 
      })
    });
  });
  await page.goto('/groups');
});

Given('I have no groups', async ({ page }) => {
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    }
  });
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        data: { balance: 0, isOwed: false, isOwing: false } 
      })
    });
  });
});

Given('I have groups in my list', async ({ page }) => {
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'group1', name: 'Trip to Paris', type: 'Trip', members: [{ _id: 'u1' }, { _id: 'u2' }], userBalance: 75.50 },
            { _id: 'group2', name: 'Home Expenses', type: 'Home', members: [{ _id: 'u1' }], userBalance: -25.50 }
          ]
        })
      });
    }
  });
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        data: { balance: 50, isOwed: true, isOwing: false } 
      })
    });
  });
  await page.goto('/groups');
});

Given('I have groups of different types', async ({ page }) => {
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'g1', name: 'Trip Group', type: 'Trip', members: [{ _id: 'u1' }], userBalance: 30 },
            { _id: 'g2', name: 'Home Group', type: 'Home', members: [{ _id: 'u1' }], userBalance: -20 },
            { _id: 'g3', name: 'Family Group', type: 'Family', members: [{ _id: 'u1' }], userBalance: 0 },
            { _id: 'g4', name: 'Subscription Group', type: 'Subscription', members: [{ _id: 'u1' }], userBalance: 15 }
          ]
        })
      });
    }
  });
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        data: { balance: 0, isOwed: false, isOwing: false } 
      })
    });
  });
  await page.goto('/groups');
});

// Overall Balance steps
Given('I have groups with a positive overall balance', async ({ page }) => {
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'group1', name: 'Trip to Paris', type: 'Trip', members: [{ _id: 'u1' }, { _id: 'u2' }], userBalance: 150.50 }
          ]
        })
      });
    }
  });
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        data: { balance: 150.50, isOwed: true, isOwing: false } 
      })
    });
  });
  await page.goto('/groups');
});

Given('I have groups with a negative overall balance', async ({ page }) => {
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'group1', name: 'Home Expenses', type: 'Home', members: [{ _id: 'u1' }, { _id: 'u2' }], userBalance: -75.25 }
          ]
        })
      });
    }
  });
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        data: { balance: -75.25, isOwed: false, isOwing: true } 
      })
    });
  });
  await page.goto('/groups');
});

Given('I have groups with zero balance', async ({ page }) => {
  await page.route('**/api/groups', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'group1', name: 'Settled Group', type: 'Other', members: [{ _id: 'u1' }], userBalance: 0 }
          ]
        })
      });
    }
  });
  await page.route('**/api/groups/balance/total', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        data: { balance: 0, isOwed: false, isOwing: false } 
      })
    });
  });
  await page.goto('/groups');
});

Then('I should see the overall balance card', async ({ page }) => {
  await expect(page.locator('.balance-card')).toBeVisible();
});

Then('I should not see the overall balance card', async ({ page }) => {
  await expect(page.locator('.balance-card')).not.toBeVisible();
});

Then('I should see the balance amount {string}', async ({ page }, amount) => {
  await expect(page.locator('.balance-amount')).toContainText(amount);
});

Then('I should see {string} balance status', async ({ page }, statusText) => {
  await expect(page.locator('.balance-info')).toContainText(statusText);
});

Then('the balance should be displayed in green', async ({ page }) => {
  await expect(page.locator('.balance-amount.balance-positive')).toBeVisible();
});

Then('the balance should be displayed in red', async ({ page }) => {
  await expect(page.locator('.balance-amount.balance-negative')).toBeVisible();
});

Then('I should see the groups count', async ({ page }) => {
  await expect(page.locator('.header-subtitle')).toBeVisible();
});

Then('I should see the create group button', async ({ page }) => {
  await expect(page.locator('.btn-create, a[href="/create-group"]')).toBeVisible();
});

Then('I should see the floating create group button', async ({ page }) => {
  await expect(page.locator('.fab-create')).toBeVisible();
});

Then('I should see group cards with name and type', async ({ page }) => {
  await expect(page.locator('.group-item .group-name').first()).toBeVisible();
  await expect(page.locator('.group-item .group-type').first()).toBeVisible();
});

Then('I should see member count for each group', async ({ page }) => {
  await expect(page.locator('.group-item .group-members').first()).toBeVisible();
});

When('I click the floating create group button', async ({ page }) => {
  await page.locator('.fab-create').click();
});

Then('I should be on the create group page', async ({ page }) => {
  await expect(page).toHaveURL(/\/create-group/);
});

Then('Trip groups should show plane icon', async ({ page }) => {
  await expect(page.locator('.group-icon--trip')).toBeVisible();
});

Then('Home groups should show home icon', async ({ page }) => {
  await expect(page.locator('.group-icon--home')).toBeVisible();
});

Then('Family groups should show heart icon', async ({ page }) => {
  await expect(page.locator('.group-icon--family')).toBeVisible();
});

Then('Subscription groups should show credit card icon', async ({ page }) => {
  await expect(page.locator('.group-icon--subscription')).toBeVisible();
});

// Per-group balance steps
Then('I should see balance amount on each group', async ({ page }) => {
  await expect(page.locator('.group-item .group-balance-amount').first()).toBeVisible();
});

Then('groups I am owed show green balance', async ({ page }) => {
  await expect(page.locator('.group-balance--positive .group-balance-amount')).toBeVisible();
});

Then('groups I owe show red balance', async ({ page }) => {
  await expect(page.locator('.group-balance--negative .group-balance-amount')).toBeVisible();
});