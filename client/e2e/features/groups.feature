Feature: Groups List
  As a registered user
  I want to view all my groups
  So that I can manage group expenses

  Background:
    Given I am logged in
    And I am on the groups page

  Scenario: Display groups page elements
    Then I should see the page title "Your Groups"
    And I should see the groups count

  Scenario: Show empty state when no groups
    Given I have no groups
    Then I should see the text "No groups yet"
    And I should see the text "Create a group to start splitting expenses"
    And I should see the create group button

  Scenario: Display groups list
    Given I have groups in my list
    Then I should see group cards with name and type
    And I should see member count for each group
    And I should see the floating create group button

  Scenario: Navigate to create group from empty state
    Given I have no groups
    When I click the create group button
    Then I should be on the create group page

  Scenario: Navigate to create group from FAB
    Given I have groups in my list
    When I click the floating create group button
    Then I should be on the create group page

  Scenario: Display correct group type icons
    Given I have groups of different types
    Then Trip groups should show plane icon
    And Home groups should show home icon
    And Family groups should show heart icon
    And Subscription groups should show credit card icon
