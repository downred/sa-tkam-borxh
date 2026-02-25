
import { test } from "playwright-bdd";

test.describe('Friends Management', () => {

  test.beforeEach('Background', async ({ Given, And, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am logged in', null, { page }); 
    await And('I am on the friends page', null, { page }); 
  });
  
  test('Display friends page elements', async ({ Then, And, page }) => { 
    await Then('I should see the page title "Friends"', null, { page }); 
    await And('I should see the add friend button', null, { page }); 
  });

  test('Show empty state when no friends', async ({ Given, Then, And, page }) => { 
    await Given('I have no friends', null, { page }); 
    await Then('I should see the text "No friends yet"', null, { page }); 
    await And('I should see the text "Add friends to split expenses with them"', null, { page }); 
  });

  test('Open add friend modal', async ({ When, Then, And, page }) => { 
    await When('I click the add friend button', null, { page }); 
    await Then('I should see the add friend modal', null, { page }); 
    await And('I should see the friend email input field', null, { page }); 
  });

  test('Close add friend modal', async ({ When, Then, And, page }) => { 
    await When('I click the add friend button', null, { page }); 
    await And('I click the cancel button', null, { page }); 
    await Then('I should not see the add friend modal', null, { page }); 
  });

  test('Show error for non-existent email', async ({ Given, When, Then, And, page }) => { 
    await Given('the API will return a user not found error', null, { page }); 
    await When('I click the add friend button', null, { page }); 
    await And('I enter "nonexistent@example.com" in the friend email field', null, { page }); 
    await And('I click the add friend confirm button', null, { page }); 
    await Then('I should see the error "User not found"', null, { page }); 
  });

  test('Successfully add a friend', async ({ Given, When, Then, And, page }) => { 
    await Given('the API will return a successful add friend response', null, { page }); 
    await When('I click the add friend button', null, { page }); 
    await And('I enter "friend@example.com" in the friend email field', null, { page }); 
    await And('I click the add friend confirm button', null, { page }); 
    await Then('I should see the friend in the list', null, { page }); 
  });

  test('Display friends list', async ({ Given, Then, And, page }) => { 
    await Given('I have friends in my list', null, { page }); 
    await Then('I should see friend cards with name and email', null, { page }); 
    await And('I should see a remove button for each friend', null, { page }); 
  });

  test('Remove a friend', async ({ Given, When, Then, And, page }) => { 
    await Given('I have friends in my list', null, { page }); 
    await And('the API will return a successful remove friend response', null, { page }); 
    await When('I click the remove friend button', null, { page }); 
    await Then('the friend should be removed from the list', null, { page }); 
  });

});

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/friends.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ 
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I should see the page title \"Friends\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Friends\"","children":[{"start":29,"value":"Friends","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see the add friend button","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given I have no friends","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see the text \"No friends yet\"","stepMatchArguments":[{"group":{"start":22,"value":"\"No friends yet\"","children":[{"start":23,"value":"No friends yet","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And I should see the text \"Add friends to split expenses with them\"","stepMatchArguments":[{"group":{"start":22,"value":"\"Add friends to split expenses with them\"","children":[{"start":23,"value":"Add friends to split expenses with them","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":22,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I click the add friend button","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then I should see the add friend modal","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And I should see the friend email input field","stepMatchArguments":[]}]},
  {"pwTestLine":28,"pickleLine":24,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I click the add friend button","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"And I click the cancel button","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then I should not see the add friend modal","stepMatchArguments":[]}]},
  {"pwTestLine":34,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":30,"keywordType":"Context","textWithKeyword":"Given the API will return a user not found error","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"When I click the add friend button","stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"And I enter \"nonexistent@example.com\" in the friend email field","stepMatchArguments":[{"group":{"start":8,"value":"\"nonexistent@example.com\"","children":[{"start":9,"value":"nonexistent@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":38,"gherkinStepLine":33,"keywordType":"Action","textWithKeyword":"And I click the add friend confirm button","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"Then I should see the error \"User not found\"","stepMatchArguments":[{"group":{"start":23,"value":"\"User not found\"","children":[{"start":24,"value":"User not found","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":42,"pickleLine":36,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":37,"keywordType":"Context","textWithKeyword":"Given the API will return a successful add friend response","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"When I click the add friend button","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":39,"keywordType":"Action","textWithKeyword":"And I enter \"friend@example.com\" in the friend email field","stepMatchArguments":[{"group":{"start":8,"value":"\"friend@example.com\"","children":[{"start":9,"value":"friend@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":46,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"And I click the add friend confirm button","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then I should see the friend in the list","stepMatchArguments":[]}]},
  {"pwTestLine":50,"pickleLine":43,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":44,"keywordType":"Context","textWithKeyword":"Given I have friends in my list","stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"Then I should see friend cards with name and email","stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"And I should see a remove button for each friend","stepMatchArguments":[]}]},
  {"pwTestLine":56,"pickleLine":48,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am logged in","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the friends page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":49,"keywordType":"Context","textWithKeyword":"Given I have friends in my list","stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":50,"keywordType":"Context","textWithKeyword":"And the API will return a successful remove friend response","stepMatchArguments":[]},{"pwStepLine":59,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"When I click the remove friend button","stepMatchArguments":[]},{"pwStepLine":60,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"Then the friend should be removed from the list","stepMatchArguments":[]}]},
]; 