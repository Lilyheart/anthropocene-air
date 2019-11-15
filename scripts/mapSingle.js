var mapSingle = (function () {
  let chart, playDirection, maptype,
      timeoutSpeed = 750;
  const TWODIGITDATE = 10;

  function incrementDisplayDate(step) {
    let newIndex, dateSelected;

    newIndex = $("#dateSlider").slider("getValue") + step;
    newIndex = Math.max(0, newIndex);
    newIndex = Math.min(newIndex, (parameterDatasets[loadParam1].dates.length - 1));
    dateSelected = displayDate(parameterDatasets[loadParam1].dates[newIndex]);

    $("#dateSlider").slider("setValue", newIndex);
    try {
      chart.series[2].setData(dataDictionary[loadParam1][dateSelected]);
      chart.setTitle(null, {text: dateSelected});
    } catch (error) {
      return;
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

  function displayParameterMap() {
    let mapSeries, legendText,
        displayData = dataDictionary[loadParam1][Object.keys(dataDictionary[loadParam1])[0]].slice(),
        map = Highcharts.maps["countries/us/custom/us-all-territories"];

    (function (HMap) {
      // Handle values for colorAxis
      HMap.seriesTypes.mappoint.prototype.axisTypes = ["xAxis", "yAxis", "colorAxis"];

      HMap.wrap(HMap.seriesTypes.mappoint.prototype, "translate", function (proto) {
          proto.call(this);
          HMap.seriesTypes.mappoint.prototype.translateColors.call(this);
      });
      HMap.seriesTypes.mappoint.prototype.translateColors = HMap.seriesTypes.heatmap.prototype.translateColors;
      HMap.seriesTypes.mappoint.prototype.colorKey = "value";

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
        minSize: Math.max(0, parameterDatasets[loadParam1].percentileBottom),
        maxSize: "12%",
        color: "#3E5E6D",
        dataLabels: {enabled: false}
      };
    }

    if (parameterDatasets[loadParam1].scale === 1) {
      legendText = parameterDatasets[loadParam1].unit;
    } else {
      legendText = parameterDatasets[loadParam1].unit + " &times; 10<sup>" + parameterDatasets[loadParam1].scale.toExponential().split("e")[1] +
      "</sup>";
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
        // min: parameterDatasets[loadParam1].minValue,
        // max: parameterDatasets[loadParam1].maxValue,
        min: parameterDatasets[loadParam1].percentileBottom * COLORaxisSCALE * parameterDatasets[loadParam1].scale,
        max: parameterDatasets[loadParam1].percentileTop * COLORaxisSCALE * parameterDatasets[loadParam1].scale,
        labels: {
          formatter: function() {
            if (this.isLast) {
              return this.value / COLORaxisSCALE + "+";
            } else {return this.value / COLORaxisSCALE;}
          }
        },
        allowNegativeLog: true
      },
      legend: {
        useHTML: true,
        title: {
          style: {"text-align": "center"},
          text: legendText
        },
        symbolWidth: 500
      },
      series: [
        {
          name: "Basemap",
          mapData: map,
          borderColor: "#BBBBBB",
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

  function updateChart(parameter) {
    runAnimation("none");
    loadParam1 = parameter;

    if (!parameterDatasets[loadParam1].isLoaded) {
      chart = Highcharts.mapChart("mapid", {title: {text: "Loading Map"}});

      $.ajax({
        url: "data/" + loadParam1 + ".txt",
        dataType: "json",
        success: function(data) {
          $("#dateSlider").slider("destroy");
          $("#dateSlider").slider();
          $("#dateSlider").slider("setValue", 0);
          parameterDatasets[loadParam1].isLoaded = true;
          parsedData(data, parameter);
          displayParameterMap();
        }
      });
    } else {
      displayParameterMap();
    }
  }

  function setMaptype(newType) {
    if (newType === "mappoint") {
      maptype = "mappoint";
      document.getElementById("point").classList.add("btn-primary");
      document.getElementById("point").classList.remove("btn-secondary");
      document.getElementById("bubble").classList.remove("btn-primary");
      document.getElementById("bubble").classList.add("btn-secondary");
      if (Object.keys(dataDictionary).length !== 0) {
        updateChart(loadParam1);
      }
    } else if (newType === "mapbubble") {
      maptype = "mapbubble";
      document.getElementById("point").classList.remove("btn-primary");
      document.getElementById("point").classList.add("btn-secondary");
      document.getElementById("bubble").classList.add("btn-primary");
      document.getElementById("bubble").classList.remove("btn-secondary");
      if (Object.keys(dataDictionary).length !== 0) {
        updateChart(loadParam1);
      }
    }
  }

  return {
    updateChart: function(parameter) {
      updateChart(parameter);
    },
    runAnimation: function(direction) {
      runAnimation(direction);
    },
    incrementDisplayDate: function(step) {
      incrementDisplayDate(step);
    },
    setMaptype: function (newType) {
      setMaptype(newType);
    },
    setTimeout: function (newTimeout) {
      timeoutSpeed = newTimeout;
    }
  };

})();
