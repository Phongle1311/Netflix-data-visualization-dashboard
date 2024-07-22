function createMap(data) {
  var transformation;
  var iszoomed = false;
  var active = d3.select(null);
  var cp_width = 600,
    cp_height = 400;
  var zoom = d3.zoom().scaleExtent([1, 100]).on("zoom", zoomed);

  // Create netflix_map SVG
  var netflix_map = d3
    .select("#map")
    .append("svg")
    .attr("class", "netflix_map")
    .attr("width", cp_width)
    .attr("height", cp_height);

  // Create legend SVG
  var netflix_map_legend = d3
    .select("#netflix_map_legend")
    .append("svg")
    .attr("class", "netflix_map_legend")
    .attr("width", 150)
    .attr("height", cp_height);

  // Set projection parameters
  var projection = d3.geoMercator().scale(1).translate([0, 0]);

  // Create geopath
  var path = d3.geoPath().projection(projection);

  // Tooltip div
  var tooltip = d3
    .select("#jason")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  netflix_map
    .append("rect")
    .attr("class", "background")
    .attr("width", cp_width)
    .attr("height", cp_height);

  var g = netflix_map.append("g");

  netflix_map.call(zoom);

  data.forEach(function (d) {
    if (d.country === "United States") d.country = "USA";
  });

  // Remove loading bar
  d3.select("div#loadingbar")
    .transition()
    .delay(1000)
    .duration(500)
    .style("opacity", 0);
  d3.select("div#slider-range")
    .transition()
    .delay(1000)
    .duration(500)
    .style("opacity", 1);

  // Read Global map
  d3.json("./utils/world_map.json").then(function (map) {
    var bounds = path.bounds(map);
    var s =
      0.95 /
      Math.max(
        (bounds[1][0] - bounds[0][0]) / cp_width,
        (bounds[1][1] - bounds[0][1]) / cp_height
      );
    var t = [
      (cp_width - s * (bounds[1][0] + bounds[0][0])) / 2,
      (cp_height - s * (bounds[1][1] + bounds[0][1])) / 2,
    ];
    projection.scale(s).translate(t);

    g.selectAll("path")
      .data(map.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("fill", "white")
      .attr("fill-opacity", 0.7)
      .on("click", clicked);

    var map_data = countBy(data, "country");
    updateTooltip(map_data);
    updateMapIntensity(map_data);
  });

  function clicked(event, d) {
    if (active.node() === this) {
      iszoomed = false;
      reset();
    } else {
      if (iszoomed) {
        reset();
      }
      iszoomed = true;
      active.classed("active", false);
      active = d3.select(this).classed("active", true);

      g.selectAll("path").transition().duration(1000).attr("opacity", 0.3);

      var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(
          1,
          Math.min(8, 0.9 / Math.max(dx / cp_width, dy / cp_height))
        ),
        translate = [cp_width / 2 - scale * x, cp_height / 2 - scale * y];

      netflix_map
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }
  }

  function reset() {
    active.classed("active", false);
    active = d3.select(null);
    g.selectAll("path").transition().delay(10).attr("opacity", 1);
    netflix_map
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  }

  function zoomed(event) {
    g.attr("transform", event.transform);
  }

  function updateTooltip(map_data) {
    g.selectAll("path")
      .on("mouseover", function (event, d) {
        d3.select(this).style("fill-opacity", 1);
        tooltip.transition().duration(300).style("opacity", 1);
        tooltip
          .html(
            `<span style="font-size:20px;font-weight:bold">Country: ${
              d.properties.name
            }<br></span><span style="font-size:20px;">Number of shows: ${
              map_data[d.properties.name] || 0
            }</span>`
          )
          .style("visibility", "visible")
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).style("fill-opacity", 0.7);
        tooltip
          .style("visibility", "none")
          .transition()
          .duration(300)
          .style("opacity", 0);
      });
  }

  function updateMapIntensity(map_data) {
    var array = Object.values(map_data);
    var min = getPercentile(array, 1);
    var q1 = getPercentile(array, 25);
    var mean = getPercentile(array, 50);
    var q3 = getPercentile(array, 75);
    var max = getPercentile(array, 99);

    var color_domain = [min, q1, mean, q3, max];
    var cp_color = d3
      .scaleThreshold()
      .range(d3.schemeOrRd[6])
      .domain(color_domain);

    g.selectAll("path")
      .transition()
      .duration(500)
      .attr("fill", function (d) {
        if (map_data[d.properties.name]) {
          return cp_color(map_data[d.properties.name]);
        } else {
          return cp_color(0);
        }
      });

    var legend_labels = [];
    var ext_color_domain = [0].concat(color_domain);

    for (var i = 0; i < color_domain.length; i++) {
      if (i == 0) legend_labels.push("< " + color_domain[i]);
      else
        legend_labels.push(
          parseInt(color_domain[i - 1]) + 1 + " - " + color_domain[i]
        );
    }
    legend_labels.push("> " + color_domain[color_domain.length - 1]);

    netflix_map_legend.selectAll("g.legend").exit().remove();

    var legend = netflix_map_legend
      .selectAll("g.legend")
      .data(ext_color_domain)
      .enter()
      .append("g")
      .attr("class", "legend");

    var ls_w = 25,
      ls_h = cp_height / 10;

    legend
      .append("rect")
      .attr("x", 20)
      .attr("y", function (d, i) {
        return ls_h * i + 50;
      })
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("fill", function (d, i) {
        return cp_color(d);
      })
      .style("opacity", 0.7);

    legend
      .append("text")
      .attr("x", 50)
      .attr("y", function (d, i) {
        return ls_h * i + 60 + ls_h / 2;
      })
      .text(function (d, i) {
        return legend_labels[i];
      });

    netflix_map_legend
      .append("g")
      .attr("class", "title")
      .append("text")
      .attr("x", 20)
      .attr("y", 30)
      .text("No. of shows:");
  }

  function countBy(array, key) {
    return array.reduce((result, currentValue) => {
      let count = result[currentValue[key]] || 0;
      result[currentValue[key]] = count + 1;
      return result;
    }, {});
  }

  function getPercentile(data, percentile) {
    data.sort(numSort);
    var index = (percentile / 100) * data.length;
    var result;
    if (Math.floor(index) == index) {
      result = (data[index - 1] + data[index]) / 2;
    } else {
      result = data[Math.floor(index)];
    }
    if (result == 0) {
      result = 1;
    }
    return result;
  }

  function numSort(a, b) {
    return a - b;
  }
}
