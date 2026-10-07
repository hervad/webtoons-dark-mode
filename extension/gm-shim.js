/* The userscript API, for the browser extension build. The theme script
   (webtoons-dark-mode.user.js) runs unchanged after this file in the same
   content-script scope, so it finds the API it would get from a userscript
   manager:
   - GM.getValue / GM.setValue on extension storage, with no GM_getValue:
     the script then takes its asynchronous path, painting the first frame
     from its localStorage mirror and correcting from storage afterwards
     (the Greasemonkey 4 / Safari Userscripts path).
   - GM_registerMenuCommand / GM_unregisterMenuCommand, collected here so
     the toolbar popup can list the same entries ("Turn off dark mode", …)
     and run them in the page. */
const wtApi = globalThis.browser || globalThis.chrome;

// First run: the extension starts dark. The userscript's own default follows
// the system's light / dark setting, but someone who installs a dark-mode
// extension expects it to work right away (the user's call). The script
// reads its first-paint setting from this localStorage mirror, so an empty
// mirror is seeded with "on"; a choice the user made is never overwritten,
// and extension storage still corrects the mirror once it answers.
try {
    if (localStorage.getItem('wt-dark-mode:wt_dark_enabled') === null) localStorage.setItem('wt-dark-mode:wt_dark_enabled', 'true');
} catch { /* storage blocked: the script falls back to its own default */ }

const GM = {
    getValue: (key, def) => wtApi.storage.local.get(key).then(r => (key in r ? r[key] : def)),
    setValue: (key, value) => wtApi.storage.local.set({ [key]: value }),
};

const wtMenu = new Map();
let wtMenuNext = 0;
function GM_registerMenuCommand(label, run) {
    const id = ++wtMenuNext;
    wtMenu.set(id, { label, run });
    return id;
}
function GM_unregisterMenuCommand(id) {
    wtMenu.delete(id);
}

const wtMenuList = () => [...wtMenu].map(([id, e]) => ({ id, label: e.label }));
wtApi.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (!msg || typeof msg.type !== 'string') return;
    // An empty menu with the page marked as running: the userscript copy
    // started first and runs this page (see the guard in the userscript).
    if (msg.type === 'wt-menu') reply(wtMenu.size || !document.documentElement.hasAttribute('data-wt-running') ? wtMenuList() : { otherCopy: true });
    else if (msg.type === 'wt-run') {
        const entry = wtMenu.get(msg.id);
        if (entry) entry.run();
        reply(wtMenuList());  // the labels flip after a toggle
    }
});
