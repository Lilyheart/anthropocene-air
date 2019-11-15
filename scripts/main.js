/*eslint id-length: ["error", { "exceptions": ["i", "j", "x", "y", "z"] }]*/
var parameterDatasets, loadParam1, loadParam2,
    dataDictionary = {};
const INVERSE = -1,
      COLORaxisSCALE = 100,
      MISSINGVALUE = -999,
      DROP_SITE_CODE = ["EGBE1", "BYISX", "BYIS1", "BALA1"];

// Functions
function displayDate(UTCdate) {
  return new Date(UTCdate).toLocaleString("zu", {month: "2-digit", day: "2-digit", year: "numeric", timeZone: "UTC"});
}

function parseCSV(data) {
  let rawData, headers, lineData, chartData, paramName, siteCode,
      date, displayValue, value, lat, long, dateValue,
      paramList = [];

  rawData = data.split("\n");
  headers = rawData[0].split(",");

  for (let j = 4; j < headers.length; j += 1) {
    paramList.push(headers[j].split(":")[0]);
  }

  // for each row of data
  for (let i = 1; i < (rawData.length - 1); i += 1) {
    lineData = rawData[i].split(",");

    siteCode = lineData[0];
    if (DROP_SITE_CODE.includes(siteCode)) {continue;}

    date = lineData[1];
    dateValue = new Date(date + "Z").valueOf();
    lat = parseFloat(lineData[2]);
    long = parseFloat(lineData[3]);

    // for each parameter
    for (let j = 4; j < headers.length; j += 1) {
      if (parseFloat(lineData[j]) === MISSINGVALUE) {continue;}

      value = Math.max(0, parseFloat(lineData[j]));

      chartData = {};

      chartData["id"] = siteCode;
      displayValue = Math.max(value, parameterDatasets[loadParam1].percentileBottom);
      displayValue = Math.min(displayValue, parameterDatasets[loadParam1].percentileTop);
      chartData["value"] = chartData["z"] = (displayValue * COLORaxisSCALE * parameterDatasets[loadParam1].scale);
      chartData["actual"] = value;
      chartData["lat"] = lat;
      chartData["lon"] = long;

      paramName = headers[j].split(":")[0];
      // add date to slider array
      if (!parameterDatasets[paramName].hasOwnProperty("dates")) {
        parameterDatasets[paramName].dates = [];
      }
      if (parameterDatasets[paramName].dates.indexOf(dateValue) === INVERSE) {
        parameterDatasets[paramName].dates.push(dateValue);
      }

      // test for min/max value
      if (chartData["value"] < parameterDatasets[paramName].minValue || !parameterDatasets[paramName].minValue) {
        parameterDatasets[paramName].minValue = chartData["value"];
      }
      if (chartData["value"] > parameterDatasets[paramName].maxValue || !parameterDatasets[paramName].maxValue) {
        parameterDatasets[paramName].maxValue = chartData["value"];
      }

      // if the parameter doesn't exist, create it
      if (!dataDictionary.hasOwnProperty(paramName)) {
        dataDictionary[paramName] = {};
      }

      // if the date doesn't exist, create it and then add the chart data
      if (!dataDictionary[paramName].hasOwnProperty(date)) {
        dataDictionary[paramName][date] = [chartData];
      } else {
        dataDictionary[paramName][date].push(chartData);
      }
    }
  }

  for (let param in paramList) {
    if (paramList.hasOwnProperty(param)) {
      parameterDatasets[paramList[param]].dates.sort(function (date1, date2) {
        if (date1 > date2) {return 1;}
        if (date1 < date2) {return INVERSE;}

        return 0;
      });
    }
  }
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
