var jsonData,
    dataDictionary = {},
    loadedParams = [];
const INVERSE = -1,
      MISSINGVALUE = -999,
      PRECISIION = 5,
      DROP_SITE_CODE = ["EGBE1", "BYISX", "BYIS1", "BALA1"];

function parseCSV(data, parameter) {
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
    dateValue = new Date(date + " 00:00:00 +0").valueOf();
    lat = parseFloat(lineData[2]);
    long = parseFloat(lineData[3]);

    // for each parameter
    for (let j = 4; j < headers.length; j += 1) {
      if (parseFloat(lineData[j]) === MISSINGVALUE) {continue;}

      chartData = {};

      chartData["id"] = siteCode;
      displayValue = (parseFloat(lineData[j]) * parameterDatasets[parameter].scale);
      displayValue = parseFloat( displayValue.toPrecision(PRECISIION));
      chartData["value"] = chartData["z"] = displayValue;
      chartData["lat"] = lat;
      chartData["lon"] = long;

      paramName = headers[j].split(":")[0];

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
}

function updateParams(parameter) {
  let toAppend;

  if (!parameterDatasets[parameter].isLoaded) {
    $.ajax({
      type: "GET",
      url: "data/" + parameter + ".csv",
      dataType: "text",
      success: function(data) {
        parameterDatasets[parameter].isLoaded = true;
        parseCSV(data, parameter);

        toAppend = "<button type='button'";
        toAppend += " id='" + parameter + "'";
        toAppend += " onClick='download(\"" + parameter + "\")'";
        toAppend += " class='list-group-item list-group-item-action'>";
        toAppend += parameter;
        toAppend += "</button>";

        $("#downloads").append(toAppend);

        $("#downloadAll").prop("disabled", false);
        loadedParams.push(parameter);
      }
    });
  }
}

function updateAllParms() {
  for (let key in parameterDatasets) {
    if (parameterDatasets.hasOwnProperty(key)) {
      updateParams(key);
    }
  }
  $("#downloadAll").prop("disabled", false);
}

function download(parameter) {
  var fileName, element, blob,
      jsonSpace = 2;

  fileName = parameter + ".txt";
  element = document.createElement("a");
  blob = new Blob([JSON.stringify(dataDictionary[parameter], null, jsonSpace)], {type: "text/plain"});

  element.href = URL.createObjectURL(blob);
  element.download = fileName;
  element.click();

  document.getElementById(parameter).classList.add("list-group-item-primary");
}

function downloadAllParms() {
  for (let key in loadedParams) {
    if (loadedParams.hasOwnProperty(key)) {
      download(loadedParams[key]);
    }
  }
}

$(document).ready(function() {
  $("#parameter-dropdown").selectize({sortField: [{field: "text", direction: "asc"}]});
  for (let key in parameterDatasets) {
    if (parameterDatasets.hasOwnProperty(key)) {
      if (parameterDatasets[key].isDisplay) {
        $("#parameter-dropdown")[0].selectize.addOption({value: key, text: parameterDatasets[key].name});
      }
    }
  }
});
