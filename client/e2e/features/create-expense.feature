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

  # TODO: Multiple payers feature not yet implemented
  # Scenario: Toggle multiple payers mode
  #   When I click the Multiple payers toggle
  #   Then I should see "Single payer" toggle text

  # Scenario: Select multiple payers
  #   When I click the Multiple payers toggle
  #   And I click on payer "John"
  #   And I click on payer "Jane"
  #   Then the payer "John" should be active
  #   And the payer "Jane" should be active

  # Scenario: Split evenly among payers
  #   When I enter "100" in the amount field
  #   And I click the Multiple payers toggle
  #   And I click on payer "John"
  #   And I click the Split evenly button
  #   Then I should see split amounts displayed

  # Split Types Scenarios
  Scenario: Display split type selector
    Then I should see the split type selector
    And split type "Equal" should be active

  Scenario: Select Exact split type
    When I click on split type "Exact"
    Then split type "Exact" should be active
    And I should see exact amount inputs for each participant

  Scenario: Select Percentage split type
    When I click on split type "%" 
    Then split type "%" should be active
    And I should see percentage inputs for each participant

  Scenario: Select Shares split type
    When I click on split type "Shares"
    Then split type "Shares" should be active
    And I should see shares inputs for each participant

  Scenario: Validate exact amounts must sum to total
    When I enter "Dinner" in the description field
    And I enter "100" in the amount field
    And I click on split type "Exact"
    And I enter "30" in exact amount for "John"
    And I enter "30" in exact amount for "Jane"
    Then the Add Expense button should be disabled
    And I should see "Total:" message

  Scenario: Enable button when exact amounts match total
    When I enter "Dinner" in the description field
    And I enter "100" in the amount field
    And I click on split type "Exact"
    And I enter "60" in exact amount for "John"
    And I enter "40" in exact amount for "Jane"
    Then the Add Expense button should be enabled

  Scenario: Validate percentages must sum to 100
    When I enter "Rent" in the description field
    And I enter "500" in the amount field
    And I click on split type "%"
    And I enter "60" in percentage for "John"
    And I enter "30" in percentage for "Jane"
    Then the Add Expense button should be disabled
    And I should see "Total: 90% / 100%" message

  Scenario: Enable button when percentages total 100
    When I enter "Rent" in the description field
    And I enter "500" in the amount field
    And I click on split type "%"
    And I enter "60" in percentage for "John"
    And I enter "40" in percentage for "Jane"
    Then the Add Expense button should be enabled

  Scenario: Shares split calculates proportionally
    When I enter "Utilities" in the description field
    And I enter "90" in the amount field
    And I click on split type "Shares"
    And I enter "2" in shares for "John"
    And I enter "1" in shares for "Jane"
    Then I should see "€60.00" calculated for "John"
    And I should see "€30.00" calculated for "Jane"

  Scenario: Split evenly button for exact amounts
    When I enter "100" in the amount field
    And I click on split type "Exact"
    And I click the Split Evenly button for exact
    Then I should see "50.00" in exact amount for "John"
    And I should see "50.00" in exact amount for "Jane"
