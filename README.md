# Open Directory Search Tool 

A web-based OSINT tool that mimics the Google homepage interface to perform advanced Google Dork queries. This tool helps locate open directories ("Index of") to find direct download links for movies, music, books, and software.

## Features

* **Google-like UI:** A clean, familiar interface that mimics the official Google design.
* **Advanced Dorking:** Automatically constructs complex search queries (`intitle:index.of`, exclusions, file extensions).
* **Spam Filtering:** Includes built-in filters to remove known spam and fake directory sites.
* **Category Selection:** Easily switch between Video, Audio, Books, Software, and All Files.
* **I'm Feeling Lucky:** Generates a random tech-related search query.

## Technologies Used

* **HTML5:** Structure and layout.
* **CSS3:** Custom variables and flexbox for the Google replica design.
* **JavaScript (Vanilla):** Logic for query construction and DOM manipulation.
* **FontAwesome:** Icons for the search bar and navigation.

## Project Structure

```text
/google-dorking
│
├── index.html    # The main interface
├── style.css     # Styling and Google theme colors
└── script.js     # Search logic and Dork generation