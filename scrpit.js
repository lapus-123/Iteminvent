// Data storage using localStorage
let inventoryState = {
  items: [
    { id: 1001, name: "Laptop", category: "Electronics", quantity: 15, threshold: 5 },
    { id: 1002, name: "Printer Paper", category: "Office Supplies", quantity: 3, threshold: 10 },
    { id: 1003, name: "Desk Chair", category: "Furniture", quantity: 8, threshold: 5 },
    { id: 1004, name: "Monitor", category: "Electronics", quantity: 12, threshold: 5 },
    { id: 1005, name: "Stapler", category: "Office Supplies", quantity: 2, threshold: 5 }
  ],
  categories: ['Electronics', 'Office Supplies', 'Furniture'],
  historyLog: [
    { id: 1, itemId: 1002, itemName: "Printer Paper", action: "Withdraw", quantity: 2, staff: "John Doe", purpose: "For conference room", timestamp: "2025-07-15T10:30:00" },
    { id: 2, itemId: 1001, itemName: "Laptop", action: "Refill", quantity: 5, staff: "Jane Smith", purpose: "New stock arrived", timestamp: "2025-07-14T14:45:00" },
    { id: 3, itemId: 1005, itemName: "Stapler", action: "Add", quantity: 10, staff: "Mike Johnson", purpose: "New item added", timestamp: "2025-07-10T09:15:00" }
  ],
  nextItemId: 1006,
  darkMode: false
};

// User management
const userStorage = {
  getUsers: function() {
    const users = localStorage.getItem('inventoryUsers');
    return users ? JSON.parse(users) : [];
  },
  
  saveUsers: function(users) {
    localStorage.setItem('inventoryUsers', JSON.stringify(users));
  },
  
  createUser: function(username, password) {
    const users = this.getUsers();
    if (users.some(u => u.username === username)) {
      return false; // User already exists
    }
    
    const newUser = {
      id: Date.now().toString(),
      username,
      password, // In real app, this should be hashed
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },
  
  authenticate: function(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  }
};

// Current user state
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Check if we have a user session
  const session = localStorage.getItem('currentSession');
  if (session) {
    currentUser = JSON.parse(session);
    showApp();
  }
  
  // Set up auth event listeners
  setupAuthEventListeners();
});

function setupAuthEventListeners() {
  // Login form submission
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');
    
    const user = userStorage.authenticate(username, password);
    if (user) {
      currentUser = user;
      localStorage.setItem('currentSession', JSON.stringify(user));
      showApp();
    } else {
      showAuthMessage(messageEl, 'Invalid username or password', 'error');
    }
  });
  
  // Register form submission
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const messageEl = document.getElementById('registerMessage');
    
    if (password !== confirmPassword) {
      showAuthMessage(messageEl, 'Passwords do not match', 'error');
      return;
    }
    
    const newUser = userStorage.createUser(username, password);
    if (newUser) {
      currentUser = newUser;
      localStorage.setItem('currentSession', JSON.stringify(newUser));
      showApp();
    } else {
      showAuthMessage(messageEl, 'Username already exists', 'error');
    }
  });
  
  // Toggle between login and register
  document.getElementById('showRegister').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
    document.getElementById('loginMessage').style.display = 'none';
    document.getElementById('registerMessage').style.display = 'none';
  });
  
  document.getElementById('showLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('registerCard').style.display = 'none';
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('loginMessage').style.display = 'none';
    document.getElementById('registerMessage').style.display = 'none';
  });
  
  // Logout buttons
  document.getElementById('mobileLogoutBtn').addEventListener('click', logout);
  document.getElementById('desktopLogoutBtn').addEventListener('click', logout);
}

function showAuthMessage(element, message, type) {
  element.textContent = message;
  element.className = 'auth-message';
  if (type === 'success') {
    element.classList.add('auth-success');
  } else {
    element.classList.add('auth-error');
  }
  element.style.display = 'block';
}

function showApp() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  
  // Update user info in sidebar
  const firstLetter = currentUser.username.charAt(0).toUpperCase();
  document.getElementById('mobileUserInitial').textContent = firstLetter;
  document.getElementById('mobileUserName').textContent = currentUser.username;
  
  document.getElementById('desktopUserInitial').textContent = firstLetter;
  document.getElementById('desktopUserName').textContent = currentUser.username;
  
  // Initialize the inventory app
  loadInventoryState();
}

function logout() {
  localStorage.removeItem('currentSession');
  currentUser = null;
  
  // Reset auth UI
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
  document.getElementById('loginMessage').style.display = 'none';
  document.getElementById('registerMessage').style.display = 'none';
  
  document.getElementById('authContainer').style.display = 'flex';
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('loginCard').style.display = 'block';
  document.getElementById('registerCard').style.display = 'none';
}

// Load state from localStorage
function loadInventoryState() {
  const savedState = localStorage.getItem('inventoryState');
  if (savedState) {
    inventoryState = JSON.parse(savedState);
  }
  applyDarkMode();
  renderInventoryTable();
  renderCategoriesTable();
  updateCategoryDropdowns();
  updateLowStockAlerts();
  updateStats();
  
  // Set up inventory app event listeners
  setupInventoryEventListeners();
}

// Apply dark mode setting
function applyDarkMode() {
  if (inventoryState.darkMode) {
    document.body.classList.add('dark-mode');
    document.querySelectorAll('.dark-mode-toggle i').forEach(icon => {
      icon.classList.replace('bi-moon-stars', 'bi-sun');
    });
  } else {
    document.body.classList.remove('dark-mode');
    document.querySelectorAll('.dark-mode-toggle i').forEach(icon => {
      icon.classList.replace('bi-sun', 'bi-moon-stars');
    });
  }
}

// Update stats counters
function updateStats() {
  document.getElementById('totalItems').textContent = inventoryState.items.length;
  document.getElementById('lowStockItems').textContent = inventoryState.items.filter(item => item.quantity < item.threshold).length;
  document.getElementById('totalCategories').textContent = inventoryState.categories.length;
  document.getElementById('activityCount').textContent = inventoryState.historyLog.length;
}

// Render inventory table
function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = '';
  
  if (inventoryState.items.length === 0) {
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('itemCount').textContent = '0';
    updateStats();
    return;
  }
  
  document.getElementById('emptyState').style.display = 'none';
  
  // Get search and filter values
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const categoryId = document.getElementById('categoryFilter').value;
  
  // Filter items
  const filteredItems = inventoryState.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                          item.category.toLowerCase().includes(searchTerm);
    
    if (categoryId === '0') return matchesSearch;
    
    return matchesSearch && inventoryState.categories[parseInt(categoryId)-1] === item.category;
  });
  
  // Display filtered items
  filteredItems.forEach(item => {
    const status = item.quantity < item.threshold ? 
      '<span class="badge bg-danger">Low</span>' : 
      '<span class="badge bg-success">Good</span>';
    
    const row = document.createElement('tr');
    row.id = `item-${item.id}`;
    if (item.quantity < item.threshold) {
      row.classList.add('low-stock-row');
    }
    
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.threshold}</td>
      <td>${status}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-outline-info btn-sm history-btn" data-bs-toggle="modal" data-bs-target="#itemHistoryModal" data-item-id="${item.id}" data-item-name="${item.name}">History</button>
          <button class="btn btn-outline-primary btn-sm refill-btn" data-bs-toggle="modal" data-bs-target="#refillItemModal" data-item-id="${item.id}" data-item-name="${item.name}" data-item-quantity="${item.quantity}">Refill</button>
          <button class="btn btn-outline-success btn-sm withdraw-btn" data-item-id="${item.id}" data-item-name="${item.name}" data-item-quantity="${item.quantity}">Withdraw</button>
          <button class="btn btn-outline-warning btn-sm edit-btn" data-item-id="${item.id}">Edit</button>
          <button class="btn btn-outline-danger btn-sm delete-btn" data-item-id="${item.id}">Delete</button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
    attachEventListenersToNewRow(row);
  });
  
  document.getElementById('itemCount').textContent = filteredItems.length;
  updateStats();
}

function setupInventoryEventListeners() {
  // Page navigation
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      
      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(nav => {
        nav.classList.remove('active');
      });
      this.classList.add('active');
      
      // Show selected page
      document.querySelectorAll('.page').forEach(pageEl => {
        pageEl.classList.add('d-none');
        pageEl.classList.remove('active');
      });
      document.getElementById(page).classList.remove('d-none');
      document.getElementById(page).classList.add('active');
      
      // Update mobile page title
      document.querySelector('.page-title').textContent = this.textContent.trim();
      
      // Close mobile sidebar if open
      document.getElementById('mobileSidebar').classList.remove('active');
      document.getElementById('sidebarOverlay').classList.remove('active');
      
      // If history page is shown, update history table
      if (page === 'history') {
        updateHistoryTable();
      }
    });
  });
  
  // Dark mode toggle
  function toggleDarkMode() {
    inventoryState.darkMode = !inventoryState.darkMode;
    saveState();
    applyDarkMode();
  }
  
  document.getElementById('darkToggle')?.addEventListener('click', toggleDarkMode);
  document.getElementById('darkToggleDesktop')?.addEventListener('click', toggleDarkMode);
  
  // Add category functionality
  document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const newCategory = document.getElementById('newCategory').value.trim();
    if (newCategory) {
      inventoryState.categories.push(newCategory);
      saveState();
      renderCategoriesTable();
      updateCategoryDropdowns();
      document.getElementById('newCategory').value = '';
    }
  });
  
  // Edit category functionality
  document.getElementById('categoriesTable').addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-category-btn')) {
      const row = e.target.closest('tr');
      const nameCell = row.cells[0];
      const currentName = nameCell.textContent;
      
      // Create input field
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control form-control-sm';
      input.value = currentName;
      
      // Replace content with input
      nameCell.innerHTML = '';
      nameCell.appendChild(input);
      
      // Change buttons to save and cancel
      const actionsCell = row.cells[1];
      actionsCell.innerHTML = `
        <button class="btn btn-sm btn-success me-1 save-category-btn">Save</button>
        <button class="btn btn-sm btn-secondary cancel-category-btn">Cancel</button>
      `;
    }
    else if (e.target.classList.contains('save-category-btn')) {
      const row = e.target.closest('tr');
      const nameCell = row.cells[0];
      const input = nameCell.querySelector('input');
      const newName = input.value.trim();
      const oldName = row.originalName;
      
      if (newName) {
        // Update category in state
        const index = inventoryState.categories.indexOf(oldName);
        if (index !== -1) {
          inventoryState.categories[index] = newName;
          
          // Update items with this category
          inventoryState.items.forEach(item => {
            if (item.category === oldName) {
              item.category = newName;
            }
          });
          
          saveState();
          renderInventoryTable();
          renderCategoriesTable();
          updateCategoryDropdowns();
        }
      }
    }
    else if (e.target.classList.contains('cancel-category-btn')) {
      const row = e.target.closest('tr');
      const nameCell = row.cells[0];
      nameCell.textContent = row.originalName;
      row.cells[1].innerHTML = `
        <button class="btn btn-sm btn-outline-warning me-1 edit-category-btn">Edit</button>
        <button class="btn btn-sm btn-outline-danger delete-category-btn">Delete</button>
      `;
    }
    else if (e.target.classList.contains('delete-category-btn')) {
      const row = e.target.closest('tr');
      const categoryName = row.cells[0].textContent;
      
      if (confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
        // Remove category from state
        const index = inventoryState.categories.indexOf(categoryName);
        if (index !== -1) {
          inventoryState.categories.splice(index, 1);
          saveState();
          renderCategoriesTable();
          updateCategoryDropdowns();
        }
      }
    }
  });
  
  // Search functionality
  document.getElementById('search').addEventListener('input', renderInventoryTable);
  
  // Category filter
  document.getElementById('categoryFilter').addEventListener('change', renderInventoryTable);
  
  // Add item functionality
  document.getElementById('saveItemBtn').addEventListener('click', function() {
    const name = document.getElementById('itemName').value.trim();
    const categorySelect = document.getElementById('itemCategory');
    const categoryIndex = parseInt(categorySelect.value) - 1;
    const category = inventoryState.categories[categoryIndex];
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const threshold = parseInt(document.getElementById('itemThreshold').value);
    const staff = document.getElementById('staffName').value.trim();
    
    // Validate
    if (!name || !category || isNaN(quantity) || isNaN(threshold) || !staff) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create new item
    const newItem = {
      id: inventoryState.nextItemId++,
      name: name,
      category: category,
      quantity: quantity,
      threshold: threshold
    };
    
    // Add to state
    inventoryState.items.push(newItem);
    
    // Add to history
    inventoryState.historyLog.push({
      id: inventoryState.historyLog.length + 1,
      itemId: newItem.id,
      itemName: newItem.name,
      action: 'Add',
      quantity: newItem.quantity,
      staff: staff,
      purpose: 'New item added',
      timestamp: new Date().toISOString()
    });
    
    // Save state
    saveState();
    
    // Re-render
    renderInventoryTable();
    updateLowStockAlerts();
    
    // Close modal and reset form
    const addItemModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addItemModal'));
    addItemModal.hide();
    document.getElementById('addItemForm').reset();
  });
  
  // Save edit functionality
  document.getElementById('saveEditBtn').addEventListener('click', function() {
    const itemId = document.getElementById('editItemId').value;
    const newName = document.getElementById('editItemName').value;
    const categoryIndex = parseInt(document.getElementById('editItemCategory').value) - 1;
    const newCategory = inventoryState.categories[categoryIndex];
    const newQuantity = parseInt(document.getElementById('editItemQuantity').value);
    const newThreshold = parseInt(document.getElementById('editItemThreshold').value);
    const staff = document.getElementById('editStaffName').value.trim();
    
    // Validate
    if (!itemId || !newName || !newCategory || isNaN(newQuantity) || isNaN(newThreshold) || !staff) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Find item in state
    const itemIndex = inventoryState.items.findIndex(item => item.id == itemId);
    if (itemIndex === -1) return;
    
    // Record old values
    const oldItem = {...inventoryState.items[itemIndex]};
    
    // Update item
    inventoryState.items[itemIndex].name = newName;
    inventoryState.items[itemIndex].category = newCategory;
    inventoryState.items[itemIndex].quantity = newQuantity;
    inventoryState.items[itemIndex].threshold = newThreshold;
    
    // Add to history
    inventoryState.historyLog.push({
      id: inventoryState.historyLog.length + 1,
      itemId: itemId,
      itemName: newName,
      action: 'Edit',
      quantity: newQuantity,
      staff: staff,
      purpose: `Updated from ${oldItem.quantity} to ${newQuantity}`,
      timestamp: new Date().toISOString()
    });
    
    // Save state
    saveState();
    
    // Re-render
    renderInventoryTable();
    updateLowStockAlerts();
    
    // Close modal
    const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editItemModal'));
    editModal.hide();
  });
  
  // Process withdraw action
  document.getElementById('processWithdrawBtn').addEventListener('click', function() {
    const itemId = document.getElementById('withdrawItemId').value;
    const staffName = document.getElementById('withdrawStaffName').value.trim();
    const quantity = parseInt(document.getElementById('withdrawQuantity').value);
    const purpose = document.getElementById('withdrawPurpose').value.trim();
    
    // Validate
    if (!itemId || !staffName || isNaN(quantity) || quantity <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    
    // Find item in state
    const itemIndex = inventoryState.items.findIndex(item => item.id == itemId);
    if (itemIndex === -1) return;
    
    const item = inventoryState.items[itemIndex];
    
    // Check if withdrawal exceeds available quantity
    if (quantity > item.quantity) {
      alert(`Cannot withdraw more than available quantity (${item.quantity})`);
      return;
    }
    
    // Update quantity
    const oldQuantity = item.quantity;
    item.quantity -= quantity;
    
    // Add to history
    inventoryState.historyLog.push({
      id: inventoryState.historyLog.length + 1,
      itemId: itemId,
      itemName: item.name,
      action: 'Withdraw',
      quantity: quantity,
      staff: staffName,
      purpose: purpose,
      timestamp: new Date().toISOString()
    });
    
    // Save state
    saveState();
    
    // Re-render
    renderInventoryTable();
    updateLowStockAlerts();
    
    // Close modal
    const withdrawModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('withdrawItemModal'));
    withdrawModal.hide();
  });
  
  // Process refill action
  document.getElementById('processRefillBtn').addEventListener('click', function() {
    const itemId = document.getElementById('refillItemId').value;
    const staffName = document.getElementById('refillStaffName').value.trim();
    const quantity = parseInt(document.getElementById('refillQuantity').value);
    
    // Validate
    if (!itemId || !staffName || isNaN(quantity) || quantity <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    
    // Find item in state
    const itemIndex = inventoryState.items.findIndex(item => item.id == itemId);
    if (itemIndex === -1) return;
    
    const item = inventoryState.items[itemIndex];
    
    // Update quantity
    const oldQuantity = item.quantity;
    item.quantity += quantity;
    
    // Add to history
    inventoryState.historyLog.push({
      id: inventoryState.historyLog.length + 1,
      itemId: itemId,
      itemName: item.name,
      action: 'Refill',
      quantity: quantity,
      staff: staffName,
      purpose: 'Restocked inventory',
      timestamp: new Date().toISOString()
    });
    
    // Save state
    saveState();
    
    // Re-render
    renderInventoryTable();
    updateLowStockAlerts();
    
    // Close modal
    const refillModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('refillItemModal'));
    refillModal.hide();
  });
  
  // Confirm delete button
  document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (!window.itemToDelete) return;
    
    const staffName = document.getElementById('deleteStaffName').value.trim();
    if (!staffName) {
      alert('Please enter staff name');
      return;
    }
    
    // Find item in state
    const itemIndex = inventoryState.items.findIndex(item => item.id == window.itemToDelete.id);
    if (itemIndex === -1) return;
    
    // Add to history
    inventoryState.historyLog.push({
      id: inventoryState.historyLog.length + 1,
      itemId: window.itemToDelete.id,
      itemName: window.itemToDelete.name,
      action: 'Delete',
      quantity: 0,
      staff: staffName,
      purpose: 'Item deleted',
      timestamp: new Date().toISOString()
    });
    
    // Remove item from state
    inventoryState.items.splice(itemIndex, 1);
    saveState();
    
    // Re-render
    renderInventoryTable();
    updateLowStockAlerts();
    
    // Close modal
    const deleteModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteConfirmModal'));
    deleteModal.hide();
    
    // Reset animation
    const animation = document.getElementById('deleteAnimation');
    animation.classList.remove('animate');
    
    window.itemToDelete = null;
  });
  
  // Clear notifications
  document.getElementById('clearNotificationsBtn').addEventListener('click', function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('lowStockModal'));
    modal.hide();
  });
  
  // Mobile sidebar toggle
  document.getElementById('mobileToggle').addEventListener('click', function() {
    document.getElementById('mobileSidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
  });
  
  document.getElementById('sidebarOverlay').addEventListener('click', function() {
    document.getElementById('mobileSidebar').classList.remove('active');
    this.classList.remove('active');
  });
  
  // History page functionality
  // Select All checkbox
  document.getElementById('selectAllHistory').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('#historyTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = this.checked;
    });
  });
  
  // Delete selected history items
  document.getElementById('deleteSelectedHistory').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#historyTableBody input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
      alert('Please select at least one history entry to delete');
      return;
    }
    
    // Get IDs of selected history entries
    const idsToDelete = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
    
    // Filter out the selected entries
    inventoryState.historyLog = inventoryState.historyLog.filter(entry => !idsToDelete.includes(entry.id));
    saveState();
    updateHistoryTable();
  });
  
  // Apply history filter
  document.getElementById('applyHistoryFilter').addEventListener('click', updateHistoryTable);
  
  // Clear history filter
  document.getElementById('clearHistoryFilter').addEventListener('click', function() {
    document.getElementById('startDateFilter').value = '';
    document.getElementById('endDateFilter').value = '';
    document.getElementById('actionTypeFilter').value = '';
    updateHistoryTable();
  });
  
  // Apply date filter in item history modal
  document.getElementById('applyDateFilter').addEventListener('click', function() {
    const modal = document.getElementById('itemHistoryModal');
    const itemId = modal.dataset.itemId;
    const itemName = document.getElementById('historyItemName').textContent;
    if (itemId && itemName) {
      generateItemHistory(itemId, itemName);
      updateItemHistoryTable(itemId);
    }
  });
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('inventoryState', JSON.stringify(inventoryState));
}

// Render categories table
function renderCategoriesTable() {
  const tbody = document.getElementById('categoriesTable');
  tbody.innerHTML = '';
  
  if (inventoryState.categories.length === 0) {
    document.getElementById('emptyCategories').style.display = 'block';
    return;
  }
  
  document.getElementById('emptyCategories').style.display = 'none';
  
  inventoryState.categories.forEach((category, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${category}</td>
      <td>
        <button class="btn btn-sm btn-outline-warning me-1 edit-category-btn">Edit</button>
        <button class="btn btn-sm btn-outline-danger delete-category-btn">Delete</button>
      </td>
    `;
    row.originalName = category;
    tbody.appendChild(row);
  });
  
  updateStats();
}

// Update category dropdowns
function updateCategoryDropdowns() {
  // Dashboard filter
  const filterSelect = document.getElementById('categoryFilter');
  filterSelect.innerHTML = '<option value="0">All Categories</option>';
  inventoryState.categories.forEach((category, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = category;
    filterSelect.appendChild(option);
  });
  
  // Add item modal
  const addModalSelect = document.getElementById('itemCategory');
  addModalSelect.innerHTML = '<option value="">-- Select Category --</option>';
  inventoryState.categories.forEach((category, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = category;
    addModalSelect.appendChild(option);
  });
  
  // Edit item modal
  const editModalSelect = document.getElementById('editItemCategory');
  editModalSelect.innerHTML = '';
  inventoryState.categories.forEach((category, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = category;
    editModalSelect.appendChild(option);
  });
}

// Update low stock alerts
function updateLowStockAlerts() {
  const container = document.getElementById('lowStockAlertsContainer');
  container.innerHTML = '';
  
  const lowStockItems = inventoryState.items.filter(item => item.quantity < item.threshold);
  const notificationCount = document.getElementById('notificationCount');
  
  if (lowStockItems.length === 0) {
    container.innerHTML = '<p>No low stock notifications</p>';
    notificationCount.textContent = '0';
    return;
  }
  
  notificationCount.textContent = lowStockItems.length;
  
  lowStockItems.forEach(item => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'low-stock';
    alertDiv.dataset.itemId = item.id;
    alertDiv.innerHTML = `<strong>${item.name}</strong>: ${item.quantity} left (threshold ${item.threshold})`;
    container.appendChild(alertDiv);
    
    alertDiv.addEventListener('click', function() {
      const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('lowStockModal'));
      modal.hide();
      
      // Scroll to item
      const itemRow = document.getElementById(`item-${item.id}`);
      if (itemRow) {
        itemRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        itemRow.classList.add('low-stock-row');
        setTimeout(() => {
          itemRow.classList.remove('low-stock-row');
        }, 3000);
      }
    });
  });
}

// Update history table
function updateHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = '';
  
  if (inventoryState.historyLog.length === 0) {
    document.getElementById('emptyHistory').style.display = 'block';
    return;
  }
  
  document.getElementById('emptyHistory').style.display = 'none';
  
  // Get filter values
  const startDate = document.getElementById('startDateFilter').value;
  const endDate = document.getElementById('endDateFilter').value;
  const actionType = document.getElementById('actionTypeFilter').value;
  
  // Apply filters
  let filteredHistory = inventoryState.historyLog;
  
  if (startDate && endDate) {
    filteredHistory = filteredHistory.filter(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate >= startDate && entryDate <= endDate;
    });
  }
  
  if (actionType) {
    filteredHistory = filteredHistory.filter(entry => entry.action === actionType);
  }
  
  // Sort by date descending
  filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Add to table
  filteredHistory.forEach(entry => {
    const date = new Date(entry.timestamp);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" name="historyIds[]" value="${entry.id}"></td>
      <td>${entry.staff}</td>
      <td>${entry.itemName}</td>
      <td>${entry.quantity}</td>
      <td>${entry.action}</td>
      <td>${entry.purpose || ''}</td>
      <td>${formattedDate}</td>
    `;
    tbody.appendChild(row);
  });
  
  updateStats();
}

// Attach event listeners to new row
function attachEventListenersToNewRow(row) {
  // Edit button
  const editBtn = row.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      const itemId = this.getAttribute('data-item-id');
      const item = inventoryState.items.find(item => item.id == itemId);
      
      if (item) {
        // Populate the edit modal
        document.getElementById('editItemId').value = item.id;
        document.getElementById('editItemName').value = item.name;
        
        // Find category index
        const categoryIndex = inventoryState.categories.indexOf(item.category) + 1;
        document.getElementById('editItemCategory').value = categoryIndex || 1;
        
        document.getElementById('editItemQuantity').value = item.quantity;
        document.getElementById('editItemThreshold').value = item.threshold;
        document.getElementById('editStaffName').value = '';
        
        // Show the edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editItemModal'));
        editModal.show();
      }
    });
  }
  
  // Delete button
  const deleteBtn = row.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const itemId = this.getAttribute('data-item-id');
      const item = inventoryState.items.find(item => item.id == itemId);
      
      if (item) {
        // Set the item name in confirmation modal
        document.getElementById('itemToDeleteName').textContent = item.name;
        document.getElementById('deleteStaffName').value = '';
        
        // Store item to delete
        window.itemToDelete = item;
        
        // Show the delete confirmation modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        deleteModal.show();
      }
    });
  }
  
  // Withdraw button
  const withdrawBtn = row.querySelector('.withdraw-btn');
  if (withdrawBtn) {
    withdrawBtn.addEventListener('click', function() {
      const itemId = this.getAttribute('data-item-id');
      const item = inventoryState.items.find(item => item.id == itemId);
      
      if (item) {
        // Populate the withdraw modal
        document.getElementById('withdrawItemId').value = item.id;
        document.getElementById('withdrawItemName').textContent = item.name;
        document.getElementById('withdrawQuantity').setAttribute('max', item.quantity);
        document.getElementById('withdrawForm').reset();
        document.getElementById('withdrawQuantity').value = '1';
        
        // Show the withdraw modal
        const withdrawModal = new bootstrap.Modal(document.getElementById('withdrawItemModal'));
        withdrawModal.show();
      }
    });
  }
  
  // Refill button
  const refillBtn = row.querySelector('.refill-btn');
  if (refillBtn) {
    refillBtn.addEventListener('click', function() {
      const itemId = this.getAttribute('data-item-id');
      const item = inventoryState.items.find(item => item.id == itemId);
      
      if (item) {
        // Populate the refill modal
        document.getElementById('refillItemId').value = item.id;
        document.getElementById('refillItemName').textContent = item.name;
        document.getElementById('refillForm').reset();
        document.getElementById('refillQuantity').value = '1';
        
        // Show the refill modal
        const refillModal = new bootstrap.Modal(document.getElementById('refillItemModal'));
        refillModal.show();
      }
    });
  }
  
  // History button
  const historyBtn = row.querySelector('.history-btn');
  if (historyBtn) {
    historyBtn.addEventListener('click', function() {
      const itemId = this.getAttribute('data-item-id');
      const itemName = this.getAttribute('data-item-name');
      
      document.getElementById('historyItemName').textContent = itemName;
      
      // Store item ID in modal for later use
      const modal = document.getElementById('itemHistoryModal');
      modal.dataset.itemId = itemId;
      
      // Generate chart with real data
      generateItemHistory(itemId, itemName);
      
      // Update history table
      updateItemHistoryTable(itemId);
      
      // Show the history modal
      const historyModal = new bootstrap.Modal(document.getElementById('itemHistoryModal'));
      historyModal.show();
    });
  }
}

// Generate item history visualization with real data
function generateItemHistory(itemId, itemName) {
  // Clear existing chart if any
  const canvas = document.getElementById('historyChart');
  if (canvas.chart) {
    canvas.chart.destroy();
  }
  
  // Get date range from inputs
  let startDate, endDate;
  const startDateInput = document.getElementById('startDateGraph').value;
  const endDateInput = document.getElementById('endDateGraph').value;
  
  if (startDateInput && endDateInput) {
    startDate = new Date(startDateInput);
    endDate = new Date(endDateInput);
  } else {
    // Default to last 30 days
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
  }
  
  // Filter history for this item and within the date range
  const itemHistory = inventoryState.historyLog.filter(entry => {
    if (entry.itemId != itemId) return false;
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
  });
  
  // Group by date and action
  const dataByDate = {};
  
  // Initialize all dates in the range with zeros
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    dataByDate[dateStr] = {
      refill: 0,
      withdraw: 0
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Fill with actual data
  itemHistory.forEach(entry => {
    const entryDate = new Date(entry.timestamp);
    const dateStr = entryDate.toISOString().split('T')[0];
    
    if (!dataByDate[dateStr]) {
      // In case we have a date outside the initialized range (shouldn't happen because of filter)
      return;
    }
    
    if (entry.action === 'Refill') {
      dataByDate[dateStr].refill += entry.quantity;
    } else if (entry.action === 'Withdraw') {
      dataByDate[dateStr].withdraw += entry.quantity;
    }
  });
  
  // Prepare labels and data arrays
  const labels = [];
  const refillData = [];
  const withdrawData = [];
  
  const currentDate2 = new Date(startDate);
  while (currentDate2 <= endDate) {
    const dateStr = currentDate2.toISOString().split('T')[0];
    const label = currentDate2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels.push(label);
    refillData.push(dataByDate[dateStr].refill);
    withdrawData.push(dataByDate[dateStr].withdraw);
    currentDate2.setDate(currentDate2.getDate() + 1);
  }
  
  // If there's no data at all, show a message?
  // We'll still create the chart but with zeros
  
  // Create chart
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Refill',
          data: refillData,
          backgroundColor: '#22c55e',
          borderColor: 'rgba(0,0,0,0)',
          borderWidth: 0,
          borderRadius: 4,
          barThickness: 20,
        },
        {
          label: 'Withdraw',
          data: withdrawData,
          backgroundColor: '#ef4444',
          borderColor: 'rgba(0,0,0,0)',
          borderWidth: 0,
          borderRadius: 4,
          barThickness: 20,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Inventory History for ${itemName}`,
          font: {
            size: 16,
            weight: '600'
          }
        },
        legend: {
          position: 'top',
          labels: {
            boxWidth: 15,
            padding: 15
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            font: {
              weight: '500'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Quantity',
            font: {
              weight: '500'
            }
          },
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
  
  // Store chart reference on canvas
  canvas.chart = chart;
  
  // Update date inputs
  document.getElementById('startDateGraph').valueAsDate = startDate;
  document.getElementById('endDateGraph').valueAsDate = endDate;
}

// Update item history table
function updateItemHistoryTable(itemId) {
  const historyTable = document.getElementById('itemHistoryTable');
  historyTable.innerHTML = '';
  
  // Filter history for this item
  const itemHistory = inventoryState.historyLog.filter(entry => entry.itemId == itemId);
  
  // Sort by date descending
  itemHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Add to table
  itemHistory.forEach(entry => {
    const date = new Date(entry.timestamp);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${entry.action}</td>
      <td>${entry.quantity}</td>
      <td>${entry.staff}</td>
      <td>${entry.purpose || ''}</td>
    `;
    historyTable.appendChild(row);
  });
}