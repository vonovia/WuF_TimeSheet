sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History"
	], function(BaseController, MessageBox, Utilities, History) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.wuFTimesheet.controller.TimeEdit", {
			handleRouteMatched: function(oEvent) {
				var oParams = {};
				if (oEvent.mParameters.data.context) {
					this.sContext = oEvent.mParameters.data.context;
					var sPath = this.sContext.split(">")[1];
					this.Path = "/" + sPath;
					sPath = "Time>/" + sPath;
					var oPath;
					if (this.sContext) {
						oPath = {
							path: sPath,
							parameters: oParams
						};

						var oProperties = this.getOwnerComponent().getModel("exchangeModel").getData();

						//this.getView().bindObject(oPath);
						this.Pernr = oProperties.Pernr; //this.sContext.substr(25, 8);
						this.ReqId = oProperties.ReqId; // this.sContext.substr(42, 32);

						//this.getView().byId("EventTime").setValue(this.formatTime(oProperties.EventTime));
						this.getView().byId("EventTime").setValue(this.formatTime(oProperties.EventTime.ms));
						this.getView().byId("CmbEvenType").setSelectedKey(oProperties.TimeType);
					}
				}
			},
			_onPageNavButtonPress: function() {
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();
				var oQueryParams = this.getQueryParameters(window.location);
				if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
					window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("default", true);
				}
			},
			getQueryParameters: function(oLocation) {
				var oQuery = {};
				var aParams = oLocation.search.substring(1).split("&");
				for (var i = 0; i < aParams.length; i++) {
					var aPair = aParams[i].split("=");
					oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
				}
				return oQuery;
			},
			_onButtonPress1: function() {
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();
				var oQueryParams = this.getQueryParameters(window.location);
				if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
					window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("default", true);
				}
			},
			onInit: function() {
				this.mBindingOptions = {};
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("TimeEdit").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			},
			/**
			 *@memberOf com.sap.build.standard.wuFTimesheet.controller.TimeEdit
			 */
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
			_onChangeData: function() {

				var oOldProperties = this.getOwnerComponent().getModel("exchangeModel").getData();

				var oProperties = {
					ReqId: this.ReqId,
					Pernr: this.Pernr,
					TimeType: this.getView().byId("CmbEvenType").getSelectedKey(),
					EventDate: this.formatDateTimeString(oOldProperties.EventDate),
					EventTime: this.formatTimeString(this.getView().byId("EventTime").getDateValue()),
					TimezoneOffset: oOldProperties.TimezoneOffset,
					ApproverPernr: "00000000"
				};
				var oModel = this.getOwnerComponent().getModel("Time");
				//oModel.update(this.Path, oProperties, {
				//	refreshAfterChange: false
				//});

				/*				oModel.update(this.Path, oProperties, {
									merge: false,
									success: this.successHandler(),
									error: this.errorHandler()
								});*/

				oModel.update(this.Path, oProperties, {merge: false}, 
				function(d, r) {
					this.successHandler(d, r);
				}, function(e) {
					this.errorHandler(e);
				});

				//oModel.submitChanges(this.Path, {

				//});
			},
			successHandler: function(d, r) {
				MessageBox.success("Erfolgreich geändert");
				this.oRouter.navTo("Time", true);
			},
			errorHandler: function(e) {
				if (e) {
					MessageBox.error("Fehler beim Speichern");
				}
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
			formatTime: function(t) {
				var T = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "HH:mm",
					UTC: true
				});
				var d = new Date(t);
				var a = T.format(d);
				return a;
			}
		});
	}, /* bExport= */
	true);