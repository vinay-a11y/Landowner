
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/auth/forgot-password", { username });
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-[380px] p-8 rounded-xl shadow"
      >
        <h1 className="text-xl font-bold mb-4">Forgot Password</h1>

        {sent ? (
          <p className="text-green-600 text-sm">
            If the user exists, reset instructions were sent.
          </p>
        ) : (
          <>
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <button className="w-full bg-emerald-600 text-white py-2 rounded">
              Submit
            </button>
          </>
        )}

        <div className="text-center mt-4 text-sm">
          <Link to="/login" className="text-emerald-600">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
