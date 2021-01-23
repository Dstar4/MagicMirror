/* Magic Mirror
 * Module: InspirationalQuotes
 *
 * By Daniel Starling
 * MIT Licensed.
 */

Module.register("inspirationalquotes", {
	// Default module config.
	defaults: {
		compliments: [
			{ Quote: "Don't cry because it's over, smile because it happened.", Author: "Unknown" },
			{ Quote: "I'm selfish, impatient and a little insecure.", Author: "Unknown" }
		],
		updateInterval: 10000,
		remoteFile: null,
		fadeSpeed: 4000,
		random: true,
		mockDate: null
	},
	lastIndexUsed: -1,
	// Set currentweather from module
	currentWeatherType: "",

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);

		this.lastComplimentIndex = -1;

		var self = this;

		if (this.config.remoteFile !== null) {
			this.complimentFile(function (response) {
				let data = JSON.parse(response);
				// data = data.map(i=>i.Quote)
				self.config.compliments = data;
				self.updateDom();
			});
		}

		// Schedule update timer.
		setInterval(function () {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},

	/* randomIndex(compliments)
	 * Generate a random index for a list of compliments.
	 *
	 * argument compliments Array<String> - Array with compliments.
	 *
	 * return Number - Random index.
	 */
	randomIndex: function (compliments) {
		if (compliments.length === 1) {
			return 0;
		}

		var generate = function () {
			return Math.floor(Math.random() * compliments.length);
		};

		var complimentIndex = generate();

		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}

		this.lastComplimentIndex = complimentIndex;
		return complimentIndex;
	},

	/* complimentArray()
	 * Retrieve an array of compliments for the time of the day.
	 *
	 * return compliments Array<String> - Array with compliments for the time of the day.
	 */
	complimentArray: function () {
		return this.config.compliments;
	},

	/* complimentFile(callback)
	 * Retrieve a file from the local filesystem
	 */
	complimentFile: function (callback) {
		var xobj = new XMLHttpRequest(),
			isRemote = this.config.remoteFile.indexOf("http://") === 0 || this.config.remoteFile.indexOf("https://") === 0,
			path = isRemote ? this.config.remoteFile : this.file(this.config.remoteFile);
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/* complimentArray()
	 * Retrieve a random compliment.
	 *
	 * return compliment string - A compliment.
	 */
	randomCompliment: function () {
		// get the current time of day compliments list
		var compliments = this.complimentArray();
		// variable for index to next message to display
		let index = 0;
		// are we randomizing
		if (this.config.random) {
			// yes
			index = this.randomIndex(compliments);
		} else {
			// no, sequential
			// if doing sequential, don't fall off the end
			index = this.lastIndexUsed >= compliments.length - 1 ? 0 : ++this.lastIndexUsed;
		}

		return compliments[index] || "";
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright pre-line";

		//get the quote
		var quote = this.randomCompliment();
		console.log(quote);
		// get the compliment text
		var complimentText = quote.Quote;
		var authorText = `\n--${quote.Author}`;
		// split it into parts on newline text
		var parts = complimentText.split("\n");
		// create a span to hold it all
		var compliment = document.createElement("span");
		var author = document.createElement("span");
		// process all the parts of the compliment text

		for (var part of parts) {
			// create a text element for each part
			compliment.appendChild(document.createTextNode(part));
			// add a break `
			compliment.appendChild(document.createElement("BR"));
		}
		// remove the last break
		// compliment.lastElementChild.remove();
		author.appendChild(document.createTextNode(authorText));
		wrapper.appendChild(compliment);
		wrapper.appendChild(author);

		return wrapper;
	},

	// From data currentweather set weather type
	setCurrentWeatherType: function (data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "CURRENTWEATHER_DATA") {
			this.setCurrentWeatherType(payload.data);
		}
	}
});
