import express from "express";
import cors from "cors";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

/* -------------------- ROOT -------------------- */

app.get("/", (req, res) => {
  res.send("DBMS-I backend is running");
});

/* -------------------- TURSO SETUP -------------------- */

if (!process.env.TURSO_DATABASE_URL) {
  console.warn("Missing TURSO_DATABASE_URL environment variable");
}

if (!process.env.TURSO_AUTH_TOKEN) {
  console.warn("Missing TURSO_AUTH_TOKEN environment variable");
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

console.log("Turso database client initialized");

/* -------------------- SUPABASE SETUP -------------------- */

if (!process.env.SUPABASE_URL) {
  console.warn("Missing SUPABASE_URL environment variable");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "slides";

/* -------------------- MULTER SETUP FOR SLIDE IMAGES -------------------- */

const storage = multer.memoryStorage();

const fileFilter = function (req, file, cb) {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Only PNG, JPG, JPEG, and WEBP images are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

/* -------------------- HELPERS -------------------- */

function safeFileName(fileName) {
  return fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
}

function toNumber(value) {
  if (typeof value === "bigint") {
    return Number(value);
  }

  return value;
}

/* -------------------- HEALTH -------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend is running"
  });
});

/* -------------------- LOGIN -------------------- */

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await db.execute({
      sql: `
        SELECT 
          UserId,
          FullName,
          Email,
          PasswordHash,
          Role,
          IsActive
        FROM Users
        WHERE lower(Email) = ?
        LIMIT 1
      `,
      args: [normalizedEmail]
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (Number(user.IsActive) !== 1) {
      return res.status(403).json({
        message: "User account is inactive"
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    return res.json({
      message: "Login successful",
      user: {
        userId: toNumber(user.UserId),
        fullName: user.FullName,
        email: user.Email,
        role: user.Role
      }
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Server error during login"
    });
  }
});

/* -------------------- FETCH USER UNITS -------------------- */

app.get("/api/users/:userId/units", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.execute({
      sql: `
        SELECT 
          uua.AssignmentId,
          s.SubjectId,
          s.SubjectName,
          un.UnitId,
          un.UnitName,
          un.DisplayOrder,
          f.FileId,
          f.OriginalFileName,
          f.StoredFilePath,
          f.UploadedAt
        FROM UserUnitAssignments uua
        JOIN Subjects s 
          ON s.SubjectId = uua.SubjectId
        JOIN Units un 
          ON un.UnitId = uua.UnitId
        LEFT JOIN UnitUploadedFiles f 
          ON f.AssignmentId = uua.AssignmentId
         AND f.IsCurrent = 1
        WHERE uua.UserId = ?
          AND uua.IsActive = 1
        ORDER BY s.SubjectName, un.DisplayOrder
      `,
      args: [userId]
    });

    const rows = result.rows;

    return res.json({
      units: rows.map((row) => ({
        assignmentId: toNumber(row.AssignmentId),
        subjectId: toNumber(row.SubjectId),
        subjectName: row.SubjectName,
        unitId: toNumber(row.UnitId),
        unitName: row.UnitName,
        displayOrder: toNumber(row.DisplayOrder),
        file: row.FileId
          ? {
              fileId: toNumber(row.FileId),
              originalFileName: row.OriginalFileName,
              storedFilePath: row.StoredFilePath,
              uploadedAt: row.UploadedAt
            }
          : null
      }))
    });
  } catch (err) {
    console.error("Units fetch error:", err);

    return res.status(500).json({
      message: "Server error while fetching units"
    });
  }
});

/* -------------------- SIGNUP -------------------- */

app.post("/api/signup", async (req, res) => {
  let tx;

  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Email, password, and confirm password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@bmsce.ac.in")) {
      return res.status(400).json({
        message: "Only @bmsce.ac.in email addresses are allowed"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    const allowedUserResult = await db.execute({
      sql: `
        SELECT 
          AllowedUserId,
          Email,
          FullName,
          SubjectId,
          IsRegistered,
          IsActive
        FROM AllowedUsers
        WHERE lower(Email) = ?
        LIMIT 1
      `,
      args: [normalizedEmail]
    });

    const allowedUser = allowedUserResult.rows[0];

    if (!allowedUser) {
      return res.status(403).json({
        message: "This email is not allowed to sign up"
      });
    }

    if (Number(allowedUser.IsActive) !== 1) {
      return res.status(403).json({
        message: "This email is not active for signup"
      });
    }

    if (Number(allowedUser.IsRegistered) === 1) {
      return res.status(409).json({
        message: "This email is already registered"
      });
    }

    const existingUserResult = await db.execute({
      sql: `
        SELECT UserId
        FROM Users
        WHERE lower(Email) = ?
        LIMIT 1
      `,
      args: [normalizedEmail]
    });

    const existingUser = existingUserResult.rows[0];

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    tx = await db.transaction("write");

    const insertUserResult = await tx.execute({
      sql: `
        INSERT INTO Users (
          FullName,
          Email,
          PasswordHash,
          Role,
          IsActive
        )
        VALUES (?, ?, ?, 'Teacher', 1)
      `,
      args: [allowedUser.FullName, normalizedEmail, passwordHash]
    });

    const newUserId = Number(insertUserResult.lastInsertRowid);

    await tx.execute({
      sql: `
        INSERT INTO UserUnitAssignments (
          UserId,
          SubjectId,
          UnitId,
          IsActive
        )
        SELECT 
          ?,
          ?,
          UnitId,
          1
        FROM Units
        WHERE IsActive = 1
        ORDER BY DisplayOrder
      `,
      args: [newUserId, allowedUser.SubjectId]
    });

    await tx.execute({
      sql: `
        UPDATE AllowedUsers
        SET IsRegistered = 1
        WHERE AllowedUserId = ?
      `,
      args: [allowedUser.AllowedUserId]
    });

    await tx.commit();

    return res.status(201).json({
      message: "Signup successful",
      user: {
        userId: newUserId,
        fullName: allowedUser.FullName,
        email: normalizedEmail,
        role: "Teacher"
      }
    });
  } catch (err) {
    console.error("Signup error:", err);

    if (tx) {
      try {
        await tx.rollback();
      } catch (rollbackErr) {
        console.error("Signup rollback error:", rollbackErr);
      }
    }

    return res.status(500).json({
      message: "Server error during signup"
    });
  }
});

/* -------------------- UPLOAD SLIDE IMAGES -------------------- */

app.post(
  "/api/units/:assignmentId/upload-slides",
  upload.array("slides", 100),
  async (req, res) => {
    let tx;

    try {
      const { assignmentId } = req.params;
      const { uploadedByUserId } = req.body;

      if (!uploadedByUserId) {
        return res.status(400).json({
          message: "Uploaded user id is required"
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "No slide images uploaded"
        });
      }

      const folderName = `slides_${Date.now()}`;

      const sortedFiles = [...req.files].sort((a, b) =>
        a.originalname.localeCompare(b.originalname, undefined, {
          numeric: true,
          sensitivity: "base"
        })
      );

      const uploadedSlides = [];

      for (let index = 0; index < sortedFiles.length; index++) {
        const file = sortedFiles[index];
        const cleanName = safeFileName(file.originalname);

        const storagePath = `assignment_${assignmentId}/${folderName}/${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(storagePath);

        uploadedSlides.push({
          slideNumber: index + 1,
          originalName: file.originalname,
          storedFileName: cleanName,
          storagePath,
          slideImagePath: publicUrlData.publicUrl,
          size: file.size
        });
      }

      const totalSize = sortedFiles.reduce((sum, file) => sum + file.size, 0);

      tx = await db.transaction("write");

      await tx.execute({
        sql: `
          UPDATE UnitUploadedFiles
          SET IsCurrent = 0
          WHERE AssignmentId = ?
        `,
        args: [assignmentId]
      });

      const folderStoragePath = `assignment_${assignmentId}/${folderName}`;

      const insertFileResult = await tx.execute({
        sql: `
          INSERT INTO UnitUploadedFiles (
            AssignmentId,
            OriginalFileName,
            StoredFileName,
            StoredFilePath,
            FileType,
            FileSizeBytes,
            UploadedByUserId,
            IsCurrent
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `,
        args: [
          assignmentId,
          "Slide Images Folder",
          folderName,
          folderStoragePath,
          "image-folder",
          totalSize,
          uploadedByUserId
        ]
      });

      const newFileId = Number(insertFileResult.lastInsertRowid);

      for (const slide of uploadedSlides) {
        await tx.execute({
          sql: `
            INSERT INTO UnitFileSlides (
              FileId,
              SlideNumber,
              SlideImagePath,
              SlidePdfPagePath
            )
            VALUES (?, ?, ?, NULL)
          `,
          args: [newFileId, slide.slideNumber, slide.slideImagePath]
        });
      }

      await tx.commit();

      return res.status(201).json({
        message: "Slides uploaded successfully",
        file: {
          fileId: newFileId,
          originalFileName: "Slide Images Folder",
          storedFilePath: folderStoragePath,
          fileSizeBytes: totalSize,
          slides: uploadedSlides.map((slide) => ({
            slideNumber: slide.slideNumber,
            slideImagePath: slide.slideImagePath
          }))
        }
      });
    } catch (err) {
      console.error("Upload slides error:", err);

      if (tx) {
        try {
          await tx.rollback();
        } catch (rollbackErr) {
          console.error("Upload rollback error:", rollbackErr);
        }
      }

      return res.status(500).json({
        message: "Unable to upload slides"
      });
    }
  }
);

/* -------------------- FETCH SLIDES FOR FILE -------------------- */

app.get("/api/files/:fileId/slides", async (req, res) => {
  try {
    const { fileId } = req.params;

    const result = await db.execute({
      sql: `
        SELECT 
          SlideId,
          FileId,
          SlideNumber,
          SlideImagePath
        FROM UnitFileSlides
        WHERE FileId = ?
        ORDER BY SlideNumber
      `,
      args: [fileId]
    });

    const rows = result.rows;

    return res.json({
      slides: rows.map((row) => ({
        slideId: toNumber(row.SlideId),
        fileId: toNumber(row.FileId),
        slideNumber: toNumber(row.SlideNumber),
        slideImagePath: row.SlideImagePath
      }))
    });
  } catch (err) {
    console.error("Fetch slides error:", err);

    return res.status(500).json({
      message: "Unable to fetch slides"
    });
  }
});

/* -------------------- MULTER ERROR HANDLER -------------------- */

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || "Request error"
    });
  }

  next();
});

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
