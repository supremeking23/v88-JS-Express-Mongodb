const dbConnection = require("../config");

const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
	first_name: {
		type: String,
		required: true,
	},
	last_name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},

	updated_at: {
		type: Date,
		default: Date.now,
	},
});

// //user
module.exports = mongoose.model("Users", UserSchema);
