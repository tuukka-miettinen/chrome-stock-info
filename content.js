const Fuse = require('fuse.js')
const symbolsUrl = chrome.runtime.getURL('symbols.json');

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

// {"symbol":"GSAT","name":"GLOBALSTAR INC","date":"2020-07-10","isEnabled":true,"type":"N/A","iexId":"8562"}
const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    keys: [
        "name",
        "symbol"
    ]
};

// Insert ticker symbols next to productName
setTimeout(() => {
    const spans = document.querySelectorAll("span[data-name='productName']");
    const names = [];
    spans.forEach(x => {
        names.push(x.textContent);
    });
    getSymbols(names)
        .then(x => {
            // console.log(x.toString());
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
            // for (let i = 0; i < spans.length; i++) {
            //     spans[i].textContent = "(" + x[i] + ") " + spans[i].textContent;
            // }
        });
}, 400)