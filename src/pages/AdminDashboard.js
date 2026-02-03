import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminDashboard.css';
import API_BASE_URL from '../config';

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');
  const username = localStorage.getItem('adminUsername');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchAnalytics();
    fetchCustomers();
  }, [page, searchTerm]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
        return;
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to fetch analytics');
    }
  };

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/customers?page=${page}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
        return;
      }

      const data = await response.json();
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Customers fetch error:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin');
  };

  const handleViewCustomer = async (transactionId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/customer/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setSelectedCustomer(data);
    } catch (error) {
      console.error('Customer details error:', error);
      toast.error('Failed to fetch customer details');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `ZMW ${amount ? amount.toFixed(2) : '0.00'}`;
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Admin Dashboard</h1>
          <div className="header-actions">
            <span className="admin-username">👤 {username}</span>
            <button onClick={() => setShowPasswordModal(true)} className="change-password-btn">
              🔑 Change Password
            </button>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>{formatCurrency(analytics.totalRevenue)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>{analytics.completedTransactions}</h3>
              <p>Completed Sales</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h3>{analytics.todayTransactions}</h3>
              <p>Today's Transactions</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>{analytics.weekTransactions}</h3>
              <p>This Week</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Breakdown */}
      {analytics && analytics.paymentMethods && analytics.paymentMethods.length > 0 && (
        <div className="payment-breakdown">
          <h3>💳 Payment Methods</h3>
          <div className="payment-grid">
            {analytics.paymentMethods.map((method, index) => (
              <div key={index} className="payment-item">
                <span className="method-name">{method.payment_method || 'Unknown'}</span>
                <span className="method-count">{method.count} transactions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="customers-section">
        <div className="section-header">
          <h2>👥 Customer Transactions</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by phone or transaction ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="no-data">No customers found</div>
        ) : (
          <>
            <div className="table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Phone Number</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <code className="transaction-id">
                          {customer.transaction_id.substring(0, 8)}...
                        </code>
                      </td>
                      <td>{customer.phone_number}</td>
                      <td>
                        <span className="payment-badge">
                          {customer.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td>{formatCurrency(customer.amount)}</td>
                      <td>
                        <span className={`status-badge status-${customer.status}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td>{formatDate(customer.created_at)}</td>
                      <td>
                        <button
                          onClick={() => handleViewCustomer(customer.transaction_id)}
                          className="view-btn"
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="page-btn"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="close-btn">
                X
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Transaction ID:</strong>
                <span>{selectedCustomer.transaction_id}</span>
              </div>
              <div className="detail-row">
                <strong>Phone:</strong>
                <span>{selectedCustomer.phone_number}</span>
              </div>
              <div className="detail-row">
                <strong>Payment Method:</strong>
                <span>{selectedCustomer.payment_method}</span>
              </div>
              <div className="detail-row">
                <strong>Amount:</strong>
                <span>{formatCurrency(selectedCustomer.amount)}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge status-${selectedCustomer.status}`}>
                  {selectedCustomer.status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{formatDate(selectedCustomer.created_at)}</span>
              </div>
              {selectedCustomer.completed_at && (
                <div className="detail-row">
                  <strong>Completed:</strong>
                  <span>{formatDate(selectedCustomer.completed_at)}</span>
                </div>
              )}
              {selectedCustomer.cv_data && (
                <div className="cv-preview">
                  <h3>CV Information</h3>
                  <p>
                    <strong>Name:</strong>{' '}
                    {selectedCustomer.cv_data.personalInfo?.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {selectedCustomer.cv_data.personalInfo?.email}
                  </p>
                  <p>
                    <strong>Profession:</strong>{' '}
                    {selectedCustomer.cv_data.personalInfo?.profession}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          token={token}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}

function ChangePasswordModal({ token, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Password changed successfully!');
        onClose();
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔑 Change Password</h2>
          <button onClick={onClose} className="close-btn">
            X
          </button>
        </div>
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
