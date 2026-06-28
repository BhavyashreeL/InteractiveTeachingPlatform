import "./TheoryPanel.css";
import intro from "../../data/unit1/intro";

function TheoryPanel() {
  return (
    <div className="theory-panel">
      <h2>{intro.title}</h2>

      <p style={{ whiteSpace: "pre-line" }}>
        {intro.content}
      </p>
    </div>
  );
}

export default TheoryPanel;