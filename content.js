const Fuse = require('fuse.js')
const symbolsUrl = chrome.runtime.getURL('symbols.json');

// {"symbol":"GSAT","name":"GLOBALSTAR INC","date":"2020-07-10","isEnabled":true,"type":"N/A","iexId":"8562"}
const options = {
    minMatchCharLength: 2,
    threshold: 0.2, // 0.6
    distance: 20,
    keys: [
        "name",
        "symbol"
    ]
};

const getSymbols = nameList => {
    // return fetch("https://api.iextrading.com/1.0/ref-data/symbols")
    return fetch(symbolsUrl)
        .then(x => x.json())
        .then(x => {
            const fuse = new Fuse(x, options);
            let ret = [];
            nameList.forEach(name => {
                const results = fuse.search(name);
                if (results.length > 0) {
                    ret.push(results[0].item.symbol);
                }
            })
            return ret;
        })
};

const generateTickerSymbols = () => {
    // Insert ticker symbols next to productName
    setTimeout(() => {
        const spans = document.querySelectorAll("span[data-name='productName']");
        const names = [];
        spans.forEach(x => {
            names.push(x.textContent);
        });
        getSymbols(names)
            .then(x => {
                let i = 0;
                spans.forEach(span => {
                    span.textContent = "[" + x[i] + "] " + span.textContent;
                    i += 1;
                });
                const titleSpans = document.querySelectorAll("span[data-name='productType']");
                titleSpans.forEach(title => {
                    if (title.textContent === "Osakkeet") {
                        title.textContent = title.textContent + " - ";
                        for (let i = x.length - 1; i >= 0; i--) {
                            if (i != 0) {   
                                title.textContent += x[i] + ",";
                            } else {
                                title.textContent += x[i];
                            };
                        };
                    }
                })
            });
    }, 400)
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'TabUpdated') {
        if (document.location.href == "https://trader.degiro.nl/trader/#/portfolio" ||
            document.location.href == "https://trader.degiro.nl/trader/#/portfolio/active") {
            generateTickerSymbols();
        }
    }
})