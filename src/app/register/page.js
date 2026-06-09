"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";
import styles from "./auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await register(form);
      localStorage.setItem("token", data.token);
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
        <div className={styles.brand}>TaskFlow</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Start managing your tasks</p>

        <div className={styles.fields}>
          <div>
            <span className="label">Name</span>
            <input name="name" placeholder="Your name" value={form.name} onChange={handle} />
          </div>
          <div>
            <span className="label">Email</span>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
          </div>
          <div>
            <span className="label">Password</span>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" style={{ width: "100%" }} onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </div>

        <p className={styles.footer}>
          Have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
