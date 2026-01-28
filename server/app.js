const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json({limit: "300mb"}));
app.use(express.urlencoded({limit: "300mb", extended: true}));

/* -------------------- UPLOAD SETUP -------------------- */
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {recursive: true});
}

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "file-" + uniqueName + path.extname(file.originalname)); // Changed 'image-' to 'file-'
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "video/mp4"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Only PNG, JPG, MP4 allowed. Got: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 300 * 1024 * 1024}, // 300MB max
});

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

/* -------------------- AUTH -------------------- */
const SECRET = "supersecretkey";

function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({error: "No token"});

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({error: "Invalid token"});
    }
}

/* -------------------- AUTH ROUTES -------------------- */
app.post("/register", async (req, res) => {
    const {name, email, password} = req.body;

    const Pattern = /^[A-Za-z0-9._]{3,}@[a-zA-Z]{3,}\.[a-zA-Z.]{2,6}$/g;
    const PwdPtn = /^[a-zA-Z]{4,}[@._-]{1,1}[a-zA-Z0-9]{3,}$/g;

    if (!email || !Pattern.test(email)) {
        return res.status(400).json({error: "Enter valid email"});
    }

    const hash = await bcrypt.hash(password, 10);

    try {
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length) {
            return res.status(400).json({error: "Email already taken"});
        }

        const [result] = await pool.query("INSERT INTO users (email, name, password) VALUES (?, ?, ?)", [
            email,
            name,
            hash,
        ]);
        res.json({id: result.insertId, email}); // Return email
    } catch {
        res.status(500).json({error: "Server error"});
    }
});

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (!rows.length) return res.status(400).json({error: "User not found"});

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({error: "Wrong password"});

    const token = jwt.sign({id: user.id}, SECRET, {expiresIn: "1d"});

    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            bio: user.bio,
            image: user.image,
        },
    });
});

/* -------------------- PROFILE -------------------- */
app.get("/profile", auth, async (req, res) => {
    const [rows] = await pool.query("SELECT id, email, name, bio, image FROM users WHERE id=?", [req.userId]);
    res.json(rows[0]);
});

app.put("/profile", auth, async (req, res) => {
    const {email, name, bio, image} = req.body;
    await pool.query("UPDATE users SET email=?, name=?, bio=?, image=? WHERE id=?", [
        email,
        name,
        bio,
        image,
        req.userId,
    ]);
    res.json({message: "Profile updated"});
});

/* -------------------- IMAGE UPLOAD (FIXED) -------------------- */
app.post("/upload-profile", auth, upload.single("image"), async (req, res) => {
    console.log("FILE:", req.file); // DEBUG
    console.log("USER ID:", req.userId); // DEBUG

    if (!req.file) {
        console.log("NO FILE RECEIVED");
        return res.status(400).json({error: "No file uploaded"});
    }

    try {
        const imagePath = `/uploads/${req.file.filename}`;
        console.log("SAVING PATH:", imagePath); // DEBUG

        const result = await pool.query("UPDATE users SET image=? WHERE id=?", [imagePath, req.userId]);
        console.log("DB UPDATE RESULT:", result); // DEBUG

        const [rows] = await pool.query("SELECT id, email, bio, image FROM users WHERE id=?", [req.userId]);
        console.log("DB AFTER SAVE:", rows[0]); // DEBUG

        res.json({image: imagePath});
    } catch (dbError) {
        console.log("DATABASE ERROR:", dbError);
        res.status(500).json({error: "Database save failed"});
    }
});

/* -------------------- POSTS -------------------- */
app.post("/posts", auth, upload.array("files", 10), async (req, res) => {
    const {title} = req.body;
    const filePaths = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    console.log("📤 UPLOAD:", {title: title?.slice(0, 50), files: filePaths.length});

    if (!title.trim() && filePaths.length === 0) {
        return res.status(400).json({error: "Title or files required"});
    }

    try {
        const [result] = await pool.query("INSERT INTO posts (user_id, title, files) VALUES (?, ?, ?)", [
            req.userId,
            title,
            JSON.stringify(filePaths),
        ]);
        res.json({id: result.insertId, title, files: filePaths});
    } catch (err) {
        console.error("POST ERROR:", err);
        res.status(500).json({error: "Failed to create post"});
    }
});

/* GET LIKERS */
app.get("/posts/:id/likers", async (req, res) => {
    try {
        const postId = req.params.id;
        const [posts] = await pool.query("SELECT liked_by FROM posts WHERE id = ?", [postId]);
        if (!posts.length) return res.status(404).json({error: "Post not found"});

        const likedBy = posts[0].liked_by ? JSON.parse(posts[0].liked_by) : [];

        if (likedBy.length === 0) {
            return res.json([]);
        }

        // FETCH USERS BY ID ARRAY
        const placeholders = likedBy.map(() => "?").join(",");
        const [likers] = await pool.query(
            `
            SELECT id, name, email, image 
            FROM users 
            WHERE id IN (${placeholders})
        `,
            likedBy
        );

        res.json(likers);
    } catch (err) {
        console.error("LIKERS ERROR:", err);
        res.status(500).json({error: "Failed to fetch likers"});
    }
});

app.get("/posts", async (req, res) => {
    try {
        const [posts] = await pool.query(`
            SELECT 
                posts.id, posts.user_id, posts.title, posts.created_at, posts.files, 
                posts.likes, posts.liked_by,  -- 🔥 ADD THESE
                COALESCE(users.name, users.email) AS name,
                users.image, users.email
            FROM posts
            LEFT JOIN users ON posts.user_id = users.id
            ORDER BY posts.created_at DESC
        `);
        res.json(posts);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

/* -- LIKE / UNLIKE POST */
app.post("/posts/:id/like", auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId.toString();

        const [rows] = await pool.query("SELECT likes, liked_by FROM posts WHERE id = ?", [postId]);

        if (!rows.length) {
            return res.status(404).json({error: "Post not found"});
        }

        let likedBy = rows[0].liked_by ? JSON.parse(rows[0].liked_by) : [];
        let likes = rows[0].likes || 0;

        let liked;

        if (likedBy.includes(userId)) {
            // UNLIKE
            likedBy = likedBy.filter((id) => id !== userId);
            likes = Math.max(likes - 1, 0);
            liked = false;
        } else {
            // LIKE
            likedBy.push(userId);
            likes += 1;
            liked = true;
        }

        await pool.query("UPDATE posts SET likes = ?, liked_by = ? WHERE id = ?", [
            likes,
            JSON.stringify(likedBy),
            postId,
        ]);

        res.json({liked, likes});
    } catch (err) {
        console.error("LIKE ERROR:", err);
        res.status(500).json({error: "Like failed"});
    }
});

/* -------------------- COMMENTS -------------------- */
app.get("/posts/:id/comments", async (req, res) => {
    const [comments] = await pool.query(
        `
        SELECT comments.*, users.email, users.image AS user_image
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE post_id = ?
        ORDER BY comments.created_at ASC
        `,
        [req.params.id]
    );
    res.json(comments);
});

app.post("/posts/:id/comments", auth, async (req, res) => {
    const {text, parent_id} = req.body;
    const [result] = await pool.query("INSERT INTO comments (post_id, user_id, text, parent_id) VALUES (?, ?, ?, ?)", [
        req.params.id,
        req.userId,
        text,
        parent_id || null,
    ]);
    res.json({id: result.insertId, text});
});

/* COMMENT LIKES */
app.post("/comments/:id/like", auth, async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.userId.toString();

        const [rows] = await pool.query("SELECT likes, liked_by FROM comments WHERE id = ?", [commentId]);
        if (!rows.length) return res.status(404).json({error: "Comment not found"});

        let likedBy = rows[0].liked_by ? JSON.parse(rows[0].liked_by) : [];
        let likes = rows[0].likes || 0;

        let liked;
        if (likedBy.includes(userId)) {
            likedBy = likedBy.filter((id) => id !== userId);
            likes = Math.max(likes - 1, 0);
            liked = false;
        } else {
            likedBy.push(userId);
            likes += 1;
            liked = true;
        }

        await pool.query("UPDATE comments SET likes = ?, liked_by = ? WHERE id = ?", [
            likes,
            JSON.stringify(likedBy),
            commentId,
        ]);

        res.json({liked, likes});
    } catch (err) {
        console.error("COMMENT LIKE ERROR:", err);
        res.status(500).json({error: "Like failed"});
    }
});

/* COMMENT REPLIES */
app.get("/posts/:postId/comments/:commentId/replies", async (req, res) => {
    try {
        const [replies] = await pool.query(
            `
            SELECT comments.*, users.email, users.image AS user_image
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE post_id = ? AND parent_id = ?
            ORDER BY comments.created_at ASC
            `,
            [req.params.postId, req.params.commentId]
        );
        res.json(replies);
    } catch (err) {
        console.error("REPLIES ERROR:", err);
        res.status(500).json({error: "Failed to fetch replies"});
    }
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({error: "File too large. Max 300MB."});
        }
        return res.status(400).json({error: `Upload failed: ${error.message}`});
    }
    if (error.message.includes("Only PNG")) {
        return res.status(400).json({error: "Only PNG, JPG, MP4 files allowed!"});
    }
    res.status(500).json({error: "Server error"});
});

/* -------------------- START -------------------- */
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
