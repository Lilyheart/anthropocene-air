/*eslint id-length: ["error", { "exceptions": ["i", "j", "x", "y", "z"] }]*/
var parameterDatasets, chart, loadParam1, loadParam2, isPlaying,
    dataDictionary = {};
const XSHIFT = 5,
      YSHIFT = -200,
      DECIMALS = 2,
      MISSINGVALUE = -999,
      TWODIGITDATE = 10,
      INVERSE = -1,
      MINORTICKS = 5,
      TIMEOUTSPEED = 750;

// Create array to store dataset information
parameterDatasets = {
ALf: {
  name: "Aluminum Fine",
  filename: "data/ALf.csv",
  colorAxisType: "logarithmic"
},
NO3f: {
  name: "Nitrate (Fine)",
  filename: "data/NO3f.csv",
  colorAxisType: "logarithmic"
},
NH4f: {
  name: "Ammonium Ion (Fine)",
  filename: "data/NH4f.csv",
  colorAxisType: "logarithmic"
}};

// Set default
loadParam1 = Object.keys(parameterDatasets)[0];
loadParam1 = "NO3f";

// Functions
function displayDate(UTCdate) {
  return new Date(UTCdate).toLocaleString("zu", {month: "2-digit", day: "2-digit", year: "numeric", timeZone: "UTC"});
}

function incrementDisplayDate(step) {
  let newIndex, dateSelected;

  newIndex = $("#dateSlider").slider("getValue") + step;
  dateSelected = displayDate(parameterDatasets[loadParam1].dates[newIndex]);

  $("#dateSlider").slider("setValue", newIndex);
  $("#dateSliderValue").text(displayDate(parameterDatasets[loadParam1].dates[newIndex]));
  try {
    chart.series[2].setData(dataDictionary[loadParam1][dateSelected]);
    chart.setTitle(null, {text: parameterDatasets[loadParam1].name + " - " + dateSelected});
  } catch (error) {
    //
  }
}

function displayParameterMap() {
  let date,
      map = Highcharts.maps["countries/us/custom/us-all-territories"],
      maxValue = (parameterDatasets[loadParam1].maxValue * 0.5);

  date = Object.keys(dataDictionary[loadParam1])[0];

  parameterDatasets[loadParam1].dates.sort(function (date1, date2) {
    if (date1 > date2) {
      return 1;
    }
    if (date1 < date2) {
      return INVERSE;
    } else {
      return 0;
    }
  });

  $("#dateSlider").slider("setAttribute", "max", (parameterDatasets[loadParam1].dates.length - 1 - 1));
  $("#dateSlider").on("slide", function(slideEvt) {
    $("#dateSliderValue").text(displayDate(parameterDatasets[loadParam1].dates[slideEvt.value]));
  });
  incrementDisplayDate(0);

  (function (HM) {
    // Handle values for colorAxis
    HM.seriesTypes.mappoint.prototype.axisTypes = ["xAxis", "yAxis", "colorAxis"];

    HM.wrap(HM.seriesTypes.mappoint.prototype, "translate", function (proto) {
        proto.call(this);
        HM.seriesTypes.mappoint.prototype.translateColors.call(this);
    });
    HM.seriesTypes.mappoint.prototype.translateColors = HM.seriesTypes.heatmap.prototype.translateColors;
    HM.seriesTypes.mappoint.prototype.colorKey = "value";

    // Handle negative values in logarithmic
    HM.addEvent(HM.ColorAxis, "init", function (ev) {
        this.allowNegativeLog = ev.userOptions.allowNegativeLog;
    });
    // Override conversions
    HM.wrap(HM.ColorAxis.prototype, "log2lin", function (proceed, num) {
      var isNegative, adjustedNum, result;

      if (!this.allowNegativeLog) {
          return proceed.call(this, num);
      }

      isNegative = num < 0;
      adjustedNum = Math.abs(num);
      if (adjustedNum < TWODIGITDATE) {
        adjustedNum += (TWODIGITDATE - adjustedNum) / TWODIGITDATE;
      }
      result = Math.log(adjustedNum) / Math.LN10;

      if (isNegative) {
        result *= INVERSE;
      }

      return result;
    });

    HM.wrap(HM.ColorAxis.prototype, "lin2log", function (proceed, num) {
      var isNegative, absNum, result;

      if (!this.allowNegativeLog) {
          return proceed.call(this, num);
      }

      isNegative = num < 0;
      absNum = Math.abs(num);
      result = Math.pow(TWODIGITDATE, absNum);
      if (result < TWODIGITDATE) {
        result = (TWODIGITDATE * (result - 1)) / (TWODIGITDATE - 1);
      }

      if (isNegative) {
        result *= INVERSE;
      }

      return result;
    });
  }(Highcharts));

  chart = Highcharts.mapChart("mapid", {
    title: {
      text: "Parameter Map"
    },
    subtitle: {
      text: parameterDatasets[loadParam1].name + " - " + date
    },
    tooltip: {
      headerFormat: "",
      pointFormatter: function() {
        return "<strong>" + parameterDatasets[loadParam1].name + "</strong><br>" +
               "Value: " + this.value + "<br>----------------<br>" +
               "Sitecode: " + this.sitecode + "<br>" +
               "Lat: " + this.lat + "<br>" +
               "Lon: " + this.lon + "<br>";
      }
    },
    mapNavigation: {
        enabled: true,
        buttonOptions: {
            verticalAlign: "bottom"
        }
    },
    colorAxis: {
      minColor: "#0000ff",
      maxColor: "#ff0000",
      min: 0,
      max: maxValue,
      type: parameterDatasets[loadParam1].colorAxisType,
      allowNegativeLog: true,
      minorTicks: true
    },
    series: [
      {
        name: "Basemap",
        mapData: map,
        borderColor: "#606060",
        nullColor: "rgba(200, 200, 200, 0.2)",
        showInLegend: false
      },
      {
        // Alaska, Hawaii seperator line
        name: "Separators",
        type: "mapline",
        data: Highcharts.geojson(map, "mapline"),
        color: "#101010",
        enableMouseTracking: false,
        showInLegend: false
      },
      {
        type: "mappoint",
        animation: false,
        name: loadParam1,
        data: dataDictionary[loadParam1][date],
        dataLabels: {
          enabled: false
        }
      }
    ]
  });

  $("#dateSlider").slider().on("slideStop", function(ev) {
    let dateSelected;

    dateSelected = displayDate(parameterDatasets[loadParam1].dates[this.value]);

    $("#dateSliderValue").text(displayDate(parameterDatasets[loadParam1].dates[this.value]));
    chart.series[2].setData(dataDictionary[loadParam1][dateSelected]);
    chart.setTitle(null, {text: parameterDatasets[loadParam1].name + " - " + dateSelected});
  });
}

function parseCSV(data) {
  let rawData, headers, lineData, chartData, paramName, siteCode, date, value, lat, long,
      dateValue, minValue, maxValue;

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
      chartData["sitecode"] = siteCode;
      chartData["id"] = siteCode;
      chartData["lat"] = lat;
      chartData["value"] = lineData[j];
      chartData["lon"] = long;

      dateValue = new Date(date + "Z").valueOf();

      // add date to slider array
      if (!parameterDatasets[paramName].hasOwnProperty("dates")) {
        parameterDatasets[paramName].dates = [];
      }
      if (parameterDatasets[paramName].dates.indexOf(dateValue) === INVERSE) {
        parameterDatasets[paramName].dates.push(dateValue);
      }

      // test for min value
      if (!parameterDatasets[paramName].hasOwnProperty("minValue")) {
        parameterDatasets[paramName].minValue = chartData["value"];
      } else if (chartData["value"] < parameterDatasets[paramName].minValue) {
        parameterDatasets[paramName].minValue = chartData["value"];
      }

      // test for max value
      if (!parameterDatasets[paramName].hasOwnProperty("maxValue")) {
        parameterDatasets[paramName].maxValue = chartData["value"];
      } else if (chartData["value"] > parameterDatasets[paramName].maxValue) {
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
        displayParameterMap();
        console.log(">>> [" + parameter + "] is loaded");
      }
    });
  }
}

function runAnimation() {
  for (let i = 0; i === parameterDatasets[loadParam1].dates.length; i += 1) {
    incrementDisplayDate(1);
  }

  let i = 0,
      max = parameterDatasets[loadParam1].dates.length;

  function repeat () {
    setTimeout(function () {
      if (isPlaying) {incrementDisplayDate(1);}
      i += 1;
      if (i < max && isPlaying) {repeat();} else {isPlaying = false;}
    }, TIMEOUTSPEED);
  }

  repeat();

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

  document.getElementById("playDateAnimation").addEventListener("click", function(event) {
    if (!isPlaying) {
      isPlaying = true;
      runAnimation();
    } else {
      isPlaying = false;
    }
  });


});
