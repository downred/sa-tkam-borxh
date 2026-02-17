// Generated from: e2e/features/create-expense.feature
import { test } from "playwright-bdd";

test.describe('Create Expense', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the create expense page', null, { page }); 
  });
  
  test('Display create expense form elements', async ({ Then, And, page }) => { 
    await Then('I should see the title "New Expense"', null, { page }); 
    await And('I should see the group indicator "Roommates"', null, { page }); 
    await And('I should see the description input field', null, { page }); 
    await And('I should see the amount input field', null, { page }); 
    await And('I should see "Paid by" label', null, { page }); 
    await And('I should see the payer options', null, { page }); 
    await And('I should see the Add Expense button', null, { page }); 
  });

  test('Add Expense button is disabled when form is empty', async ({ Then, page }) => { 
    await Then('the Add Expense button should be disabled', null, { page }); 
  });

  test('Add Expense button is disabled without description', async ({ When, Then, page }) => { 
    await When('I enter "50" in the amount field', null, { page }); 
    await Then('the Add Expense button should be disabled', null, { page }); 
  });

  test('Add Expense button is disabled without amount', async ({ When, Then, page }) => { 
    await When('I enter "Groceries" in the description field', null, { page }); 
    await Then('the Add Expense button should be disabled', null, { page }); 
  });

  test('Add Expense button is enabled with valid data', async ({ When, Then, And, page }) => { 
    await When('I enter "Groceries" in the description field', null, { page }); 
    await And('I enter "50" in the amount field', null, { page }); 
    await Then('the Add Expense button should be enabled', null, { page }); 
  });

  test('Select a different payer', async ({ When, Then, page }) => { 
    await When('I click on payer "John"', null, { page }); 
    await Then('the payer "John" should be active', null, { page }); 
  });

  test('Toggle multiple payers mode', async ({ When, Then, page }) => { 
    await When('I click the Multiple payers toggle', null, { page }); 
    await Then('I should see "Single payer" toggle text', null, { page }); 
  });

  test('Select multiple payers', async ({ When, Then, And, page }) => { 
    await When('I click the Multiple payers toggle', null, { page }); 
    await And('I click on payer "John"', null, { page }); 
    await And('I click on payer "Jane"', null, { page }); 
    await Then('the payer "John" should be active', null, { page }); 
    await And('the payer "Jane" should be active', null, { page }); 
  });

  test('Split evenly among payers', async ({ When, Then, And, page }) => { 
    await When('I enter "100" in the amount field', null, { page }); 
    await And('I click the Multiple payers toggle', null, { page }); 
    await And('I click on payer "John"', null, { page }); 
    await And('I click the Split evenly button', null, { page }); 
    await Then('I should see split amounts displayed', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/create-expense.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I should see the title \"New Expense\"","stepMatchArguments":[{"group":{"start":23,"value":"\"New Expense\"","children":[{"start":24,"value":"New Expense","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And I should see the group indicator \"Roommates\"","stepMatchArguments":[{"group":{"start":33,"value":"\"Roommates\"","children":[{"start":34,"value":"Roommates","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the description input field","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And I should see the amount input field","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And I should see \"Paid by\" label","stepMatchArguments":[{"group":{"start":13,"value":"\"Paid by\"","children":[{"start":14,"value":"Paid by","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see the payer options","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And I should see the Add Expense button","stepMatchArguments":[]}]},
  {"pwTestLine":20,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the Add Expense button should be disabled","stepMatchArguments":[]}]},
  {"pwTestLine":24,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I enter \"50\" in the amount field","stepMatchArguments":[{"group":{"start":8,"value":"\"50\"","children":[{"start":9,"value":"50","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then the Add Expense button should be disabled","stepMatchArguments":[]}]},
  {"pwTestLine":29,"pickleLine":25,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When I enter \"Groceries\" in the description field","stepMatchArguments":[{"group":{"start":8,"value":"\"Groceries\"","children":[{"start":9,"value":"Groceries","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then the Add Expense button should be disabled","stepMatchArguments":[]}]},
  {"pwTestLine":34,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When I enter \"Groceries\" in the description field","stepMatchArguments":[{"group":{"start":8,"value":"\"Groceries\"","children":[{"start":9,"value":"Groceries","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":36,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"And I enter \"50\" in the amount field","stepMatchArguments":[{"group":{"start":8,"value":"\"50\"","children":[{"start":9,"value":"50","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":37,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then the Add Expense button should be enabled","stepMatchArguments":[]}]},
  {"pwTestLine":40,"pickleLine":34,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"When I click on payer \"John\"","stepMatchArguments":[{"group":{"start":17,"value":"\"John\"","children":[{"start":18,"value":"John","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"Then the payer \"John\" should be active","stepMatchArguments":[{"group":{"start":10,"value":"\"John\"","children":[{"start":11,"value":"John","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":45,"pickleLine":38,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":39,"keywordType":"Action","textWithKeyword":"When I click the Multiple payers toggle","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":40,"keywordType":"Outcome","textWithKeyword":"Then I should see \"Single payer\" toggle text","stepMatchArguments":[{"group":{"start":13,"value":"\"Single payer\"","children":[{"start":14,"value":"Single payer","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":50,"pickleLine":42,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"When I click the Multiple payers toggle","stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":44,"keywordType":"Action","textWithKeyword":"And I click on payer \"John\"","stepMatchArguments":[{"group":{"start":17,"value":"\"John\"","children":[{"start":18,"value":"John","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":53,"gherkinStepLine":45,"keywordType":"Action","textWithKeyword":"And I click on payer \"Jane\"","stepMatchArguments":[{"group":{"start":17,"value":"\"Jane\"","children":[{"start":18,"value":"Jane","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"Then the payer \"John\" should be active","stepMatchArguments":[{"group":{"start":10,"value":"\"John\"","children":[{"start":11,"value":"John","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":55,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"And the payer \"Jane\" should be active","stepMatchArguments":[{"group":{"start":10,"value":"\"Jane\"","children":[{"start":11,"value":"Jane","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":58,"pickleLine":49,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the create expense page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":59,"gherkinStepLine":50,"keywordType":"Action","textWithKeyword":"When I enter \"100\" in the amount field","stepMatchArguments":[{"group":{"start":8,"value":"\"100\"","children":[{"start":9,"value":"100","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":60,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"And I click the Multiple payers toggle","stepMatchArguments":[]},{"pwStepLine":61,"gherkinStepLine":52,"keywordType":"Action","textWithKeyword":"And I click on payer \"John\"","stepMatchArguments":[{"group":{"start":17,"value":"\"John\"","children":[{"start":18,"value":"John","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":62,"gherkinStepLine":53,"keywordType":"Action","textWithKeyword":"And I click the Split evenly button","stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"Then I should see split amounts displayed","stepMatchArguments":[]}]},
]; // bdd-data-end