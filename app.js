const maleTitles = ['Sir', 'Knight', 'Lord', 'Warden'];
const femaleTitles = ['Dame', 'Lady', 'Shieldmaiden', 'Wardeness'];
const maleAdjectives = ['Bright', 'Bold', 'Grand', 'True', 'Prime', 'Brave'];
const femaleAdjectives = ['Bright', 'Grand', 'True', 'Grace', 'Brave', 'Prime'];
const realms = ['Light', 'Flame', 'Stone', 'Star', 'Dawn', 'Vale'];

const rhymePairs = {
  Bright: ['light', 'knight', 'flight'],
  Bold: ['gold', 'hold', 'mold'],
  Grand: ['brand', 'stand', 'hand'],
  True: ['blue', 'hue', 'view'],
  Prime: ['time', 'chime', 'climb'],
  Brave: ['wave', 'cave', 'grave'],
  Grace: ['trace', 'lace', 'embrace']
};

const defaults = {
  heroLead:
    'A mystical, scientific, and medieval-inspired brotherhood & sisterhood where young men and maidens connect, grow in business, and sharpen creativity through service.',
  missionText:
    'The Knights of Shinning Lights is dedicated to good deeds, mentorship, collaboration, and real human connection.',
  whatsappText:
    'Yes, we have an official WhatsApp group. Screening is essential before entry.',
  footerNote: 'We are a non-profit order focused on people, purpose, and honorable impact.'
};

const generatedNameEl = document.getElementById('generatedName');
const generatedUsernameEl = document.getElementById('generatedUsername');
const signupForm = document.getElementById('signupForm');
const formMessage = document.getElementById('formMessage');
const tiltCards = document.querySelectorAll('[data-tilt]');

const contentMap = {
  heroLead: document.getElementById('heroLead'),
  missionText: document.getElementById('missionText'),
  whatsappText: document.getElementById('whatsappText'),
  footerNote: document.getElementById('footerNote')
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildIdentity(gender) {
  const isFemale = gender === 'female';
  const title = randomFrom(isFemale ? femaleTitles : maleTitles);
  const adjective = randomFrom(isFemale ? femaleAdjectives : maleAdjectives);
  const realm = randomFrom(realms);
  const rhyme = randomFrom(rhymePairs[adjective] || ['light']);

  const knightName = `${title} ${adjective} of ${realm}`;
  const username = `${adjective.toLowerCase()}_${rhyme}_${realm.toLowerCase()}`;

  return { knightName, username };
}

signupForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(signupForm);
  const fullName = String(data.get('fullname') || '').trim();
  const gender = String(data.get('gender') || 'male');

  const { knightName, username } = buildIdentity(gender);

  generatedNameEl.textContent = knightName;
  generatedUsernameEl.textContent = `Username: @${username}`;
  formMessage.textContent = `Welcome ${fullName}, your identity is now active. Continue to WhatsApp screening for official entry.`;

  signupForm.reset();
});

for (const card of tiltCards) {
  card.addEventListener('mousemove', (event) => {
    const bounds = card.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateX = ((y - bounds.height / 2) / (bounds.height / 2)) * -4;
    const rotateY = ((x - bounds.width / 2) / (bounds.width / 2)) * 4;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
}

function applySiteContent(content) {
  Object.entries(contentMap).forEach(([key, el]) => {
    if (el && content[key]) {
      el.textContent = content[key];
    }
  });
}

function loadSiteContent() {
  const raw = localStorage.getItem('knights_site_content');
  if (!raw) {
    applySiteContent(defaults);
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    applySiteContent({ ...defaults, ...parsed });
  } catch {
    applySiteContent(defaults);
  }
}

loadSiteContent();

const adminDialog = document.getElementById('adminDialog');
const openAdminBtn = document.getElementById('openAdmin');
const closeAdminBtn = document.getElementById('closeAdmin');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPanel = document.getElementById('adminPanel');
const adminLoginMsg = document.getElementById('adminLoginMsg');
const adminSaveMsg = document.getElementById('adminSaveMsg');

const adminHeroLead = document.getElementById('adminHeroLead');
const adminMissionText = document.getElementById('adminMissionText');
const adminWhatsappText = document.getElementById('adminWhatsappText');
const adminFooterNote = document.getElementById('adminFooterNote');

const saveContentBtn = document.getElementById('saveContent');
const resetContentBtn = document.getElementById('resetContent');
const logoutAdminBtn = document.getElementById('logoutAdmin');

const secretUser = window.__ADMIN_USER || 'admin';
const secretPass = window.__ADMIN_PASS || window.ADMIN_PANEL_PASS || null;

function syncAdminFieldsFromPage() {
  adminHeroLead.value = contentMap.heroLead.textContent;
  adminMissionText.value = contentMap.missionText.textContent;
  adminWhatsappText.value = contentMap.whatsappText.textContent;
  adminFooterNote.value = contentMap.footerNote.textContent;
}

function closeAdminPanel() {
  adminPanel.classList.add('hidden');
  adminLoginForm.classList.remove('hidden');
  adminLoginMsg.textContent = '';
  adminSaveMsg.textContent = '';
}

openAdminBtn?.addEventListener('click', () => {
  adminDialog.showModal();
  closeAdminPanel();
});

closeAdminBtn?.addEventListener('click', () => {
  adminDialog.close();
});

adminLoginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!secretPass) {
    adminLoginMsg.textContent = 'Admin secret is not configured yet.';
    return;
  }

  const data = new FormData(adminLoginForm);
  const username = String(data.get('username') || '');
  const password = String(data.get('password') || '');

  if (username === secretUser && password === secretPass) {
    adminLoginForm.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    syncAdminFieldsFromPage();
    return;
  }

  adminLoginMsg.textContent = 'Invalid credentials.';
});

saveContentBtn?.addEventListener('click', () => {
  const payload = {
    heroLead: adminHeroLead.value.trim(),
    missionText: adminMissionText.value.trim(),
    whatsappText: adminWhatsappText.value.trim(),
    footerNote: adminFooterNote.value.trim()
  };

  localStorage.setItem('knights_site_content', JSON.stringify(payload));
  applySiteContent({ ...defaults, ...payload });
  adminSaveMsg.textContent = 'Writeup saved.';
});

resetContentBtn?.addEventListener('click', () => {
  localStorage.removeItem('knights_site_content');
  applySiteContent(defaults);
  syncAdminFieldsFromPage();
  adminSaveMsg.textContent = 'Defaults restored.';
});

logoutAdminBtn?.addEventListener('click', () => {
  closeAdminPanel();
});
