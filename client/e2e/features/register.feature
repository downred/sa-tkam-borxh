Feature: User Registration
  As a new user
  I want to create an account
  So that I can track my expenses

  Background:
    Given I am on the register page

  Scenario: Display registration form elements
    Then I should see the page title "Create Account"
    And I should see the subtitle "Start tracking your expenses today"
    And I should see the name input field
    And I should see the email input field
    And I should see the password input field
    And I should see the confirm password input field
    And I should see the terms checkbox
    And I should see the "Create Account" button
    And I should see a link to login page

  Scenario: Show validation errors on empty form submission
    When I click the submit button
    Then I should see a validation error

  Scenario: Show error for invalid email format
    When I enter "invalid-email" in the email field
    And I blur the email field
    Then I should see an email validation error

  Scenario: Show error when password is too short
    When I enter "123" in the password field
    And I blur the password field
    Then I should see "at least 6 characters" error

  Scenario: Show error when passwords do not match
    When I enter "password123" in the password field
    And I enter "different123" in the confirm password field
    And I blur the confirm password field
    Then I should see "Passwords do not match" error

  Scenario: Navigate to login page
    When I click the sign in link
    Then I should be on the login page

  Scenario: Fill form with valid data
    When I enter "John Doe" in the name field
    And I enter "john@example.com" in the email field
    And I enter "password123" in the password field
    And I enter "password123" in the confirm password field
    And I check the terms checkbox
    Then I should not see any validation errors
