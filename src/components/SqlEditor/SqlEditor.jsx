import { useEffect, useState } from "react";
import initSqlJs from "sql.js";
import "./SqlEditor.css";

function SqlEditor() {
  const [db, setDb] = useState(null);
  const [query, setQuery] = useState(``);
  const [result, setResult] = useState([]);
  const [message, setMessage] = useState("Loading Database...");

  // Load SQL.js database
  useEffect(() => {
    async function loadDatabase() {
      try {
        const SQL = await initSqlJs({
          locateFile: () => "/sql-wasm.wasm",
        });

        const database = new SQL.Database();

        setDb(database);
        setMessage("Database Ready");
      } catch (err) {
        console.error(err);
        setMessage("Failed to load database");
      }
    }

    loadDatabase();
  }, []);

  // Execute SQL
  const executeSQL = () => {
    if (!db) {
      setMessage("Database is still loading...");
      return;
    }

    try {
      const statements = query
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length);

      let output = [];

      statements.forEach((statement) => {
        if (statement.toUpperCase().startsWith("SELECT")) {
          output = db.exec(statement);
        } else {
          db.run(statement);
        }
      });

      setResult(output);
      setMessage("Executed Successfully");
    } catch (err) {
      console.error(err);
      setMessage(err.message);
      setResult([]);
    }
  };

  return (
    <div className="sql-editor">
      <h2>SQL Laboratory</h2>

      <textarea
        placeholder="Write SQL Query Here..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="buttons">
        <button onClick={executeSQL}>Execute</button>

        <button
          onClick={() => {
            setQuery("");
            setResult([]);
            setMessage("Editor Cleared");
          }}
        >
          Clear
        </button>
      </div>

      <p className="message">{message}</p>

      <div className="output">
        {result.length > 0 ? (
          <table>
            <thead>
              <tr>
                {result[0].columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {result[0].values.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Output</p>
        )}
      </div>
    </div>
  );
}

export default SqlEditor;