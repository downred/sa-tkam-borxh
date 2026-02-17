// Generated from: e2e/features/create-group.feature
import { test } from "playwright-bdd";

test.describe('Create Group', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the create group page', null, { page }); 
  });
  
  test('Display create group form elements', async ({ Then, And, page }) => { 
    await Then('I should see the page title "New Group"', null, { page }); 
    await And('I should see the group name input field', null, { page }); 
    await And('I should see "Group Type" label', null, { page }); 
    await And('I should see "Trip" type option', null, { page }); 
    await And('I should see "Home" type option', null, { page }); 
    await And('I should see "Family" type option', null, { page }); 
    await And('I should see "Subscription" type option', null, { page }); 
    await And('I should see "Other" type option', null, { page }); 
    await And('the create button should be disabled', null, { page }); 
  });

  test('Enable create button when form is complete', async ({ Given, When, Then, page }) => { 
    await Given('the create button is disabled', null, { page }); 
    await When('I enter "My Test Group" in the group name field', null, { page }); 
    await Then('the create button should be disabled', null, { page }); 
    await When('I select "Trip" type', null, { page }); 
    await Then('the create button should be enabled', null, { page }); 
  });

  test('Select group type', async ({ When, Then, page }) => { 
    await When('I select "Trip" type', null, { page }); 
    await Then('the "Trip" type should be active', null, { page }); 
  });

  test('Show trip dates for Trip type', async ({ When, Then, And, page }) => { 
    await Then('I should not see the start date field', null, { page }); 
    await And('I should not see the end date field', null, { page }); 
    await When('I select "Trip" type', null, { page }); 
    await Then('I should see the start date field', null, { page }); 
    await And('I should see the end date field', null, { page }); 
  });

  test('Show renewal date for Subscription type', async ({ When, Then, page }) => { 
    await Then('I should not see the renewal date field', null, { page }); 
    await When('I select "Subscription" type', null, { page }); 
    await Then('I should see the renewal date field', null, { page }); 
  });

  test('Show settings when type is selected', async ({ When, Then, And, page }) => { 
    await Then('I should not see "Balance Alerts"', null, { page }); 
    await When('I select "Home" type', null, { page }); 
    await Then('I should see "Balance Alerts"', null, { page }); 
    await And('I should see "Settle Up Reminders"', null, { page }); 
  });

  test('Navigate to Add Members after creating group', async ({ When, Then, And, page }) => { 
    await When('I enter "My Test Group" in the group name field', null, { page }); 
    await And('I select "Family" type', null, { page }); 
    await And('I click the create group button', null, { page }); 
    await Then('I should see the page title "Add Members"', null, { page }); 
    await And('I should see "Invite people to join your group"', null, { page }); 
  });

  test('Toggle settings', async ({ When, Then, And, page }) => { 
    await When('I select "Other" type', null, { page }); 
    await And('I toggle the balance alerts setting', null, { page }); 
    await Then('the balance alerts setting should be active', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/create-group.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"New Group\"","stepMatchArguments":[{"group":{"start":28,"value":"\"New Group\"","children":[{"start":29,"value":"New Group","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And I should see the group name input field","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see \"Group Type\" label","stepMatchArguments":[{"group":{"start":13,"value":"\"Group Type\"","children":[{"start":14,"value":"Group Type","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see \"Trip\" type option","stepMatchArguments":[{"group":{"start":13,"value":"\"Trip\"","children":[{"start":14,"value":"Trip","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And I should see \"Home\" type option","stepMatchArguments":[{"group":{"start":13,"value":"\"Home\"","children":[{"start":14,"value":"Home","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see \"Family\" type option","stepMatchArguments":[{"group":{"start":13,"value":"\"Family\"","children":[{"start":14,"value":"Family","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And I should see \"Subscription\" type option","stepMatchArguments":[{"group":{"start":13,"value":"\"Subscription\"","children":[{"start":14,"value":"Subscription","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see \"Other\" type option","stepMatchArguments":[{"group":{"start":13,"value":"\"Other\"","children":[{"start":14,"value":"Other","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And the create button should be disabled","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given the create button is disabled","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I enter \"My Test Group\" in the group name field","stepMatchArguments":[{"group":{"start":8,"value":"\"My Test Group\"","children":[{"start":9,"value":"My Test Group","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then the create button should be disabled","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I select \"Trip\" type","stepMatchArguments":[{"group":{"start":9,"value":"\"Trip\"","children":[{"start":10,"value":"Trip","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the create button should be enabled","stepMatchArguments":[]}]},
  {"pwTestLine":30,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"When I select \"Trip\" type","stepMatchArguments":[{"group":{"start":9,"value":"\"Trip\"","children":[{"start":10,"value":"Trip","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then the \"Trip\" type should be active","stepMatchArguments":[{"group":{"start":4,"value":"\"Trip\"","children":[{"start":5,"value":"Trip","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":35,"pickleLine":31,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then I should not see the start date field","stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And I should not see the end date field","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":34,"keywordType":"Action","textWithKeyword":"When I select \"Trip\" type","stepMatchArguments":[{"group":{"start":9,"value":"\"Trip\"","children":[{"start":10,"value":"Trip","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":35,"keywordType":"Outcome","textWithKeyword":"Then I should see the start date field","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"And I should see the end date field","stepMatchArguments":[]}]},
  {"pwTestLine":43,"pickleLine":38,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"Then I should not see the renewal date field","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I select \"Subscription\" type","stepMatchArguments":[{"group":{"start":9,"value":"\"Subscription\"","children":[{"start":10,"value":"Subscription","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":46,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then I should see the renewal date field","stepMatchArguments":[]}]},
  {"pwTestLine":49,"pickleLine":43,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Then I should not see \"Balance Alerts\"","stepMatchArguments":[{"group":{"start":17,"value":"\"Balance Alerts\"","children":[{"start":18,"value":"Balance Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":51,"gherkinStepLine":45,"keywordType":"Action","textWithKeyword":"When I select \"Home\" type","stepMatchArguments":[{"group":{"start":9,"value":"\"Home\"","children":[{"start":10,"value":"Home","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":52,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"Then I should see \"Balance Alerts\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Balance Alerts\"","children":[{"start":14,"value":"Balance Alerts","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":53,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"And I should see \"Settle Up Reminders\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Settle Up Reminders\"","children":[{"start":14,"value":"Settle Up Reminders","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":56,"pickleLine":49,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":50,"keywordType":"Action","textWithKeyword":"When I enter \"My Test Group\" in the group name field","stepMatchArguments":[{"group":{"start":8,"value":"\"My Test Group\"","children":[{"start":9,"value":"My Test Group","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":58,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"And I select \"Family\" type","stepMatchArguments":[{"group":{"start":9,"value":"\"Family\"","children":[{"start":10,"value":"Family","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":59,"gherkinStepLine":52,"keywordType":"Action","textWithKeyword":"And I click the create group button","stepMatchArguments":[]},{"pwStepLine":60,"gherkinStepLine":53,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Add Members\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Add Members\"","children":[{"start":29,"value":"Add Members","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":61,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"And I should see \"Invite people to join your group\"","stepMatchArguments":[{"group":{"start":13,"value":"\"Invite people to join your group\"","children":[{"start":14,"value":"Invite people to join your group","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":64,"pickleLine":56,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create group page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":65,"gherkinStepLine":57,"keywordType":"Action","textWithKeyword":"When I select \"Other\" type","stepMatchArguments":[{"group":{"start":9,"value":"\"Other\"","children":[{"start":10,"value":"Other","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":66,"gherkinStepLine":58,"keywordType":"Action","textWithKeyword":"And I toggle the balance alerts setting","stepMatchArguments":[]},{"pwStepLine":67,"gherkinStepLine":59,"keywordType":"Outcome","textWithKeyword":"Then the balance alerts setting should be active","stepMatchArguments":[]}]},
]; // bdd-data-end