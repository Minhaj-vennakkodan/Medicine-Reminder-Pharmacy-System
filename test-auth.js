/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const http = require('http');

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  let customerCookie = '';
  let adminCookie = '';
  const testEmail = `test${Date.now()}@customer.com`;

  console.log('--- Starting Auth Tests ---');

  // 1. Customer Registration
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: testEmail,
        phone: '1234567890',
        password: 'password123',
        role: 'CUSTOMER'
      })
    });
    const data = await res.json();
    console.log('Customer Registration:', res.status === 201 ? 'PASSED' : `FAILED (${data.error})`);
    
    // Extract cookie
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      customerCookie = setCookie.split(';')[0];
    }
  } catch (e) {
    console.log('Customer Registration: ERROR', e.message);
  }

  // 2. Duplicate Registration
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: testEmail,
        phone: '1234567890',
        password: 'password123',
        role: 'CUSTOMER'
      })
    });
    console.log('Duplicate Registration Check:', res.status === 409 ? 'PASSED' : 'FAILED');
  } catch (e) {
    console.log('Duplicate Registration Check: ERROR');
  }

  // 3. Admin Login
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@pharmacy.com',
        password: 'admin123' 
      })
    });
    const data = await res.json();
    console.log('Admin Login:', res.status === 200 ? 'PASSED' : `FAILED (${data.error})`);
    
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      adminCookie = setCookie.split(';')[0];
    }
  } catch (e) {
    console.log('Admin Login: ERROR');
  }

  // 4. Invalid Login
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword'
      })
    });
    console.log('Invalid Login Check:', res.status === 401 ? 'PASSED' : 'FAILED');
  } catch (e) {
    console.log('Invalid Login Check: ERROR');
  }

  // 5. Protected Routes
  try {
    // No auth
    let res = await fetch(`${baseUrl}/customer/dashboard`);
    console.log('Unauth Customer Route Redirect:', res.url.includes('/login') ? 'PASSED' : 'FAILED');

    // Customer accessing Customer dashboard
    res = await fetch(`${baseUrl}/customer/dashboard`, {
      headers: { 'Cookie': customerCookie }
    });
    console.log('Customer Auth Route Access:', !res.url.includes('/login') ? 'PASSED' : 'FAILED');

    // Customer accessing Admin dashboard
    res = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { 'Cookie': customerCookie }
    });
    console.log('Customer Accessing Admin Route Check:', res.url.includes('/customer/dashboard') ? 'PASSED' : 'FAILED');

    // Admin accessing Admin dashboard
    res = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { 'Cookie': adminCookie }
    });
    console.log('Admin Auth Route Access:', !res.url.includes('/customer') && !res.url.includes('/login') ? 'PASSED' : 'FAILED');
  } catch (e) {
    console.log('Protected Routes Checks: ERROR', e.message);
  }

  console.log('--- Tests Completed ---');
}

testAuth();
