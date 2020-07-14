const Fuse = require('fuse.js')
const symbolsUrl = chrome.runtime.getURL('symbols.json');

// {"symbol":"GSAT","name":"GLOBALSTAR INC","date":"2020-07-10","isEnabled":true,"type":"N/A","iexId":"8562"}
const options = {
    minMatchCharLength: 2,
    threshold: 0.5, // 0.6
    distance: 20,
    keys: [
        "name",
        "symbol"
    ]
};

let getFromStorage = keys => {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get(...keys, result => {
            return resolve(result);
        });
    })
};

const getSymbols = nameList => {
    return fetch(symbolsUrl) // "https://api.iextrading.com/1.0/ref-data/symbols"
        .then(x => x.json())
        .then(x => {
            return getFromStorage(['knownSymbols']).then(x => x.knownSymbols).then(knownSymbols => {
                const fuse = new Fuse(x, options);
                let ret = [];
                nameList.forEach(name => {
                    const nameHash = name.toLowerCase().replace(/[^\w\s!?]/g,'');
                    if (knownSymbols[nameHash] !== undefined) {
                        console.log("Symbol for " + name + " found in storage.")
                        ret.push(knownSymbols[nameHash]);
                    } else {
                        console.log("Searching symbol for " + name + " with fuse.")
                        const results = fuse.search(name);
                        if (results.length > 0) {
                            knownSymbols[nameHash] = results[0].item.symbol;
                            ret.push(results[0].item.symbol);
                        }
                    }
                })
                chrome.storage.local.set({"knownSymbols": knownSymbols}, function() {
                    // console.log("saving knownSymbols", knownSymbols);
                });	
                return ret;
            });
        })
};

const generateTickerSymbols = () => {
    // Insert ticker symbols next to productName
    setTimeout(() => {
        const spans = document.querySelectorAll("div[data-name='portfolio'] span[data-name='productName']");
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
                        title.textContent += " - ";
                        let symbols = "";
                        for (let i = x.length - 1; i >= 0; i--) {
                            if (i != 0) {   
                                symbols += x[i] + ",";
                            } else {
                                symbols += x[i];
                            };
                        };
                        title.textContent += symbols;
                    }
                })
            });
    }, 600)
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'TabUpdated') {
        if (document.location.href == "https://trader.degiro.nl/trader/#/portfolio" ||
            document.location.href == "https://trader.degiro.nl/trader/#/portfolio/active" ||
            document.location.href == "https://trader.degiro.nl/traders4/#/portfolio" ||
            document.location.href == "https://trader.degiro.nl/traders4/#/portfolio/active"
            ) {
                console.log("Fetching symbols");
                generateTickerSymbols();
        }
    }
})