sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "contracts/test/integration/FirstJourney",
    "contracts/test/integration/pages/ContractsList",
    "contracts/test/integration/pages/ContractsObjectPage",
  ],
  function (JourneyRunner, opaJourney, ContractsList, ContractsObjectPage) {
    "use strict";
    var JourneyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: sap.ui.require.toUrl("contracts") + "/index.html",
    });

    JourneyRunner.run(
      {
        pages: {
          onTheContractsList: ContractsList,
          onTheContractsObjectPage: ContractsObjectPage,
        },
      },
      opaJourney.run,
    );
  },
);
