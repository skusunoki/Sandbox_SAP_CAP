sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "listofcontracts/test/integration/FirstJourney",
    "listofcontracts/test/integration/pages/RecordSetList",
    "listofcontracts/test/integration/pages/RecordSetObjectPage",
  ],
  function (JourneyRunner, opaJourney, RecordSetList, RecordSetObjectPage) {
    "use strict";
    var JourneyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: sap.ui.require.toUrl("listofcontracts") + "/index.html",
    });

    JourneyRunner.run(
      {
        pages: {
          onTheRecordSetList: RecordSetList,
          onTheRecordSetObjectPage: RecordSetObjectPage,
        },
      },
      opaJourney.run,
    );
  },
);
