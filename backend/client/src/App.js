import React, { useEffect, useState, useRef } from "react";

// Use environment variable or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function App() {
  const [view, setView] = useState("list"); // "list" | "detail" | "auth" | "admin"
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("pollUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem("pollAdmin") === "true";
    } catch {
      return false;
    }
  });

  // Use refs to track current values without causing re-renders
  const selectedPollRef = useRef(selectedPoll);
  const viewRef = useRef(view);

  // Update refs when state changes
  useEffect(() => {
    selectedPollRef.current = selectedPoll;
  }, [selectedPoll]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // Set the page background image from the public folder
  useEffect(() => {
    const previousBackgroundImage = document.body.style.backgroundImage;
    const previousBackgroundRepeat = document.body.style.backgroundRepeat;
    const previousBackgroundSize = document.body.style.backgroundSize;
    const previousBackgroundPosition = document.body.style.backgroundPosition;
    const previousBackgroundAttachment = document.body.style.backgroundAttachment;

    document.body.style.backgroundImage = `url(${process.env.PUBLIC_URL}/Electronic-Voting-Blog---Image----1-.png)`;
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";

    return () => {
      document.body.style.backgroundImage = previousBackgroundImage;
      document.body.style.backgroundRepeat = previousBackgroundRepeat;
      document.body.style.backgroundSize = previousBackgroundSize;
      document.body.style.backgroundPosition = previousBackgroundPosition;
      document.body.style.backgroundAttachment = previousBackgroundAttachment;
    };
  }, []);

  // For "real-time" updates (basic approach: refetch every 3 seconds)
  useEffect(() => {
    fetchPolls();

    const intervalId = setInterval(() => {
      // Use refs to get current values without triggering re-renders
      const currentView = viewRef.current;
      const currentSelectedPoll = selectedPollRef.current;
      
      if (currentView === "detail" && currentSelectedPoll) {
        // Refresh just the selected poll
        fetchPollById(currentSelectedPoll._id, false);
      } else if (currentView === "list") {
        fetchPolls(false);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [view]); // Only depend on view, not selectedPoll

  const fetchPolls = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`${API_URL}/polls`);
      const data = await res.json();
      setPolls(data);
    } catch (err) {
      console.error("Error fetching polls", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchPollById = async (id, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`${API_URL}/polls/${id}`);
      const data = await res.json();
      setSelectedPoll(data);
    } catch (err) {
      console.error("Error fetching poll", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handlePollClick = (poll) => {
    setSelectedPoll(poll);
    setView("detail");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedPoll(null);
  };

  const handleCreatedPoll = (poll) => {
    // After creating, go to detail view
    setSelectedPoll(poll);
    setView("detail");
  };

  const handleUserChange = (user) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem("pollUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("pollUser");
      }
    } catch {
      // ignore storage errors
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem("pollAdmin", "true");
    } catch {
      // ignore
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem("pollAdmin");
    } catch {
      // ignore
    }
  };

  const deletePoll = async (pollId) => {
    // Extra safety: only allow delete when admin flag is true
    if (!isAdmin) {
      alert("Only admins can delete polls.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/polls/${pollId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete poll");
      }

      // After successful deletion, go back to list and refresh
      setView("list");
      setSelectedPoll(null);
      await fetchPolls();
    } catch (err) {
      console.error("Error deleting poll", err);
      alert(err.message || "Failed to delete poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>Online Polling & Voting System</h1>
        <p style={styles.subtitle}>
          Create polls, collect votes, and view live results in a secure, modern interface.
        </p>
      </header>

      <nav style={styles.nav}>
        <button
          onClick={() => setView("list")}
          style={view === "list" ? styles.activeButton : styles.button}
        >
          Surveys
        </button>
        <button
          onClick={() => setView("auth")}
          style={view === "auth" ? styles.activeButton : styles.button}
        >
          {currentUser ? `User: ${currentUser.name}` : "Register / Login"}
        </button>
        <button
          onClick={() => setView("admin")}
          style={view === "admin" ? styles.activeButton : styles.button}
        >
          {isAdmin ? "Admin (logged in)" : "Admin"}
        </button>
      </nav>

      <main style={styles.main}>
        {loading && <p>Loading...</p>}

        {!loading && view === "list" && (
          <PollList polls={polls} onPollClick={handlePollClick} />
        )}

        {!loading && view === "detail" && selectedPoll && (
          <PollDetail
            poll={selectedPoll}
            onBack={handleBackToList}
            onRefresh={() => fetchPollById(selectedPoll._id)}
            onDelete={isAdmin ? () => deletePoll(selectedPoll._id) : null}
            currentUser={currentUser}
            onRequireAuth={() => setView("auth")}
            isAdmin={isAdmin}
          />
        )}

        {!loading && view === "auth" && (
          <AuthForm
            currentUser={currentUser}
            onUserChange={handleUserChange}
            onDone={() => setView("list")}
          />
        )}

        {!loading && view === "admin" && (
          <AdminPanel
            isAdmin={isAdmin}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            onCreated={handleCreatedPoll}
          />
        )}
      </main>
    </div>
  );
}

// ====== Poll List Component ======
function PollList({ polls, onPollClick }) {
  if (polls.length === 0) {
    return <p>No polls yet. Create one!</p>;
  }

  return (
    <div>
      <h2>All Polls</h2>
      <ul style={styles.list}>
        {polls.map((poll) => (
          <li
            key={poll._id}
            style={styles.listItem}
            onClick={() => onPollClick(poll)}
          >
            <div>
              <strong>{poll.question}</strong>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                {poll.allowAnonymous ? "Anonymous voting allowed" : "Non-anonymous"}
              </div>
            </div>
            <span style={{ fontSize: "0.8rem", color: "#999" }}>
              {new Date(poll.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ====== Create Poll Form Component ======
function CreatePollForm({ onCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return; // keep at least 2 options
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedOptions = options.map((opt) => opt.trim()).filter((opt) => opt);
    if (!question.trim() || trimmedOptions.length < 2) {
      setError("Please enter a question and at least two options.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          options: trimmedOptions,
          allowAnonymous,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create poll");
      }

      const createdPoll = await res.json();
      onCreated(createdPoll);

      // Reset form
      setQuestion("");
      setOptions(["", ""]);
      setAllowAnonymous(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create a New Poll</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Question:
          <input
            style={styles.input}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to ask?"
          />
        </label>

        <div style={{ marginTop: "12px" }}>
          <div style={styles.label}>Options:</div>
          {options.map((opt, index) => (
            <div key={index} style={styles.optionRow}>
              <input
                style={styles.input}
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  style={styles.smallButton}
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            style={{ ...styles.button, marginTop: "8px" }}
          >
            + Add Option
          </button>
        </div>

        <label style={{ ...styles.label, marginTop: "12px" }}>
          <input
            type="checkbox"
            checked={allowAnonymous}
            onChange={(e) => setAllowAnonymous(e.target.checked)}
          />{" "}
          Allow anonymous voting
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          style={{ ...styles.button, marginTop: "16px" }}
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
}

// ====== Admin Panel (only admin can create polls) ======
function AdminPanel({ isAdmin, onAdminLogin, onAdminLogout, onCreated }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const ADMIN_CODE = "admin123"; // demo-only; change as needed

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      onAdminLogin();
      setError("");
    } else {
      setError("Invalid admin code.");
    }
  };

  return (
    <div>
      <h2>Admin Area</h2>
      {!isAdmin && (
        <>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Only administrators can create new polls. Enter the admin code to continue.
          </p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Admin code:
              <input
                style={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter admin code"
              />
            </label>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" style={{ ...styles.button, marginTop: "12px" }}>
              Login as Admin
            </button>
          </form>
        </>
      )}

      {isAdmin && (
        <>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            You are logged in as admin. You can create new polls below.
          </p>
          <button
            type="button"
            onClick={onAdminLogout}
            style={{
              ...styles.smallButton,
              marginBottom: "12px",
            }}
          >
            Log out as Admin
          </button>
          <CreatePollForm onCreated={onCreated} />
        </>
      )}
    </div>
  );
}

// ====== Simple Registration / Login Component ======
// This is a purely front-end "registration" that stores the user's
// display name in localStorage. Non-anonymous polls will require a
// user to be set before voting.
function AuthForm({ currentUser, onUserChange, onDone }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name.");
      return;
    }
    onUserChange({ name: trimmed });
    setError("");
    onDone();
  };

  const handleLogout = () => {
    onUserChange(null);
    setName("");
  };

  return (
    <div>
      <h2>Register / Login</h2>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        Set a display name to vote on polls that do not allow anonymous voting.
      </p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Display name:
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </label>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ ...styles.button, marginTop: "12px" }}>
          Save
        </button>
        {currentUser && (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              ...styles.smallButton,
              marginTop: "12px",
              marginLeft: "0",
            }}
          >
            Log out
          </button>
        )}
      </form>
    </div>
  );
}

// ====== Poll Detail & Voting Component ======
function PollDetail({
  poll,
  onBack,
  onRefresh,
  onDelete,
  currentUser,
  onRequireAuth,
  isAdmin,
}) {
  const [submittingVote, setSubmittingVote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(() => {
    try {
      const userKeyPart = currentUser?.name ? `_${currentUser.name}` : "";
      const key = `pollVote_${poll._id}${userKeyPart}`;
      const stored = localStorage.getItem(key);
      return stored !== null ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = async (optionIndex) => {
    if (!poll.allowAnonymous && !currentUser) {
      setError("You must register / log in before voting on this poll.");
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    if (selectedOptionIndex !== null && selectedOptionIndex !== optionIndex) {
      setError("You have already voted. Clear your response to change your vote.");
      return;
    }

    if (selectedOptionIndex === optionIndex) {
      setError("You have already voted for this option.");
      return;
    }

    setError("");
    setSubmittingVote(true);
    try {
      const res = await fetch(
        `${API_URL}/polls/${poll._id}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionIndex }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to vote");
      }

      const updatedPoll = await res.json();
      // Refresh by directly using the response
      // (or you could call onRefresh again)
      Object.assign(poll, updatedPoll);
      setSelectedOptionIndex(optionIndex);
      try {
        const userKeyPart = currentUser?.name ? `_${currentUser.name}` : "";
        localStorage.setItem(`pollVote_${poll._id}${userKeyPart}`, String(optionIndex));
      } catch {
        // ignore storage error
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleClearVote = async () => {
    if (selectedOptionIndex === null) {
      setError("You have not voted yet.");
      return;
    }

    // For non-anonymous polls, require login before clearing (so only that user can clear)
    if (!poll.allowAnonymous && !currentUser) {
      setError("You must register / log in before clearing your vote on this poll.");
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    setError("");
    setSubmittingVote(true);
    try {
      const res = await fetch(
        `${API_URL}/polls/${poll._id}/clear-vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionIndex: selectedOptionIndex }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Clear vote failed. Status:", res.status, "Body:", text);
        let message = "Failed to clear vote";
        try {
          const data = JSON.parse(text);
          if (data && data.message) {
            message = data.message;
          }
        } catch {
          // not JSON, fall back to raw text snippet
          if (text && text.trim().length > 0) {
            message = text.substring(0, 200);
          }
        }
        throw new Error(message);
      }

      const updatedPoll = await res.json();
      Object.assign(poll, updatedPoll);
      setSelectedOptionIndex(null);
      try {
        const userKeyPart = currentUser?.name ? `_${currentUser.name}` : "";
        localStorage.removeItem(`pollVote_${poll._id}${userKeyPart}`);
      } catch {
        // ignore
      }
      // Make sure UI is fully in sync with backend
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !onDelete) {
      setError("Only admins can delete polls.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      return;
    }

    setError("");
    setDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      console.error(err);
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} style={styles.button}>
        ← Back to Polls
      </button>
      <button onClick={onRefresh} style={{ ...styles.button, marginLeft: "8px" }}>
        Refresh Results
      </button>
      <button
        onClick={handleClearVote}
        disabled={submittingVote || selectedOptionIndex === null}
        style={{
          ...styles.button,
          marginLeft: "8px",
          backgroundColor: "#6c757d",
          borderColor: "#6c757d",
        }}
      >
        Clear Response
      </button>
      {isAdmin && onDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            ...styles.button,
            marginLeft: "8px",
            backgroundColor: "#dc3545",
            borderColor: "#dc3545",
          }}
        >
          {deleting ? "Deleting..." : "Delete Poll"}
        </button>
      )}

      <h2 style={{ marginTop: "16px" }}>{poll.question}</h2>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        {poll.allowAnonymous
          ? "Anonymous voting is allowed. Your identity is not stored."
          : "Anonymous voting is disabled (but this simple demo still does not store identities)."}
      </p>

      <div style={{ marginTop: "16px" }}>
        {poll.options.map((opt, index) => {
          const percentage = totalVotes
            ? ((opt.votes / totalVotes) * 100).toFixed(1)
            : 0;
          return (
            <div key={index} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{opt.text}</span>
                <span>
                  {opt.votes} vote(s) — {percentage}%
                </span>
              </div>
              <div style={styles.progressBarOuter}>
                <div
                  style={{
                    ...styles.progressBarInner,
                    width: `${percentage}%`,
                  }}
                ></div>
              </div>
              <button
                style={styles.button}
                disabled={submittingVote}
                onClick={() => handleVote(index)}
              >
                {submittingVote ? "Submitting..." : "Vote"}
              </button>
            </div>
          );
        })}
      </div>

      {totalVotes === 0 && (
        <p style={{ fontSize: "0.9rem", color: "#999" }}>
          No votes yet. Be the first to vote!
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "16px" }}>
        Last updated: {new Date(poll.updatedAt || poll.createdAt).toLocaleString()}
      </p>
    </div>
  );
}

// ====== Basic inline styles to keep things simple ======
const styles = {
  appContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px 16px",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#ffffff",
    textShadow: "0 1px 3px rgba(0,0,0,0.7)",
  },
  title: {
    margin: 0,
    fontSize: "2.4rem",
    letterSpacing: "0.03em",
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "1rem",
    opacity: 0.95,
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  main: {
    backgroundColor: "rgba(255, 255, 255, 0.92)", // semi-transparent white card
    padding: "24px 20px",
    borderRadius: "12px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
    backdropFilter: "blur(4px)",
  },
  button: {
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid #2563eb",
    backgroundColor: "#2563eb",
    color: "#f9fafb",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease",
  },
  activeButton: {
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid #1d4ed8",
    backgroundColor: "#1d4ed8",
    color: "#f9fafb",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: "10px 12px",
    marginBottom: "10px",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
    alignItems: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "bold",
    marginTop: "8px",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    marginTop: "4px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  optionRow: {
    display: "flex",
    gap: "4px",
    marginBottom: "4px",
  },
  smallButton: {
    padding: "4px 8px",
    borderRadius: "999px",
    border: "1px solid #dc2626",
    backgroundColor: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  progressBarOuter: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
    margin: "4px 0 8px 0",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#28a745",
  },
};

export default App;
