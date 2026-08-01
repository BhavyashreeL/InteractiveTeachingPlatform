import { useState } from "react";
import "./SqlEditor.css";

function SqlEditor() {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("No Output");

  function handleExecute() {
    if (!query.trim()) {
      setOutput("Please write a SQL query.");
      return;
    }

    setOutput("Query execution will be implemented here.");
  }

  function handleClear() {
    setQuery("");
    setOutput("No Output");
  }

  return (
    <div className="sql-editor">
      <h2>SQL Laboratory</h2>

      <textarea
        placeholder="Write SQL Query Here..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="sql-actions">
        <button onClick={handleExecute}>Execute</button>
        <button onClick={handleClear}>Clear</button>
      </div>

      <p className="db-status">Database Ready</p>

      <div className="sql-output">{output}</div>
    </div>
  );
}

export default SqlEditor;