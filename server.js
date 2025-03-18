const express = require("express");
const connectDB = require("./db");

const app = express();
app.use(express.json());

app.get("/hadiths", async (req, res) => {
    const hadithCollection = await connectDB();
    const hadiths = await hadithCollection.find().toArray();
    res.json(hadiths);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
