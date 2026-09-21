import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import TabBar from "./components/TabBar";
import Hero from "./components/Hero";
import About from "./components/About";
import Focus from "./components/Focus";
import Cohorts from "./components/Cohorts";
import CurrentStudents from "./components/CurrentStudents";
import Events from "./components/Events";
import Bingo from "./components/Bingo";
import Quiz from "./components/Quiz";
import Speedround from "./components/Speedround";
import Moments from "./components/Moments";
import Alumni from "./components/Alumni";
import Committee from "./components/Committee";
import Newsletter from "./components/Newsletter";
import Join from "./components/Join";
import Footer from "./components/Footer";
import Reveal from "./components/Reveal";
import useDarkMode from "./hooks/useDarkMode";
import ChatWidget from "./components/ChatWidget";
import AdminPortal from "./components/AdminPortal";

// Maps a specific section hash to the tab it lives in, so a notification
// (or any shared link) linking to e.g. "#bingo" lands on the right tab
// AND scrolls to the right section — not just the tab's top.
const HASH_TO_TAB = {
  "#calendar": "get involved",
  "#bingo": "get involved",
  "#quiz": "get involved",
  "#speed-round": "get involved",
  "#get-involved": "get involved",
  "#archive": "archive",
  "#moments": "archive",
  "#alumni": "archive",
};

export default function App() {
  const [dark, setDark] = useDarkMode();
  const [activeTab, setActiveTab] = useState(() => {
    return HASH_TO_TAB[window.location.hash] || "home";
  });

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        // Wait for the active tab's content to actually mount before
        // scrolling, since the target section may not exist in the DOM
        // until activeTab switches to the tab it lives in.
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
      }
    }
  }, [activeTab]);

  if (window.location.pathname === "/admin") {
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-dark-bg dark:text-dark-ink">
      <TopBar />
      {activeTab === "home" && <Navbar dark={dark} setDark={setDark} />}

      <main className="pb-20"> {/* pb-20 reserves space so content isn't hidden behind the fixed bottom bar */}
        {activeTab === "home" && (
          <>
            <Hero />
            <Reveal>
              <About />
            </Reveal>
            <Focus />
            <Cohorts />
            <Committee />
            <Newsletter />
            <Reveal>
              <Join />
            </Reveal>
          </>
        )}

        {activeTab === "archive" && (
          <>
            <Reveal>
              <Moments />
            </Reveal>
            <Reveal>
              <Alumni />
            </Reveal>
            <Reveal>
              <CurrentStudents />
            </Reveal>
          </>
        )}

        {activeTab === "get involved" && (
          <>
            <Reveal>
              <Events />
            </Reveal>
            <Reveal>
              <Bingo />
            </Reveal>
            <Reveal>
              <Quiz />
            </Reveal>
            <Reveal>
              <Speedround />
            </Reveal>
          </>
        )}
      </main>

      <Footer />
      <ChatWidget />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Analytics />
    </div>
  );
}