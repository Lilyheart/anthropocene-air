var jsonData,
    dataDictionary = {};
const INVERSE = -1,
      MISSINGVALUE = -999,
      DROP_SITE_CODE = ["EGBE1", "BYISX", "BYIS1", "BALA1"];

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

function updateParams(parameter) {
  loadParam1 = parameter;

  if (!parameterDatasets[parameter].isLoaded) {
    $.ajax({
      type: "GET",
      url: parameterDatasets[parameter].filename,
      dataType: "text",
      success: function(data) {
        parameterDatasets[parameter].isLoaded = true;
        parseCSV(data);
      }
    });
  }
}

function download(content, fileName, contentType) {
  // Use with // download(jsonData, "json.txt", "text/plain");
  var aaa, file;

  aaa = document.createElement("a");
  file = new Blob([content], {type: contentType});
  aaa.href = URL.createObjectURL(file);
  aaa.download = fileName;
  aaa.click();
}

$(document).ready(function() {
  jsonData = [];

  $("#parameter-dropdown").selectize({sortField: [{field: "text", direction: "asc"}]});
  for (let key in parameterDatasets) {
    if (parameterDatasets.hasOwnProperty(key)) {
      if (parameterDatasets[key].isDisplay) {
        $("#parameter-dropdown")[0].selectize.addOption({value: key, text: parameterDatasets[key].name});
      }
    }
  }

});
