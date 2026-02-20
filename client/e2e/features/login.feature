Feature: User Login
  As a registered user
  I want to sign in to my account
  So that I can manage my expenses

  Background:
    Given I am on the login page

  Scenario: Display login form elements
    Then I should see the page title "Welcome Back"
    And I should see the subtitle "Sign in to manage your expenses"
    And I should see the email input field
    And I should see the password input field
    And I should see the remember me checkbox
    And I should see the forgot password link
    And I should see the "Sign In" button
    And I should see a link to register page

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

  Scenario: Navigate to register page
    When I click the create account link
    Then I should be on the register page

  Scenario: Fill form with valid data
    When I enter "test@example.com" in the email field
    And I enter "password123" in the password field
    Then I should not see any validation errors

  Scenario: Toggle remember me checkbox
    When I check the remember me checkbox
    Then the remember me checkbox should be checked
  Scenario: Successfully login with valid credentials
    Given the API will return a successful login response
    When I enter "test@example.com" in the email field
    And I enter "password123" in the password field
    And I click the submit button
    Then I should be redirected to the groups page

  Scenario: Show error for invalid credentials
    Given the API will return "Invalid credentials" error
    When I enter "test@example.com" in the email field
    And I enter "wrongpassword" in the password field
    And I click the submit button
    Then I should see "Invalid credentials" error message

  Scenario: Show loading state during login
    Given the API will delay response for 1 second
    When I enter "test@example.com" in the email field
    And I enter "password123" in the password field
    And I click the submit button
    Then I should see the loading spinner