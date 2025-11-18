const WILD_APRICOT_DEV_ID = "__WILD_APRICOT_DEV_ID__";

async function insertHTMLCSS(backend) {
  const html = await backend.fetchHTMLCSS([
    'event-registration/event-registration.html',
    'event-registration/event-registration.css',
    'style.css'
  ]);

  const container = document.getElementById('idRegistrationFormContainer')
    || document.getElementById('idSelectRegistrationTypeContainer')
    || document.getElementById('idIdentifyUserContainer')
    || document.getElementById('idEventRegistrationConfirmationContainer');

  container.innerHTML += html;
}

function toggleLoader(display) {
  document.getElementById('idGeneralFormContainer').style.display = display ? 'none' : 'block';
  document.getElementById('loader-container').style.display = display ? 'flex' : 'none';
}

function watchForChanges() {
  const observer = new MutationObserver(() => {
    execute();
  });

  observer.observe(document.querySelector('h3.formTitle'), { childList: true, subtree: true, attributes: true });
}

async function execute() {
  let baseUrl = 'https://mariannekenney.github.io/penguin/src/'
  if (localStorage.getItem('developer') === WILD_APRICOT_DEV_ID) {
    baseUrl = baseUrl.split('src').join('dev/src');
    console.log('DEV env .js');
  }

  backend = await import(`${baseUrl}backend.js`);

  await insertHTMLCSS(backend);
  toggleLoader(true);

  const token = await backend.fetchToken();
  const userData = await backend.fetchUser();

  if (userData) {
    const title = document.querySelector('h3.formTitle')?.textContent.trim();

    let step;
    if (title === 'Enter registrant email') {
      const next = document.querySelector('input[value="Next"]');
      if (next) {
        next.click();
      }

      return;
    } else if (title === 'Choose ticket type') {
      const back = document.querySelector('input[value="Back"]');
      if (back) {
        back.style.display = 'none';
      }
      
      step = "step-two";
    } else if (title === 'Enter registration information' || title === 'Enter guest registration information') {
      step = "step-three";
    } else if (title === 'Registration information') {
      step = "step-four";
    }

    if (step) {
      const eventId = document.querySelector('a[href*="event-"]')?.href.split('event-')[1];

      const code = await import(`${baseUrl}event-registration/steps/${step}.js`);
      await code.execute(eventId, backend, token);
    
      watchForChanges();
    }

    toggleLoader(false);
  } else {
    document.getElementById('loader-container').style.display = 'none';
    document.getElementById('user-login-alert').style.display = 'block';
  }
}

execute().catch((err) => {
  console.error(err);
  document.getElementById('loader-container').style.display = 'none';
  document.getElementById('custom-error-alert').style.display = 'block';
});
