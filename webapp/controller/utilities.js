sap.ui.define([
	"./utilities"
], function() {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {
		getTimeEvents: function(oModel, pernr, eventDate, eventTime, timeType, parseData) {
			oModel.read("/TimeEventSet", {
				filters: [
					new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, pernr),
					new sap.ui.model.Filter("EventDate", sap.ui.model.FilterOperator.EQ, eventDate)
				],
				success: function(data) {
					for (var i = 0; i < data.results.length; i++) {
						if (eventTime !== null && data.results[i].EventTime.ms !== eventTime.ms) {
							data.results.splice(i, 1);
							i--;
						} else if (timeType !== null && data.results[i].TimeType !== timeType) {
							data.results.splice(i, 1);
							i--;
						}
					}
					parseData(data.results);
				}
			});
		},
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