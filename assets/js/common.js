$('.tabs').on('click', '.tab-btn:not(.active)', function(event) {
    event.preventDefault();

    $(this)
        .addClass('active').siblings().removeClass('active')
        .closest('.tabs').find('.tab-content').removeClass('active').eq($(this).index()).addClass('active');
});

function get_random_integer(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);

    return Math.round(rand);
}

function set_night_theme() {
    let hours = new Date().getHours();

    /* between 8 and 18 hourses */
    if ((hours >= 0 && hours <= 8) || (hours >= 18 && hours <= 23)) {
        $('body').addClass('nigth-mode');
    }
}

function init_codemirror(selector, mode) {
    let textarea = document.querySelector(selector),
        codemirror = CodeMirror.fromTextArea(textarea, {
            theme: 'one-dark',
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
        });
    
    codemirror.isDirty = false;
    // codemirror.setSize('100%', 500);
    codemirror.setSize('100%', 800);

    codemirror.on('change', function(editor) {
        editor.isDirty = true;
        textarea.value = editor.getValue();
    });

    codemirror.on('keyup', function (cm, event) {
        if (!cm.state.completionActive && event.keyCode > 64 && event.keyCode < 91) {
            CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
        }
    });

    emmetCodeMirror(codemirror);

    return codemirror;
}

function show_alert({type = 'info', message = 'Notice'} = {}) {
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
    alert.append('<div class="text">' + message + '</div>');
    alert.append('<div class="close">&times;</div>');
    alert.find('.close').click(hide);    
    $('body').append(alert);

    update_positions();

    timer_hide = setTimeout(function() {
        hide();
    }, 10 * 1000);
}