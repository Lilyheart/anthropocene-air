/*eslint id-length: ["error", { "exceptions": ["i", "j", "x", "y", "z"] }]*/
var parameterDatasets, chart, loadParam1, loadParam2,
    dataDictionary = {};
const XSHIFT = 5,
      YSHIFT = -200,
      DECIMALS = 2,
      MISSINGVALUE = -999,
      TWODIGITDATE = 10,
      INVERSE = -1,
      PRINTME = 100000000000;

// Create array to store dataset information
parameterDatasets = {
ALf: {
  name: "Aluminum Fine",
  filename: "data/ALf.csv"
},
NH4f: {
  name: "Ammonium Ion (Fine)",
  filename: "data/NH4f.csv"
}};

// Set default
loadParam1 = Object.keys(parameterDatasets)[0];

// Functions
function displayDate(date) {
  let dateString = "";

  if ((date.getMonth() + 1) < TWODIGITDATE) {
    dateString += 0;
  }
  dateString += (date.getMonth() + 1) + "/";

  if (date.getDate() < TWODIGITDATE) {
    dateString += 0;
  }
  dateString += (date.getDate() + 1) + "/" + date.getFullYear();

  return dateString;
}

function displayParameterMap(parameter) {
  let paramData, date,
      // map = Highcharts.maps["countries/us/us-all"];
      map = Highcharts.maps["countries/us/custom/us-all-territories"];

  paramData = dataDictionary[parameter];
  date = Object.keys(paramData)[0];


  parameterDatasets[parameter].dates.sort(function (date1, date2) {
    if (date1 > date2) {
      return 1;
    }
    if (date1 < date2) {
      return INVERSE;
    } else {
      return 0;
    }
  });

  $("#dateSlider").slider("setAttribute", "max", (parameterDatasets[parameter].dates.length - 1 - 1));
  $("#dateSlider").on("slide", function(slideEvt) {
    $("#dateSliderValue").text(displayDate(parameterDatasets[parameter].dates[slideEvt.value]));
  });

  chart = Highcharts.mapChart("mapid", {
    title: {
      text: "Parameter Map"
    },
    subtitle: {
      text: parameterDatasets[parameter].name + " - " + date
    },
    tooltip: {
      pointFormatter: function() {
        return "Sitecode: " + this.sitecode + "<br>" +
               "Lat: " + this.lat + "<br>" +
               "Lon: " + this.lon + "<br>" +
               "Value: " + this.z / PRINTME;
      },
      shared: true
    },
    mapNavigation: {
        enabled: true,
        buttonOptions: {
            verticalAlign: "bottom"
        }
    },
    series: [
      {
        name: "Basemap",
        mapData: map,
        borderColor: "#606060",
        nullColor: "rgba(200, 200, 200, 0.2)",
        showInLegend: false
      }, {
        // Alaska, Hawaii seperator line
        name: "Separators",
        type: "mapline",
        data: Highcharts.geojson(map, "mapline"),
        color: "#101010",
        enableMouseTracking: false,
        showInLegend: false
      }, {
        type: "mapbubble",
        dataLabels: {
          enabled: true,
          format: "{point.value}"
      },
      name: parameter,
      data: paramData[date],
      minSize: Math.max(0, parameterDatasets[parameter].minValue),
      maxSize: "12%",
      color: "#3E5E6D"
      }
    ]
  });

  $("#dateSlider").slider().on("slide", function(ev) {
    let dateSelected;

    dateSelected = displayDate(parameterDatasets[parameter].dates[this.value]);

    chart.series[2].setData(dataDictionary[loadParam1][dateSelected]);
    chart.setTitle(null, {text: parameterDatasets[loadParam1].name + " - " + dateSelected});
  });
}

function parseCSV(data) {
  let rawData, headers, lineData, chartData, paramName, siteCode, date, value, lat, long,
      minValue, maxValue;

  rawData = data.split("\n");
  headers = rawData[0].split(",");

  // for each row of data
  for (let i = 1; i < rawData.length; i += 1) {
    lineData = rawData[i].split(",");

    siteCode = lineData[0];
    date = lineData[1];
    lat = parseFloat(lineData[2]);
    long = parseFloat(lineData[3]);

    // for each parameter
    for (let j = 4; j < headers.length; j += 1) {
      if (parseFloat(lineData[j]) === MISSINGVALUE) {
        break;
      }

      chartData = {};
      paramName = headers[j].split(":")[0];
      chartData["z"] = lineData[j] * PRINTME;
      chartData["lat"] = lat;
      chartData["lon"] = long;
      chartData["sitecode"] = siteCode;

      // add date to slider array
      if (!parameterDatasets[paramName].hasOwnProperty("dates")) {
        parameterDatasets[paramName].dates = [];
      }

      parameterDatasets[paramName].dates.push(new Date(date + "Z"));

      // test for min value
      if (!parameterDatasets[paramName].hasOwnProperty("minValue")) {
        parameterDatasets[paramName].minValue = chartData["z"];
      } else if (chartData["z"] < parameterDatasets[paramName].minValue) {
        parameterDatasets[paramName].minValue = chartData["z"];
      }

      // test for max value
      if (!parameterDatasets[paramName].hasOwnProperty("maxValue")) {
        parameterDatasets[paramName].maxValue = chartData["z"];
      } else if (chartData["z"] > parameterDatasets[paramName].maxValue) {
        parameterDatasets[paramName].maxValue = chartData["z"];
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
}

function updateChart(parameter) {
  if (!parameterDatasets[parameter].isLoaded) {
    $.ajax({
      type: "GET",
      url: parameterDatasets[parameter].filename,
      dataType: "text",
      success: function(data) {
        parseCSV(data);
        parameterDatasets[parameter].isLoaded = true;
        displayParameterMap(parameter);
        console.log(">>> [" + parameter + "] is loaded");
      }
    });
  }
}

$(document).ready(function() {

  $("#dateSlider").slider();

  updateChart(loadParam1);

  document.getElementById("mapid").addEventListener("mouseout", function () {
    if (chart && chart.lab) {
      chart.lab.destroy();
      chart.lab = null;
    }
  });
});
