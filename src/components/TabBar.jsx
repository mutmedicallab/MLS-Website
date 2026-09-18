// components/TabBar.jsx
import { Home, Archive, Star } from "lucide-react";

const TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "archive", label: "Archive", icon: Archive },
  { key: "get involved", label: "Get Involved", icon: Star },
];

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-ink/10 bg-lab-900 dark:border-dark-border">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? "text-coral-500" : "text-lab-400"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}