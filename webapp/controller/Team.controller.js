sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.wuFTimesheet.controller.Team", {
		handleRouteMatched: function(oEvent) {

			var oItems = this.getView().byId("tblTeam").getBinding("items");
			var oFilter = new sap.ui.model.Filter("OwnTeam", sap.ui.model.FilterOperator.EQ, "true");
			oItems.filter(oFilter);

		},
		_onPageNavButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("Time", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {

			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

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
								context: oModel.getProperty("/Pernr"),
								//context: sPath,
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
		_onTableItemPress: function(oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			var oSelected = oEvent.getParameter("listItem");
			var aTeam = [oSelected];
			var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam");
			oTeam.setData(aTeam);
			return new Promise(function(fnResolve) {
				this.doNavigate("Time", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		toggleOwnTeam: function(oEvent) {
			var sFilter = oEvent.getParameter("pressed") ? "true" : "false";
			var oItems = this.getView().byId("tblTeam").getBinding("items");
			var oFilter = new sap.ui.model.Filter("OwnTeam", sap.ui.model.FilterOperator.EQ, sFilter);
			oItems.filter(oFilter);
		},
		_onTeamChoice: function(oEvent) {

			var oSelectedItems = this.getView().byId("tblTeam").getSelectedItems();
			var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam");
			//var oData = oEvent.getParameter("listItem").data();
			oTeam.setData(oSelectedItems);

			var oBindingContext = oSelectedItems[0].getBindingContext();
			return new Promise(function(fnResolve) {

				this.doNavigate("Time", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onTeamOverview: function(oEvent) {
			var oSelectedItems = this.getView().byId("tblTeam").getSelectedItems();
			var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam");
			oTeam.setData(oSelectedItems);

			//this.oRouter.navTo("Overview");

			var oBindingContext = oSelectedItems[0].getBindingContext();
			return new Promise(function(fnResolve) {

				this.doNavigate("Overview", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		onInit: function() {

			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Team").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				ownTeamFilterOn: true
			}), "ui");

		}
	});
}, /* bExport= */ true);