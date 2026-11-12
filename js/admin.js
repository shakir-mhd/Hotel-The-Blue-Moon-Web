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
  calculatedWalkinTotal: 0,
  dashboardData: {
    stats: {},
    rooms: [],
    bookings: [],
    invoices: [],
    logins: [],
    staff: [],
    customers: []
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

// Step 1: User selects staff role / position
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
          <i data-lucide="calendar-check" style="width: 15px;"></i> Reservations
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-tab="invoices" onclick="switchAdminTab('invoices')">
          <i data-lucide="receipt" style="width: 15px;"></i> Invoices &amp; Bills
        </a>
      </li>
    `;
  } else {
    // General Manager Role (User Guide Page 7)
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

// Tab Switching Handler
window.switchAdminTab = function(tabId) {
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
      renderCustomers(data.customers);
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
};

// Render KPI Metrics
function renderMetrics(stats) {
  if (!stats) return;
  const availElem = document.getElementById('stat-available');
  const occElem = document.getElementById('stat-occupied');
  const maintElem = document.getElementById('stat-maintenance');
  const revElem = document.getElementById('stat-revenue');

  if (availElem) availElem.textContent = stats.available_rooms ?? 0;
  if (occElem) occElem.textContent = stats.occupied_rooms ?? 0;
  if (maintElem) maintElem.textContent = stats.maintenance_rooms ?? 0;
  if (revElem) revElem.textContent = formatLKR(stats.total_revenue ?? 0);
}

// =============================================================================
// 4. ROOM RACK & LIVE CHECKOUT (User Guide Page 5)
// =============================================================================

function renderRoomRack(rooms) {
  const container = document.getElementById('room-rack-grid');
  if (!container) return;

  if (!rooms || rooms.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-4">No rooms registered.</div>`;
    return;
  }

  const roomNames = {
    single: "Single Deluxe Room",
    double: "Double Ocean Room",
    suite: "Grand Luxury Suite",
    family: "Royal Family Residence"
  };

  container.innerHTML = rooms.map(room => {
    const status = room.status || 'available';
    const isOccupied = status === 'occupied';
    const isMaintenance = status === 'maintenance';
    const isCleaning = status === 'cleaning';
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

                <div class="mt-3 pt-2 border-top">
                  <button class="btn btn-sm btn-outline-danger w-100 fw-bold" onclick="handleStayAction(${currentBooking.booking_id}, 'checked_out')">
                    <i data-lucide="log-out" style="width: 14px;"></i> Execute Checkout
                  </button>
                </div>
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
                <span>Room Keeper is currently servicing this room.</span>
              </div>
            ` : `
              <div class="p-3 bg-light rounded-3 text-muted mb-3 small">
                <i data-lucide="check-circle" class="text-success" style="width: 14px;"></i> Clean, sanitized, and ready for front-desk check-in.
              </div>
            `}
          </div>

          <!-- Room Status Controls -->
          <div class="pt-3 border-top d-flex justify-content-between align-items-center">
            <span class="small text-muted" style="font-size: 11px;">Override Status:</span>
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
// 6. RESERVATION LEDGER & STAY LIFECYCLE (User Guide Page 5)
// =============================================================================

function renderBookings(bookings) {
  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;

  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No reservations recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const status = b.booking_status || 'pending';
    let badgeClass = 'bg-secondary';
    if (status === 'confirmed') badgeClass = 'bg-primary';
    if (status === 'checked_in') badgeClass = 'bg-success';
    if (status === 'checked_out') badgeClass = 'bg-dark';
    if (status === 'cancelled') badgeClass = 'bg-danger';

    return `
      <tr data-search="${(b.booking_reference + ' ' + b.guest_name + ' ' + b.guest_phone).toLowerCase()}">
        <td>
          <span class="font-monospace fw-bold text-dark">${b.booking_reference}</span>
        </td>
        <td>
          <strong class="d-block">${b.guest_name}</strong>
          <span class="text-muted small">${b.guest_phone || b.guest_email}</span>
        </td>
        <td>
          <span class="badge bg-light text-dark border">Room ${b.room_no || 'TBD'}</span>
        </td>
        <td class="small">
          ${b.check_in_date} → ${b.check_out_date}
        </td>
        <td class="small text-uppercase">
          ${b.period === 'day' ? '24H Flex' : 'Night'}
        </td>
        <td class="fw-bold font-serif">
          ${formatLKR(b.invoice_amount)}
        </td>
        <td>
          <span class="badge ${badgeClass} text-uppercase" style="font-size: 10px;">${status.replace('_', ' ')}</span>
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
// 8. EXECUTIVE REPORTING & AUDIT (User Guide Page 7: General Manager)
// =============================================================================

// Generate Monthly Report (Calls Supabase RPC: generate_monthly_report)
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

// Manager Sub-view Switcher (Smooth focus on Customers or Salaries)
window.switchManagerSubView = function(view) {
  if (view === 'customers') {
    const custSec = document.getElementById('manager-customers-section');
    if (custSec) {
      custSec.scrollIntoView({ behavior: 'smooth' });
      custSec.classList.add('bg-warning-subtle');
      setTimeout(() => custSec.classList.remove('bg-warning-subtle'), 1500);
    }
  } else if (view === 'salaries') {
    const staffTable = document.getElementById('staff-table-body');
    if (staffTable) {
      staffTable.scrollIntoView({ behavior: 'smooth' });
      staffTable.classList.add('bg-warning-subtle');
      setTimeout(() => staffTable.classList.remove('bg-warning-subtle'), 1500);
    }
  }
};

// Render Staff Directory & Login Audit History (Page 6 & 7)
function renderStaffAndLogins(staff, logins) {
  const staffTbody = document.getElementById('staff-table-body');
  const loginsTbody = document.getElementById('login-history-table-body');

  if (staffTbody) {
    staffTbody.innerHTML = (staff && staff.length > 0) ? staff.map(emp => `
      <tr>
        <td>
          <strong class="d-block text-dark">${emp.name}</strong>
          <span class="text-muted small">NIC: ${emp.national_id || 'N/A'}</span>
        </td>
        <td>
          <span class="badge bg-light text-dark border">${emp.designation}</span>
        </td>
        <td class="small">
          <span class="d-block">${emp.email}</span>
          <span class="text-muted">${emp.phone}</span>
        </td>
        <td class="text-end fw-bold font-serif text-success">
          ${formatLKR(emp.basic_salary)}
        </td>
      </tr>
    `).join('') : `<tr><td colspan="4" class="text-center text-muted">No staff records.</td></tr>`;
  }

  if (loginsTbody) {
    loginsTbody.innerHTML = (logins && logins.length > 0) ? logins.map(log => {
      const timeStr = log.login_time ? new Date(log.login_time).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) : 'N/A';
      return `
        <tr>
          <td><strong class="text-dark">${log.employee_name}</strong></td>
          <td class="text-muted">${log.designation}</td>
          <td class="text-end text-muted font-monospace">${timeStr}</td>
        </tr>
      `;
    }).join('') : `<tr><td colspan="3" class="text-center text-muted">No login history recorded.</td></tr>`;
  }
}

// Render Registered Customers Directory (Page 7: View Customers)
function renderCustomers(customers) {
  const custTbody = document.getElementById('customers-table-body');
  const countBadge = document.getElementById('customer-count-badge');
  if (!custTbody) return;

  if (countBadge) {
    countBadge.textContent = `${(customers || []).length} Registered Guests`;
  }

  if (!customers || customers.length === 0) {
    custTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No registered customers found.</td></tr>`;
    return;
  }

  custTbody.innerHTML = customers.map(c => `
    <tr>
      <td><span class="badge bg-light text-muted border font-monospace">CUST-${String(c.customer_id).padStart(4, '0')}</span></td>
      <td><strong class="text-dark">${c.name}</strong></td>
      <td><span class="font-monospace text-secondary">${c.national_id || 'N/A'}</span></td>
      <td class="small">
        <span class="d-block">${c.email}</span>
        <span class="text-muted">${c.phone}</span>
      </td>
      <td class="small text-muted">${c.address || 'Standard Guest'}</td>
      <td class="text-end">
        <span class="badge bg-primary-subtle text-primary fw-bold">${c.total_bookings || 0} Bookings</span>
      </td>
    </tr>
  `).join('');
}

// =============================================================================
// 9. INVOICES & OFFICIAL PRINTABLE RECEIPTS
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
// 10. DOM INITIALIZATION
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
