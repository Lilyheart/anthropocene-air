/*eslint id-length: ["error", { "exceptions": ["i", "j", "x", "y", "z"] }]*/
var parameterDatasets, maptype, chart, loadParam1, loadParam2, playDirection,
    dataDictionary = {},
    timeoutSpeed = 750,
    dropSiteCodes = ["EGBE1", "BYISX", "BYIS1", "BALA1"];
const MISSINGVALUE = -999,
      TWODIGITDATE = 10,
      INVERSE = -1,
      COLORaxisSCALE = 100;

// Functions
function displayDate(UTCdate) {
  return new Date(UTCdate).toLocaleString("zu", {month: "2-digit", day: "2-digit", year: "numeric", timeZone: "UTC"});
}

function incrementDisplayDate(step) {
  let newIndex, dateSelected;

  newIndex = $("#dateSlider").slider("getValue") + step;
  newIndex = Math.max(0, newIndex);
  newIndex = Math.min(newIndex, (parameterDatasets[loadParam1].dates.length - 1));
  dateSelected = displayDate(parameterDatasets[loadParam1].dates[newIndex]);

  $("#dateSlider").slider("setValue", newIndex);
  try {
    chart.series[2].setData(dataDictionary[loadParam1][dateSelected]);
    // chart.setTitle(null, {text: parameterDatasets[loadParam1].name + " - " + dateSelected});
    chart.setTitle(null, {text: dateSelected});
  } catch (error) {
    return;
  }
}

function displayParameterMap() {
  let mapSeries,
      displayData = dataDictionary[loadParam1][Object.keys(dataDictionary[loadParam1])[0]].slice(),
      map = Highcharts.maps["countries/us/custom/us-all-territories"];

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
      name: loadParam1,
      data: displayData,
      dataLabels: {enabled: false},
      allAreas: false,
      colorAxis: 0,
      marker: {
        lineColor: "#111111",
        lineWidth: "0.5"
      }
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
      text: "Parameter Map - " + parameterDatasets[loadParam1].name
    },
    subtitle: {
      text: Object.keys(dataDictionary[loadParam1])[0]
    },
    credits: {
      text: "Highcharts.com, " +
            "<a href'http://vista.cira.colostate.edu/Improve/data-acknowledgment/'>IMPROVE</a>, " +
            "<a href'https://github.com/Lilyheart'>© Lily Romano</a>",
      mapTextFull: "Map: Copyright (c) 2015 Highsoft AS, Based on data from Natural Earth -- " +
                   "Design: Copyright (c) 2019 Lily Romano -- " +
                   "Data: Based on data from IMPROVE"
    },
    chart: {
      height: 500
    },
    exporting: {
      scale: 3,
      filename: "parameter-map-" + parameterDatasets[loadParam1].name
    },
    tooltip: {
      headerFormat: "",
      pointFormatter: function() {
        return "<strong>" + parameterDatasets[loadParam1].name
                          + " (" + this.id + ")</strong><br>" +
               SITES[this.id].name + "<br>" +
               "Value: " + this.actual;
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
      min: parameterDatasets[loadParam1].minValue,
      max: parameterDatasets[loadParam1].maxValue,
      labels: {
        formatter: function() {
          if (this.isLast) {
            return this.value / COLORaxisSCALE + "+";
          } else {return this.value / COLORaxisSCALE;}
        }
      },
      allowNegativeLog: true
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
    chart.setTitle(null, {text: dateSelected});
  });

  incrementDisplayDate(0);
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
    if (dropSiteCodes.includes(siteCode)) {continue;}

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
      chartData["value"] = chartData["z"] = (displayValue * COLORaxisSCALE);
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

function runAnimation(direction) {
  let step,
      i = $("#dateSlider").slider("getValue"),
      max = 0;

  if (dataDictionary.hasOwnProperty(loadParam1)) {
    max = parameterDatasets[loadParam1].dates.length;
  }

  function repeat (oneTimeout) {
    setTimeout(function () {
      if (playDirection === "forward") {
        step = 1;
      } else if (playDirection === "reverse") {
        step = INVERSE;
      } else {step = 0;}

      incrementDisplayDate(step);
      i += step;

      if (0 < i && i < max && playDirection !== "none") {
        repeat(timeoutSpeed);
      } else {
        playDirection = "none";
        document.getElementById("datePlayStop").classList.add("disabled");
        document.getElementById("datePlayR").classList.remove("active");
        document.getElementById("datePlayF").classList.remove("active");
      }
    }, oneTimeout);
  }

  // Run if stopped
  if (playDirection === "none" && direction !== playDirection) {
    playDirection = direction;
    repeat(timeoutSpeed);
  } else {
    playDirection = direction;
  }

  // toggle buttons
  if (playDirection !== "none") {
    document.getElementById("datePlayStop").classList.remove("disabled");
  } else {
    document.getElementById("datePlayStop").classList.add("disabled");
  }
  if (playDirection === "forward") {
    document.getElementById("datePlayF").classList.add("active");
  } else {
    document.getElementById("datePlayF").classList.remove("active");
  }
  if (playDirection === "reverse") {
    document.getElementById("datePlayR").classList.add("active");
  } else {
    document.getElementById("datePlayR").classList.remove("active");
  }
}

function updateChart(parameter) {
  runAnimation("none");
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

$(document).ready(function() {
  let speedMax,
      defaultParam = Object.keys(parameterDatasets)[0];

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
  issues.getIssues();

  document.getElementById("mapid").addEventListener("mouseout", function () {
    if (chart && chart.lab) {
      chart.lab.destroy();
      chart.lab = null;
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

  speedMax = $("#speedSlider").slider()[0].attributes["data-slider-ticks"].value;
  speedMax = speedMax.slice(1, speedMax.length + INVERSE);
  speedMax = parseFloat(speedMax.split(",")[1]) + parseFloat(speedMax.split(",")[0]);

  $("#speedSlider").slider().on("slideStop", function(ev) {
    timeoutSpeed = speedMax - this.value;
  });
});

async function testUpdateChart(repeats) {
  let t0, t1, results,
      param = "ALf";

  results = [];
  for (let i = 0; i < repeats; i += 1) {
    // reset code
    t0 = t1 = 0;
    delete parameterDatasets[param]["isLoaded"];
    delete parameterDatasets[param]["dates"];
    delete parameterDatasets[param]["maxValue"];
    delete parameterDatasets[param]["minValue"];


    if (!parameterDatasets[param].isLoaded) {
      chart = Highcharts.mapChart("mapid", {title: {text: "Loading Map"}});
      await $.ajax({
        type: "GET",
        url: parameterDatasets[param].filename,
        dataType: "text",
        success: function(data) {
          t0 = performance.now();
          $("#dateSlider").slider("destroy");
          $("#dateSlider").slider();
          $("#dateSlider").slider("setValue", 0);
          parameterDatasets[param].isLoaded = true;
          parseCSV(data);
          displayParameterMap();
          t1 = performance.now();

          results.push(t1 - t0);
          console.log(t1 - t0);
        }
      });
    }
  }

  console.log("Average: " + (results.reduce((acc, i) => acc + i, 0) / results.length));
  console.log("Min: " + (Math.round(Math.min(...results) * TWODIGITDATE)) / TWODIGITDATE);
  console.log("Max: " + (Math.round(Math.max(...results) * TWODIGITDATE)) / TWODIGITDATE);

  console.log(results);
}
