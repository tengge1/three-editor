import { classNames, PropTypes, SearchField, ImageList } from '../../third_party';
import EditWindow from './window/EditWindow.jsx';
import ModelLoader from '../../loader/ModelLoader';
import AddObjectCommand from '../../command/AddObjectCommand';

/**
 * 模型面板
 * @author tengge / https://github.com/tengge1
 */
class ModelPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            categoryData: [],
            name: '',
            categories: []
        };

        this.handleClick = this.handleClick.bind(this);

        this.handleAdd = this.handleAdd.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.update = this.update.bind(this);
    }

    render() {
        const { className, style } = this.props;
        const { data, categoryData, name, categories } = this.state;

        let list = data;

        if (name.trim() !== '') {
            list = list.filter(n => {
                return n.Name.toLowerCase().indexOf(name.toLowerCase()) > -1 ||
                    n.FirstPinYin.toLowerCase().indexOf(name.toLowerCase()) > -1 ||
                    n.TotalPinYin.toLowerCase().indexOf(name.toLowerCase()) > -1;
            });
        }

        if (categories.length > 0) {
            list = list.filter(n => {
                return categories.indexOf(n.CategoryID) > -1;
            });
        }

        const imageListData = list.map(n => {
            return Object.assign({}, n, {
                id: n.ID,
                src: n.Thumbnail ? `${app.options.server}${n.Thumbnail}` : null,
                title: n.Name,
                icon: 'model',
                cornerText: n.Type
            });
        });

        return <div className={classNames('ModelPanel', className)}
            style={style}
               >
            <SearchField
                data={categoryData}
                placeholder={_t('Search Content')}
                showAddButton
                showFilterButton
                onAdd={this.handleAdd}
                onInput={this.handleSearch.bind(this)}
            />
            <ImageList
                data={imageListData}
                onClick={this.handleClick}
                onEdit={this.handleEdit}
                onDelete={this.handleDelete}
            />
        </div>;
    }

    componentDidUpdate() {
        if (this.init === undefined && this.props.show === true) {
            this.init = true;
            this.update();
        }
    }

    update() {
        fetch(`${app.options.server}/api/Category/List?type=Mesh`).then(response => {
            response.json().then(obj => {
                if (obj.Code !== 200) {
                    app.toast(_t(obj.Msg));
                    return;
                }
                this.setState({
                    categoryData: obj.Data
                });
            });
        });
        fetch(`${app.options.server}/api/Mesh/List`).then(response => {
            response.json().then(obj => {
                if (obj.Code !== 200) {
                    app.toast(_t(obj.Msg));
                    return;
                }
                this.setState({
                    data: obj.Data
                });
            });
        });
    }

    handleSearch(name, categories) {
        this.setState({
            name,
            categories
        });
    }

    handleClick(model) {
        let loader = new ModelLoader(app);

        let url = model.Url;

        if (model.Url.indexOf(';') > -1) { // 包含多个入口文件
            url = url.split(';').map(n => app.options.server + n);
        } else {
            url = app.options.server + model.Url;
        }

        loader.load(url, model, {
            camera: app.editor.camera,
            renderer: app.editor.renderer,
            audioListener: app.editor.audioListener,
            clearChildren: true
        }).then(obj => {
            if (!obj) {
                return;
            }
            obj.name = model.Name;

            Object.assign(obj.userData, model, {
                Server: true
            });

            if (app.options.addMode === 'click') {
                this.clickSceneToAdd(obj);
            } else {
                this.addToCenter(obj);
            }
        });
    }

    // 添加到场景中心
    addToCenter(obj) {
        var cmd = new AddObjectCommand(obj);
        cmd.execute();

        if (obj.userData.scripts) {
            obj.userData.scripts.forEach(n => {
                app.editor.scripts[n.uuid] = n;
            });
            app.call('scriptChanged', this);
        }
    }

    // 点击场景添加
    clickSceneToAdd(obj) {
        app.toast(_t('Please click an plane in the scene.'));
        app.on(`intersect.ModelPanel`, intersect => {
            if (!intersect) {
                return;
            }
            app.on(`intersect.ModelPanel`, null);
            obj.position.copy(intersect.point);
            this.addToCenter(obj);
        });
    }

    // ------------------------------- 上传 ---------------------------------------

    handleAdd() {
        app.upload(`${app.options.server}/api/Mesh/Add`, obj => {
            if (obj.Code === 200) {
                this.update();
            }
            app.toast(_t(obj.Msg));
        });
    }

    // ------------------------------- 编辑 ---------------------------------------

    handleEdit(data) {
        var win = app.createElement(EditWindow, {
            type: 'Mesh',
            typeName: _t('Model'),
            data,
            saveUrl: `${app.options.server}/api/Mesh/Edit`,
            callback: this.update
        });

        app.addElement(win);
    }

    // ------------------------------ 删除 ----------------------------------------

    handleDelete(data) {
        app.confirm({
            title: _t('Confirm'),
            content: `${_t('Delete')} ${data.title}?`,
            onOK: () => {
                fetch(`${app.options.server}/api/Mesh/Delete?ID=${data.id}`, {
                    method: 'POST'
                }).then(response => {
                    response.json().then(obj => {
                        if (obj.Code !== 200) {
                            app.toast(_t(obj.Msg));
                            return;
                        }
                        this.update();
                    });
                });
            }
        });
    }
}

ModelPanel.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    show: PropTypes.bool
};

ModelPanel.defaultProps = {
    className: null,
    style: null,
    show: false
};

export default ModelPanel;