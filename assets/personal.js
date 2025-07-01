const AUTO_CHECK_INTERVAL = 60000;

const personalServices = [{
		id: 'website',
		name: 'Website',
		url: 'https://itsmarian.is-a.dev/',
		description: 'Personal portfolio website',
		icon: 'fas fa-home'
	},
	{
		id: 'blog',
		name: 'Blog',
		url: 'https://blog.itsmarian.is-a.dev/',
		description: 'Personal blog with articles',
		icon: 'fas fa-blog'
	},
	{
		id: 'pictures',
		name: 'Pictures',
		url: 'https://pics.itsmarian.is-a.dev/',
		description: 'Image gallery and assets',
		icon: 'fas fa-image'
	},
	{
		id: 'projects',
		name: 'Projects',
		url: 'https://projects.itsmarian.is-a.dev/',
		description: 'Project showcase portfolio',
		icon: 'fas fa-code'
	}
];

const personalCheckBtn = document.getElementById('check-btn');
const personalAutoToggleBtn = document.getElementById('auto-toggle');
const operationalCount = document.getElementById('operational-count');
const issuesCount = document.getElementById('issues-count');
const lastCheckedEl = document.getElementById('last-checked');
const personalServicesGrid = document.getElementById('personal-services-grid');
const notification = document.getElementById('notification');

let personalAutoCheckInterval = null;
let personalAutoCheckEnabled = false;
let lastChecked = null;

function initializePersonalUI() {
	personalServices.forEach(service => {
		const card = createServiceCard(service);
		personalServicesGrid.appendChild(card);

		service.element = card;
		service.statusElement = card.querySelector('.service-status');
		service.lastUpdated = null;
		service.responseTime = null;
	});
}

function createServiceCard(service) {
	const card = document.createElement('div');
	card.className = 'service-card';
	card.id = `${service.id}-service`;
	card.innerHTML = `
                <div class="service-header">
                    <div class="service-name">
                        <i class="${service.icon}"></i>
                        ${service.name}
                    </div>
                    <div class="service-status status-checking">Checking...</div>
                </div>
                <p>${service.description}</p>
                <div class="service-meta">
                    <div class="last-updated">
                        <i class="fas fa-clock"></i> <span>-</span>
                    </div>
                    <div class="response-time">
                        <i class="fas fa-stopwatch"></i> <span>-</span>
                    </div>
                </div>
            `;
	return card;
}

function showNotification(message, isError = false) {
	notification.innerHTML = isError ?
		`<i class="fas fa-exclamation-circle"></i> ${message}` :
		`<i class="fas fa-check-circle"></i> ${message}`;

	notification.className = isError ?
		'notification error show' :
		'notification show';

	setTimeout(() => {
		notification.classList.remove('show');
	}, 3000);
}

function updateLastChecked() {
	lastChecked = new Date();
	const timeString = lastChecked.toLocaleTimeString();
	lastCheckedEl.textContent = `Last checked: ${timeString}`;
}

async function checkService(service) {
	try {
		service.statusElement.textContent = 'Checking...';
		service.statusElement.className = 'service-status status-checking';

		const startTime = Date.now();

		const uniqueUrl = `${service.url}?t=${Date.now()}`;

		const response = await fetch(uniqueUrl, {
			method: 'HEAD',
			cache: 'no-cache',
			redirect: 'error',
			headers: {
				'User-Agent': 'MarianServiceStatus/1.0'
			}
		});

		const endTime = Date.now();
		const responseTime = endTime - startTime;
		service.responseTime = responseTime;

		if (response.status >= 200 && response.status < 400) {
			service.statusElement.textContent = 'Operational';
			service.statusElement.className = 'service-status status-operational';
		} else if (response.status === 503) {
			service.statusElement.textContent = 'Maintenance';
			service.statusElement.className = 'service-status status-maintenance';
		} else {
			service.statusElement.textContent = 'Issues';
			service.statusElement.className = 'service-status status-issue';
		}

		service.lastUpdated = new Date();
		updateServiceDisplay(service);
	} catch (error) {
		service.statusElement.textContent = 'Unavailable';
		service.statusElement.className = 'service-status status-down';
		service.responseTime = null;
		service.lastUpdated = new Date();
		updateServiceDisplay(service);
	}
}

function updateServiceDisplay(service) {
	const lastUpdated = service.element.querySelector('.last-updated span');
	const responseTime = service.element.querySelector('.response-time span');

	if (service.lastUpdated) {
		const minutesAgo = Math.floor((new Date() - service.lastUpdated) / 60000);
		lastUpdated.textContent = `${minutesAgo} min ago`;
	} else {
		lastUpdated.textContent = '-';
	}

	responseTime.textContent = service.responseTime ? `${service.responseTime} ms` : '-';
}

function updateSummary() {
	const operationalServices = personalServices.filter(
		service => service.statusElement.classList.contains('status-operational')
	).length;

	const issueServices = personalServices.filter(
		service => service.statusElement.classList.contains('status-issue') ||
		service.statusElement.classList.contains('status-down') ||
		service.statusElement.classList.contains('status-maintenance')
	).length;

	operationalCount.textContent = operationalServices;
	issuesCount.textContent = issueServices;
}

async function checkAllServices() {
	personalCheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
	personalCheckBtn.disabled = true;

	try {
		for (const service of personalServices) {
			await checkService(service);
			await new Promise(resolve => setTimeout(resolve, 300));
		}

		showNotification('Status updated successfully');
	} catch (error) {
		console.error('Error during check:', error);
		showNotification('Error during check', true);
	} finally {
		personalCheckBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Check Status';
		personalCheckBtn.disabled = false;
	}

	updateLastChecked();
	updateSummary();
}

function toggleAutoCheck() {
	personalAutoCheckEnabled = !personalAutoCheckEnabled;

	if (personalAutoCheckEnabled) {
		personalAutoToggleBtn.innerHTML = '<i class="fas fa-power-off"></i> Auto Check: ON';
		personalAutoCheckInterval = setInterval(checkAllServices, AUTO_CHECK_INTERVAL);
		checkAllServices();
	} else {
		personalAutoToggleBtn.innerHTML = '<i class="fas fa-power-off"></i> Auto Check: OFF';
		clearInterval(personalAutoCheckInterval);
	}
}

personalCheckBtn.addEventListener('click', checkAllServices);
personalAutoToggleBtn.addEventListener('click', toggleAutoCheck);

document.addEventListener('DOMContentLoaded', () => {
	initializePersonalUI();
	toggleAutoCheck();
});