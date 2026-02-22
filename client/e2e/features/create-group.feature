Feature: Create Group
  As a user
  I want to create expense groups
  So that I can track shared expenses with others

  Background:
    Given I am on the create group page

  Scenario: Display create group form elements
    Then I should see the page title "New Group"
    And I should see the group name input field
    And I should see "Group Type" label
    And I should see "Trip" type option
    And I should see "Home" type option
    And I should see "Family" type option
    And I should see "Subscription" type option
    And I should see "Other" type option
    And the create button should be disabled

  Scenario: Enable create button when form is complete
    Given the create button is disabled
    When I enter "My Test Group" in the group name field
    Then the create button should be disabled
    When I select "Trip" type
    Then the create button should be enabled

  Scenario: Select group type
    When I select "Trip" type
    Then the "Trip" type should be active

  # TODO: Trip dates feature not yet implemented
  # Scenario: Show trip dates for Trip type
  #   Then I should not see the start date field
  #   And I should not see the end date field
  #   When I select "Trip" type
  #   Then I should see the start date field
  #   And I should see the end date field

  # TODO: Subscription renewal date feature not yet implemented
  # Scenario: Show renewal date for Subscription type
  #   Then I should not see the renewal date field
  #   When I select "Subscription" type
  #   Then I should see the renewal date field

  # TODO: Group settings (balance alerts, settle up reminders) not yet implemented
  # Scenario: Show settings when type is selected
  #   Then I should not see "Balance Alerts"
  #   When I select "Home" type
  #   Then I should see "Balance Alerts"
  #   And I should see "Settle Up Reminders"

  Scenario: Navigate to Add Members after creating group
    When I enter "My Test Group" in the group name field
    And I select "Family" type
    And I click the create group button
    Then I should see the page title "Add Members"
    And I should see "Invite people to join your group"

  # TODO: Toggle settings feature not yet implemented
  # Scenario: Toggle settings
  #   When I select "Other" type
  #   And I toggle the balance alerts setting
  #   Then the balance alerts setting should be active
