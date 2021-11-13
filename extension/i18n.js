/**
 * @param {string} msg "__MSG_Hello__para1,para2|1"  or "__MSG_Hello__para1,para2|0"
 * */
function convertMsgAsFuncPara(msg) {
    let match = /__MSG_(?<id>\w+)__(?<para>[^|]*)?(\|(?<escapeLt>[01]{1}))?/g.exec(msg);

    if (match) {
        let {groups: {id, para, escapeLt}} = match

        para = para ?? '';
        escapeLt = escapeLt ?? false;

        return [id, para.split(','), Boolean(Number(escapeLt))];
    }

    return [undefined];
}

function get_locale_code() {
    return chrome.i18n.getUILanguage();
}

function get_locale_message(msg) {
    let [id, paraArray, escapeLt] = convertMsgAsFuncPara(msg);

    return chrome.i18n.getMessage(id, paraArray, {escapeLt});
}

function handle_i18n_node(msgNode) {
    let [id, paraArray, escapeLt] = convertMsgAsFuncPara(msgNode.getAttribute('data-i18n'));

    if (id) {
        let locale_message = chrome.i18n.getMessage(id, paraArray, {escapeLt});

        if (msgNode.nodeName.toLowerCase() === 'replace') {
            msgNode.replaceWith(document.createTextNode(locale_message));
        } else {
            msgNode.innerHTML = locale_message;
        }
    }

    for (let attr of msgNode.attributes) {
        let [attrName, attrValue] = [attr.nodeName, attr.nodeValue];
        let [id, paraArray, escapeLt] = convertMsgAsFuncPara(attrValue);

        if (!id) continue;

        msgNode.setAttribute(attrName, chrome.i18n.getMessage(id, paraArray, {escapeLt}));
    }
}

function i18n_init() {
    let msg_nodes = document.querySelectorAll(`[data-i18n]`);

    document.documentElement.setAttribute('lang', get_locale_code());
    msg_nodes.forEach(handle_i18n_node);
}