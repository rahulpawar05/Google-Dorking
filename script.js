document.addEventListener('DOMContentLoaded', () => {
    let currentCategory = 'video';

    const fileTypes = {
        video: ['mkv', 'mp4', 'avi', 'mov', 'wmv', 'mpeg', 'mpg', 'webm'],
        audio: ['mp3', 'flac', 'wav', 'm4a', 'aac', 'ogg', 'wma'],
        book: ['pdf', 'epub', 'mobi', 'cbz', 'cbr', 'doc', 'docx', 'rtf'],
        software: ['zip', 'rar', '7z', 'iso', 'dmg', 'exe', 'apk', 'tar', 'gz'],
        all: [
            'mkv', 'mp4', 'avi', 'mp3', 'flac', 'pdf', 'epub',
            'zip', 'rar', '7z', 'iso', 'apk'
        ]
    };

    const smartFileTypes = {
        video: ['mkv', 'mp4', 'avi'],
        audio: ['mp3', 'flac'],
        book: ['pdf', 'epub'],
        software: ['zip', 'rar', 'iso', 'apk'],
        all: ['mkv', 'mp4', 'mp3', 'pdf', 'zip']
    };

    const placeholderMap = {
        video: 'Search movies or videos, e.g. public domain film mkv',
        audio: 'Search MP3 or audio, e.g. Creative Commons music mp3',
        book: 'Search books, e.g. public domain book pdf',
        software: 'Search apps or archives, e.g. Ubuntu iso',
        all: 'Search any open-directory file'
    };

    const resTypeMap = {
        video: 'video',
        audio: 'audio',
        book: 'ebook',
        software: 'archive',
        all: 'all'
    };

    const engineUrls = {
        google: query => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        googol: query => `https://googol.warriordudimanche.net/?q=${encodeURIComponent(query)}`,
        startpage: query => `https://www.startpage.com/do/dsearch?query=${encodeURIComponent(query)}`,
        searx: query => `https://searx.me/?q=${encodeURIComponent(query)}`
    };

    const indexOfFilter = '(intitle:"index of" OR "index of")';
    const strictIndexOfFilter = 'intitle:"index of" ("parent directory" OR "last modified" OR "size")';
    const relaxedIndexOfFilter = '("index of" OR "parent directory")';
    const excludedUrlParts = [
        'jsp', 'pl', 'php', 'html', 'aspx', 'htm', 'cf', 'shtml',
        'listen77', 'mp3raid', 'mp3toss', 'mp3drug', 'index_of',
        'index-of', 'wallywashis', 'downloadmana', 'login', 'signup',
        'register', 'forum', 'thread', 'topic'
    ];
    const excludedTitleParts = ['login', 'signup', 'register'];
    const spamExclusions = [
        ...excludedUrlParts.map(part => `-inurl:${part}`),
        ...excludedTitleParts.map(part => `-intitle:${part}`)
    ].join(' ');

    const searchForm = document.getElementById('searchForm');
    const queryInput = document.getElementById('queryInput');
    const luckyBtn = document.getElementById('luckyBtn');
    const typeLinks = document.querySelectorAll('.type-link');
    const advToggle = document.getElementById('advToggle');
    const advClear = document.getElementById('advClear');
    const advancedPanel = document.getElementById('advancedPanel');
    const exactInput = document.getElementById('exactInput');
    const anyInput = document.getElementById('anyInput');
    const noneInput = document.getElementById('noneInput');
    const siteInput = document.getElementById('siteInput');
    const inurlInput = document.getElementById('inurlInput');
    const intitleInput = document.getElementById('intitleInput');
    const customExtInput = document.getElementById('customExtInput');
    const extraInput = document.getElementById('extraInput');
    const indexOfCheck = document.getElementById('indexOfCheck');
    const spamCheck = document.getElementById('spamCheck');
    const engineSelect = document.getElementById('engineSelect');
    const categoryExtCheck = document.getElementById('categoryExtCheck');
    const strictnessSelect = document.getElementById('strictnessSelect');

    const toList = value => value
        .split(/[\s,]+/)
        .map(item => item.trim())
        .filter(Boolean);

    const quoteIfNeeded = value => {
        const safe = value.replace(/"/g, '\\"');
        return /\s/.test(safe) ? `"${safe}"` : safe;
    };

    const cleanDomain = value => value
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/.*$/, '')
        .trim();

    const normalizeExtension = ext => {
        const cleaned = ext.replace(/^\./, '').toLowerCase();
        return cleaned === 'mvk' ? 'mkv' : cleaned;
    };

    const pickCategoryExtensions = (category, mode) => {
        if (mode === 'strict') return fileTypes[category] || [];
        if (mode === 'relaxed') return (fileTypes[category] || []).slice(0, 2);
        return smartFileTypes[category] || [];
    };

    const buildExtensionBlock = (category, customExts, useCategoryExts, mode) => {
        const extensions = [];

        if (useCategoryExts && fileTypes[category]) {
            extensions.push(...pickCategoryExtensions(category, mode));
        }

        customExts.forEach(ext => {
            const cleaned = normalizeExtension(ext);
            if (cleaned) extensions.push(cleaned);
        });

        const uniqueExts = [...new Set(extensions)];
        if (!uniqueExts.length) return '';

        return `(${uniqueExts.join(' OR ')})`;
    };

    const collectPlainQuery = ({ query, exactPhrase, anyWords }) => {
        return [query, exactPhrase, ...anyWords].filter(Boolean).join(' ').trim();
    };

    const buildSearchQuery = () => {
        const query = queryInput.value.trim();
        const exactPhrase = exactInput.value.trim();
        const anyWords = toList(anyInput.value);
        const noneWords = toList(noneInput.value);
        const site = cleanDomain(siteInput.value);
        const inurlWords = toList(inurlInput.value);
        const intitleWords = toList(intitleInput.value);
        const customExts = toList(customExtInput.value);
        const extraOps = extraInput.value.trim();
        const mode = strictnessSelect.value;

        const hasAdvanced = [
            exactPhrase,
            anyWords.length,
            noneWords.length,
            site,
            inurlWords.length,
            intitleWords.length,
            customExts.length,
            extraOps
        ].some(Boolean);

        if (!query && !hasAdvanced) {
            return { finalQuery: '', plainQuery: '' };
        }

        const parts = [];

        if (query) {
            parts.push(query);
        }

        if (exactPhrase) {
            parts.push(`"${exactPhrase.replace(/"/g, '\\"')}"`);
        }

        if (anyWords.length) {
            parts.push(`(${anyWords.map(quoteIfNeeded).join(' OR ')})`);
        }

        if (categoryExtCheck.checked || customExts.length) {
            const extensionBlock = buildExtensionBlock(
                currentCategory,
                customExts,
                categoryExtCheck.checked,
                mode
            );
            if (extensionBlock) parts.push(extensionBlock);
        }

        if (indexOfCheck.checked) {
            if (mode === 'strict') {
                parts.push(strictIndexOfFilter);
            } else if (mode === 'relaxed') {
                parts.push(relaxedIndexOfFilter);
            } else {
                parts.push(indexOfFilter);
            }
        }

        noneWords.forEach(word => parts.push(`-${quoteIfNeeded(word)}`));

        if (site) {
            parts.push(`site:${site}`);
        }

        inurlWords.forEach(word => parts.push(`inurl:${quoteIfNeeded(word)}`));
        intitleWords.forEach(word => parts.push(`intitle:${quoteIfNeeded(word)}`));

        if (spamCheck.checked) {
            parts.push(spamExclusions);
        }

        if (extraOps) {
            parts.push(extraOps);
        }

        return {
            finalQuery: parts.join(' ').replace(/\s+/g, ' ').trim(),
            plainQuery: collectPlainQuery({ query, exactPhrase, anyWords })
        };
    };

    const openSearch = () => {
        const engine = engineSelect.value;
        const { finalQuery, plainQuery } = buildSearchQuery();

        if (!finalQuery) return;

        if (engine === 'filepursuit') {
            const filePursuitQuery = plainQuery || queryInput.value.trim();
            if (!filePursuitQuery) return;

            const resType = resTypeMap[currentCategory] || 'all';
            const searchPath = encodeURIComponent(filePursuitQuery).replace(/%20/g, '+');
            window.open(`https://filepursuit.com/search/${searchPath}/type/${resType}`, '_blank');
            return;
        }

        const makeUrl = engineUrls[engine] || engineUrls.google;
        window.open(makeUrl(finalQuery), '_blank');
    };

    typeLinks.forEach(link => {
        link.addEventListener('click', event => {
            currentCategory = event.currentTarget.getAttribute('data-type');
            typeLinks.forEach(typeLink => typeLink.classList.remove('active'));
            event.currentTarget.classList.add('active');
            queryInput.placeholder = placeholderMap[currentCategory] || placeholderMap.all;
            queryInput.focus();
        });
    });

    advToggle.addEventListener('click', () => {
        const isOpen = advancedPanel.classList.toggle('open');
        advancedPanel.setAttribute('aria-hidden', (!isOpen).toString());
    });

    advClear.addEventListener('click', () => {
        exactInput.value = '';
        anyInput.value = '';
        noneInput.value = '';
        siteInput.value = '';
        inurlInput.value = '';
        intitleInput.value = '';
        customExtInput.value = '';
        extraInput.value = '';
        indexOfCheck.checked = true;
        spamCheck.checked = true;
        categoryExtCheck.checked = true;
        strictnessSelect.value = 'smart';
        queryInput.focus();
    });

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        openSearch();
    });

    luckyBtn.addEventListener('click', () => {
        const queries = [
            'Kali Linux ISO',
            'Python Programming PDF',
            'Ubuntu server ISO',
            'public domain movies',
            'Creative Commons music'
        ];
        queryInput.value = queries[Math.floor(Math.random() * queries.length)];
        queryInput.focus();
    });
});
