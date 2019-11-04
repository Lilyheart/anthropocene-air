/*eslint id-length: ["error", { "exceptions": ["i", "x", "y", "z"] }]*/
$(document).ready(function() {

  var HChart = Highcharts,
    map = HChart.maps["countries/us/us-all"],
    chart;

  // Add series with state capital bubbles
  Highcharts.getJSON("https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/us-capitals.json", function (json) {
    var data = [];

    json.forEach(function (popl) {
      popl.z = popl.population;
      data.push(popl);
    });

    chart = Highcharts.mapChart("mapid", {
      title: {
        text: "Highmaps lat/lon demo"
      },

      tooltip: {
        pointFormat: "{point.capital}, {point.parentState}<br>" +
          "Lat: {point.lat}<br>" +
          "Lon: {point.lon}<br>" +
          "Population: {point.population}"
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

      series: [{
        name: "Basemap",
        mapData: map,
        borderColor: "#606060",
        nullColor: "rgba(200, 200, 200, 0.2)",
        showInLegend: false
      }, {
        name: "Separators",
        type: "mapline",
        data: HChart.geojson(map, "mapline"),
        color: "#101010",
        enableMouseTracking: false,
        showInLegend: false
      }, {
        type: "mapbubble",
        dataLabels: {
          enabled: true,
          format: "{point.capital}"
        },
        name: "Cities",
        data: data,
        maxSize: "12%",
        color: HChart.getOptions().colors[0]
      }]
    });
  });

  // Display custom label with lat/lon next to crosshairs
  document.getElementById("mapid").addEventListener("mousemove", function (event) {
    var position, eventPointer;

    if (chart) {
      if (!chart.lab) {
        chart.lab = chart.renderer.text("", 0, 0)
          .attr({
            zIndex: 5
          })
          .css({
            color: "#505050"
          })
          .add();
      }

      eventPointer = chart.pointer.normalize(event);
      position = chart.fromPointToLatLon({
        x: chart.xAxis[0].toValue(eventPointer.chartX),
        y: chart.yAxis[0].toValue(eventPointer.chartY)
      });

      chart.lab.attr({
        x: eventPointer.chartX + 5,
        y: eventPointer.chartY - 22,
        text: "Lat: " + position.lat.toFixed(2) + "<br>Lon: " + position.lon.toFixed(2)
      });
    }
  });

  document.getElementById("mapid").addEventListener("mouseout", function () {
    if (chart && chart.lab) {
      chart.lab.destroy();
      chart.lab = null;
    }
  });


});
