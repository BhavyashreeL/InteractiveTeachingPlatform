import "./Home.css";

import TheoryPanel from "../../components/TheoryPanel/TheoryPanel";
import SqlEditor from "../../components/SqlEditor/SqlEditor";
import AnimationPanel from "../../components/AnimationPanel/AnimationPanel";

function Home() {
  return (
    <div className="home">

      <div className="top-section">
        <TheoryPanel />
        <SqlEditor />
      </div>

      <AnimationPanel />

    </div>
  );
}

export default Home;