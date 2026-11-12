/**
 * Hotel The Blue Moon - Staff Operations Hub Logic (admin.js)
 * Bespoke 7-Star Luxury Hotel Management System
 * Vanilla JavaScript (ES6) with Supabase Database & Security RPCs
 */

import { supabaseClient } from './supabaseClient.js';

// Global Dashboard State
const adminState = {
  staffUser: null,
  selectedPosition: null,
  activeTab: 'room-rack',
  managerSubSection: 'staff',
  roomFilter: 'all',
  revenueMasked: false,
  calculatedWalkinTotal: 0,
  currentEmailData: null,
  dashboardData: {
    stats: {},
    rooms: [],
    bookings: [],
    invoices: [],
    logins: [],
    staff: [],
    customers: [],
    pricing: []
  }
};

// Base tariff mapping in Sri Lankan Rupees (LKR)
const BASE_TARIFFS = {
  single: { night: 10000, day: 20000 },
  double: { night: 20000, day: 40000 },
  suite:  { night: 50000, day: 80000 },
  family: { night: 100000, day: 150000 }
};

// Currency Formatter Helper (LKR)
function formatLKR(amount) {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(amount || 0);
  return `LKR ${formatted}`;
}

// Toast Alert Helper
function showToast(message) {
  const toastBody = document.getElementById('toast-body-text');
  const toastBox = document.getElementById('toast-message-box');
  if (toastBody && toastBox && window.bootstrap) {
    toastBody.textContent = message;
    const bsToast = new window.bootstrap.Toast(toastBox, { delay: 3500 });
    bsToast.show();
  }
}

// Live Clock Initializer (Sri Lanka Standard Time - GMT+5:30)
function initLiveClock() {
  const clockElem = document.getElementById('live-clock');
  function updateTime() {
    if (!clockElem) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    clockElem.textContent = `${dateStr} • ${timeStr} (SLST)`;
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// =============================================================================
// 1. POSITION SELECTION & AUTHENTICATION (User Guide Page 4)
// =============================================================================

// User selects staff role / position (Receptionist, Room Keeper, Manager)
window.selectStaffPosition = function(position, defaultUser, defaultPass) {
  adminState.selectedPosition = position;

  // Highlight selected card visually
  document.querySelectorAll('.position-card').forEach(card => card.classList.remove('selected'));

  const roleLabels = {
    'Receptionist': 'Receptionist (Front Desk)',
    'Room Keeper': 'Room Keeper (Housekeeping)',
    'Manager': 'General Manager (Executive)'
  };

  const labelElem = document.getElementById('selected-position-label');
  const btnLabelElem = document.getElementById('login-btn-role-label');
  if (labelElem) labelElem.textContent = roleLabels[position] || position;
  if (btnLabelElem) btnLabelElem.textContent = position.toUpperCase();

  // Pre-fill demo credentials for smooth convenience while allowing full editing
  const userField = document.getElementById('login-username');
  const passField = document.getElementById('login-password');
  if (userField && defaultUser) userField.value = defaultUser;
  if (passField && defaultPass) passField.value = defaultPass;

  // CRITICAL FIX: Ensure submit button is enabled and not stuck on "VERIFYING CREDENTIALS..."
  const submitBtn = document.getElementById('login-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `SIGN IN AS <span id="login-btn-role-label">${position.toUpperCase()}</span>`;
  }

  // Hide selector step, display login form
  document.getElementById('position-selection-step')?.classList.add('d-none');
  document.getElementById('position-login-step')?.classList.remove('d-none');
  document.getElementById('login-error-alert')?.classList.add('d-none');

  if (window.lucide) window.lucide.createIcons();
};

// Reset position selection to return to role cards
window.resetPositionSelection = function() {
  adminState.selectedPosition = null;
  document.getElementById('position-selection-step')?.classList.remove('d-none');
  document.getElementById('position-login-step')?.classList.add('d-none');
  document.getElementById('login-error-alert')?.classList.add('d-none');

  const userField = document.getElementById('login-username');
  const passField = document.getElementById('login-password');
  if (userField) userField.value = '';
  if (passField) passField.value = '';

  const submitBtn = document.getElementById('login-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'SIGN IN';
  }

  if (window.lucide) window.lucide.createIcons();
};

// Staff Login Form Submission Handler
async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('login-username')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const submitBtn = document.getElementById('login-submit-btn');
  const errorAlert = document.getElementById('login-error-alert');

  if (!username || !password) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'VERIFYING CREDENTIALS...';
  }
  if (errorAlert) errorAlert.classList.add('d-none');

  try {
    if (!supabaseClient) {
      throw new Error("Supabase client is not available.");
    }

    // Call server-side authentication RPC with position verification
    const { data, error } = await supabaseClient.rpc('authenticate_staff_member', {
      p_username: username,
      p_password: password,
      p_position: adminState.selectedPosition || null
    });

    if (error || !data || !data.success) {
      const msg = data?.error || error?.message || 'Invalid username or password.';
      if (errorAlert) {
        errorAlert.textContent = msg;
        errorAlert.classList.remove('d-none');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = `SIGN IN AS ${(adminState.selectedPosition || 'STAFF').toUpperCase()}`;
      }
      return;
    }

    // Login successful
    adminState.staffUser = data;
    sessionStorage.setItem('blue_moon_staff', JSON.stringify(data));
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = `SIGN IN AS ${(adminState.selectedPosition || 'STAFF').toUpperCase()}`;
    }
    showDashboardView();
    showToast(`Welcome back, ${data.name}!`);

  } catch (err) {
    console.error("Login exception:", err);
    if (errorAlert) {
      errorAlert.textContent = err.message || 'Authentication error. Please try again.';
      errorAlert.classList.remove('d-none');
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = `SIGN IN AS ${(adminState.selectedPosition || 'STAFF').toUpperCase()}`;
    }
  }
}

// Staff Logout Handler
window.handleStaffLogout = function() {
  sessionStorage.removeItem('blue_moon_staff');
  adminState.staffUser = null;
  adminState.selectedPosition = null;

  const submitBtn = document.getElementById('login-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'SIGN IN';
  }

  document.getElementById('admin-dashboard-view')?.classList.add('d-none');
  document.getElementById('admin-auth-view')?.classList.remove('d-none');
  resetPositionSelection();
};

// =============================================================================
// 2. DASHBOARD VIEW & ROLE-BASED NAVIGATION SETUP
// =============================================================================

function showDashboardView() {
  document.getElementById('admin-auth-view')?.classList.add('d-none');
  document.getElementById('admin-dashboard-view')?.classList.remove('d-none');

  if (!adminState.staffUser) return;

  const user = adminState.staffUser;
  const designation = user.designation || '';
  const isManager = designation.toLowerCase().includes('manager') || designation.toLowerCase().includes('admin');
  const isReception = designation.toLowerCase().includes('reception');
  const isRoomKeeper = designation.toLowerCase().includes('room') || designation.toLowerCase().includes('keeper') || designation.toLowerCase().includes('housekeeping');

  // Update staff identity banners
  const nameElem = document.getElementById('staff-display-name');
  const roleElem = document.getElementById('staff-display-role');
  const badgeElem = document.getElementById('current-role-badge');
  const bannerInfo = document.getElementById('banner-staff-info');
  const lastLoginElem = document.getElementById('staff-last-login');

  if (nameElem) nameElem.textContent = user.name;
  if (roleElem) roleElem.textContent = designation;
  if (badgeElem) badgeElem.textContent = isManager ? 'Manager' : isRoomKeeper ? 'Room Keeper' : 'Receptionist';
  if (bannerInfo) bannerInfo.textContent = `${user.name} (${designation})`;

  if (lastLoginElem && user.last_login_time) {
    const formattedDate = new Date(user.last_login_time).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    lastLoginElem.textContent = formattedDate;
  }

  // Construct Role-Tailored Navigation Tabs
  buildRoleNavigation(isManager, isReception, isRoomKeeper);

  // Load live data from Supabase
  loadDashboardData();
}

function buildRoleNavigation(isManager, isReception, isRoomKeeper) {
  const navContainer = document.getElementById('hubNavTabs');
  if (!navContainer) return;

  let tabsHtml = '';
  let defaultTab = 'room-rack';

  if (isRoomKeeper) {
    // Room Keeper Role (User Guide Page 6)
    defaultTab = 'housekeeping';
    tabsHtml = `
      <li class="nav-item">
        <a class="nav-link active" data-tab="housekeeping" onclick="switchAdminTab('housekeeping')">
          <i data-lucide="sparkles" style="width: 15px;"></i> Housekeeping Queue
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-tab="room-rack" onclick="switchAdminTab('room-rack')">
          <i data-lucide="layout-grid" style="width: 15px;"></i> All Rooms
        </a>
      </li>
    `;
  } else if (isReception) {
    // Receptionist Role (User Guide Page 5)
    defaultTab = 'room-rack';
    tabsHtml = `
      <li class="nav-item">
        <a class="nav-link active" data-tab="room-rack" onclick="switchAdminTab('room-rack')">
          <i data-lucide="layout-grid" style="width: 15px;"></i> Room Rack &amp; Checkout
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-tab="bookings" onclick="switchAdminTab('bookings')">
          <i data-lucide="calendar-check" style="width: 15px;"></i> Reservations Ledger
        </a>
      </li>
    `;
  } else {
    // General Manager Role (User Guide Page 7 & SRS 70-94)
    defaultTab = 'manager';
    tabsHtml = `
      <li class="nav-item">
        <a class="nav-link active" data-tab="manager" onclick="switchAdminTab('manager')">
          <i data-lucide="shield-check" style="width: 15px;"></i> Executive &amp; HR
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-tab="room-rack" onclick="switchAdminTab('room-rack')">
          <i data-lucide="layout-grid" style="width: 15px;"></i> Visual Room Rack
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-tab="bookings" onclick="switchAdminTab('bookings')">
          <i data-lucide="calendar-check" style="width: 15px;"></i> Reservations
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-tab="invoices" onclick="switchAdminTab('invoices')">
          <i data-lucide="receipt" style="width: 15px;"></i> Billing Ledger
        </a>
      </li>
    `;
  }

  navContainer.innerHTML = tabsHtml;
  switchAdminTab(defaultTab);
}

// Tab Switching Handler with RBAC Guard
window.switchAdminTab = function(tabId) {
  const user = adminState.staffUser || {};
  const designation = (user.designation || '').toLowerCase();
  const isManager = designation.includes('manager') || designation.includes('admin');

  // RBAC Tab Protection: Invoices and Executive Suite strictly require Manager privilege
  if ((tabId === 'manager' || tabId === 'invoices') && !isManager) {
    showToast("Access Restricted: Financial Ledger and Executive Suite require General Manager authorization.");
    return;
  }

  adminState.activeTab = tabId;

  // Toggle active class on nav links
  document.querySelectorAll('#hubNavTabs .nav-link').forEach(link => {
    if (link.dataset.tab === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Toggle pane display
  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.classList.add('d-none');
  });

  const activePane = document.getElementById(`pane-${tabId}`);
  if (activePane) {
    activePane.classList.remove('d-none');
  }

  if (window.lucide) window.lucide.createIcons();
};

// =============================================================================
// 3. DATA LOADING & LIVE SYNCHRONIZATION
// =============================================================================

window.loadDashboardData = async function() {
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient.rpc('get_staff_dashboard_data');
    if (error) {
      console.error("Error loading dashboard data:", error);
      showToast("Could not sync latest dashboard data.");
      return;
    }

    if (data && data.success) {
      adminState.dashboardData = data;
      renderMetrics(data.stats);
      renderRoomRack(data.rooms);
      renderBookings(data.bookings);
      renderHousekeepingQueue(data.rooms);
      renderInvoices(data.invoices);
      renderStaffAndLogins(data.staff, data.logins);
      renderSalaries(data.staff);
      renderPricingTable(data.pricing);
      renderCustomers(data.customers);
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
};

// Render KPI Metrics with Role-Based Access Control (PoLP: Principle of Least Privilege)
function renderMetrics(stats) {
  if (!stats) return;
  const availElem = document.getElementById('stat-available');
  const occElem = document.getElementById('stat-occupied');
  const maintElem = document.getElementById('stat-maintenance');

  if (availElem) availElem.textContent = stats.available_rooms ?? 0;
  if (occElem) occElem.textContent = stats.occupied_rooms ?? 0;
  if (maintElem) maintElem.textContent = stats.maintenance_rooms ?? 0;

  // Role-Specific 4th Metric: Ensure strict confidentiality of hotel financial revenue
  const user = adminState.staffUser || {};
  const designation = (user.designation || '').toLowerCase();
  const isManager = designation.includes('manager') || designation.includes('admin');
  const isRoomKeeper = designation.includes('room') || designation.includes('keeper') || designation.includes('housekeeping');

  const titleElem = document.getElementById('stat-kpi-4-title');
  const valueElem = document.getElementById('stat-kpi-4-value');
  const iconContainer = document.getElementById('stat-kpi-4-icon-container');

  if (isRoomKeeper) {
    // Room Keeper: Display turnover readiness rate instead of private revenues
    const totalRooms = stats.total_rooms ?? 6;
    const maintenanceRooms = stats.maintenance_rooms ?? 0;
    const cleanRooms = Math.max(0, totalRooms - maintenanceRooms);
    const readyRate = Math.round((cleanRooms / (totalRooms || 1)) * 100);

    if (titleElem) titleElem.textContent = 'Turnover Readiness';
    if (valueElem) {
      valueElem.innerHTML = `<span class="text-success">${cleanRooms}/${totalRooms}</span> <span class="text-muted fw-normal fs-6">(${readyRate}% Ready)</span>`;
    }
    if (iconContainer) {
      iconContainer.className = 'p-3 bg-success-subtle rounded-3 text-success';
      iconContainer.innerHTML = '<i data-lucide="sparkles" style="width: 24px; height: 24px;"></i>';
    }
  } else if (!isManager) {
    // Receptionist (Front Desk): Display confirmed bookings & guest traffic
    const totalBookings = stats.total_bookings ?? 0;

    if (titleElem) titleElem.textContent = 'Active Reservations';
    if (valueElem) {
      valueElem.innerHTML = `<span class="text-primary">${totalBookings}</span> <span class="text-muted fw-normal fs-6">Stays</span>`;
    }
    if (iconContainer) {
      iconContainer.className = 'p-3 bg-info-subtle rounded-3 text-info';
      iconContainer.innerHTML = '<i data-lucide="calendar-check" style="width: 24px; height: 24px;"></i>';
    }
  } else {
    // General Manager (Executive Only): Confidential Invoiced Revenue with Privacy Toggle
    const rawRevenue = stats.total_revenue ?? 0;
    const formatted = formatLKR(rawRevenue);
    const isMasked = !!adminState.revenueMasked;

    if (titleElem) {
      titleElem.innerHTML = `
        Invoiced Revenue
        <span class="badge bg-danger-subtle text-danger ms-1" style="font-size: 9px; vertical-align: middle;">Confidential</span>
      `;
    }
    if (valueElem) {
      valueElem.innerHTML = `
        <span class="text-dark">${isMasked ? 'LKR ••••••••' : formatted}</span>
        <button type="button" class="btn btn-sm btn-link p-0 text-muted ms-2 align-baseline" onclick="window.toggleRevenuePrivacy()" title="${isMasked ? 'Reveal Revenue' : 'Hide Revenue'}">
          <i data-lucide="${isMasked ? 'eye-off' : 'eye'}" style="width: 15px; height: 15px;"></i>
        </button>
      `;
    }
    if (iconContainer) {
      iconContainer.className = 'p-3 bg-primary-subtle rounded-3 text-primary';
      iconContainer.innerHTML = '<i data-lucide="wallet" style="width: 24px; height: 24px;"></i>';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// Manager Toggle for Revenue Masking / Privacy Mode
window.toggleRevenuePrivacy = function() {
  adminState.revenueMasked = !adminState.revenueMasked;
  if (adminState.dashboardData && adminState.dashboardData.stats) {
    renderMetrics(adminState.dashboardData.stats);
  }
};

// =============================================================================
// 4. ROOM RACK & LIVE CHECKOUT (With Strict Role Privileges)
// =============================================================================

// Live Filter Selector for Room Rack
window.filterRoomRack = function(filter) {
  adminState.roomFilter = filter;

  // Toggle active button style
  document.querySelectorAll('#room-rack-filters button').forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.classList.add('active', 'btn-dark', 'text-warning');
      btn.classList.remove('btn-outline-dark', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning');
    } else {
      btn.classList.remove('active', 'btn-dark', 'text-warning');
      if (btn.dataset.filter === 'available') btn.classList.add('btn-outline-success');
      else if (btn.dataset.filter === 'occupied') btn.classList.add('btn-outline-danger');
      else if (btn.dataset.filter === 'housekeeping') btn.classList.add('btn-outline-warning');
      else btn.classList.add('btn-outline-dark');
    }
  });

  renderRoomRack(adminState.dashboardData.rooms);
};

function renderRoomRack(rooms) {
  const container = document.getElementById('room-rack-grid');
  if (!container) return;

  const allRooms = rooms || [];

  // Update filter counters
  const totalCount = allRooms.length;
  const availCount = allRooms.filter(r => r.status === 'available').length;
  const occCount = allRooms.filter(r => r.status === 'occupied').length;
  const maintCount = allRooms.filter(r => r.status === 'maintenance' || r.status === 'cleaning').length;

  const countAll = document.getElementById('rack-count-all');
  const countAvail = document.getElementById('rack-count-available');
  const countOcc = document.getElementById('rack-count-occupied');
  const countMaint = document.getElementById('rack-count-maintenance');

  if (countAll) countAll.textContent = totalCount;
  if (countAvail) countAvail.textContent = availCount;
  if (countOcc) countOcc.textContent = occCount;
  if (countMaint) countMaint.textContent = maintCount;

  // Apply active filter
  let filteredRooms = allRooms;
  if (adminState.roomFilter === 'available') {
    filteredRooms = allRooms.filter(r => r.status === 'available');
  } else if (adminState.roomFilter === 'occupied') {
    filteredRooms = allRooms.filter(r => r.status === 'occupied');
  } else if (adminState.roomFilter === 'housekeeping') {
    filteredRooms = allRooms.filter(r => r.status === 'maintenance' || r.status === 'cleaning');
  }

  if (filteredRooms.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-5 bg-white rounded-3 border">No rooms found in category "${adminState.roomFilter}".</div>`;
    return;
  }

  const roomNames = {
    single: "Single Deluxe Room",
    double: "Double Ocean Room",
    suite: "Grand Luxury Suite",
    family: "Royal Family Residence"
  };

  const user = adminState.staffUser || {};
  const designation = (user.designation || '').toLowerCase();
  const isManager = designation.includes('manager') || designation.includes('admin');
  const isRoomKeeper = designation.includes('room') || designation.includes('keeper') || designation.includes('housekeeping');
  const isReception = designation.includes('reception') || (!isManager && !isRoomKeeper);

  container.innerHTML = filteredRooms.map(room => {
    const status = room.status || 'available';
    const isOccupied = status === 'occupied';
    const isMaintenance = status === 'maintenance';
    const isCleaning = status === 'cleaning';
    const isAvailable = status === 'available';
    const currentBooking = room.current_booking;

    let badgeClass = 'badge-available';
    let badgeText = 'Available';
    if (isOccupied) {
      badgeClass = 'badge-occupied';
      badgeText = 'Occupied';
    } else if (isMaintenance) {
      badgeClass = 'badge-maintenance';
      badgeText = 'Housekeeping';
    } else if (isCleaning) {
      badgeClass = 'badge-cleaning';
      badgeText = 'Cleaning';
    }

    // Role-specific action block: Principle of Least Privilege
    let actionBlock = '';
    if (isRoomKeeper) {
      // Room Keeper ONLY does cleaning workflow - CANNOT occupy or release rooms arbitrarily
      if (isMaintenance) {
        actionBlock = `
          <div class="pt-3 border-top">
            <button class="btn btn-warning text-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2" onclick="setRoomStatusLive('${room.room_no}', 'cleaning')">
              <i data-lucide="play" style="width: 14px;"></i> Start Cleaning
            </button>
          </div>
        `;
      } else if (isCleaning) {
        actionBlock = `
          <div class="pt-3 border-top">
            <button class="btn btn-success fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2" onclick="setRoomStatusLive('${room.room_no}', 'available')">
              <i data-lucide="check-check" style="width: 14px;"></i> Mark Cleaned &amp; Ready
            </button>
          </div>
        `;
      } else if (isOccupied) {
        actionBlock = `
          <div class="pt-3 border-top text-center">
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-2 px-3 w-100 d-flex align-items-center justify-content-center gap-1">
              <i data-lucide="lock" style="width: 13px;"></i> In-Use (Guest In Residence)
            </span>
          </div>
        `;
      } else {
        actionBlock = `
          <div class="pt-3 border-top text-center">
            <span class="badge bg-success-subtle text-success border border-success-subtle py-2 px-3 w-100 d-flex align-items-center justify-content-center gap-1">
              <i data-lucide="check" style="width: 13px;"></i> Clean &amp; Ready for Guests
            </span>
          </div>
        `;
      }
    } else if (isReception) {
      // Receptionist: Can execute checkout if occupied, or assign walk-in if available, or flag for cleaning
      if (isOccupied && currentBooking) {
        actionBlock = `
          <div class="pt-3 border-top">
            <button class="btn btn-outline-danger btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1" onclick="handleStayAction(${currentBooking.booking_id}, 'checked_out')">
              <i data-lucide="log-out" style="width: 14px;"></i> Execute Checkout
            </button>
          </div>
        `;
      } else if (isAvailable) {
        actionBlock = `
          <div class="pt-3 border-top d-flex justify-content-between align-items-center gap-2">
            <button class="btn btn-sm btn-dark text-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-1" onclick="openWalkinModal()">
              <i data-lucide="user-plus" style="width: 14px;"></i> Walk-in Check-in
            </button>
            <button class="btn btn-sm btn-outline-warning text-nowrap" onclick="setRoomStatusLive('${room.room_no}', 'maintenance')" title="Request Housekeeping">
              <i data-lucide="sparkles" style="width: 14px;"></i> Clean
            </button>
          </div>
        `;
      } else {
        actionBlock = `
          <div class="pt-3 border-top text-center">
            <span class="badge bg-light text-muted border py-2 w-100">
              <i data-lucide="clock" style="width: 13px;"></i> Under Turnover by Housekeeping
            </span>
          </div>
        `;
      }
    } else {
      // General Manager (Executive): Retains full override control
      actionBlock = `
        <div class="pt-3 border-top d-flex justify-content-between align-items-center">
          <span class="small text-muted" style="font-size: 11px;">Manager Override:</span>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-success ${status === 'available' ? 'active' : ''}" onclick="setRoomStatusLive('${room.room_no}', 'available')" title="Mark Available">
              Available
            </button>
            <button class="btn btn-outline-danger ${status === 'occupied' ? 'active' : ''}" onclick="setRoomStatusLive('${room.room_no}', 'occupied')" title="Mark Occupied">
              Occupied
            </button>
            <button class="btn btn-outline-warning ${status === 'maintenance' || status === 'cleaning' ? 'active' : ''}" onclick="setRoomStatusLive('${room.room_no}', 'maintenance')" title="Mark for Cleaning">
              Cleaning
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="col-md-6 col-xl-4">
        <div class="room-card status-${status} p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span class="text-muted text-uppercase fw-bold" style="font-size: 10px;">ROOM</span>
                <h3 class="h3 font-serif fw-bold text-dark mb-0">${room.room_no}</h3>
              </div>
              <span class="room-badge ${badgeClass}">${badgeText}</span>
            </div>

            <span class="small fw-semibold text-secondary d-block mb-3">
              ${roomNames[room.room_type] || room.room_type}
            </span>

            ${isOccupied && currentBooking ? `
              <div class="p-3 bg-light rounded-3 border mb-3 small">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-muted text-uppercase fw-bold" style="font-size: 9px;">Current Guest</span>
                  <span class="badge bg-danger text-uppercase" style="font-size: 9px;">Checked In</span>
                </div>
                <strong class="d-block text-dark fs-6">${currentBooking.guest_name}</strong>
                <span class="text-muted d-block">${currentBooking.check_in_date} → ${currentBooking.check_out_date}</span>
                <span class="font-monospace text-primary" style="font-size: 11px;">${currentBooking.booking_reference}</span>

                ${!isRoomKeeper ? `
                <div class="mt-3 pt-2 border-top">
                  <button class="btn btn-sm btn-outline-danger w-100 fw-bold" onclick="handleStayAction(${currentBooking.booking_id}, 'checked_out')">
                    <i data-lucide="log-out" style="width: 14px;"></i> Execute Checkout
                  </button>
                </div>
                ` : ''}
              </div>
            ` : isMaintenance ? `
              <div class="p-3 bg-warning-subtle text-warning-emphasis rounded-3 border border-warning-subtle mb-3 small">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <i data-lucide="sparkles" style="width: 14px;"></i>
                  <strong>Needs Housekeeping</strong>
                </div>
                <span>Guest has checked out. Turnover required before re-assignment.</span>
              </div>
            ` : isCleaning ? `
              <div class="p-3 bg-primary-subtle text-primary-emphasis rounded-3 border border-primary-subtle mb-3 small">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <i data-lucide="refresh-cw" class="animate-spin" style="width: 14px;"></i>
                  <strong>Cleaning in Progress</strong>
                </div>
                <span>Housekeeping is currently servicing this sanctuary.</span>
              </div>
            ` : `
              <div class="p-3 bg-light rounded-3 text-muted mb-3 small">
                <i data-lucide="check-circle" class="text-success" style="width: 14px;"></i> Clean, sanitized, and ready for front-desk check-in.
              </div>
            `}
          </div>

          ${actionBlock}
        </div>
      </div>
    `;
  }).join('');
}

// Live Room Status Modifier
window.setRoomStatusLive = async function(roomNo, status) {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.rpc('set_room_status', {
      p_room_no: roomNo,
      p_status: status
    });
    if (error) {
      alert("Could not update room status: " + error.message);
      return;
    }
    showToast(`Room ${roomNo} status set to "${status}".`);
    loadDashboardData();
  } catch (err) {
    console.error("Room status update error:", err);
  }
};

// =============================================================================
// 5. HOUSEKEEPING QUEUE (User Guide Page 6: Room Keeper Dashboard)
// =============================================================================

function renderHousekeepingQueue(rooms) {
  const container = document.getElementById('housekeeping-queue-grid');
  if (!container) return;

  const queue = (rooms || []).filter(r => r.status === 'maintenance' || r.status === 'cleaning');

  if (queue.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="p-5 text-center bg-white rounded-3 border shadow-sm">
          <div class="p-3 bg-success-subtle rounded-circle d-inline-flex text-success mb-3">
            <i data-lucide="sparkles" style="width: 32px; height: 32px;"></i>
          </div>
          <h4 class="h5 font-serif fw-bold text-dark">All Rooms Cleaned &amp; Ready</h4>
          <p class="text-muted small max-w-md mx-auto mb-0">
            No rooms currently pending turnover. All guest sanctuaries are sanitized and ready for check-in.
          </p>
        </div>
      </div>
    `;
    return;
  }

  const roomNames = {
    single: "Single Deluxe Room",
    double: "Double Ocean Room",
    suite: "Grand Luxury Suite",
    family: "Royal Family Residence"
  };

  container.innerHTML = queue.map(room => {
    const isCleaning = room.status === 'cleaning';

    return `
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100 ${isCleaning ? 'border-primary' : 'border-warning'}" style="border-top: 5px solid ${isCleaning ? 'var(--color-cleaning)' : 'var(--color-maintenance)'} !important;">
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span class="text-muted text-uppercase fw-bold" style="font-size: 10px;">TURNOVER QUEUE</span>
                  <h3 class="h3 font-serif fw-bold text-dark mb-0">Room ${room.room_no}</h3>
                </div>
                <span class="badge ${isCleaning ? 'bg-primary' : 'bg-warning text-dark'} text-uppercase fw-bold" style="font-size: 10px;">
                  ${isCleaning ? 'Cleaning In Progress' : 'Needs Cleaning'}
                </span>
              </div>

              <span class="small fw-semibold text-secondary d-block mb-3">
                ${roomNames[room.room_type] || room.room_type}
              </span>

              <div class="p-3 bg-light rounded-3 border mb-3 small">
                <span class="text-muted text-uppercase fw-bold d-block mb-1" style="font-size: 9px;">Standard Operating Checklist</span>
                <div class="d-flex align-items-center gap-2 text-secondary mb-1">
                  <i data-lucide="check" class="text-success" style="width: 14px;"></i> Bed linens &amp; pillowcase renewal
                </div>
                <div class="d-flex align-items-center gap-2 text-secondary mb-1">
                  <i data-lucide="check" class="text-success" style="width: 14px;"></i> Luxury toiletries &amp; towel restock
                </div>
                <div class="d-flex align-items-center gap-2 text-secondary">
                  <i data-lucide="check" class="text-success" style="width: 14px;"></i> Sanitize bath, minibar &amp; sea balcony
                </div>
              </div>
            </div>

            <div class="pt-3 border-top">
              ${!isCleaning ? `
                <button class="btn btn-warning text-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2" onclick="setRoomStatusLive('${room.room_no}', 'cleaning')">
                  <i data-lucide="play" style="width: 16px;"></i> Start Cleaning
                </button>
              ` : `
                <button class="btn btn-success fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2" onclick="setRoomStatusLive('${room.room_no}', 'available')">
                  <i data-lucide="check-circle" style="width: 16px;"></i> Mark Available
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// =============================================================================
// 6. RESERVATION LEDGER & EMAIL CONFIRMATION DISPATCH (User Guide Page 5)
// =============================================================================

function renderBookings(bookings) {
  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;

  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No reservations recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const status = b.booking_status || 'confirmed';
    let badgeClass = 'bg-secondary';
    let badgeText = status.toUpperCase();

    if (status === 'confirmed') {
      badgeClass = 'bg-primary';
      badgeText = 'Confirmed';
    } else if (status === 'checked_in') {
      badgeClass = 'bg-success';
      badgeText = 'Checked-in';
    } else if (status === 'checked_out') {
      badgeClass = 'bg-dark';
      badgeText = 'Checked-out';
    } else if (status === 'cancelled') {
      badgeClass = 'bg-danger';
      badgeText = 'Cancelled';
    } else if (status === 'pending') {
      badgeClass = 'bg-warning text-dark';
      badgeText = 'Pending Approval';
    }

    const durationText = b.period === 'day' ? '24H Flex Day' : 'Night Stay';

    return `
      <tr data-search="${(b.booking_reference + ' ' + b.guest_name + ' ' + (b.room_no || '')).toLowerCase()}">
        <td>
          <span class="font-monospace fw-bold text-dark">${b.booking_reference}</span>
        </td>
        <td>
          <strong class="d-block text-dark">${b.guest_name}</strong>
          <span class="small text-muted">${b.guest_email || 'No email'} &bull; ${b.guest_phone || 'No phone'}</span>
        </td>
        <td>
          <span class="badge bg-light text-dark border">Room ${b.room_no || 'Unassigned'}</span>
        </td>
        <td class="small">
          <span class="d-block">${b.check_in_date}</span>
          <span class="text-muted">→ ${b.check_out_date}</span>
        </td>
        <td class="small text-muted">${durationText}</td>
        <td class="fw-bold font-serif text-dark">${formatLKR(b.invoice_amount)}</td>
        <td>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            ${status === 'pending' ? `
              <button class="btn btn-outline-primary" onclick="handleStayAction(${b.booking_id}, 'confirmed')" title="Confirm Reservation">
                Confirm
              </button>
              <button class="btn btn-outline-danger" onclick="handleStayAction(${b.booking_id}, 'cancelled')" title="Reject Reservation">
                Reject
              </button>
            ` : ''}

            ${status === 'confirmed' ? `
              <button class="btn btn-outline-success" onclick="handleStayAction(${b.booking_id}, 'checked_in')" title="Check-in Guest">
                Check In
              </button>
            ` : ''}

            ${status === 'checked_in' ? `
              <button class="btn btn-outline-warning" onclick="handleStayAction(${b.booking_id}, 'checked_out')" title="Check-out Guest &amp; Notify Housekeeping">
                Check Out
              </button>
            ` : ''}

            <button class="btn btn-outline-primary" onclick="sendEmailConfirmation(${b.booking_id})" title="Send Official Confirmation Email (100% Free)">
              <i data-lucide="mail" style="width: 14px;"></i>
            </button>

            <button class="btn btn-outline-secondary" onclick="viewInvoiceFromBooking(${b.booking_id})" title="Print Invoice">
              <i data-lucide="receipt" style="width: 14px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Filter Bookings by Search Term
window.filterBookingsTable = function() {
  const query = document.getElementById('booking-search-input')?.value?.toLowerCase().trim();
  const rows = document.querySelectorAll('#bookings-table-body tr');
  rows.forEach(row => {
    const searchData = row.dataset.search || '';
    if (!query || searchData.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
};

// 100% Free Official Guest Email Confirmation Dispatcher
window.sendEmailConfirmation = function(bookingId) {
  const booking = adminState.dashboardData.bookings.find(b => b.booking_id === bookingId);
  if (!booking) return;

  const roomNames = {
    single: "Single Deluxe Room",
    double: "Double Ocean Room",
    suite: "Grand Luxury Suite",
    family: "Royal Family Residence"
  };
  const roomTitle = roomNames[booking.room_type] || `Room ${booking.room_no || 'TBD'}`;

  const subject = `Official Reservation Confirmation - Hotel The Blue Moon (${booking.booking_reference})`;

  const emailBody = 
`Dear ${booking.guest_name},

Thank you for choosing Hotel The Blue Moon, Unawatuna, Sri Lanka. We are pleased to confirm your upcoming luxury resort reservation.

RESERVATION DETAILS:
• Booking Reference: ${booking.booking_reference}
• Assigned Room: Room ${booking.room_no || 'TBD'} (${roomTitle})
• Check-In Date: ${booking.check_in_date}
• Check-Out Date: ${booking.check_out_date}
• Stay Package: ${booking.period === 'day' ? 'Full Day 24H Flex Stay' : 'One Night Stay'}
• Total Invoiced Amount: ${formatLKR(booking.invoice_amount)} (Inclusive of 18% VAT & Service Charge)

RESORT POLICIES & CHECK-IN:
• Check-in commences from 2:00 PM standard resort hours.
• Please present a valid National Identity Card (NIC) or Passport upon arrival at front desk.
• Complimentary high-speed Wi-Fi, swimming pool access, and seaside amenities are included throughout your stay.

Should you require airport transfers or custom dining reservations, please reply directly to this email.

Warm regards,
Front Desk & Reservations Concierge
Hotel The Blue Moon Resort & Spa
2855 Beach Side Rd, Unawatuna, Galle, Southern Province, Sri Lanka
Tel: +94 717 224 755 | Web: https://hotel-the-blue-moon-web.vercel.app`;

  adminState.currentEmailData = {
    to: booking.guest_email || 'guest@example.com',
    subject: subject,
    body: emailBody
  };

  // Populate preview modal
  const toField = document.getElementById('email-modal-to');
  const subjField = document.getElementById('email-modal-subject');
  const previewBox = document.getElementById('email-modal-preview');

  if (toField) toField.value = adminState.currentEmailData.to;
  if (subjField) subjField.value = adminState.currentEmailData.subject;
  if (previewBox) previewBox.textContent = adminState.currentEmailData.body;

  const modalElem = document.getElementById('emailModal');
  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

window.dispatchGuestEmail = function() {
  if (!adminState.currentEmailData) return;
  const { to, subject, body } = adminState.currentEmailData;

  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');

  const modalElem = document.getElementById('emailModal');
  if (modalElem && window.bootstrap) {
    const bsModal = window.bootstrap.Modal.getInstance(modalElem);
    if (bsModal) bsModal.hide();
  }

  showToast(`Confirmation email dispatched to ${to}!`);
};

window.copyEmailContent = function() {
  if (!adminState.currentEmailData) return;
  navigator.clipboard.writeText(adminState.currentEmailData.body).then(() => {
    showToast("Email template copied to clipboard!");
  }).catch(() => {
    alert("Could not copy to clipboard.");
  });
};

// Check-in / Check-out / Confirmation Action Handler
window.handleStayAction = async function(bookingId, newStatus) {
  if (!supabaseClient) return;

  const actionLabels = {
    'confirmed': 'Confirm Reservation',
    'checked_in': 'Check-In Guest & Hand Over Key',
    'checked_out': 'Check-Out Guest & Release Room to Housekeeping',
    'cancelled': 'Reject / Cancel Reservation'
  };

  const actionName = actionLabels[newStatus] || newStatus;
  if (!confirm(`Are you sure you want to execute: ${actionName}?`)) return;

  try {
    const { data, error } = await supabaseClient.rpc('update_stay_status', {
      p_booking_id: bookingId,
      p_new_status: newStatus
    });

    if (error) {
      alert("Could not update status: " + error.message);
      return;
    }

    if (newStatus === 'checked_out') {
      showToast(`Guest checked out! Room ${data?.room_no} has been queued for Housekeeping.`);
    } else {
      showToast(`Reservation successfully updated to "${newStatus.replace('_', ' ')}".`);
    }

    loadDashboardData();
  } catch (err) {
    console.error("Stay action error:", err);
  }
};

// =============================================================================
// 7. FRONT-DESK WALK-IN BOOKINGS (User Guide Page 5: Add New Booking)
// =============================================================================

window.openWalkinModal = function() {
  const roomSelect = document.getElementById('walkin-room');
  if (!roomSelect) return;

  const availableRooms = (adminState.dashboardData.rooms || []).filter(r => r.status === 'available');

  if (availableRooms.length === 0) {
    alert("Notice: All rooms are currently occupied or in turnover. Please inspect room rack or expedite housekeeping.");
    return;
  }

  const roomNames = {
    single: "Single Deluxe Room",
    double: "Double Ocean Room",
    suite: "Grand Luxury Suite",
    family: "Royal Family Residence"
  };

  roomSelect.innerHTML = availableRooms.map(r => `
    <option value="${r.room_no}" data-type="${r.room_type}">
      Room ${r.room_no} (${roomNames[r.room_type] || r.room_type})
    </option>
  `).join('');

  // Set default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkinInput = document.getElementById('walkin-checkin');
  const checkoutInput = document.getElementById('walkin-checkout');

  if (checkinInput) checkinInput.value = today.toISOString().split('T')[0];
  if (checkoutInput) checkoutInput.value = tomorrow.toISOString().split('T')[0];

  calculateWalkinTariff();

  const modalElem = document.getElementById('walkinModal');
  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

window.calculateWalkinTariff = function() {
  const roomSelect = document.getElementById('walkin-room');
  const periodSelect = document.getElementById('walkin-period');
  const checkinInput = document.getElementById('walkin-checkin');
  const checkoutInput = document.getElementById('walkin-checkout');
  const totalDisplay = document.getElementById('walkin-calculated-total');

  if (!roomSelect || !periodSelect || !checkinInput || !checkoutInput || !totalDisplay) return;

  const selectedOption = roomSelect.options[roomSelect.selectedIndex];
  const roomType = selectedOption?.dataset?.type || 'single';
  const period = periodSelect.value || 'night';

  const checkIn = new Date(checkinInput.value);
  const checkOut = new Date(checkoutInput.value);

  let duration = 1;
  if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
    const diffDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    duration = diffDays > 0 ? diffDays : 1;
  }

  const basePrice = (BASE_TARIFFS[roomType] && BASE_TARIFFS[roomType][period]) || 10000;
  const subtotal = basePrice * duration;
  const totalWithTax = Math.round(subtotal * 1.18);

  adminState.calculatedWalkinTotal = totalWithTax;
  totalDisplay.textContent = formatLKR(totalWithTax);
};

async function handleWalkinSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('walkin-name')?.value?.trim();
  const nic = document.getElementById('walkin-nic')?.value?.trim();
  const email = document.getElementById('walkin-email')?.value?.trim();
  const phone = document.getElementById('walkin-phone')?.value?.trim();
  const address = document.getElementById('walkin-address')?.value?.trim() || 'Hotel Walk-in Guest';
  const roomNo = document.getElementById('walkin-room')?.value;
  const period = document.getElementById('walkin-period')?.value || 'night';
  const checkIn = document.getElementById('walkin-checkin')?.value;
  const checkOut = document.getElementById('walkin-checkout')?.value;
  const submitBtn = document.getElementById('walkin-submit-btn');

  if (!name || !nic || !email || !phone || !roomNo || !checkIn || !checkOut) {
    alert("Please fill in all required fields.");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'CONFIRMING CHECK-IN...';
  }

  try {
    const { data, error } = await supabaseClient.rpc('create_walkin_booking', {
      p_name: name,
      p_national_id: nic,
      p_address: address,
      p_email: email,
      p_phone: phone,
      p_room_no: roomNo,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_period: period,
      p_total_price: adminState.calculatedWalkinTotal || 11800
    });

    if (error || !data || !data.success) {
      alert("Could not create walk-in booking: " + (data?.error || error?.message || 'Database error'));
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Check-in & Bill';
      }
      return;
    }

    // Close walkin modal
    const modalElem = document.getElementById('walkinModal');
    if (modalElem && window.bootstrap) {
      const bsModal = window.bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    }

    showToast(`Walk-in guest ${name} checked into Room ${roomNo}! Reference: ${data.booking_reference}`);

    // Reset form
    document.getElementById('walkin-form')?.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Check-in & Bill';
    }

    loadDashboardData();

  } catch (err) {
    console.error("Walk-in booking error:", err);
    alert("An unexpected error occurred. Please try again.");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Check-in & Bill';
    }
  }
}

// =============================================================================
// 8. EXECUTIVE REPORTING & CSV EXPORT (User Guide Page 7: General Manager)
// =============================================================================

// Generate Monthly Performance Report (Calls Supabase RPC: generate_monthly_report)
window.triggerMonthlyReport = async function(year, month) {
  if (!supabaseClient) return;

  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month || (now.getMonth() + 1);

  try {
    const { data, error } = await supabaseClient.rpc('generate_monthly_report', {
      p_year: targetYear,
      p_month: targetMonth
    });

    if (error || !data || !data.success) {
      alert("Could not generate monthly report: " + (error?.message || 'Database error'));
      return;
    }

    // Populate Report Modal elements (Directly matching User Guide Page 7)
    document.getElementById('rep-month-name').textContent = data.month_name || 'November 2026';
    document.getElementById('rep-total-earnings').textContent = formatLKR(data.total_earnings);
    document.getElementById('rep-total-bookings').textContent = data.total_bookings ?? 0;
    document.getElementById('rep-unique-customers').textContent = data.unique_customers ?? 0;
    document.getElementById('rep-subtotal').textContent = formatLKR(data.subtotal);
    document.getElementById('rep-tax').textContent = formatLKR(data.tax_amount);
    document.getElementById('rep-gross').textContent = formatLKR(data.total_earnings);

    const generatedDateStr = new Date(data.generated_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    document.getElementById('rep-generated-at').textContent = `${generatedDateStr} (SLST)`;

    // Open Report Modal
    const modalElem = document.getElementById('monthlyReportModal');
    if (modalElem && window.bootstrap) {
      const bsModal = new window.bootstrap.Modal(modalElem);
      bsModal.show();
    }

  } catch (err) {
    console.error("Monthly report error:", err);
    alert("Error generating monthly report.");
  }
};

// 1-Click "Export Ledger to Excel / CSV" (100% Free Client-Side)
window.exportLedgerCSV = function() {
  const bookings = adminState.dashboardData.bookings || [];
  if (bookings.length === 0) {
    alert("No reservation records available to export.");
    return;
  }

  const headers = ["Booking Reference", "Guest Name", "Email", "Phone", "Room No", "Check In", "Check Out", "Period", "Amount (LKR)", "Status", "Date Created"];
  const rows = bookings.map(b => [
    `"${b.booking_reference}"`,
    `"${(b.guest_name || '').replace(/"/g, '""')}"`,
    `"${b.guest_email || ''}"`,
    `"${b.guest_phone || ''}"`,
    `"${b.room_no || ''}"`,
    `"${b.check_in_date || ''}"`,
    `"${b.check_out_date || ''}"`,
    `"${b.period || ''}"`,
    b.invoice_amount || 0,
    `"${b.booking_status || ''}"`,
    `"${b.created_at || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `hotel-the-blue-moon-reservations-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Accounting ledger exported to CSV file successfully!");
};

// =============================================================================
// 9. MANAGER EXECUTIVE SUITE (SRS Pages 70-94: Staff, Salaries, Tariffs, Guests, Audits)
// =============================================================================

// Manager Sub-Navigation Switcher
window.switchManagerSubSection = function(subId) {
  adminState.managerSubSection = subId;
  const subSections = ['staff', 'salaries', 'pricing', 'customers', 'audit'];
  subSections.forEach(id => {
    const secElem = document.getElementById(`manager-sec-${id}`);
    const tabElem = document.getElementById(`subtab-${id}`);
    if (id === subId) {
      if (secElem) secElem.classList.remove('d-none');
      if (tabElem) tabElem.classList.add('active');
    } else {
      if (secElem) secElem.classList.add('d-none');
      if (tabElem) tabElem.classList.remove('active');
    }
  });

  if (window.lucide) window.lucide.createIcons();
};

// Render Staff Roster & Login Audit History (SRS Pages 88-94)
function renderStaffAndLogins(staff, logins) {
  const staffTbody = document.getElementById('staff-table-body');
  const loginsTbody = document.getElementById('login-history-table-body');

  if (staffTbody) {
    if (!staff || staff.length === 0) {
      staffTbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No staff records found.</td></tr>`;
    } else {
      staffTbody.innerHTML = staff.map(emp => {
        const isActive = emp.is_active !== false;
        const statusBadge = isActive
          ? `<span class="badge bg-success-subtle text-success border border-success-subtle">Active</span>`
          : `<span class="badge bg-secondary-subtle text-secondary border">Deactivated</span>`;

        return `
          <tr data-emp-id="${emp.employee_id}" data-search="${(emp.name + ' ' + (emp.username || '') + ' ' + (emp.designation || '') + ' ' + (emp.national_id || '')).toLowerCase()}">
            <td>
              <span class="badge bg-light text-muted border font-monospace">EMP-${String(emp.employee_id).padStart(3, '0')}</span>
            </td>
            <td>
              <strong class="d-block text-dark">${emp.name}</strong>
              <span class="text-muted small font-monospace">@${emp.username || 'unassigned'}</span>
            </td>
            <td>
              <span class="badge bg-light text-dark border">${emp.designation || 'Staff'}</span>
            </td>
            <td class="small">
              <span class="d-block font-monospace">${emp.national_id || 'N/A'}</span>
              <span class="text-muted">DOB: ${emp.date_of_birth || 'N/A'}</span>
            </td>
            <td class="small">
              <span class="d-block">${emp.email || 'N/A'}</span>
              <span class="text-muted">${emp.phone || 'N/A'}</span>
            </td>
            <td class="text-end fw-bold font-serif text-success">
              ${formatLKR(emp.basic_salary)}
            </td>
            <td class="text-center">
              ${statusBadge}
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-dark" onclick="openEmployeeModal('edit', ${emp.employee_id})" title="Edit Staff Profile">
                  <i data-lucide="edit-3" style="width: 14px;"></i> Edit
                </button>
                ${emp.employee_id !== 1 && isActive ? `
                  <button class="btn btn-outline-danger" onclick="handleRemoveEmployee(${emp.employee_id}, '${emp.name.replace(/'/g, "\\'")}')" title="Deactivate Employee">
                    <i data-lucide="user-x" style="width: 14px;"></i>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  if (loginsTbody) {
    if (!logins || logins.length === 0) {
      loginsTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No login history recorded.</td></tr>`;
    } else {
      loginsTbody.innerHTML = logins.map(log => {
        const timeStr = log.login_time ? new Date(log.login_time).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) : 'N/A';
        return `
          <tr>
            <td><strong class="text-dark">${log.employee_name || 'Staff Member'}</strong></td>
            <td><span class="badge bg-light text-dark border">${log.designation || 'Staff'}</span></td>
            <td class="text-end text-muted font-monospace">${timeStr}</td>
            <td class="text-center">
              <span class="badge bg-success-subtle text-success border border-success-subtle">
                <i data-lucide="shield-check" style="width: 12px;"></i> Verified
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// Staff Search Filter
window.searchEmployees = function(query) {
  const q = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#staff-table-body tr');
  rows.forEach(r => {
    const s = r.dataset.search || '';
    r.style.display = (!q || s.includes(q)) ? '' : 'none';
  });
};

// Open Staff Modal for Add or Edit
window.openEmployeeModal = function(mode, empId) {
  const modalElem = document.getElementById('employeeModal');
  const titleElem = document.getElementById('employee-modal-title');
  const formMode = document.getElementById('emp-form-mode');
  const idField = document.getElementById('emp-id');
  const passHelp = document.getElementById('emp-password-help');
  const passLabel = document.getElementById('emp-password-label');
  const passInput = document.getElementById('emp-password');

  if (mode === 'add') {
    titleElem.textContent = 'Add New Staff Member';
    formMode.value = 'add';
    idField.value = '';
    document.getElementById('employee-form')?.reset();
    if (passLabel) passLabel.textContent = 'Password *';
    if (passHelp) passHelp.textContent = 'Min 6 characters. Blowfish salted hash.';
    if (passInput) passInput.required = true;
  } else {
    titleElem.textContent = 'Edit Staff Member Profile';
    formMode.value = 'edit';
    idField.value = empId;
    const emp = (adminState.dashboardData.staff || []).find(e => e.employee_id === empId);
    if (!emp) return;

    document.getElementById('emp-name').value = emp.name || '';
    document.getElementById('emp-designation').value = emp.designation || 'Front Desk Receptionist';
    document.getElementById('emp-username').value = emp.username || '';
    document.getElementById('emp-nic').value = emp.national_id || '';
    document.getElementById('emp-dob').value = emp.date_of_birth || '';
    document.getElementById('emp-email').value = emp.email || '';
    document.getElementById('emp-phone').value = emp.phone || '';
    document.getElementById('emp-salary').value = emp.basic_salary || 50000;
    document.getElementById('emp-address').value = emp.address || '';
    if (passInput) {
      passInput.value = '';
      passInput.required = false;
    }
    if (passLabel) passLabel.textContent = 'New Password (Optional)';
    if (passHelp) passHelp.textContent = 'Leave blank to preserve existing password.';
  }

  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

// Save Staff Profile (Add or Edit)
window.saveEmployee = async function(e) {
  e.preventDefault();
  if (!supabaseClient) return;

  const mode = document.getElementById('emp-form-mode')?.value || 'add';
  const empId = parseInt(document.getElementById('emp-id')?.value, 10);
  const name = document.getElementById('emp-name')?.value?.trim();
  const designation = document.getElementById('emp-designation')?.value;
  const username = document.getElementById('emp-username')?.value?.trim();
  const password = document.getElementById('emp-password')?.value;
  const nic = document.getElementById('emp-nic')?.value?.trim();
  const dob = document.getElementById('emp-dob')?.value || null;
  const email = document.getElementById('emp-email')?.value?.trim();
  const phone = document.getElementById('emp-phone')?.value?.trim();
  const salary = parseFloat(document.getElementById('emp-salary')?.value) || 0;
  const address = document.getElementById('emp-address')?.value?.trim() || '';
  const submitBtn = document.getElementById('emp-submit-btn');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'SAVING...';
  }

  try {
    let res;
    if (mode === 'add') {
      res = await supabaseClient.rpc('add_employee', {
        p_name: name,
        p_designation: designation,
        p_username: username,
        p_password: password,
        p_national_id: nic,
        p_dob: dob,
        p_email: email,
        p_phone: phone,
        p_basic_salary: salary,
        p_address: address
      });
    } else {
      res = await supabaseClient.rpc('update_employee', {
        p_employee_id: empId,
        p_name: name,
        p_designation: designation,
        p_username: username,
        p_password: password || null,
        p_national_id: nic,
        p_dob: dob,
        p_email: email,
        p_phone: phone,
        p_basic_salary: salary,
        p_address: address
      });
    }

    if (res.error || !res.data || !res.data.success) {
      alert("Could not save staff profile: " + (res.data?.error || res.error?.message || 'Database error'));
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Staff Profile';
      }
      return;
    }

    // Close modal
    const modalElem = document.getElementById('employeeModal');
    if (modalElem && window.bootstrap) {
      const bsModal = window.bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    }

    showToast(`Staff member "${name}" saved successfully!`);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Staff Profile';
    }

    loadDashboardData();
  } catch (err) {
    console.error("Save employee error:", err);
    alert("Unexpected error saving employee.");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Staff Profile';
    }
  }
};

// Deactivate / Soft-remove Staff Member
window.handleRemoveEmployee = async function(empId, empName) {
  if (!confirm(`Are you sure you want to deactivate staff member "${empName}"?\nTheir system login access will be immediately revoked.`)) return;

  try {
    const { data, error } = await supabaseClient.rpc('remove_employee', {
      p_employee_id: empId
    });

    if (error || !data || !data.success) {
      alert("Could not deactivate employee: " + (data?.error || error?.message || 'Error'));
      return;
    }

    showToast(`Staff member "${empName}" deactivated.`);
    loadDashboardData();
  } catch (err) {
    console.error("Deactivate error:", err);
    alert("Could not deactivate employee.");
  }
};

// =============================================================================
// 10. SALARY & PAYROLL ADMINISTRATION (SRS Pages 84-87)
// =============================================================================

function renderSalaries(staff) {
  const tbody = document.getElementById('salaries-table-body');
  if (!tbody) return;

  if (!staff || staff.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No staff payroll records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = staff.filter(e => e.is_active !== false).map(emp => `
    <tr>
      <td><span class="badge bg-light text-muted border font-monospace">EMP-${String(emp.employee_id).padStart(3, '0')}</span></td>
      <td><strong class="text-dark">${emp.name}</strong></td>
      <td><span class="badge bg-light text-dark border">${emp.designation}</span></td>
      <td class="text-end fw-bold font-serif text-success fs-6">${formatLKR(emp.basic_salary)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" onclick="openSalaryModal(${emp.employee_id}, '${emp.name.replace(/'/g, "\\'")}', ${emp.basic_salary || 0})">
          <i data-lucide="edit-3" style="width: 14px;"></i> Edit Salary
        </button>
      </td>
    </tr>
  `).join('');
}

window.openSalaryModal = function(empId, empName, basicSalary) {
  document.getElementById('sal-emp-id').value = empId;
  document.getElementById('sal-emp-name').value = empName;
  document.getElementById('sal-amount').value = basicSalary || 50000;

  const modalElem = document.getElementById('salaryModal');
  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

window.saveSalary = async function(e) {
  e.preventDefault();
  if (!supabaseClient) return;

  const empId = parseInt(document.getElementById('sal-emp-id')?.value, 10);
  const amount = parseFloat(document.getElementById('sal-amount')?.value) || 0;

  try {
    const { data, error } = await supabaseClient.rpc('update_employee_salary', {
      p_employee_id: empId,
      p_basic_salary: amount
    });

    if (error || !data || !data.success) {
      alert("Could not update salary: " + (data?.error || error?.message || 'Error'));
      return;
    }

    const modalElem = document.getElementById('salaryModal');
    if (modalElem && window.bootstrap) {
      const bsModal = window.bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    }

    showToast(`Basic salary updated to ${formatLKR(amount)}.`);
    loadDashboardData();
  } catch (err) {
    console.error("Salary save error:", err);
    alert("Error saving salary.");
  }
};

window.generateSalaryReport = function() {
  const staff = (adminState.dashboardData.staff || []).filter(e => e.is_active !== false);
  const count = staff.length;
  const total = staff.reduce((acc, e) => acc + (parseFloat(e.basic_salary) || 0), 0);
  const avg = count > 0 ? Math.round(total / count) : 0;

  document.getElementById('salrep-count').textContent = `${count} Active Personnel`;
  document.getElementById('salrep-total').textContent = formatLKR(total);
  document.getElementById('salrep-avg').textContent = formatLKR(avg);

  const now = new Date();
  document.getElementById('salrep-timestamp').textContent = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour12: false })} (SLST)`;

  const modalElem = document.getElementById('salaryReportModal');
  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

// =============================================================================
// 11. ROOM RATES & TARIFF SCHEDULE (SRS Pages 80-83)
// =============================================================================

function renderPricingTable(pricing) {
  const tbody = document.getElementById('pricing-table-body');
  if (!tbody) return;

  let list = pricing || [];
  if (list.length === 0) {
    const rooms = adminState.dashboardData.rooms || [
      { room_no: '101', room_type: 'single' },
      { room_no: '102', room_type: 'single' },
      { room_no: '201', room_type: 'double' },
      { room_no: '202', room_type: 'double' },
      { room_no: '301', room_type: 'suite' },
      { room_no: '401', room_type: 'family' }
    ];
    list = [];
    rooms.forEach(r => {
      list.push({ room_no: r.room_no, room_type: r.room_type, period: 'night', price: BASE_TARIFFS[r.room_type]?.night || 10000 });
      list.push({ room_no: r.room_no, room_type: r.room_type, period: 'day', price: BASE_TARIFFS[r.room_type]?.day || 20000 });
    });
  }

  const roomNames = {
    single: "Single Deluxe Room",
    double: "Double Ocean Room",
    suite: "Grand Luxury Suite",
    family: "Royal Family Residence"
  };

  list.sort((a, b) => a.room_no.localeCompare(b.room_no) || a.period.localeCompare(b.period));

  tbody.innerHTML = list.map(item => {
    const roomType = item.room_type || (item.room_no.startsWith('1') ? 'single' : item.room_no.startsWith('2') ? 'double' : item.room_no.startsWith('3') ? 'suite' : 'family');
    const periodLabel = item.period === 'night' ? 'Standard Nightly Stay' : '24-Hour Flex Day Stay';
    const periodBadge = item.period === 'night'
      ? `<span class="badge bg-primary-subtle text-primary border border-primary-subtle">Night Rate</span>`
      : `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">24H Flex Day</span>`;

    return `
      <tr>
        <td><strong class="font-serif fs-6 text-dark">Room ${item.room_no}</strong></td>
        <td><span class="text-secondary small fw-semibold">${roomNames[roomType] || roomType}</span></td>
        <td>${periodBadge} <span class="small text-muted ms-1">${periodLabel}</span></td>
        <td class="text-end fw-bold font-serif text-dark fs-6">${formatLKR(item.price)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark" onclick="openPriceModal('${item.room_no}', '${item.period}', ${item.price})">
            <i data-lucide="tag" style="width: 14px;"></i> Adjust Tariff
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.openPriceModal = function(roomNo, period, currentPrice) {
  document.getElementById('price-room-no').value = roomNo;
  document.getElementById('price-period').value = period;
  document.getElementById('price-label').value = `Room ${roomNo} • ${period === 'night' ? 'Nightly Stay' : '24H Flex Day'}`;
  document.getElementById('price-amount').value = currentPrice || 10000;

  const modalElem = document.getElementById('priceModal');
  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

window.saveRoomPrice = async function(e) {
  e.preventDefault();
  if (!supabaseClient) return;

  const roomNo = document.getElementById('price-room-no')?.value;
  const period = document.getElementById('price-period')?.value;
  const price = parseFloat(document.getElementById('price-amount')?.value) || 0;

  try {
    const { data, error } = await supabaseClient.rpc('update_room_pricing', {
      p_room_no: roomNo,
      p_period: period,
      p_price: price
    });

    if (error || !data || !data.success) {
      alert("Could not update pricing: " + (data?.error || error?.message || 'Error'));
      return;
    }

    const modalElem = document.getElementById('priceModal');
    if (modalElem && window.bootstrap) {
      const bsModal = window.bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    }

    showToast(`Tariff for Room ${roomNo} (${period}) updated to ${formatLKR(price)}.`);
    loadDashboardData();
  } catch (err) {
    console.error("Save price error:", err);
    alert("Error updating price.");
  }
};

// =============================================================================
// 12. GUEST CUSTOMER DIRECTORY (SRS Pages 74-80)
// =============================================================================

function renderCustomers(customers) {
  const custTbody = document.getElementById('customers-table-body');
  if (!custTbody) return;

  if (!customers || customers.length === 0) {
    custTbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No registered guest records found.</td></tr>`;
    return;
  }

  custTbody.innerHTML = customers.map(c => `
    <tr data-cust-id="${c.customer_id}" data-search="${(c.name + ' ' + (c.national_id || '') + ' ' + (c.email || '') + ' ' + (c.phone || '')).toLowerCase()}">
      <td><span class="badge bg-light text-muted border font-monospace">CUST-${String(c.customer_id).padStart(4, '0')}</span></td>
      <td><strong class="text-dark">${c.name}</strong></td>
      <td><span class="font-monospace text-secondary">${c.national_id || 'N/A'}</span></td>
      <td class="small">
        <span class="d-block">${c.email || 'N/A'}</span>
        <span class="text-muted">${c.phone || 'N/A'}</span>
      </td>
      <td class="small text-muted">${c.address || 'Standard Guest'}</td>
      <td class="text-center">
        <span class="badge bg-primary-subtle text-primary fw-bold">${c.total_bookings || 0} Stays</span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-dark" onclick="openCustomerModal('edit', ${c.customer_id})">
          <i data-lucide="edit-3" style="width: 14px;"></i> Edit
        </button>
      </td>
    </tr>
  `).join('');
}

window.searchCustomers = function(query) {
  const q = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#customers-table-body tr');
  rows.forEach(r => {
    const s = r.dataset.search || '';
    r.style.display = (!q || s.includes(q)) ? '' : 'none';
  });
};

window.openCustomerModal = function(mode, custId) {
  const modalElem = document.getElementById('customerModal');
  const titleElem = document.getElementById('customer-modal-title');
  const formMode = document.getElementById('cust-form-mode');
  const idField = document.getElementById('cust-id');

  if (mode === 'add') {
    titleElem.textContent = 'Register New Guest (Customer)';
    formMode.value = 'add';
    idField.value = '';
    document.getElementById('customer-form')?.reset();
  } else {
    titleElem.textContent = 'Edit Guest Profile';
    formMode.value = 'edit';
    idField.value = custId;
    const cust = (adminState.dashboardData.customers || []).find(c => c.customer_id === custId);
    if (!cust) return;

    document.getElementById('cust-name').value = cust.name || '';
    document.getElementById('cust-nic').value = cust.national_id || '';
    document.getElementById('cust-phone').value = cust.phone || '';
    document.getElementById('cust-email').value = cust.email || '';
    document.getElementById('cust-address').value = cust.address || '';
  }

  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

window.saveCustomer = async function(e) {
  e.preventDefault();
  if (!supabaseClient) return;

  const mode = document.getElementById('cust-form-mode')?.value || 'add';
  const custId = mode === 'edit' ? parseInt(document.getElementById('cust-id')?.value, 10) : null;
  const name = document.getElementById('cust-name')?.value?.trim();
  const nic = document.getElementById('cust-nic')?.value?.trim();
  const phone = document.getElementById('cust-phone')?.value?.trim();
  const email = document.getElementById('cust-email')?.value?.trim();
  const address = document.getElementById('cust-address')?.value?.trim() || '';

  try {
    const { data, error } = await supabaseClient.rpc('manage_customer', {
      p_customer_id: custId,
      p_name: name,
      p_national_id: nic,
      p_phone: phone,
      p_email: email,
      p_address: address
    });

    if (error || !data || !data.success) {
      alert("Could not save customer: " + (data?.error || error?.message || 'Error'));
      return;
    }

    const modalElem = document.getElementById('customerModal');
    if (modalElem && window.bootstrap) {
      const bsModal = window.bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    }

    showToast(`Guest profile "${name}" saved!`);
    loadDashboardData();
  } catch (err) {
    console.error("Save customer error:", err);
    alert("Error saving customer profile.");
  }
};

// =============================================================================
// 13. INVOICES & OFFICIAL PRINTABLE RECEIPTS
// =============================================================================

function renderInvoices(invoices) {
  const tbody = document.getElementById('invoices-table-body');
  if (!tbody) return;

  if (!invoices || invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No invoices generated yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => {
    const total = inv.amount || 0;
    const tax = Math.round(total * 0.18 / 1.18);
    const dateStr = inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-US') : 'N/A';

    return `
      <tr>
        <td><strong class="font-monospace">INV-${String(inv.invoice_id).padStart(6, '0')}</strong></td>
        <td><span class="font-monospace text-primary">${inv.booking_reference}</span></td>
        <td>${inv.guest_name}</td>
        <td class="small text-muted">${dateStr}</td>
        <td class="small text-muted">${formatLKR(tax)}</td>
        <td class="fw-bold font-serif text-dark">${formatLKR(total)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark" onclick="openInvoiceModal(${JSON.stringify(inv).replace(/"/g, '&quot;')})">
            <i data-lucide="printer" style="width: 14px;"></i> View &amp; Print
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Quick Helper to trigger invoice modal from booking row
window.viewInvoiceFromBooking = function(bookingId) {
  const booking = adminState.dashboardData.bookings.find(b => b.booking_id === bookingId);
  if (!booking) return;

  const invoice = {
    invoice_id: booking.booking_id,
    booking_reference: booking.booking_reference,
    guest_name: booking.guest_name,
    guest_email: booking.guest_email,
    guest_phone: booking.guest_phone,
    room_no: booking.room_no,
    stay_dates: `${booking.check_in_date} → ${booking.check_out_date}`,
    amount: booking.invoice_amount || 0
  };
  openInvoiceModal(invoice);
};

// Open Official Invoice Modal
window.openInvoiceModal = function(inv) {
  if (!inv) return;

  const total = inv.amount || 0;
  const subtotal = Math.round(total / 1.18);
  const tax = total - subtotal;
  const dateStr = inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US');

  document.getElementById('inv-modal-number').textContent = `INV-${String(inv.invoice_id).padStart(6, '0')}`;
  document.getElementById('inv-modal-booking-ref').textContent = inv.booking_reference || 'BMN-000000-2026';
  document.getElementById('inv-modal-date').textContent = dateStr;
  document.getElementById('inv-modal-guest-name').textContent = inv.guest_name || 'Valued Guest';
  document.getElementById('inv-modal-guest-email').textContent = inv.guest_email || 'reception@bluemoonhotel.lk';
  document.getElementById('inv-modal-guest-phone').textContent = inv.guest_phone || '+94 717 224 755';
  document.getElementById('inv-modal-room-no').textContent = `Assigned Room: ${inv.room_no || '301'}`;
  document.getElementById('inv-modal-dates').textContent = inv.stay_dates || 'Standard Reservation';
  document.getElementById('inv-modal-subtotal').textContent = formatLKR(subtotal);
  document.getElementById('inv-modal-tax').textContent = formatLKR(tax);
  document.getElementById('inv-modal-total').textContent = formatLKR(total);

  const modalElem = document.getElementById('invoiceModal');
  if (modalElem && window.bootstrap) {
    const bsModal = new window.bootstrap.Modal(modalElem);
    bsModal.show();
  }
};

// =============================================================================
// 14. DOM INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();

  // Attach login form handler
  const loginForm = document.getElementById('staff-login-form');
  loginForm?.addEventListener('submit', handleLoginSubmit);

  // Attach walk-in form handler
  const walkinForm = document.getElementById('walkin-form');
  walkinForm?.addEventListener('submit', handleWalkinSubmit);

  // Check existing session in sessionStorage
  const savedSession = sessionStorage.getItem('blue_moon_staff');
  if (savedSession) {
    try {
      adminState.staffUser = JSON.parse(savedSession);
      showDashboardView();
    } catch (e) {
      sessionStorage.removeItem('blue_moon_staff');
    }
  }

  if (window.lucide) window.lucide.createIcons();
});
