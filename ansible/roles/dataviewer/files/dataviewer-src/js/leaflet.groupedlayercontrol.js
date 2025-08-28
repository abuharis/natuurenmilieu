const groupedLayersToggleByMouseOver = 'mouseover';
const groupedLayersToggleByclick = 'click';
const expandedClass = 'leaflet-control-layers-expanded';
/* global L */

// A layer control which provides for layer groupings.
// Author: Ishmael Smyrnow
L.Control.GroupedLayers = L.Control.extend({

  options: {
    collapsed: true,
    position: 'topright',
    autoZIndex: true,
    exclusiveGroups: [],
    groupCheckboxes: false,
    toggleBy: groupedLayersToggleByMouseOver
  },

  initialize: function (baseLayers, groupedOverlays, options) {
    var i, j;
    L.Util.setOptions(this, options);

    this._layers = [];
    this._lastZIndex = 0;
    this._handlingClick = false;
    this._groupList = [];
    this._domGroups = [];

    for (i in baseLayers) {
      this._addLayer(baseLayers[i], i);
    }

    for (i in groupedOverlays) {
      for (j in groupedOverlays[i]) {
        this._addLayer(groupedOverlays[i][j], j, i, true);
      }
    }
  },

  onAdd: function (map) {
    this._initLayout();
    this._update();

    map
        .on('layeradd', this._onLayerChange, this)
        .on('layerremove', this._onLayerChange, this)
        .on('resize', this._onMapResize, this);

    return this._container;
  },

  onRemove: function (map) {
    map
        .off('layeradd', this._onLayerChange, this)
        .off('layerremove', this._onLayerChange, this)
        .off('resize', this._onMapResize, this);
  },

  addBaseLayer: function (layer, name) {
    this._addLayer(layer, name);
    this._update();
    return this;
  },

  addOverlay: function (layer, name, group) {
    this._addLayer(layer, name, group, true);
    /**
     * TODO updating this will affect previously selected layers
     * because update rerenders whole layers not just newly added layer
     */
    
    this._update();
    return this;
  },

      //This function ensures that this layer is added on top of the map with a dynamic size based on the screen size and it always stays 100px above the bottom of the screen
  _onMapResize: function () {
    if (L.DomUtil.hasClass(this._container, expandedClass)) {
        const mapHeight = this._map._size.y;
        const containerTop = this._container.offsetTop;
        const maxHeight = mapHeight - containerTop - 100;
    
        if (maxHeight < this._form.clientHeight) {
            L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
            this._form.style.height = maxHeight + 'px';
        } else {
            L.DomUtil.removeClass(this._form, 'leaflet-control-layers-scrollbar');
            this._form.style.height = '';
        }
    }
  },

  removeLayer: function (layer) {
    var id = L.Util.stamp(layer);
    var _layer = this._getLayer(id);
    if (_layer) {
      delete this._layers[this._layers.indexOf(_layer)];
    }
    this._update();
    return this;
  },

  _getLayer: function (id) {
    for (var i = 0; i < this._layers.length; i++) {
      if (this._layers[i] && L.stamp(this._layers[i].layer) === id) {
        return this._layers[i];
      }
    }
  },

  _initLayout: function () {
    const className = 'leaflet-control-layers';
    const container = this._container = L.DomUtil.create('div', className);

    // Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
    container.setAttribute('aria-haspopup', true);

    if (L.Browser.touch) {
      L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
    } else {
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
    }

    const form = this._form = L.DomUtil.create('form', className + '-list');
     // Making toggle button
     const layersButton = this._layersLink = L.DomUtil.create('div', 'layers-button', container);
     layersButton.title = 'Layers';
     this._addSvgIcon(layersButton, 'layers-icon', './img/layers.svg');

    if (this.options.collapsed) {
      if (!L.Browser.android) {
        if(this._isToggleByMouseOver()) {
          L.DomEvent
            .on(container, 'mouseover', this._expand, this)
            .on(container, 'mouseout', this._collapse, this);
        } else if(this._isToggleByClick()) {
          L.DomEvent
            .on(layersButton, 'click', L.DomEvent.stop)
            .on(layersButton, 'click', this._onClick, this);
        }
      }

      if (L.Browser.touch) {
        L.DomEvent
            .on(layersButton, 'click', L.DomEvent.stop)
            .on(layersButton, 'click', this._expand, this);
      } else {
        if(!this._isToggleByClick()) {
          L.DomEvent.on(layersButton, 'focus', this._expand, this);
        }
      }

     if(!this._isToggleByClick()){
      this._map.on('click', this._collapse, this);
     }
      // TODO keyboard accessibility
    } else {
      
      if(this._isToggleByMouseOver()) {
        this._expand();
      } else if(this._isToggleByClick()) {
        this._onClick();
      }
    }

    this._mapTypeHeading = L.DomUtil.create('div', className + '-heading text-blue text-small', form);
    this._baseLayersList = L.DomUtil.create('div', className + '-base ', form);
    this._separator = L.DomUtil.create('div', className + '-separator', form);
    this._dataGroupsHeading = L.DomUtil.create('div', className + '-heading text-blue text-small', form);
    this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

    container.appendChild(form);
  },

  _addLayer: function (layer, name, group, overlay) {
    var id = L.Util.stamp(layer);

    var _layer = {
      layer: layer,
      name: name,
      overlay: overlay
    };
    this._layers.push(_layer);

    group = group || '';
    var groupId = this._indexOf(this._groupList, group);

    if (groupId === -1) {
      groupId = this._groupList.push(group) - 1;
    }

    var exclusive = (this._indexOf(this.options.exclusiveGroups, group) !== -1);

    _layer.group = {
      name: group,
      id: groupId,
      exclusive: exclusive
    };

    if (this.options.autoZIndex && layer.setZIndex) {
      this._lastZIndex++;
      layer.setZIndex(this._lastZIndex);
    }
  },

  _update: function () {
    if (!this._container) {
      return;
    }

    this._mapTypeHeading.innerHTML = 'KAART TYPES';
    this._baseLayersList.innerHTML = '';
    this._dataGroupsHeading.innerHTML = 'DATALAGEN';
    this._overlaysList.innerHTML = '';
    this._domGroups.length = 0;

    var baseLayersPresent = false,
      overlaysPresent = false,
      i, obj;

    for (var i = 0; i < this._layers.length; i++) {
      obj = this._layers[i];
      this._addItem(obj);
      overlaysPresent = overlaysPresent || obj.overlay;
      baseLayersPresent = baseLayersPresent || !obj.overlay;
    }

    this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
  },

  _onLayerChange: function (e) {
    var obj = this._getLayer(L.Util.stamp(e.layer)),
      type;

    if (!obj) {
      return;
    }

    if (!this._handlingClick) {
      this._update();
    }

    if (obj.overlay) {
      type = e.type === 'layeradd' ? 'overlayadd' : 'overlayremove';
    } else {
      type = e.type === 'layeradd' ? 'baselayerchange' : null;
    }

    if (type) {
      this._map.fire(type, obj);
    }

    // Retry mechanism to ensure prompts are removed
    if (e.type === 'layeradd') {
      const removePrompts = () => {
        const prompts = document.querySelectorAll('.groupName-details');
        prompts.forEach(prompt => {
          if (document.body.contains(prompt)) {
            document.body.removeChild(prompt);
          }
        });
      };

      // Remove prompts immediately
      removePrompts();

      // Retry removal after a short delay
      let retryCount = 0;
      const maxRetries = 3;
      const retryInterval = 500; // 500ms

      const retryRemoval = () => {
        if (retryCount < maxRetries) {
          retryCount++;
          removePrompts();
          setTimeout(retryRemoval, retryInterval);
        }
      };

      setTimeout(retryRemoval, retryInterval);
    }
  },

  // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
  _createRadioElement: function (name, checked) {
    var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
    if (checked) {
      radioHtml += ' checked="checked"';
    }
    radioHtml += '/>';

    var radioFragment = document.createElement('div');
    radioFragment.innerHTML = radioHtml;

    return radioFragment.firstChild;
  },

  _addItem: function (obj) {
    var label = document.createElement('label'),
      input,
      checked = this._map.hasLayer(obj.layer),
      container,
      groupRadioName;

    if (obj.overlay) {

      if (obj.group.exclusive) {
        groupRadioName = 'leaflet-exclusive-group-layer-' + obj.group.id;
        input = this._createRadioElement(groupRadioName, checked);
      } else {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = checked;
      }
    } else {
      input = this._createRadioElement('leaflet-base-layers', checked);
    }

    input.layerId = L.Util.stamp(obj.layer);
    input.groupID = obj.group.id;
    L.DomEvent.on(input, 'click', this._onInputClick, this);

    var name = document.createElement('span');
    name.innerHTML = obj.name; // adds text to group elements and map types text

    label.appendChild(input); // adds checkbox or radio button
    label.appendChild(name); // adds layer name

    if (obj.overlay) {
      container = this._overlaysList;

      var groupContainer = this._domGroups[obj.group.id];

      // Create the group container if it doesn't exist
      if (!groupContainer) {
        groupContainer = document.createElement('div');
        groupContainer.className = 'leaflet-control-layers-group';
        groupContainer.id = 'leaflet-control-layers-group-' + obj.group.id;

        var groupLabel = document.createElement('label');
        groupLabel.className = 'leaflet-control-layers-group-label';

        if (obj.group.name !== '' && !obj.group.exclusive) {
          // ------ add a group checkbox with an _onInputClickGroup function
          if (this.options.groupCheckboxes) {
            var groupInput = document.createElement('input');
            groupInput.type = 'checkbox';
            groupInput.className = 'leaflet-control-layers-group-selector';
            groupInput.groupID = obj.group.id;
            groupInput.legend = this;
            L.DomEvent.on(groupInput, 'click', this._onGroupInputClick, groupInput);
            groupLabel.appendChild(groupInput);
          }
        }

        var groupName = document.createElement('button');
        groupName.className = 'leaflet-control-layers-group-name';
        groupName.innerHTML = obj.group.name + '<span> +</span>';

        groupLabel.appendChild(groupName);
        groupContainer.appendChild(groupLabel);
        container.appendChild(groupContainer);

        this._domGroups[obj.group.id] = groupContainer;

        //groupName-details pop up
        groupName.addEventListener('mouseover', function (e) {
          var groupNameDetails = document.createElement('div');
          groupNameDetails.className = 'groupName-details leaflet-top';

          var detailsTip = document.createElement('div');
          detailsTip.className = 'leaflet-top groupName-details-tip';
          // TODO it should force close all tooltips when we close layer, that way at least we can get off stuck tooltips
          groupNameDetails.appendChild(detailsTip);

          switch (obj.group.name) {
            case 'Basiskaarten':
              groupNameDetails.innerHTML += `Kaart met natuur- en recreatiegebieden in Nederland (Bron: CBS, bewerking PBL, 2015)`;
              break;
            case 'Bestrijdingsmiddelen':
              groupNameDetails.innerHTML += `Overzicht van toxische druk en normover-schrijdingen van bestrijdingsmiddelen (Bron: Bestrijdingsmiddelenatlas.nl)`;
              break;
            case 'Burgerwetenschap metingen':
              groupNameDetails.innerHTML += `Metingen van waterplanten, helderheid, nutriënten en waterdieren verzameld door burgerwetenschappers (Bron: Vang de Watermonsters/Water op de Kaart)`;
              break;
            case 'Waterkwaliteit KRW':
              groupNameDetails.innerHTML += `Beoordeling van de waterkwaliteit op basis van biologisch en chemische metingen door waterbeheerders (Bron: Waterkwaliteitsportaal.nl)`;
              break;
            case 'Emissieregistratie Stikstof & Fosfor':
              groupNameDetails.innerHTML += `Belasting van oppervlaktewater door emissie van stikstof (N-totaal) en fosfor (P-totaal) (Bron: Emissieregistratie.nl)`;
              break;
          }

          document.body.appendChild(groupNameDetails);

          var rect = groupName.getBoundingClientRect();
          groupNameDetails.style.top = rect.top + 'px';
          groupNameDetails.style.left = rect.right + 10 + 'px';

          function removeDetails() {
            if (document.body.contains(groupNameDetails)) {
              document.body.removeChild(groupNameDetails);
            }
          }

          groupName.addEventListener(
            'mouseout',
            removeDetails,
            { once: true }
          );
          groupName.addEventListener(
            'click',
            removeDetails,
            { once: true }
          );
        });

        groupName.addEventListener('click', function (e) {
          groupContainer.classList.toggle('show-elements');
          if (groupContainer.classList.contains('show-elements')) {
            groupName.innerHTML = obj.group.name + '<span> -</span>';
          } else {
            groupName.innerHTML = obj.group.name + '<span> +</span>';
          }
          e.preventDefault();
        });
      }

      container = groupContainer;
    } else {
      container = this._baseLayersList;
    }

    container.appendChild(label);

    return label;
  },

  _onGroupInputClick: function () {
    var i, input, obj;

    var this_legend = this.legend;
    this_legend._handlingClick = true;

    var inputs = this_legend._form.getElementsByTagName('input');
    var inputsLen = inputs.length;

    for (i = 0; i < inputsLen; i++) {
      input = inputs[i];
      if (input.groupID === this.groupID && input.className === 'leaflet-control-layers-selector') {
        input.checked = this.checked;
        obj = this_legend._getLayer(input.layerId);
        if (input.checked && !this_legend._map.hasLayer(obj.layer)) {
          this_legend._map.addLayer(obj.layer);
        } else if (!input.checked && this_legend._map.hasLayer(obj.layer)) {
          this_legend._map.removeLayer(obj.layer);
        }
      }
    }

    this_legend._handlingClick = false;
  },

  _onInputClick: function () {
    var i, input, obj,
      inputs = this._form.getElementsByTagName('input'),
      inputsLen = inputs.length;

    this._handlingClick = true;

    for (i = 0; i < inputsLen; i++) {
      input = inputs[i];
      if (input.className === 'leaflet-control-layers-selector') {
        obj = this._getLayer(input.layerId);

        if (input.checked) {
          $(input.parentElement).addClass('active');
          if ($(input.parentElement).find('.subgroup-open').length === 0) {
            $(input.parentElement).append('<b class="subgroup-open"></b>');
          }
        } else {
          $(input.parentElement).removeClass('active');
          $(input.parentElement).find('.subgroup-open').remove();
        }

        if (input.checked && !this._map.hasLayer(obj.layer)) {
          this._map.addLayer(obj.layer);
        } else if (!input.checked && this._map.hasLayer(obj.layer)) {
          this._map.removeLayer(obj.layer);
        }
      }
    }

    this._handlingClick = false;
  },

  _expand: function () {
    L.DomUtil.addClass(this._container, expandedClass);
    // permits to have a scrollbar if overlays heighter than the map.
    const acceptableHeight = this._map._size.y - (this._container.offsetTop * 4);
    // Set the initial height of the form to ensure it is 100px above the bottom of the map
    const mapHeight = this._map._size.y;
    const containerTop = this._container.offsetTop;
    const maxHeight = mapHeight - containerTop - 100;

    if (maxHeight < this._form.clientHeight) {
      L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
      this._form.style.height = maxHeight + 'px';
  } else {
      L.DomUtil.removeClass(this._form, 'leaflet-control-layers-scrollbar');
      this._form.style.height = '';
  }

    if (acceptableHeight < this._form.clientHeight) {
      L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
      this._form.style.height = acceptableHeight + 'px';
    }

     // TODO add class to color it yellow
    if(this._isToggleByClick()) {
      L.DomUtil.addClass(this._container, 'click-toggle');
    }
    const close = this._layersClose = L.DomUtil.create('div', 'layers-close', this._container);
    L.DomEvent
      .on(close, 'click', L.DomEvent.stopPropagation)
      .on(close, 'click', () => this._collapse());

    this._addSvgIcon(close, 'layers-close-icon', './img/close-icon.svg'); 
    L.DomUtil.addClass(this._layersLink, 'active');
  },

  _collapse: function () {
    this._container.className = this._container.className.replace(` ${expandedClass}`, '');
    // TODO remove class to color it yellow
    if(this._isToggleByClick()) {
      L.DomUtil.removeClass(this._container, 'click-toggle');
    }

    this._layersClose.remove();
    L.DomUtil.removeClass(this._layersLink,'active');
  },

  _indexOf: function (arr, obj) {
    for (var i = 0, j = arr.length; i < j; i++) {
      if (arr[i] === obj) {
        return i;
      }
    }
    return -1;
  },

  _onClick: function () {
    if(Array.from(this._container.classList).find((c) => c === expandedClass)){
      this._collapse();
    } else {
      navUtils.unselectOtherNavOptions('layers');
      this._expand();
    }
  },

  _isToggleByClick() {
    return this.options.toggleBy === groupedLayersToggleByclick;
  }, 

  _isToggleByMouseOver() {
    return this.options.toggleBy === groupedLayersToggleByMouseOver;
  },
  
  _addSvgIcon: function(destination, modifier, path) {
    const icon = L.DomUtil.create('img', modifier, destination);
    icon.setAttribute('src',path);

    return icon;
  }
});

L.control.groupedLayers = function (baseLayers, groupedOverlays, options) {
  return new L.Control.GroupedLayers(baseLayers, groupedOverlays, options);
};
