function createChart6(data) {
  const container = document.getElementById('chart6');
  
  // Define dimensions and margins
  const margin = { top: 40, right: 20, bottom: 60, left: 60 }; // Increased top margin for title
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select(container).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Define scales
  const xScale = d3.scaleBand().padding(0.05);
  const yScale = d3.scaleBand().padding(0.05);
  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateBlues) // Use Blues color scale
    .domain([0, 1]);

  // Define axes
  const xAxis = d3.axisBottom(xScale).tickSize(0);
  const yAxis = d3.axisLeft(yScale).tickSize(0);

  // Prepare data
  const countries = Array.from(new Set(data.map(d => d.country)));
  const ageGroups = Array.from(new Set(data.map(d => d.age_group)));
  
  // Set scales domains
  xScale.domain(countries).range([0, width]);
  yScale.domain(ageGroups).range([height, 0]);
  
  // Add rectangles for the heatmap
  svg.selectAll(".tile")
    .data(data)
    .enter().append("rect")
    .attr("class", "tile")
    .attr("x", d => xScale(d.country))
    .attr("y", d => yScale(d.age_group))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .style("fill", d => colorScale(d.percentage))
    .append("title")
    .text(d => `Country: ${d.country}\nAge Group: ${d.age_group}\nPercentage: ${d.percentage.toFixed(2)}`);

  // Add text labels to the heatmap
  svg.selectAll(".tile-label")
    .data(data)
    .enter().append("text")
    .attr("class", "tile-label")
    .attr("x", d => xScale(d.country) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d.age_group) + yScale.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("fill", (d) =>
      d3.hsl(colorScale(d.percentage)).l > 0.5 ? "black" : "white"
    )
    .style("font-size", "9px") // Font size
    .text(d => (d.percentage * 100).toFixed(2) + '%'); // Display as percentage

  // Add x-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle") // Align text horizontally
    .attr("dx", "0.5em") // Adjust label position
    .attr("dy", "0.7em"); // Adjust label position

  // Add y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // Add title
  svg.append("text")
    .attr("x", width / 2-15)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Target Age Groups of Countries"); // Your title text
}
