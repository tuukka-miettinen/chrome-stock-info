const Fuse = require('fuse.js')

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

const getNames = nameList => {
    fetch("https://api.iextrading.com/1.0/ref-data/symbols")
        .then(x => x.json())
        .then(x => {
            const fuse = new Fuse(x, options);
            nameList.forEach(name => {
                console.log(name);
                const results = fuse.search(name);
                if (results.length > 0) {
                    console.log(results[0]);
                }
            })
        })
};

getNames(["globalstar", "chf solutions", "chfs"])