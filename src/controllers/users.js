const userModel = require("../models/user");
const { validateEmail, formError, messageHandler } = require("../my_module/utilities")();
const { registrationValidation, loginValidation } = require("../my_module/validation")();
const bcrypt = require("bcrypt");
const saltRounds = 10;

const redis = require("redis");
const client = redis.createClient(6379); //port number is optional

client.on("connect", function () {
	console.log("Connected to Redis...");
});

client.on("error", function (error) {
	console.error(error);
});

class Users {
	constructor() {}

	index(req, res) {
		res.render("index", {
			message: req.session.message != undefined ? req.session.message : undefined,
			form_errors: req.session.form_errors != undefined ? req.session.form_errors : undefined,
		});
		req.session.destroy();
	}

	async create(req, res) {
		try {
			// testing

			let form_error_array = registrationValidation(req.body, validateEmail);
			if (form_error_array.length > 0) {
				req.session.form_errors = formError("register", form_error_array);
				res.redirect("/");
				return false;
			}

			let message;
			let { firstname, lastname, email, password } = req.body;
			await userModel.findOne({ email: email }, async (error, foundUser) => {
				if (error) {
					console.log(`error:${error}`);
				} else {
					if (foundUser) {
						// email already exist
						console.log("email already exist");
						message = messageHandler("error", "Error, email already in the database");
					} else {
						bcrypt.hash(password, saltRounds, async (err, hash) => {
							password = hash;
							let user = new userModel({
								first_name: firstname,
								last_name: lastname,
								email: email,
								password: password,
							});

							let user_data = await user.save();
							console.log(`data._id`);
							console.log(user_data._id);
						});

						message = messageHandler("success", "User has been registered successfully");
					}
				}
			});

			req.session.message = message;
			res.redirect("/");
		} catch (error) {
			console.log(error);
		}
	}

	async login_process(req, res) {
		try {
			let form_error_array = loginValidation(req.body, validateEmail);

			if (form_error_array.length > 0) {
				req.session.form_errors = formError("login", form_error_array);
				res.redirect("/");
				return false;
			}

			let { email, password } = req.body;
			await userModel.findOne({ email: email }, async (error, foundUser) => {
				if (error) {
					console.log(`error:${error}`);
				} else {
					if (foundUser) {
						console.log(foundUser.password);

						bcrypt.compare(password, foundUser.password, async function (err, result) {
							if (result) {
								// correct credentials
								client.hmset(
									"user_session",
									[
										"first_name",
										foundUser.first_name,
										"last_name",
										foundUser.last_name,
										"email",
										foundUser.email,
										"is_logged_in",
										true,
									],
									(err, redis_result) => {
										console.log(`here are the results ${redis_result}`);
										res.redirect("/welcome");
									}
								);
							} else {
								console.log("wrong password");
								req.session.form_errors = formError("login", ["Wrong Email or Password"]);
								res.redirect("/");
								return false;
							}
						});
					} else {
						req.session.form_errors = formError("login", ["Wrong Email or Password"]);
						res.redirect("/");
						return false;
					}
				}
			});
		} catch (error) {}
	}

	async welcome(req, res) {
		client.exists("user_session", (err, result) => {
			if (result == 0) {
				res.redirect("/");
			} else {
				client.hgetall("user_session", (err, obj) => {
					res.render("welcome", { user: obj });
				});
			}
		});
	}

	logoff(req, res) {
		// req.session.destroy();
		// res.redirect("/");
		client.del("user_session", (err, obj) => {
			res.redirect("/");
		});
	}
}

module.exports = new Users();
