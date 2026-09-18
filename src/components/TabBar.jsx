const TABS = [
  { key: "home", label: "Home" },
  { key: "archive", label: "Archive" },
  { key: "get involved", label: "Get Involved" },
];

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="sticky top-[57px] z-40 border-b border-ink/10 bg-paper/95 backdrop-blur dark:border-dark-border dark:bg-dark-bg/95">
      <div className="mx-auto flex max-w-6xl justify-center gap-2 px-5 py-2 md:justify-start md:gap-1 md:px-8 md:py-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`label-tag flex-1 rounded-full px-4 py-2 text-center transition-colors md:flex-none md:rounded-none md:border-b-2 md:px-4 md:py-3 ${
              activeTab === tab.key
                ? "bg-lab-800 text-paper md:border-lab-600 md:bg-transparent md:text-lab-800 dark:md:border-lab-500 dark:md:text-dark-ink"
                : "text-ink-soft hover:bg-lab-50 md:border-transparent md:hover:bg-transparent md:hover:text-lab-700 dark:text-dark-ink-soft dark:hover:bg-dark-surface/40 dark:md:hover:bg-transparent dark:md:hover:text-lab-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}