"use client";

import { useState } from "react";

export default function DreamInput() {
  const [dream, setDream] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dream.trim()) return;
    
    // Instead of calling an event handler prop, call an API route
    // For example, assume you have an API route at /api/dreams
    try {
      const res = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamText: dream }),
      });
      if (res.ok) {
        console.log("New dream submitted successfully");
      } else {
        console.error("Error submitting dream");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    
    setDream("");
  };

  return (
    <div className="fixed w-full bg-white shadow-md z-40" style={{ top: "60px" }}>
      <div className="container mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            className="w-full border border-gray-300 rounded p-2 focus:outline-none"
            placeholder="Enter your dream here..."
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            rows={3}
            maxLength={8000}
          />
          <div className="absolute right-2 bottom-2 text-xs text-gray-500">
            {dream.length}/8000
          </div>
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Dream
          </button>
        </form>
      </div>
    </div>
  );
}