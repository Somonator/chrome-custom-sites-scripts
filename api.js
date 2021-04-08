function get_random_integer(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);

    return Math.round(rand);
}



async function get_all_scripts() {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get({ scripts: [] }, function (options) {
            resolve(options.scripts);
        });        
    });
}

async function get_scripts_with_patterns() {
    let scripts = await get_all_scripts()
        scripts_with_patterns = scripts.filter(item => item.match_patterns.length && !!item.is_disabled === false);

    return scripts_with_patterns;
}

async function get_script_by_id(id) {
    let script = {},
        scripts = await get_all_scripts(),
        index = scripts.findIndex(item => item.id == id); 

    if (index >= 0) {
        script = scripts[index];
    }

    return script;
}

async function get_code_by_id(id) {
    return await get_script_by_id(id).script;
}



function insert_script(script, tab_id = null) {
    if (script.css_code) {
        chrome.tabs.insertCSS(tab_id, {
            runAt: 'document_start',
            cssOrigin: 'user',
            code: script.css_code
        });
    }

    if (script.js_code) {
        chrome.tabs.executeScript(tab_id, {
            runAt: 'document_start',
            code: script.js_code
        });
    }
}

async function insert_script_by_id(id) {
    let script = await get_script_by_id(id);

    return insert_script(script);
}



function get_random_id() {
    return get_random_integer(100, 9999999);
}

function create_script_obj(form_data, id = get_random_id()) {
    let script = Object.assign({
        name: 'default',
        is_disabled: false,
        css_code: '',
        js_code: 'alert("default")',
        match_patterns: []
    }, form_data);

    script.id = id;
    script.is_disabled = !!script.is_disabled;
    script.match_patterns = script.match_patterns.filter(item => item);

    return script;
}

function save_all_scripts(scripts) {
    chrome.storage.local.set({scripts});
}

async function save_script(script_obj) {
    let scripts = await get_all_scripts(),
        script = create_script_obj(script_obj);

    scripts.push(script);
    
    save_all_scripts(scripts);

    return script;
}

async function update_script_by_id(id, script_obj) {
    let script = {},
        scripts = await get_all_scripts(),
        index = scripts.findIndex(item => item.id == id);

    if (index >= 0) {
        script = scripts[index] = create_script_obj(script_obj, id)

        save_all_scripts(scripts);
    }

    return script;
}

async function remove_script_by_id(id) {
    let scripts = await get_all_scripts(),
        index = scripts.findIndex(item => item.id == id);

    scripts.splice(index, 1);

    save_all_scripts(scripts);

    return id;
}



async function export_script_json() {
    let scripts = await get_all_scripts();

    return JSON.stringify(scripts, null, 0);
}

async function import_script_json(json) {
    let scripts = await get_all_scripts(),
        import_scripts = JSON.parse(json);

    if (Array.isArray(import_scripts)) {
        import_scripts.forEach(function(script) {
            script = create_script_obj(script);

            scripts.push(script);
        });

        save_all_scripts(scripts);
    }
}