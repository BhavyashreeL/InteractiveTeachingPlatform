import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import SqlEditor from "../components/SqlEditor/SqlEditor";
import "./TeacherDashboard.css";
import { API_BASE_URL } from "../config";

function TeacherDashboard({ user, onLogout }) {
  const [units, setUnits] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [loading, setLoading] = useState(true);

  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    async function fetchUnits() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/${user.userId}/units`
        );

        const data = await response.json();

        if (response.ok) {
          setUnits(data.units || []);
        }
      } catch (err) {
        console.error("Fetch units error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.userId) {
      fetchUnits();
    }
  }, [user]);

  useEffect(() => {
    function handleKeyDown(event) {
        if (!isFullscreen) {
        return;
        }

        if (event.key === "Escape") {
        closeFullscreen();
        }

        if (event.key === "ArrowLeft") {
        goToPreviousSlide();
        }

        if (event.key === "ArrowRight") {
        goToNextSlide();
        }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
        window.removeEventListener("keydown", handleKeyDown);
    };
    }, [isFullscreen, slides.length]);

  useEffect(() => {
    if (!selectedMenu.startsWith("Unit")) {
        setSlides([]);
        setCurrentSlideIndex(0);
        return;
    }

    const selectedUnit = units.find((unit) => unit.unitName === selectedMenu);

    if (selectedUnit?.file?.fileId) {
        fetchSlides(selectedUnit.file.fileId);
    } else {
        setSlides([]);
        setCurrentSlideIndex(0);
    }
    }, [selectedMenu, units]);

async function handleFileUpload(event, selectedUnit) {
  const files = Array.from(event.target.files);

  if (!files || files.length === 0) {
    return;
  }

  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

  const invalidFile = files.find((file) => {
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    return !allowedExtensions.includes(fileExtension);
  });

  if (invalidFile) {
    alert("Only PNG, JPG, JPEG, and WEBP images are allowed.");
    event.target.value = "";
    return;
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("slides", file);
  });

  formData.append("uploadedByUserId", user.userId);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/units/${selectedUnit.assignmentId}/upload-slides`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Slide upload failed.");
      return;
    }

    alert("Slides uploaded successfully.");

    setUnits((prevUnits) =>
      prevUnits.map((unit) =>
        unit.assignmentId === selectedUnit.assignmentId
          ? {
              ...unit,
              file: data.file
            }
          : unit
      )
    );

    setSlides(data.file.slides || []);
    setCurrentSlideIndex(0);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Unable to upload slides. Please check backend.");
  } finally {
    event.target.value = "";
  }
}

async function fetchSlides(fileId) {
  if (!fileId) {
    setSlides([]);
    return;
  }

  try {
    setSlidesLoading(true);

    const response = await fetch(
      `${API_BASE_URL}/api/files/${fileId}/slides`
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Unable to fetch slides.");
      return;
    }

    setSlides(data.slides || []);
    setCurrentSlideIndex(0);
  } catch (err) {
    console.error("Fetch slides error:", err);
    alert("Unable to fetch slides.");
  } finally {
    setSlidesLoading(false);
  }
}

function goToPreviousSlide() {
  setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
}

function goToNextSlide() {
  setCurrentSlideIndex((prev) =>
    Math.min(prev + 1, slides.length - 1)
  );
}

function openFullscreen() {
  setIsFullscreen(true);
}

function closeFullscreen() {
  setIsFullscreen(false);
}

  function renderMainContent() {
    if (selectedMenu === "Dashboard") {
      return (
        <div className="content-card">
          <h2>Introduction to Databases</h2>

          <p>
            A database is an organized collection of related data that enables
            efficient storage, retrieval, updating, and management of
            information.
          </p>

          <p>
            In today's digital world, databases are used in banking systems,
            hospitals, educational institutions, e-commerce websites, railway
            reservation systems, and many other applications.
          </p>

          <p>
            A Database Management System, or DBMS, is software that acts as an
            interface between the user and the database. It helps users create,
            retrieve, update, and delete data efficiently while ensuring
            security, consistency, and integrity.
          </p>

          <p>
            Replace this content with your uploaded unit material whenever you
            wish.
          </p>
        </div>
      );
    }

    if (selectedMenu.startsWith("Unit")) {
      const selectedUnit = units.find((unit) => unit.unitName === selectedMenu);

      return (
        <div className="content-card">
          <h2>{selectedMenu}</h2>

          {loading && <p>Loading unit details...</p>}

          {!loading && selectedUnit && (
            <>
              <p>
                Subject: <strong>{selectedUnit.subjectName}</strong>
              </p>

              {selectedUnit.file ? (
                <p>
                    Uploaded slides:{" "}
                    <strong>{slides.length > 0 ? `${slides.length} images` : "Available"}</strong>
                </p>
                ) : (
                <p>No slides uploaded for this unit yet.</p>
                )}

              <div className="unit-actions">
                <label className="primary-btn file-upload-label">
                    Upload Slide Images
                    <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    multiple
                    onChange={(event) => handleFileUpload(event, selectedUnit)}
                    hidden
                    />
                </label>
                </div>

                {slidesLoading && <p>Loading slides...</p>}

                {!slidesLoading && slides.length > 0 && (
                <div className="slide-viewer">
                    <div className="slide-toolbar">
                        <button
                            onClick={goToPreviousSlide}
                            disabled={currentSlideIndex === 0}
                        >
                            Previous
                        </button>

                        <span>
                            Slide {currentSlideIndex + 1} of {slides.length}
                        </span>

                        <div className="slide-toolbar-actions">
                            <button
                            onClick={goToNextSlide}
                            disabled={currentSlideIndex === slides.length - 1}
                            >
                            Next
                            </button>

                            <button onClick={openFullscreen}>
                            Full Screen
                            </button>
                        </div>
                        </div>

                    <div className="slide-image-wrapper">
                    <img
                        src={`${API_BASE_URL}${slides[currentSlideIndex].slideImagePath}`}
                        alt={`Slide ${currentSlideIndex + 1}`}
                        className="slide-image"
                    />
                    </div>
                </div>
                )}
            </>
          )}

          {!loading && !selectedUnit && (
            <p>This unit is not assigned to the current teacher.</p>
          )}
        </div>
      );
    }

    if (selectedMenu === "SQL Lab") {
      return (
        <div className="content-card">
          <h2>SQL Laboratory</h2>
          <p>Use the SQL editor on the right side to run practice queries.</p>
        </div>
      );
    }

    if (selectedMenu === "Practice") {
      return (
        <div className="content-card">
          <h2>Practice</h2>
          <p>Practice questions will be shown here.</p>
        </div>
      );
    }

    if (selectedMenu === "Quiz") {
      return (
        <div className="content-card">
          <h2>Quiz</h2>
          <p>Quiz section will be shown here.</p>
        </div>
      );
    }

    if (selectedMenu === "Settings") {
      return (
        <div className="content-card">
          <h2>Settings</h2>
          <p>Profile and application settings will be shown here.</p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="dashboard-shell">
        <Navbar user={user} onLogout={onLogout} />

        <div className="dashboard-body">
        <Sidebar selectedMenu={selectedMenu} onMenuClick={setSelectedMenu} />

        <main className="dashboard-main">
            <section className="main-content">{renderMainContent()}</section>

            <section className="sql-panel">
            <SqlEditor />
            </section>
        </main>
        </div>

        {isFullscreen && slides.length > 0 && (
        <div className="fullscreen-viewer">
            <div className="fullscreen-header">
            <span>
                Slide {currentSlideIndex + 1} of {slides.length}
            </span>

            <button onClick={closeFullscreen}>Exit Full Screen</button>
            </div>

            <div className="fullscreen-content">
            <button
                className="fullscreen-nav left"
                onClick={goToPreviousSlide}
                disabled={currentSlideIndex === 0}
            >
                ‹
            </button>

            <img
                src={`${API_BASE_URL}${slides[currentSlideIndex].slideImagePath}`}
                alt={`Slide ${currentSlideIndex + 1}`}
                className="fullscreen-image"
            />

            <button
                className="fullscreen-nav right"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
            >
                ›
            </button>
            </div>
        </div>
        )}
    </div>
    );
}

export default TeacherDashboard;