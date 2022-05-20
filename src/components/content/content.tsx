import './content.css'
import Cube from '../cube/cube'

const Content = () => {
    return (
        <div className="page_content">
            <h1> Skills</h1>
            <div style={{ display: "inline-flex" }}>
                <div> <ul>
                    <li> .NET (.NET Core 3+, .NET Framework2.0+)</li>
                    <li> ORM: EF Core, NHibernate, Dapper</li>
                    <li> Frontend: Blazor, ReactJS, TypeScript, Javascript, Css</li>
                    <li> Desktop: WPF, Avalonia, Xamarin Forms, Windows Forms </li>
                    <li> DBA\DBD Microsoft SQL Server («Microsoft Certified Professional», passed exams «40-461» «40-462»)</li>
                    <li> DWH Creating (Clickhouse, MS SQL, Postgres)</li>
                    <li> BI (ETL, SSAS, SSIS)</li>
                    <li> Compiler building</li>
                    <li> Design applications</li>
                    <li> Language : Russian, English (pre intermidiate)</li>
                </ul>
                </div>
                <div>
                    <Cube />
                </div>
            </div>
            <h1>Experience</h1>
            <ul>
                <li>Feb 2021 — Present <span className="work">Freelance</span>
                    <p>1. Platform for rapid creating data applications (aquila) (language + metadata)</p>
                    <p>2. Streaming system for advertisement (aspnetcore + blazor server side + .net core 6)</p>
                </li>
                <li>Feb 2020 — Feb 2021 <span className="work">Pharma Trade Service Teamlead.</span>
                    <p>1. Create stable support for clients</p>
                    <p>2. Create service for collect & pushing data (.net core 3 + .net framework)</p>
                </li>
                <li>Feb 2017 — Feb 2020 <span className="work">«ASNA» Senior C# developer</span>
                    <p>1. Create data analysis tools & views (t-sql, .net framework, power bi, wpf)</p>
                    <p>2. Support DWH</p>
                </li>
                <li>Oct 2015 — Feb 2017 <span className="work">«Omskoe lekarstvo» Teamlead</span>
                    <p>1. Integrate and support ERP ( t-sql, .net framework, power bi )</p>
                    <p>2. Create DWH (Microsoft SSIS, SSAS, Power BI, DAX)</p>
                </li>
                <li>Aug 2013 — Oct 2015 <span className="work">«FTO» Middle 1С Developer. Arcitecture design & developing</span>
                    <p>1. Particapate in huge integration of ERP</p>
                    <p>2. Support 1С & MS SQL Server</p>
                </li>
                <li>Jan 2011 — Apr 2013 <span className="work">«Medexport» Junior C# Developer</span>
                    <p>1. Developing application for order (.net framework 2.0, WSDL, REST API)</p>
                    <p>2. Support clients</p>

                </li>
            </ul>
        </div>

    );
}

export default Content;