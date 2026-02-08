import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/logs');
        setLogs(res.data);
      } catch (err) {
        setError('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Loading logs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Domain Operation Logs</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Domain</th>
            <th className="border px-2 py-1">Action</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td className="border px-2 py-1">{log.domain}</td>
              <td className="border px-2 py-1">{log.action}</td>
              <td className="border px-2 py-1">{log.user?.name || log.user?.email || 'System'}</td>
              <td className="border px-2 py-1">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLogs;
