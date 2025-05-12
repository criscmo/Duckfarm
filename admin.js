// admin.js

// Tab switcher
function switchTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.content-section');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  sections.forEach(section => section.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

// Logout function
function logout() {
  alert("Logged out");
  window.location.href = "admin_login.html";
}

// Approve or reject transaction and send update to API
function handleAction(button, status) {
  const row = button.closest('tr');
  const user = row.dataset.user;
  const type = row.dataset.type;
  const amount = row.dataset.amount;
  
  if (!user || !type || !amount) {
    console.error("Incomplete data attributes on row");
    return;
  }
  
  fetch('/api/transactions/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, amount, type, status })
    })
    .then(res => res.json())
    .then(() => {
      row.cells[2].textContent = status;
      row.cells[3].innerHTML = `<span style="color:${status === 'Approved' ? 'green' : 'red'};">${status}</span>`;
    })
    .catch(err => console.error('Update failed', err));
}

// Load transactions and populate tables
function loadTransactions() {
  fetch('/api/transactions')
    .then(res => res.json())
    .then(records => {
      const rechargeTable = document.querySelector('#recharge table');
      const withdrawTable = document.querySelector('#withdraw table');
      const recordTable = document.querySelector('#records table');
      
      if (!rechargeTable || !withdrawTable || !recordTable) {
        console.error("One or more tables not found in the DOM.");
        return;
      }
      
      records.forEach(entry => {
        if (!entry.user || !entry.amount || !entry.type) return;
        
        const row = document.createElement('tr');
        row.dataset.user = entry.user;
        row.dataset.amount = entry.amount;
        row.dataset.type = entry.type;
        
        if (entry.type === "Recharge" || entry.type === "Withdraw") {
          row.innerHTML = `
            <td>${entry.user}</td>
            <td>${entry.amount}</td>
            <td>${entry.status || 'Pending'}</td>
            <td>
              ${entry.status === "Pending"
                ? `<button class="action-btn approve-btn" onclick="handleAction(this, 'Approved')">Approve</button>
                   <button class="action-btn reject-btn" onclick="handleAction(this, 'Rejected')">Reject</button>`
                : `<span style="color:${entry.status === 'Approved' ? 'green' : 'red'};">${entry.status}</span>`
              }
            </td>`;
          
          if (entry.type === "Recharge") {
            rechargeTable.appendChild(row);
          } else {
            withdrawTable.appendChild(row);
          }
        }
        
        const recordRow = document.createElement('tr');
        recordRow.innerHTML = `
          <td>${entry.user}</td>
          <td>${entry.type}</td>
          <td>${entry.amount}</td>
          <td>${entry.date || ''}</td>
        `;
        recordTable.appendChild(recordRow);
      });
    })
    .catch(err => console.error('Failed to load transactions:', err));
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
});