import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Timeline.css";

interface TimelineItem {
  period: string;
  company: string;
  position: string;
  description: string[];
  current?: boolean;
}

const Timeline: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const experience: TimelineItem[] = [
    {
      period: "Jan 2011 — Apr 2013 (2 года 4 мес)",
      company: "Medexport",
      position: "Junior C# Developer",
      description: [
        "Developing application for order (.net framework 2.0, WSDL, REST API)",
        "Support clients",
      ],
    },
    {
      period: "Aug 2013 — Oct 2015 (2 года 3 мес)",
      company: "FTO",
      position: "Middle 1С Developer",
      description: [
        "Participate in huge integration of ERP",
        "Support 1С & MS SQL Server",
      ],
    },
    {
      period: "Oct 2015 — Feb 2017 (1 год 5 мес)",
      company: "Omskoe lekarstvo",
      position: "Teamlead",
      description: [
        "Integrate and support ERP (t-sql, .net framework, power bi)",
        "Create DWH (Microsoft SSIS, SSAS, Power BI, DAX)",
      ],
    },
    {
      period: "Feb 2017 — Feb 2020 (3 года)",
      company: "ASNA",
      position: "Senior C# Developer",
      description: [
        "Create data analysis tools & views (t-sql, .net framework, power bi, wpf)",
        "Support DWH",
      ],
    },
    {
      period: "Feb 2020 — Feb 2021 (1 год)",
      company: "Pharma Trade Service",
      position: "Teamlead",
      description: [
        "Create stable support for clients",
        "Create service for collect & pushing data (.net core 3 + .net framework)",
      ],
    },
    {
      period: "Feb 2021 — Jun 2022 (1 год 5 мес)",
      company: "Freelance",
      position: "Senior Developer",
      description: [
        "Platform for rapid creating data applications (aquila) (language + metadata)",
        "Streaming system for advertisement (aspnetcore + blazor server side + .net core 6)",
      ],
    },
    {
      period: "Jun 2022 — Present (3 года 5 мес)",
      company: "Dynamicsun",
      position: ".NET Developer",
      current: true,
      description: [
        "Research and Development (R&D)",
        "Machine Learning integration and development",
        ".NET platform development",
      ],
    },
  ];

  useEffect(() => {
    // Прокрутить в конец при монтировании компонента
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="experience">
      <h2>Опыт работы</h2>
      <div className="timeline-container">
        <div className="timeline-scroll" ref={scrollRef}>
          <div className="timeline-horizontal">
            {experience.map((item, index) => (
              <div
                key={index}
                className={`timeline-item ${item.current ? "current" : ""} ${index % 2 === 0 ? "top" : "bottom"} ${expandedIndex === index ? "expanded" : ""}`}
                onClick={() => toggleExpand(index)}
              >
                <div className="timeline-node-wrapper">
                  <div className="timeline-header-compact">
                    <div className="timeline-company-compact">
                      {item.company}
                    </div>
                    <div className="timeline-period-compact">{item.period}</div>
                    <div
                      className={`timeline-expanded-content ${expandedIndex === index ? "expanded" : "collapsed"}`}
                    >
                      <div className="timeline-position">{item.position}</div>
                      <ul className="timeline-description">
                        {item.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="timeline-connector"></div>
                  <div className="timeline-marker">
                    <FontAwesomeIcon
                      icon={[
                        "fas",
                        expandedIndex === index ? "chevron-up" : "briefcase",
                      ]}
                    />
                    {item.current && <span className="timeline-pulse"></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="timeline-scroll-hint">
          <FontAwesomeIcon icon={["fas", "chevron-left"]} />
          <span>Прокрутите для просмотра</span>
          <FontAwesomeIcon icon={["fas", "chevron-right"]} />
        </div>
      </div>
    </section>
  );
};

export default Timeline;
