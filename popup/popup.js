$('.list').delegate('a', 'click', function(event) {
    event.preventDefault();

    let id = $(this).parents('.item').attr('data-id');        

    insert_script_by_id(id).then(function() {
        window.close();
    });
});

$('.to-options').click(function(event) {
    event.preventDefault();

    chrome.runtime.openOptionsPage();
});

$(document).ready(function() {
    let to_opt_height = $('.to-options').outerHeight();

    $('.list').css('margin-top', to_opt_height);


    get_all_scripts_with_sticky_sort().then(function(scripts) {
        if (!scripts.length) {
            $('.list').html('<p>' + get_locale_message('__MSG_popup_scriptsnotfound__') + '</p>');
            return;
        }

        scripts.forEach(function(item) {
            let item_html = get_item_markup(item);

            $('.list').prepend(item_html);
        });
    });

    i18n_init();
});


function get_item_markup(data) {
    let item = $('<div class="item"></div>');

    item.attr('data-id', data.id);
    item.append('<div class="title">' + data.name + '</div>');
    item.append(`<div class="action">
        <a href="#">` + get_locale_message('__MSG_popup_embed_btn__') + `</a>
    </div>`);

    return item;
}