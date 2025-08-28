/**
 * Returns an HTML link that switches to the specified tab in the tabbed popup when clicked.
 * @param {string} tabName - The data-tab value of the tab to switch to (e.g., 'tab2').
 * @param {string} [label] - Optional link text. Defaults to 'Bekijk emissie per sector'.
 */
function createTabSwitchLink(tabName, label) {
    const linkText = label || 'Bekijk emissie per sector';
    // The link will find the tab button and trigger a click
    return `<a href="#" onclick="(function(){
        var overlay = document.getElementById('dialog-overlay');
        if (!overlay) return false;
        var tabBtn = overlay.querySelector('.tabbed-popup-tab[data-tab=\'${tabName}\']');
        if (tabBtn) tabBtn.click();
        return false;
    })(); return false;">${linkText}</a>`;
}

const tabbedPopup = (() => {
    function createTabs(tabsConfig) {
        const tabsHtml = tabsConfig.map((tab, index) => {
            const activeClass = index === 0 ? 'active' : '';
            return `<div class="tab ${activeClass}" data-tab-id="${tab.id}">${tab.title}</div>`;
        }).join('');
        
        return `
            <div class="tabs-container">
                ${tabsHtml}
            </div>
        `;
    }

    function createTabContent(tabsConfig) {
        const contentHtml = tabsConfig.map((tab, index) => {
            const activeClass = index === 0 ? 'active' : '';
            return `
                <div class="tab-content ${activeClass}" id="${tab.id}">
                    ${tab.content}
                </div>
            `;
        }).join('');
        
        return `
            <div class="tab-content-container">
                ${contentHtml}
            </div>
        `;
    }

    function initializeTabs(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        const tabs = container.querySelectorAll('.tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and content
                tabs.forEach(t => t.classList.remove('active'));
                const tabContents = container.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab-id');
                const activeContent = container.querySelector(`#${tabId}`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }

    function createTabbedPopup(id, title, tabsConfig) {
        const tabsHtml = createTabs(tabsConfig);
        const contentHtml = createTabContent(tabsConfig);
        
        return `
            <div class="tabbed-popup" id="tabbed-popup-${id}">
                ${popup.createTitle(title)}
                <div class="tabbed-popup-body">
                    ${tabsHtml}
                    ${contentHtml}
                </div>
            </div>
        `;
    }

    function openTabbedInformation(id, title, tabsConfig) {
        const popupContent = createTabbedPopup(id, title, tabsConfig);
        openOverlayDialog(id, title, popupContent);
        initializeTabs(`#overlay-dialog-content-${id}`);
    }
    
    function getTabbedPopupTitle(id, title) {
        // Check for fosfor or stikstof first
        if (title && (title.toLowerCase().includes('fosfor') || title.toLowerCase().includes('stikstof'))) {
            return 'Meer over Stickstof (N-totaal) of Fosfor (P-totaal) Emissie';
        }

        const krwMatch = (title && title.match(/KRW ?20(21|22|23)/i)) || (id && id.match(/KRW ?20(21|22|23)/i));
        if (krwMatch) {
            const year = krwMatch[0].replace(/\s+/g, '').toUpperCase();
            const newTitle = `Meer over ${year}`;
            return newTitle;
        }

        if (title) {
            return title;
        }

        return 'Meer over Stickstof (N-totaal) of Fosfor (P-totaal) Emissie';
    }

    // Helper function to create the KRW Oordelen table HTML
    function createKRWTableHTML(properties) {
        const oordelenMapping = [
            { label: 'Eindoordeel oppervlaktewater', prop: 'eindoordeel_oppervlaktewater_oordeel' },
            { label: 'Biologie totaal', prop: 'biologie_totaal_oordeel' },
            { label: 'Chemische toestand', prop: 'chemische_toestand_oordeel' },
            { label: 'Ecologie toestand of potentieel', prop: 'ecologische_toestand_oordeel' },
            { label: 'Algemene fysisch-chemische parameters', prop: 'fysisch_chemisch_algemeen_oordeel' },
            { label: 'Macrofauna-kwaliteit', prop: 'macrofauna_oordeel' },
            { label: 'Nutriënten', prop: 'nutriënten_oordeel' },
            { label: 'Overige waterflora-kwaliteit', prop: 'overige_waterflora_oordeel' },
            { label: 'Specifieke verontreinigende stoffen', prop: 'verontreinigende_stoffen_oordeel' },
            { label: 'Prioritaire stoffen - nieuw vanaf 2013 - nr. 34 t/m 45', prop: 'prioritaire_stoffen_nieuw_oordeel' },
            { label: 'Prioritaire stoffen - ubiquitair', prop: 'prioritaire_stoffen_ubiquitair_oordeel' },
            { label: 'Prioritaire stoffen - niet-ubiquitair', prop: 'prioritaire_stoffen_niet_ubiquitair_oordeel' },
            { label: 'Vis-kwaliteit', prop: 'vis_oordeel' },
            { label: 'Fytoplankton-kwaliteit', prop: 'fytoplankton_oordeel' },
            { label: 'Doorzicht', prop: 'doorzicht_oordeel' }
        ];

        const rows = oordelenMapping.map(item => {
            const value = properties[item.prop] || 'N/A'; // Get value or default to N/A
            return `<tr><td>${item.label}</td><td>${value}</td></tr>`;
        }).join('');

        // Split rows into two columns
        const mid = Math.ceil(oordelenMapping.length / 2);
        const leftRows = oordelenMapping.slice(0, mid).map(item => {
            const value = properties[item.prop] || 'N/A';
            return `<tr><td>${item.label}</td><td>${value}</td></tr>`;
        }).join('');
        const rightRows = oordelenMapping.slice(mid).map(item => {
            const value = properties[item.prop] || 'N/A';
            return `<tr><td>${item.label}</td><td>${value}</td></tr>`;
        }).join('');

        return `
            <div class="emission-popup">
                <div class="emission-title">Alle KRW-oordelen</div>
                <div class="emission-columns">
                    <div class="emission-column left">
                        <table>
                            <thead>
                                <tr><th>Omschrijving type analyse</th><th>Oordeel</th></tr>
                            </thead>
                            <tbody>${leftRows}</tbody>
                        </table>
                    </div>
                    <div class="emission-column right">
                        <table>
                            <thead>
                                <tr><th>Omschrijving type analyse</th><th>Oordeel</th></tr>
                            </thead>
                            <tbody>${rightRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function fetchEmissionDataFromGeoServer(layerName, properties) {
        return new Promise((resolve) => {
            if (!properties) {
                resolve({ sectors: [], total: { sector: 'TOTAAL (Alle sectoren)', emissie: 'N/A' } });
                return;
            }

            const sectorMapping = {
                'Afvalverwijdering': { emissie: 'afvalverwijdering_emissie' },
                'Bouw': { emissie: 'bouw_emissie' },
                'Chemische Industrie': { emissie: 'chemische_industrie_emissie' },
                'Consumenten': { emissie: 'consumenten_emissie' },
                'Energiesector': { emissie: 'energiesector_emissie' },
                'Handel, Diensten en Overheid (HDO)': { emissie: 'handel_diensten_en_overheid_emissie' },
                'Landbouw': { emissie: 'landbouw_emissie' },
                'Natuur': { emissie: 'natuur_emissie' },
                'Raffinaderijen': { emissie: 'raffinaderijen_emissie' },
                'Riolering en waterzuiveringsinstallaties': { emissie: 'riolering_en_waterzuiveringsinstallaties_emissie' },
                'Verkeer en vervoer': { emissie: 'verkeer_en_vervoer_emissie' },
                'Overige industrie': { emissie: 'overige_industrie_emissie' },
                'Overig': { emissie: 'overig_emissie' },
                'TOTAAL (Alle sectoren)': { emissie: 'emissie' }
            };

            const sectors = Object.keys(sectorMapping).map(sector => {
                const props = sectorMapping[sector];
                return {
                    sector,
                    emissie: properties[props.emissie] || 'N/A'
                };
            });

            const total = sectors.find(s => s.sector === 'TOTAAL (Alle sectoren)');
            resolve({ sectors, total });
        });
    }

    function openTabbedPopup(id, leftFields, rightFields, additionalInfoField, title, properties) {
        const fixedTitle = getTabbedPopupTitle(id, title);
        const isKRWPopup = fixedTitle.startsWith('Meer over KRW');

        const tab1Name = isKRWPopup ? 'Toelichting' : 'Bronnen van vervuiling';
        const tab2Name = isKRWPopup ? 'Alle KRW-oordelen' : 'Emissieoorzaak';

        const tabHeaders = `
            <div class="tabbed-popup-tabs">
                <button class="tabbed-popup-tab active" data-tab="tab1" type="button">${tab1Name}</button>
                <button class="tabbed-popup-tab" data-tab="tab2" type="button">${tab2Name}</button>
            </div>
        `;

        // Generate Tab 2 content based on popup type
        let tab2ContentHTML;
        if (isKRWPopup && properties) {
            tab2ContentHTML = createKRWTableHTML(properties);
        } else {
            tab2ContentHTML = `
                <div class="emission-popup">
                    <div class="emission-title">Emissie per sector</div>
                    <div class="emission-columns">
                        <div class="emission-column left">
                            <table>
                                <thead>
                                    <tr><th>Sector</th><th>Emissie (kg)</th></tr>
                                </thead>
                                <tbody id="emission-left-body"></tbody>
                            </table>
                        </div>
                        <div class="emission-column right">
                            <table>
                                <thead>
                                    <tr><th>Sector</th><th>Emissie (kg)</th></tr>
                                </thead>
                                <tbody id="emission-right-body"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        const tabContents = `
            <div class="tabbed-popup-content tabbed-popup-content-tab1 active">
                <div class="more-info-content-item more-info-content-left">
                    ${createMoreInfoContentFields(leftFields)}
                </div>
                <div class="more-info-content-item more-info-content-right">
                    ${createMoreInfoContentFields(rightFields)}
                    <div class="more-info-additional-info">
                        ${createMoreInfoContentField(additionalInfoField.title, additionalInfoField.content)}
                    </div>
                </div>
            </div>
            <div class="tabbed-popup-content tabbed-popup-content-tab2">
                <div class="tab-2-content">
                    ${tab2ContentHTML} 
                </div>
            </div>
        `;

        const content = `
            <div class="tabbed-popup">
                ${tabHeaders}
                ${tabContents}
            </div>
        `;

        openOverlayDialog(id, fixedTitle, content);

        setTimeout(() => {
            const dialogOverlay = document.getElementById('dialog-overlay');
            if (!dialogOverlay) return;

            const tabs = dialogOverlay.querySelectorAll('.tabbed-popup-tab');
            const contents = dialogOverlay.querySelectorAll('.tabbed-popup-content');

            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    tabs.forEach(t => t.classList.remove('active'));
                    contents.forEach(c => c.classList.remove('active'));
                    tab.classList.add('active');
                    const tabName = tab.getAttribute('data-tab');
                    dialogOverlay.querySelector('.tabbed-popup-content-' + tabName).classList.add('active');
                });
            });

            if (!isKRWPopup) {
                fetchEmissionDataFromGeoServer(id.includes('Stikstof') ? 'ntot_per_m2' : 'ptot_per_m2', properties)
                    .then(data => {
                        // Filter out the total from sectors array to prevent duplication
                        const sectors = data.sectors.filter(s => s.sector !== 'TOTAAL (Alle sectoren)');
                        const mid = Math.ceil(sectors.length / 2);
                        const left = sectors.slice(0, mid);
                        const right = sectors.slice(mid);

                        const leftBody = dialogOverlay.querySelector('#emission-left-body');
                        const rightBody = dialogOverlay.querySelector('#emission-right-body');

                        const makeRow = (item) => {
                            const emissions = [];
                            if (item.emissie !== 'N/A') emissions.push(`${item.emissie}`);
                            
                            return `<tr>
                                <td>${item.sector}</td>
                                <td>${emissions.join(', ') || ''}</td>
                            </tr>`;
                        };

                        if (leftBody) leftBody.innerHTML = left.map(makeRow).join('');
                        if (rightBody) {
                            rightBody.innerHTML = right.map(makeRow).join('');
                            
                            if (data.total) {
                                const totalEmissions = [];
                                if (data.total.emissie !== 'N/A') totalEmissions.push(data.total.emissie);
                                
                                rightBody.innerHTML += `<tr class="totals">
                                    <td>${data.total.sector}</td>
                                    <td>${totalEmissions.join(', ') || ''}</td>
                                </tr>`;
                            }
                        }
                    });
            }
        }, 50);
    }

    return {
        createTabs,
        createTabContent,
        initializeTabs,
        createTabbedPopup,
        openTabbedInformation,
        openTabbedPopup,
        createTabSwitchLink
    };
})();
window.createTabSwitchLink = tabbedPopup.createTabSwitchLink;
