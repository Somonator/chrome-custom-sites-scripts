function insert_style_code(style_code) {
    let style = document.createElement('style');

    style.textContent = style_code;

    (document.head || document.documentElement).appendChild(style);
}

function insert_external_style(url) {
    let link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;
    link.onerror = function() {
        console.error('Ошибка загрузки стилей по адресу: ' + url);
    };

   (document.head || document.documentElement).appendChild(link);
}

function insert_array_external_styles(style_urls) {
    style_urls.forEach(function(item) {
        insert_external_style(item);
    });
}

function remove_сomments_source(str) {
    return str.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');
}

function get_function_body(fn) {
    let s = remove_сomments_source(fn.toString());

    return s.substring(s.indexOf('{') + 1, s.lastIndexOf('}'));
}

function insert_script_code(script_code) {
    let script = document.createElement('script');

    script.textContent = script_code;

    (document.body || document.documentElement).appendChild(script);
}

function insert_external_script(url, callback) {
    let script = document.createElement('script');

    script.src = url;
    script.onload = function () {
        callback();
    };
    script.onerror = function() {
        console.error('Ошибка загрузки скрипта по адресу: ' + this.src);
    };

   (document.body|| document.documentElement).appendChild(script);
}

function insert_array_external_scripts(script_urls, callback) {
    let i = 0,
        load_callback = function() {
            i++;
    
            if (i != script_urls.length) {
                insert_external_script(script_urls[i], load_callback);
            } else {
                callback();
            }
        };

    insert_external_script(script_urls[i], load_callback);
}