import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { entries, profile, Entry } from "../data/entries";
import Calendar from "../components/Calendar";
import EntryRow from "../components/EntryRow";

type Filter = "all" | Entry["type"];

const FILTER_DEF: Array<[Filter, string]> = [
  ["all", "все"],
  ["article", "статьи"],
  ["talk", "выступления"],
  ["work", "работа"],
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const filtered = (activeFilter === "all" ? entries.slice() : entries.filter((e) => e.type === activeFilter)).sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  const contactBits: React.ReactNode[] = [];
  if (profile.email)
    contactBits.push(
      <a key="email" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
    );
  if (profile.github)
    contactBits.push(
      <a key="gh" href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer">
        {profile.github}
      </a>
    );
  if (profile.twitter)
    contactBits.push(
      <a key="tw" href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
        @{profile.twitter}
      </a>
    );

  return (
    <>
      <section className="header">
        <h1>{profile.name}</h1>
        <p>{profile.bio}</p>
        <div className="contacts">{contactBits}</div>
      </section>

      <Calendar
        year={calYear}
        entries={entries}
        onYearStep={(d) => setCalYear((y) => y + d)}
        onSlug={(slug) => navigate(`/post/${slug}`)}
      />

      <div className="section-label">Записи</div>
      <div className="filters">
        {FILTER_DEF.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setActiveFilter(k)}
            className={activeFilter === k ? "active" : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <ul className="entry-list">
          {filtered.map((e, i) => (
            <EntryRow key={i} entry={e} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">Пока ничего нет.</div>
      )}
    </>
  );
};

export default HomePage;
