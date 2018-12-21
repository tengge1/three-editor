import BaseComponent from './BaseComponent';

/**
 * 后期处理组件
 * @author tengge / https://github.com/tengge1
 * @param {*} options 
 */
function PostProcessingComponent(options) {
    BaseComponent.call(this, options);
    this.selected = null;
}

PostProcessingComponent.prototype = Object.create(BaseComponent.prototype);
PostProcessingComponent.prototype.constructor = PostProcessingComponent;

PostProcessingComponent.prototype.render = function () {
    var data = {
        xtype: 'div',
        id: 'panel',
        scope: this.id,
        parent: this.parent,
        cls: 'Panel',
        style: {
            display: 'none'
        },
        children: [{
            xtype: 'row',
            children: [{
                xtype: 'label',
                style: {
                    color: '#555',
                    fontWeight: 'bold'
                },
                text: '后期处理'
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '点阵化'
            }, {
                xtype: 'checkbox',
                id: 'dotScreen',
                scope: this.id,
                value: false,
                onChange: this.onChange.bind(this)
            }, {
                xtype: 'number',
                id: 'dotScreenScale',
                scope: this.id,
                value: 4,
                onChange: this.onChange.bind(this)
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '颜色偏移'
            }, {
                xtype: 'checkbox',
                id: 'rgbShift',
                scope: this.id,
                value: false,
                onChange: this.onChange.bind(this)
            }, {
                xtype: 'number',
                id: 'rgbShiftAmount',
                scope: this.id,
                value: 0.1,
                onChange: this.onChange.bind(this)
            }]
        }
            //, {
            //     xtype: 'row',
            //     children: [{
            //         xtype: 'label',
            //         text: '风格化'
            //     }, {
            //         xtype: 'select',
            //         id: 'selStyle',
            //         scope: this.id,
            //         value: {

            //         }
            //     }]
            // }
        ]
    };

    var control = UI.create(data);
    control.render();

    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
};

PostProcessingComponent.prototype.onObjectSelected = function () {
    this.updateUI();
};

PostProcessingComponent.prototype.onObjectChanged = function () {
    this.updateUI();
};

PostProcessingComponent.prototype.updateUI = function () {
    var container = UI.get('panel', this.id);
    var editor = this.app.editor;
    if (editor.selected && editor.selected instanceof THREE.Scene) {
        container.dom.style.display = '';
    } else {
        container.dom.style.display = 'none';
        return;
    }

    this.selected = editor.selected;

    var dotScreen = UI.get('dotScreen', this.id);
    var dotScreenScale = UI.get('dotScreenScale', this.id);
    var rgbShift = UI.get('rgbShift', this.id);
    var rgbShiftAmount = UI.get('rgbShiftAmount', this.id);

    var scene = this.selected;
    var postProcessing = scene.userData.postProcessing || {};

    if (postProcessing.dotScreen) {
        dotScreen.setValue(postProcessing.dotScreen.enabled);
        dotScreenScale.setValue(postProcessing.dotScreen.scale);
    }

    if (postProcessing.rgbShift) {
        rgbShift.setValue(postProcessing.rgbShift.enabled);
        rgbShiftAmount.setValue(postProcessing.rgbShift.amount);
    }
};

PostProcessingComponent.prototype.onChange = function () {
    var dotScreen = UI.get('dotScreen', this.id);
    var dotScreenScale = UI.get('dotScreenScale', this.id);
    var rgbShift = UI.get('rgbShift', this.id);
    var rgbShiftAmount = UI.get('rgbShiftAmount', this.id);

    var scene = this.selected;
    scene.userData.postProcessing = scene.userData.postProcessing || {};

    Object.assign(scene.userData.postProcessing, {
        dotScreen: {
            enabled: dotScreen.getValue(),
            scale: dotScreenScale.getValue(),
        },
        rgbShift: {
            enabled: rgbShift.getValue(),
            amount: rgbShiftAmount.getValue()
        }
    });
};

export default PostProcessingComponent;