function createChart1(data) {
  // Get the dimensions of the chart container
  var container = document.getElementById("chart1");
  var cp_width = container.clientWidth;
  var cp_height = container.clientHeight;

  // Adjust width and height for chart1 (e.g., 1/3 of container width)
  var chart_width = cp_width; // or set to a fixed value if needed
  var chart_height = cp_height;

  // Create netflix_map SVG
  var netflix_map = d3
    .select("#chart1")
    .append("svg")
    .attr("class", "netflix_map")
    .attr("width", chart_width)
    .attr("height", chart_height);

  // Tooltip div
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#f9f9f9")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "10px")
    .style("pointer-events", "none");

  // Set projection parameters
  var projection = d3.geoMercator().scale(1).translate([0, 0]);
  var path = d3.geoPath().projection(projection);

  // Zoom functionality
  var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
  netflix_map.call(zoom);

  // Set background color for the SVG
  netflix_map
    .append("rect")
    .attr("class", "background")
    .attr("width", chart_width)
    .attr("height", chart_height)
    .style("fill", "#a7cdf2");

  var g = netflix_map.append("g");

  d3.json("../utils/world_map.json").then(function (map) {
    var bounds = path.bounds(map);
    var s =
      0.95 /
      Math.max(
        (bounds[1][0] - bounds[0][0]) / chart_width,
        (bounds[1][1] - bounds[0][1]) / chart_height
      );
    var t = [
      (chart_width - s * (bounds[1][0] + bounds[0][0])) / 2,
      (chart_height - s * (bounds[1][1] + bounds[0][1])) / 2,
    ];
    projection.scale(s).translate(t);

    g.selectAll("path")
      .data(map.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("fill", "white")  // Set initial fill color to white
      .attr("fill-opacity", 0.7)
      .on("click", clicked);

    data.forEach(function (d) {
      if (d.country === "United States") d.country = "USA";
    });

    var map_data = countBy(data, "country");
    updateTooltip(map_data);
    updateMapIntensity(map_data);
  });

  function clicked(event, d) {
    // Existing click handler code
  }

  function zoomed(event) {
    g.attr("transform", event.transform);
  }

  function updateTooltip(map_data) {
    g.selectAll("path")
      .on("mouseover", function (event, d) {
        var country = d.properties.name;
        var countryData = map_data[country] || { Movies: 0, TVShows: 0 };

        if (countryData.Movies > 0 || countryData.TVShows > 0) {
          d3.select(this).style("fill-opacity", 1);
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip
            .html(
              `<span style="font-size:14px;font-weight:bold">Country: ${country}<br></span>
              <span style="font-size:14px;">Number of Movies: ${countryData.Movies || 0}<br></span>
              <span style="font-size:14px;">Number of TV Shows: ${countryData.TVShows || 0}<br></span>
              <span style="font-size:14px;">Total Content: ${((countryData.Movies || 0) + (countryData.TVShows || 0)) || 0}</span>`
            )
            .style("visibility", "visible")
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      })
      .on("mouseout", function () {
        d3.select(this).style("fill-opacity", 0.7);
        tooltip.transition().duration(200).style("opacity", 0);
      });
  }

  function updateMapIntensity(map_data) {
    // Get the data for Movies and TV Shows
    var movies = Object.values(map_data).map(d => d.Movies || 0);
    var tvShows = Object.values(map_data).map(d => d.TVShows || 0);
    var allData = movies.concat(tvShows);
    
    var min = getPercentile(allData, 1);
    var q1 = getPercentile(allData, 25);
    var mean = getPercentile(allData, 50);
    var q3 = getPercentile(allData, 75);
    var max = getPercentile(allData, 99);

    var color_domain = [min, q1, mean, q3, max];
    var cp_color = d3
      .scaleThreshold()
      .range(d3.schemeOrRd[6])
      .domain(color_domain);

    g.selectAll("path")
      .transition()
      .duration(500)
      .attr("fill", function (d) {
        var countryData = map_data[d.properties.name] || { Movies: 0, TVShows: 0 };
        var totalContent = (countryData.Movies || 0) + (countryData.TVShows || 0);
        return cp_color(totalContent);
      });
  }

  function countBy(array, key) {
    return array.reduce((result, currentValue) => {
      let country = currentValue[key];
      if (!result[country]) {
        result[country] = { Movies: 0, TVShows: 0 };
      }
      if (currentValue.type === "Movie") {
        result[country].Movies += 1;
      } else if (currentValue.type === "TV Show") {
        result[country].TVShows += 1;
      }
      return result;
    }, {});
  }

  function getPercentile(data, percentile) {
    data.sort(numSort);
    var index = (percentile / 100) * data.length;
    var result;
    if (Math.floor(index) === index) {
      result = (data[index - 1] + data[index]) / 2;
    } else {
      result = data[Math.floor(index)];
    }
    if (result === 0) {
      result = 1;
    }
    return result;
  }

  function numSort(a, b) {
    return a - b;
  }
}
