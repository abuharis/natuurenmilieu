const infoDialog = (() =>{
    const options = {
        id: 'nav-info',
        class: 'nav-info-icon',
        //   'text': 'info',  // string
        iconUrl: './img/nav-info.svg',  // string
        onClick: openInfoDialog,  // callback function
        //   'hideText': true,  // bool
        //   'maxWidth': 32,  // number
        doToggle: false,  // bool
        toggleStatus: false  // bool
    };

    function openInfoDialog(event) {
        event.preventDefault();
        const icon = event.target;
        // TODO make control button using leaflet and add svg to it
        // TODO make svg transparent
       
    
        // When dialog is already open, then close it and remove attributes/active class
        if(icon.hasAttribute('is-open')) {
            closeInfoDialog();
            closeOverlayDialog();
            return;
        } else {
            navUtils.unselectOtherNavOptions('info');
            setOpenInfoDialog();
            openOverlayDialog(
                options.id,
                'Informatie - Hoe werkt de Dataviewer kaart?', 
                `
                    <div class="info-dialog-content">
                        <div class="info-dialog-heading">De Water op de Kaart Dataviewer is medegefinancierd door TAUW Foundation.</div>
                        <div class="info-dialog-disclamer text-blue">Disclamer</div>
                        <div class="info-dialog-disclamer-text">
                            De Water op de Kaart Dataviewer geeft waterkwaliteitsgerelateerde data weer afkomstig uit verschillende openbare bronnen en de data die verzameld is tijdens de jaarlijkse burgerwetenschapscampagnes in het project "Vang de Watermonsters". Natuur & Milieu en NIOO-KNAW zijn uiterst zorgvuldig omgegaan bij het ontwikkelen en actualiseren van deze dataviewer. Desondanks kunnen Natuur & Milieu en NIOO-KNAW geen aansprakelijkheid aanvaarden voor de gegevens en informatie. Aan de gegevens en informatie kunnen geen rechten worden ontleend. NIOO-KNAW en Natuur & Milieu aanvaarden geen aansprakelijkheid voor schade als gevolg van onjuistheden of onvolledigheden in de informatie en gegevens op deze website.
                        </div>
                    </div>
                `,
                undefined,
                () => closeInfoDialog()
            );        
        }
    }
    
    function closeInfoDialog() {
        const icon = getIconElement();
    
        icon?.removeAttribute('is-open');
        icon?.classList.remove('active');
    }
    
    function setOpenInfoDialog() {
        const icon = getIconElement();
    
        icon?.classList.add('active');
        icon?.setAttribute('is-open', true);
    }
    
    function getIconElement() {
        return document.getElementById(`${options.id}-icon`);
    }

    return {
        options
    };
})();


