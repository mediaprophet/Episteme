import { handleAuth, initiateLogin, initiateLogout } from './auth';
import { getAddressBook, Contact } from './addressBook';
import { mintGuardianshipAgreement } from './agreements';

// UI Elements
const idpUrlInput = document.getElementById('idp-url') as HTMLInputElement;
const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

const heroUnauth = document.getElementById('hero-unauth') as HTMLElement;
const dashboard = document.getElementById('dashboard') as HTMLElement;

const userNameEl = document.getElementById('user-name') as HTMLElement;
const userWebidEl = document.getElementById('user-webid') as HTMLElement;
const contactListEl = document.getElementById('contact-list') as HTMLElement;

// Modal Elements
const agreementModal = document.getElementById('agreement-modal') as HTMLElement;
const modalAgentName = document.getElementById('modal-agent-name') as HTMLElement;
const domainSelect = document.getElementById('domain-select') as HTMLSelectElement;
const valuesSelect = document.getElementById('values-select') as HTMLSelectElement;
const cancelBtn = document.getElementById('cancel-agreement-btn') as HTMLButtonElement;
const mintBtn = document.getElementById('mint-agreement-btn') as HTMLButtonElement;

// ADP Elements
const adpDomainInput = document.getElementById('adp-domain-input') as HTMLInputElement;
const generateAdpBtn = document.getElementById('generate-adp-btn') as HTMLButtonElement;
const adpDnsOutput = document.getElementById('adp-dns-output') as HTMLElement;
const adpDnsCode = document.getElementById('adp-dns-code') as HTMLElement;

let currentSession: any;
let targetAgentForAgreement: Contact | null = null;

// Initialization
window.addEventListener('load', async () => {
  currentSession = await handleAuth();

  if (currentSession.info.isLoggedIn) {
    // Show Dashboard
    heroUnauth.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    idpUrlInput.classList.add('hidden');

    const webId = currentSession.info.webId;
    userWebidEl.textContent = webId;
    userNameEl.textContent = "Sovereign User"; // Could fetch from profile

    // Load Address Book
    const contacts = await getAddressBook(webId);
    renderContacts(contacts);
  }
});

// Auth Listeners
loginBtn.addEventListener('click', () => {
  initiateLogin(idpUrlInput.value);
});
logoutBtn.addEventListener('click', () => {
  initiateLogout();
});

// Render Address Book
function renderContacts(contacts: Contact[]) {
  contactListEl.innerHTML = '';
  contacts.forEach(contact => {
    const li = document.createElement('li');
    li.className = 'contact-item';
    li.innerHTML = `
      <div>
        <h4>${contact.name}</h4>
        <small style="color: var(--text-secondary); word-break: break-all;">${contact.webId}</small>
      </div>
      <button class="btn primary-btn">Negotiate Role</button>
    `;
    
    // Bind Modal
    const btn = li.querySelector('button');
    btn?.addEventListener('click', () => {
      targetAgentForAgreement = contact;
      modalAgentName.textContent = contact.name;
      agreementModal.classList.remove('hidden');
    });

    contactListEl.appendChild(li);
  });
}

// Modal Listeners
cancelBtn.addEventListener('click', () => {
  agreementModal.classList.add('hidden');
  targetAgentForAgreement = null;
});

mintBtn.addEventListener('click', async () => {
  if (!targetAgentForAgreement) return;
  
  mintBtn.textContent = "Minting...";
  mintBtn.disabled = true;

  try {
    const webId = currentSession.info.webId;
    await mintGuardianshipAgreement(
      webId,
      targetAgentForAgreement.webId,
      domainSelect.value,
      valuesSelect.value,
      webId // Passing root profile as base for now
    );
    alert(`Agreement successfully stored in Pod for ${domainSelect.value}!`);
  } catch (error) {
    console.error(error);
    alert("Failed to store agreement. Note: Demo assumes /agreements/ exists with Write permissions on your Pod.");
  }

  agreementModal.classList.add('hidden');
  mintBtn.textContent = "Sign & Mint Agreement";
  mintBtn.disabled = false;
  targetAgentForAgreement = null;
});

// ADP Logic
generateAdpBtn.addEventListener('click', () => {
  const domain = adpDomainInput.value.trim();
  if (!domain) {
    alert("Please enter a domain name.");
    return;
  }
  
  const webId = currentSession?.info?.webId;
  if (!webId) {
    alert("You must be logged in to generate ADP records.");
    return;
  }

  // Generate standard DNS TXT record for ADP linking domain to WebID
  const txtRecordName = `_adp.${domain}`;
  const txtRecordValue = `v=adp1 webid=${webId}`;
  
  adpDnsCode.textContent = `Name: ${txtRecordName}\nType: TXT\nValue: "${txtRecordValue}"`;
  adpDnsOutput.classList.remove('hidden');
});

