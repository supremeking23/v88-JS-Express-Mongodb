const mongoose = require("mongoose");

const mongodb = async () => {
	let db = await mongoose.connect("mongodb://localhost/express_users", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	});

	return db;
};

let dbConnection = mongodb();
dbConnection
	.then(() => {
		console.log("Successfully connected to the database");
	})
	.catch((err) => {
		console.log("Could not connect to the database. Exiting now...", err);
	});

module.exports = dbConnection;
