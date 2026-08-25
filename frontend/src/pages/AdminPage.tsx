import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Users, MessageSquare, Target, Activity, RefreshCw, Star } from 'lucide-react';
import { api } from '../services/api';

export const AdminPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/50 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Admin & System Telemetry
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time server health, registered user accounts, OpenRouter inference logs, and user feedback
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="outline-button px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* System Health Status Strip */}
      <div className="glass-card p-6 rounded-3xl border border-border grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-xs text-text-secondary block">System Status</span>
          <span className="text-lg font-bold text-emerald-400 flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {data?.system_health?.status || 'Operational'}
          </span>
        </div>

        <div>
          <span className="text-xs text-text-secondary block">AI Provider Engine</span>
          <span className="text-sm font-bold text-text-primary mt-1 block">
            {data?.system_health?.active_ai_provider || 'OpenRouter API'}
          </span>
        </div>

        <div>
          <span className="text-xs text-text-secondary block">Default Inference Model</span>
          <span className="text-xs font-bold text-primary truncate mt-1 block">
            {data?.system_health?.active_model || 'openai/gpt-4o-mini'}
          </span>
        </div>

        <div>
          <span className="text-xs text-text-secondary block">Memory / CPU Load</span>
          <span className="text-sm font-bold text-text-primary mt-1 block">
            RAM: {data?.system_health?.memory_percent || 42}% • CPU: {data?.system_health?.cpu_percent || 12}%
          </span>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered Users', value: data?.total_users || 1, icon: Users, color: 'text-primary' },
          { label: 'Conversations', value: data?.total_conversations || 0, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Total Messages', value: data?.total_messages || 0, icon: Activity, color: 'text-amber-400' },
          { label: 'Goals Created', value: data?.total_goals || 0, icon: Target, color: 'text-emerald-400' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-text-secondary">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <span className="text-2xl font-extrabold text-text-primary">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Users Directory Table */}
      <div className="glass-card p-6 rounded-3xl border border-border space-y-4">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Registered Users
        </h2>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="pb-3 font-semibold">User / Name</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Active Persona</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {(data?.users || []).map((u: any) => (
                <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                  <td className="py-3 font-bold text-text-primary">{u.preferred_name || 'Explorer'}</td>
                  <td className="py-3 text-text-secondary">{u.email}</td>
                  <td className="py-3 capitalize text-primary font-medium">{u.active_persona || 'krishna'}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] uppercase font-bold text-text-secondary">
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary/70">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminPage;
