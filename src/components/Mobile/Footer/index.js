import React, { Component } from "react";

import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import PWAInstallation from "../PWAInstallation";

class Footer extends Component {
	state = {
		active_home: false,
		active_branch: false,
		active_cart: false,
		active_account: false,
		active_offers: false,
	};

	componentDidMount() {
		if (this.props.active_nearme === true) {
			this.setState({ active_home: true });
		}

		if (this.props.active_explore === true) {
			this.setState({ active_branch: true });
		}

		if (this.props.active_cart === true) {
			this.setState({ active_cart: true });
		}

		if (this.props.active_account === true) {
			this.setState({ active_account: true });
		}

		if (this.props.active_alerts === true) {
			this.setState({ active_offers: true });
		}
	}

	render() {
		const { cartTotal } = this.props;

		return (
			<React.Fragment>

				{localStorage.getItem("showPwaInstallPromptFooter") ===
					"true" && (
					<PWAInstallation type={"footer"} />
				)}

				<div className="new-mobile-footer">

					{/* ================= HOME ================= */}

					<NavLink
						to="/"
						className={`new-footer-item ${
							this.state.active_home
								? "new-footer-active"
								: ""
						}`}
					>
						<div className="new-footer-icon">
							<i className="si si-home" />
						</div>

						<div className="new-footer-label">
							Home
						</div>
					</NavLink>


					{/* ================= OFFERS ================= */}

					<NavLink
						to="/offers"
						className={`new-footer-item ${
							this.state.active_offers
								? "new-footer-active"
								: ""
						}`}
					>
						<div className="new-footer-icon">
							<i className="si si-tag" />
						</div>

						<div className="new-footer-label">
							Offers
						</div>
					</NavLink>


					{/* ================= SELECT BRANCH ================= */}

					<NavLink
						to="/"
						className={`new-footer-item ${
							this.state.active_branch
								? "new-footer-active"
								: ""
						}`}
					>
						<div className="new-footer-icon">
							<i className="si si-pointer" />
						</div>

						<div className="new-footer-label">
							Branches
						</div>
					</NavLink>


					{/* ================= CART ================= */}

					<NavLink
						to="/cart"
						className={`new-footer-item ${
							this.state.active_cart
								? "new-footer-active"
								: ""
						}`}
					>
						<div className="new-footer-icon new-footer-badge-wrapper">

							<i className="si si-bag" />

							{cartTotal &&
								cartTotal.productQuantity > 0 && (
									<span className="new-footer-badge">
										{cartTotal.productQuantity}
									</span>
								)}

						</div>

						<div className="new-footer-label">
							Cart
						</div>
					</NavLink>


					{/* ================= ACCOUNT ================= */}

					<NavLink
						to="/my-account"
						className={`new-footer-item ${
							this.state.active_account
								? "new-footer-active"
								: ""
						}`}
					>
						<div className="new-footer-icon">
							<i className="si si-user" />
						</div>

						<div className="new-footer-label">
							Account
						</div>
					</NavLink>

				</div>

			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	cartTotal: state.total.data,
});

export default connect(
	mapStateToProps,
	{}
)(Footer);

// import React, { Component } from "react";

// import { NavLink } from "react-router-dom";
// import { connect } from "react-redux";
// import PWAInstallation from "../PWAInstallation";

// class Footer extends Component {
// 	state = {
// 		active_nearme: false,
// 		active_explore: false,
// 		active_cart: false,
// 		active_account: false,
// 		active_alerts: false,
// 	};

// 	componentDidMount() {
// 		if (this.props.active_nearme === true) {
// 			this.setState({ active_nearme: true });
// 		}

// 		if (this.props.active_explore === true) {
// 			this.setState({ active_explore: true });
// 		}

// 		if (this.props.active_cart === true) {
// 			this.setState({ active_cart: true });
// 		}

// 		if (this.props.active_account === true) {
// 			this.setState({ active_account: true });
// 		}

// 		if (this.props.active_alerts === true) {
// 			this.setState({ active_alerts: true });
// 		}
// 	}

// 	render() {
// 		const { cartTotal, alertUnreadTotal } = this.props;

// 		return (
// 			<React.Fragment>

// 				{localStorage.getItem("showPwaInstallPromptFooter") ===
// 					"true" && (
// 					<PWAInstallation type={"footer"} />
// 				)}

// 				<div className="new-mobile-footer">

// 					{/* NEAR ME */}
// 					<NavLink
// 						to="/"
// 						className={`new-footer-item ${
// 							this.state.active_nearme
// 								? "new-footer-active"
// 								: ""
// 						}`}
// 					>
// 						<div className="new-footer-icon">
// 							<i className="si si-pointer" />
// 						</div>

// 						<div className="new-footer-label">
// 							{localStorage.getItem("footerNearme") ||
// 								"Near Me"}
// 						</div>
// 					</NavLink>


// 					{/* ALERTS */}
// 					<NavLink
// 						to="/alerts"
// 						className={`new-footer-item ${
// 							this.state.active_alerts
// 								? "new-footer-active"
// 								: ""
// 						}`}
// 					>
// 						<div className="new-footer-icon new-footer-badge-wrapper">

// 							<i className="si si-bell" />

// 							{alertUnreadTotal > 0 && (
// 								<span className="new-footer-badge">
// 									{alertUnreadTotal}
// 								</span>
// 							)}

// 						</div>

// 						<div className="new-footer-label">
// 							{localStorage.getItem("footerAlerts") ||
// 								"Alerts"}
// 						</div>
// 					</NavLink>


// 					{/* EXPLORE */}
// 					<NavLink
// 						to="/explore"
// 						className={`new-footer-item ${
// 							this.state.active_explore
// 								? "new-footer-active"
// 								: ""
// 						}`}
// 					>
// 						<div className="new-footer-icon">
// 							<i className="si si-magnifier" />
// 						</div>

// 						<div className="new-footer-label">
// 							{localStorage.getItem("footerExplore") ||
// 								"Explore"}
// 						</div>
// 					</NavLink>


// 					{/* CART */}
// 					<NavLink
// 						to="/cart"
// 						className={`new-footer-item ${
// 							this.state.active_cart
// 								? "new-footer-active"
// 								: ""
// 						}`}
// 					>
// 						<div className="new-footer-icon new-footer-badge-wrapper">

// 							<i className="si si-bag" />

// 							{cartTotal &&
// 								cartTotal.productQuantity > 0 && (
// 									<span className="new-footer-badge">
// 										{cartTotal.productQuantity}
// 									</span>
// 								)}

// 						</div>

// 						<div className="new-footer-label">
// 							{localStorage.getItem("footerCart") ||
// 								"Cart"}
// 						</div>
// 					</NavLink>


// 					{/* ACCOUNT */}
// 					<NavLink
// 						to="/my-account"
// 						className={`new-footer-item ${
// 							this.state.active_account
// 								? "new-footer-active"
// 								: ""
// 						}`}
// 					>
// 						<div className="new-footer-icon">
// 							<i className="si si-user" />
// 						</div>

// 						<div className="new-footer-label">
// 							{localStorage.getItem("footerAccount") ||
// 								"Account"}
// 						</div>
// 					</NavLink>

// 				</div>

// 			</React.Fragment>
// 		);
// 	}
// }

// const mapStateToProps = (state) => ({
// 	cartTotal: state.total.data,
// 	alertUnreadTotal: state.alert.alertUnreadTotal,
// });

// export default connect(
// 	mapStateToProps,
// 	{}
// )(Footer);



