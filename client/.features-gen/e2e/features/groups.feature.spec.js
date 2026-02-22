// Generated from: e2e/features/groups.feature
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

  test('Display balance for each group', async ({ Given, Then, And, page }) => { 
    await Given('I have groups in my list', null, { page }); 
    await Then('I should see balance amount on each group', null, { page }); 
    await And('groups I am owed show green balance', null, { page }); 
    await And('groups I owe show red balance', null, { page }); 
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

  test('Display overall balance when user is owed money', async ({ Given, Then, And, page }) => { 
    await Given('I have groups with a positive overall balance', null, { page }); 
    await Then('I should see the overall balance card', null, { page }); 
    await And('I should see the balance amount "€150.50"', null, { page }); 
    await And('I should see "You are owed" balance status', null, { page }); 
    await And('the balance should be displayed in green', null, { page }); 
  });

  test('Display overall balance when user owes money', async ({ Given, Then, And, page }) => { 
    await Given('I have groups with a negative overall balance', null, { page }); 
    await Then('I should see the overall balance card', null, { page }); 
    await And('I should see the balance amount "€75.25"', null, { page }); 
    await And('I should see "You owe" balance status', null, { page }); 
    await And('the balance should be displayed in red', null, { page }); 
  });

  test('Display settled up state when balance is zero', async ({ Given, Then, And, page }) => { 
    await Given('I have groups with zero balance', null, { page }); 
    await Then('I should see the overall balance card', null, { page }); 
    await And('I should see the balance amount "€0.00"', null, { page }); 
    await And('I should see "All settled up!" balance status', null, { page }); 
  });

  test('Hide balance card when no groups exist', async ({ Given, Then, page }) => { 
    await Given('I have no groups', null, { page }); 
    await Then('I should not see the overall balance card', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/groups.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Your Groups\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Your Groups\"","children":[{"start":29,"value":"Your Groups","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the groups count","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given I have no groups","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see the text \"No groups yet\"","stepMatchArguments":[{"group":{"start":22,"value":"\"No groups yet\"","children":[{"start":23,"value":"No groups yet","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see the text \"Create a group to start splitting expenses\"","stepMatchArguments":[{"group":{"start":22,"value":"\"Create a group to start splitting expenses\"","children":[{"start":23,"value":"Create a group to start splitting expenses","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And I should see the create group button","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given I have groups in my list","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then I should see group cards with name and type","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"And I should see member count for each group","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"And I should see the floating create group button","stepMatchArguments":[]}]},
  {"pwTestLine":30,"pickleLine":26,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":27,"keywordType":"Context","textWithKeyword":"Given I have groups in my list","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then I should see balance amount on each group","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"And groups I am owed show green balance","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"And groups I owe show red balance","stepMatchArguments":[]}]},
  {"pwTestLine":37,"pickleLine":32,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":33,"keywordType":"Context","textWithKeyword":"Given I have no groups","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":34,"keywordType":"Action","textWithKeyword":"When I click the create group button","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":35,"keywordType":"Outcome","textWithKeyword":"Then I should be on the create group page","stepMatchArguments":[]}]},
  {"pwTestLine":43,"pickleLine":37,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":38,"keywordType":"Context","textWithKeyword":"Given I have groups in my list","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":39,"keywordType":"Action","textWithKeyword":"When I click the floating create group button","stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":40,"keywordType":"Outcome","textWithKeyword":"Then I should be on the create group page","stepMatchArguments":[]}]},
  {"pwTestLine":49,"pickleLine":42,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":43,"keywordType":"Context","textWithKeyword":"Given I have groups of different types","stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Then Trip groups should show plane icon","stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"And Home groups should show home icon","stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"And Family groups should show heart icon","stepMatchArguments":[]},{"pwStepLine":54,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"And Subscription groups should show credit card icon","stepMatchArguments":[]}]},
  {"pwTestLine":57,"pickleLine":50,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":51,"keywordType":"Context","textWithKeyword":"Given I have groups with a positive overall balance","stepMatchArguments":[]},{"pwStepLine":59,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"Then I should see the overall balance card","stepMatchArguments":[]},{"pwStepLine":60,"gherkinStepLine":53,"keywordType":"Outcome","textWithKeyword":"And I should see the balance amount \"€150.50\"","stepMatchArguments":[{"group":{"start":32,"value":"\"€150.50\"","children":[{"start":33,"value":"€150.50","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":61,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"And I should see \"You are owed\" balance status","stepMatchArguments":[{"group":{"start":13,"value":"\"You are owed\"","children":[{"start":14,"value":"You are owed","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":62,"gherkinStepLine":55,"keywordType":"Outcome","textWithKeyword":"And the balance should be displayed in green","stepMatchArguments":[]}]},
  {"pwTestLine":65,"pickleLine":57,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":66,"gherkinStepLine":58,"keywordType":"Context","textWithKeyword":"Given I have groups with a negative overall balance","stepMatchArguments":[]},{"pwStepLine":67,"gherkinStepLine":59,"keywordType":"Outcome","textWithKeyword":"Then I should see the overall balance card","stepMatchArguments":[]},{"pwStepLine":68,"gherkinStepLine":60,"keywordType":"Outcome","textWithKeyword":"And I should see the balance amount \"€75.25\"","stepMatchArguments":[{"group":{"start":32,"value":"\"€75.25\"","children":[{"start":33,"value":"€75.25","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":69,"gherkinStepLine":61,"keywordType":"Outcome","textWithKeyword":"And I should see \"You owe\" balance status","stepMatchArguments":[{"group":{"start":13,"value":"\"You owe\"","children":[{"start":14,"value":"You owe","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":70,"gherkinStepLine":62,"keywordType":"Outcome","textWithKeyword":"And the balance should be displayed in red","stepMatchArguments":[]}]},
  {"pwTestLine":73,"pickleLine":64,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":74,"gherkinStepLine":65,"keywordType":"Context","textWithKeyword":"Given I have groups with zero balance","stepMatchArguments":[]},{"pwStepLine":75,"gherkinStepLine":66,"keywordType":"Outcome","textWithKeyword":"Then I should see the overall balance card","stepMatchArguments":[]},{"pwStepLine":76,"gherkinStepLine":67,"keywordType":"Outcome","textWithKeyword":"And I should see the balance amount \"€0.00\"","stepMatchArguments":[{"group":{"start":32,"value":"\"€0.00\"","children":[{"start":33,"value":"€0.00","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":77,"gherkinStepLine":68,"keywordType":"Outcome","textWithKeyword":"And I should see \"All settled up!\" balance status","stepMatchArguments":[{"group":{"start":13,"value":"\"All settled up!\"","children":[{"start":14,"value":"All settled up!","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":80,"pickleLine":70,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the groups page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":81,"gherkinStepLine":71,"keywordType":"Context","textWithKeyword":"Given I have no groups","stepMatchArguments":[]},{"pwStepLine":82,"gherkinStepLine":72,"keywordType":"Outcome","textWithKeyword":"Then I should not see the overall balance card","stepMatchArguments":[]}]},
]; // bdd-data-end