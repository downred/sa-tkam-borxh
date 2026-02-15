describe('Sample Unit Tests', () => {
  describe('Basic Arithmetic', () => {
    it('should correctly add two numbers', () => {
      // Given two numbers
      // When added together
      // Then the result should be their sum
      expect(1 + 1).toBe(2);
    });
  });

  describe('String Operations', () => {
    it('should match expected string value', () => {
      // Given a greeting string
      const greeting = 'Hello World';

      // Then it should equal the expected value
      expect(greeting).toBe('Hello World');
    });
  });
});
