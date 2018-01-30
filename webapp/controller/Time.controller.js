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
						var oParams = {};
						//if (oEvent.mParameters.data.context) {
						//if (this.sContext) {
						//this.sContext.initialize();
						//}
						this.sContext = oEvent.getParameter("data").context;
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

						var oDatePicker = this.getView().byId("EventDate");
						var dateold = oDatePicker.getValue();
						var date = new Date();
						if (dateold === "") {
							date = this.formatDateString(date);
							oDatePicker.setValue(date);
						} else {
							date = this.formatDateString(dateold);
						}
						this.byId("EventTime").setDateValue(new Date());
						if (this.sContext) {
							this.sPernr = this.sContext.substr(9, 8);
							//var oFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, sPernr);
							/** @type sap.ui.model.Filter */
							var oFilter = new sap.ui.model.Filter({
								filters: [
									new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, this.sPernr),
									new sap.ui.model.Filter("EventDate", sap.ui.model.FilterOperator.EQ, date)
								],
								and: true
							});
							oItems.filter(oFilter);

							var oSorter = new sap.ui.model.Sorter("EventTime", true, false);
						/*	oSorter.fnCompare = function(a, b) {
								 return a.ms - b.ms;
							};*/
						oItems.sort(oSorter);
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
					//var a = this.byId("CmbEvenType").getModel();
					//this.getOwnerComponent().setModel(a, "eventTypesModel");
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
				/*	_onObjectListItemPress: function(oEvent) {

						var m = this.getOwnerComponent().getModel("exchangeModel");
						var a = this.byId("CmbEvenType").getModel();
						this.getOwnerComponent().setModel(a, "eventTypesModel");
						var s = oEvent.getParameter("listItem").data().id;
						var b;
						var c = this.timeEvents;
						for (var i = 0; i < c.length; i++) {
							if (c[i].ReqId === s) {
								b = c[i];
								break;
							}
						}
						m.setData(b);
						clearInterval(this._timeCalculator);
						this._nCounter = 0;
						this.popover = null;
						this.oRouter.navTo("TimeEdit", {}, true);

						/*				var oBindingContext = oEvent.getSource().getBindingContext("Time");
										return new Promise(function(fnResolve) {
											this.doNavigate("TimeEdit", oBindingContext, fnResolve, "");
										}.bind(this)).catch(function(err) {
											if (err !== undefined) {
												MessageBox.error(err.message);
											}
										});*/
				//},

				onInit: function() {
					this.mBindingOptions = {};
					this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					this.oRouter.getTarget("Time").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
					this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "YYYYMMdd"
					});
					/*if (!this.getOwnerComponent().getModel("exchangeModelTeam").getData().length) {
						this.oRouter.navTo("Team", true);
					}*/
				},
				/**
				 *@memberOf com.sap.build.standard.wuFTimesheet.controller.Time
				 */
				_onBtnCreateTime: function() {
					
					// Check TimeEventTypes
					var oItems = this.getView().byId("TimeList").getBinding("items");
					var timeType = this.getView().byId("CmbEvenType").getSelectedKey();
					var error = false;
					for (var i = 0; i < oItems.length; i++){
						if (oItems[i].getData().key === timeType) {
							error = true;
						}
					}
					if (error){
						MessageBox.error("Erfolgreich");
					} else {
					//var oModel = this.getOwnerComponent().getModel();
					//var oContext = this.getView().byId("FormContainer").getBindingContext();
					//var oProperties = oContext.getObject();
					//oProperties.EventDate = "20180111";
					//var d = this.formatDateTimeString(oProperties.EventDate);
					//var d = new Date(oProperties.EventDate);
					//oProperties.EventDate = this.oFormatYyyymmdd.format(d);
					//oProperties.EventDate = this.formatDateTimeString(oProperties.EventDate);
					var oProperties = {
						Pernr: this.Pernr,
						TimeType: this.getView().byId("CmbEvenType").getSelectedKey(),
						EventDate: this.formatDateTimeString(this.getView().byId("EventDate").getDateValue()),
						EventTime: this.formatTimeString(this.getView().byId("EventTime").getDateValue())
					};
					var oModel = this.getOwnerComponent().getModel("Time");
					var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam").getData();
					var fLen = oTeam.length;
					for (var i = 0; i < fLen; i++) {
						//oProperties.Pernr = oTeam[i].data().pernr;
						oModel.create("/TimeEventSet", {
							Pernr: oTeam[i].data().pernr,
							TimeType: this.getView().byId("CmbEvenType").getSelectedKey(),
							EventDate: this.formatDateTimeString(this.getView().byId("EventDate").getDateValue()),
							EventTime: this.formatTimeString(this.getView().byId("EventTime").getDateValue())
						}, {
							groupId: oTeam[i].data().pernr
						});

					}
					oModel.submitChanges({
						success: function(oData, response) {
							MessageBox.success("Erfolgreich");
						}
					});
					//oModel.setProperty(sPath + "/EventDate", this.formatDateTimeString(oProperties.EventDate));
					//oModel.setProperty(sPath + "/Pernr", "22004454");
					//oContext.getModel().refresh();
					//oModel.updateBindings("true");
					//oModel.resetChanges();
					}
				},
				handleDelete: function(oEvent) {

					var oBindingContext = oEvent.getParameter("listItem").getBindingContext("Time");
					var sPath = oBindingContext ? oBindingContext.getPath() : null;

					var s = oEvent.getParameter("listItem");
					var oData = s.data();
					var a = [{
						label: "Datum",
						text: this.formatDateString(oData.date)
					}, {
						label: "Ereignistyp",
						text: oData.timetypetext
					}, {
						label: "Zeit",
						text: this.formatTime(oData.time.ms)
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
					for (var i = 0; i < fLen; i++) {
						oModel.read("/TimeEventSet", {
							filters: [
								new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, oTeam[i].data().pernr),
								new sap.ui.model.Filter("EventDate", sap.ui.model.FilterOperator.EQ, this.Data.date),
								new sap.ui.model.Filter("TimeType", sap.ui.model.FilterOperator.EQ, this.Data.key)
							],
							success: function(data) {
								that._deleteData(data.results);
							}
						});
					}
				},
				_deleteData: function(data) {

					var oModel = this.getOwnerComponent().getModel("Time");
					var sPath = "/TimeEventSet(Pernr='" + data[0].Pernr + "',ReqId='" + data[0].ReqId + "')";

					oModel.remove(sPath, {
						//success: that.successHandler(),
						//error: that.errorHandler(),
						groupId: data[0].Pernr
					});
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
				/**
				 *@memberOf com.sap.build.standard.wuFTimesheet.controller.Time
				 */
				_onChangeDate: function() {

					var oList = this.getView().byId("TimeList");
					var oItems = oList.getBinding("items");

					var date = this.formatDateString(this.getView().byId("EventDate").getDateValue());

					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, this.sPernr),
							new sap.ui.model.Filter("EventDate", sap.ui.model.FilterOperator.EQ, date)
						],
						and: true
					});
					oItems.filter(oFilter);
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