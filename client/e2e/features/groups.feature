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

  # TODO: Per-group balance display not yet fully implemented
  # Scenario: Display balance for each group
  #   Given I have groups in my list
  #   Then I should see balance amount on each group
  #   And groups I am owed show green balance
  #   And groups I owe show red balance

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

  # TODO: Overall balance feature not yet fully implemented
  # Scenario: Display overall balance when user is owed money
  #   Given I have groups with a positive overall balance
  #   Then I should see the overall balance card
  #   And I should see the balance amount "€150.50"
  #   And I should see "You are owed" balance status
  #   And the balance should be displayed in green

  # Scenario: Display overall balance when user owes money
  #   Given I have groups with a negative overall balance
  #   Then I should see the overall balance card
  #   And I should see the balance amount "€75.25"
  #   And I should see "You owe" balance status
  #   And the balance should be displayed in red

  # Scenario: Display settled up state when balance is zero
  #   Given I have groups with zero balance
  #   Then I should see the overall balance card
  #   And I should see the balance amount "€0.00"
  #   And I should see "All settled up!" balance status

  # Scenario: Hide balance card when no groups exist
  #   Given I have no groups
  #   Then I should not see the overall balance card
