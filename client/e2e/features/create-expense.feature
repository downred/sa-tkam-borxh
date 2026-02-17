Feature: Create Expense
  As a user in a group
  I want to create expenses
  So that we can track shared costs

  Background:
    Given I am on the create expense page

  Scenario: Display create expense form elements
    Then I should see the title "New Expense"
    And I should see the group indicator "Roommates"
    And I should see the description input field
    And I should see the amount input field
    And I should see "Paid by" label
    And I should see the payer options
    And I should see the Add Expense button

  Scenario: Add Expense button is disabled when form is empty
    Then the Add Expense button should be disabled

  Scenario: Add Expense button is disabled without description
    When I enter "50" in the amount field
    Then the Add Expense button should be disabled

  Scenario: Add Expense button is disabled without amount
    When I enter "Groceries" in the description field
    Then the Add Expense button should be disabled

  Scenario: Add Expense button is enabled with valid data
    When I enter "Groceries" in the description field
    And I enter "50" in the amount field
    Then the Add Expense button should be enabled

  Scenario: Select a different payer
    When I click on payer "John"
    Then the payer "John" should be active

  Scenario: Toggle multiple payers mode
    When I click the Multiple payers toggle
    Then I should see "Single payer" toggle text

  Scenario: Select multiple payers
    When I click the Multiple payers toggle
    And I click on payer "John"
    And I click on payer "Jane"
    Then the payer "John" should be active
    And the payer "Jane" should be active

  Scenario: Split evenly among payers
    When I enter "100" in the amount field
    And I click the Multiple payers toggle
    And I click on payer "John"
    And I click the Split evenly button
    Then I should see split amounts displayed
