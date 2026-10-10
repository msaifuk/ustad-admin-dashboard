import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Dashboard({ onLogout }) {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalCustomers: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    awaitingApproval: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [bookingsRes, workersRes, customersRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/admin/workers'),
        api.get('/admin/customers'),
      ]);

      const allBookings = bookingsRes.data.bookings;
      const allWorkers = workersRes.data.workers;
      const allCustomers = customersRes.data.customers;

      const completed = allBookings.filter(b => b.status === 'completed');
      const pending = allBookings.filter(b => b.status === 'pending');
      const revenue = completed.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

      setStats({
        totalWorkers: allWorkers.length,
        totalCustomers: allCustomers.length,
        totalBookings: allBookings.length,
        completedBookings: completed.length,
        pendingBookings: pending.length,
        totalRevenue: revenue,
        awaitingApproval: allWorkers.filter(
          w => !w.is_verified && (w.account_status || 'active') === 'active'
        ).length,
      });

      setBookings(allBookings.slice(0, 10));
      setWorkers(allWorkers);
    } catch (error) {
      // A 401 is handled globally in api.js (sends the user back to login).
      if (error.response?.status !== 401) {
        setError('Could not load data. Check your connection and press Refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify / suspend / ban / reinstate a worker. Each one asks first,
  // suspend and ban also ask for a reason the worker will see.
  const act = async (worker, kind) => {
    let url, body, question;
    if (kind === 'verify') {
      url = `/admin/workers/${worker.id}/verify`; body = { verified: true };
      question = `Verify ${worker.name}? They will be able to go online and get jobs.`;
    } else if (kind === 'unverify') {
      url = `/admin/workers/${worker.id}/verify`; body = { verified: false };
      question = `Remove verification from ${worker.name}? They will be taken offline.`;
    } else if (kind === 'reinstate') {
      url = `/admin/workers/${worker.id}/status`; body = { status: 'active' };
      question = `Reinstate ${worker.name}?`;
    } else {
      const status = kind === 'ban' ? 'banned' : 'suspended';
      const reason = window.prompt(
        `${kind === 'ban' ? 'Ban' : 'Suspend'} ${worker.name}.\n` +
        `Reason (the worker will see it, max 200 characters):`
      );
      if (reason === null) return; // cancelled
      url = `/admin/workers/${worker.id}/status`; body = { status, reason };
      question = null;
    }
    if (question && !window.confirm(question)) return;

    setBusyId(worker.id); setError(''); setNotice('');
    try {
      const res = await api.put(url, body);
      if (res.data.activeJobs > 0) {
        setNotice(
          `${worker.name} still has ${res.data.activeJobs} active job(s). ` +
          `Check Recent Bookings and sort them out.`
        );
      }
      await fetchData();
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Action failed. Check your connection and try again.');
      }
    } finally {
      setBusyId(null);
    }
  };

  const accountBadge = (w) => {
    const st = w.account_status || 'active';
    if (st === 'banned') return { text: 'Banned', bg: '#ef444420', color: '#ef4444' };
    if (st === 'suspended') return { text: 'Suspended', bg: '#f9731620', color: '#f97316' };
    if (!w.is_verified) return { text: 'Pending approval', bg: '#f59e0b20', color: '#b45309' };
    return { text: 'Verified', bg: '#10b98120', color: '#10b981' };
  };

  const STATUS_COLORS = {
    pending: '#f59e0b',
    accepted: '#3b82f6',
    on_the_way: '#8b5cf6',
    arrived: '#06b6d4',
    in_progress: '#f97316',
    completed: '#10b981',
    cancelled: '#ef4444',
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Ustad Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.logo}>اُستاد</h1>
          <p style={styles.subtitle}>Admin Dashboard</p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.liveIndicator}>🟢 Live</span>
          <button style={styles.refreshBtn} onClick={fetchData}>
            🔄 Refresh
          </button>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {notice && <div style={styles.noticeBox}>{notice}</div>}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👷</div>
          <div style={styles.statNumber}>{stats.totalWorkers}</div>
          <div style={styles.statLabel}>Total Workers</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statNumber}>{stats.totalCustomers}</div>
          <div style={styles.statLabel}>Total Customers</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statNumber}>{stats.totalBookings}</div>
          <div style={styles.statLabel}>Total Bookings</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #10b981' }}>
          <div style={styles.statIcon}>✅</div>
          <div style={{ ...styles.statNumber, color: '#10b981' }}>
            {stats.completedBookings}
          </div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #b45309' }}>
          <div style={styles.statIcon}>📝</div>
          <div style={{ ...styles.statNumber, color: '#b45309' }}>
            {stats.awaitingApproval}
          </div>
          <div style={styles.statLabel}>Awaiting approval</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #f59e0b' }}>
          <div style={styles.statIcon}>⏳</div>
          <div style={{ ...styles.statNumber, color: '#f59e0b' }}>
            {stats.pendingBookings}
          </div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #6353f7' }}>
          <div style={styles.statIcon}>💰</div>
          <div style={{ ...styles.statNumber, color: '#6353f7' }}>
            PKR {Math.round(stats.totalRevenue).toLocaleString()}
          </div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
      </div>

      <div style={styles.mainGrid}>

        {/* Workers: approvals and account control */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👷 Workers</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Trade</th>
                <th style={styles.th}>Level</th>
                <th style={styles.th}>Jobs</th>
                <th style={styles.th}>Rating</th>
                <th style={styles.th}>Online</th>
                <th style={styles.th}>Account</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => {
                const badge = accountBadge(worker);
                const st = worker.account_status || 'active';
                const busy = busyId === worker.id;
                return (
                  <tr key={worker.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div>{worker.name}</div>
                      <div style={styles.muted}>
                        {worker.phone}
                        {worker.cnic_last4 ? ` · CNIC ending ${worker.cnic_last4}` : ''}
                      </div>
                    </td>
                    <td style={styles.td}>{worker.trade}</td>
                    <td style={styles.td}>
                      <span style={styles.levelBadge}>{worker.level}</span>
                    </td>
                    <td style={styles.td}>{worker.total_jobs}</td>
                    <td style={styles.td}>⭐ {parseFloat(worker.rating || 0).toFixed(1)}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: worker.is_online ? '#10b98120' : '#6b728020',
                        color: worker.is_online ? '#10b981' : '#6b7280',
                      }}>
                        {worker.is_online ? '🟢 Online' : '🔴 Offline'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        title={worker.status_reason || ''}
                        style={{ ...styles.badge, backgroundColor: badge.bg, color: badge.color }}
                      >
                        {badge.text}
                      </span>
                      {worker.active_jobs > 0 && (
                        <div style={styles.muted}>{worker.active_jobs} active job(s)</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        {!worker.is_verified && st === 'active' && (
                          <button disabled={busy} style={styles.verifyBtn}
                            onClick={() => act(worker, 'verify')}>Verify</button>
                        )}
                        {worker.is_verified && st === 'active' && (
                          <button disabled={busy} style={styles.ghostBtn}
                            onClick={() => act(worker, 'unverify')}>Unverify</button>
                        )}
                        {st === 'active' && (
                          <button disabled={busy} style={styles.warnBtn}
                            onClick={() => act(worker, 'suspend')}>Suspend</button>
                        )}
                        {st === 'active' && (
                          <button disabled={busy} style={styles.dangerBtn}
                            onClick={() => act(worker, 'ban')}>Ban</button>
                        )}
                        {st !== 'active' && (
                          <button disabled={busy} style={styles.verifyBtn}
                            onClick={() => act(worker, 'reinstate')}>Reinstate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent Bookings */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Recent Bookings</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Service</th>
                <th style={styles.th}>Worker</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={styles.tableRow}>
                  <td style={styles.td}>#{booking.id}</td>
                  <td style={styles.td}>{booking.customer_name || 'N/A'}</td>
                  <td style={styles.td}>{booking.service_name || 'N/A'}</td>
                  <td style={styles.td}>{booking.worker_name || 'Unassigned'}</td>
                  <td style={styles.td}>PKR {booking.amount}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: STATUS_COLORS[booking.status] + '20',
                      color: STATUS_COLORS[booking.status],
                    }}>
                      {booking.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  },
  logo: {
    fontSize: '36px',
    color: '#fff',
    margin: 0,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#9b93ff',
    margin: '4px 0 0',
    fontSize: '14px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  liveIndicator: {
    color: '#fff',
    fontSize: '14px',
  },
  refreshBtn: {
    backgroundColor: '#6353f7',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #9b93ff',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  noticeBox: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  muted: {
    color: '#999',
    fontSize: '11px',
    marginTop: '2px',
  },
  actionRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  verifyBtn: {
    backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  },
  ghostBtn: {
    backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', padding: '6px 12px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  },
  warnBtn: {
    backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', padding: '6px 12px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  },
  dangerBtn: {
    backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '6px 12px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderTop: '4px solid #6353f7',
  },
  statIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflowX: 'auto',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '16px',
    marginTop: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '12px',
    fontSize: '13px',
    color: '#444',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
  },
  levelBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#f0eeff',
    color: '#6353f7',
  },
};