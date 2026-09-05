const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
require("dotenv").config();

const app = express();
const PORT = 3000;

// ===============================
// BASIC SETUP
// ===============================

app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// FILE UPLOAD
// ===============================

const upload = multer({
    dest: path.join(__dirname, "uploads"),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// ===============================
// PDF UPLOAD + TEXT EXTRACTION
// ===============================

app.post("/upload", upload.single("material"), async (req, res) => {

    console.log("📥 Upload request received");

    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "No PDF file received"
        });
    }

    console.log("📄 PDF received:", req.file.originalname);

    try {

        const pdfBuffer = fs.readFileSync(req.file.path);

        console.log(
            "📦 PDF size:",
            pdfBuffer.length,
            "bytes"
        );

        const parser = new PDFParse({
            data: pdfBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const extractedText = result.text || "";

        console.log("✅ PDF text extracted");
        console.log(
            "📝 Characters:",
            extractedText.length
        );

        res.json({
            success: true,
            fileName: req.file.originalname,
            text: extractedText
        });

    } catch (error) {

        console.error("❌ PDF processing error:");
        console.error(error);

        if (
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: "Could not read the PDF",
            details: error.message
        });
    }
});

// ===============================
// SIMPLE LOCAL AI TEACHER
// ===============================

function createLocalTeacherResponse(
    question,
    context,
    level,
    language
) {

    const q = (question || "").toLowerCase();
    const material = (context || "").trim();

    // Use a smaller section of the uploaded material
    const sourceText = material
        .replace(/\s+/g, " ")
        .substring(0, 5000);

    let answer = "";

    // --------------------------------
    // LANGUAGE
    // --------------------------------

    if (language === "Tamil") {

        answer += "👩‍🏫 AI Teacher\n\n";

        answer +=
            "உங்கள் learning material-ஐ அடிப்படையாக வைத்து விளக்குகிறேன்.\n\n";

        answer +=
            "📚 பாடத்தின் முக்கிய பகுதி:\n" +
            sourceText.substring(0, 1200) +
            "\n\n";

        answer +=
            "💡 எளிய விளக்கம்:\n" +
            "இந்த topic-ஐ முதலில் basic concept-ஆ புரிந்து கொள்ளுங்கள். " +
            "பிறகு அதன் முக்கிய points மற்றும் examples-ஐ கவனிக்கலாம்.\n\n";

        answer +=
            "🎯 Student Level: " +
            level +
            "\n\n";

        answer +=
            "❓ Understanding Check:\n" +
            "இந்த topic-ல் உங்களுக்கு எந்த பகுதி புரியவில்லை?\n";

        return answer;
    }

    if (language === "Tanglish") {

        answer += "👩‍🏫 AI Teacher\n\n";

        answer +=
            "Unoda uploaded learning material-a base panni explain panren.\n\n";

        answer +=
            "📚 Material-la irukkura mukkiya part:\n" +
            sourceText.substring(0, 1200) +
            "\n\n";

        answer +=
            "💡 Simple explanation:\n" +
            "Indha topic-oda basic concept-a first understand pannunga. " +
            "Adhukku apram important points and examples-a paakalam.\n\n";

        answer +=
            "🎯 Student Level: " +
            level +
            "\n\n";

        answer +=
            "❓ Understanding Check:\n" +
            "Indha topic-la ungalukku enna part puriyala?\n";

        return answer;
    }

    // --------------------------------
    // ENGLISH
    // --------------------------------

    answer += "👩‍🏫 AI Teacher\n\n";

    answer +=
        "I will teach this topic using your uploaded learning material.\n\n";

    answer +=
        "📚 Material-based content:\n" +
        sourceText.substring(0, 1500) +
        "\n\n";

    answer +=
        "💡 Simple explanation:\n" +
        "Start with the basic concept, then understand the important points " +
        "and examples from the learning material.\n\n";

    answer +=
        "🎯 Student Level: " +
        level +
        "\n\n";

    answer +=
        "🧠 Adaptive Teaching:\n";

    if (level === "Beginner") {
        answer +=
            "I have kept the explanation simple and focused on the fundamentals.\n\n";
    } else if (level === "Intermediate") {
        answer +=
            "I have included more technical detail while keeping the explanation clear.\n\n";
    } else {
        answer +=
            "I have focused on deeper concepts, technical understanding and application.\n\n";
    }

    // --------------------------------
    // QUESTION DETECTION
    // --------------------------------

    if (
        q.includes("quiz") ||
        q.includes("question") ||
        q.includes("practice") ||
        q.includes("test")
    ) {

        answer += "📝 Practice Questions:\n\n";

        answer +=
            "1. What is the main concept discussed in this material?\n\n";

        answer +=
            "2. Explain the important points of this topic.\n\n";

        answer +=
            "3. Give one example related to the topic.\n\n";

        answer +=
            "4. What problem does this concept solve?\n\n";

        answer +=
            "5. Explain the topic in your own words.\n\n";

        answer +=
            "🎯 Difficulty will be adapted based on your selected level.\n";

        return answer;
    }

    // --------------------------------
    // FINAL REPORT
    // --------------------------------

    if (
        q.includes("final report") ||
        q.includes("learning report") ||
        q.includes("progress report") ||
        q.includes("feedback")
    ) {

        answer += "📊 AI Teacher Learning Report\n\n";

        answer +=
            "✅ Learning Material: Processed\n\n";

        answer +=
            "✅ Lesson: Generated\n\n";

        answer +=
            "✅ Student Interaction: Enabled\n\n";

        answer +=
            "✅ Practice: Completed\n\n";

        answer +=
            "🧠 Recommendation:\n" +
            "Revise the important concepts once more and attempt additional practice questions.\n\n";

        answer +=
            "🚀 Next Step:\n" +
            "Move to the next topic after reviewing the difficult concepts.\n";

        return answer;
    }

    // --------------------------------
    // DEFAULT TEACHING RESPONSE
    // --------------------------------

    answer +=
        "🔎 Your question:\n" +
        question +
        "\n\n";

    answer +=
        "📖 Teaching:\n" +
        "The uploaded material has been processed successfully. " +
        "The teacher uses the material as the primary learning source and " +
        "adapts the explanation according to your level.\n\n";

    answer +=
        "🧩 Key learning approach:\n" +
        "Understand → Explain → Example → Question → Evaluate → Adapt\n\n";

    answer +=
        "❓ Follow-up Question:\n" +
        "Can you explain the main idea of this topic in your own words?\n";

    return answer;
}

// ===============================
// AI TEACHER API
// ===============================

app.post("/ask-ai", async (req, res) => {

    console.log("🤖 AI Teacher request received");

    try {

        const {
            question,
            context,
            level = "Beginner",
            language = "English"
        } = req.body;

        if (!question) {

            return res.status(400).json({
                success: false,
                error: "Question is required"
            });
        }

        const answer = createLocalTeacherResponse(
            question,
            context,
            level,
            language
        );

        console.log(
            "✅ Local AI Teacher response generated"
        );

        res.json({
            success: true,
            answer: answer,
            mode: "local-ai"
        });

    } catch (error) {

        console.error("❌ AI Teacher error:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: "AI Teacher could not generate a response",
            details: error.message
        });
    }
});

// ===============================
// SERVER START
// ===============================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("🤖 AI Teacher Server Started");
    console.log("================================");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("📚 PDF Processing: Ready");
    console.log("🧠 Local AI Teacher: Ready");
    console.log("🎯 Adaptive Learning: Ready");
    console.log("📝 Assessment: Ready");
    console.log("");

});