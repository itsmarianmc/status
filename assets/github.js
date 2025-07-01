const githubServices = [{
		id: 'git-ops',
		name: 'Git Operations',
		icon: 'fas fa-code-branch'
	},
	{
		id: 'webhooks',
		name: 'Webhooks',
		icon: 'fas fa-plug'
	},
	{
		id: 'api',
		name: 'API Requests',
		icon: 'fas fa-cloud'
	},
	{
		id: 'issues',
		name: 'Issues',
		icon: 'fas fa-exclamation-circle'
	},
	{
		id: 'pr',
		name: 'Pull Requests',
		icon: 'fas fa-code-merge'
	},
	{
		id: 'actions',
		name: 'Actions',
		icon: 'fas fa-bolt'
	},
	{
		id: 'packages',
		name: 'Packages',
		icon: 'fas fa-box'
	},
	{
		id: 'pages',
		name: 'Pages',
		icon: 'fas fa-file-code'
	},
	{
		id: 'codespaces',
		name: 'Codespaces',
		icon: 'fas fa-laptop-code'
	},
	{
		id: 'copilot',
		name: 'Copilot',
		icon: 'fas fa-robot'
	}
];

const githubServicesGrid = document.getElementById('github-services-grid');
const githubStatusText = document.getElementById('github-status-text');
const githubStatusContainer = document.querySelector('.github-status');
const githubStatusIndicator = document.querySelector('.github-status .status-indicator');
const tabs = document.querySelectorAll('.tab');
const dashboardSections = document.querySelectorAll('.dashboard-section');

let githubComponents = [];

function initializeGitHubUI() {
	githubServices.forEach(service => {
		const card = createGitHubServiceCard(service);
		githubServicesGrid.appendChild(card);

		githubComponents.push({
			...service,
			element: card,
			statusElement: card.querySelector('.service-status')
		});
	});
}

function createGitHubServiceCard(service) {
	const card = document.createElement('div');
	card.className = 'service-card';
	card.id = `github-${service.id}-service`;
	card.innerHTML = `
                <div class="service-header">
                    <div class="service-name">
                        <i class="${service.icon}"></i>
                        ${service.name}
                    </div>
                    <div class="service-status status-checking">Checking...</div>
                </div>
                <p>GitHub ${service.name} Service</p>
                <div class="service-meta">
                    <div class="last-updated">
                        <i class="fas fa-clock"></i> <span>-</span>
                    </div>
                </div>
            `;
	return card;
}

async function checkGitHubStatus() {
	try {
		const response = await fetch('https://www.githubstatus.com/api/v2/summary.json');
		const data = await response.json();

		updateGitHubGlobalStatus(data.status);

		updateGitHubServicesStatus(data.components);

		return true;
	} catch (error) {
		console.error('Error fetching GitHub status:', error);
		updateGitHubGlobalStatus(null);
		updateGitHubServicesStatus([]);
		return false;
	}
}

function updateGitHubGlobalStatus(status) {
	if (!status) {
		githubStatusText.textContent = 'GitHub: Status unknown';
		githubStatusContainer.className = 'github-status status-checking';
		githubStatusIndicator.className = 'status-indicator';
		return;
	}

	githubStatusText.textContent = `GitHub: ${status.description}`;

	if (status.indicator === 'none') {
		githubStatusContainer.className = 'github-status status-operational';
	} else if (status.indicator === 'minor') {
		githubStatusContainer.className = 'github-status status-issue';
	} else {
		githubStatusContainer.className = 'github-status status-down';
	}
}

function updateGitHubServicesStatus(components) {
	githubComponents.forEach(service => {
		const component = components.find(c => c.name === service.name);

		if (!component) {
			service.statusElement.textContent = 'Unknown';
			service.statusElement.className = 'service-status status-checking';
			return;
		}

		switch (component.status) {
			case 'operational':
				service.statusElement.textContent = 'Operational';
				service.statusElement.className = 'service-status status-operational';
				break;
			case 'degraded_performance':
				service.statusElement.textContent = 'Degraded';
				service.statusElement.className = 'service-status status-issue';
				break;
			case 'partial_outage':
				service.statusElement.textContent = 'Partial Outage';
				service.statusElement.className = 'service-status status-issue';
				break;
			case 'major_outage':
				service.statusElement.textContent = 'Major Outage';
				service.statusElement.className = 'service-status status-down';
				break;
			case 'under_maintenance':
				service.statusElement.textContent = 'Maintenance';
				service.statusElement.className = 'service-status status-maintenance';
				break;
			default:
				service.statusElement.textContent = 'Unknown';
				service.statusElement.className = 'service-status status-checking';
		}

		const lastUpdated = service.element.querySelector('.last-updated span');
		lastUpdated.textContent = 'Just now';
	});
}

document.addEventListener('DOMContentLoaded', () => {
	initializeGitHubUI();
	checkGitHubStatus();
});