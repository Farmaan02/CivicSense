# Testing Steps for CivicPulse Authentication and Sidebar Features

## 1. Sidebar Functionality Testing

### Desktop Testing
1. Open browser and navigate to http://localhost:3001
2. Verify that the sidebar is visible and expanded by default
3. Check that all navigation items are visible with icons and labels
4. Click on different navigation items to ensure they work correctly
5. Verify that the active item is properly highlighted

### Mobile Testing
1. Open browser DevTools and switch to mobile view or use a real mobile device
2. Verify that the sidebar is collapsed by default
3. Click the hamburger menu button in the header
4. Verify that the sidebar drawer slides in from the left
5. Check that all navigation items are visible in the drawer
6. Click on different navigation items to ensure they work correctly
7. Verify that clicking outside the drawer or pressing ESC closes the drawer
8. Verify that focus is properly trapped within the drawer when open

## 2. Authentication Testing

### Login Page
1. Navigate to http://localhost:3001/login
2. Verify that the login form is displayed correctly
3. Test form validation:
   - Try submitting with empty fields
   - Try submitting with invalid email format
   - Verify appropriate error messages are displayed
4. Test password visibility toggle
5. Test "Continue as Guest" functionality
6. Test navigation to signup page

### Signup Page
1. Navigate to http://localhost:3001/register
2. Verify that the signup form is displayed correctly
3. Test form validation:
   - Try submitting with empty fields
   - Try submitting with invalid email format
   - Try submitting with non-matching passwords
   - Verify appropriate error messages are displayed
4. Test password visibility toggle
5. Test "Continue as Guest" functionality
6. Test navigation to login page

### Authentication Flow
1. Register a new user account
2. Verify that you are redirected to the dashboard
3. Log out and verify you return to guest mode
4. Log in with the same account
5. Verify that you are redirected to the dashboard
6. Check that user information is displayed in the sidebar footer
7. Test session persistence by refreshing the page

## 3. Admin Portal Testing

1. Navigate to http://localhost:3001/admin
2. Verify that the admin sidebar is displayed correctly
3. Test all admin navigation items
4. Verify that admin user information is displayed in the sidebar footer
5. Test admin logout functionality

## 4. Responsive Behavior Testing

1. Test resizing the browser window from desktop to mobile sizes
2. Verify that the sidebar properly transitions between expanded and collapsed states
3. Test that the hamburger menu appears/disappears at appropriate breakpoints
4. Verify that all interactive elements remain accessible at all screen sizes

## 5. Accessibility Testing

1. Test keyboard navigation through the sidebar items
2. Verify that focus indicators are visible
3. Test screen reader compatibility
4. Verify that ARIA attributes are properly set