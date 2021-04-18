const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


const port = process.env.PORT || 5000;

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/phonebook", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex:true
  })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => console.log(err));

const userRouter = require("./routes/userRouter");
const contactRouter = require("./routes/contactRouter");

app.use("/user", userRouter);
app.use("/contact", contactRouter);

app.listen(port, () => console.log("Server is running on port " + port));
