sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./utilities",
	"sap/ui/table/Table"
], function(Controller, Utilities) {
	"use strict";

	return Controller.extend("com.sap.build.standard.wuFTimesheet.controller.Overview", {
		handleRouteMatched: function(oEvent) {

			var oDatePicker = this.getView().byId("EventDate");
			var dateold = oDatePicker.getValue();
			this.date = new Date();
			if (dateold === "") {
				this.date = Utilities.formatDateString(this.date);
				oDatePicker.setValue(this.date);
			} else {
				this.date = Utilities.formatDateString(dateold);
			}

			this._getTimeEvents(this.date);

		},

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sap.build.standard.wuFTimesheet.view.Overview
		 */
		onInit: function() {
			this.mBindingOptions = {};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Overview").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oOverview = this.getOwnerComponent().getModel("Overview");

			/** @type sap.ui.table.Table */
			this.oTable = new sap.ui.table.Table("tblOverView", {
				visibleRowCountMode: "Interactive",
				visibleRowCount: 1,
				minAutoRowCount: 1,
				selectionMode: "None",
				noDataText: "Keine Daten vorhanden"
			});
			this.oTable.setModel(oOverview);
			this.oTable.bindRows("Overview>/rows");
			this.oTable.placeAt(this.getView().byId("Page"));

		},
		/**
		 *@memberOf com.sap.build.standard.wuFTimesheet.controller.Time
		 */
		_onChangeDate: function() {

			var date = Utilities.formatDateString(this.getView().byId("EventDate").getDateValue());
			this._getTimeEvents(date);
		},

		_getTimeEvents: function(date) {
			var oModel = this.getOwnerComponent().getModel("Time");
			var oTeam = this.getOwnerComponent().getModel("exchangeModelTeam").getData();
			var oOverview = this.getOwnerComponent().getModel("Overview");
			var fLen = oTeam.length;
			var that = this;

			oOverview.setData({
				columns: [],
				rows: []
			});

			this.oTable.destroyColumns();
			this.oTable.setVisibleRowCount(fLen);
			var aRows = [];
			for (var i = 0; i < fLen; i++) {
				var oRow = {};
				oRow.Pernr = oTeam[i].data().pernr;
				oRow.Name = oTeam[i].data().name;
				aRows.push(oRow);
				oModel.read("/TimeEventSet", {
					filters: [
						new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, oTeam[i].data().pernr),
						new sap.ui.model.Filter("EventDate", sap.ui.model.FilterOperator.EQ, date)
					],
					success: function(data) {
						that._addData(data.results);
					}
				});
			}
			oOverview.setData({
				columns: [],
				rows: aRows
			});
		},

		_addData: function(data) {
			var oOverview = this.getOwnerComponent().getModel("Overview");
			var aData = oOverview.getData().rows;
			var aColumnData = oOverview.getData().columns;

			data.sort(function(a, b) {
				return a.EventTime.ms - b.EventTime.ms;
			});

			if (aColumnData.length < (data.length + 1)) {
				if (aColumnData.length > 0) {
					this.oTable.destroyColumns();
					aColumnData = [];
				}
				var oColumn = new sap.ui.table.Column("Pernr", {
					name: "Pernr",
					label: new sap.m.Label("", {
						text: "Mitarbeiter"
					}),
					template: [new sap.m.ObjectIdentifier("", {
						title: "{Overview>Name}",
						text: "{Overview>Pernr}"
					})]
				});
				this.oTable.addColumn(oColumn);
				/*{
					columnName: "Personalnummer",
					columnKey: "Pernr"
				};*/
				this.P10 = 0;
				this.P15 = 0;
				this.P20 = 0;
				this.P25 = 0;

				aColumnData.push(oColumn);
				for (var i = 0; i < data.length; i++) {
					for (var iColumn = 0; iColumn < aColumnData.length; iColumn++) {
						if (aColumnData[iColumn].getId() === (data[i].TimeType + this[data[i].TimeType])) {
							this[data[i].TimeType]++;
						}
					}
					oColumn = new sap.ui.table.Column(data[i].TimeType + this[data[i].TimeType], {
						name: data[i].TimeTypeText,
						label: new sap.m.Label("", {
							text: data[i].TimeTypeText
						}),
						template: [new sap.m.TimePicker("", {
							editable: false,
							value: "{Overview>" + data[i].TimeType + this[data[i].TimeType] + "}"
						})]
					});
					this.oTable.addColumn(oColumn);
					aColumnData.push(oColumn);
				}
			}

			// Name des MA holen
			var col1 = {};
			for (var iTeam = 0; iTeam < aData.length; iTeam++) {
				if (aData[iTeam].Pernr === data[0].Pernr) {
					col1 = aData[iTeam];
				}
			}
			this.P10 = 0;
			this.P15 = 0;
			this.P20 = 0;
			this.P25 = 0;

			for (var i = 0; i < data.length; i++) {
				if (col1[data[i].TimeType + this[data[i].TimeType]] !== undefined) {
					this[data[i].TimeType]++;
				}
				col1[data[i].TimeType + this[data[i].TimeType]] = Utilities.formatTime(data[i].EventTime.ms);
			}

			oOverview.setData({
				columns: aColumnData,
				rows: aData
			});
		}

	});

});