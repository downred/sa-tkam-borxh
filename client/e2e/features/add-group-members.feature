Feature: Add Group Members
  As a user who created a group
  I want to add members to my group
  So that we can share expenses together

  Background:
    Given I am on the add members page

  Scenario: Display add members form elements
    Then I should see the title "Add Members"
    And I should see "Invite people to join your group"
    And I should see the email input field
    And I should see the Add button
    And I should see "Share Group Link"
    And I should see the group link input
    And I should see "Your Friends"
    And I should see the Skip for Now button
    And I should see the Done button

  Scenario: Add button is disabled when email is empty
    Then the Add button should be disabled

  Scenario: Add button is enabled when email is entered
    When I enter "friend@example.com" in the email field
    Then the Add button should be enabled

  Scenario: Select a friend from the list
    When I click on friend "John Doe"
    Then the friend "John Doe" should be selected

  Scenario: Deselect a friend from the list
    When I click on friend "John Doe"
    And I click on friend "John Doe"
    Then the friend "John Doe" should not be selected

  Scenario: Done button is disabled when no members selected
    Then the Done button should be disabled

  Scenario: Done button is enabled when a friend is selected
    When I click on friend "Jane Smith"
    Then the Done button should be enabled

  Scenario: Skip for now button navigates away
    When I click the Skip for Now button
    Then I should be on the expenses page
