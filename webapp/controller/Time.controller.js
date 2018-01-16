sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History"
	], function(BaseController, MessageBox, Utilities, History) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.wuFTimesheet.controller.Time", {
			handleRouteMatched: function(oEvent) {
				var oParams = {};
				//if (oEvent.mParameters.data.context) {
				//if (this.sContext) {
				//this.sContext.initialize();
				//}
				this.sContext = oEvent.mParameters.data.context;
				var oPath;
				//if (this.sContext) {
				oPath = {
					path: "Time>/TimeEventSet" //parameters: {filter: {'Pernr': this.sContext} }
						//path: "TimeEntry>/TimeEventSet" + this.sContext,
						//parameters: oParams
				};
				this.getView().bindObject(oPath);
				var oList = this.getView().byId("TimeList");
				var oItems = oList.getBinding("items");

				var today = new Date();
				today = this.formatDateString(today);

				if (this.sContext) {
					var sPernr = this.sContext.substr(9, 8);
					//var oFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, sPernr);
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, sPernr),
							new sap.ui.model.Filter("EventDate", sap.ui.model.FilterOperator.EQ, today)
						],
						and: true
					});
					oItems.filter(oFilter);
				}
				//

				//	}
				//	}
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
			_onListItemPress: function(oEvent) {
				var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
				return new Promise(function(fnResolve) {
					this.doNavigate("TimeEdit", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},
			doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
				var sPath = oBindingContext ? oBindingContext.getPath() : null;
				var oModel = oBindingContext ? oBindingContext.getModel() : null;
				var sEntityNameSet;
				if (sPath !== null && sPath !== "") {
					if (sPath.substring(0, 1) === "/") {
						sPath = sPath.substring(1);
					}
					sEntityNameSet = sPath.split("(")[0];
				}
				var sNavigationPropertyName;
				var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;
				if (sEntityNameSet !== null) {
					sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
						sRouteName);
				}
				if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
					if (sNavigationPropertyName === "") {
						this.oRouter.navTo(sRouteName, {
							context: sPath,
							masterContext: sMasterContext
						}, false);
					} else {
						oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
							if (bindingContext) {
								sPath = bindingContext.getPath();
								if (sPath.substring(0, 1) === "/") {
									sPath = sPath.substring(1);
								}
							} else {
								sPath = "undefined";
							}
							// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
							if (sPath === "undefined") {
								this.oRouter.navTo(sRouteName);
							} else {
								this.oRouter.navTo(sRouteName, {
									context: sPath,
									masterContext: sMasterContext
								}, false);
							}
						}.bind(this));
					}
				} else {
					this.oRouter.navTo(sRouteName);
				}
				if (typeof fnPromiseResolve === "function") {
					fnPromiseResolve();
				}
			},
			_onObjectListItemPress: function(oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();
				return new Promise(function(fnResolve) {
					this.doNavigate("TimeEdit", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},
			onInit: function() {
				this.mBindingOptions = {};
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("Time").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "YYYYMMdd"
				});

			},
			/**
			 *@memberOf com.sap.build.standard.wuFTimesheet.controller.Time
			 */
			_onBtnCreateTime: function() {
				//var oModel = this.getOwnerComponent().getModel();
				//var oContext = this.getView().byId("FormContainer").getBindingContext();
				//var oProperties = oContext.getObject();
				//oProperties.EventDate = "20180111";
				//var d = this.formatDateTimeString(oProperties.EventDate);
				//var d = new Date(oProperties.EventDate);
				//oProperties.EventDate = this.oFormatYyyymmdd.format(d);

				//oProperties.EventDate = this.formatDateTimeString(oProperties.EventDate);

				var oProperties = {
					Pernr: "22004454",
					TimeType: this.getView().byId("CmbEvenType").getSelectedKey(),
					EventDate: this.formatDateTimeString(this.getView().byId("EventDate").getDateValue()),
					EventTime: this.formatTimeString(this.getView().byId("EventTime").getDateValue())
				};

				var oModel = this.getOwnerComponent().getModel("Time");

				oModel.create("/TimeEventSet", oProperties);
				//oModel.setProperty(sPath + "/EventDate", this.formatDateTimeString(oProperties.EventDate));
				//oModel.setProperty(sPath + "/Pernr", "22004454");

				oModel.submitChanges({
					success: function(oData, response) {
						MessageBox.success("Erfolgreich");
					}
				});
				//oContext.getModel().refresh();
				//oModel.updateBindings("true");
				//oModel.resetChanges();

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
			}

		});
	}, /* bExport= */
	true);