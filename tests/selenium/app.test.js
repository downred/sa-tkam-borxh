const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

describe('Sample Selenium Test', () => {
  let driver;

  beforeAll(async () => {
    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('should open a page', async () => {
    // This is a sample test
    // Replace with your actual app URL when ready
    await driver.get('http://localhost:3000');
    const title = await driver.getTitle();
    expect(title).toBeDefined();
  }, 30000); // 30 second timeout
});
