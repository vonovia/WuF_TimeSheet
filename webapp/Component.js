sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/build/standard/wuFTimesheet/model/models",
	"sap/ui/core/routing/HashChanger"
], function(UIComponent, Device, models, HashChanger) {
	"use strict";

	var navigationWithContext = {
		"TeamSet": {
			"Time": "",
			"TimeEdit": "TimeEvents"
		},
		"TimeEventSet": {
			"TimeEdit": ""
		},
		"TimeEventTypesSet": {
			"TimeEdit": "TimeEvents"
		}
	};

	return UIComponent.extend("com.sap.build.standard.wuFTimesheet.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// set the dataSource model
			this.setModel(new sap.ui.model.json.JSONModel({
				"uri": "/here/goes/your/serviceUrl/local/"
			}), "dataSource");

			// set application model
			var oApplicationModel = new sap.ui.model.json.JSONModel({});
			this.setModel(oApplicationModel, "applicationModel");

			// set exchangeModel Model
			var oExchangeModel = new sap.ui.model.json.JSONModel({});
			this.setModel(oExchangeModel, "exchangeModel");

			var oExchangeModelTeam = new sap.ui.model.json.JSONModel({});
			this.setModel(oExchangeModelTeam, "exchangeModelTeam");

			// reset the routing hash
			HashChanger.getInstance().replaceHash("");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		createContent: function() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},

		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}
	});

});