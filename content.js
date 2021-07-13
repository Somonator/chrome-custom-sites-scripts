chrome.runtime.sendMessage({cmd: 'check_url_by_patterns'});


function script_handler_css(script) {
    if (Array.isArray(script.css_remote_file) && script.css_remote_files.length) {
        insert_array_external_styles(script.css_remote_files);
    }

    if (script.css_code) {
        insert_style_code(script.css_code);
    }
}

function script_handler_js(script) {
    element_ready('body').then(function() {
        if (Array.isArray(script.js_remote_files) && script.js_remote_files.length) {
            insert_array_external_scripts(script.js_remote_files, function() {
                if (script.js_code) {
                    insert_script_code(script.js_code);
                }
            });
        } else {
            if (script.js_code) {
                insert_script_code(script.js_code);
            }  
        }        
    });
}



function element_ready(selector) {
    return new Promise(function (resolve, reject) {
        const el = document.querySelector(selector);
        let timer_reject;
        
        if (el) resolve(el);

        let mutation_observer = new MutationObserver(function(mutationRecords, observer) {
            Array.from(document.querySelectorAll(selector)).forEach(function(element) {
                resolve(element);
                observer.disconnect();
                clearTimeout(timer_reject);
            });
        })
        
        mutation_observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        timer_reject = setTimeout(function() {
            reject();
            mutation_observer.disconnect();
        }, 8 * 1000);
    });
}