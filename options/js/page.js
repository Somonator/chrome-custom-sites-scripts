let $add_form = $('#add_script'),
    $json_form = $('#json-form'),
    $scripts_list = $('.list-scripts tbody'),
    cm_css, cm_js;



set_night_mode();

$add_form.submit(function(event) {
    event.preventDefault();

    let form_data = $(this).serializeObject();

    if (!cm_css.getValue() && !cm_js.getValue()) {
        show_alert({
            type: 'error',
            notice: 'Код не может быть пустым'
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
            
            $scripts_list.prepend(item_html);   
        });
    }
    
    $(this).trigger('reset');

    show_alert({
        type: 'success',
        notice: form_data.id ? 'Скрипт обновлен' : 'Скрипт добавлен'
    });
});

$add_form.on('reset', function(event) {
    $(this).find('.sub-title span').html('');
    $(this).find('[name="id"]').removeAttr('value');
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

    repeater_last.find('input').val('');
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

    $(this).parents('.field-wrap').find('input').eq(0).focus();
    document.execCommand('insertText', false, '<all_urls>'); // enable ctrl + z
});

$add_form.find('.reset-form').click(function(event) {
    event.preventDefault();

    $(this).parents('form').trigger('reset');
});



$scripts_list.delegate('.edit', 'click', function(event) {
    event.preventDefault();

    let id = $(this).parents('tr').attr('data-id');
    
    $add_form.trigger('reset');

    get_script_by_id(id).then(function(script) {
        $.each(script, function(index, element) {
            if (Array.isArray(element)) {
                element.forEach(function(element, i) {
                    if (i != 0) $add_form.find('[name="' + index + '[]"]').parents('.field-wrap').find('.add-repeater-field').click();

                    $add_form.find('[name="' + index + '[]"]').eq(i).prop('checked', element);
                    $add_form.find('[name="' + index + '[]"]').eq(i).val(element); 
                });
            } else {
                $add_form.find('[name="' + index + '"]').prop('checked', element);
                $add_form.find('[name="' + index + '"]').val(element);             
            }
        });

        cm_css.setValue(script.css_code ? script.css_code : '');
        cm_js.setValue(script.js_code ? script.js_code : '');

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

    remove_script_by_id(id).then(function(id) {
        tr.remove();

        show_alert({
            type: 'info',
            notice: 'Скрипт удален'
        });        
    });
});



$('#to-json').click(function(event) {
    event.preventDefault();

    $json_form.slideToggle(400, function() {
        if ($(this).is(':visible')) {
            window.scrollTo({
                top: $(this).offset().top,
                behavior: 'smooth'
            });
        }
    });
});

$json_form.find('[name="export"]').click(function(event) {
    event.preventDefault();

    let form = $(this).parents('form');

    export_script_json().then(function(json) {
        form.find('[name="json"]').val(json);

        navigator.clipboard.writeText(json); // copy to clipboard

        show_alert({
            type: 'info',
            notice: 'JSON скопирован в буфер обмена'
        });
    });
});

$json_form.find('[name="import"]').click(function(event) {
    event.preventDefault();

    let json = $json_form.find('[name="json"]').val();

    import_script_json(json).then(function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        setTimeout(function() {
            location.reload();
        }, 900);
    });
});



$(document).ready(function() {
    cm_css = init_codemirror('#css_code', 'css');
    cm_js = init_codemirror('#js_code', 'javascript');


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



function get_serialize_object(form) {
    let serialize_array = $(form).serializeArray(),
        formData = {};
    
    $.each(serialize_array, function(i, field){
        if (field.value.trim() !== '') {
            formData[field.name] = field.value;
        }
    });
    
    return formData;
}

function init_codemirror(selector, mode) {
    let textarea = document.querySelector(selector),
        codemirror = CodeMirror.fromTextArea(textarea, {
            theme: 'monokai',
            mode: mode,
            inputStyle: 'contenteditable',
            direction: 'ltr',
            indentWithTabs: true,        
            indentUnit: 4,
            tabSize: 4,        
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,            
            matchBrackets: true,
            continueComments: true,
            styleActiveLine: true,       
            saveCursorPosition: true,
            viewportMargin: Infinity,
            lint: false,
            gutters: [],
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-\/": "toggleComment",
                "Cmd-\/": "toggleComment",
                "Alt-F": "findPersistent",
                "Ctrl-F": "findPersistent",
                "Cmd-F": "findPersistent"
            }
        }),
        is_disable_blur = false;
    
    codemirror.isDirty = false;
    codemirror.setSize('100%', 150);

    codemirror.on('change', function(editor) {
        editor.isDirty = true;
        textarea.value = editor.getValue();
    });

    codemirror.on('keyup', function (cm, event) {
        if (!cm.state.completionActive && event.keyCode > 64 && event.keyCode < 91) {
            CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
        }
    });

    codemirror.on('focus', function (cm, event) {
        cm.setSize('100%', 500);
    });
    
    codemirror.on('blur', function (cm, event) {
        if (is_disable_blur) return;

        cm.setSize('100%', 150);
    });

    document.addEventListener('mousedown', function(event) {
        is_disable_blur = !!event.target.closest('.CodeMirror');
    });    

    return codemirror;
}

function get_script_markup(script_obj) {
    let item = $('<tr></tr>');

    item.attr('data-id', script_obj.id);
    item.append('<td>' + script_obj.name + '</td>');
    item.append(`<td>
        <div class="manage">
            <span class="edit" title="Изменить данные">✎</span>
            <span class="delete" title="Удалить">✖</span>
        </div>
    </td>`);

    return item;
}

function set_night_mode() {
    let hours = new Date().getHours();

    /* между 8 и 18 часами */
    if ((hours >= 0 && hours <= 8) || (hours >= 18 && hours <= 23)) {
        $('body').addClass('nigth-mode');
    }
}

function show_alert({type = 'info', notice = 'Уведомление'} = {}) {
    let alert = $('<div class="alert"></div>'),
        hide = function() {
            alert.fadeOut(300, function() {
                $(this).remove();

                update_positions();
                
                clearTimeout(timer_hide);
            });
        },
        update_positions = function() {
            let _bottom = 20;

            $('.alert').each(function() {
                $(this).dequeue().animate({
                    bottom: _bottom
                }, 300);

                _bottom += $(this).outerHeight() + 20;
            });            
        },
        timer_hide;
    
    alert.addClass(type);
    alert.append('<span class="text">' + notice + '</span>');
    alert.append('<span class="close">&times;</span>');
    alert.find('.close').click(hide);    
    $('body').append(alert);

    update_positions();

    timer_hide = setTimeout(function() {
        hide();
    }, 10 * 1000);
}



$.fn.serializeObject = function() {
    var data = {};

    function buildInputObject(arr, val) {
        if (arr.length < 1) {
            return val;  
        }
        var objkey = arr[0];
        if (objkey.slice(-1) == "]") {
            objkey = objkey.slice(0,-1);
        }  
        var result = {};
        if (arr.length == 1){
            result[objkey] = val;
        } else {
            arr.shift();
            var nestedVal = buildInputObject(arr,val);
            result[objkey] = nestedVal;
        }
        return result;
    }

    function gatherMultipleValues( that ) {
        var final_array = [];
        $.each(that.serializeArray(), function( key, field ) {
            // Copy normal fields to final array without changes
            if( field.name.indexOf('[]') < 0 ){
                final_array.push( field );
                return true; // That's it, jump to next iteration
            }

            // Remove "[]" from the field name
            var field_name = field.name.split('[]')[0];

            // Add the field value in its array of values
            var has_value = false;
            $.each( final_array, function( final_key, final_field ){
                if( final_field.name === field_name ) {
                    has_value = true;
                    final_array[ final_key ][ 'value' ].push( field.value );
                }
            });
            // If it doesn't exist yet, create the field's array of values
            if( ! has_value ) {
                final_array.push( { 'name': field_name, 'value': [ field.value ] } );
            }
        });
        return final_array;
    }

    // Manage fields allowing multiple values first (they contain "[]" in their name)
    var final_array = gatherMultipleValues( this );

    // Then, create the object
    $.each(final_array, function() {
        var val = this.value;
        var c = this.name.split('[');
        var a = buildInputObject(c, val);
        $.extend(true, data, a);
    });

    return data;
};