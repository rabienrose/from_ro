import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import Login from '../network/Login.js';
import Popup from './Popup.jsx';
import Session from '../utils/SessionStorage.js';
const LoginPage = (prop) => {

  const [loginData, setLoginData] = useState({
    username: '',
    password: '', 
    confirmPassword: ''
  });

  const [showRegist, setShowRegist] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('登录失败！！');

  const onLogin = (result, error) => {
    if (result) {
      prop.onLogin();
    } else {
      setPopupContent('登录失败！！');
      setShowPopup(true);
    }
  }

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    
    if (savedUsername && savedPassword) {
      setLoginData(prev => ({
        ...prev,
        username: savedUsername,
        password: savedPassword
      }));
    }
  }, []);

  const handleLogin = () => {
    if (showRegist===false) {
      Login.onConnectionRequest(loginData.username, loginData.password, onLogin.bind(this))
      localStorage.setItem('username', loginData.username);
      localStorage.setItem('password', loginData.password);
    } else {
      setShowRegist(false);
    }
  }

  const handleRegister = () => {
    if (showRegist===false) {
      setShowRegist(true);
    } else {
      if (loginData.password !== loginData.confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }
      Login.onConnectionRequest(loginData.username+"_F", loginData.password)
      setShowRegist(false);
    }
  }

  return (
    <div className="login-container">
      {showPopup && <Popup content={popupContent} button="确定" onClose={() => setShowPopup(false)} />}
      <div className="form-wrapper">
        <div className='login-title'>{showRegist ? '注册' : '登录'}</div>
        <div className='login-input-wrapper'>
          <img src="images/login_user.jpg" alt="用户名" className='login-icon'/>
          <input type="text" placeholder="用户名" className='login-input' value={loginData.username} onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))} />
        </div>
        <div className='login-input-wrapper'>
          <img src="images/login_pw.jpg" alt="密码" className='login-icon'/>
          <input type="text" placeholder="密码" className='login-input' value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} />
        </div>
        {showRegist && (
          <div className='login-input-wrapper'>
            <img src="images/login_pw.jpg" alt="密码" className='login-icon'/>
            <input type="text" placeholder="确认密码" className='login-input' value={loginData.confirmPassword} onChange={(e) => setLoginData(prev => ({ ...prev, confirmPassword: e.target.value }))} />
          </div>
        )}
        <div className="login-button-wrapper">
          <div className="login-button" onClick={handleLogin} style={{width: '160px'}}>登录</div>
          <div className="login-button" onClick={handleRegister} style={{width: '100px'}}>注册</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;