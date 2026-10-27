import { test, expect } from '@playwright/test';

test('add cash customer and verify', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Go to Customers tab
  await page.click('button:has-text("Customer")');
  
  // Click New Customer
  await page.click('button:has-text("New customer")');
  
  // Click Cash Customer option
  await page.click('button:has-text("Cash customer")');
  
  // Fill Name
  await page.fill('input[placeholder="Customer\'s full name"]', 'Test Cash Customer');
  
  // Fill Mobile
  await page.fill('input[placeholder="017XXXXXXXX"]', '01900000000');
  
  // Click Add customer
  await page.click('button:has-text("Add customer")');
  
  // Wait for success modal (simulated delay is 1.5s)
  await page.waitForSelector('text=Customer information ready', { timeout: 5000 });
  
  // Click Keep adding customers (to check if it stays on form)
  await page.click('button:has-text("Keep adding customers.")');
  
  // Check if form is still there and reset
  const nameValue = await page.inputValue('input[placeholder="Customer\'s full name"]');
  expect(nameValue).toBe('');
  
  // Cancel/Back to list
  await page.click('button:has-text("Cancel")');
  
  // Verify customer in list
  await expect(page.locator('text=Test Cash Customer')).toBeVisible();
  await expect(page.locator('text=CASH')).toBeVisible();
});
