
import { useEffect, useState } from 'react';
import './AdminPortal.css';
import { auth, authReady } from './firebase.js';

const API_URL = 'http://localhost:5000/api/v1';



const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'foods', label: 'Food Items', icon: '♨' },
  { id: 'categories', label: 'Categories', icon: '▤' },
  { id: 'orders', label: 'Manage Orders', icon: '▣' },
  { id: 'orderHistory', label: 'Order History', icon: '▤' },
  { id: 'customers', label: 'Customers', icon: '♙' },
  { id: 'enquiries', label: 'Customer Enquiries', icon: '✉' },
  { id: 'reports', label: 'Reports', icon: '▥' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];



const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const money = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

async function getAdminToken() {
  await authReady;

  if (!auth.currentUser) {
    throw new Error('Please sign in with your authorized admin account.');
  }

  return auth.currentUser.getIdToken();
}

async function adminRequest(path, options = {}) {
  const token = await getAdminToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `Request failed (${response.status}).`
    );
  }

  return result;
}

async function fetchAdminFoods() {
  const result = await adminRequest('/admin/foods');

  return (result.foods || []).map(food => ({
    ...food,
    id: food.id,
    name: food.name,
    category: food.category || 'Uncategorized',
    price: Number(food.price) || 0,
    stockQuantity:
      food.stockQuantity == null ? '' : Number(food.stockQuantity),
    isAvailable:
      Number(food.isAvailable) === 1 || food.isAvailable === true,
  }));
}

async function fetchAdminOrders() {
  const result = await adminRequest('/orders/admin');
  return result.orders || [];
}
async function fetchAdminReportSummary() {
  return adminRequest('/admin/reports/summary');
}

async function fetchAdminCustomers() {
  const result = await adminRequest('/admin/customers');
  return result.customers || [];
}

async function fetchAdminEnquiries() {
  const result = await adminRequest('/contact/admin');
  return result.enquiries || [];
}


export default function AdminPortal({ user, onSignOut }) {
  const [activePage, setActivePage] = useState('dashboard');

  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodsError, setFoodsError] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');
  const [enquiries, setEnquiries] = useState([]);
const [enquiriesLoading, setEnquiriesLoading] = useState(false);
const [enquiriesError, setEnquiriesError] = useState('');
const [replyDrafts, setReplyDrafts] = useState({});
const [savingEnquiryId, setSavingEnquiryId] = useState(null);

  const [reportData, setReportData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');

  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [savingFoodId, setSavingFoodId] = useState(null);
  const [savingOrderId, setSavingOrderId] = useState(null);

  async function loadFoods() {
    setFoodsLoading(true);
    setFoodsError('');

    try {
      setFoods(await fetchAdminFoods());
    } catch (error) {
      setFoodsError(error.message || 'Unable to load foods.');
    } finally {
      setFoodsLoading(false);
    }
  }

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError('');

    try {
      setOrders(await fetchAdminOrders());
    } catch (error) {
      setOrdersError(error.message || 'Unable to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadCustomers() {
    setCustomersLoading(true);
    setCustomersError('');

    try {
      setCustomers(await fetchAdminCustomers());
    } catch (error) {
      setCustomersError(error.message || 'Unable to load customers.');
    } finally {
      setCustomersLoading(false);
    }
  }

  async function loadEnquiries() {
  setEnquiriesLoading(true);
  setEnquiriesError('');

  try {
    setEnquiries(await fetchAdminEnquiries());
  } catch (error) {
    setEnquiriesError(error.message || 'Unable to load customer enquiries.');
  } finally {
    setEnquiriesLoading(false);
  }
}

async function saveEnquiryReply(enquiry) {
  const enquiryId = enquiry.ENQUIRY_ID;
  const reply = (replyDrafts[enquiryId] || '').trim();

  if (!reply) {
    setNotice('Please enter a reply before saving.');
    return;
  }

  if (reply.length > 2000) {
    setNotice('Reply must not exceed 2000 characters.');
    return;
  }

  setSavingEnquiryId(enquiryId);
  setNotice('');

  try {
    const result = await adminRequest(
      `/contact/admin/${enquiryId}/reply`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reply }),
      }
    );

    setReplyDrafts(current => ({
      ...current,
      [enquiryId]: '',
    }));

    setNotice(result.message || 'Reply saved successfully.');
    await loadEnquiries();
  } catch (error) {
    setNotice(error.message || 'Unable to save reply.');
  } finally {
    setSavingEnquiryId(null);
  }
}

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    if (activePage === 'orders' || activePage === 'dashboard') {
      loadOrders();
    }

    if (activePage === 'enquiries') {
  loadEnquiries();
}

    if (activePage === 'customers' || activePage === 'dashboard') {
      loadCustomers();
    }
  }, [activePage]);

  async function saveInventory(food) {
    const stockQuantity =
      food.stockQuantity === '' ? null : Number(food.stockQuantity);

    if (
      stockQuantity === null ||
      !Number.isSafeInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setNotice('Enter a valid, non-negative whole-number stock quantity.');
      return;
    }

    setSavingFoodId(food.id);
    setNotice('');

    try {
      const result = await adminRequest(
        `/admin/foods/${food.id}/inventory`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            isAvailable: food.isAvailable,
            stockQuantity,
          }),
        }
      );

      setFoods(current =>
        current.map(item =>
          item.id === food.id
            ? {
                ...item,
                stockQuantity: result.food.stockQuantity,
                isAvailable: Number(result.food.isAvailable) === 1,
              }
            : item
        )
      );

      setNotice(`${food.name}: inventory saved to Oracle.`);
    } catch (error) {
      setNotice(error.message || 'Unable to save inventory.');
    } finally {
      setSavingFoodId(null);
    }
  }

  async function updateOrderStatus(order, newStatus) {
    if (newStatus === order.ORDER_STATUS) return;

    setSavingOrderId(order.ORDER_ID);
    setNotice('');

    try {
      await adminRequest(
        `/orders/admin/${order.ORDER_ID}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        }
      );

      setOrders(current =>
        current.map(item =>
          item.ORDER_ID === order.ORDER_ID
            ? { ...item, ORDER_STATUS: newStatus }
            : item
        )
      );

      setNotice(`Order #${order.ORDER_ID} status updated.`);
    } catch (error) {
      setNotice(error.message || 'Unable to update order status.');
      await loadOrders();
    } finally {
      setSavingOrderId(null);
    }
  }
  
async function markPaymentReceived(order) {
  if (order.ORDER_STATUS !== 'DELIVERED') {
    setNotice('Deliver the order before confirming payment.');
    return;
  }

  if (order.PAYMENT_METHOD !== 'COD') {
    setNotice('This action is only for Cash on Delivery orders.');
    return;
  }

  if (order.PAYMENT_STATUS === 'PAID') {
    setNotice(`Order #${order.ORDER_ID} is already paid.`);
    return;
  }

  const confirmed = window.confirm(
    `Confirm that cash payment of ₹${Number(order.TOTAL_AMOUNT).toFixed(2)} was received for order #${order.ORDER_ID}?`
  );

  if (!confirmed) return;

  setSavingOrderId(order.ORDER_ID);
  setNotice('');

  try {
    await adminRequest(
      `/orders/admin/${order.ORDER_ID}/payment`,
      {
        method: 'PATCH',
        body: JSON.stringify({}),
      }
    );

    setOrders(current =>
      current.map(item =>
        item.ORDER_ID === order.ORDER_ID
          ? { ...item, PAYMENT_STATUS: 'PAID' }
          : item
      )
    );

    setNotice(`Payment received for order #${order.ORDER_ID}.`);
  } catch (error) {
    setNotice(error.message || 'Unable to update payment status.');
    await loadOrders();
  } finally {
    setSavingOrderId(null);
  }
}


  
function renderDashboard() {
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.TOTAL_AMOUNT) || 0),
    0
  );

  const completedOrders = orders.filter(
    order =>
      order.ORDER_STATUS === 'DELIVERED' &&
      order.PAYMENT_STATUS === 'PAID'
  ).length;

  const averageOrderValue = orders.length
    ? totalRevenue / orders.length
    : 0;

  const dailySales = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const dayOrders = orders.filter(order => {
        if (!order.ORDER_DATE) return false;

        const orderDate = new Date(order.ORDER_DATE);
        if (Number.isNaN(orderDate.getTime())) return false;

        return orderDate.toDateString() === date.toDateString();
      });

      return {
        key: date.toISOString(),
        label: date.toLocaleDateString('en-IN', {
          weekday: 'short',
        }),
        amount: dayOrders.reduce(
          (sum, order) => sum + (Number(order.TOTAL_AMOUNT) || 0),
          0
        ),
        count: dayOrders.length,
      };
    });
  })();

  const maxDailySales = Math.max(
    ...dailySales.map(day => day.amount),
    1
  );

  return (
    <>
      <div className="ap-stats">
        <StatCard
          icon="▣"
          label="Total Orders"
          value={ordersLoading ? '…' : orders.length}
          note={ordersError ? 'Orders could not be loaded' : 'Orders from Oracle'}
        />

        <StatCard
          icon="♙"
          label="Total Customers"
          value={customersLoading ? '…' : customers.length}
          note={
            customersError
              ? 'Customer data unavailable'
              : 'Registered database accounts'
          }
        />

        <StatCard
          icon="₹"
          label="Total Revenue"
          value={ordersError || ordersLoading ? '—' : money(totalRevenue)}
          note="Total value of returned orders"
        />

        <StatCard
          icon="♨"
          label="Food Items"
          value={foodsLoading ? '…' : foods.length}
          note="Records loaded from Oracle"
        />
      </div>

      <div className="ap-dashboard-grid">
        <section
          className="ap-panel ap-sales-panel"
          style={{
            overflow: 'hidden',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, #fffdf8 0%, #ffffff 65%, #fbf0e4 100%)',
            border: '1px solid #eee3d4',
          }}
        >
          <div
            className="ap-panel-heading"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span
                style={{
                  color: '#98703b',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                }}
              >
                RESTAURANT PERFORMANCE
              </span>
              <h2 style={{ marginTop: '8px' }}>Sales Overview</h2>
              <p>Your SpiceNest business at a glance</p>
            </div>

            <button
              className="ap-primary-button"
              onClick={loadOrders}
              disabled={ordersLoading}
            >
              {ordersLoading ? 'Loading…' : '↻ Refresh'}
            </button>
          </div>

          {ordersError ? (
            <div className="ap-empty-state">
              <h3>Sales data unavailable</h3>
              <p>{ordersError}</p>
            </div>
          ) : ordersLoading ? (
            <div className="ap-empty-state">
              Loading sales from Oracle…
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: '24px',
                  marginTop: '12px',
                  borderRadius: '16px',
                  background: 'linear-gradient(125deg, #541b18, #812e27)',
                  color: '#fff8eb',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '-45px',
                    width: '150px',
                    height: '150px',
                    border: '1px solid #d5b16b55',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '-15px',
                    width: '100px',
                    height: '100px',
                    border: '1px solid #d5b16b55',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    color: '#e9c98d',
                    fontSize: '12px',
                    letterSpacing: '1.5px',
                    fontWeight: 700,
                  }}
                >
                  TOTAL ORDER VALUE
                </p>

                <h2
                  style={{
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    margin: '10px 0',
                    color: '#fff8eb',
                  }}
                >
                  {money(totalRevenue)}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: '#f0d9ca',
                    fontSize: '13px',
                  }}
                >
                  Across {orders.length} orders recorded in Oracle
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  marginTop: '18px',
                }}
              >
                {[
                  {
                    label: 'Total Orders',
                    value: orders.length,
                    icon: '▣',
                    color: '#8a3028',
                    background: '#f9e9e5',
                  },
                  {
                    label: 'Completed',
                    value: completedOrders,
                    icon: '✓',
                    color: '#24754a',
                    background: '#e5f4e9',
                  },
                  {
                    label: 'Average Order',
                    value: money(averageOrderValue),
                    icon: '₹',
                    color: '#89621d',
                    background: '#fbf0d8',
                  },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      background: '#fff',
                      border: '1px solid #eee6dc',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{ color: '#77717a', fontSize: '12px' }}
                      >
                        {item.label}
                      </span>

                      <span
                        style={{
                          display: 'grid',
                          placeItems: 'center',
                          width: '30px',
                          height: '30px',
                          flexShrink: 0,
                          borderRadius: '10px',
                          background: item.background,
                          color: item.color,
                          fontWeight: 800,
                        }}
                      >
                        {item.icon}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: '12px 0 0',
                        fontSize: 'clamp(17px, 2vw, 24px)',
                        overflowWrap: 'anywhere',
                        color: '#292332',
                      }}
                    >
                      {item.value}
                    </h3>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '20px',
                  marginTop: '18px',
                  borderRadius: '16px',
                  background: '#fff',
                  border: '1px solid #eee6dc',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                      Last 7 Days
                    </h3>
                    <p
                      style={{
                        margin: '5px 0 0',
                        color: '#88818a',
                        fontSize: '12px',
                      }}
                    >
                      Order value by date
                    </p>
                  </div>

                  <span style={{ color: '#98703b', fontSize: '12px' }}>
                    Daily summary
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: 'clamp(5px, 1.5vw, 14px)',
                    alignItems: 'end',
                    marginTop: '24px',
                  }}
                >
                  {dailySales.map(day => (
                    <div
                      key={day.key}
                      title={`${day.label}: ${money(day.amount)} · ${day.count} orders`}
                      style={{ textAlign: 'center', minWidth: 0 }}
                    >
                      <div
                        style={{
                          fontSize: 'clamp(9px, 1.1vw, 12px)',
                          color: '#77717a',
                          marginBottom: '8px',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {day.amount > 0 ? money(day.amount) : '—'}
                      </div>

                      <div
                        style={{
                          height: '120px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          borderRadius: '8px 8px 3px 3px',
                          background: '#f8f3ed',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: '65%',
                            minWidth: '5px',
                            height:
                              day.amount > 0
                                ? `${Math.max(
                                    (day.amount / maxDailySales) * 100,
                                    7
                                  )}%`
                                : '3px',
                            borderRadius: '7px 7px 0 0',
                            background:
                              day.amount > 0
                                ? 'linear-gradient(180deg, #c89b52, #7b2823)'
                                : '#e8dfd4',
                            transition: 'height 0.3s ease',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#625965',
                          marginTop: '8px',
                        }}
                      >
                        {day.label}
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color: '#a099a2',
                          marginTop: '3px',
                        }}
                      >
                        {day.count} {day.count === 1 ? 'order' : 'orders'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '14px',
                  color: '#817782',
                  fontSize: '11px',
                }}
              >
                <span style={{ color: '#b38b45', fontSize: '16px' }}>
                  ✦
                </span>
                Figures are calculated from orders currently returned by
                Oracle.
              </div>
            </>
          )}
        </section>

        <section className="ap-panel">
          <div className="ap-panel-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Restaurant management</p>
            </div>
          </div>

          {[
            ['foods', '＋', 'Manage Food Items', 'View menu and stock'],
            ['orders', '▣', 'Manage Orders', 'View database orders'],
            ['orderHistory', '▤', 'Order History', 'View completed orders'],
            ['customers', '♙', 'Manage Customers', 'View customer accounts'],
          ].map(([id, icon, title, description]) => (
            <button
              className="ap-quick-action"
              key={id}
              onClick={() => setActivePage(id)}
            >
              <span className="ap-quick-icon">{icon}</span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <b>›</b>
            </button>
          ))}
        </section>
      </div>

      <section className="ap-panel ap-recent-panel">
        <div className="ap-panel-heading">
          <div>
            <h2>Food Inventory</h2>
            <p>Live food records from Oracle</p>
          </div>

          <button
            className="ap-text-button"
            onClick={() => setActivePage('foods')}
          >
            Manage foods →
          </button>
        </div>

        {renderFoodTable(foods.slice(0, 5), false)}
      </section>
    </>
  );
}


function renderReports() {
  const summary = reportData?.summary || {};
  const dailySales = reportData?.dailySales || [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatDate = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        });
  };

  const maxSales = Math.max(
    1,
    ...dailySales.map((day) => Number(day.DAILY_ORDER_VALUE) || 0)
  );

  return (
    <section className="ap-report-dashboard">
      <div className="ap-report-hero">
        <div>
          <h2>Sales Overview</h2>
          <p>Your restaurant performance at a glance</p>
        </div>

        <button
          type="button"
          className="ap-report-refresh"
          disabled={reportsLoading}
          onClick={async () => {
            setReportsLoading(true);
            setReportsError('');

            try {
              const result = await fetchAdminReportSummary();

              if (!result || result.success === false) {
                throw new Error(
                  result?.message || 'Unable to load reports.'
                );
              }

              setReportData(result);
            } catch (error) {
              setReportsError(
                error.message || 'Unable to load reports.'
              );
            } finally {
              setReportsLoading(false);
            }
          }}
        >
          {reportsLoading ? 'Refreshing...' : '↻ Refresh Reports'}
        </button>
      </div>

      {reportsError && (
        <div className="ap-report-error">{reportsError}</div>
      )}

      {reportsLoading && !reportData && (
        <div className="ap-report-chart-panel">
          Loading sales data from Oracle...
        </div>
      )}

      {!reportsLoading && !reportsError && !reportData && (
        <div className="ap-report-chart-panel">
          Click Refresh Reports to retrieve the latest data.
        </div>
      )}

      {reportData && (
        <>
          <div className="ap-report-stats">
            <article className="ap-report-stat">
              <p className="ap-report-stat-label">Total Order Value</p>
              <h3 className="ap-report-stat-value">
                {formatCurrency(summary.TOTAL_ORDER_VALUE)}
              </h3>
              <p className="ap-report-stat-note">
                Across all recorded orders
              </p>
            </article>

            <article className="ap-report-stat">
              <p className="ap-report-stat-label">Completed Orders</p>
              <h3 className="ap-report-stat-value">
                {Number(summary.COMPLETED_ORDERS) || 0}
              </h3>
              <p className="ap-report-stat-note">
                Delivered and paid orders
              </p>
            </article>

            <article className="ap-report-stat">
              <p className="ap-report-stat-label">Pending Payments</p>
              <h3 className="ap-report-stat-value">
                {Number(summary.PENDING_PAYMENTS) || 0}
              </h3>
              <p className="ap-report-stat-note">
                Orders awaiting payment
              </p>
            </article>

            <article className="ap-report-stat">
              <p className="ap-report-stat-label">Average Order Value</p>
              <h3 className="ap-report-stat-value">
                {formatCurrency(summary.AVERAGE_ORDER_VALUE)}
              </h3>
              <p className="ap-report-stat-note">
                Average across all orders
              </p>
            </article>

            <article className="ap-report-stat">
              <p className="ap-report-stat-label">Cancelled Orders</p>
              <h3 className="ap-report-stat-value">
                {Number(summary.CANCELLED_ORDERS) || 0}
              </h3>
              <p className="ap-report-stat-note">
                Orders marked cancelled
              </p>
            </article>
          </div>

          <section className="ap-report-chart-panel">
            <h3>Daily Order Value</h3>
            <p>Order totals from the last seven days</p>

            {dailySales.length === 0 ? (
              <p>No sales records found for the last seven days.</p>
            ) : (
              <div className="ap-report-chart">
                {dailySales.map((day, index) => {
                  const amount =
                    Number(day.DAILY_ORDER_VALUE) || 0;

                  const height =
                    amount > 0 ? (amount / maxSales) * 150 : 0;

                  return (
                    <div
                      className="ap-report-bar-column"
                      key={`${String(day.SALES_DATE)}-${index}`}
                    >
                      <strong>{formatCurrency(amount)}</strong>

                      <div className="ap-report-bar-track">
                        <div
                          className="ap-report-bar"
                          style={{ height: `${height}px` }}
                          title={formatCurrency(amount)}
                        />
                      </div>

                      <span>{formatDate(day.SALES_DATE)}</span>
                      <small>
                        {Number(day.ORDER_COUNT) || 0} orders
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}



function renderSettings() {
  return (
    <section className="sn-settings">
      <header className="sn-settings-heading">
        <div>
          <span className="sn-settings-eyebrow">
            SPICENEST WORKSPACE / PREFERENCES
          </span>
          <h2>Settings & Preferences</h2>
          <p>Manage your account and restaurant identity.</p>
        </div>
        <span className="sn-settings-status">
          <span /> Account active
        </span>
      </header>

      <div className="sn-settings-layout">
        <aside className="sn-settings-sidebar">
          <div className="sn-settings-profile">
            <div className="sn-settings-avatar">
              {(user?.displayName || user?.email || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>
            <h3>{user?.displayName || 'Administrator'}</h3>
            <p>{user?.email || 'Email unavailable'}</p>
            <span>RESTAURANT ADMIN</span>
          </div>

          <div className="sn-settings-menu">
            <div className="sn-settings-menu-item active">
              <span>◎</span>
              Account overview
            </div>
            <div className="sn-settings-menu-item">
              <span>▤</span>
              Restaurant profile
              <small>INFO</small>
            </div>
            <div className="sn-settings-menu-item">
              <span>◇</span>
              Security & access
            </div>
          </div>

          <div className="sn-settings-sidebar-note">
            <span>✦</span>
            <p>
              Good food starts with great people.
            </p>
          </div>
        </aside>

        <div className="sn-settings-content">
          <section className="sn-settings-welcome">
            <div>
              <span>YOUR CONTROL CENTRE</span>
              <h3>Welcome to your workspace.</h3>
              <p>
                Your SpiceNest administrator account and access
                information are shown below.
              </p>
            </div>
            <div className="sn-settings-welcome-mark">SN</div>
          </section>

          <section className="sn-settings-section">
            <div className="sn-settings-section-heading">
              <div>
                <span>01 / ACCOUNT</span>
                <h3>Personal information</h3>
              </div>
              <span className="sn-settings-readonly">READ ONLY</span>
            </div>

            <div className="sn-settings-detail">
              <div className="sn-settings-detail-icon">♙</div>
              <div className="sn-settings-detail-copy">
                <span>Display name</span>
                <strong>{user?.displayName || 'Administrator'}</strong>
              </div>
              <span className="sn-settings-detail-tag">PROFILE</span>
            </div>

            <div className="sn-settings-detail">
              <div className="sn-settings-detail-icon">@</div>
              <div className="sn-settings-detail-copy">
                <span>Registered email</span>
                <strong>{user?.email || 'Email unavailable'}</strong>
              </div>
              <span className="sn-settings-detail-tag">FIREBASE</span>
            </div>
          </section>

          <section className="sn-settings-section">
            <div className="sn-settings-section-heading">
              <div>
                <span>02 / RESTAURANT</span>
                <h3>Restaurant identity</h3>
              </div>
            </div>

            <div className="sn-settings-restaurant">
              <div className="sn-settings-restaurant-logo">SN</div>
              <div>
                <h4>SpiceNest</h4>
                <p>Indian Kitchen & Dining</p>
                <span>RESTAURANT WORKSPACE</span>
              </div>
              <div className="sn-settings-restaurant-badge">
                Established identity
              </div>
            </div>
            <p className="sn-settings-footnote">
              This is the current application identity. Editable
              restaurant details can be added when a settings API
              and database storage are implemented.
            </p>
          </section>

          <section className="sn-settings-section">
            <div className="sn-settings-section-heading">
              <div>
                <span>03 / PROTECTION</span>
                <h3>Security & access</h3>
              </div>
              <span className="sn-settings-security-status">
                ● PROTECTED
              </span>
            </div>

            <div className="sn-settings-security-row">
              <div className="sn-settings-security-icon">◇</div>
              <div>
                <strong>Firebase Authentication</strong>
                <p>
                  Your current session uses the application's
                  existing authentication system.
                </p>
              </div>
            </div>

            <div className="sn-settings-security-actions">
              <div>
                <strong>Sign out of SpiceNest</strong>
                <p>End your current administrator session.</p>
              </div>
              <button
                type="button"
                className="sn-settings-signout"
                onClick={onSignOut}
              >
                Sign out <span>↗</span>
              </button>
            </div>
          </section>

          <footer className="sn-settings-footer">
            <span>SPICENEST ADMINISTRATION</span>
            <span>Manage with care · Serve with heart</span>
          </footer>
        </div>
      </div>
    </section>
  );
}


function renderFoodTable(items, showInventoryControls = true) {
    if (foodsLoading) {
      return <div className="ap-empty-state">Loading food records from Oracle…</div>;
    }

    if (foodsError) {
      return (
        <div className="ap-empty-state">
          <h3>Unable to load food items</h3>
          <p>{foodsError}</p>
          <button className="ap-primary-button" onClick={loadFoods}>
            Retry
          </button>
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="ap-empty-state">
          <h3>No food items found</h3>
          <p>Check the search term or reload the food records.</p>
        </div>
      );
    }

    return (
      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead>
            <tr>
              <th>Food Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Stock</th>
              {showInventoryControls && <th>Save</th>}
            </tr>
          </thead>

          <tbody>
            {items.map(food => (
              <tr key={food.id}>
                <td><strong>{food.name}</strong></td>
                <td>{food.category}</td>
                <td>{money(food.price)}</td>
                <td>
                  {showInventoryControls ? (
                    <select
                      value={food.isAvailable ? '1' : '0'}
                      disabled={savingFoodId === food.id}
                      onChange={event => {
                        const isAvailable = event.target.value === '1';

                        setFoods(current =>
                          current.map(item =>
                            item.id === food.id
                              ? { ...item, isAvailable }
                              : item
                          )
                        );
                      }}
                      aria-label={`Availability for ${food.name}`}
                    >
                      <option value="1">Available</option>
                      <option value="0">Unavailable</option>
                    </select>
                  ) : (
                    <span
                      className={`ap-status ${
                        food.isAvailable ? 'ap-status-active' : ''
                      }`}
                    >
                      {food.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  )}
                </td>
                <td>
                  {showInventoryControls ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={food.stockQuantity}
                      disabled={savingFoodId === food.id}
                      placeholder="Set stock"
                      onChange={event => {
                        const value = event.target.value;

                        setFoods(current =>
                          current.map(item =>
                            item.id === food.id
                              ? { ...item, stockQuantity: value }
                              : item
                          )
                        );
                      }}
                      aria-label={`Stock quantity for ${food.name}`}
                    />
                  ) : (
                    food.stockQuantity === '' ? 'Not set' : food.stockQuantity
                  )}
                </td>
                {showInventoryControls && (
                  <td>
                    <button
                      className="ap-primary-button"
                      disabled={savingFoodId === food.id}
                      onClick={() => saveInventory(food)}
                    >
                      {savingFoodId === food.id ? 'Saving…' : 'Save'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderFoods() {
    const filtered = foods.filter(food =>
      `${food.name} ${food.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    return (
      <section className="ap-panel">
        <div className="ap-panel-heading ap-list-heading">
          <div>
            <h2>Manage Food Items</h2>
            <p>
              {foodsLoading
                ? 'Loading Oracle records…'
                : `${foods.length} food records from Oracle`}
            </p>
          </div>

          <button
            className="ap-primary-button"
            onClick={loadFoods}
            disabled={foodsLoading}
          >
            {foodsLoading ? 'Loading…' : 'Refresh Foods'}
          </button>
        </div>

        <input
          className="ap-search"
          placeholder="Search food items by name or category..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        {renderFoodTable(filtered, true)}

        <p className="ap-demo-note">
          Inventory changes are saved through the protected admin API.
          Adding foods and editing names, categories, or prices require
          separate backend endpoints.
        </p>
      </section>
    );
  }

  
function renderOrdersPage() {
  const activeOrders = orders.filter(
    order =>
      !(
        order.ORDER_STATUS === 'DELIVERED' &&
        order.PAYMENT_STATUS === 'PAID'
      )
  );

  return (
    <section className="ap-panel">
      <div className="ap-panel-heading ap-list-heading">
        <div>
          <h2>Manage Orders</h2>
          <p>
            {ordersLoading
              ? 'Loading orders from Oracle…'
              : `${activeOrders.length} active orders`}
          </p>
        </div>

        <button
          className="ap-primary-button"
          onClick={loadOrders}
          disabled={ordersLoading}
        >
          {ordersLoading ? 'Loading…' : 'Refresh Orders'}
        </button>
      </div>

      {ordersError ? (
        <div className="ap-empty-state">
          <span>!</span>
          <h3>Unable to load orders</h3>
          <p>{ordersError}</p>
          <button className="ap-primary-button" onClick={loadOrders}>
            Retry
          </button>
        </div>
      ) : ordersLoading ? (
        <div className="ap-empty-state">
          Loading database orders…
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="ap-empty-state">
          <span>▣</span>
          <h3>No active orders</h3>
          <p>
            All orders have been completed, or no orders are available.
            Completed orders remain saved in Oracle.
          </p>
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Delivery Address</th>
              </tr>
            </thead>

            <tbody>
              {activeOrders.map(order => (
                <tr key={order.ORDER_ID}>
                  <td>
                    <strong>#{order.ORDER_ID}</strong>
                  </td>

                  <td>
                    <strong>{order.FULL_NAME || 'Customer'}</strong>
                    <br />
                    {order.EMAIL || '—'}
                    <br />
                    {order.PHONE || '—'}
                  </td>

                  <td>
                    {order.ORDER_DATE
                      ? new Date(order.ORDER_DATE).toLocaleString('en-IN')
                      : '—'}
                  </td>

                  <td>{money(order.TOTAL_AMOUNT)}</td>

                  <td>
                    <select
                      value={order.ORDER_STATUS || ''}
                      disabled={savingOrderId === order.ORDER_ID}
                      onChange={event =>
                        updateOrderStatus(order, event.target.value)
                      }
                      aria-label={`Status for order ${order.ORDER_ID}`}
                    >
                      {!ORDER_STATUSES.includes(order.ORDER_STATUS) &&
                        order.ORDER_STATUS && (
                          <option value={order.ORDER_STATUS}>
                            {order.ORDER_STATUS}
                          </option>
                        )}

                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </select>

                    {savingOrderId === order.ORDER_ID && (
                      <small>Saving…</small>
                    )}
                  </td>

                  <td>
                    {order.PAYMENT_METHOD === 'COD' &&
                    order.ORDER_STATUS === 'DELIVERED' &&
                    order.PAYMENT_STATUS === 'PAID'
                      ? 'COD RECEIVED'
                      : order.PAYMENT_METHOD === 'COD' &&
                          order.ORDER_STATUS === 'DELIVERED'
                        ? 'COD — PAYMENT PENDING'
                        : `${order.PAYMENT_METHOD || '—'} — ${order.PAYMENT_STATUS || '—'}`}
                  </td>

                  <td>{order.DELIVERY_ADDRESS || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function renderEnquiries() {
  return (
    <section className="sn-enquiries">
      <div className="sn-enquiries-hero">
        <div>
          <span className="sn-enquiries-eyebrow">
            CUSTOMER RELATIONS
          </span>
          <h2>Inbox & Enquiries</h2>
          <p>
            Every message matters. Manage customer questions
            and respond with care.
          </p>
        </div>

        <button
          type="button"
          className="sn-enquiries-refresh"
          onClick={loadEnquiries}
          disabled={enquiriesLoading}
        >
          {enquiriesLoading ? 'Loading...' : '↻ Refresh Inbox'}
        </button>
      </div>

      <div className="sn-enquiries-stats">
        <div className="sn-enquiry-stat">
          <span>Total Messages</span>
          <strong>{enquiries.length}</strong>
        </div>

        <div className="sn-enquiry-stat">
          <span>Awaiting Reply</span>
          <strong>
            {enquiries.filter(
              (item) => item.STATUS !== 'REPLIED'
            ).length}
          </strong>
        </div>

        <div className="sn-enquiry-stat">
          <span>Replied</span>
          <strong>
            {enquiries.filter(
              (item) => item.STATUS === 'REPLIED'
            ).length}
          </strong>
        </div>
      </div>

      {enquiriesError && (
        <div className="sn-enquiries-error" role="alert">
          {enquiriesError}
        </div>
      )}

      {enquiriesLoading ? (
        <div className="sn-enquiries-empty">
          Loading your inbox...
        </div>
      ) : enquiries.length === 0 ? (
        <div className="sn-enquiries-empty">
          <span className="sn-enquiries-empty-icon">✉</span>
          <h3>Your inbox is clear</h3>
          <p>Customer enquiries will appear here.</p>
        </div>
      ) : (
        <div className="sn-enquiries-list">
          {enquiries.map((enquiry) => (
            <article
              className="sn-enquiry-card"
              key={enquiry.ENQUIRY_ID}
            >
              <div className="sn-enquiry-card-top">
                <div className="sn-enquiry-customer">
                  <div className="sn-enquiry-avatar">
                    {(enquiry.FULL_NAME || 'C')
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>{enquiry.FULL_NAME}</h3>
                    <a href={`mailto:${enquiry.EMAIL}`}>
                      {enquiry.EMAIL}
                    </a>
                  </div>
                </div>

                <span
                  className={`sn-enquiry-status ${
                    enquiry.STATUS === 'REPLIED'
                      ? 'is-replied'
                      : 'is-new'
                  }`}
                >
                  {enquiry.STATUS === 'REPLIED'
                    ? '✓ Replied'
                    : '● Awaiting reply'}
                </span>
              </div>

              <div className="sn-enquiry-message">
                <div className="sn-enquiry-message-heading">
                  <span>SUBJECT</span>
                  <time>
                    {enquiry.CREATED_AT
                      ? new Date(
                          enquiry.CREATED_AT
                        ).toLocaleString()
                      : 'Date unavailable'}
                  </time>
                </div>

                <h4>{enquiry.SUBJECT}</h4>
                <p>{enquiry.MESSAGE}</p>
              </div>

              {enquiry.ADMIN_REPLY && (
                <div className="sn-enquiry-previous-reply">
                  <strong>Previously sent reply</strong>
                  <p>{enquiry.ADMIN_REPLY}</p>
                  {enquiry.REPLIED_AT && (
                    <small>
                      Replied on{' '}
                      {new Date(
                        enquiry.REPLIED_AT
                      ).toLocaleString()}
                    </small>
                  )}
                </div>
              )}

              <div className="sn-enquiry-reply">
                <label htmlFor={`reply-${enquiry.ENQUIRY_ID}`}>
                  {enquiry.ADMIN_REPLY
                    ? 'Update your reply'
                    : 'Write a response'}
                </label>

                <textarea
                  id={`reply-${enquiry.ENQUIRY_ID}`}
                  rows={4}
                  maxLength={2000}
                  placeholder="Write a helpful response to your customer..."
                  value={
                    replyDrafts[enquiry.ENQUIRY_ID] || ''
                  }
                  onChange={(event) =>
                    setReplyDrafts((previous) => ({
                      ...previous,
                      [enquiry.ENQUIRY_ID]:
                        event.target.value,
                    }))
                  }
                />

                <div className="sn-enquiry-reply-footer">
                  <small>
                    {(replyDrafts[enquiry.ENQUIRY_ID] || '').length}
                    /2000 characters
                  </small>

                  <button
                    type="button"
                    className="sn-enquiry-send"
                    onClick={() => saveEnquiryReply(enquiry)}
                    disabled={
                      savingEnquiryId === enquiry.ENQUIRY_ID
                    }
                  >
                    {savingEnquiryId === enquiry.ENQUIRY_ID
                      ? 'Saving...'
                      : 'Send Reply →'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
  function renderCustomers() {
    return (
      <section className="ap-panel">
        <div className="ap-panel-heading ap-list-heading">
          <div>
            <h2>Customers</h2>
            <p>
              {customersLoading
                ? 'Loading customer accounts…'
                : `${customers.length} registered database customers`}
            </p>
          </div>

          <button
            className="ap-primary-button"
            onClick={loadCustomers}
            disabled={customersLoading}
          >
            {customersLoading ? 'Loading…' : 'Refresh Customers'}
          </button>
        </div>

        {customersError ? (
          <div className="ap-empty-state">
            <span>!</span>
            <h3>Unable to load customers</h3>
            <p>{customersError}</p>
            <button className="ap-primary-button" onClick={loadCustomers}>
              Retry
            </button>
          </div>
        ) : customersLoading ? (
          <div className="ap-empty-state">Loading customers from Oracle…</div>
        ) : customers.length === 0 ? (
          <div className="ap-empty-state">
            <span>♙</span>
            <h3>No customer records found</h3>
            <p>
              Customer accounts will appear here when they exist in the
              SpiceNest USERS table.
            </p>
          </div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Account Status</th>
                </tr>
              </thead>

              <tbody>
                {customers.map(customer => (
                  <tr key={customer.USER_ID}>
                    <td>#{customer.USER_ID}</td>
                    <td><strong>{customer.FULL_NAME || '—'}</strong></td>
                    <td>{customer.EMAIL || '—'}</td>
                    <td>{customer.PHONE || '—'}</td>
                    <td>
                      <span
                        className={`ap-status ${
                          customer.ACCOUNT_STATUS === 'ACTIVE'
                            ? 'ap-status-active'
                            : ''
                        }`}
                      >
                        {customer.ACCOUNT_STATUS || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  
function renderOrderHistory() {
  const completedOrders = orders.filter(
    order =>
      order.ORDER_STATUS === 'DELIVERED' &&
      order.PAYMENT_STATUS === 'PAID'
  );

  return (
    <section className="ap-panel">
      <div className="ap-panel-heading ap-list-heading">
        <div>
          <h2>Order History</h2>
          <p>
            {ordersLoading
              ? 'Loading order history from Oracle…'
              : `${completedOrders.length} completed orders`}
          </p>
        </div>

        <button
          className="ap-primary-button"
          onClick={loadOrders}
          disabled={ordersLoading}
        >
          {ordersLoading ? 'Loading…' : 'Refresh History'}
        </button>
      </div>

      {ordersError ? (
        <div className="ap-empty-state">
          <h3>Unable to load order history</h3>
          <p>{ordersError}</p>
          <button className="ap-primary-button" onClick={loadOrders}>
            Retry
          </button>
        </div>
      ) : ordersLoading ? (
        <div className="ap-empty-state">
          Loading completed orders…
        </div>
      ) : completedOrders.length === 0 ? (
        <div className="ap-empty-state">
          <span>▤</span>
          <h3>No completed orders yet</h3>
          <p>
            Orders will appear here after they are delivered and payment
            is marked as paid. All records remain saved in Oracle.
          </p>
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Delivery Address</th>
              </tr>
            </thead>

            <tbody>
              {completedOrders.map(order => (
                <tr key={order.ORDER_ID}>
                  <td>
                    <strong>#{order.ORDER_ID}</strong>
                  </td>

                  <td>
                    <strong>{order.FULL_NAME || 'Customer'}</strong>
                    <br />
                    {order.EMAIL || '—'}
                    <br />
                    {order.PHONE || '—'}
                  </td>

                  <td>
                    {order.ORDER_DATE
                      ? new Date(order.ORDER_DATE).toLocaleString('en-IN')
                      : '—'}
                  </td>

                  <td>{money(order.TOTAL_AMOUNT)}</td>

                  <td>{order.ORDER_STATUS}</td>

                  <td>
                    {order.PAYMENT_METHOD === 'COD' &&
                    order.PAYMENT_STATUS === 'PAID'
                      ? 'COD RECEIVED'
                      : `${order.PAYMENT_METHOD || '—'} — ${order.PAYMENT_STATUS || '—'}`}
                  </td>

                  <td>{order.DELIVERY_ADDRESS || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


  function renderCategories() {
    const categories = [...new Set(foods.map(food => food.category))].sort();

    return (
      <section className="ap-panel">
        <div className="ap-panel-heading">
          <div>
            <h2>Categories</h2>
            <p>Categories represented by the Oracle food records</p>
          </div>
        </div>

        {foodsLoading ? (
          <p>Loading categories…</p>
        ) : foodsError ? (
          <p>{foodsError}</p>
        ) : categories.length === 0 ? (
          <div className="ap-empty-state">No food categories found.</div>
        ) : (
          <div className="ap-category-grid">
            {categories.map(category => (
              <article key={category} className="ap-category-card">
                <span>▤</span>
                <h3>{category}</h3>
                <p>
                  {foods.filter(food => food.category === category).length}{' '}
                  food items
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderSimplePage(title, description) {
    return (
      <section className="ap-panel">
        <div className="ap-panel-heading">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        <div className="ap-empty-state">
          <span>▤</span>
          <h3>Integration required</h3>
          <p>
            This section still needs its backend functionality before it can
            display live application data.
          </p>
        </div>
      </section>
    );
  }

  const titles = {
    dashboard: [
      'Dashboard',
      "Here's what's happening with your restaurant.",
    ],
    foods: ['Food Items', 'Manage your menu and inventory.'],
    categories: ['Categories', 'Review your food categories.'],
    orders: ['Orders', 'Review customer orders and order status.'],
    orderHistory: ['Order History', 'Review completed and paid orders.'],
    enquiries: [
  'Customer Enquiries',
  'Review customer messages and manage replies.',
],
    customers: ['Customers', 'View registered customer accounts.'],
    reports: ['Reports', 'Restaurant reporting and analytics.'],
    settings: ['Settings', 'Administrator and application settings.'],
  };

  
function renderActivePage() {
  if (activePage === 'dashboard') return renderDashboard();
  if (activePage === 'foods') return renderFoods();
  if (activePage === 'orders') return renderOrdersPage();
  if (activePage === 'orderHistory') return renderOrderHistory();
  if (activePage === 'customers') return renderCustomers();
  if (activePage === 'categories') return renderCategories();
  if (activePage === 'enquiries') {
  return renderEnquiries();
}

  if (activePage === 'reports') {
  return renderReports();
}

  if (activePage === 'settings') {
  return renderSettings();
}

  return renderDashboard();
}

  return (
    <div className="ap-shell">
      <aside className="ap-sidebar">
        <div className="ap-brand">
          <span className="ap-brand-mark">✦</span>
          <span>
            SpiceNest
            <small>ADMIN PORTAL</small>
          </span>
        </div>

        <p className="ap-nav-label">WORKSPACE</p>

        {navigation.slice(0, 5).map(item => (
          <button
            key={item.id}
            className={`ap-nav-item ${
              activePage === item.id ? 'is-active' : ''
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <p className="ap-nav-label">INSIGHTS & CONFIGURATION</p>

        {navigation.slice(5).map(item => (
          <button
            key={item.id}
            className={`ap-nav-item ${
              activePage === item.id ? 'is-active' : ''
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="ap-sidebar-user">
          <div className="ap-user-avatar">
            {(user?.email || 'A').charAt(0).toUpperCase()}
          </div>

          <div className="ap-user-info">
            <strong>Administrator</strong>
            <small>{user?.email || 'Authorized account'}</small>
          </div>

          <button
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
          >
            ↪
          </button>
        </div>
      </aside>

      <main className="ap-main">
        <header className="ap-topbar">
          <div>
            <p className="ap-breadcrumb">SPICENEST / ADMINISTRATION</p>
            <h1>{titles[activePage][0]}</h1>
            <p>{titles[activePage][1]}</p>
          </div>

          <div className="ap-topbar-right">
            <span className="ap-secure-badge">
              <i /> Admin access verified
            </span>

            <div className="ap-user-avatar">
              {(user?.email || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {notice && (
          <div className="ap-notice" role="status">
            {notice}
            <button
              onClick={() => setNotice('')}
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </div>
        )}

        {renderActivePage()}

        <footer className="ap-footer">
          SPICENEST ADMIN PORTAL
          <span>Secure restaurant management</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, note }) {
  return (
    <article className="ap-stat-card">
      <div className="ap-stat-top">
        <span>{label}</span>
        <b>{icon}</b>
      </div>

      <h2>{value}</h2>
      <p>{note}</p>
    </article>
  );
}
