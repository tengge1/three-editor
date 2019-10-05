import './css/LoginMenu.css';
import { classNames, MenuItemSeparator, Button } from '../../third_party';
import LoginWindow from '../system/LoginWindow.jsx';

/**
 * 登录菜单
 * @author tengge / https://github.com/tengge1
 */
class LoginMenu extends React.Component {
    constructor(props) {
        super(props);

        this.handleClickRegister = this.handleClickRegister.bind();
        this.handleClickLogin = this.handleClickLogin.bind(this);
    }

    render() {
        return <>
            <MenuItemSeparator className={classNames('horizontal', 'LoginSeparator')}></MenuItemSeparator>
            <li className={classNames('MenuItem', 'LoginMenuItem')}>
                <Button className={'button'} onClick={this.handleClickRegister}>{_t(`Register`)}</Button>
            </li>
            <li className={classNames('MenuItem', 'LoginMenuItem')}>
                <Button className={'button'} onClick={this.handleClickLogin}>{_t(`Login`)}</Button>
            </li>
        </>;
    }

    handleClickRegister() {

    }

    handleClickLogin() {
        const win = app.createElement(LoginWindow);
        app.addElement(win);
    }
}

export default LoginMenu;