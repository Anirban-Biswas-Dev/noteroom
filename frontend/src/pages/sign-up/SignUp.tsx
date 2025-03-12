import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../public/css/signup-login.css"


const SignUp = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className="flex-center-evenly">
            <div className="main-container flex-column-center">
                <div className="brand-section flex-column-center">
                    <img src="assets/apple-touch-icon.png" alt="NoteRoom" className="brand__site-logo" onClick={() => navigate('/')} />
                    <p className="brand__logo-title">NoteRoom</p>
                    <h2 className="brand__main-heading">Create a new account</h2>
                    <p className="txt-gray-light-bold">Join the country’s top note-sharing platform to connect, share, and download notes</p>
                </div>
                
                <div className="acquisition-container flex-column-center">
                    {/* Google Sign-up options */}
                    <div id="g_id_onload" data-client_id="325870811550-0c3n1c09gb0mncb0h4s5ocvuacdd935k.apps.googleusercontent.com" data-callback="handleCredentialResponse" data-auto_prompt="false"></div>
                    <div className="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="sign_in_with" data-shape="rectangular" data-logo_alignment="left"></div>
                    
                    <div className="separator flex-center-evenly">
                        <span className="line"></span>
                        <span className="txt-gray-light-bold">Or</span>
                        <span className="line"></span>
                    </div>
                    
                    <div className="custom-form flex-column-center">
                        <input type="text" name="displayname" placeholder="Your Name" className="custom__input-field" required />
                        <input type="email" name="email" placeholder="Email (required)" className="custom__input-field" required />
                        
                        <div className="password-container">
                            <input type={passwordVisible ? "text" : "password"} id="password" name="password" placeholder="Set a password" className="custom__input-field custom__input-field--marginless" required />
                            <button type="button" onClick={togglePasswordVisibility} className="toggle-password">
                                {passwordVisible ? (
                                    <svg className="hidden-password-icon" width="20" height="20" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M72.7474 72.75C65.6249 78.1792 56.952 81.1869 47.9974 81.3334C18.8307 81.3334 2.16406 48 2.16406 48C7.34694 38.3413 14.5355 29.9026 23.2474 23.25M39.2474 15.6667C42.1154 14.9954 45.0518 14.6598 47.9974 14.6667C77.1641 14.6667 93.8307 48 93.8307 48C91.3015 52.7317 88.2851 57.1864 84.8307 61.2917M56.8307 56.8333C55.6864 58.0615 54.3064 59.0465 52.773 59.7297C51.2397 60.4129 49.5845 60.7803 47.9061 60.8099C46.2277 60.8395 44.5606 60.5307 43.0041 59.9021C41.4476 59.2734 40.0337 58.3376 38.8468 57.1507C37.6598 55.9637 36.724 54.5498 36.0953 52.9933C35.4667 51.4368 35.1579 49.7697 35.1875 48.0913C35.2171 46.4129 35.5845 44.7577 36.2677 43.2244C36.9509 41.6911 37.9359 40.3111 39.1641 39.1667M2.16406 2.16669L93.8307 93.8334" stroke="#1E1E1E" strokeWidth="4.08333" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg className="visible-password-icon" width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.16797 50C4.16797 50 20.8346 16.6667 50.0013 16.6667C79.168 16.6667 95.8346 50 95.8346 50C95.8346 50 79.168 83.3334 50.0013 83.3334C20.8346 83.3334 4.16797 50 4.16797 50Z" stroke="#1E1E1E" strokeWidth="4.16667" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M50.0013 62.5C56.9049 62.5 62.5013 56.9036 62.5013 50C62.5013 43.0965 56.9049 37.5 50.0013 37.5C43.0977 37.5 37.5013 43.0965 37.5013 50C37.5013 56.9036 43.0977 62.5 50.0013 62.5Z" stroke="#1E1E1E" strokeWidth="4.16667" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        <button className="primary-btn flex-center-evenly">Sign Up</button>
                    </div>
                </div>
                <p className="redirecting-msg">Already have an account? <a href="/login" className="redirect-link">Login</a></p>
            </div>
            <img className="focus-img" src="/images/sign-up-enhancer.png" alt="Two friends talking about NoteRoom" />
        </div>
    );
};

export default SignUp;