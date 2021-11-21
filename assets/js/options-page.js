let $add_form = $('#add_script'),
    $import_form = $('#json_form'),
    $scripts_list = $('.list-scripts tbody'),
    $to_json_btn = $('#to_json'),
    $to_help_btn = $('#to_help'),
    cm_css, cm_js;

set_night_theme();
i18n_init();


$add_form.find('.tabs').on('click', '.tab-btn:not(.active)', function(event) {
    event.preventDefault();

    if ($(cm_css.getWrapperElement()).is(':visible')) cm_css.refresh();
    if ($(cm_js.getWrapperElement()).is(':visible')) cm_js.refresh();
});

$add_form.submit(function(event) {
    event.preventDefault();

    let form_data = $(this).serializeObject(),
        not_valid = $(this).find(':invalid');

    if (not_valid.length) {
        not_valid.each(function() {
            let field_label = $(this).parents('.field-wrap').find('label').text(),
                validation_error = this.validationMessage || 'Invalid value.';;

            show_alert({
                type: 'error',
                message: get_locale_message('__MSG_options_alert_fielderror__') + ' "' + field_label + '":\n' + validation_error
            });
        });
        return;        
    }

    if (
        !($add_form.find('[name="css_remote_files[]"]').filter((i, el) => el.value).length || cm_css.getValue()) &&
        !($add_form.find('[name="js_remote_files[]"]').filter((i, el) => el.value).length || cm_js.getValue())
    ) {
        show_alert({
            type: 'error',
            message: get_locale_message('__MSG_options_alert_codeempty__')
        });
        return;
    }

    if (form_data.id) { // update
        update_script_by_id(form_data.id, form_data).then(function(script_obj) {
            let tr = $scripts_list.find('tr[data-id="' + script_obj.id + '"]');

            tr.find('td').eq(0).html(script_obj.name);
        });
    } else {
        save_script(form_data).then(function(script_obj) {
            let item_html = get_script_markup(script_obj);
            
            $add_form.find('.sub-title span').html('(' + script_obj.id + ')');
            $add_form.find('[name="id"]').val(script_obj.id);
            $add_form.find('.reset-form').show();
            $scripts_list.prepend(item_html);
        });
    }

    show_alert({
        type: 'success',
        message: form_data.id ? get_locale_message('__MSG_options_alert_scriptupdated__') : get_locale_message('__MSG_options_alert_scriptadded__')
    });
});

$add_form.on('reset', function(event) {
    $(this).find('.sub-title span').html('');
    $(this).find('[name="id"]').removeAttr('value');
    $(this).find('.tabs .tab-btn').eq(0).click();
    $(this).find('.field-wrap').each(function() {
        $(this).find('.repeater-field').not(':eq(-1)').remove();
        $(this).find('.repeater-field').find('.delete').hide();
    });

    cm_css.setValue('');
    cm_css.clearHistory();

    cm_js.setValue('');
    cm_js.clearHistory();

    $(this).find('.reset-form').hide();
});

$add_form.find('.add-repeater-field').click(function(event) {
    event.preventDefault();

    let field = $(this).parents('.field-wrap'),
        repeater_fields = field.find('.repeater-field'),
        repeater_last = repeater_fields.last().clone();
    
    repeater_last.find('input').removeAttr('id').val('');
    repeater_last.find('.delete').show();

    $(this).parent().before(repeater_last);

    repeater_fields.find('.delete').show();
});

$add_form.delegate('.repeater-field .delete', 'click', function(event) {
    event.preventDefault();

    let repeater_fields = $(this).parents('.field-wrap').find('.repeater-field');

    if (repeater_fields.length - 1 == 1) {
        repeater_fields.find('.delete').hide();
    }

    $(this).parents('.repeater-field').remove();
});

$add_form.find('.to-all-urls').click(function(event) {
    event.preventDefault();

    let pattern = '<all_urls>';

    $(this).parents('.field-wrap').find('input').last().val('').focus();
    document.execCommand('insertText', false, pattern); // enable ctrl + z
});

$add_form.find('.to-some-url').click(function(event) {
    event.preventDefault();

    let site_url = prompt('Введите адрес сайта', ''),
        pattern = site_url?.replace('https', '').replace('http', '').replace(/\/$/, '');

    if (pattern && pattern !== '') {
        pattern = '*' + pattern + '/*';
        
        $(this).parents('.field-wrap').find('input').last().val('').focus();
        document.execCommand('insertText', false, pattern); // enable ctrl + z
    }
});

$add_form.find('.reset-form').click(function(event) {
    event.preventDefault();

    $(this).parents('form').trigger('reset');
});



$scripts_list.delegate('.edit', 'click', function(event) {
    event.preventDefault();

    let tab_button = $(this).attr('data-lang'),
        tab_index = tab_button ? $('#tab_button_' + tab_button).index() : 0,
        id = $(this).parents('tr').attr('data-id'),
        id_in_form = $add_form.find('[name="id"]').val();
    
    if (id_in_form && id == id_in_form) {
        $add_form.find('.tabs .tab-btn').eq(tab_index).click();
        return;
    } else {
        $add_form.trigger('reset');
        $add_form.find('.tabs .tab-btn').eq(tab_index).click();
    }

    get_script_by_id(id).then(function(script) {
        $add_form.setFormFieldsData(script, function(name, value, i) {
            if (i != 0) $add_form.find('[name="' + name + '[]"]').parents('.field-wrap').find('.add-repeater-field').click();
        });

        cm_css.setValue(script.css_code ? script.css_code : '');
        cm_css.clearHistory();
        
        cm_js.setValue(script.js_code ? script.js_code : '');
        cm_js.clearHistory();

        $add_form.find('.sub-title span').html('(' + script.id + ')');
        $add_form.find('.reset-form').show();

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

$scripts_list.delegate('.delete', 'click', function(event) {
    event.preventDefault();

    let tr = $(this).parents('tr'),
        id = tr.attr('data-id');

    if (confirm(get_locale_message('__MSG_options_scriptslist_scriptremove_confirm__'))) {
        remove_script_by_id(id).then(function(id) {
            tr.remove();

            if ($add_form.find('[name="id"]').val() == id) {
                $add_form.trigger('reset');
            }

            show_alert({
                type: 'info',
                message: get_locale_message('__MSG_options_alert_scriptremoved__')
            });        
        });
    }
});



$to_json_btn.click(function(event) {
    event.preventDefault();

    $import_form.slideToggle(400, function() {
        if ($(this).is(':visible')) {
            window.scrollTo({
                top: $(this).offset().top,
                behavior: 'smooth'
            });
        }
    });
});

$to_help_btn.click(function(event) {
    event.preventDefault();

    window.open(chrome.runtime.getURL('help.html'), '_blank').focus();
});


$import_form.find('[name="export"]').click(function(event) {
    event.preventDefault();

    let form = $(this).parents('form');

    export_script_json().then(function(json) {
        form.find('[name="json"]').val(json);
        form.find('.submit-buttons').addClass('space-between');
        form.find('[name="download"]').show();
    });
});

$import_form.find('[name="download"]').click(function(event) {
    event.preventDefault();

    let form = $(this).parents('form'),
        export_json = form.find('[name="json"]').val();

    download(export_json, 'scs_export.json', 'application/json');
});

$import_form.find('[name="import"]').click(function(event) {
    event.preventDefault();

    let json = $import_form.find('[name="json"]').val();

    import_script_json(json).then(function(scripts) {
        if (!scripts) {
            show_alert({
                type: 'error',
                message: get_locale_message('__MSG_options_alert_invalidjson__')
            });
            return;
        }

        if (!scripts.length) {
            show_alert({
                type: 'warning',
                message: get_locale_message('__MSG_options_alert_scriptsnotfound__')
            });
            return;
        }

        scripts.forEach(function(item) {
            let item_html = get_script_markup(item);

            $scripts_list.prepend(item_html);
        });

        $import_form.find('[name="json"]').val('');

        show_alert({
            type: 'success',
            message: get_locale_message('__MSG_options_alert_importsuccess__')
        });
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});



$(document).on('keydown', function(event) {
    if (event.ctrlKey && event.which === 83) { // ctrl + s
        $add_form.submit();

        return false;
    }
});

$(document).ready(function() {
    cm_css = init_codemirror('#css_code', 'css');
    cm_js = init_codemirror('#js_code', 'javascript');

    $('.field-wrap').each(function() {
        let rand_id = 'field_' + get_random_integer(921, 99999999);

        $(this).find('> label').attr('for', rand_id);
        $(this).find('> :input').attr('id', rand_id);
        $(this).find('> .repeater-field :input:eq(0)').attr('id', rand_id);
    });

    get_all_scripts().then(function(scripts) {
        if (!scripts.length) {
            return;
        }

        scripts.forEach(function(item) {
            let item_html = get_script_markup(item);

            $scripts_list.prepend(item_html);
        });
    });
});


function get_script_markup(script_obj) {
    let item = $('<tr></tr>');

    item.attr('data-id', script_obj.id);
    item.append(`<td>` + script_obj.name + `</td>`);
    item.append(`<td>
        <div class="manage">
            <span class="edit dashicons dashicons-edit" title="` + get_locale_message('__MSG_options_scriptslist_dataedit_btn_title__') + `"></span>        
            <span data-lang="css" class="edit dashicons dashicons-edit" title="` + get_locale_message('__MSG_options_scriptslist_cssedit_btn_title__') + `"></span>
            <span data-lang="js" class="edit dashicons dashicons-edit" title="` + get_locale_message('__MSG_options_scriptslist_jsedit_btn_title__') + `"></span>
            <span class="delete dashicons dashicons-trash" title="` + get_locale_message('__MSG_options_scriptslist_scriptremove_btn_title__') + `"></span>
        </div>
    </td>`);

    return item;
}