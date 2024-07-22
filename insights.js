document.addEventListener("DOMContentLoaded", function() {
  const insightsFile = 'data/insights.json';
  
  fetch(insightsFile)
    .then(response => response.json())
    .then(insights => {
      Object.keys(insights).forEach(chartId => {
        const ul = document.querySelector(`#${chartId} .insight-tooltip ul`);
        if (ul) {
          insights[chartId].forEach(insight => {
            const li = document.createElement('li');
            li.textContent = insight;
            ul.appendChild(li);
          });
        }
      });
    })
    .catch(error => console.error('Error loading insights:', error));
});
