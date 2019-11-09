/*eslint id-length: ["error", { "exceptions": ["i", "j", "x", "y", "z"] }]*/
var parameterDatasets, maptype, chart, loadParam1, loadParam2, isPlaying,
    dataDictionary = {},
    timeoutSpeed = 750;
const XSHIFT = 5,
      YSHIFT = -200,
      DECIMALS = 2,
      MISSINGVALUE = -999,
      TWODIGITDATE = 10,
      INVERSE = -1,
      MINORTICKS = 5;

// Create array to store dataset information
parameterDatasets = {
  NO3f: {
    name: "Nitrate (Fine)",
    filename: "data/NO3f.csv",
    colorAxisType: "logarithmic"
  },
  NH4f: {
    name: "Ammonium Ion (Fine)",
    filename: "data/NH4f.csv",
    colorAxisType: "logarithmic"
  },
  ALf: {
    name: "Aluminum Fine",
    filename: "data/ALf.csv",
    colorAxisType: "logarithmic"
  }
};

// Functions
function displayDate(UTCdate) {
  return new Date(UTCdate).toLocaleString("zu", {month: "2-digit", day: "2-digit", year: "numeric", timeZone: "UTC"});
}

function incrementDisplayDate(step) {
  let newIndex, dateSelected;

  newIndex = $("#dateSlider").slider("getValue") + step;
  dateSelected = displayDate(parameterDatasets[loadParam1].dates[newIndex]);

  $("#dateSlider").slider("setValue", newIndex);
  try {
    chart.series[2].setData(dataDictionary[loadParam1][dateSelected]);
    chart.setTitle(null, {text: parameterDatasets[loadParam1].name + " - " + dateSelected});
  } catch (error) {
    return;
  }
}

function displayParameterMap() {
  let date, mapSeries, _tooltip,
      displayData = dataDictionary[loadParam1][Object.keys(dataDictionary[loadParam1])[0]].slice(),
      map = Highcharts.maps["countries/us/custom/us-all-territories"],
      maxValue = (parameterDatasets[loadParam1].maxValue * 0.5);

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
    HM.addEvent(HM.ColorAxis, "init", function (ev) {this.allowNegativeLog = ev.userOptions.allowNegativeLog;});
    // Override conversions
    HM.wrap(HM.ColorAxis.prototype, "log2lin", function (proceed, num) {
      var isNegative, adjustedNum, result;

      if (!this.allowNegativeLog) {return proceed.call(this, num);}

      isNegative = num < 0;
      adjustedNum = Math.abs(num);
      if (adjustedNum < TWODIGITDATE) {adjustedNum += (TWODIGITDATE - adjustedNum) / TWODIGITDATE;}
      result = Math.log(adjustedNum) / Math.LN10;

      if (isNegative) {result *= INVERSE;}

      return result;
    });

    HM.wrap(HM.ColorAxis.prototype, "lin2log", function (proceed, num) {
      var isNegative, absNum, result;

      if (!this.allowNegativeLog) {return proceed.call(this, num);}

      isNegative = num < 0;
      absNum = Math.abs(num);
      result = Math.pow(TWODIGITDATE, absNum);
      if (result < TWODIGITDATE) {result = (TWODIGITDATE * (result - 1)) / (TWODIGITDATE - 1);}

      if (isNegative) {result *= INVERSE;}

      return result;
    });
  }(Highcharts));

  if (maptype === "mappoint") {
    mapSeries = {
      type: "mappoint",
      animation: false,
      name: loadParam1,
      data: displayData,
      dataLabels: {enabled: false}
    };
  } else if (maptype === "mapbubble") {
    mapSeries = {
      type: "mapbubble",
      name: loadParam1,
      data: displayData,
      minSize: Math.max(0, parameterDatasets[loadParam1].minValue),
      maxSize: "12%",
      color: "#3E5E6D",
      dataLabels: {enabled: false}
    };
  }

  chart = Highcharts.mapChart("mapid", {
    title: {
      text: "Parameter Map"
    },
    subtitle: {
      text: parameterDatasets[loadParam1].name + " - " + Object.keys(dataDictionary[loadParam1])[0]
    },
    tooltip: {
      headerFormat: "",
      pointFormatter: function() {
        return "<strong>" + parameterDatasets[loadParam1].name + "</strong><br>" +
               "Value: " + this.value + "<br>----------------<br>" +
               "Sitecode: " + this.id + "<br>" +
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
      stops: [
        /* eslint-disable */
        [0.00, "#00007F"],
        [0.05, "#0000ff"],
        [0.10, "#007FFF"],
        [0.15, "#0dd6d6"],
        [0.32, "#7FFF7F"],
        [0.49, "#ffff00"],
        [0.66, "#FF7F00"],
        [0.83, "#ff0000"],
        [1.00, "#7F0000"]
        /* eslint-enable */
      ],
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
      }, {
        // Alaska, Hawaii seperator line
        name: "Separators",
        type: "mapline",
        data: Highcharts.geojson(map, "mapline"),
        color: "#101010",
        enableMouseTracking: false,
        showInLegend: false
      },
        mapSeries
    ]
  });

  $("#dateSlider").slider("destroy");
  $("#dateSlider").slider({
    formatter: function (value) {return displayDate(parameterDatasets[loadParam1].dates[value]);}
  });
  $("#dateSlider").slider("setAttribute", "max", (parameterDatasets[loadParam1].dates.length - 1 - 1));

  $("#dateSlider").slider().on("slideStop", function(ev) {
    let dateSelected = displayDate(parameterDatasets[loadParam1].dates[this.value]);

    chart.series[2].setData(dataDictionary[loadParam1][dateSelected]);
    chart.setTitle(null, {text: parameterDatasets[loadParam1].name + " - " + dateSelected});
  });

  incrementDisplayDate(0);
}

function parseCSV(data) {
  let rawData, headers, lineData, chartData, paramName, siteCode,
      date, value, lat, long, dateValue, minValue, maxValue,
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
    date = lineData[1];
    dateValue = new Date(date + "Z").valueOf();
    lat = parseFloat(lineData[2]);
    long = parseFloat(lineData[3]);

    // for each parameter
    for (let j = 4; j < headers.length; j += 1) {
      if (parseFloat(lineData[j]) === MISSINGVALUE) {break;}

      value = Math.max(0, parseFloat(lineData[j]));

      chartData = {};

      chartData["id"] = siteCode;
      chartData["value"] = chartData["z"] = value;
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
      if (value < parameterDatasets[paramName].minValue || !parameterDatasets[paramName].minValue) {
        parameterDatasets[paramName].minValue = value;
      }
      if (value > parameterDatasets[paramName].maxValue || !parameterDatasets[paramName].maxValue) {
        parameterDatasets[paramName].maxValue = value;
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

function updateChart(parameter) {
  isPlaying = false;
  loadParam1 = parameter;

  if (!parameterDatasets[parameter].isLoaded) {
    chart = Highcharts.mapChart("mapid", {title: {text: "Loading Map"}});
    $.ajax({
      type: "GET",
      url: parameterDatasets[parameter].filename,
      dataType: "text",
      success: function(data) {
        $("#dateSlider").slider("destroy");
        $("#dateSlider").slider();
        $("#dateSlider").slider("setValue", 0);
        parameterDatasets[parameter].isLoaded = true;
        parseCSV(data);
        displayParameterMap();
      }
    });
  } else {
    displayParameterMap();
  }
}

function runAnimation() {
  let i = $("#dateSlider").slider("getValue"),
      max = parameterDatasets[loadParam1].dates.length;

  function repeat (oneTimeout) {
    setTimeout(function () {
      if (isPlaying) {incrementDisplayDate(1);}
      i += 1;
      if (i < max && isPlaying) {repeat(timeoutSpeed);} else {isPlaying = false;}
    }, oneTimeout);
  }

  repeat(timeoutSpeed);
}

$(document).ready(function() {
  let defaultParam = Object.keys(parameterDatasets)[0];

  maptype = "mappoint";

  $("#dateSlider").slider();
  $("#speedSlider").slider({tooltip: "never"});

  $("#parameter-dropdown").selectize({});
  for (let key in parameterDatasets) {
    if (parameterDatasets.hasOwnProperty(key)) {
      $("#parameter-dropdown")[0].selectize.addOption({value: key, text: parameterDatasets[key].name});
    }
  }
  $("#parameter-dropdown").selectize()[0].selectize.setValue(defaultParam, true);

  updateChart(defaultParam);

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

  document.getElementById("point").addEventListener("click", function(event) {
    maptype = "mappoint";
    document.getElementById("point").classList.add("btn-primary");
    document.getElementById("point").classList.remove("btn-secondary");
    document.getElementById("bubble").classList.remove("btn-primary");
    document.getElementById("bubble").classList.add("btn-secondary");
    updateChart(loadParam1);
  });

  document.getElementById("bubble").addEventListener("click", function(event) {
    maptype = "mapbubble";
    document.getElementById("point").classList.remove("btn-primary");
    document.getElementById("point").classList.add("btn-secondary");
    document.getElementById("bubble").classList.add("btn-primary");
    document.getElementById("bubble").classList.remove("btn-secondary");
    updateChart(loadParam1);
  });

  $("#speedSlider").slider().on("slideStop", function(ev) {
    timeoutSpeed = this.value;
  });
});
