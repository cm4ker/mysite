import React from "react";
import { Link } from "react-router-dom";
import { Entry } from "../data/entries";
import { fmtDate, fmtMonth } from "../lib/date";

const TYPE_LABEL: Record<Entry["type"], string> = {
  article: "статья",
  talk: "выступление",
  work: "работа",
};

type Props = { entry: Entry };

const EntryRow: React.FC<Props> = ({ entry }) => {
  const tag = <span className="entry-tag">{TYPE_LABEL[entry.type]}</span>;

  if (entry.type === "article") {
    return (
      <li className="entry-row is-link">
        <span className="entry-date">{fmtDate(entry.date)}</span>
        <span>
          <Link
            to={`/post/${entry.slug}`}
            className="entry-title"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {entry.title}
          </Link>
        </span>
        {tag}
      </li>
    );
  }

  if (entry.type === "talk") {
    const linkable = !!entry.url;
    const titleNode = (
      <>
        {entry.title}
        {linkable && <span className="entry-arrow">↗</span>}
      </>
    );
    return (
      <li
        className={`entry-row${linkable ? " is-link" : ""}`}
        onClick={linkable ? () => window.open(entry.url, "_blank", "noopener") : undefined}
      >
        <span className="entry-date">{fmtDate(entry.date)}</span>
        <span>
          <span className="entry-title">{titleNode}</span>
          <div className="entry-sub">{entry.venue}</div>
        </span>
        {tag}
      </li>
    );
  }

  // work
  const period = `${fmtMonth(entry.date)} — ${entry.until ? fmtMonth(entry.until) : "сейчас"}`;
  return (
    <li className="entry-row">
      <span className="entry-date">{period}</span>
      <span>
        <span className="entry-title">{entry.title}</span>
        <div className="entry-sub">{entry.company}</div>
      </span>
      {tag}
    </li>
  );
};

export default EntryRow;
