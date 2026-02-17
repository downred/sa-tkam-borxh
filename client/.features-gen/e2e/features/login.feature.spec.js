// Generated from: e2e/features/login.feature
import { test } from "playwright-bdd";

test.describe('User Login', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the login page', null, { page }); 
  });
  
  test('Display login form elements', async ({ Then, And, page }) => { 
    await Then('I should see the page title "Welcome Back"', null, { page }); 
    await And('I should see the subtitle "Sign in to manage your expenses"', null, { page }); 
    await And('I should see the email input field', null, { page }); 
    await And('I should see the password input field', null, { page }); 
    await And('I should see the remember me checkbox', null, { page }); 
    await And('I should see the forgot password link', null, { page }); 
    await And('I should see the "Sign In" button', null, { page }); 
    await And('I should see a link to register page', null, { page }); 
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

  test('Navigate to register page', async ({ When, Then, page }) => { 
    await When('I click the create account link', null, { page }); 
    await Then('I should be on the register page', null, { page }); 
  });

  test('Fill form with valid data', async ({ When, Then, And, page }) => { 
    await When('I enter "test@example.com" in the email field', null, { page }); 
    await And('I enter "password123" in the password field', null, { page }); 
    await Then('I should not see any validation errors', null, { page }); 
  });

  test('Toggle remember me checkbox', async ({ When, Then, page }) => { 
    await When('I check the remember me checkbox', null, { page }); 
    await Then('the remember me checkbox should be checked', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Welcome Back\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Welcome Back\"","children":[{"start":29,"value":"Welcome Back","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And I should see the subtitle \"Sign in to manage your expenses\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Sign in to manage your expenses\"","children":[{"start":27,"value":"Sign in to manage your expenses","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the email input field","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see the password input field","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And I should see the remember me checkbox","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see the forgot password link","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And I should see the \"Sign In\" button","stepMatchArguments":[{"group":{"start":17,"value":"\"Sign In\"","children":[{"start":18,"value":"Sign In","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see a link to register page","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I click the submit button","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then I should see a validation error","stepMatchArguments":[]}]},
  {"pwTestLine":26,"pickleLine":23,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I enter \"invalid-email\" in the email field","stepMatchArguments":[{"group":{"start":8,"value":"\"invalid-email\"","children":[{"start":9,"value":"invalid-email","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"And I blur the email field","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then I should see an email validation error","stepMatchArguments":[]}]},
  {"pwTestLine":32,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"When I enter \"123\" in the password field","stepMatchArguments":[{"group":{"start":8,"value":"\"123\"","children":[{"start":9,"value":"123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"And I blur the password field","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then I should see \"at least 6 characters\" error","stepMatchArguments":[{"group":{"start":13,"value":"\"at least 6 characters\"","children":[{"start":14,"value":"at least 6 characters","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":38,"pickleLine":33,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":34,"keywordType":"Action","textWithKeyword":"When I click the create account link","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":35,"keywordType":"Outcome","textWithKeyword":"Then I should be on the register page","stepMatchArguments":[]}]},
  {"pwTestLine":43,"pickleLine":37,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"When I enter \"test@example.com\" in the email field","stepMatchArguments":[{"group":{"start":8,"value":"\"test@example.com\"","children":[{"start":9,"value":"test@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":45,"gherkinStepLine":39,"keywordType":"Action","textWithKeyword":"And I enter \"password123\" in the password field","stepMatchArguments":[{"group":{"start":8,"value":"\"password123\"","children":[{"start":9,"value":"password123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":46,"gherkinStepLine":40,"keywordType":"Outcome","textWithKeyword":"Then I should not see any validation errors","stepMatchArguments":[]}]},
  {"pwTestLine":49,"pickleLine":42,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"When I check the remember me checkbox","stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Then the remember me checkbox should be checked","stepMatchArguments":[]}]},
]; // bdd-data-end