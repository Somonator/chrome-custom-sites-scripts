if (get_url_extension(window.location.href) !== 'xml') chrome.runtime.sendMessage({cmd: 'check_url_by_patterns'});


function get_url_extension(url) {
    return url.split(/[#?]/)[0].split('.').pop().trim();
}

function get_extension_html_comment(script_id) {
    let comment_text = 'inserted by custom scripts extension (script id: %script_id%)';
    
    comment_text = comment_text.replace('%script_id%', script_id);

    return document.createComment(comment_text);
}

function script_handler_css(script) {
    if ((Array.isArray(script.css_remote_file) && script.css_remote_files.length) || script.css_code) {
        (document.head || document.documentElement).appendChild(get_extension_html_comment(script.id));
    }

    if (Array.isArray(script.css_remote_file) && script.css_remote_files.length) {
        insert_array_external_styles(script.css_remote_files);
    }

    if (script.css_code) {
        insert_style_code(script.css_code);
    }
}

function script_handler_js(script) {
    element_ready('body').then(function() {
        //  && typeof jQuery === 'undefined'

        if (script.is_insert_jq) {
            let jq_url = 'https://code.jquery.com/jquery-3.6.0.min.js';

            if (!Array.isArray(script.js_remote_files)) script.js_remote_files = [];
            script.js_remote_files.push(jq_url);
        }
        
        if (Array.isArray(script.js_remote_files) && script.js_remote_files.length) {
            (document.body || document.documentElement).appendChild(get_extension_html_comment(script.id));

            insert_array_external_scripts(script.js_remote_files, function() {
                if (script.js_code) {
                    insert_script_code(script.js_code);
                }
            });
        } else if (script.js_code) {
            (document.body || document.documentElement).appendChild(get_extension_html_comment(script.id));

            insert_script_code(script.js_code);
        }
    });
}



function element_ready(selector) {
    return new Promise(function (resolve, reject) {
        const el = document.querySelector(selector);
        
        if (el) resolve(el);

        let mutation_observer = new MutationObserver(function(mutationRecords, observer) {
            Array.from(document.querySelectorAll(selector)).forEach(function(element) {
                resolve(element);
                observer.disconnect();
            });
        })
        
        mutation_observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });
}