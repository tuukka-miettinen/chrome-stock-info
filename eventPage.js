// Bind tab change
chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            chrome.tabs.sendMessage(tabId, {
                message: 'TabUpdated'
            });
        }
    })
});

// Create contextmenu items
var yahooMenuItem = {
    "id": "yahoo",
    "title": "Yahoo",
    "contexts": ["selection"]
};
var marketWatchMenuItem = {
    "id": "marketWatch",
    "title": "MarketWatch",
    "contexts": ["selection"]
};

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

chrome.contextMenus.create(yahooMenuItem);
chrome.contextMenus.onClicked.addListener(function(data) {
    if (data.menuItemId == yahooMenuItem.id && data.selectionText) {
        openInNewTab("https://finance.yahoo.com/quote/" + data.selectionText.trim())
    }
});

chrome.contextMenus.create(marketWatchMenuItem);
chrome.contextMenus.onClicked.addListener(function(data) {
    if (data.menuItemId == marketWatchMenuItem.id && data.selectionText) {
        openInNewTab("https://www.marketwatch.com/investing/stock/" + data.selectionText.trim())
    }
});