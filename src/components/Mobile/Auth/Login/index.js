import React, { Component } from "react";
import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtp,
} from "../../../../services/user/actions";

import BackButton from "../../Elements/BackButton";
import ContentLoader from "react-content-loader";
import { NavLink } from "react-router-dom";
import { Redirect } from "react-router";
import SimpleReactValidator from "simple-react-validator";
import SocialButton from "../SocialButton";
import { connect } from "react-redux";
import { getSingleLanguageData } from "../../../../services/languages/actions";
import Loading from "../../../helpers/loading";
import LightSpeed from "react-reveal/LightSpeed";
import "./../newLogin.css";

import { WEBSITE_URL } from "../../../../configs/website";
import SupportButton from "../SupportButton";
import { checkAssetURL } from "../../../helpers/truncate";

class Login extends Component {
  constructor() {
    super();
    this.validator = new SimpleReactValidator({
      autoForceUpdate: this,
      messages: {
        required: localStorage.getItem("fieldValidationMsg"),
        email: localStorage.getItem("emailValidationMsg"),
        regex: localStorage.getItem("phoneValidationMsg"),
      },
    });
  }

  state = {
    loading: false,
    email: "",
    onlyPhone: "",
    phone: "",
    password: "",
    otp: "",
    accessToken: "",
    provider: "",
    error: false,
    email_phone_already_used: false,
    invalid_otp: false,
    showResendOtp: false,
    countdownStart: false,
    countDownSeconds: 30,
    email_pass_error: false,
    countryCodeSelect: "",
    isFoodomaaAndroidWebView: false,
  };

  static contextTypes = {
    router: () => null,
  };

  componentDidMount() {
    const countryCode = localStorage.getItem("phoneCountryCode");
    const countryCodesArr = countryCode.split(",");
    this.setState({ countryCodeSelect: countryCodesArr[0].replace(/\s/g, "") });

    if (
      localStorage.getItem("enableFacebookLogin") === "false" &&
      localStorage.getItem("enableGoogleLogin") === "false"
    ) {
      if (document.getElementById("socialLoginDiv")) {
        document.getElementById("socialLoginDiv").classList.add("hidden");
      }
    }

    if (
      localStorage.getItem("enableFacebookLogin") === "true" ||
      localStorage.getItem("enableGoogleLogin") === "true"
    ) {
      setTimeout(() => {
        if (this.refs.socialLogin) {
          this.refs.socialLogin.classList.remove("hidden");
        }
        if (this.refs.socialLoginLoader) {
          this.refs.socialLoginLoader.classList.add("hidden");
        }
      }, 0.5 * 1000);
    }

    if (navigator.userAgent === "FoodomaaAndroidWebViewUA") {
      if (window.Android !== "undefined") {
        this.setState({ isFoodomaaAndroidWebView: true });
      }
    }
  }

  handleInputChange = (event) => {
    if (event.target.name === "phone") {
      this.setState({
        phone:
          this.state.countryCodeSelect + event.target.value.replace(/^0+/, ""),
      });
      this.setState({ onlyPhone: event.target.value.replace(/^0+/, "") });
    } else {
      this.setState({ [event.target.name]: event.target.value.trim() });
    }
  };
  handleCountryCodeChange = (event) => {
    const { target } = event;
    this.setState({ countryCodeSelect: target.value }, () => {
      this.setState({ phone: target.value + this.state.onlyPhone });
    });
  };

  handleLogin = (event) => {
    event.preventDefault();
    if (
      this.validator.fieldValid("email") &&
      this.validator.fieldValid("password")
    ) {
      this.setState({ loading: true });
      this.props.loginUser(
        null,
        this.state.email,
        this.state.password,
        null,
        null,
        null,
        this.getLocationFromLocalStorage(),
        this.state.otp
      );
    } else {
      console.log("validation failed");
      this.validator.showMessages();
    }
  };

  handleRegisterAfterSocialLogin = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    if (this.validator.fieldValid("phone")) {
      if (localStorage.getItem("enSOV") === "true") {
        //sending email and phone, first verify if not exists, then send OTP from the server
        this.props
          .sendOtp(this.state.email, this.state.phone, null)
          .then((response) => {
            if (!response.payload.otp) {
              this.setState({ error: false });
            }
          });
      } else {
        this.props.loginUser(
          this.state.name,
          this.state.email,
          null,
          this.state.accessToken,
          this.state.phone,
          this.state.provider,
          this.getLocationFromLocalStorage(),
          this.state.otp
        );
      }
    } else {
      this.setState({ loading: false });
      console.log("Validation Failed");
      this.validator.showMessages();
    }
  };

  resendOtp = () => {
    if (this.validator.fieldValid("phone")) {
      this.setState({ countDownSeconds: 15, showResendOtp: false });
      this.props
        .sendOtp(this.state.email, this.state.phone, null)
        .then((response) => {
          if (!response.payload.otp) {
            this.setState({ error: false });
          }
        });
    }
  };

  handleVerifyOtp = (event) => {
    event.preventDefault();
    console.log("verify otp clicked");
    if (this.validator.fieldValid("otp")) {
      this.setState({ loading: true });
      this.props.verifyOtp(this.state.phone, this.state.otp);
    }
  };

  handleOnChange = (event) => {
    this.props.getSingleLanguageData(event.target.value);
    localStorage.setItem("userPreferedLanguage", event.target.value);
  };
  componentWillReceiveProps(nextProps) {
    const { user } = this.props;
    if (user !== nextProps.user) {
      this.setState({ loading: false });
    }
    if (nextProps.user.success) {
      if (nextProps.user.data.default_address !== null) {
        const userSetAddress = {
          lat: nextProps.user.data.default_address.latitude,
          lng: nextProps.user.data.default_address.longitude,
          address: nextProps.user.data.default_address.address,
          house: nextProps.user.data.default_address.house,
          tag: nextProps.user.data.default_address.tag,
        };
        localStorage.setItem("userSetAddress", JSON.stringify(userSetAddress));
      }
      // this.context.router.history.goBack();
      if (navigator.userAgent === "FoodomaaAndroidWebViewUA") {
        if (window.Android !== "undefined") {
          window.Android.registerFcm(nextProps.user.data.auth_token);
        }
      }
      if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers["register-fcm"]
      ) {
        window.webkit.messageHandlers["register-fcm"].postMessage(
          nextProps.user.data.auth_token
        );
      }
    }
    if (nextProps.user.email_phone_already_used) {
      this.setState({ email_phone_already_used: true });
    }
    if (nextProps.user.otp) {
      this.setState({ email_phone_already_used: false, error: false });
      //otp sent, hide reg form and show otp form
      document.getElementById("loginForm").classList.add("hidden");
      document.getElementById("socialLoginDiv").classList.add("hidden");
      document
        .getElementById("phoneFormAfterSocialLogin")
        .classList.add("hidden");
      document.getElementById("otpForm").classList.remove("hidden");

      //start countdown
      this.setState({ countdownStart: true });
      this.handleCountDown();
      this.validator.hideMessages();
    }

    if (nextProps.user.valid_otp) {
      this.setState({ invalid_otp: false, error: false, loading: true });
      // register user
      if (this.state.social_login) {
        this.props.loginUser(
          this.state.name,
          this.state.email,
          null,
          this.state.accessToken,
          this.state.phone,
          this.state.provider,
          this.getLocationFromLocalStorage(),
          this.state.otp
        );
      } else {
        this.props.registerUser(
          this.state.name,
          this.state.email,
          this.state.phone,
          this.state.password,
          this.getLocationFromLocalStorage(),
          this.state.otp
        );
      }

      console.log("VALID OTP, REG USER NOW");
      // this.setState({ loading: false });
    }

    if (nextProps.user.valid_otp === false) {
      console.log("Invalid OTP");
      this.setState({ invalid_otp: true });
    }

    if (!nextProps.user) {
      this.setState({ error: true });
    }

    //old user, proceed to login after social login
    if (nextProps.user.proceed_login) {
      this.setState({ loading: true });
      console.log("From Social : user already exists");
      this.props.loginUser(
        this.state.name,
        this.state.email,
        null,
        this.state.accessToken,
        null,
        this.state.provider,
        this.getLocationFromLocalStorage(),
        this.state.otp
      );
    }

    if (nextProps.user.enter_phone_after_social_login) {
      this.validator.hideMessages();
      document.getElementById("loginForm").classList.add("hidden");
      document.getElementById("socialLoginDiv").classList.add("hidden");
      document
        .getElementById("phoneFormAfterSocialLogin")
        .classList.remove("hidden");
      // populate name & email
      console.log("ask to fill the phone number and send otp process...");
    }

    if (nextProps.user.data === "DONOTMATCH") {
      //email and pass donot match
      this.setState({ error: false, email_pass_error: true });
    }

    if (this.props.languages !== nextProps.languages) {
      if (localStorage.getItem("userPreferedLanguage")) {
        this.props.getSingleLanguageData(
          localStorage.getItem("userPreferedLanguage")
        );
      } else {
        if (nextProps.languages.length) {
          console.log("Fetching Translation Data...");
          const id = nextProps.languages.filter(
            (lang) => lang.is_default === 1
          )[0].id;
          this.props.getSingleLanguageData(id);
        }
      }
    }
  }

  handleSocialLogin = (user) => {
    //if otp verification is enabled
    if (localStorage.getItem("enSOV") === "true") {
      //save user data in state
      this.setState({
        name: user._profile.name,
        email: user._profile.email,
        accessToken: user._token.accessToken,
        provider: user._provider,
        social_login: true,
        loading: true,
      });
      //request for OTP, send accessToken, if email exists in db, user will login
      this.props
        .sendOtp(
          user._profile.email,
          null,
          user._token.accessToken,
          user._provider
        )
        .then((response) => {
          if (!response.payload.otp) {
            this.setState({ error: false });
          }
        });
    } else {
      //call to new api to check if phone number present

      //if record phone number present, then login,

      //else show enter phone number
      this.setState({
        name: user._profile.name,
        email: user._profile.email,
        accessToken: user._token.accessToken,
        provider: user._provider,
        social_login: true,
        loading: true,
      });
      this.props.loginUser(
        user._profile.name,
        user._profile.email,
        null,
        user._token.accessToken,
        null,
        user._provider,
        this.getLocationFromLocalStorage(),
        this.state.otp
      );
    }
  };

  handleSocialLoginFailure = (err) => {
    // this.setState({ error: true });
    console.log("Social Login Error", err);
  };

  handleCountDown = () => {
    setTimeout(() => {
      this.setState({ showResendOtp: true });
      clearInterval(this.intervalID);
    }, 30000 + 1000);
    this.intervalID = setInterval(() => {
      console.log("interval going on");
      this.setState({
        countDownSeconds: this.state.countDownSeconds - 1,
      });
    }, 1000);
  };

  processDefaultCountryCode = () => {
    const countryCode = localStorage.getItem("phoneCountryCode");
    const countryCodesArr = countryCode.split(",");
    if (countryCodesArr.length === 0) {
      return <span className="country-code" />;
    }
    if (countryCodesArr.length === 1) {
      return (
        <span className="country-code">
          {countryCodesArr[0].replace(/\s/g, "")}
        </span>
      );
    }
    if (countryCodesArr.length > 1) {
      return (
        <select
          name="countryCodeSelect"
          onChange={this.handleCountryCodeChange}
          className="country-code--dropdown"
        >
          {countryCodesArr.map((countryCode) => (
            <option key={countryCode} value={countryCode.replace(/\s/g, "")}>
              {countryCode.replace(/\s/g, "")}
            </option>
          ))}
        </select>
      );
    }
  };

  componentWillUnmount() {
    //clear countdown
    clearInterval(this.intervalID);
  }

  getLocationFromLocalStorage = () => {
    const userSetAddress = JSON.parse(localStorage.getItem("userSetAddress"));

    if (userSetAddress === null) {
      return null;
    } else {
      if (userSetAddress.hasOwnProperty("businessLocation")) {
        return null;
      } else {
        return userSetAddress;
      }
    }
  };

  render() {
    if (window.innerWidth > 768) {
      return <Redirect to="/" />;
    }
    if (localStorage.getItem("storeColor") === null) {
      return <Redirect to={"/"} />;
    }

    const { user } = this.props;
    if (user.success) {
      if (localStorage.getItem("fromCartToLogin") === "1") {
        localStorage.removeItem("fromCartToLogin");
        return <Redirect to={"/cart"} />;
      } else {
        return <Redirect to={"/my-account"} />;
      }
    }

    const languages = this.props.languages;

    return (
      <React.Fragment>
        {this.state.error && (
          <div className="auth-error">
            <div className="error-shake">
              {localStorage.getItem("loginErrorMessage")}
            </div>
          </div>
        )}
        {this.state.email_phone_already_used && (
          <div className="auth-error">
            <div className="error-shake">
              {localStorage.getItem("emailPhoneAlreadyRegistered")}
            </div>
          </div>
        )}
        {this.state.invalid_otp && (
          <div className="auth-error">
            <div className="error-shake">
              {localStorage.getItem("invalidOtpMsg")}
            </div>
          </div>
        )}
        {this.state.email_pass_error && (
          <div className="auth-error">
            <div className="error-shake">
              {localStorage.getItem("emailPassDonotMatch")}
            </div>
          </div>
        )}

        {this.state.loading && <Loading />}

        <div className="login-container">
          <div className="login-bg-wrapper">
            <div className="login-bg-back-btn ">
              <BackButton history={this.props.history} />
            </div>
            <img
              src={checkAssetURL("/assets/img/loginpageimage.png")}
              alt="login-header"
              className="login-bg-image"
            />
          </div>

          <div className="login-content-card">
            <form onSubmit={this.handleLogin} id="loginForm">
              <p className="login-title-block">
                <span className="login-title">Welcome</span>
                <span className="login-title-highlight">Back</span>
              </p>
              <p className="login-subtitle">
              Order your favourite food online
              </p>

              <input
                type="text"
                name="email"
                onChange={this.handleInputChange}
                className="login-register-input"
                placeholder={localStorage.getItem("loginLoginEmailLabel")}
              />
              {this.validator.message(
                "email",
                this.state.email,
                "required|email"
              )}

              <input
                type="password"
                name="password"
                onChange={this.handleInputChange}
                className="login-register-input login-register-input-margin"
                placeholder={localStorage.getItem("loginLoginPasswordLabel")}
              />
              {this.validator.message(
                "password",
                this.state.password,
                "required"
              )}

              <button
                type="submit"
                className="login-btn"
                style={{
                  backgroundColor: "black",
                }}
              >
                {localStorage.getItem("firstScreenLoginBtn")}
              </button>
            </form>

            <form
              onSubmit={this.handleVerifyOtp}
              id="otpForm"
              className="hidden"
            >
              <p className="login-title-block">
                <span className="login-title">Enter OTP</span>
              </p>
              <p className="login-subtitle">
                {localStorage.getItem("otpSentMsg")}
              </p>

              <input
                name="otp"
                type="tel"
                onChange={this.handleInputChange}
                className="login-register-input"
                required
                placeholder={localStorage.getItem("otpSentMsg")}
              />
              {this.validator.message(
                "otp",
                this.state.otp,
                "required|numeric|min:4|max:6"
              )}

              <button
                type="submit"
                className="login-btn"
                style={{
                  backgroundColor: localStorage.getItem("storeColor"),
                }}
              >
                {localStorage.getItem("verifyOtpBtnText")}
              </button>

              <div className="login-otp-resend-block">
                {this.state.showResendOtp && (
                  <span
                    className="login-otp-resend-link"
                    onClick={this.resendOtp}
                  >
                    {localStorage.getItem("resendOtpMsg")} {this.state.phone}
                  </span>
                )}

                {this.state.countDownSeconds > 0 && (
                  <span>
                    {localStorage.getItem("resendOtpCountdownMsg")}{" "}
                    {this.state.countDownSeconds}
                  </span>
                )}
              </div>
            </form>

            <form
              onSubmit={this.handleRegisterAfterSocialLogin}
              id="phoneFormAfterSocialLogin"
              className="hidden"
            >
              <p className="login-title-block">
                <span className="login-title">Welcome</span>
                <span className="login-title-highlight">{this.state.name}</span>
              </p>
              <p className="login-subtitle">
                {localStorage.getItem("sendOtpOnEmailButtonText")}
              </p>

              <div className="login-phone-input-group">
                <p className="login-phone-country">
                  {this.state.countryCodeSelect}
                </p>
                <span className="login-phone-divider" />
                <input
                  name="phone"
                  type="tel"
                  onChange={this.handleInputChange}
                  className="login-phone-input"
                />
              </div>
              {this.validator.message("phone", this.state.phone, [
                "required",
                { regex: ["^\\+[1-9]\\d{1,14}$"] },
                { min: ["8"] },
              ])}

              <button
                type="submit"
                className="login-btn"
                style={{
                  backgroundColor: localStorage.getItem("storeColor"),
                }}
              >
                {localStorage.getItem("registerRegisterTitle")}
              </button>
            </form>

            {!this.state.isFoodomaaAndroidWebView && (
              <div className="text-center mt-3" id="socialLoginDiv">
                <p className="login-subtitle mt-4">
                  {" "}
                  {localStorage.getItem("socialLoginOrText")}{" "}
                </p>
                <div ref="socialLoginLoader">
                  <ContentLoader
                    height={60}
                    width={400}
                    speed={1.2}
                    primaryColor="#f3f3f3"
                    secondaryColor="#ecebeb"
                  >
                    <rect x="28" y="0" rx="0" ry="0" width="165" height="45" />
                    <rect x="210" y="0" rx="0" ry="0" width="165" height="45" />
                  </ContentLoader>
                </div>
                <div
                  ref="socialLogin"
                  className="hidden d-flex justify-content-center align-items-center"
                >
                  {localStorage.getItem("enableFacebookLogin") === "true" && (
                    <SocialButton
                      provider="facebook"
                      appId={localStorage.getItem("facebookAppId")}
                      onLoginSuccess={this.handleSocialLogin}
                      onLoginFailure={this.handleSocialLoginFailure}
                      className="login-btn mr-3"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <img
                            src="/assets/img/various/facebook.png"
                            alt="Facebook Login"
                            className="img-fluid"
                            style={{ width: "18px", marginRight: "10px" }}
                          />
                        </div>
                        <div style={{ fontSize: "14px" }}>
                          {localStorage.getItem("facebookLoginButtonText")}
                        </div>
                      </div>
                    </SocialButton>
                  )}
                  {localStorage.getItem("enableGoogleLogin") === "true" && (
                    <SocialButton
                      provider="google"
                      appId={localStorage.getItem("googleAppId")}
                      onLoginSuccess={this.handleSocialLogin}
                      onLoginFailure={this.handleSocialLoginFailure}
                      className="login-btn"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <img
                            src="/assets/img/various/google.png"
                            alt="Google Login"
                            className="img-fluid"
                            style={{ width: "18px", marginRight: "10px" }}
                          />
                        </div>
                        <div style={{ fontSize: "14px" }}>
                          {localStorage.getItem("googleLoginButtonText")}
                        </div>
                      </div>
                    </SocialButton>
                  )}
                </div>
              </div>
            )}
          </div>

           <SupportButton contact_number={"9036366226"} />
        </div>

        <div
          className="text-center mt-4 mb-2"
          style={{ paddingTop: "50px", marginBottom: "0px" }}
        >
          {localStorage.getItem("loginDontHaveAccount")}{" "}
          <NavLink
            to="/register"
            style={{
              color: localStorage.getItem("storeColor"),
            }}
            className="auth-reg-link"
          >
            {localStorage.getItem("firstScreenRegisterBtn")}
          </NavLink>
        </div>

        {localStorage.getItem("enPassResetEmail") === "true" && (
          <div className="text-center">
            <NavLink
              to="/forgot-password"
              style={{
                color: "black",
              }}
                // className="auth-forgot-password-btn"

            >
              {localStorage.getItem("forgotPasswordLinkText")}
            </NavLink>
          </div>
        )}

        {localStorage.getItem("registrationPolicyMessage") !== "null" ? (
          <div
            className="text-center mt-4"
            dangerouslySetInnerHTML={{
              __html: localStorage.getItem("registrationPolicyMessage"),
            }}
          />
        ) : (
          <div className="mb-4" />
        )}

        {languages && languages.length > 1 && (
          <div className="text-center mb-4">
            <div className="d-inline-block mr-2">
              {localStorage.getItem("changeLanguageText")}
            </div>
            <select
              onChange={this.handleOnChange}
              defaultValue={
                localStorage.getItem("userPreferedLanguage")
                  ? localStorage.getItem("userPreferedLanguage")
                  : languages.filter((lang) => lang.is_default === 1)[0].id
              }
              className="form-control language-select d-inline-block"
              style={{ width: "auto" }}
            >
              {languages.map((language) => (
                <option value={language.id} key={language.id}>
                  {language.language_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
  language: state.languages.language,
  languages: state.languages.languages,
});

export default connect(
  mapStateToProps,
  {
    loginUser,
    registerUser,
    sendOtp,
    verifyOtp,
    getSingleLanguageData,
  }
)(Login);
