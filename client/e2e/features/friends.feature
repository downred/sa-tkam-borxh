Feature: Friends Management
  As a registered user
  I want to manage my friends
  So that I can easily add them to groups and split expenses

  Background:
    Given I am logged in
    And I am on the friends page

  Scenario: Display friends page elements
    Then I should see the page title "Friends"
    And I should see the add friend button

  Scenario: Show empty state when no friends
    Given I have no friends
    Then I should see the text "No friends yet"
    And I should see the text "Add friends to split expenses with them"

  Scenario: Open add friend modal
    When I click the add friend button
    Then I should see the add friend modal
    And I should see the friend email input field

  Scenario: Close add friend modal
    When I click the add friend button
    And I click the cancel button
    Then I should not see the add friend modal

  Scenario: Show error for non-existent email
    Given the API will return a user not found error
    When I click the add friend button
    And I enter "nonexistent@example.com" in the friend email field
    And I click the add friend confirm button
    Then I should see the error "User not found"

  Scenario: Successfully add a friend
    Given the API will return a successful add friend response
    When I click the add friend button
    And I enter "friend@example.com" in the friend email field
    And I click the add friend confirm button
    Then I should see the friend in the list

  Scenario: Display friends list
    Given I have friends in my list
    Then I should see friend cards with name and email
    And I should see a remove button for each friend

  Scenario: Remove a friend
    Given I have friends in my list
    And the API will return a successful remove friend response
    When I click the remove friend button
    Then the friend should be removed from the list
