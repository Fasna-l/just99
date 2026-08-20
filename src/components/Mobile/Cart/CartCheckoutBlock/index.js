import React, { Component } from "react";

// import DelayLink from "../../../helpers/delayLink";
import Ink from "react-ink";
// import { Link } from "react-router-dom";
import { checkConfirmCart, checkCartItemsAvailability } from "../../../../services/confirmCart/actions";
import { connect } from "react-redux";
import { placeOrder } from "../../../../services/checkout/actions";
import { addProduct } from "../../../../services/cart/actions";
import { updateCart } from "../../../../services/total/actions";
import { getCartQuantityForItem, getMaxQuantityPerOrder, getQuantityLimitMessage } from "../../../helpers/cartQuantityLimit";

class CartCheckoutBlock extends Component {
	static contextTypes = {
		router: () => null,
	};
	// state = {
	//     loading: true,
	//     is_operational: true
	// };

	state = {
		process_cart_loading: false,
	};

	componentDidMount() {
		// this.props.checkForItemsAvailability();
	}

	getUserSelected = () => {
		const storedUserSelected = localStorage.getItem("userSelected");
		const restaurantDeliveryType = this.props.restaurant_info && this.props.restaurant_info.delivery_type;

		if (storedUserSelected === "DELIVERY" || storedUserSelected === "SELFPICKUP") {
			return storedUserSelected;
		}

		return restaurantDeliveryType === 2 || restaurantDeliveryType === "2" ? "SELFPICKUP" : "DELIVERY";
	};

	componentWillReceiveProps(nextProps) {
		// const { checkout} = this.props;
		if (nextProps.checkout !== this.props.checkout) {
			//redirect to running order page
			this.context.router.history.push("/running-order");
		}
		// console.log("NEXT PROPS - " + nextProps.is_operational);
		// if (nextProps.is_operational !== this.props.is_operational) {
		//     console.log("Came here -> FROM CHILD");
		//     this.setState({ is_operational: false, loading: false });
		// }
	}

	processCart = () => {
		const userSelected = this.getUserSelected();
		const orderDate = localStorage.getItem("orderDate");
		const orderSlot = localStorage.getItem("orderSlot");
		console.log("processCart")
		console.log(this.props.restaurant_info)
		if (localStorage.getItem("userSelected") !== userSelected) {
			localStorage.setItem("userSelected", userSelected);
		}

		if (this.props.restaurant_info && this.props.restaurant_info.only_schedule_orders) {
			if (!(orderDate !== null && orderSlot !== null)) {
				this.props.handleOnlyScheduleOrderPopup(true);
				setTimeout(() => {
				this.props.handleOnlyScheduleOrderPopup(false);
				}, 2000);
				return;
			}

		}

		const {
			handleProcessCartLoading,
			checkCartItemsAvailability,
			cartProducts,
			addProduct,
			updateCart,
			checkConfirmCart,
			handleItemsAvailability,
			handleQuantityLimitMessage,
		} = this.props;

		handleProcessCartLoading(true);

		checkCartItemsAvailability(cartProducts).then((response) => {
			handleProcessCartLoading(false);
			this.setState({ process_cart_loading: false });

			if (response && response.length) {
				let isSomeInactive = false;
				let quantityLimitMessage = null;
				response.map((arrItem) => {
					//find the item in the cart
					let item = cartProducts.find((item) => item.id === arrItem.id);
					//get new price and is_active status and set it.
					item.is_active = arrItem.is_active;
					item.max_quantity_per_order = arrItem.max_quantity_per_order;

					if (!item.freeitem) {
						item.price = arrItem.price;
					}
					if (item.freeitem) {
						item.quantity = 1;
					}
					addProduct(item);
					const maxQuantityPerOrder = getMaxQuantityPerOrder(arrItem);
					if (
						!quantityLimitMessage &&
						maxQuantityPerOrder > 0 &&
						getCartQuantityForItem(cartProducts, arrItem.id) > maxQuantityPerOrder
					) {
						quantityLimitMessage = getQuantityLimitMessage(item, maxQuantityPerOrder);
					}

					if (!isSomeInactive) {
						if (!arrItem.is_active) {
							isSomeInactive = true;
						}
					}
					return item;
				});
				if (isSomeInactive) {
					updateCart(this.props.cartProducts);
					handleItemsAvailability(false);
				} else if (quantityLimitMessage) {
					updateCart(this.props.cartProducts);
					handleQuantityLimitMessage(quantityLimitMessage);
				} else {
					updateCart(this.props.cartProducts);
					checkConfirmCart();
					this.context.router.history.push("/checkout");
				}
			}
		});
	};

	gotoNewAddressPage = () => {
		const saveFromCart = new Promise((resolve) => {
			localStorage.setItem("fromCart", 1);
			resolve("Saved");
		});
		saveFromCart.then(() => {
			this.context.router.history.push("/search-location");
		});
	};

	gotoMyAddressPage = () => {
		localStorage.setItem("fromCart", 1);
		this.context.router.history.push("/my-addresses");
	};
	gotoLoginPage = () => {
		localStorage.setItem("fromCartToLogin", 1);
		this.context.router.history.push("/login");
	};

	render() {
		// console.log("LOADING - " + this.state.loading);

		const { user } = this.props;
		const userSelected = this.getUserSelected();
		const defaultAddress = user.data && user.data.default_address;

		return (
			<React.Fragment>

				
				<div
					className="bg-white cart-checkout-block"
					style={{
						height: user.success && userSelected === "SELFPICKUP" ? "auto" : "22vh",
					}}
				>
					{user.success ? (
						defaultAddress == null ? (
							<React.Fragment>
								{userSelected === "SELFPICKUP" && (
									<div style={{ marginTop: "1.6rem" }}>
										<div
											onClick={this.processCart}
											className="btn btn-lg btn-make-payment"
											style={{
												backgroundColor: localStorage.getItem("cartColorBg"),
												color: localStorage.getItem("cartColorText"),
												position: "relative",
											}}
										>
											{localStorage.getItem("checkoutSelectPayment")}
											<Ink duration={400} />
										</div>
									</div>
								)}
								{userSelected === "DELIVERY" && (
									<div className="p-15">
										<h2 className="almost-there-text m-0 pb-5">
											{localStorage.getItem("cartSetYourAddress")}
										</h2>
										<button
											onClick={this.gotoNewAddressPage}
											className="btn btn-lg btn-continue"
											style={{
												position: "relative",
												backgroundColor: localStorage.getItem("storeColor"),
											}}
										>
											{localStorage.getItem("buttonNewAddress")}
											<Ink duration={500} />
										</button>
									</div>
								)}
							</React.Fragment>
						) : (
							<React.Fragment>
								{userSelected === "DELIVERY" && (
										<React.Fragment>
											<div className="px-15 py-10">
												<button
													onClick={this.gotoMyAddressPage}
													className="change-address-text m-0 p-5 pull-right"
													style={{
														color: localStorage.getItem("storeColor"),
													}}
												>
													{localStorage.getItem("cartChangeLocation")}
													<Ink duration={400} />
												</button>
												<h2 className="deliver-to-text m-0 pl-0 pb-5">
													{localStorage.getItem("cartDeliverTo")}
												</h2>
												<div className="user-address truncate-text m-0 pt-10">
													{defaultAddress.address}
													{defaultAddress.house !== null && (
														<p className="truncate-text">{defaultAddress.house}</p>
													)}
												</div>
											</div>
										</React.Fragment>
									)}

								<React.Fragment>
									{this.props.is_operational ? (
										<div style={{ marginTop: "1.6rem" }}>
											<div
												onClick={this.processCart}
												className="btn btn-lg btn-make-payment"
												style={{
													backgroundColor: localStorage.getItem("cartColorBg"),
													color: localStorage.getItem("cartColorText"),
													position: "relative",
												}}
											>
												{localStorage.getItem("checkoutSelectPayment")}
												<Ink duration={400} />
											</div>
										</div>
									) : (
										<div className="auth-error bg-danger">
											<div className="error-shake">
												{localStorage.getItem("cartRestaurantNotOperational")}
											</div>
										</div>
									)}
								</React.Fragment>
							</React.Fragment>
						)
					) : (
						<div className="p-15">
							<h2 className="almost-there-text m-0 pb-5">{localStorage.getItem("cartLoginHeader")}</h2>
							<span className="almost-there-sub text-muted">
								{localStorage.getItem("cartLoginSubHeader")}
							</span>
							<button
								onClick={this.gotoLoginPage}
								className="btn btn-lg btn-continue"
								style={{
									backgroundColor: localStorage.getItem("storeColor"),
									position: "relative",
								}}
							>
								{localStorage.getItem("cartLoginButtonText")}
								<Ink duration={500} />
							</button>
						</div>
					)}
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.user.user,
	addresses: state.addresses.addresses,
	cartProducts: state.cart.products,
	cartTotal: state.total.data,
	coupon: state.coupon.coupon,
	checkout: state.checkout.checkout,
	restaurant: state.restaurant,
});

export default connect(
	mapStateToProps,
	{
		placeOrder,
		checkConfirmCart,
		checkCartItemsAvailability,
		addProduct,
		updateCart,
	}
)(CartCheckoutBlock);
