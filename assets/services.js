document.addEventListener('DOMContentLoaded', function() {
	const urlParams = new URLSearchParams(window.location.search);
	const appId = urlParams.get('app_id');
	const utmSrc = urlParams.get('utm_src');

	if (appId && utmSrc) {
		fetch('/assets/services.json')
			.then(response => response.json())
			.then(services => {
				const matchedService = Object.values(services).find(service =>
					service.app_id === appId && service.utm_src === utmSrc
				);

				if (matchedService) {
					const notification = document.getElementById('notificationUtm');

					notification.innerHTML = `<i class="fas fa-question-circle"></i>
                                          <a>Experiencing interruptions with ${matchedService.app_name}?</a>
                                          <br>
                                          <a class="linkout nodecoration" href="/issues/${matchedService.app_site_link}" target="_blank" style="color: var(--txt);">Find out about known issues and the current status</a>`;

					notification.classList.add('show');

					setTimeout(() => {
						notification.classList.remove('show');
					}, 10000);
				}
			})
			.catch(error => console.error('Error loading services:', error));
	}
});