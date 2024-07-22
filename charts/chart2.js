function createChart2(data) {
  const container = document.getElementById('chart2');

  const margin = 30;  // Define the margin
  const width = container.clientWidth - 2 * margin;  // Adjust width for margin
  const height = container.clientHeight - 2 * margin; // Adjust height for margin
  const radius = Math.min(width, height) / 2;

  // Xóa nội dung cũ nếu có
  d3.select(container).select("svg").remove();

  // Create SVG container
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width + 2 * margin)  // Add margin to width
    .attr("height", height + 2 * margin) // Add margin to height
    .append("g")
    .attr("transform", `translate(${width / 2 + margin},${height / 2 + margin})`);

  // Define color scale
  const color = d3.scaleOrdinal()
    .domain(["TV Show", "Movie"])
    .range(["#ff7500", "#B20710"]); // Colors for TV Shows and Movies

  // Define pie chart layout
  const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

  // Define arc for donut chart
  const arc = d3.arc()
    .innerRadius(radius - 40) // Radius of the donut hole
    .outerRadius(radius);

  const arcLabel = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 40);

  // Count the number of each type
  const dataCount = d3.group(data, d => d.type);
  const pieData = pie(
    Array.from(dataCount, ([key, value]) => ({ type: key, count: value.length }))
  );

  // Add title
  svg.append("text")
    .attr("x", 0)
    .attr("y", -height / 2 - 10) // Position the title above the chart
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "#000")
    .text("Distribution of TV Shows and Movies");

  // Add paths for each slice of the pie
  svg.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.type))
    .attr("stroke", "#fff")
    .attr("stroke-width", "1px")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("stroke", "#000").attr("stroke-width", "2px");

      // Show the tooltip
      const total = pieData.reduce((sum, d) => sum + d.data.count, 0);
      const percent = Math.round((d.data.count / total) * 100);
      d3.select(".tooltip")
        .style("visibility", "visible")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`)
        .html(`<strong>Type:</strong> ${d.data.type}<br><strong>Count:</strong> ${d.data.count}<br><strong>Percentage:</strong> ${percent}%`);
    })
    .on("mousemove", function(event) {
      // Update the position of the tooltip
      d3.select(".tooltip")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function() {
      d3.select(this).attr("stroke", "#fff").attr("stroke-width", "1px");

      // Hide the tooltip
      d3.select(".tooltip").style("visibility", "hidden");
    });

  // Draw the center circle
  svg.append("circle")
    .attr("r", radius - 40)
    .attr("fill", "#fff");

  // Draw the initial text in the center
  const totalText = `Total: ${pieData.reduce((sum, d) => sum + d.data.count, 0)}`;
  svg.append("text")
    .attr("class", "info")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("fill", "#000")
    .text(totalText);

  // Add labels for each slice
  svg.selectAll("text.label")
    .data(pieData)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#fff")
    .text(d => `${Math.round(d.data.count / pieData.reduce((sum, d) => sum + d.data.count, 0) * 100)}%`);

  // Add legend inside the donut, centered and below the text
  const legend = svg.append("g")
    .attr("transform", `translate(0, 20)`); // Center horizontally, adjust vertical position

  legend.selectAll("rect")
    .data(pieData)
    .enter()
    .append("rect")
    .attr("x", -40) // Adjust to center horizontally
    .attr("y", (d, i) => i * 20)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => color(d.data.type));

  legend.selectAll("text")
    .data(pieData)
    .enter()
    .append("text")
    .attr("x", -20) // Adjust to center horizontally
    .attr("y", (d, i) => i * 20 + 12)
    .attr("font-size", "12px")
    .attr("fill", "#000")
    .text(d => `${d.data.type}`);

  // Add tooltip div if it doesn't already exist
  if (!d3.select(".tooltip").empty()) {
    d3.select(".tooltip").remove();
  }

  d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("visibility", "hidden")
    .style("pointer-events", "none");
}
