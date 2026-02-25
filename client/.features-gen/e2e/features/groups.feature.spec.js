
import { test } from "playwright-bdd";

test.describe('Groups List', () => {

  test.beforeEach('Background', async ({ Given, And, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am logged in', null, { page }); 
    await And('I am on the groups page', null, { page }); 
  });
  
  test('Display groups page elements', async ({ Then, And, page }) => { 
    await Then('I should see the page title "Your Groups"', null, { page }); 
    await And('I should see the groups count', null, { page }); 
  });

  test('Show empty state when no groups', async ({ Given, Then, And, page }) => { 
    await Given('I have no groups', null, { page }); 
    await Then('I should see the text "No groups yet"', null, { page }); 
    await And('I should see the text "Create a group to start splitting expenses"', null, { page }); 
    await And('I should see the create group button', null, { page }); 
  });

  test('Display groups list', async ({ Given, Then, And, page }) => { 
    await Given('I have groups in my list', null, { page }); 
    await Then('I should see group cards with name and type', null, { page }); 
    await And('I should see member count for each group', null, { page }); 
    await And('I should see the floating create group button', null, { page }); 
  });

  test('Navigate to create group from empty state', async ({ Given, When, Then, page }) => { 
    await Given('I have no groups', null, { page }); 
    await When('I click the create group button', null, { page }); 
    await Then('I should be on the create group page', null, { page }); 
  });

  test('Navigate to create group from FAB', async ({ Given, When, Then, page }) => { 
    await Given('I have groups in my list', null, { page }); 
    await When('I click the floating create group button', null, { page }); 
    await Then('I should be on the create group page', null, { page }); 
  });

  test('Display correct group type icons', async ({ Given, Then, And, page }) => { 
    await Given('I have groups of different types', null, { page }); 
    await Then('Trip groups should show plane icon', null, { page }); 
    await And('Home groups should show home icon', null, { page }); 
    await And('Family groups should show heart icon', null, { page }); 
    await And('Subscription groups should show credit card icon', null, { page }); 
  });

});

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/groups.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ 
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Your Groups\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Your Groups\"","children":[{"start":29,"value":"Your Groups","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the groups count","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given I have no groups","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see the text \"No groups yet\"","stepMatchArguments":[{"group":{"start":22,"value":"\"No groups yet\"","children":[{"start":23,"value":"No groups yet","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see the text \"Create a group to start splitting expenses\"","stepMatchArguments":[{"group":{"start":22,"value":"\"Create a group to start splitting expenses\"","children":[{"start":23,"value":"Create a group to start splitting expenses","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And I should see the create group button","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given I have groups in my list","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then I should see group cards with name and type","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"And I should see member count for each group","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"And I should see the floating create group button","stepMatchArguments":[]}]},
  {"pwTestLine":30,"pickleLine":33,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":34,"keywordType":"Context","textWithKeyword":"Given I have no groups","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"When I click the create group button","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"Then I should be on the create group page","stepMatchArguments":[]}]},
  {"pwTestLine":36,"pickleLine":38,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":39,"keywordType":"Context","textWithKeyword":"Given I have groups in my list","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I click the floating create group button","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then I should be on the create group page","stepMatchArguments":[]}]},
  {"pwTestLine":42,"pickleLine":43,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":44,"keywordType":"Context","textWithKeyword":"Given I have groups of different types","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"Then Trip groups should show plane icon","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"And Home groups should show home icon","stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"And Family groups should show heart icon","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"And Subscription groups should show credit card icon","stepMatchArguments":[]}]},
]; 