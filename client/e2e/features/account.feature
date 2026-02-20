Feature: Account Page
  As a logged in user
  I want to view my account information
  So that I can manage my profile and logout

  Background:
    Given I am logged in as "john@example.com"
    And I am on the account page

  Scenario: Display account page elements
    Then I should see the title "Account"
    And I should see the Profile section
    And I should see the Log Out option

  Scenario: Display user information
    Then I should see my name displayed
    And I should see my email displayed

  Scenario: Logout from account page
    When I click the Log Out option
    Then I should be on the login page
    And I should not be authenticated
