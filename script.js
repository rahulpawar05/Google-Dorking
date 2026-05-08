document.addEventListener('DOMContentLoaded', () => {
    let currentCategory = 'video';

    const fileTypes = {
        video: "mkv|mp4|avi|mov|mpg|wmv|divx|mpeg",
        audio: "mp3|wav|ac3|ogg|flac|wma|m4a|aac",
        book:  "MOBI|CBZ|CBR|EPUB|PDF|RTF|DOC|DOCX",
        software: "exe|iso|dmg|tar|7z|rar|zip|apk",
        all:   "" 
    };

    const exclusions = "-inurl:(jsp|pl|php|html|aspx|htm|cf|shtml) intitle:index.of -inurl:(listen77|mp3raid|mp3toss|mp3drug|index_of|index-of|wallywashis|downloadmana)";

    const searchForm = document.getElementById('searchForm');
    const queryInput = document.getElementById('queryInput');
    const luckyBtn = document.getElementById('luckyBtn');
    const typeLinks = document.querySelectorAll('.type-link');

    typeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            currentCategory = e.target.getAttribute('data-type');
            
            typeLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const query = queryInput.value.trim();
        
        if (!query) return;

        const extensions = fileTypes[currentCategory];
        let finalDork = "";

        if (extensions) {
            finalDork = `${query} +(${extensions}) ${exclusions}`;
        } else {
            finalDork = `${query} ${exclusions}`;
        }

        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(finalDork)}`;
        window.location.href = googleUrl;
    });

    luckyBtn.addEventListener('click', () => {
        const queries = [
            "Mr Robot Season 1", 
            "Kali Linux ISO", 
            "Python Programming", 
            "Cybersecurity Course", 
            "Top 100 Billboard"
        ];
        const random = queries[Math.floor(Math.random() * queries.length)];
        
        queryInput.value = random;
    });
});