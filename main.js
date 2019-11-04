/*eslint id-length: ["error", { "exceptions": ["i", "j", "x", "y", "z"] }]*/
var parameterDatasets, dataCSV, dataDictionary, chart, loadParam1, loadParam2,
    map = Highcharts.maps["countries/us/us-all"];
const XSHIFT = 5,
      YSHIFT = -200,
      DECIMALS = 2;

// Create array to store dataset information
parameterDatasets = {
ALf: {
  name: "Aluminum Fine",
  filename: "data/ALf.csv",
  isLoaded: false
},
NH4f: {
  name: "Ammonium Ion (Fine)",
  filename: "data/NH4f.csv",
  isLoaded: false
}};

// Set default
loadParam1 = Object.keys(parameterDatasets)[0];

// Functions
function displayParameterMap() {
  let paramName, paramData, date;

  paramName = "ALf";
  paramData = dataDictionary[paramName];
  date = Object.keys(paramData)[0];

  chart = Highcharts.mapChart("mapid", {
    title: {
      text: "Parameter Map"
    },
    tooltip: {
      pointFormat: "Lat: {point.lat}<br>" +
      "Lon: {point.lon}<br>" +
      "Value: {point.value}"
    },
    xAxis: {
      crosshair: {
        zIndex: 5,
        dashStyle: "dot",
        snap: false,
        color: "gray"
      }
    },
    yAxis: {
      crosshair: {
        zIndex: 5,
        dashStyle: "dot",
        snap: false,
        color: "gray"
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
      name: paramName,
      data: paramData[date],
      minSize: 10,
      maxSize: "12%",
      color: Highcharts.getOptions().colors[0]
      }
    ]
  });

  $("#slider").bind("input", function() {
    // chart.series[0].setData(data[+this.value].data);
  });
}

function displayCrosshairs() {
  document.getElementById("mapid").addEventListener("mousemove", function (event) {
    var position, eventPointer;

    if (chart) {
      if (!chart.lab) {
        chart.lab = chart.renderer.text("", 0, 0)
          .attr({zIndex: 5})
          .css({color: "#505050"})
          .add();
      }

      eventPointer = chart.pointer.normalize(event);
      position = chart.fromPointToLatLon({
        x: chart.xAxis[0].toValue(eventPointer.chartX),
        y: chart.yAxis[0].toValue(eventPointer.chartY)
      });

      chart.lab.attr({
        x: eventPointer.chartX + XSHIFT,
        y: eventPointer.chartY + YSHIFT,
        text: "Lat: " + position.lat.toFixed(DECIMALS) + "<br>Lon: " + position.lon.toFixed(DECIMALS)
      });
    }
  });
}

function parseCSV(data) {
  let headers, chartData, lineData, paramName, date, value, lat, long;

  dataCSV = data.split("\n");
  dataDictionary = {};
  headers = dataCSV[0].split(",");

  // for each row of data
  for (let i = 1; i < dataCSV.length; i += 1) {
    lineData = dataCSV[i].split(",");

    date = lineData[0];
    lat = lineData[1];
    long = lineData[2];

    // for each parameter
    for (let j = 3; j < headers.length; j += 1) {
      chartData = {};
      paramName = headers[j].split(":")[0];
      value = lineData[j]; //TODO print damn you!
      chartData["z"] = value;
      chartData["lat"] = parseFloat(lat);
      chartData["lon"] = parseFloat(long);

      // if the parameter doesn't exist
      if (!dataDictionary.hasOwnProperty(paramName)) {
        dataDictionary[paramName] = {};
      }

      // if the date doesn't exist
      if (!dataDictionary[paramName].hasOwnProperty(date)) {
        dataDictionary[paramName][date] = [chartData];
      } else {
        dataDictionary[paramName][date].push(chartData);
      }
    }
  }
}

function getCSVdata(parameter) {
  if (!parameterDatasets[parameter].isLoaded) {
    $.ajax({
      type: "GET",
      url: parameterDatasets[parameter].filename,
      dataType: "text",
      success: function(data) {
        parseCSV(data);
        parameterDatasets[parameter].isLoaded = true;
        console.log("x");
      }
    });
  }
}

$(document).ready(function() {

  getCSVdata(loadParam1);
  // displayParameterMap();
  // displayCrosshairs();

  document.getElementById("mapid").addEventListener("mouseout", function () {
    if (chart && chart.lab) {
      chart.lab.destroy();
      chart.lab = null;
    }
  });
});
