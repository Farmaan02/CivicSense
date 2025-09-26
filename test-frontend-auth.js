// Test frontend authentication flow
import { api } from './utils/api.ts';

async function testFrontendAuth() {
  try {
    console.log('Testing admin login...');
    const response = await api.adminLogin('admin', 'admin123');
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

testFrontendAuth();