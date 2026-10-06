import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalCustomers: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      });

      setBookings(allBookings.slice(0, 10));
      setWorkers(allWorkers.slice(0, 10));
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
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
        </div>
      </div>

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

        {/* Workers List */}
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
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id} style={styles.tableRow}>
                  <td style={styles.td}>{worker.name}</td>
                  <td style={styles.td}>{worker.trade}</td>
                  <td style={styles.td}>
                    <span style={styles.levelBadge}>
                      {worker.level}
                    </span>
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
    gridTemplateColumns: '1fr 1fr',
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