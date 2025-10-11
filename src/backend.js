const WILD_APRICOT_API_KEY = "__WILD_APRICOT_API_KEY__";
const WILD_APRICOT_ACCOUNT_ID = "__WILD_APRICOT_ACCOUNT_ID__";
const WILD_APRICOT_DEV_ID = "__WILD_APRICOT_DEV_ID__";

export async function fetchHTMLCSS(paths) {
  let links = paths.map((path) => `https://mariannekenney.github.io/penguin/src/${path}`);

  if (localStorage.getItem('developer') === WILD_APRICOT_DEV_ID) {
    links = links.map((url) => url.split('src').join('dev/src'));
    console.log('DEV env .html & .css');
  }

  links
    .filter((url) => url.includes('.css'))
    .forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    });

  const response = await fetch(links.find((url) => url.includes('.html')));
  const html = await response.text();

  return html;
}

export async function fetchLimits() {
  try {
    const limits = await fetch('/resources/Admin_Registration_Management.json');

    return await limits.json();
  } catch (error) {
    console.error(error);
  }
}

export async function fetchToken() {
  const base64 = btoa(`APIKEY:${WILD_APRICOT_API_KEY}`);

  try {
    const authResponse = await fetch('https://oauth.wildapricot.org/auth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=auto',
    });
    const authData = await authResponse.json();

    return authData.access_token;
  } catch (error) {
    console.error(error);
  }
}

export async function fetchUser() {
  try {
    const user = await fetch(`/sys/api/v2/accounts/${WILD_APRICOT_ACCOUNT_ID}/contacts/me`, {
      method: 'GET',
      headers: { 'clientId': 'devUser' },
      cache: 'no-store'
    });

    return await user.json();
  } catch (error) {
    console.error(error);
  }
}

export async function fetchAllEvents() {
  try {
    const allEvents = await fetch(`/sys/api/v2/accounts/${WILD_APRICOT_ACCOUNT_ID}/events?$filter=StartDate ge ${(new Date()).toISOString()}&$sort=ByStartDate asc`, {
      method: 'GET',
      headers: { 'clientId': 'devUser' },
      cache: 'no-cache'
    });
    
    return await allEvents.json();
  } catch (error) {
    console.error(error);
  }
}

export async function fetchEvent(eventId) {
  try {
    const event = await fetch(`/sys/api/v2/accounts/${WILD_APRICOT_ACCOUNT_ID}/events/${eventId}`, {
      method: 'GET',
      headers: { 'clientId': 'devUser' },
      cache: 'no-cache'
    });

    return await event.json();
  } catch (error) {
    console.error(error);
  }
}

export async function fetchEventRegistrations(token, eventId) {
  try {
    const registrations = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await fetch(`https://api.wildapricot.org/v2.2/accounts/${WILD_APRICOT_ACCOUNT_ID}/eventregistrations?eventId=${eventId}&top=${limit}&skip=${offset}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      registrations.push(...data);

      if (data.length < limit) {
        break;
      }
      offset += limit;
    }

    for (reg of registrations) {
      const guests = reg.GuestRegistrationsSummary?.GuestRegistrations;
      if (guests?.length > 0) {
        for (guest of guests) {
          const guestRegistration = await handleGuest(token, guest.Id);

          if (guestRegistration) {
            registrations.push(guestRegistration);
          }
        }
      }
    }

    return registrations;
  } catch (error) {
    console.error(error);
  }
}

export async function fetchGuestRegistration(token, registrationId) {
  try {
    const guestRegistration = await fetch(`https://api.wildapricot.org/v2.2/accounts/${WILD_APRICOT_ACCOUNT_ID}/eventregistrations/${registrationId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return await guestRegistration.json();
  } catch (error) {
    console.error(error);
  }
}