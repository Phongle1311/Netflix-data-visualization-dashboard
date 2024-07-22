function createChart3(data) {
    const container = document.getElementById('chart3');
  
    // Parse data to get the count of each country
    const countryCount = {};
    data.forEach(d => {
        const countries = d.country.split(",").map(c => c.trim());
        countries.forEach(c => {
            if (c) {
                countryCount[c] = (countryCount[c] || 0) + 1;
            }
        });
    });
  
    // Convert to array and sort
    const sortedCountries = Object.entries(countryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
  
    // Set up SVG dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 90 }; // Adjust top margin for title
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom; // Use container height
  
    // Create SVG container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Set up scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(sortedCountries, d => d[1])])
        .range([0, width]);
  
    const y = d3.scaleBand()
        .domain(sortedCountries.map(d => d[0]))
        .range([0, height])
        .padding(0.1);
  
    // Add bars
    svg.selectAll(".bar")
        .data(sortedCountries)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d[0]))
        .attr("width", d => x(d[1]))
        .attr("height", y.bandwidth())
        .attr("fill", "#B20710") // Initial color
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#ff7500"); // Change color on hover
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`Country: ${d[0]}<br>Count: ${d[1]}`)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mousemove", function(event) {
            d3.select("#tooltip")
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "#B20710"); // Revert color on mouse out
            d3.select("#tooltip").style("opacity", 0);
        });
  
    // Add x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Count");
  
    // Add y-axis
    const yAxis = svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .text("Country");

    yAxis.selectAll(".tick text").style("font-size", "12px");
  
    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("Top 10 Countries with Most TV Shows on Netflix")
        .style("font-size", "16px")
        .style("font-weight", "bold");
}
