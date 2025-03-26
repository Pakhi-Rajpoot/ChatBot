require("dotenv").config();
const express = require("express");
const path = require("path")

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const PORT = 3000;
app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname,"public")));




async function getGeminiResponse(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;  
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return data;
}
app.get("/", function(req, res){
    res.render("index",{response : null});
})


app.post("/chat", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const result = await getGeminiResponse(prompt);
        const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
       

        res.render("index", { response: responseText });
    } catch (error) {
        res.status(500).json({ error: "API Request Failed", details: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
