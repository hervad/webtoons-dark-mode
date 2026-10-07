/* Toolbar popup: lists the theme's menu entries for the open webtoons.com
   tab (the same entries a userscript manager shows) and runs them there.
   On any other page the content script isn't present, so the message fails
   and the popup says where the settings work. */
const api = globalThis.browser || globalThis.chrome;
const manifest = api.runtime.getManifest();
document.getElementById('name').textContent = manifest.short_name || manifest.name;
document.getElementById('version').textContent = 'Version ' + manifest.version;

const menu = document.getElementById('menu');
const away = document.getElementById('away');

function render(entries) {
    menu.replaceChildren(...entries.map(({ id, label }) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', () => send({ type: 'wt-run', id }));
        return b;
    }));
}

let tabId;
async function send(msg) {
    try {
        const entries = await api.tabs.sendMessage(tabId, msg);
        if (entries && entries.otherCopy) {
            menu.replaceChildren();
            away.textContent = 'The Webtoons Dark Mode userscript is also installed and is running this page. Use its menu, or turn the userscript off to use Toonlight.';
            away.hidden = false;
            return;
        }
        if (!Array.isArray(entries) || !entries.length) throw new Error('no menu');
        away.hidden = true;
        render(entries);
    } catch {
        menu.replaceChildren();
        away.hidden = false;
    }
}

api.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    tabId = tab && tab.id;
    if (tabId === undefined) { away.hidden = false; return; }
    send({ type: 'wt-menu' });
});
