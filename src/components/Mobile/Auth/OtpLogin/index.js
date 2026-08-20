import React, { Component } from "react";

import { loginWithOtp, generateOtpForLogin } from "../../../../services/user/actions";

import BackButton from "../../Elements/BackButton";
import { Redirect } from "react-router";
import SimpleReactValidator from "simple-react-validator";
import { connect } from "react-redux";
import { getSingleLanguageData } from "../../../../services/languages/actions";
import Loading from "../../../helpers/loading";
import LightSpeed from "react-reveal/LightSpeed";
import OtpInput from "react-otp-input";
import ProgressiveImage from "react-progressive-image";
import { checkAssetURL, placeholderImage } from "../../../helpers/truncate";
import { RiArrowLeftLine } from 'react-icons/ri'
import "./../login.css";

import SupportButton from "../SupportButton";

class OtpLogin extends Component {
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
		phone: "",
		password: "",
		otp: "",
		numInputs: "6",
		error: false,
		email_phone_already_used: false,
		invalid_otp: false,
		showResendOtp: false,
		countdownStart: false,
		countDownSeconds: 30,
		email_pass_error: false,
		countryCodeSelect: "",
		newUser: false,

		showLoginForm: true,
		showOtpForm: false,
		onlyPhone: "",
		imageHeight: 250,
	};

	static contextTypes = {
		router: () => null,
	};

	componentDidMount() {
		this.setState({ imageHeight: window.innerHeight - (window.innerHeight * 42.5 / 100) });
		const countryCode = localStorage.getItem("phoneCountryCode");
		const countryCodesArr = countryCode.split(",");
		this.setState({ countryCodeSelect: countryCodesArr[0].replace(/\s/g, "") });
	}

	handleInputChange = (event) => {
		if (event.target.name === "phone") {
			this.setState({ phone: this.state.countryCodeSelect + event.target.value.replace(/^0+/, "") });
			this.setState({ onlyPhone: event.target.value.replace(/^0+/, "") });
		} else {
			this.setState({ [event.target.name]: event.target.value.trim() });
		}
	};
	handleOtpInput = (otp) => this.setState({ otp });

	handleCountryCodeChange = (event) => {
		const { target } = event;
		this.setState({ countryCodeSelect: target.value }, () => {
			this.setState({ phone: target.value + this.state.onlyPhone });
		});
	};

	__sendOtp = (event) => {
		event.preventDefault();
		if (!this.state.newUser && this.validator.fieldValid("phone")) {
			this.setState({ loading: true });
			this.props.generateOtpForLogin(this.state.phone, this.state.email);
		} else if (this.state.newUser && this.validator.fieldValid("phone") && this.validator.fieldValid("email")) {
			this.setState({ loading: true });
			this.props.generateOtpForLogin(this.state.phone, this.state.email);
		} else {
			this.setState({ loading: false });
			console.log("validation failed");
			this.validator.showMessages();
		}
	};

	__loginWithOtp = (event) => {
		event.preventDefault();
		this.props.loginWithOtp(
			this.state.phone,
			this.state.otp,
			this.state.name,
			this.state.email,
			this.getLocationFromLocalStorage()
		);
		this.setState({ loading: true });
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

	resendOtp = () => {
		if (this.validator.fieldValid("phone")) {
			this.setState({ countDownSeconds: 15, showResendOtp: false });
			this.props.generateOtpForLogin(this.state.phone, this.state.email).then((response) => {
				if (!response.payload.otp) {
					this.setState({ error: false });
				}
			});
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



			//start countdown
			this.setState({ countdownStart: true, showLoginForm: false, showOtpForm: true });
			this.handleCountDown();
			this.validator.hideMessages();
		}

		if (!nextProps.user.otp && nextProps.user.new_user) {
			console.log("New User");
			this.setState({ newUser: true });
			this.validator.hideMessages();
		}

		if (!nextProps.user) {
			this.setState({ error: true });
		}

		if (nextProps.user.enter_phone_after_social_login) {
			this.validator.hideMessages();
			document.getElementById("loginForm").classList.add("hidden");
			// populate name & email
			console.log("ask to fill the phone number and send otp process...");
		}

		if (nextProps.user.data === "DONOTMATCH") {
			//email and pass donot match
			this.setState({ error: false, email_pass_error: false, invalid_otp: true });
		}

		if (this.props.languages !== nextProps.languages) {
			if (localStorage.getItem("userPreferedLanguage")) {
				this.props.getSingleLanguageData(localStorage.getItem("userPreferedLanguage"));
			} else {
				if (nextProps.languages.length) {
					console.log("Fetching Translation Data...");
					const id = nextProps.languages.filter((lang) => lang.is_default === 1)[0].id;
					this.props.getSingleLanguageData(id);
				}
			}
		}
	}

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
			return <span className=" login-prefix" />;
		}
		if (countryCodesArr.length === 1) {
			return <span className="login-prefix">{countryCodesArr[0].replace(/\s/g, "")}</span>;
		}
		if (countryCodesArr.length > 1) {
			return (
				<select
					name="countryCodeSelect"
					onChange={this.handleCountryCodeChange}
					className="country-code--dropdown login-prefix"
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
				return (
					//redirect to cart page
					<Redirect to={"/cart"} />
				);
			} else {
				return (
					//redirect to account page
					<Redirect to={"/my-account"} />
				);
			}
		}

		const languages = this.props.languages;

		return (
			<React.Fragment>
				{this.state.error && (
					<div className="auth-error">
						<div className="error-shake">{localStorage.getItem("loginErrorMessage")}</div>
					</div>
				)}
				{this.state.email_phone_already_used && (
					<div className="auth-error">
						<div className="error-shake">{localStorage.getItem("emailPhoneAlreadyRegistered")}</div>
					</div>
				)}
				{this.state.invalid_otp && (
					<div className="auth-error">
						<div className="error-shake">{localStorage.getItem("invalidOtpMsg")}</div>
					</div>
				)}

				{this.state.loading && <Loading />}

				<div className="bg-white login-form login-slider">
					<div className='position-relative' >


						<ProgressiveImage
							src={checkAssetURL("/assets/img/loginpageimage.png")}
							placeholder={placeholderImage}
						>
							{(src, loading) => (
								<img
									src={src}
									style={{
										"object-fit": "cover",
										width: "100%",
										height: `${this.state.imageHeight}px`,
									}
									}
								/>
							)
							}
						</ProgressiveImage>
						<div className='position-absolute' style={{ left: 0, top: 0, padding: '0.5rem', width: 'auto', zIndex: '30', height: 'auto' }}>
							<span onClick={
								() => {
									this.context.router.history.goBack()
								}
							}>
								<RiArrowLeftLine size={35} color='#fff' />
							</span>
						</div>

					</div>






					<div className='login-container px-15'>

						{this.state.showLoginForm && (
							<>

								<div className='d-flex flex-column pb-15'>
									<span className='login-header'>Welcome</span>
									<span className='login-header logo-color'
										style={{
											color: localStorage.getItem('storeColor')
										}}
									>Onboard</span>
									<span className='login-desc pt-3'><span style={{ color: '#121212' }}>
									</span>
										Order your favourite food online
									</span>
								</div>
								<form onSubmit={this.__sendOtp} id="loginForm">

									<div className={`pb-5 d-flex flex-column ${this.state.newUser && 'hidden'}`}>
										<div className='login-input '>

											<>
												{this.processDefaultCountryCode()}

												<input
													name="phone"
													type="tel"
													minLength={'7'}
													maxLength={'10'}
													onChange={this.handleInputChange}
													className='input-base'
													inputMode='tel'

												/>

											</>

										</div>
										<span className='text-danger mt-2'>
											{this.validator.message("phone", this.state.phone, [
												"required",
												{ regex: ["^\\+[1-9]\\d{1,14}$"] },
												{ min: ["8"] },
											])}
										</span>
									</div>
									{this.state.newUser && (
										<div id="newUserFields" className=''>
											<div className='login-input mb-3'>
												<input
													type="text"
													name="name"
													onChange={this.handleInputChange}

													placeholder={localStorage.getItem("loginLoginNameLabel")}
												/>
												{this.validator.message("name", this.state.name, "required|string")}
											</div>

											<div className='login-input mb-3'>
												<input
													type="text"
													name="email"
													onChange={this.handleInputChange}

													placeholder={localStorage.getItem("loginLoginEmailLabel")}
												/>
												{this.validator.message("email", this.state.email, "required|email")}
											</div>

										</div>
									)}


									<button
										className='login-submit btn-press-effect'
										onClick={() => {
											console.log(localStorage.getItem("firstScreenLoginBtn"))
										}}
									>
										<span className='btn-submit'>
											{!this.state.newUser
												? localStorage.getItem("firstScreenLoginBtn")
												: localStorage.getItem("registerRegisterTitle")}
										</span>
									</button>


								</form>


							</>
						)}

						{this.state.showOtpForm && (
							<>
								<div className='d-flex flex-column pb-15'>
									<span className='login-header desc'>Enter OTP you recieved</span>
									<span className='login-desc pt-3'>OTP sent to {this.state.phone}</span>
								</div>
								<form onSubmit={this.__loginWithOtp}>
									<div className="">

										<OtpInput
											value={this.state.otp}
											onChange={this.handleOtpInput}
											numInputs={this.state.numInputs}
											inputType={true}
											containerStyle="login-with-otp-input-container"
											inputStyle={{
												height: "50px",
												width: "50px",
												backgroundColor: "#f9f8f9",
												borderRadius: "0rem",
												outline: "none",
												borderRadius: "10px",
												border: '1px solid #f9f8f9',
												fontSize: '1.75rem',
												fontWeight: '600',
												userSelect: 'none',
											}}
											shouldAutoFocus={true}
											renderSeparator={<span style={{ width: '10px' }}></span>}
											renderInput={(props) => (
												<input
													{...props}
													type="number" // This ensures numeric input and brings up the numeric keyboard on mobile devices
													inputMode="numeric" // This brings up the numeric keyboard on mobile devices
												/>
											)}
										/>
									</div>



									<div className="mt-20 d-flex justify-content-center">
										<button
											className='login-submit btn-press-effect'
											style={{
												backgroundColor: localStorage.getItem("storeCodlor"),
											}}
											disabled={this.state.otp.length < this.state.numInputs}
										>
											<span className='btn-submit'>
												{localStorage.getItem("verifyOtpBtnText")}
											</span>
										</button>


									</div>

									<div className={``}
										onClick={() => {
											this.resendOtp()
										}}>
										<span className={`btn-submit ${this.state.showResendOtp ? '' : 'in-active'}`}>
											Didn't recieve the OTP ? {this.state.showResendOtp ? ' Resend Now' :
												<span style={{ fontSize: '0.65rem' }}>

													{localStorage.getItem("resendOtpCountdownMsg")} {this.state.countDownSeconds}
												</span>}
										</span>


									</div>


								</form>

							</>
						)}
					</div>


				</div>

				{this.state.newUser && (
					<React.Fragment>
						{localStorage.getItem("registrationPolicyMessage") !== "null" ? (
							<div
								className="mt-20 mb-20 d-flex align-items-center justify-content-center auth-custom-msg-block"
								dangerouslySetInnerHTML={{
									__html: localStorage.getItem("registrationPolicyMessage"),
								}}
							/>
						) : (
							<div className="mb-100" />
						)}
					</React.Fragment>
				)}

				{languages && languages.length > 1 && (
					<div className="mt-4 d-flex align-items-center justify-content-center mb-100">
						<div className="mr-2">{localStorage.getItem("changeLanguageText")}</div>
						<select
							onChange={this.handleOnChange}
							defaultValue={
								localStorage.getItem("userPreferedLanguage")
									? localStorage.getItem("userPreferedLanguage")
									: languages.filter((lang) => lang.is_default === 1)[0].id
							}
							className="form-control language-select"
						>
							{languages.map((language) => (
								<option value={language.id} key={language.id}>
									{language.language_name}
								</option>
							))}
						</select>
					</div>
				)}
				<SupportButton contact_number={"9036366226"} />
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
		loginWithOtp,
		generateOtpForLogin,
		getSingleLanguageData,
	}
)(OtpLogin);
