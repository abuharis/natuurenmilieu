const downloadDialog = (() => {
    const options = {
        id: 'nav-download-button',
        parentId: 'nav-download',
        buttonClass: 'download-dialog-button',
        iconUrl: './img/nav-download.svg',  // string
        onClick: onClick,  // callback function
        doToggle: false,  // bool
        toggleStatus: false,  // bool
    };

    function onClick() {
        if(getDialog()){
            closeDownloadialog();
            return;
        }

        navUtils.unselectOtherNavOptions('download');
        const container = document.createElement('div');
        container.setAttribute('id', `${options.id}-dialog`);
        container.setAttribute('class', 'download-dialog');
        container.innerHTML = `
            <div class="text-blue">DOWNLOAD LAYERS</div>
            <div class="download-dialog-close" onclick="closeDownloadialog()">
                <img src="./img/close-icon.svg">
            </div>
            <div class="download-options">
                ${getDownloadButtons(links)}             
            </div>
        `;


        document.getElementById(options.parentId).appendChild(container);
        var icon = document.getElementById(downloadDialog.options.id);
        icon.classList.add('icon-selected');
    }

    function getDownloadButtons(links) {
        return links.map((link) => {
            return `
                <div class="download-button"><a href=${link.url}>Download ${link.name}</a></div>
            `;
        }).join('')
            
    }

    function getDialog() {
        return document.getElementById(`${options.id}-dialog`);
    }
    

    return {
        options,
        getDialog
    };
})();

function closeDownloadialog() {
    const element = downloadDialog.getDialog();
   
    if(element){
        const navIcon = document.getElementById(downloadDialog.options.id)
        navIcon.classList.remove('icon-selected')
        document.getElementById(downloadDialog.options.parentId).removeChild(element);   
    }
}

var links = [
    {
        name: 'BMA 2021',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Abma_2021_toxischedruk&outputFormat=csv'
    },
    {
        name: 'BMA 2022',
        url:'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Abma_2022_toxischedruk&outputFormat=csv'
    },
    {
        name: 'BMA 2023',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Abma_2023_toxischedruk&outputFormat=csv'
    },
    {
        name: 'Burgerwetenschap 2021',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Awatermonsters_2021&outputFormat=csv'
    },
    {
        name: 'Burgerwetenschap 2022',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Awatermonsters_2022&outputFormat=csv'
    },
    {
        name: 'Burgerwetenschap 2023',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Awatermonsters_2023&outputFormat=csv'
    },
    {
        name: 'Waterkwaliteit KRW 2021',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Akrw_2021&outputFormat=csv'
    },
    {
        name: 'Waterkwaliteit KRW 2022',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Akrw_2022&outputFormat=csv'
    },
    {
        name: 'Waterkwaliteit KRW 2023',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Akrw_2023&outputFormat=csv'
    },
    {
        name: 'Stikstof 2021',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Antot_per_m2&outputFormat=csv'
    },
    {
        name: 'Fosfor 2021',
        url: 'https://geoserver-natuur-milieu.domains.leaf.cloud/geoserver/NatuurMilieu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Aptot_per_m2&outputFormat=csv'
    },
]