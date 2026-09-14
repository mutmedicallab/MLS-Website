import { useState } from "react";
import { API_BASE_URL } from "../config/api";

const initialForm = {
  fullName: "",
  email: "",
  yearOfStudy: "",
  phone: "",
  message: "",
};

export default function JoinForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/membership/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-lab-500/40 bg-lab-800/60 p-6 text-center">
        <p className="label-tag text-lab-500">Application received</p>
        <p className="mt-2 text-paper/80">
          Thanks — we've got your details. A committee member will follow up soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="label-tag mt-4 text-lab-500 underline underline-offset-4"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <YearSelect value={form.yearOfStudy} onChange={handleChange} />
        <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} required/>
      </div>
      <div>
        <label className="label-tag mb-1.5 block text-paper/70" htmlFor="message">
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={form.message}
          onChange={handleChange}
          className="w-full rounded-sm border border-paper/20 bg-paper/5 px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:border-lab-500 focus:outline-none"
          placeholder="Anything you'd like the committee to know"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-coral-500">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-sm bg-coral-500 px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="label-tag mb-1.5 block text-paper/70" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-sm border border-paper/20 bg-paper/5 px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:border-lab-500 focus:outline-none"
      />
    </div>
  );
}

function YearSelect({ value, onChange }) {
  return (
    <div>
      <label className="label-tag mb-1.5 block text-paper/70" htmlFor="yearOfStudy">
        Year of study
      </label>
      <select
        id="yearOfStudy"
        name="yearOfStudy"
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-sm border border-paper/20 bg-paper/5 px-3 py-2 text-sm text-paper focus:border-lab-500 focus:outline-none"
      >
        <option value="" disabled className="text-ink">
          Select your year
        </option>
        <option value="Y1" className="text-ink">Year 1</option>
        <option value="Y2" className="text-ink">Year 2</option>
        <option value="Y3" className="text-ink">Year 3</option>
        <option value="Y4" className="text-ink">Year 4</option>
      </select>
    </div>
  );
}