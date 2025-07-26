# License System Testing Guide

This guide explains how to test your license system to ensure it's secure and handles all edge cases properly.

## Test Structure

### Unit Tests (No Database Required)
- **Location**: `tests/Unit/SimpleLicenseTest.php`
- **Purpose**: Test business logic, validation, and security without database dependencies
- **Run with**: `vendor\bin\pest tests\Unit\SimpleLicenseTest.php`

### Feature Tests (Database Required)
- **Location**: `tests/Feature/LicenseCheckTest.php`, `tests/Feature/LicenseSecurityTest.php`
- **Purpose**: Test complete HTTP flows, database interactions, and integration scenarios
- **Setup Required**: Test database configuration

## Current Working Tests

### ✅ Unit Tests (Working)
1. **Codes Enum Constants** - Verifies all status codes are defined correctly
2. **License Key Generation** - Tests key format, uniqueness, and structure
3. **Time Calculations** - Validates expiration logic and time handling
4. **Validation Logic** - Tests input validation for keys, HWIDs, and product codes
5. **Security Edge Cases** - Handles malicious input and extreme values

### ⚠️ Feature Tests (Require Database Setup)
1. **License Check API** - Tests the main `/api/license/check` endpoint
2. **License Security** - Tests for SQL injection, timing attacks, and edge cases

## Running Tests

### Quick Unit Tests (No Setup Required)
```cmd
cd "i:\nimrodcore\_panel2025"
vendor\bin\pest tests\Unit\SimpleLicenseTest.php
```

### All Unit Tests
```cmd
vendor\bin\pest tests\Unit\
```

### Feature Tests (Database Setup Required)
```cmd
# First, create test database
# Then run:
vendor\bin\pest tests\Feature\
```

## Test Scenarios Covered

### 🔒 Security Tests
- **SQL Injection Prevention**: Tests malicious SQL in license keys
- **Timing Attack Prevention**: Ensures consistent response times
- **Input Validation**: Tests oversized inputs and special characters
- **License Enumeration Prevention**: Consistent error responses
- **Rate Limiting**: Prevents abuse through rapid requests

### ⏱️ Time-Based Tests
- **Expiration Logic**: Tests both database status and time-based expiration
- **Time Left Calculation**: Validates remaining time calculations
- **Lifetime Licenses**: Ensures lifetime licenses never expire
- **Edge Date Cases**: Handles extreme dates (epoch, future dates)

### 🔧 Functional Tests
- **First Time Activation**: Tests unused → active transition
- **HWID Binding**: Tests hardware ID binding and validation
- **HWID Mismatch**: Ensures licenses can't be used on wrong hardware
- **Pause/Unpause**: Tests license suspension functionality
- **Product Validation**: Ensures licenses only work for correct products

### 🚨 Edge Cases
- **Concurrent Activation**: Tests race conditions during first activation
- **Null Values**: Handles missing or null database values
- **Zero Duration**: Tests immediate expiration scenarios
- **Very Large Durations**: Tests licenses with extreme durations
- **Malformed Keys**: Tests various invalid key formats

## Manual Testing Checklist

### 1. Normal Flow
- [ ] Create unused license
- [ ] Activate with valid HWID and product code
- [ ] Verify active response with correct time_left
- [ ] Re-check with same HWID (should work)
- [ ] Try with different HWID (should fail)

### 2. Expiration Testing
- [ ] Create license with short duration (60 seconds)
- [ ] Activate and wait for expiration
- [ ] Verify it returns expired error
- [ ] Check database status is updated

### 3. Pause/Unpause Testing
- [ ] Activate license
- [ ] Pause license
- [ ] Try to use (should return paused error)
- [ ] Unpause license
- [ ] Verify it works again with extended duration

### 4. Security Testing
- [ ] Try SQL injection in license key
- [ ] Test with very long inputs
- [ ] Test rate limiting with rapid requests
- [ ] Try using license for wrong product
- [ ] Test timing consistency for invalid keys

### 5. Lifetime License Testing
- [ ] Create lifetime license
- [ ] Activate and verify time_left shows appropriate value
- [ ] Verify it never expires regardless of activation date

## Database Setup for Feature Tests

If you want to run the full feature tests, you'll need to:

1. **Create Test Database**:
   ```sql
   CREATE DATABASE keycore_test;
   ```

2. **Update Environment**:
   ```env
   DB_CONNECTION=mysql
   DB_DATABASE=keycore_test
   ```

3. **Run Migrations**:
   ```cmd
   php artisan migrate --env=testing
   ```

4. **Run Feature Tests**:
   ```cmd
   vendor\bin\pest tests\Feature\
   ```

## Adding New Tests

### For Business Logic (Unit Tests)
Add to `tests/Unit/SimpleLicenseTest.php`:
```php
it('tests new business logic', function () {
    $result = calculateSomething();
    expect($result)->toBe('expected');
});
```

### For API Endpoints (Feature Tests)
Add to `tests/Feature/LicenseCheckTest.php`:
```php
it('tests new API behavior', function () {
    $response = $this->postJson('/api/license/check', $data);
    $response->assertStatus(200)->assertJson($expected);
});
```

## Current Test Coverage

✅ **Covered:**
- License key generation and validation
- Time calculations and expiration logic
- Basic security validation
- Input sanitization
- Status code definitions

⚠️ **Needs Database Setup:**
- HTTP API testing
- Database transaction testing
- Rate limiting validation
- Complete security flow testing

🔄 **Future Enhancements:**
- Performance testing under load
- Stress testing with many concurrent requests
- Memory usage validation
- Database optimization testing

## Troubleshooting

### "Could not find driver" Error
- SQLite extension not installed
- Use MySQL test database instead
- Or install SQLite extension for PHP

### "Unknown database" Error
- Create the test database manually
- Update phpunit.xml configuration
- Check database credentials

### Tests Taking Too Long
- Use unit tests for quick validation
- Feature tests are slower due to database operations
- Consider mocking for faster tests

## Best Practices

1. **Run unit tests frequently** during development
2. **Run feature tests before deployment**
3. **Add tests for new features** as you implement them
4. **Test edge cases** especially for security-critical code
5. **Keep tests simple and focused** on one thing at a time
6. **Use descriptive test names** that explain what is being tested
