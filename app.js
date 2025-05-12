// app.js - Node + MongoDB version

const API_BASE = '/api';

// Device ID
function getDeviceId() {
  let deviceId = localStorage.getItem('duckFarmDeviceId');
  if (!deviceId) {
    deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('duckFarmDeviceId', deviceId);
  }
  return deviceId;
}
const deviceId = getDeviceId();

// Update Balance
function updateBalance() {
  fetch(`${API_BASE}/user/balance?deviceId=${deviceId}`)
    .then(res => res.json())
    .then(data => {
      const balanceEl = document.getElementById('user-balance');
      if (balanceEl) balanceEl.textContent = `Tzs ${data.balance}`;
    });
}

// Join Plan
function joinPlan(planName, price) {
  fetch(`${API_BASE}/user/join-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, planName, price })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(`Joined ${planName} successfully!`);
        updateBalance();
      } else {
        alert(data.message || 'Failed to join plan.');
      }
    });
}

// Recharge
const rechargeForm = document.getElementById('recharge-form');
if (rechargeForm) {
  rechargeForm.addEventListener('submit', e => {
    e.preventDefault();
    const amount = parseInt(document.getElementById('amount').value);
    const fullname = document.getElementById('fullname').value.trim();
    const network = document.getElementById('network').value;
    
    if (!network || fullname.split(' ').length < 3 || amount < 10000) {
      alert('Invalid recharge input.');
      return;
    }
    
    fetch(`${API_BASE}/user/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, fullname, amount, network })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Recharge successful!');
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Recharge failed.');
        }
      });
  });
}

// Withdraw
const withdrawForm = document.getElementById('withdraw-form');
if (withdrawForm) {
  withdrawForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const fullname = document.getElementById('fullname').value.trim();
    const network = document.getElementById('network').value;
    
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    if (!network || fullname.split(' ').length < 3 || amount < 5000) {
      alert('Invalid withdrawal input.');
      return;
    }
    
    if (day < 2 || day > 5 || hour < 4 || hour >= 12) {
      alert("Withdrawal allowed Tue–Fri, 4:00AM–12:00PM (EAT).");
      return;
    }
    
    fetch(`${API_BASE}/user/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, fullname, amount, network })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Withdrawal request submitted.');
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Withdrawal failed.');
        }
      });
  });
}

// Account Limit
function registerNewAccount() {
  fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Account registered successfully!');
      } else if (data.limitReached) {
        alert('Maximum accounts reached.');
        window.location.href = 'limit.html';
      } else {
        alert('Registration failed.');
      }
    });
}

// Referral System
function generateReferralCode() {
  fetch(`${API_BASE}/user/referral-code?deviceId=${deviceId}`)
    .then(res => res.json())
    .then(data => {
      if (data.code) {
        alert('Your referral link: ' + window.location.origin + '?ref=' + data.code);
      } else {
        alert(data.message || 'Referral unavailable.');
      }
    });
}

function registerReferral(refCode) {
  fetch(`${API_BASE}/user/register-referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, refCode })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('Referral registered.');
      }
    });
}

function showReferralStats() {
  fetch(`${API_BASE}/user/referral-stats?deviceId=${deviceId}`)
    .then(res => res.json())
    .then(data => {
      console.log("My referrals:", data.referrals);
      console.log("Referral earnings:", data.earnings);
    });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  updateBalance();
});