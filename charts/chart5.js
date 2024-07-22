function createChart5(data) {
    const container = document.getElementById('chart5');
  
    // Define margins and dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 50 }; // Increase top margin for title
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
  
    // Create SVG
    const svg = d3.select("#chart5").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Define scales and axes
    const x = d3.scaleBand().padding(0.1);
    const y = d3.scaleLinear();
  
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
  
    // Create tooltip
    const tooltip = d3.select("#tooltip");
  
    // Create buttons
    const buttonContainer = d3.select("#chart5").append("div").attr("id", "chart5-buttons");
    buttonContainer
        .append("button")
        .attr("id", "movie-btn")
        .attr("class", "selected-button")
        .text("Movies");
  
    buttonContainer
        .append("button")
        .attr("id", "tv-show-btn")
        .attr("class", "unselected-button")
        .text("TV Shows");
  
    // Add chart title (fixed title, not changing with button clicks)
    svg.append("text")
        .attr("x", width / 2 - 35) // Adjust x to shift title to the left
        .attr("y", -margin.top / 2+8) // Position title above the chart
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("Durations Distribution")
        .style("font-size", "16px")
        .style("font-weight", "bold");
  
    function updateChart(type) {
        const filteredData = data.filter(d => d.type === type);
  
        let durationCount;
        if (type === "Movie") {
            durationCount = d3.rollup(
                filteredData,
                v => v.length,
                d => {
                    const minutes = parseInt(d.duration.split(" ")[0]);
                    const bin = Math.floor(minutes / 10) * 10;
                    return `${bin}-${bin + 9}`;
                }
            );
        } else {
            durationCount = d3.rollup(
                filteredData,
                v => v.length,
                d => d.duration.split(" ")[0]
            );
        }
  
        const sortedData = Array.from(durationCount, ([duration, count]) => ({
            duration,
            count
        })).sort((a, b) => {
            const [aStart] = a.duration.split("-").map(Number);
            const [bStart] = b.duration.split("-").map(Number);
            return aStart - bStart;
        });
  
        x.domain(sortedData.map(d => d.duration)).range([0, width]);
        y.domain([0, d3.max(sortedData, d => d.count)]).nice().range([height, 0]);
  
        svg.selectAll(".x.axis").remove();
        svg.selectAll(".y.axis").remove();
  
        // Customize x-axis ticks for Movies
        const xAxisCustom = d3.axisBottom(x).ticks(Math.min(sortedData.length, 10)); // Adjust number of ticks
        // Select only some tick values to display
        const displayedTicks = x
        .domain()
        .filter((_, i) => i % Math.ceil(x.domain().length / 10) === 0);
        xAxisCustom.tickValues(displayedTicks);
  
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxisCustom)
            .append("text")
            .attr("fill", "#B20710")
            .attr("x", width / 2)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .text(type === "Movie" ? "Minutes" : "Number of Seasons");
  
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("fill", "#B20710")
            .attr("x", -height / 2)
            .attr("y", -45)
            .attr("dy", "0.71em")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Count");
  
        const bars = svg.selectAll(".bar").data(sortedData, d => d.duration);
  
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.duration))
            .attr("y", y(0))
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", "#B20710") // Set color for bars
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`Duration: ${d.duration} ${type === "Movie" ? "min" : ""}<br>Count: ${d.count}`)
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count));
  
        bars.transition()
            .duration(1000)
            .attr("x", d => x(d.duration))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.count));
  
        bars.exit().transition()
            .duration(1000)
            .attr("y", y(0))
            .attr("height", 0)
            .remove();
    }
  
    // Set initial chart to Movie
    updateChart("Movie");
  
    // Setup button event listeners
    document.getElementById("tv-show-btn").addEventListener("click", () => {
        updateChart("TV Show");
        document.getElementById("tv-show-btn").classList.add("selected-button");
        document.getElementById("tv-show-btn").classList.remove("unselected-button");
        document.getElementById("movie-btn").classList.add("unselected-button");
        document.getElementById("movie-btn").classList.remove("selected-button");
    });
  
    document.getElementById("movie-btn").addEventListener("click", () => {
        updateChart("Movie");
        document.getElementById("movie-btn").classList.add("selected-button");
        document.getElementById("movie-btn").classList.remove("unselected-button");
        document.getElementById("tv-show-btn").classList.add("unselected-button");
        document.getElementById("tv-show-btn").classList.remove("selected-button");
    });
}
