const labels = Array.from(document.getElementsByClassName('regTypeLiLabel'))
	.map(element => element.textContent.trim())
	.filter(label => label !== 'Equipment Only');

const generalLabels = labels.filter(label => label.toLowerCase().includes('general'));

if (labels.length > generalLabels.length) {
	document.querySelectorAll('.registrationInfo li').forEach(item => {
		const label = item.querySelector('.regTypeLiLabel').textContent.trim();

		if (generalLabels.includes(label)) {
			item.style.display = 'none';
		}
	})
}