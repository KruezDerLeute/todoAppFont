"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTasks, deleteTask } from "@/lib/api";
import styles from "./dashboard.module.css";

const PRIORITY_COLOR = { high: "#f87171", medium: "#facc15", low: "#4ade80" };
const PRIORITY_BG = { high: "rgba(248,113,113,0.1)", medium: "rgba(250,204,21,0.1)", low: "rgba(74,222,128,0.1)" };

export default function Dashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [filters, setFilters] = useState({ page: 1, limit: 8, priority: "", category: "", status: "" });
  const [loading, setLoading] = useState(true);

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status !== "completed").length,
    high: tasks.filter(t => t.priority === "high").length,
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      const res = await getTasks(clean);
      setTasks(res.tasks || res.data || []);
      if (res.totalPages) setMeta({ total: res.total, totalPages: res.totalPages, currentPage: res.currentPage });
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [filters, router]);

  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    load();
  };

  const logout = () => { localStorage.removeItem("token"); router.push("/login"); };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className={styles.wrap}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>TaskFlow</div>
        <nav className={styles.nav}>
          <span className={styles.navItem + " " + styles.active}>Dashboard</span>
          <Link href="/tasks/new" className={styles.navItem}>+ New Task</Link>
        </nav>
        <button className={styles.logout} onClick={logout}>Sign out</button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.sub}>Manage your tasks</p>
          </div>
          <Link href="/tasks/new">
            <button className="btn-primary">+ New Task</button>
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {[
            { label: "Total", value: meta.total || stats.total, color: "#7c6aff" },
            { label: "Completed", value: stats.done, color: "#4ade80" },
            { label: "Pending", value: stats.pending, color: "#facc15" },
            { label: "High Priority", value: stats.high, color: "#f87171" },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statNum} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <select value={filters.priority} onChange={e => setFilter("priority", e.target.value)} style={{ width: "auto" }}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filters.status} onChange={e => setFilter("status", e.target.value)} style={{ width: "auto" }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input placeholder="Filter by category..." value={filters.category} onChange={e => setFilter("category", e.target.value)} style={{ width: "180px" }} />
        </div>

        {/* Tasks */}
        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <p>No tasks yet.</p>
            <Link href="/tasks/new"><button className="btn-primary" style={{ marginTop: "1rem" }}>Create your first task</button></Link>
          </div>
        ) : (
          <div className={styles.taskGrid}>
            {tasks.map(t => (
              <div key={t._id} className={styles.taskCard + " fade-up"}>
                <div className={styles.taskTop}>
                  <span className={styles.priority} style={{ color: PRIORITY_COLOR[t.priority], background: PRIORITY_BG[t.priority] }}>
                    {t.priority}
                  </span>
                  {t.category && <span className={styles.category}>{t.category}</span>}
                </div>
                <h3 className={styles.taskTitle}>{t.title}</h3>
                {t.description && <p className={styles.taskDesc}>{t.description}</p>}
                {t.deadline && (
                  <p className={styles.deadline}>
                    📅 {new Date(t.deadline).toLocaleDateString()}
                  </p>
                )}
                <div className={styles.taskActions}>
                  <span className={styles.status} data-status={t.status}>{t.status}</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/tasks/${t._id}`}><button className="btn-ghost" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>Edit</button></Link>
                    <button className="btn-danger" onClick={() => del(t._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className={styles.pagination}>
            <button className="btn-ghost" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
            <span className={styles.pageInfo}>{filters.page} / {meta.totalPages}</span>
            <button className="btn-ghost" disabled={filters.page >= meta.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
          </div>
        )}
      </main>
    </div>
  );
}
