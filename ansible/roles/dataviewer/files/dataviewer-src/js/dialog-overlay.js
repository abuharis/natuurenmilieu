const dialogOverlayId = 'dialog-overlay';
const dialogOverlayClose = 'dialog-overlay-close';
let onOverlayClose;

function openOverlayDialog(origin, title, content, footer, onClose) {
    if(getOverlay()){
        closeOverlayDialog();
    }

    const container = document.createElement('div');
    container.setAttribute('id', dialogOverlayId);
    container.setAttribute('class', 'overlay-dialog');
    container.setAttribute('origin', origin);
    container.innerHTML = `
        <div class="overlay-dialog-header text-blue">${title}</div>
        <div id="${dialogOverlayClose}" class="overlay-dialog-close" onclick="closeOverlayDialog()">
            <img src="./img/close-icon.svg"/>
        </div>
        <div class="overlay-dialog-content">
            ${content}
        </div>
        <div class="overlay-dialog-footer">${footer ?? ''}</div>
    `;
    onOverlayClose = onClose;

    document.body.appendChild(container);   
}

function closeOverlayDialog() {
    const element = getOverlay();
    if(onOverlayClose) {
        onOverlayClose();
    }

    if(element){
        document.body.removeChild(element);
    }
}

function getOverlay() {
    return document.getElementById(dialogOverlayId);
}