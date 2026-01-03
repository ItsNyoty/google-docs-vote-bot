# Google Forms Vote Bot (Belgium Edition)

This project is a fork of [google-docs-vote-bot](https://github.com/korti11/google-docs-vote-bot), heavily customized for Belgian voting contexts.

It uses **Puppeteer** to automate filling out Google Forms with authentic-looking Flemish/Belgian data.

## Features specific to this fork

*   **Belgian Identity Generation**: Generates realistic Flemish names (e.g., "Peeters Jan", "Maes Julie") and addresses.
*   **Flemish locations**: Location data is specifically tailored to real Flemish cities and villages.
*   **Smart Phone Formatting**: Generates Belgian mobile numbers (04xx...) with realistic formatting variations (with or without spaces).
*   **Smart Email Generation**: Prioritizes `gmail.com` (70%) while mixing in popular Belgian providers (`telenet.be`, `proximus.be`).


## Usage

### Prerequisites
*   Node.js installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ItsNyoty/google-docs-vote-bot.git
    cd google-docs-vote-bot
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure the bot:
    *   Rename `.env.example` to `.env`.
    *   Edit `.env` and add your target Google Form URL:
        ```env
        FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform
        ```

### Running

To start the bot:

```bash
npm start
```

The bot will launch a browser instance (visible by default) and start filling out forms.

## Configuration

You can adjust wait times in the `.env` file:

*   `MIN_WAIT_TIME`: Minimum seconds to wait between votes.
*   `MAX_WAIT_TIME`: Maximum seconds to wait between votes.

## Disclaimer

This tool is for educational and testing purposes only. Automated voting may violate the terms of service of Google Forms or the specific competition rules. Use responsibly.
