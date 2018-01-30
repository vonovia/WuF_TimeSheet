sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"./utilities",
		"sap/ui/core/routing/History",
		"sap/m/Dialog",
		"sap/m/Button"
	], function(BaseController, MessageBox, Utilities, History, Dialog, Button) {
		"use strict";
		return BaseController.extend("com.sap.build.standard.wuFTimesheet.controller.TimeEdit", {
			handleRouteMatched: function(oEvent) {
				var oProperties = this.getOwnerComponent().getModel("exchangeModel").getData();

				this.Pernr = oProperties.Pernr; //this.sContext.substr(25, 8);
				this.ReqId = oProperties.ReqId; // this.sContext.substr(42, 32);
				this.EventDate = oProperties.EventDate;
				this.TimeType = oProperties.TimeType;
				this.EventTime = oProperties.EventTime;

				this.getView().byId("EventTime").setValue(Utilities.formatTime(oProperties.EventTime.ms));
				this.getView().byId("CmbEvenType").setSelectedKey(oProperties.TimeType);

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
				this._onPageNavButtonPress();
			},
			onInit: function() {
				this.mBindingOptions = {};
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("TimeEdit").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			},
			/**
			 *@memberOf com.sap.build.standard.wuFTimesheet.controller.TimeEdit
			 */
			_onChangeData: function() {

				//	var oOldProperties = this.getOwnerComponent().getModel("exchangeModel").getData();
				var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam").getData();
				var oModel = this.getOwnerComponent().getModel("Time");
				var that = this;
				var fLen = oTeam.length;
				for (var i = 0; i < fLen; i++) {
					Utilities.getTimeEvents(oModel, oTeam[i].data().pernr, this.EventDate, this.EventTime, this.TimeType, function(data) {
						that._changeData(data);
					});
				}
			},
			successHandler: function(d, r) {

				if (!this.successDialog) {
					this.resizableDialog = new Dialog({
						title: 'Erfolgreich',
						contentWidth: "250px",
						contentHeight: "100px",
						resizable: true,
						content: [
							new sap.m.Text({
								text: "Daten wurden erfolgreich geändert"
							})
						],
						beginButton: new Button({
							text: 'Close',
							press: function() {
								this.resizableDialog.close();
								this.onClose();
							}.bind(this)
						})
					});

					//to get access to the global model
					this.getView().addDependent(this.resizableDialog);
				}

				this.resizableDialog.open();

			},
			errorHandler: function(e) {
				if (e) {
					MessageBox.error("Fehler beim Speichern");
				}
			},
			onClose: function(oAction) {
				var that = this;
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();
				var oQueryParams = that.getQueryParameters(window.location);
				if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
					window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.navTo("default", true);
				}
				//this._onPageNavButtonPress();	
			},
			_changeData: function(data) {
				var that = this;
				var oModel = this.getOwnerComponent().getModel("Time");
				var sPath = "/TimeEventSet(Pernr='" + data[0].Pernr + "',ReqId='" + data[0].ReqId + "')";
				data[0].EventTime = Utilities.formatTimeString(this.getView().byId("EventTime").getDateValue());
				oModel.update(sPath, data[0], {
					merge: false,
					success: that.successHandler(),
					error: that.errorHandler(),
					groupId: data[0].Pernr
				});
			}
		});
	}, /* bExport= */
	true);