const express = require("express");
const app = express();
const PORT = 8080;

let bodyParser = require("body-parser");
let session = require("express-session");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: true,
		cookie: { maxAge: 600000 },
	})
);

// for image/js/css
app.use(express.static(__dirname + "/assets"));
// This sets the location where express will look for the ejs views
app.set("views", __dirname + "/views");
// Now lets set the view engine itself so that express knows that we are using ejs as opposed to another templating engine like jade
app.set("view engine", "ejs");
// use app.get method and pass it the base route '/' and a callback

require("./routes.js")(app);

// const mongoose = require("mongoose");

// const mongodb = async () => {
// 	let db = await mongoose.connect("mongodb://localhost/express_users", {
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true,
// 		useFindAndModify: false,
// 		useCreateIndex: true,
// 	});

// 	return db;
// };

// let ss = mongodb();
// ss.then(() => {
// 	console.log("Successflyy connected to the database");
// }).catch((err) => {
// 	console.log("Could not connect to the database. Exiting now...", err);
// 	process.exit();
// });

app.listen(PORT, (req, res) => {
	console.log(`listening at port ${8080}`);
});
