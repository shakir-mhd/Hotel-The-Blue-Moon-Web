/**
 * Hotel The Blue Moon - Staff Operations Hub Logic (admin.js)
 * Vanilla JavaScript (ES6) with Supabase RPC
 */

import { supabaseClient } from './supabaseClient.js';

// Global Dashboard State
const adminState = {
  staffUser: null,
  activeTab: 'room-rack',
  dashboardData: {
    stats: {},
    rooms: [],
    bookings: [],
    invoices: [],
    logins: [],
    staff: []
  }
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

// Live Clock Initializer (Sri Lanka Standard Time)
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

// Quick Demo Staff Credentials Fill Helper
window.fillStaffDemo = function(username, password) {
  const userField = document.getElementById('login-username');
  const passField = document.getElementById('login-password');
  if (userField) userField.value = username;
  if (passField) passField.value = password;
};

// Staff Login Handler
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

    const { data, error } = await supabaseClient.rpc('verify_employee_login', {
      p_username: username,
      p_password: password
    });

    if (error || !data || !data.success) {
      const msg = data?.error || error?.message || 'Invalid username or password.';
      if (errorAlert) {
        errorAlert.textContent = msg;
        errorAlert.classList.remove('d-none');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SIGN IN TO HUB';
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
      submitBtn.textContent = 'SIGN IN TO HUB';
    }
  }
}

// Staff Logout Handler
window.handleStaffLogout = function() {
  sessionStorage.removeItem('blue_moon_staff');
  adminState.staffUser = null;
  document.getElementById('admin-dashboard-view')?.classList.add('d-none');
  document.getElementById('admin-auth-view')?.classList.remove('d-none');
  const userField = document.getElementById('login-username');
  const passField = document.getElementById('login-password');
  if (userField) userField.value = '';
  if (passField) passField.value = '';
};

// Show Dashboard View & Profile
function showDashboardView() {
  document.getElementById('admin-auth-view')?.classList.add('d-none');
  document.getElementById('admin-dashboard-view')?.classList.remove('d-none');

  if (adminState.staffUser) {
    document.getElementById('staff-display-name').textContent = adminState.staffUser.name;
    document.getElementById('staff-display-role').textContent = adminState.staffUser.designation;

    // Hide staff payroll tab if not manager
    const isManager = adminState.staffUser.designation.toLowerCase().includes('manager');
    const staffNav = document.getElementById('nav-item-staff');
    if (staffNav) {
      staffNav.style.display = isManager ? 'block' : 'none';
    }
  }

  loadDashboardData();
}

// Load Full Dashboard Data from Supabase
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
      renderInvoices(data.invoices);
      renderStaffAndLogins(data.staff, data.logins);
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
};

// Render KPI Metrics
function renderMetrics(stats) {
  if (!stats) return;
  document.getElementById('stat-available').textContent = stats.available_rooms ?? 0;
  document.getElementById('stat-occupied').textContent = stats.occupied_rooms ?? 0;
  document.getElementById('stat-maintenance').textContent = stats.maintenance_rooms ?? 0;
  document.getElementById('stat-revenue').textContent = formatLKR(stats.total_revenue ?? 0);
}

// Render Room Rack Cards
function renderRoomRack(rooms) {
  const container = document.getElementById('room-rack-grid');
  if (!container) return;

  if (!rooms || rooms.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-4">No rooms registered.</div>`;
    return;
  }

  const roomNames = {
    single: "Single Room",
    double: "Double Room",
    suite: "Suite Room",
    family: "Family Room"
  };

  container.innerHTML = rooms.map(room => {
    const status = room.status || 'available';
    const isOccupied = status === 'occupied';
    const isMaintenance = status === 'maintenance';
    const currentBooking = room.current_booking;

    let badgeClass = 'badge-available';
    let badgeText = 'Available';
    if (isOccupied) {
      badgeClass = 'badge-occupied';
      badgeText = 'Occupied';
    } else if (isMaintenance) {
      badgeClass = 'badge-maintenance';
      badgeText = 'Housekeeping';
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
                <span class="text-muted d-block text-uppercase fw-bold" style="font-size: 9px;">Current Guest</span>
                <strong class="d-block text-dark">${currentBooking.guest_name}</strong>
                <span class="text-muted d-block">${currentBooking.check_in_date} → ${currentBooking.check_out_date}</span>
                <span class="font-monospace text-primary" style="font-size: 11px;">${currentBooking.booking_reference}</span>
              </div>
            ` : isMaintenance ? `
              <div class="p-3 bg-warning-subtle text-warning-emphasis rounded-3 border border-warning-subtle mb-3 small">
                <i data-lucide="sparkles" style="width: 14px;"></i> Room scheduled for housekeeping inspection.
              </div>
            ` : `
              <div class="p-3 bg-light rounded-3 text-muted mb-3 small">
                <i data-lucide="check" class="text-success" style="width: 14px;"></i> Clean and prepared for check-in.
              </div>
            `}
          </div>

          <!-- Room Status Controls -->
          <div class="pt-3 border-top d-flex justify-content-between align-items-center">
            <span class="small text-muted" style="font-size: 11px;">Status:</span>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-success ${status === 'available' ? 'active' : ''}" onclick="setRoomStatusLive('${room.room_no}', 'available')" title="Mark Available">
                Available
              </button>
              <button class="btn btn-outline-danger ${status === 'occupied' ? 'active' : ''}" onclick="setRoomStatusLive('${room.room_no}', 'occupied')" title="Mark Occupied">
                Occupied
              </button>
              <button class="btn btn-outline-warning ${status === 'maintenance' ? 'active' : ''}" onclick="setRoomStatusLive('${room.room_no}', 'maintenance')" title="Mark Cleaning">
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
    showToast(`Room ${roomNo} status updated to ${status}.`);
    loadDashboardData();
  } catch (err) {
    console.error("Room status update error:", err);
  }
};

// Render Bookings Table
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
            ${status !== 'checked_in' && status !== 'checked_out' && status !== 'cancelled' ? `
              <button class="btn btn-outline-success" onclick="handleStayAction(${b.booking_id}, 'checked_in')" title="Check-in Guest">
                Check In
              </button>
            ` : ''}
            ${status === 'checked_in' ? `
              <button class="btn btn-outline-warning" onclick="handleStayAction(${b.booking_id}, 'checked_out')" title="Check-out Guest">
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

// Check-in / Check-out Stay Action Handler
window.handleStayAction = async function(bookingId, newStatus) {
  if (!supabaseClient) return;

  const actionName = newStatus === 'checked_in' ? 'Check-in' : 'Check-out';
  if (!confirm(`Are you sure you want to execute ${actionName} for this reservation?`)) return;

  try {
    const { data, error } = await supabaseClient.rpc('update_stay_status', {
      p_booking_id: bookingId,
      p_new_status: newStatus
    });

    if (error) {
      alert("Could not update status: " + error.message);
      return;
    }

    showToast(`Reservation successfully marked as ${newStatus.replace('_', ' ')}.`);
    loadDashboardData();
  } catch (err) {
    console.error("Stay action error:", err);
  }
};

// Render Invoices Table
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

// Render Staff Directory & Login Audit History
function renderStaffAndLogins(staff, logins) {
  const staffTbody = document.getElementById('staff-table-body');
  const loginsTbody = document.getElementById('login-history-table-body');

  if (staffTbody) {
    staffTbody.innerHTML = (staff && staff.length > 0) ? staff.map(emp => `
      <tr>
        <td>
          <strong class="d-block">${emp.name}</strong>
          <span class="text-muted small">ID: EMP-${String(emp.employee_id).padStart(4, '0')}</span>
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
      const timeStr = log.login_time ? new Date(log.login_time).toLocaleString('en-US') : 'N/A';
      return `
        <tr>
          <td><strong>${log.employee_name}</strong></td>
          <td class="text-muted">${log.designation}</td>
          <td class="text-end text-muted font-monospace">${timeStr}</td>
        </tr>
      `;
    }).join('') : `<tr><td colspan="3" class="text-center text-muted">No login history.</td></tr>`;
  }
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

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();

  // Attach login form handler
  const loginForm = document.getElementById('staff-login-form');
  loginForm?.addEventListener('submit', handleLoginSubmit);

  // Check existing session
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

