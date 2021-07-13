function get_random_integer(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);

    return Math.round(rand);
}



async function get_memory_state() {
    return new Promise(function(resolve, reject) {
        let state = {
            use: 0,
            of: 0
        };

        chrome.storage.local.getBytesInUse(null, function (number) {
            state.use = number / 1000;
            state.of = chrome.storage.local.QUOTA_BYTES / 1000;
            
            resolve(state);
        });
    });
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
        scripts_with_patterns = scripts.filter(
            item => Array.isArray(item.match_patterns) && item.match_patterns.length && item.is_disabled === undefined
        );

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



function get_random_id() {
    return get_random_integer(100, 9999999);
}

function create_script_obj(form_data, id = get_random_id()) {
    let script = Object.assign({ // default
        name: 'default',
        is_disabled: false,
        match_patterns: [],
        css_run_at: 'document_start',
        css_remote_files: [],
        css_code: '',
        js_run_at: 'document_start',
        js_remote_files: [],
        js_code: 'alert("default")'
    }, form_data);

    script.id = id;

    // filters empty values for economy bytes
    for (let i in script) {
        if (Array.isArray(script[i])) {
            script[i] = script[i].filter(item => item);

            if (!script[i].length) {
                delete script[i];
            }
        } else if (i === 'is_disabled') {
            if (script[i] !== undefined && script[i] !== false) {
                script[i] = !!script[i];
            } else {
                delete script[i];
            }
        } else if (script[i] === '') {
            delete script[i];
        }
    }

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



function insert_script(script, tab_id = null) {
    chrome.tabs.executeScript(tab_id, {
        runAt: 'document_start',
        code: 'script_handler_css(' + JSON.stringify(script, null, 0) + ');'
    });

    chrome.tabs.executeScript(tab_id, {
        runAt: script.js_run_at,
        code: 'script_handler_js(' + JSON.stringify(script, null, 0) + ');'
    });
}

async function insert_script_by_id(id) {
    let script = await get_script_by_id(id);

    return insert_script(script);
}



async function export_script_json() {
    let scripts = await get_all_scripts();

    return JSON.stringify(scripts, null, 0);
}

async function import_script_json(json) {
    let scripts = await get_all_scripts(),
        import_scripts = JSON.parse(json);

    if (Array.isArray(import_scripts) && import_scripts.length) {
        import_scripts.forEach(function(script, i) {
            script = import_scripts[i] = create_script_obj(script);

            scripts.push(script);
        });

        save_all_scripts(scripts);

        return import_scripts;
    }

    return [];
}