const popup = (() => {
    function createLink(href, text) {
        if(!text) {
            text = 'Link'
        }
        
        return `<a href="${href}" target="_blank">${text}</a>`
    }

    return {
        createLink
    }
})()
function createTitle(text){
    return `
        <div class="pop-up-title">
            <div class="pop-up-title-content" title="${text}">${text}</div>
        </div>
    `;
}

function createMeetpuntCode(text){
    return `
        <b>Meetpunt code:</b>
        <div>
            <img src="./img/pop-up-code-icon.svg" class="pop-up-img">${text}</img>
        </div>
    `;
}

function createField(label, value){
    return `
        <span class="pop-up-body-title">${label}:</span>
        <div>${value}</div>
    `;
}

function createFields(fields){
    return fields.map(([label, value]) =>
        createField(label, value)
    ).join('</br>')
}

function createMoreButton(id) {
    return `
        <button 
            id="${id}" 
            class="pop-up-button">
            Meer informatie
        </button>
    `;
}

function createMoreInfoContentField(title, content) {
    return `
        <div class="more-info-content-field">
            <div class="more-info-content-field-title">${title}</div>
            <div lass="more-info-content-field-content">${content}</div>
        </div>
    `;
}

function createMoreInfoContentFields(contents) {
    return contents
        .map(([title, content]) => 
            createMoreInfoContentField(title, content)
        )
        .join('');
}

function openMoreInformation(id, title, leftFields, rightFields, additionalInfoField, properties) {
    // Check for KRW2021, KRW2022, KRW2023 in title (case-insensitive)
    const isKRW = title && /krw ?202[1-3]/i.test(title);
    if (
        (title && (title.toLowerCase().includes('fosfor') || title.toLowerCase().includes('stikstof'))) ||
        isKRW
    ) {
        if (typeof tabbedPopup === 'undefined' || typeof tabbedPopup.openTabbedPopup !== 'function') {
            openRegularPopup(id, title, leftFields, rightFields, additionalInfoField);
        } else {
            // Pass the title and properties parameters to openTabbedPopup
            tabbedPopup.openTabbedPopup(id, leftFields, rightFields, additionalInfoField, title, properties);
        }
    } else {
        openRegularPopup(id, title, leftFields, rightFields, additionalInfoField);
    }
}


function openRegularPopup(id, title, leftFields, rightFields, additionalInfoField) {
    openOverlayDialog(
        id,
        title, 
        `
            <div class="more-info-content-item more-info-content-left">
                ${createMoreInfoContentFields(leftFields)}
            </div>
            <div class="more-info-content-item more-info-content-right">
                ${createMoreInfoContentFields(rightFields)}
                <div class="more-info-additional-info">
                    ${createMoreInfoContentField(additionalInfoField.title, additionalInfoField.content)}
                </div>
            </div>
        `
    );
}

function getBMABody(element) {
    return `
        ${createMeetpuntCode(element.meetpunt_code)}
        </br>
        ${createFields([
            ['Meetjaar', element.jaar],
            ['Locatie', element.mlcident],
            ['Oordeel toxische druk', element.klasse_omschrijving],
            ['Waterbeheerder', element.wbhcode_omschrijving],
        ])}
    `;
}

function getWaterMonstersBody(element) {
    return `
        ${createMeetpuntCode(element.unieke_meetkit_code)}
        </br>
        ${createFields([
            ['Meetjaar', element.meetjaar],
            ['Eindoordeel', element.eindoordeel_totaal],
            ['Oordeel ecologische toestand', element.eindoordeel_est],
            ['Waterbeheerder', element.waterschap_meetpunt],
        ])}
    `;
}

function getKRWBody(element) {
    return `
        ${createMeetpuntCode(element.waterlichaam_identificatie)} 
        </br>
        ${createFields([
            ['Meetjaar', element.rapportagejaar],
            ['Locatie', element.waterlichaam_naam],
            ['Eindoordeel', element.eindoordeel_oppervlaktewater_oordeel],
            ['Ecologische toestand', element.ecologische_toestand_oordeel],
            ['Chemische toestand', element.chemische_toestand_oordeel],
        ])}
      `;
}

function getEmissieregistratieBody(element) {
    return `
        ${createFields([
            ['Meetjaar', element.jaar],
            ['Locatie', element.gebied],
            ['Totale emissie (kg)', element.emissie],
        ])}
        </br>
        ${createField('Omgerekend (mg per dag per m2)', `Totaal: ${element.emissiemg_perdag_perm2}`)}
    `;
  }

function getPopupTemplate(id, title, body) {
    return `
        ${createTitle(title)}
        <div class="pop-up-body">
            ${body}
            </br>
            ${createMoreButton(id)}
        </div>
    `;
}
