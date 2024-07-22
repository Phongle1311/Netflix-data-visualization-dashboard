document.addEventListener('DOMContentLoaded', function () {
  fetch('./data/insights.json')
    .then(response => response.json())
    .then(insights => {
      document.querySelectorAll('.insight-icon').forEach(icon => {
        icon.addEventListener('mouseover', () => {
          const tooltip = icon.nextElementSibling;
          tooltip.style.display = 'block';
          tooltip.style.opacity = '1';
          tooltip.style.transform = 'translateY(0)';
        });

        icon.addEventListener('mouseleave', () => {
          const tooltip = icon.nextElementSibling;
          setTimeout(() => {
            if (!tooltip.matches(':hover')) {
              tooltip.style.display = 'none';
              tooltip.style.opacity = '0';
              tooltip.style.transform = 'translateY(-10px)';
            }
          }, 300);
        });
      });

      document.querySelectorAll('.insight-tooltip').forEach(tooltip => {
        tooltip.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          tooltip.style.opacity = '0';
          tooltip.style.transform = 'translateY(-10px)';
        });

        const chartId = tooltip.id.split('-')[1];
        const insightList = insights[chartId] || [];
        const ul = tooltip.querySelector('ul');
        insightList.forEach(insight => {
          const li = document.createElement('li');
          li.textContent = insight;
          ul.appendChild(li);
        });
      });
    })
    .catch(error => console.error('Error loading insights:', error));
});
