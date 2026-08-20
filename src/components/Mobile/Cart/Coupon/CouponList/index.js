import React, { Component } from "react";

import Ink from "react-ink";
import BackWithSearch from "../../../Elements/BackWithSearch";
import { applyCoupon } from "../../../../../services/coupon/actions";
import { connect } from "react-redux";
import Axios from "axios";
import { GET_RESTAURANT_COUPONS_URL } from "../../../../../configs";
import { APPLY_COUPON_URL } from "../../../../../configs";
import Loading from "../../../../../components/helpers/loading";
import { checkAssetURL } from "../../../../helpers/truncate";

class CouponList extends Component {
    static contextTypes = {
		router: () => null,
	};
	state = {
        loading: true,
		inputCoupon: null,
		couponFailed: false,
		couponFailedType: "",
		couponSubtotalMessage: "",
        coupons: null,
        couponsList: false,
		error: false,
		errorMessage: null,
	};

	componentDidMount() {        
        const { user } = this.props;
        const token = user.success ? this.props.user.data.auth_token : null;
        this.__getRestaurantCoupons();
        
		// automatically apply coupon if already exists in localstorage
		if (localStorage.getItem("appliedCoupon")) {
			this.setState({ inputCoupon: localStorage.getItem("appliedCoupon") }, () => {
				this.refs.couponInput.defaultValue = localStorage.getItem("appliedCoupon");
				this.props.applyCoupon(
					token,
					localStorage.getItem("appliedCoupon"),
					this.props.restaurant_info.id,
					localStorage.getItem("orderSubtotal")
				);
                Axios.post(APPLY_COUPON_URL, {
					token: token,
					coupon: localStorage.getItem("appliedCoupon"),
					restaurant_id: this.props.restaurant_info.id,
					subtotal: localStorage.getItem("orderSubtotal"),
				})
				.then((response) => {
					const coupon = response.data;
					localStorage.setItem("appliedCoupon", coupon.code);
				});
			});
		}
	}

	componentWillReceiveProps(nextProps) {
        console.log(nextProps);
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
	}
	handleInput = (event) => {
		this.setState({ inputCoupon: event.target.value });
	};

	handleSubmit = (event) => {
        this.setState({loading: true});
        event.preventDefault();
		const { user } = this.props;
		const token = user.success ? this.props.user.data.auth_token : null;
		this.props.applyCoupon(token, this.state.inputCoupon, this.props.restaurant_info.id, localStorage.getItem("orderSubtotal"));
        Axios.post(APPLY_COUPON_URL, {
			token: token,
			coupon: this.state.inputCoupon,
			restaurant_id: this.props.restaurant_info.id,
			subtotal: localStorage.getItem("orderSubtotal"),
		})
		.then((response) => {
			const coupon = response.data;
			if (coupon.success === true){
				localStorage.setItem("appliedCoupon", coupon.code);
				this.redirectToCart();
			} else {
				this.setState({loading: false});
				this.setState({error: true});
				this.setState({errorMessage: coupon.message});
			}
		});
	};

    async handleApply(index) {
        this.setState({loading: true});
        const codeRef = document.querySelector(`[data-id="coupon-${index}"][data-code]`);
		const code = codeRef ? codeRef.dataset.code : null;
		if (code) {
            const { user } = this.props;
            const token = user.success ? this.props.user.data.auth_token : null;
            await this.props.applyCoupon(token, code, this.props.restaurant_info.id, localStorage.getItem("orderSubtotal"));
			this.setState({inputCoupon: code});
            Axios.post(APPLY_COUPON_URL, {
				token: token,
				coupon: code,
				restaurant_id: this.props.restaurant_info.id,
				subtotal: localStorage.getItem("orderSubtotal"),
			})
			.then((response) => {
				const coupon = response.data;
				if (coupon.success === true){
					localStorage.setItem("appliedCoupon", coupon.code);
					this.redirectToCart();
				} else {
					this.setState({loading: false});
					this.setState({error: true});
					this.setState({errorMessage: coupon.message});
				}
			});
        }
	};

    redirectToCart = () => {
		window.location.href = '/cart';
	};

	__getRestaurantCoupons = () => {
		const {user} = this.props;
		const token = user.success ? this.props.user.data.auth_token : null;
        const restaurant_id = this.props.restaurant_info.id;

		if(user.success){
			Axios.post(GET_RESTAURANT_COUPONS_URL, {
				token: token,
				restaurant_id: restaurant_id,
				subtotal: localStorage.getItem("orderSubtotal"),
			})
			.then((response) => {
				if (response.data.success === true){
					this.setState({couponsList: true});
					this.setState({coupons: response.data.coupons});
				}
				this.setState({loading: false});
			})
			.catch(function(error){
				console.log(error.response.data)
			});
		} else {
			this.setState({loading: false});
		}
	}

	componentWillUnmount() {
		// this.props.coupon.code = undefined;
		// localStorage.removeItem("appliedCoupon");
	}

	render() {
		const { coupon, user } = this.props;
		return (
			<React.Fragment>
				{this.state.loading && <Loading/>}
                <BackWithSearch
                    boxshadow={true}
                    has_title={true}
                    title={localStorage.getItem("applyCouponButtonText") + " " + localStorage.getItem("cartCouponText")}
                    disable_search={true}
                    homeButton={true}
					replace={true}
                />
				{this.state.error && 
                    <div className="auth-error no-click">
                        <div className="error-shake">
                        {this.state.errorMessage}
                        </div>
                    </div>
                }
				<div className="input-group px-15 pb-15">
					<form
						className={`coupon-form ${!user.success && "coupon-block-not-loggedin"}`}
                        style={{ marginTop: "6rem" }}
						onSubmit={() => this.handleSubmit()}
					>
						<div className="input-group">
							<div className="input-group-prepend">
								<button className="btn apply-coupon-btn">
									<i className="si si-tag" />
								</button>
							</div>
							<input
								type="text"
								className="form-control apply-coupon-input"
								placeholder={localStorage.getItem("cartCouponText")}
								onChange={this.handleInput}
								style={{ color: localStorage.getItem("storeColor") }}
								spellCheck="false"
								ref="couponInput"
							/>
							<div className="input-group-append">
								<button type="submit" className="btn apply-coupon-btn" onClick={this.handleSubmit}>
									<span
										style={{
											backgroundColor: localStorage.getItem("cartColorBg"),
											color: localStorage.getItem("cartColorText"),
										}}
									>
										{localStorage.getItem("applyCouponButtonText")}
									</span>
									<Ink duration="500" />
								</button>
							</div>
						</div>
					</form>
					<div className="coupon-status">
						{coupon.code && (
							<div className="coupon-success pt-10 pb-10">
								{localStorage.getItem("showCouponDescriptionOnSuccess") === "true" ? (
									<React.Fragment>{coupon.description}</React.Fragment>
								) : (
									<React.Fragment>
										{'"' + coupon.code + '"'} {localStorage.getItem("cartApplyCoupon")}{" "}
										{coupon.discount_type === "PERCENTAGE" ? (
											coupon.discount + "%"
										) : (
											<React.Fragment>
												{localStorage.getItem("currencySymbolAlign") === "left" &&
													localStorage.getItem("currencyFormat") + coupon.discount}
												{localStorage.getItem("currencySymbolAlign") === "right" &&
													coupon.discount + localStorage.getItem("currencyFormat")}{" "}
												{localStorage.getItem("cartCouponOffText")}
											</React.Fragment>
										)}
									</React.Fragment>
								)}
							</div>
						)}
						{/* Coupon is not applied, then coupon state is true */}
						{this.state.couponFailed &&
							(this.state.couponFailedType === "MINSUBTOTAL" ? (
								<div className="coupon-fail pt-10 pb-10">{this.state.couponSubtotalMessage}</div>
							) : (
								<div className="coupon-fail pt-10 pb-10">
									{localStorage.getItem("cartInvalidCoupon")}
								</div>
							))}
						{!user.success && (
							<div className="coupon-not-loggedin-message pt-10 pb-10">
								<i className="si si-info mr-2" />
								{localStorage.getItem("couponNotLoggedin")}
							</div>
						)}
					</div>
                    <hr/>
						<div className="listed-cart-coupons" style={{ width: "100%"}}>
						{this.state.couponsList === false && (
							<div className="text-center mt-50 font-w600 text-muted">
								No Coupons Available!
							</div>
						)}	
						{this.state.couponsList === true && this.state.coupons && this.state.coupons.length > 0 && 
							(
								this.state.coupons.map((coupon, index) => (
									<div key={index} className="position-relative" onClick={() => this.handleApply(index)} data-id={`coupon-${index}`} data-code={coupon.code}>
										<div className="single-cart-coupon mt-3">
											<div className="d-flex justify-content-start mr-2">
												<img src={checkAssetURL("/assets/img/various/offer.png")} alt="Coupon" className="single-cart-coupon-image mr-3" style={{ width: "5rem", height:"auto" }}/>
												<div className="position-relative">
													<p className="mb-0">
														<b>{coupon.code}</b>
													</p>
													<p className="mb-0">
													{coupon.discount_type === "AMOUNT" ? (
														<div className="coupon-sentence">
																<p className="mb-0"><b>{localStorage.getItem("currencyFormat")}{coupon.discount} Off</b> {coupon.max_discount !== null && ("Upto " + localStorage.getItem("currencyFormat") + coupon.max_discount)}</p>
																<p className="mb-0">{(coupon.min_subtotal !== null && coupon.min_subtotal > 0) && ("Above " + localStorage.getItem("currencyFormat") + coupon.min_subtotal)}</p>
														</div>
													) : (
														<div className="coupon-sentence">
															<p className="mb-0"><b>{coupon.discount}% Off</b> {coupon.max_discount !== null && ("Upto " + localStorage.getItem("currencyFormat") + coupon.max_discount)}</p>
															<p className="mb-0">{(coupon.min_subtotal !== null && coupon.min_subtotal > 0) && ("Above " + localStorage.getItem("currencyFormat") + coupon.min_subtotal)}</p>
														</div>
													)}
													</p>
												</div>
											</div>
											<div><button className="btn btn-success">Apply</button></div>
										</div>
										<Ink duration="500" />
									</div>
								))
							)
						}
						</div>
                    
				</div>
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
)(CouponList);
