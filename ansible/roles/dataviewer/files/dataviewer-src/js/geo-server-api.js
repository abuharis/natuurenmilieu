const geoServer = (() => {
    // Parameterizze this line with the domain name passed from the CICD pipeline.
    const apiUrl = `https://https://dataviewer.wateropdekaart.nioo.knaw.nl/geoserver/NatuurMilieu/`;

    const apiUrlOws = `${apiUrl}ows?`;
    const apiUrlWms = `${apiUrl}wms?`;
    const wfsService = {
        service: 'WFS',
        version: '1.0.0'
    };

    function getFeature(typename, callbackFnName) {
        if(!typename) {
            throw new Error('GeoServer - getFeature - missing typename')
        }
        if(!callbackFnName) {
            throw new Error('GeoServer - getFeature - missing callbackFnName')
        }

        $.ajax(
            apiUrlOws,
            {
                type: 'GET',
                data: {
                    ...wfsService,
                    request: 'GetFeature',
                    outputFormat: 'text/javascript',
                    typename,
                    srsname: 'EPSG:4326',
                },
                dataType: 'jsonp',
                jsonpCallback: `callback:${callbackFnName}`,
                jsonp: 'format_options',
                cache: true
            }
        );
    }

    function getOwsFeatureCsv(typename) {
        if(!typename) {
            throw new Error('GeoServer - getFeature - missing typename')
        }

        const urlTemplate = `${apiUrlOws}service=WFS&version=1.0.0&request=GetFeature&typeName=NatuurMilieu%3Awatermonsters_2021&maxFeatures=50&outputFormat=csv`

        // TODO rethink, maybe implement download via link href as it works
        $.ajax(            {
                url: urlTemplate,
                method: 'GET',
                xhrFields: {
                    responseType: 'blob'
                },
                success: function(response) {
                    // Handle the Blob response
                    const blob = new Blob([response], {type: 'text/csv;charset=utf-8;'});
    
                    if (navigator.msSaveBlob && navigator.msSaveBlob) {
                        // IE / Edge
                        navigator.msSaveBlob(blob, 'filename.csv');
                    } else {
                        // Other browsers
                        const link = document.createElement('a');
                        if (link.download !== undefined) {
                            const url = URL.createObjectURL(blob);
                            link.setAttribute('href', url);
                            link.setAttribute('download', 'filename.csv');
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                    }
                }
            }
         });
    }

    return {
        getFeature,
        getOwsFeatureCsv,
        apiUrlOws, 
        apiUrlWms
    }
})();
