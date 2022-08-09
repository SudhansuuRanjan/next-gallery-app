const PORT = 8080 || process.env.PORT;
require("dotenv").config();
const express = require("express");
const { ImgurClient } = require("imgur");
const fs = require("fs");
const fileUpload = require("express-fileupload");

const app = express();
app.use(fileUpload());

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  let sampleFile = req.files.sampleFile;
  let uploadPath = __dirname + "/uploads/" + sampleFile.name;

  sampleFile.mv(uploadPath, async function (err) {
    if (err) {
      return res.status(500).send(err);
    }

    const client = new ImgurClient({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });

    const response = await client.upload({
      image: fs.createReadStream(uploadPath),
      type: "stream",
    });
    fs.unlinkSync(uploadPath);
    console.log(response.data);
    res.render("uploaded.ejs", { link: response.data.link });
  });
});

app.listen(PORT, () => {
  console.log(`Server sarted on PORT ${PORT}`);
});
