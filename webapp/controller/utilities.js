sap.ui.define([
	"./utilities"
], function() {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {
		formatTime: function(t) {
			var T = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HH:mm",
				UTC: true
			});
			var d = new Date(t);
			var a = T.format(d);
			return a;
		},
		formatTimeString: function(d) {
			var h = d.getHours(),
				m = d.getMinutes();
			if (h.length === 1) {
				h = "0" + h;
			}
			if (m.length === 1) {
				m = "0" + m;
			}
			return "PT" + h + "H" + m + "M00S";
		},
		formatDateTimeString: function(d) {
			if (typeof d === "string") {
				d = new Date(d);
			}
			var a = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});
			var b = a.format(d) + "T00:00:00";
			return b;
		},
		formatDateString: function(d) {
			if (typeof d === "string") {
				d = new Date(d);
			}
			var a = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});
			var b = a.format(d);
			return b;
		},
	};
});