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
    get_all_scripts().then(function(scripts) {
        if (!scripts.length) {
            $('.list').html('<p>Скриптов не найдено</p>');
            return;
        }

        scripts.forEach(function(item) {
            let item_html = get_item_markup(item);

            $('.list').prepend(item_html);
        });
    });
});


function get_item_markup(data) {
    let item = $('<div class="item"></div>');

    item.attr('data-id', data.id);
    item.append('<div class="title">' + data.name + '</div>');
    item.append(`<div class="action">
        <a href="#">Встроить</a>
    </div>`);

    return item;
}