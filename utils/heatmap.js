const MR_age = {
  "TV-MA": "Adults",
  R: "Adults",
  "PG-13": "Teens",
  "TV-14": "Young Adults",
  "TV-PG": "Older Kids",
  NR: "Adults",
  "TV-G": "Kids",
  "TV-Y": "Kids",
  "TV-Y7": "Older Kids",
  PG: "Older Kids",
  G: "Kids",
  "NC-17": "Adults",
  "TV-Y7-FV": "Older Kids",
  UR: "Adults",
};

// Add age_group to data
data.forEach((d) => {
  d.age_group = MR_age[d.rating];
});

// Split country field and flatten data
const flattenedData = data.flatMap((d) => {
  return d.country.split(",").map((country) => ({
    ...d,
    country: country.trim(),
  }));
});

// Filter data for top 10 countries
const topCountries = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Japan",
  "France",
  "South Korea",
  "Spain",
  "Mexico",
  "Turkey",
];
const filteredData = flattenedData.filter((d) =>
  topCountries.includes(d.country)
);

// Aggregate data for heatmap
const countryAgeGroupCounts = d3.rollup(
  filteredData,
  (v) => v.length,
  (d) => d.country,
  (d) => d.age_group
);

const countryTotals = d3.rollup(
  filteredData,
  (v) => v.length,
  (d) => d.country
);

const heatmapData = Array.from(
  countryAgeGroupCounts,
  ([country, ageGroupMap]) => ({
    country,
    ...Object.fromEntries(ageGroupMap),
  })
).map((d) => {
  const total = countryTotals.get(d.country);
  for (const ageGroup of Object.keys(MR_age)) {
    d[MR_age[ageGroup]] = ((d[MR_age[ageGroup]] || 0) / total) * 100;
  }
  return d;
});

const ageGroups = ["Kids", "Older Kids", "Teens", "Young Adults", "Adults"];

const margin = { top: 20, right: 20, bottom: 60, left: 100 },
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const svg = d3
  .select("#heatmap-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand().domain(ageGroups).range([0, width]).padding(0.05);

const y = d3.scaleBand().domain(topCountries).range([height, 0]).padding(0.05);

const color = d3.scaleSequential(d3.interpolateBlues).domain([0, 100]);

const tooltip = d3.select("#heatmap #tooltip");

svg
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform", "rotate(-45)")
  .style("text-anchor", "end");

svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));

svg
  .append("text")
  .attr("class", "x-label")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 10)
  .attr("text-anchor", "middle")
  .text("Age Group");

svg
  .append("text")
  .attr("class", "y-label")
  .attr("x", -height / 2)
  .attr("y", -margin.left + 20)
  .attr("dy", "0.71em")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Country");

svg
  .selectAll(".heatmap-rect")
  .data(
    heatmapData.flatMap((d) =>
      ageGroups.map((ageGroup) => ({
        country: d.country,
        ageGroup,
        count: d[ageGroup] || 0,
      }))
    )
  )
  .enter()
  .append("rect")
  .attr("class", "heatmap-rect")
  .attr("x", (d) => x(d.ageGroup))
  .attr("y", (d) => y(d.country))
  .attr("width", x.bandwidth())
  .attr("height", y.bandwidth())
  .attr("fill", (d) => color(d.count))
  .on("mouseover", (event, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .html(
        `Country: ${d.country}<br>Age Group: ${
          d.ageGroup
        }<br>Count: ${d.count.toFixed(2)}%`
      )
      .style("left", event.pageX + 5 + "px")
      .style("top", event.pageY - 28 + "px");
  })
  .on("mousemove", (event) => {
    tooltip
      .style("left", event.pageX + 5 + "px")
      .style("top", event.pageY - 28 + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

// Color Legend
const colorDiv = d3.select("#color");
const legendWidth = 200; // Increased width for horizontal legend
const legendHeight = 20;

const colorLegendSvg = colorDiv
  .append("svg")
  .attr("width", legendWidth + 40)
  .attr("height", legendHeight + 40)
  .append("g")
  .attr("transform", "translate(20, 20)");

const legendScale = d3.scaleLinear().domain([0, 100]).range([0, legendWidth]);

colorLegendSvg
  .selectAll("rect")
  .data(d3.range(0, 100, 1))
  .enter()
  .append("rect")
  .attr("x", (d) => legendScale(d))
  .attr("y", 0)
  .attr("width", (d) => legendScale(d + 1) - legendScale(d))
  .attr("height", legendHeight)
  .attr("fill", (d) => color(d))
  .attr("stroke", "black");

colorLegendSvg
  .append("text")
  .attr("x", legendWidth / 2)
  .attr("y", legendHeight + 15)
  .attr("text-anchor", "middle")
  .text("Percentage");
