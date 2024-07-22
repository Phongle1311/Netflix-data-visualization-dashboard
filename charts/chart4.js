function createChart4(data) {
    const container = document.getElementById('chart4');
  
    // Constants for chart
    const margin = { top: 60, right: 20, bottom: 30, left: 100 };  // Increased top margin for title
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
  
    // SVG container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Data processing
    const countryData = {};
    data.forEach((item) => {
        if (!countryData[item.country]) {
            countryData[item.country] = { movieCount: 0, tvShowCount: 0 };
        }
        if (item.type === "Movie") {
            countryData[item.country].movieCount++;
        } else if (item.type === "TV Show") {
            countryData[item.country].tvShowCount++;
        }
    });
  
    const countryArray = Object.keys(countryData).map((country) => {
        const counts = countryData[country];
        return {
            country,
            movieCount: counts.movieCount,
            tvShowCount: counts.tvShowCount,
            moviePercentage: (counts.movieCount / (counts.movieCount + counts.tvShowCount)) * 100,
            tvShowPercentage: (counts.tvShowCount / (counts.movieCount + counts.tvShowCount)) * 100,
        };
    });
  
    const topCountries = countryArray
        .filter(country => country.country !== "")
        .sort((a, b) => b.movieCount + b.tvShowCount - (a.movieCount + a.tvShowCount))
        .slice(0, 10);
  
    // Scales
    const x = d3.scaleLinear().range([0, width]).domain([0, 100]);
    const y = d3.scaleBand().rangeRound([0, height]).padding(0.1).domain(topCountries.map(d => d.country));
  
    // Axes
    const xAxis = d3.axisBottom(x).tickFormat(d => d + "%");
    const yAxis = d3.axisLeft(y);
  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
  
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
  
    // Create and style tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("visibility", "hidden")
        .style("pointer-events", "none");

    // Bars
    const bars = svg.selectAll(".bar")
        .data(topCountries)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", d => `translate(0,${y(d.country)})`);
  
    bars.append("rect")
        .attr("width", d => x(d.moviePercentage))
        .attr("height", y.bandwidth())
        .style("fill", "#B20710")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(`Movies: ${d.movieCount}<br>${d.moviePercentage.toFixed(1)}%`);
            d3.select(this).style("opacity", 0.7);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).style("opacity", 1);
        });
  
    bars.append("rect")
        .attr("width", d => x(d.tvShowPercentage))
        .attr("height", y.bandwidth())
        .attr("x", d => x(d.moviePercentage))
        .style("fill", "#ff7500")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(`TV Shows: ${d.tvShowCount}<br>${d.tvShowPercentage.toFixed(1)}%`);
            d3.select(this).style("opacity", 0.7);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).style("opacity", 1);
        });
  
    // Data labels with smaller font size
    bars.append("text")
        .attr("x", d => x(d.moviePercentage) - 5)
        .attr("y", y.bandwidth() / 2 + 5)
        .attr("text-anchor", "end")
        .style("fill", "white")
        .style("font-size", "10px") // Smaller font size
        .text(d => `${d.moviePercentage.toFixed(1)}%`);
  
    bars.append("text")
        .attr("x", d => x(d.moviePercentage) + x(d.tvShowPercentage) - 5)
        .attr("y", y.bandwidth() / 2 + 5)
        .attr("text-anchor", "end")
        .style("fill", "white")
        .style("font-size", "10px") // Smaller font size
        .text(d => `${d.tvShowPercentage.toFixed(1)}%`);
  
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "#000")
        .text("Split Ratio for Top 10 Countries");
}
