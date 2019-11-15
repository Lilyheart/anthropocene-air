var loadParam1, loadParam2,
    dataDictionary = {};
const INVERSE = -1;

// Functions
function displayDate(UTCdate) {
  let month, day, year;

  month = (new Date(UTCdate).getUTCMonth() + 1).toString();
  day = (new Date(UTCdate).getUTCDate()).toString();
  year = (new Date(UTCdate).getUTCFullYear()).toString();

  return month.padStart(2, "0") + "/" + day.padStart(2, "0") + "/" + year;
}

function parsedData(data, parameter) {
  let dates, dateValue;

  // if the parameter doesn't exist, create it
  if (!dataDictionary.hasOwnProperty(parameter)) {
    dataDictionary[parameter] = data;
  }

   dates = Object.keys(dataDictionary[parameter]);

  // add date to slider array
  if (!parameterDatasets[parameter].hasOwnProperty("dates")) {
    parameterDatasets[parameter].dates = [];
  }
  for (let dateIndex in dates) {
    if (dates.hasOwnProperty(dateIndex)) {
      parameterDatasets[parameter].dates.push(new Date(dates[dateIndex] + " 00:00:00 +0").valueOf());
    }
  }

  parameterDatasets[parameter].dates.sort(function (date1, date2) {
    if (date1 > date2) {return 1;}
    if (date1 < date2) {return INVERSE;}

    return 0;
  });

}

$(document).ready(function() {
  let speedMax,
      defaultParam = Object.keys(parameterDatasets)[0];

  $("#dateSlider").slider();
  $("#speedSlider").slider({tooltip: "never"});

  $("#parameter-dropdown").selectize({sortField: [{field: "text", direction: "asc"}]});
  for (let key in parameterDatasets) {
    if (parameterDatasets.hasOwnProperty(key)) {
      if (parameterDatasets[key].isDisplay) {
        $("#parameter-dropdown")[0].selectize.addOption({value: key, text: parameterDatasets[key].name});
      }
    }
  }
  $("#parameter-dropdown").selectize()[0].selectize.setValue(defaultParam, true);

  mapSingle.setMaptype("mappoint");
  mapSingle.updateChart(defaultParam);
  issues.getIssues();

  document.getElementById("point").addEventListener("click", function(event) {
    mapSingle.setMaptype("mappoint");
  });

  document.getElementById("bubble").addEventListener("click", function(event) {
    mapSingle.setMaptype("mapbubble");
  });

  speedMax = $("#speedSlider").slider()[0].attributes["data-slider-ticks"].value;
  speedMax = speedMax.slice(1, speedMax.length + INVERSE);
  speedMax = parseFloat(speedMax.split(",")[1]) + parseFloat(speedMax.split(",")[0]);

  $("#speedSlider").slider().on("slideStop", function(ev) {
    mapSingle.setTimeout(speedMax - this.value);
  });

  $('[data-toggle="tooltip"]').each(function() {
    $(this).tooltip({html: true, container: $(this), delay: {hide: 400}});
  });

});
