import React, { Component } from "react";
import { APPLY_COUPON_URL } from "../../../../configs";
import Axios from "axios";
import { applyCoupon } from "../../../../services/coupon/actions";
import { connect } from "react-redux";
import DelayLink from "../../../helpers/delayLink";
import Ink from "react-ink";
import { checkAssetURL } from "../../../helpers/truncate";

class Coupon extends Component {
	static contextTypes = {
		router: () => null,
	};
	state = {
		inputCoupon: null,
		couponFailed: false,
		couponFailedType: "",
		couponSubtotalMessage: "",
		couponAmount: null,
	};

	componentDidMount() {
		localStorage.setItem("orderSubtotal", this.props.subtotal);
		// automatically apply coupon if already exists in localstorage
		if (localStorage.getItem("appliedCoupon")) {
			this.setState({ inputCoupon: localStorage.getItem("appliedCoupon") }, () => {
				// this.refs.couponInput.defaultValue = localStorage.getItem("appliedCoupon");
				const { user } = this.props;
				const token = user.success ? this.props.user.data.auth_token : null;
				const subtotal = this.props.subtotal ? this.props.subtotal : localStorage.getItem("orderSubtotal");
				this.props.applyCoupon(
					token,
					localStorage.getItem("appliedCoupon"),
					this.props.restaurant_info.id,
					this.props.subtotal
				);
				Axios.post(APPLY_COUPON_URL, {
					token: token,
					coupon: localStorage.getItem("appliedCoupon"),
					restaurant_id: this.props.restaurant_info.id,
					subtotal: subtotal,
				})
				.then((response) => {
					const coupon = response.data;
					localStorage.setItem("appliedCoupon", coupon.code);
					if (coupon.discount_type === "AMOUNT"){
						this.setState({couponAmount: coupon.discount});
					} else {
						var amount = subtotal * coupon.discount / 100;
						if (amount > coupon.max_discount){
							this.setState({couponAmount: coupon.max_discount});
						} else {
							this.setState({couponAmount: amount});
						}
					}
				});
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		const { coupon } = this.props;
		//check if props changed after calling the server
		if (coupon !== nextProps.coupon) {
			//if nextProps.coupon is successful then
			if (nextProps.coupon.success) {
				console.log("SUCCESS COUPON");
				localStorage.setItem("appliedCoupon", nextProps.coupon.code);
				this.setState({ couponFailed: false });
			} else {
				console.log("COUPON Removed");
				// coupon is invalid
				console.log("FAILED COUPON");
				localStorage.removeItem("appliedCoupon");
				this.setState({
					couponFailed: !nextProps.coupon.hideMessage,
					couponFailedType: nextProps.coupon.type,
					couponSubtotalMessage: nextProps.coupon.message,
				});
			}
		}

		if(nextProps.coupon){
			console.log('nextProps.coupon', nextProps.coupon);
		}
	}
	handleInput = (event) => {
		this.setState({ inputCoupon: event.target.value });
	};

	componentWillUnmount() {
		// this.props.coupon.code = undefined;
		// localStorage.removeItem("appliedCoupon");
	}

	render() {
		return (
			<React.Fragment>
				{(this.state.inputCoupon === null || this.state.inputCoupon === "" || (!localStorage.getItem("appliedCoupon"))) ? (
					<DelayLink to="/cart/coupons" delay={250}>
						<div className="coupon-block d-flex justify-content-between px-15 pb-15 mx-15 mb-15 position-relative">
							<div>
								<img src={checkAssetURL("/assets/img/various/offer.png")} alt="coupon" className="mr-2" style={{width: "25px"}}/>
								<span style={{ lineHeight: "2.5rem" }}>{localStorage.getItem("applyCouponButtonText") + " " + localStorage.getItem("cartCouponText")}</span>
							</div>
							<div>
								<i className="si si-arrow-right text-muted font-size-md" style={{ lineHeight: "2"}}></i>
							</div>
							<canvas height="0" width="0" style={{borderRadius: "inherit", height: "100%", left: "0px", position: "absolute", top: "0px", width: "100%",}}>
							</canvas>
							<Ink duration="500" />
						</div>
					</DelayLink>
				) : (
					<DelayLink to="/cart/coupons" delay={250}>
						<div className="coupon-block d-flex justify-content-between px-15 pb-15 mx-15 mb-15 position-relative">
							<div>
								<span>"{this.state.inputCoupon}" Code Applied</span><br/>
							</div>
							<div>
								<i className="si si-arrow-right text-muted font-size-md mt-2" style={{ lineHeight: "3"}}></i>
							</div>
							<canvas height="0" width="0" style={{borderRadius: "inherit", height: "100%", left: "0px", position: "absolute", top: "0px", width: "100%",}}>
							</canvas>
							<Ink duration="500" />
						</div>
					</DelayLink>
				)}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	coupon: state.coupon.coupon,
	restaurant_info: state.items.restaurant_info,
	user: state.user.user,
});

export default connect(
	mapStateToProps,
	{ applyCoupon }
)(Coupon);
