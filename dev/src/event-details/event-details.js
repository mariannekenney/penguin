const labels = Array.from(document.getElementsByClassName('regTypeLiLabel'))
	.map(element => element.textContent.trim())
	.filter(label => label !== 'Equipment Only');

const groups = {};

labels.forEach(label => {
	const split = label.split(" ");
	const key = `${split[0]} ${split[1]}`;

	if (groups[key]) {
		const newSplit = Number(label.split('$')[1]?.split('.')[0]);
		const existingSplit = Number(groups[key].split('$')[1]?.split('.')[0]);

		if (newSplit < existingSplit) {
			groups[key] = label;
		}
	} else {
		groups[key] = label;
	}
});

const duplicates = labels.filter(label => label.includes('$') && !Object.values(groups).includes(label));

if (duplicates.length > 0) {
	document.querySelectorAll('.registrationInfo li').forEach(item => {
		const label = item.querySelector('.regTypeLiLabel').textContent.trim();

		if (duplicates.includes(label)) {
			item.style.display = 'none';
		}
	})
}