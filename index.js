const mongoose = require("mongoose");
const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 8005;

// Connection:
mongoose.connect("mongodb://127.0.0.1:27017/movies-doc-app")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Error", err));

// Schema:
const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    director: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
})

// Model:
const Movie = mongoose.model("movie", movieSchema);

// Middleware:
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    const log = `${Date.now()} | ${req.ip} | ${req.path}\n`;
    fs.appendFile("log.txt", log, () => {
        next();
    })
})

// Routes:
app.route("/api/movies")
    .get(async (req, res) => {
        const allDbMovies = await Movie.find({});
        return res.json(allDbMovies);
    })
    .post(async (req, res) => {
        const body = req.body
        await Movie.create({
            title: body.title,
            director: body.director,
            year: body.year,
            genre: body.genre,
        });
        return res.status(201).json({ msg: "success" });
    });

app.route("/api/movies/:id")
    .get(async (req, res) => {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ error: "404 movie not found!" })
        return res.json(movie);
    })
    .patch(async (req, res) => {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!movie) return res.status(404).json({ error: "Not found" });
        return res.json(movie);
    })
    .delete(async (req, res) => {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ error: "Not found" });
        return res.json({ msg: "success" });
    })

app.listen(PORT, console.log(`Server running on localhost: ${PORT}`));