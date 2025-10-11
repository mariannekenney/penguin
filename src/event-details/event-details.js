const today = new Date();
today.setHours(0, 0, 0, 0);
const eventDate = new Date(document.querySelector('.eventInfoBoxValue').textContent.trim());
const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

let isEarlyBird;
if (diffDays >= 10) {
	isEarlyBird = true;
} else if (diffDays >= 1 && diffDays <= 9) {
	isEarlyBird = false;
}

const hasLTF = Array.from(document.querySelectorAll('.regTypeLiLabel'))
	.map(element => element.textContent.trim())
	.some(label => label.includes('LTF'));

document.querySelectorAll('.registrationInfo li').forEach(item => {
	const label = item.querySelector('.regTypeLiLabel').textContent.trim();

	if (isEarlyBird == undefined) {
		item.style.display = 'none';
	} else if (label !== 'Equipment Only') {
		if (hasLTF && !label.includes('LTF')) {
			item.style.display = 'none';
		}

		if ((label.includes('Early-Bird') && !isEarlyBird) || (!label.includes('Early-Bird') && isEarlyBird)) {
			item.style.display = 'none';
		}
	}
});

const container = document.querySelector('.boxBodyInfoContainer');
const buttonContainer = container.querySelector('.boxActionContainer');
const newContainer = container.querySelector('.infoText');

if (buttonContainer && newContainer) {
	newContainer.innerHTML = '';
	newContainer.appendChild(buttonContainer);
	newContainer.innerHTML += '<strong>Base fee(s)</strong>';

	container.querySelector('.infoTitle').style.display = 'none';
	container.querySelector('.regTypeHr').style.display = 'none';

	const button = container.querySelector('input');
	button.style.backgroundColor = '#40b2cf';
	button.style.color = 'white';
}
