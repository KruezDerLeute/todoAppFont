"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTask } from "@/lib/api";
import styles from "./task-form.module.css";

const INIT = { title: "", description: "", category: "", priority: "medium", deadline: "", status: "pending" };

export default function NewTask() {
  const router = useRouter();
  const [form, setForm] = useState(INIT);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    if (!form.title.trim()) return setError("Title is required.");
    setLoading(true);
    try {
      await createTask(form);
      router.push("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.panel + " fade-up"}>
        <div className={styles.top}>
          <Link href="/dashboard" className={styles.back}>← Back</Link>
          <div className={styles.brand}>TaskFlow</div>
        </div>

        <h1 className={styles.title}>New Task</h1>

        <div className={styles.fields}>
          <div>
            <span className="label">Title *</span>
            <input name="title" placeholder="What needs to be done?" value={form.title} onChange={handle} />
          </div>
          <div>
            <span className="label">Description</span>
            <textarea name="description" placeholder="Add details..." rows={3} value={form.description} onChange={handle} style={{ resize: "vertical" }} />
          </div>
          <div className={styles.row}>
            <div>
              <span className="label">Priority</span>
              <select name="priority" value={form.priority} onChange={handle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <span className="label">Status</span>
              <select name="status" value={form.status} onChange={handle}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div>
              <span className="label">Category</span>
              <input name="category" placeholder="e.g. Work, Personal" value={form.category} onChange={handle} />
            </div>
            <div>
              <span className="label">Deadline</span>
              <input name="deadline" type="date" value={form.deadline} onChange={handle} />
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className={styles.actions}>
            <Link href="/dashboard"><button className="btn-ghost">Cancel</button></Link>
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
