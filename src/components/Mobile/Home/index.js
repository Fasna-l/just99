import * as firebase from "firebase/app";
import React, { Component } from "react";

import Footer from "../Footer";
import Meta from "../../helpers/meta";
// import PromoSlider from "./PromoSlider";
import { Redirect } from "react-router";
import RestaurantList from "./RestaurantList";
import { connect } from "react-redux";
import { getPromoSlides } from "../../../services/promoSlider/actions";

import messaging from "../../../init-fcm";
import { saveNotificationToken } from "../../../services/notification/actions";
import { getSingleLanguageData } from "../../../services/languages/actions";
import { getUserNotifications } from "../../../services/alert/actions";
import {
	resetInfo,
	resetItems,
	resetBackup,
} from "../../../services/items/actions";

import { Link } from "react-router-dom";
import Header from "../Header";

// Add this CSS file
import "./HomeRedesign.css";

import HomeBanner from "./HomeBanner";
class Home extends Component {
	static contextTypes = {
		router: () => null,
	};

	state = {
		open: false,
	};

	async componentDidMount() {
		// Keep all existing functionality
		this.props.resetItems();
		this.props.resetInfo();
		this.props.resetBackup();

		const { user } = this.props;

		const userSetAddress = JSON.parse(
			localStorage.getItem("userSetAddress")
		);

		this.props.getPromoSlides(
			userSetAddress.lat,
			userSetAddress.lng
		);

		if (user.success) {
			this.props.getUserNotifications(
				user.data.id,
				user.data.auth_token
			);
		}

		if (user.success) {
			if (
				localStorage.getItem("enablePushNotification") === "true"
			) {
				if (firebase.messaging.isSupported()) {
					let handler = this.props.saveNotificationToken;

					messaging
						.requestPermission()
						.then(async function () {
							const push_token =
								await messaging.getToken();

							handler(
								push_token,
								user.data.id,
								user.data.auth_token
							);
						})
						.catch(function (err) {
							console.log(
								"Unable to get permission to notify.",
								err
							);
						});
				}
			}
		}

		const userAlreadySelected = !JSON.parse(
			localStorage.getItem("userSetAddress")
		).hasOwnProperty("businessLocation");

		if (
			localStorage.getItem("userAlreadySelectedLocation") === null
		) {
			if (userAlreadySelected) {
				this.setState({ open: false });
			} else {
				this.setState({ open: true });
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.languages !== nextProps.languages) {
			if (localStorage.getItem("userPreferedLanguage")) {
				this.props.getSingleLanguageData(
					localStorage.getItem("userPreferedLanguage")
				);
			} else {
				if (nextProps.languages.length) {
					const defaultLanguage = nextProps.languages.filter(
						(lang) => lang.is_default === 1
					)[0];

					if (defaultLanguage) {
						this.props.getSingleLanguageData(
							defaultLanguage.id
						);
					}
				}
			}
		}
	}

	componentWillUnmount() {}

	render() {
		// Keep existing desktop redirect
		if (window.innerWidth > 768) {
			return <Redirect to="/" />;
		}

		const { user, promo_slides } = this.props;

		const showPromoSlider =
			localStorage.getItem("showPromoSlider") === "true";

		const showMockSearch =
			localStorage.getItem("mockSearchOnHomepage") === "true";

		const customHomeMessage =
			localStorage.getItem("customHomeMessage");
		
		return (
			<React.Fragment>

				{/* ================= SEO ================= */}

				<Meta
					seotitle={localStorage.getItem("seoMetaTitle")}
					seodescription={localStorage.getItem(
						"seoMetaDescription"
					)}
					ogtype="website"
					ogtitle={localStorage.getItem("seoOgTitle")}
					ogdescription={localStorage.getItem(
						"seoOgDescription"
					)}
					ogurl={window.location.href}
					twittertitle={localStorage.getItem(
						"seoTwitterTitle"
					)}
					twitterdescription={localStorage.getItem(
						"seoTwitterDescription"
					)}
				/>

				<div className="new-home-page">

					{/* ================= HEADER ================= */}

					<div className="new-home-header">
						<Header
							hide_seacrh={true}
							user_info={true}
							home={false}
							user={user}
							plus_icon={false}
							explore={false}
							// explore={
							// 	localStorage.getItem(
							// 		"enableFullScreenOnHome"
							// 	) === "true"
							// }
							{...this.props}
						/>
					</div>


					{/* ================= SEARCH ================= */}
					<div className="new-home-banner">
    					<HomeBanner />
					</div>
					{/* {showMockSearch && (
						<div className="new-home-search-container">

							<Link
								to="explore"
								className="new-home-search-link"
							>
								<div className="new-home-search">

									<div className="new-home-search-icon">
										<i className="si si-magnifier" />
									</div>

									<div className="new-home-search-text">
										{localStorage.getItem(
											"mockSearchPlaceholder"
										) || "Search restaurants or food"}
									</div>

								</div>
							</Link>

						</div>
					)} */}


					{/* ================= PROMO ================= */}
						{/* ================= PROMO ================= */}

						{/* <div className="new-home-promo">

    						<PromoSlider
        						slides={customSlides}
        						size={5}
    						/>

						</div> */}
					{/* {showPromoSlider &&
						promo_slides &&
						promo_slides.mainSlides &&
						promo_slides.mainSlides.length > 0 && (

							<div className="new-home-promo">

								<PromoSlider
									slides={
										promo_slides.mainSlides
									}
									size={
										promo_slides.mainSlides[0][
											"promo_slider"
										]["size"]
									}
								/>

							</div>
						)
                    } */}


					{/* ================= CUSTOM MESSAGE ================= */}

					{/* {customHomeMessage !== "<p></p>" &&
						customHomeMessage !== "<p><br></p>" &&
						customHomeMessage !== "null" &&
						customHomeMessage !== "" && (

							<div className="new-home-message">

								<div
									dangerouslySetInnerHTML={{
										__html: customHomeMessage,
									}}
								/>

							</div>
						)
                    } */}


					{/* ================= RESTAURANTS ================= */}

					<div className="new-home-restaurants">

						{/* <div className="new-home-section-heading">
							<div>
								<h2>Restaurants near you</h2>
								<p>
									Discover delicious food around you
								</p>
							</div>

							<Link
								to="explore"
								className="new-home-view-all"
							>
								View all
							</Link>
						</div> */}


						<RestaurantList
							user={user}
							slides={
								promo_slides
									? promo_slides.otherSlides
									: []
							}
						/>

					</div>


					{/* Space for fixed footer */}

					<div className="new-home-footer-space" />


					{/* ================= FOOTER ================= */}

					<Footer active_nearme={true} />

				</div>

			</React.Fragment>
		);
	}
}


const mapStateToProps = (state) => ({
	promo_slides: state.promo_slides.promo_slides,
	user: state.user.user,
	locations: state.locations.locations,
	languages: state.languages.languages,
	language: state.languages.language,
	popular_locations:
		state.popular_locations.popular_locations,
});


export default connect(
	mapStateToProps,
	{
		getPromoSlides,
		saveNotificationToken,
		getSingleLanguageData,
		getUserNotifications,
		resetInfo,
		resetItems,
		resetBackup,
	}
)(Home);