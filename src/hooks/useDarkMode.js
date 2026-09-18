import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [dark, setDark] = useState(() => {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem("mlas-theme");
  if (saved) return saved === "dark";
  return true; // default to dark mode for first-time visitors
});

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    window.localStorage.setItem("mlas-theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark];
}
