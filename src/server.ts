import express from "express";

const app = express();

app.get("/", (req, res, next) => {
  res.send({ msg: "Server Running!!" });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
