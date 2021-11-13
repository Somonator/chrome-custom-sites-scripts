chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd === 'check_url_by_patterns') {
        check_url_by_patterns(sender.tab.id);
    }

    return true;
});


function check_url_by_patterns(cur_tab_id) {
    get_scripts_with_patterns().then(function(scripts) {
        if (!scripts.length) {
            return;
        }

        scripts.forEach(function(script) {
            chrome.tabs.query({
                url: script.match_patterns
            }, function(tabs) {
                if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes('user may be dragging a tab')) {
                    setTimeout(() => check_url_by_patterns(cur_tab_id), 200);
                    chrome.runtime.lastError = undefined;
                    return;
                }


                if (tabs) {
                    let index = tabs.findIndex(item => item.id == cur_tab_id);

                    if (index >= 0) insert_script(script, tabs[index].id);
                }
            });                 
        });
    });
}