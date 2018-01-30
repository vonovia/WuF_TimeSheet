sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/m/Dialog",
		"sap/m/Button"
	], function(BaseController, MessageBox, Utilities, History, Dialog, Button) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.wuFTimesheet.controller.Time", {
			handleRouteMatched: function(oEvent) {
				this.sContext = oEvent.getParameter("data").context;

				var oDatePicker = this.getView().byId("EventDate");
				var dateold = oDatePicker.getValue();
				var date = new Date();
				if (dateold === "") {
					date = Utilities.formatDateString(date);
					oDatePicker.setValue(date);
				} else {
					date = Utilities.formatDateString(dateold);
				}
				this.byId("EventTime").setDateValue(new Date());
				if (this.sContext) {
					this.readData = true;
					this.sPernr = this.sContext.substr(9, 8);
					this.getTimeEvents(date);
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
			_onListItemPress: function(oEvent) {

				var m = this.getOwnerComponent().getModel("exchangeModel");
				/* @type sap.ui.core.CustomData */
				var oData = oEvent.getParameter("listItem").data();
				var oProperties = {
					ReqId: oData.id,
					Pernr: oData.pernr,
					TimeType: oData.key,
					EventDate: oData.date,
					EventTime: oData.time,
					TimezoneOffset: oData.timezone
				};
				m.setData(oProperties);

				var oBindingContext = oEvent.getParameter("listItem").getBindingContext("Time");
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
						sPath = "Time>" + sPath;
						this.oRouter.navTo(sRouteName, {
							context: sPath
								//masterContext: sMasterContext
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
			onInit: function() {
				this.mBindingOptions = {};
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("Time").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			},
			/**
			 *@memberOf com.sap.build.standard.wuFTimesheet.controller.Time
			 */
			_onBtnCreateTime: function() {

				var timeType = this.getView().byId("CmbEvenType").getSelectedKey();
				var error = false;
				var iBreakCount = 0;
				for (var i = 0; i < this.timeEvents.length; i++) {
					if (this.timeEvents[i].TimeType === timeType) {
						if (timeType === "P15" || timeType === "P25") {
							iBreakCount++;
						} else {
							error = true;
						}
					}
				}
				if (error || iBreakCount > 1) {
					MessageBox.error("Es wurde bereits die maximale Anzahl für dieses Zeitereignis erfasst");
				} else {
					var oModel = this.getOwnerComponent().getModel("Time");
					var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam").getData();
					var fLen = oTeam.length;
					var that = this;
					this.readData = true;
					for (var i = 0; i < fLen; i++) {
						//oProperties.Pernr = oTeam[i].data().pernr;
						oModel.create("/TimeEventSet", {
							Pernr: oTeam[i].data().pernr,
							TimeType: this.getView().byId("CmbEvenType").getSelectedKey(),
							EventDate: Utilities.formatDateTimeString(this.getView().byId("EventDate").getDateValue()),
							EventTime: Utilities.formatTimeString(this.getView().byId("EventTime").getDateValue())
						}, {
							groupId: oTeam[i].data().pernr,
							success: function(oData, response) {
								that.getTimeEvents(Utilities.formatDateString(that.getView().byId("EventDate").getDateValue()));
								//MessageBox.success("Erfolgreich");
							}
						});

					}
				}
			},
			handleDelete: function(oEvent) {

				var oBindingContext = oEvent.getParameter("listItem").getBindingContext("Time");
				var sPath = oBindingContext ? oBindingContext.getPath() : null;

				var s = oEvent.getParameter("listItem");
				var oData = s.data();
				var a = [{
					label: "Datum",
					text: Utilities.formatDateString(oData.date)
				}, {
					label: "Ereignistyp",
					text: oData.timetypetext
				}, {
					label: "Zeit",
					text: Utilities.formatTime(oData.time.ms)
				}];
				var S = {
					showNote: false,
					title: "Zeitereignis löschen",
					confirmButtonLabel: "OK",
					additionalInformation: a
				};
				this.openConfirmationPopup(S, false, s, sPath);
			},
			deleteEntry: function(s, sPath) {

				this.Data = s.data();

				var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam").getData();
				var oModel = this.getOwnerComponent().getModel("Time");
				var that = this;
				var fLen = oTeam.length;
				this.readData = true;
				for (var i = 0; i < fLen; i++) {
					Utilities.getTimeEvents(oModel, oTeam[i].data().pernr, Utilities.formatDateString(this.Data.date), this.Data.time, this.Data.key,
						function(data) {
							that._deleteData(data);
						});
				}
			},
			_deleteData: function(data) {
				if (data !== undefined && data.length > 0) {
					var that = this;
					var oModel = this.getOwnerComponent().getModel("Time");
					var sPath = "/TimeEventSet(Pernr='" + data[0].Pernr + "',ReqId='" + data[0].ReqId + "')";

					oModel.remove(sPath, {
						success: function() {
							oModel.refresh();
							that.getTimeEvents(Utilities.formatDateString(that.getView().byId("EventDate").getValue()));
						},
						//error: that.errorHandler(),
						groupId: data[0].Pernr
					});
				}
			},
			getTimeEvents: function(date) {
				if (this.readData) {
					var that = this;
					var m = new sap.ui.model.json.JSONModel();
					Utilities.getTimeEvents(this.getOwnerComponent().getModel("Time"), this.sPernr, date, null, null, function(data) {
						/*data.sort(function(a, b) {
							return a.EventTime.ms - b.EventTime.ms;
						});*/
						m.setData(data);
						that.timeEvents = data;
						that.byId("TimeList").setModel(m, "timeEvents");
						var oSorter = new sap.ui.model.Sorter("EventTime", true, false);
						oSorter.fnCompare = function(a, b) {
							return a.ms - b.ms;
						};
						that.byId("TimeList").getBinding("items").sort(oSorter);
					});
					this.readData = false;
				}
			},
			/**
			 *@memberOf com.sap.build.standard.wuFTimesheet.controller.Time
			 */
			_onChangeDate: function() {

				/*				var oList = this.getView().byId("TimeList");
								var oItems = oList.getBinding("items");*/
				this.readData = true;
				var date = Utilities.formatDateString(this.getView().byId("EventDate").getDateValue());
				this.getTimeEvents(date);

				/*				var oFilter = new sap.ui.model.Filter({
									filters: [
										new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, this.sPernr),
										new sap.ui.model.Filter("EventDate", sap.ui.model.FilterOperator.EQ, date)
									],
									and: true
								});
								oItems.filter(oFilter);*/
			},
			openConfirmationPopup: function(s, a, b, sPath) {
				var c = this;
				var e = [];
				for (var i = 0; i < s.additionalInformation.length; i++) {
					e.push(new sap.m.Label({
						text: s.additionalInformation[i].label,
						design: "Bold"
					}));
					e.push(new sap.m.Text({
						text: s.additionalInformation[i].text
					}));
				}
				var f = new sap.ui.layout.form.SimpleForm({
					minWidth: 1024,
					editable: false,
					maxContainerCols: 2,
					layout: "ResponsiveGridLayout",
					labelSpanL: 5,
					labelSpanM: 5,
					labelSpanS: 5,
					emptySpanL: 2,
					emptySpanM: 2,
					emptySpanS: 2,
					columnsL: 1,
					columnsM: 1,
					columnsS: 1,
					content: e
				});
				var C = new sap.m.Dialog({
					title: s.title,
					content: [f],
					beginButton: new sap.m.Button({
						text: s.confirmButtonLabel,
						press: function() {
							if (a) {
								C.close();
							} else {
								c.deleteEntry(b, sPath);
							}
							C.close();
						}
					}),
					endButton: new sap.m.Button({
						text: "Abbrechen",
						press: function() {
							C.close();
						}
					})
				}).addStyleClass("sapUiContentPadding sapUiMediumMarginTopBottom");
				C.open();
			}
		});
	}, /* bExport= */
	true);