// Generated from: e2e/features/register.feature
import { test } from "playwright-bdd";

test.describe('User Registration', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the register page', null, { page }); 
  });
  
  test('Display registration form elements', async ({ Then, And, page }) => { 
    await Then('I should see the page title "Create Account"', null, { page }); 
    await And('I should see the subtitle "Start tracking your expenses today"', null, { page }); 
    await And('I should see the name input field', null, { page }); 
    await And('I should see the email input field', null, { page }); 
    await And('I should see the password input field', null, { page }); 
    await And('I should see the confirm password input field', null, { page }); 
    await And('I should see the terms checkbox', null, { page }); 
    await And('I should see the "Create Account" button', null, { page }); 
    await And('I should see a link to login page', null, { page }); 
  });

  test('Show validation errors on empty form submission', async ({ When, Then, page }) => { 
    await When('I click the submit button', null, { page }); 
    await Then('I should see a validation error', null, { page }); 
  });

  test('Show error for invalid email format', async ({ When, Then, And, page }) => { 
    await When('I enter "invalid-email" in the email field', null, { page }); 
    await And('I blur the email field', null, { page }); 
    await Then('I should see an email validation error', null, { page }); 
  });

  test('Show error when password is too short', async ({ When, Then, And, page }) => { 
    await When('I enter "123" in the password field', null, { page }); 
    await And('I blur the password field', null, { page }); 
    await Then('I should see "at least 6 characters" error', null, { page }); 
  });

  test('Show error when passwords do not match', async ({ When, Then, And, page }) => { 
    await When('I enter "password123" in the password field', null, { page }); 
    await And('I enter "different123" in the confirm password field', null, { page }); 
    await And('I blur the confirm password field', null, { page }); 
    await Then('I should see "Passwords do not match" error', null, { page }); 
  });

  test('Navigate to login page', async ({ When, Then, page }) => { 
    await When('I click the sign in link', null, { page }); 
    await Then('I should be on the login page', null, { page }); 
  });

  test('Fill form with valid data', async ({ When, Then, And, page }) => { 
    await When('I enter "John Doe" in the name field', null, { page }); 
    await And('I enter "john@example.com" in the email field', null, { page }); 
    await And('I enter "password123" in the password field', null, { page }); 
    await And('I enter "password123" in the confirm password field', null, { page }); 
    await And('I check the terms checkbox', null, { page }); 
    await Then('I should not see any validation errors', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/register.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the register page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Create Account\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Create Account\"","children":[{"start":29,"value":"Create Account","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And I should see the subtitle \"Start tracking your expenses today\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Start tracking your expenses today\"","children":[{"start":27,"value":"Start tracking your expenses today","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the name input field","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see the email input field","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And I should see the password input field","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see the confirm password input field","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And I should see the terms checkbox","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Create Account\" button","stepMatchArguments":[{"group":{"start":17,"value":"\"Create Account\"","children":[{"start":18,"value":"Create Account","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And I should see a link to login page","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the register page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"When I click the submit button","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then I should see a validation error","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":24,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the register page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I enter \"invalid-email\" in the email field","stepMatchArguments":[{"group":{"start":8,"value":"\"invalid-email\"","children":[{"start":9,"value":"invalid-email","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":29,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"And I blur the email field","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then I should see an email validation error","stepMatchArguments":[]}]},
  {"pwTestLine":33,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the register page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When I enter \"123\" in the password field","stepMatchArguments":[{"group":{"start":8,"value":"\"123\"","children":[{"start":9,"value":"123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":35,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"And I blur the password field","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then I should see \"at least 6 characters\" error","stepMatchArguments":[{"group":{"start":13,"value":"\"at least 6 characters\"","children":[{"start":14,"value":"at least 6 characters","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":39,"pickleLine":34,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the register page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"When I enter \"password123\" in the password field","stepMatchArguments":[{"group":{"start":8,"value":"\"password123\"","children":[{"start":9,"value":"password123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"And I enter \"different123\" in the confirm password field","stepMatchArguments":[{"group":{"start":8,"value":"\"different123\"","children":[{"start":9,"value":"different123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"And I blur the confirm password field","stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then I should see \"Passwords do not match\" error","stepMatchArguments":[{"group":{"start":13,"value":"\"Passwords do not match\"","children":[{"start":14,"value":"Passwords do not match","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":46,"pickleLine":40,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the register page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":41,"keywordType":"Action","textWithKeyword":"When I click the sign in link","stepMatchArguments":[]},{"pwStepLine":48,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"Then I should be on the login page","stepMatchArguments":[]}]},
  {"pwTestLine":51,"pickleLine":44,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the register page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":45,"keywordType":"Action","textWithKeyword":"When I enter \"John Doe\" in the name field","stepMatchArguments":[{"group":{"start":8,"value":"\"John Doe\"","children":[{"start":9,"value":"John Doe","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":53,"gherkinStepLine":46,"keywordType":"Action","textWithKeyword":"And I enter \"john@example.com\" in the email field","stepMatchArguments":[{"group":{"start":8,"value":"\"john@example.com\"","children":[{"start":9,"value":"john@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":47,"keywordType":"Action","textWithKeyword":"And I enter \"password123\" in the password field","stepMatchArguments":[{"group":{"start":8,"value":"\"password123\"","children":[{"start":9,"value":"password123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":55,"gherkinStepLine":48,"keywordType":"Action","textWithKeyword":"And I enter \"password123\" in the confirm password field","stepMatchArguments":[{"group":{"start":8,"value":"\"password123\"","children":[{"start":9,"value":"password123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":56,"gherkinStepLine":49,"keywordType":"Action","textWithKeyword":"And I check the terms checkbox","stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":50,"keywordType":"Outcome","textWithKeyword":"Then I should not see any validation errors","stepMatchArguments":[]}]},
]; // bdd-data-end