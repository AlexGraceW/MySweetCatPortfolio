"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [errorText, setErrorText] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorText("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorText(data?.error || "Failed to send message.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorText("Network error. Please try again later.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
      <input
        className="input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <textarea
        className="textarea"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send message"}
      </button>

      {status === "success" && (
        <div className="muted">Message sent successfully. Thank you!</div>
      )}

      {status === "error" && <div style={{ color: "#ffb3b3" }}>{errorText}</div>}
    </form>
  );
}
