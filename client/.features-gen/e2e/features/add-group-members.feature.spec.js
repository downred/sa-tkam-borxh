// Generated from: e2e/features/add-group-members.feature
import { test } from "playwright-bdd";

test.describe('Add Group Members', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the add members page', null, { page }); 
  });
  
  test('Display add members form elements', async ({ Then, And, page }) => { 
    await Then('I should see the title "Add Members"', null, { page }); 
    await And('I should see "Invite people to join your group"', null, { page }); 
    await And('I should see the email input field', null, { page }); 
    await And('I should see the Add button', null, { page }); 
    await And('I should see "Share Group Link"', null, { page }); 
    await And('I should see the group link input', null, { page }); 
    await And('I should see "Your Friends"', null, { page }); 
    await And('I should see the Skip for Now button', null, { page }); 
    await And('I should see the Done button', null, { page }); 
  });

  test('Add button is disabled when email is empty', async ({ Then, page }) => { 
    await Then('the Add button should be disabled', null, { page }); 
  });

  test('Add button is enabled when email is entered', async ({ When, Then, page }) => { 
    await When('I enter "friend@example.com" in the email field', null, { page }); 
    await Then('the Add button should be enabled', null, { page }); 
  });

  test('Select a friend from the list', async ({ When, Then, page }) => { 
    await When('I click on friend "John Doe"', null, { page }); 
    await Then('the friend "John Doe" should be selected', null, { page }); 
  });

  test('Deselect a friend from the list', async ({ When, Then, And, page }) => { 
    await When('I click on friend "John Doe"', null, { page }); 
    await And('I click on friend "John Doe"', null, { page }); 
    await Then('the friend "John Doe" should not be selected', null, { page }); 
  });

  test('Done button is disabled when no members selected', async ({ Then, page }) => { 
    await Then('the Done button should be disabled', null, { page }); 
  });

  test('Done button is enabled when a friend is selected', async ({ When, Then, page }) => { 
    await When('I click on friend "Jane Smith"', null, { page }); 
    await Then('the Done button should be enabled', null, { page }); 
  });

  test('Skip for now button navigates away', async ({ When, Then, page }) => { 
    await When('I click the Skip for Now button', null, { page }); 
    await Then('I should be on the expenses page', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/add-group-members.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see the title \"Add Members\"","stepMatchArguments":[{"group":{"start":23,"value":"\"Add Members\"","children":[{"start":24,"value":"Add Members","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And I should see \"Invite people to join your group\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Invite people to join your group\"","children":[{"start":14,"value":"Invite people to join your group","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the email input field","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see the Add button","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And I should see \"Share Group Link\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Share Group Link\"","children":[{"start":14,"value":"Share Group Link","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see the group link input","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And I should see \"Your Friends\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Your Friends\"","children":[{"start":14,"value":"Your Friends","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see the Skip for Now button","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And I should see the Done button","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then the Add button should be disabled","stepMatchArguments":[]}]},
  {"pwTestLine":26,"pickleLine":23,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I enter \"friend@example.com\" in the email field","stepMatchArguments":[{"group":{"start":8,"value":"\"friend@example.com\"","children":[{"start":9,"value":"friend@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the Add button should be enabled","stepMatchArguments":[]}]},
  {"pwTestLine":31,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"When I click on friend \"John Doe\"","stepMatchArguments":[{"group":{"start":18,"value":"\"John Doe\"","children":[{"start":19,"value":"John Doe","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":33,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then the friend \"John Doe\" should be selected","stepMatchArguments":[{"group":{"start":11,"value":"\"John Doe\"","children":[{"start":12,"value":"John Doe","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":36,"pickleLine":31,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"When I click on friend \"John Doe\"","stepMatchArguments":[{"group":{"start":18,"value":"\"John Doe\"","children":[{"start":19,"value":"John Doe","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":38,"gherkinStepLine":33,"keywordType":"Action","textWithKeyword":"And I click on friend \"John Doe\"","stepMatchArguments":[{"group":{"start":18,"value":"\"John Doe\"","children":[{"start":19,"value":"John Doe","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"Then the friend \"John Doe\" should not be selected","stepMatchArguments":[{"group":{"start":11,"value":"\"John Doe\"","children":[{"start":12,"value":"John Doe","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":42,"pickleLine":36,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then the Done button should be disabled","stepMatchArguments":[]}]},
  {"pwTestLine":46,"pickleLine":39,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I click on friend \"Jane Smith\"","stepMatchArguments":[{"group":{"start":18,"value":"\"Jane Smith\"","children":[{"start":19,"value":"Jane Smith","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":48,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the Done button should be enabled","stepMatchArguments":[]}]},
  {"pwTestLine":51,"pickleLine":43,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the add members page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":44,"keywordType":"Action","textWithKeyword":"When I click the Skip for Now button","stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"Then I should be on the expenses page","stepMatchArguments":[]}]},
]; // bdd-data-end