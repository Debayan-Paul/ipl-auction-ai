'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: any) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert('Error updating user: ' + err.error);
      }
    } catch (error) {
      alert('Error updating user');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ marginBottom: 'var(--space-2)' }}>👥 User Management</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage user roles and team assignments.</p>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-6)', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: 'var(--space-3)' }}>User</th>
              <th style={{ padding: 'var(--space-3)' }}>Role</th>
              <th style={{ padding: 'var(--space-3)' }}>Team</th>
              <th style={{ padding: 'var(--space-3)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 'var(--space-3)' }}>
                  <div style={{ fontWeight: 'bold' }}>{user.full_name || 'No Name'}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{user.email}</div>
                </td>
                <td style={{ padding: 'var(--space-3)' }}>
                  <select
                    className="input"
                    defaultValue={user.role}
                    style={{ padding: 'var(--space-1) var(--space-2)' }}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    disabled={updating === user.id}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business_manager">Business Manager</option>
                    <option value="business_auctioneer">Auctioneer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: 'var(--space-3)' }}>
                  <select
                    className="input"
                    defaultValue={user.team_abbreviation || ''}
                    style={{ padding: 'var(--space-1) var(--space-2)' }}
                    onChange={(e) => updateUser(user.id, { team_abbreviation: e.target.value || null })}
                    disabled={updating === user.id}
                  >
                    <option value="">None</option>
                    <option value="CSK">Chennai Super Kings (CSK)</option>
                    <option value="MI">Mumbai Indians (MI)</option>
                    <option value="RCB">Royal Challengers Bengaluru (RCB)</option>
                    <option value="KKR">Kolkata Knight Riders (KKR)</option>
                    <option value="DC">Delhi Capitals (DC)</option>
                    <option value="RR">Rajasthan Royals (RR)</option>
                    <option value="SRH">Sunrisers Hyderabad (SRH)</option>
                    <option value="PBKS">Punjab Kings (PBKS)</option>
                    <option value="GT">Gujarat Titans (GT)</option>
                    <option value="LSG">Lucknow Super Giants (LSG)</option>
                  </select>
                </td>
                <td style={{ padding: 'var(--space-3)' }}>
                  {updating === user.id ? <span style={{ color: 'var(--color-text-muted)' }}>Updating...</span> : '✔️'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
