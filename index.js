const MODULE_NAME = 'Midnight';
const FONT_LINK_ID = 'midnight-fonts';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap';

const ACCENTS = Object.freeze({
    violet: '#8b7cff',
    blue: '#5b9dff',
    teal: '#2dd4bf',
    rose: '#fb7185',
    amber: '#f5b14c',
});

const defaultSettings = Object.freeze({
    enabled: true,
    accent: 'violet',
    chatStyle: 'cards',
    cleanBackground: true,
    modernFont: true,
});

function getSettings() {
    const { extensionSettings, saveSettingsDebounced } = SillyTavern.getContext();
    extensionSettings[MODULE_NAME] = Object.assign({}, defaultSettings, extensionSettings[MODULE_NAME]);
    return { settings: extensionSettings[MODULE_NAME], saveSettingsDebounced };
}

function ensureFonts() {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
}

function applySkin(settings) {
    const body = document.body;
    body.classList.toggle('midnight', settings.enabled);
    for (const name of Object.keys(ACCENTS)) {
        body.classList.toggle(`mn-accent-${name}`, settings.enabled && settings.accent === name);
    }
    body.classList.toggle('mn-flat', settings.enabled && settings.chatStyle === 'flat');
    body.classList.toggle('mn-clean-bg', settings.enabled && settings.cleanBackground);
    body.classList.toggle('mn-font', settings.enabled && settings.modernFont);
    if (settings.enabled && settings.modernFont) ensureFonts();
}

function renderSettings(settings, save) {
    const root = document.getElementById('extensions_settings2');
    if (!root) {
        console.warn(`[${MODULE_NAME}] 找不到 #extensions_settings2，皮套已套用但沒有設定面板`);
        return;
    }

    const swatches = Object.entries(ACCENTS)
        .map(([name, color]) => `<div class="mn-swatch" data-accent="${name}" title="${name}" style="background:${color}"></div>`)
        .join('');

    const container = document.createElement('div');
    container.className = 'midnight-settings';
    container.innerHTML = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Midnight 皮套</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label"><input type="checkbox" id="mn_enabled"> 啟用 Midnight 皮套</label>
                <div class="mn-row">
                    <span>主色</span>
                    <div class="mn-swatches">${swatches}</div>
                </div>
                <div class="mn-row">
                    <span>訊息樣式</span>
                    <select id="mn_chat_style" class="text_pole" style="width:auto;margin:0">
                        <option value="cards">卡片</option>
                        <option value="flat">扁平</option>
                    </select>
                </div>
                <label class="checkbox_label"><input type="checkbox" id="mn_clean_bg"> 用柔光漸層取代背景圖</label>
                <label class="checkbox_label"><input type="checkbox" id="mn_font"> 使用 Inter / Noto Sans TC 字體</label>
            </div>
        </div>`;
    root.appendChild(container);

    const $ = (sel) => container.querySelector(sel);
    const refreshSwatches = () => {
        container.querySelectorAll('.mn-swatch').forEach((el) => {
            el.classList.toggle('selected', el.dataset.accent === settings.accent);
        });
    };
    const update = (patch) => {
        Object.assign(settings, patch);
        applySkin(settings);
        refreshSwatches();
        save();
    };

    $('#mn_enabled').checked = settings.enabled;
    $('#mn_chat_style').value = settings.chatStyle;
    $('#mn_clean_bg').checked = settings.cleanBackground;
    $('#mn_font').checked = settings.modernFont;
    refreshSwatches();

    $('#mn_enabled').addEventListener('change', (e) => update({ enabled: e.target.checked }));
    $('#mn_chat_style').addEventListener('change', (e) => update({ chatStyle: e.target.value }));
    $('#mn_clean_bg').addEventListener('change', (e) => update({ cleanBackground: e.target.checked }));
    $('#mn_font').addEventListener('change', (e) => update({ modernFont: e.target.checked }));
    container.querySelectorAll('.mn-swatch').forEach((el) => {
        el.addEventListener('click', () => update({ accent: el.dataset.accent }));
    });
}

(function init() {
    const { settings, saveSettingsDebounced } = getSettings();
    applySkin(settings);
    renderSettings(settings, saveSettingsDebounced);
})();
