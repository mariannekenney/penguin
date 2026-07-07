const WILD_APRICOT_DEV_ID = "__WILD_APRICOT_DEV_ID__";

function execute() {
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

	const options = Array.from(document.querySelectorAll('.registrationInfo li'));
	const labels = options.map(item => item.querySelector('.regTypeLiLabel')?.textContent.trim()).filter(Boolean);

	// Base type with the price and "Early-Bird" stripped out, so we can tell whether a
	// label has a same-type Early-Bird/non-Early-Bird sibling (e.g. "General Registration
	// (LTF)" vs "General Registration (LTF Early-Bird)"). Labels with no sibling (e.g.
	// "Upgrade to School (LTF Practice)") aren't part of an Early-Bird pair and shouldn't
	// be filtered based on Early-Bird status at all.
	const getBaseType = (label) => label.split('–')[0].replace(/Early-Bird/gi, '').replace(/[\s()]+/g, ' ').trim();

	const baseTypeCounts = labels.reduce((counts, label) => {
		const baseType = getBaseType(label);
		counts[baseType] = (counts[baseType] || 0) + 1;
		return counts;
	}, {});

	options.forEach(item => {
		const label = item.querySelector('.regTypeLiLabel').textContent.trim();
		const isLTFLabel = label.includes('LTF');
		const hasEarlyBirdPair = baseTypeCounts[getBaseType(label)] > 1;

		if (isEarlyBird == undefined) {
			item.style.display = 'none';
		} else if (label !== 'Equipment Only') {
			if (hasLTF && !isLTFLabel) {
				item.style.display = 'none';
			}

			if (hasEarlyBirdPair && ((label.includes('Early-Bird') && !isEarlyBird) || (!label.includes('Early-Bird') && isEarlyBird))) {
				item.style.display = 'none';
			}
		}
	});

	const container = document.querySelector('.boxBodyInfoContainer');
	const buttonContainer = container.querySelector('.boxActionContainer');
	const newContainer = container.querySelector('.infoText');

	if (buttonContainer && newContainer) {
		if (diffDays) {
			newContainer.innerHTML = '';
			newContainer.appendChild(buttonContainer);
			newContainer.innerHTML += '<strong>Base fee(s)</strong>';
		}

		container.querySelector('.infoTitle').style.display = 'none';
		container.querySelector('.regTypeHr').style.display = 'none';

		const button = container.querySelector('input');
		button.style.backgroundColor = '#40b2cf';
		button.style.color = 'white';
	}
}

async function registrationDetails() {
	let baseUrl = 'https://mariannekenney.github.io/penguin/src/'
	if (localStorage.getItem('developer') === WILD_APRICOT_DEV_ID) {
		baseUrl = baseUrl.split('src').join('dev/src');
		console.log('DEV env .js');
	}

	const code = await import(`${baseUrl}event-registration/steps/step-four.js`);
	await code.execute();
}

const href = window.location.href;
if (href.includes('RegistrationsList')) {
	const index = href.indexOf('RegistrationsList');
	const nextChar = href.charAt(index + 'RegistrationsList'.length);

	if (nextChar === '/') {
		registrationDetails();
	}
} else {
	execute();
}
