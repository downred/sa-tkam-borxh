// Generated from: e2e/features/account.feature
import { test } from "playwright-bdd";

test.describe('Account Page', () => {

  test.beforeEach('Background', async ({ Given, And, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am logged in as "john@example.com"', null, { page }); 
    await And('I am on the account page', null, { page }); 
  });
  
  test('Display account page elements', async ({ Then, And, page }) => { 
    await Then('I should see the title "Account"', null, { page }); 
    await And('I should see the Profile section', null, { page }); 
    await And('I should see the Log Out option', null, { page }); 
  });

  test('Display user information', async ({ Then, And, page }) => { 
    await Then('I should see my name displayed', null, { page }); 
    await And('I should see my email displayed', null, { page }); 
  });

  test('Logout from account page', async ({ When, Then, And, page }) => { 
    await When('I click the Log Out option', null, { page }); 
    await Then('I should be on the login page', null, { page }); 
    await And('I should not be authenticated', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/account.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in as \"john@example.com\"","isBg":true,"stepMatchArguments":[{"group":{"start":18,"value":"\"john@example.com\"","children":[{"start":19,"value":"john@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I should see the title \"Account\"","stepMatchArguments":[{"group":{"start":23,"value":"\"Account\"","children":[{"start":24,"value":"Account","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the Profile section","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see the Log Out option","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in as \"john@example.com\"","isBg":true,"stepMatchArguments":[{"group":{"start":18,"value":"\"john@example.com\"","children":[{"start":19,"value":"john@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see my name displayed","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see my email displayed","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in as \"john@example.com\"","isBg":true,"stepMatchArguments":[{"group":{"start":18,"value":"\"john@example.com\"","children":[{"start":19,"value":"john@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the account page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I click the Log Out option","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then I should be on the login page","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And I should not be authenticated","stepMatchArguments":[]}]},
]; // bdd-data-end