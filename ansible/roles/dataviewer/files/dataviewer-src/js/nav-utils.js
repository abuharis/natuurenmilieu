const navUtils = (() => {
    const navOptions = [
        [
            'layers', 
            '.layers-button.active', 
            (element) => {
                element.classList.remove('active');
                document.querySelector('.layers-close-icon')?.click();
            }
        ],
        [
            'info', 
            '#nav-info-icon', 
            (element) => {
                if(element.hasAttribute('is-open')){
                    element.click();
                }
            }
        ],
        [
            'search', 
            '#nav-search', 
            (element) => {
                if(element.classList.contains('icon-selected')) {
                    element.click();
                }               
            }
        ],
        [
            'download', 
            '#nav-download-button-dialog', 
            () => {
                const button = document.getElementById('nav-download-button');
                button.click();
            }
        ]
    ];

    function tryClickOtherNavOption(selector, actionCallback) {
        const option = document.querySelector(selector);
        
        if(option) {
            actionCallback(option);
        }
    }

    function unselectOtherNavOptions(selectedOption) {        
        navOptions
            .filter(([option]) => option !== selectedOption)
            .forEach(([,selector, callback]) => 
                tryClickOtherNavOption(selector, callback)
            )
    }

    return {
        unselectOtherNavOptions
    }
})();