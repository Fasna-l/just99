import { Drawer, makeStyles } from "@material-ui/core";
import React, { Component } from "react";

import Ink from "react-ink";
import { checkAssetURL } from "../../../helpers/truncate";

class CustomizationNew extends Component {

	state = {
		AlreadyProduct: null,
		already_product_status: false,
		addonQuantities: {},
	};

	componentDidMount() {
		this.props.forceUpdate();
		console.log(this.props.cartProducts);

		if (this.props.cartProducts && this.props.cartProducts.find((cp) => cp.id === this.props.product.id) !== undefined) {
			console.log("already product in cart");
			this.setState({ already_product_status: true });
			console.log(this.props.cartProducts.find((cp) => cp.id === this.props.product.id));

			// Filter cartProducts to get all products with the same id
			const filteredCartProducts = this.props.cartProducts.filter(
				(cp) => cp.id === this.props.product.id
			);

			// Set the filtered products in state
			this.setState({ AlreadyProduct: filteredCartProducts });

			// Log the filtered products
			console.log(filteredCartProducts);
		}
	}


	componentWillReceiveProps(nextProps) {
		if (nextProps !== this.props) {
			console.log("componentWillReceiveProps")
			console.log(this.props.cartProducts);

			if (nextProps.cartProducts && nextProps.cartProducts.find((cp) => cp.id === nextProps.product.id) !== undefined) {
				console.log("already product in cart");
				// this.setState({ already_product_status: true });
				console.log(nextProps.cartProducts.find((cp) => cp.id === nextProps.product.id));

				// Filter cartProducts to get all products with the same id
				const filteredCartProducts = nextProps.cartProducts.filter(
					(cp) => cp.id === nextProps.product.id
				);

				// Set the filtered products in state
				this.setState({ AlreadyProduct: filteredCartProducts });

				// Log the filtered products
				console.log(filteredCartProducts);
			}
			else {
				this.setState({ already_product_status: false, AlreadyProduct: null })
			}
		}

	}

	_processAddons = (product) => {
		let addons = [];
		addons["selectedaddons"] = [];

		let radio = document.querySelectorAll("input[type=radio]:checked");
		for (let i = 0; i < radio.length; i++) {
			addons["selectedaddons"].push({
				addon_category_name: radio[i].name,
				addon_id: radio[i].getAttribute("data-addon-id"),
				addon_name: radio[i].getAttribute("data-addon-name"),
				price: radio[i].value,
			});
		}

		// Loop through the addons and add quantities
		product.addon_categories.forEach((addon_category) => {
			addon_category.addons.forEach((addon) => {
				const quantity = this.state.addonQuantities[addon.id] || 0;
				if (quantity > 0) {
					addons["selectedaddons"].push({
						addon_category_name: addon_category.name,
						addon_id: addon.id,
						addon_name: `X${quantity} ${addon.name}`,
						price: addon.price * quantity,
					});
				}
			});
		});


		this.props.addProduct(Object.assign(addons, product));
	};


	calculateFinalPrice = (product) => {
		let final_price = 0
		let addons = [];
		addons["selectedaddons"] = [];


		let radio = document.querySelectorAll("input[type=radio]:checked");
		for (let i = 0; i < radio.length; i++) {
			final_price += Number(radio[i].value)
		}


		product.addon_categories.forEach((addon_category) => {
			addon_category.addons.forEach((addon) => {
				const quantity = this.state.addonQuantities[addon.id] || 0;
				if (quantity > 0) {
					final_price += Number(addon.price * quantity)

				}
			});
		});


		final_price += Number(product.price)
		console.log(product)
		return Number(final_price)
	};




	_getItemTotal = (item) => {
		let addonTotal = 0;
		let sum = 0;
		if (item.selectedaddons) {
			item.selectedaddons.map((addonArray) => {
				addonTotal += parseFloat(addonArray.price);
				return addonTotal;
			});
		}

		sum += Number(item.price) + Number(addonTotal);
		sum = parseFloat(sum);

		if (localStorage.getItem("currencySymbolAlign") === "left") {
			return localStorage.getItem("currencyFormat") + Number(sum);
		} else {
			return Number(sum) + localStorage.getItem("currencyFormat");
		}
	};

	_getItemTotalWithQuantity = (item) => {
		let addonTotal = 0;
		let sum = 0;
		if (item.selectedaddons) {
			item.selectedaddons.map((addonArray) => {
				addonTotal += parseFloat(addonArray.price);
				return addonTotal;
			});
		}
		sum += item.price * item.quantity + addonTotal * item.quantity;
		sum = parseFloat(sum);

		if (localStorage.getItem("currencySymbolAlign") === "left") {
			return localStorage.getItem("currencyFormat") + Number(sum);
		} else {
			return Number(sum) + localStorage.getItem("currencyFormat");
		}
	};


	removeProductQuantity = async (product) => {
		console.log(product)

		const { cartProducts, updateCart } = this.props;
		console.log(cartProducts)
		const index = cartProducts.findIndex(
			(p) => p.id === product.id && JSON.stringify(p) === JSON.stringify(product)
		);
		//if product is in the cart then index will be greater than 0
		if (index >= 0) {
			cartProducts.forEach((cp) => {
				if (cp.id === product.id) {
					if (JSON.stringify(cp) === JSON.stringify(product)) {
						if (cp.quantity === 1) {
							//if quantity is 1 then remove product from cart
							cartProducts.splice(index, 1);
						} else {
							//else decrement the quantity by 1
							cp.quantity -= 1;
						}
					}
				}
			});

			console.log(cartProducts)
			await updateCart(cartProducts);

		}


	};

	render() {

		const drawerPaperStyle = {
			borderTopLeftRadius: '24px',
			borderTopRightRadius: '24px',
			"max-height": '75vh',
			backgroundColor: "#f0f0f5",
		};

		const { product, customization_drawer, handlePopupClose } = this.props;

		return (
			<React.Fragment>

				<Drawer
					anchor="bottom"
					style={{ borderRadius: "15px 15px 0 0" }}
					open={customization_drawer}
					onClose={handlePopupClose}
					PaperProps={{ style: drawerPaperStyle }}
				>
					{/* Container for the entire drawer content */}
					<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

						{/* Fixed Header Section */}
						<div style={{
							padding: "1rem 2rem", position: "sticky", top: 0, zIndex: 10,

							backgroundColor: "#f0f0f5",
						}}>
							<button
								style={{
									position: "absolute",
									right: "20px",
									top: "20px",
									background: "none",
									border: "none",
									cursor: "pointer"
								}}
								onClick={handlePopupClose}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 36 36">
									<path d="M28.5 9.62L26.38 7.5 18 15.88 9.62 7.5 7.5 9.62 15.88 18 7.5 26.38l2.12 2.12L18 20.12l8.38 8.38 2.12-2.12L20.12 18z"></path>
								</svg>
							</button>
							<div className="d-flex align-items-center mt-2">
								{product && product.image &&
									<>
										<img
											className="customize_item_image_fsfbs"
											src={checkAssetURL(product.image)}
											alt={product.name}  // Adding alt attribute for accessibility
										/>

									</>
								}
								<div className="ml-3 customize_item_name_zhjgcjg">
									{product.name}
								</div>
							</div>

							<div className="mt-4">
								{this.state.already_product_status ?
									<h2 className="customization_heading_jadb">Repeat  customisation?</h2>

									:
									<h2 className="customization_heading_jadb">{localStorage.getItem("customizationHeading")}</h2>


								}

								<hr style={{ borderColor: "#ccc" }} />
							</div>
						</div>

						{!this.state.already_product_status ?
							<>

								{/* Scrollable Content Section */}
								<div style={{ overflowY: "auto", padding: "0rem 2rem 1rem ", flexGrow: 1 }}>
									{product.addon_categories.map((addon_category) => (
										<div key={addon_category.id}>
											<div className="addon_category_name_axjye mb-2">
												{addon_category.name}
											</div>
											{addon_category.addons.length && (
												<React.Fragment>
													<div className="addon_list_ajcjh ">
														{addon_category.addons.map((addon, index) => (
															<React.Fragment key={addon.id}>
																<div className="addon_single_dahjgajhda "
																	style={{
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "space-between",

																	}}

																>
																	<label className="text addon-label addon_name_zcvsah" htmlFor={addon.name}>
																		{addon.name}{" "}
																		<span className="addon-label-price ml-1">
																			{localStorage.getItem("hidePriceWhenZero") === "true" &&
																				addon.price === "0.00" ? null : (
																				<React.Fragment>
																					{localStorage.getItem("currencySymbolAlign") ===
																						"left" &&
																						localStorage.getItem("currencyFormat")}
																					{Number(addon.price)}{" "}
																					{localStorage.getItem("currencySymbolAlign") ===
																						"right" &&
																						localStorage.getItem("currencyFormat")}
																				</React.Fragment>
																			)}
																		</span>
																	</label>
																	{addon_category.type !== "SINGLE" &&
																		<div className="btn-group btn-group-sm ">
																			<button
																				type="button"
																				className="btn btn-add-remove"
																				style={{
																					color: localStorage.getItem("cartColor-bg"),
																				}}
																				onClick={() => {
																					const newQuantity = (this.state.addonQuantities[addon.id] || 0) - 1;
																					if (newQuantity >= 0) {

																						this.setState({
																							addonQuantities: {
																								...this.state.addonQuantities,
																								[addon.id]: newQuantity,
																							},
																						});
																					}
																				}}
																			>
																				-
																			</button>
																			<button type="button" className="btn btn-quantity">
																				{this.state.addonQuantities[addon.id] || 0}
																			</button>
																			<button
																				type="button"
																				className="btn btn-add-remove"
																				style={{
																					color: localStorage.getItem("cartColor-bg"),
																				}}
																				onClick={() => {
																					if (addon_category.addon_limit === 0 || ((this.state.addonQuantities[addon.id] || 0) < addon_category.addon_limit)) {
																						this.setState({
																							addonQuantities: {
																								...this.state.addonQuantities,
																								[addon.id]: (this.state.addonQuantities[addon.id] || 0) + 1,
																							},
																						})
																					}else{
																						alert(`You can only add up to ${addon_category.addon_limit} of this addon.`)
																					}

																				}

																				}
																			>
																				<span className="btn-inc">+</span>
																				<Ink duration="500" />
																			</button>
																		</div>}
																	<input
																		className="mr-2"
																		style={{
																			width: "20px",         // Adjust size
																			height: "20px",        // Adjust size
																			accentColor: localStorage.getItem("storeColor") // Adjust color
																		}}

																		type={
																			addon_category.type === "SINGLE" ? "radio" : "hidden"
																		}

																		name={addon_category.name}
																		data-addon-id={addon.id}
																		data-addon-name={addon_category.type === "SINGLE" ? "X1 " + addon.name : "X" + (this.state.addonQuantities[addon.id] || 1) + " " + addon.name}
																		value={addon.price}
																		defaultChecked={
																			addon_category.type === "SINGLE" && index === 0 && true
																		}
																		id={`uId${addon_category.id}`}
																		onClick={() => {
																			if (addon_category.addon_limit > 0) {
																				var uId = addon_category.id;
																				var checks = document.querySelectorAll(
																					"#uId" + uId
																				);
																				var max = addon_category.addon_limit;
																				for (var i = 0; i < checks.length; i++) {
																					checks[i].onclick = selectiveCheck;
																					function selectiveCheck() {
																						var checkedChecks = document.querySelectorAll(
																							"#uId" + uId + ":checked"
																						);
																						if (checkedChecks.length >= max + 1)
																							return false;
																					}
																				}
																			}
																			this.props.forceUpdate()
																		}}
																	/>
																</div>
															</React.Fragment>
														))}
													</div>
												</React.Fragment>
											)}
											<hr />
										</div>
									))}


									<div style={{
										marginBottom: "70px"
									}} />
								</div>

								<div className="customization_footer_dszfjzfgjhk " >
									<div className="d-flex justify-content-between align-items-center">
										<div className="customization_footer_div_dssfklsagjhk">
											<div>
												<div className="customization_footer_quantity_dssfklsagjhk">


													<div className="mx-3 addon_name_zcvsah">
														{localStorage.getItem("currencyFormat")}{" "}
														{this.calculateFinalPrice(product)}
													</div>
												</div>
											</div>
										</div>
										<div className="customization_footer_button_div_dsddzfgjhk">
											<button
												className="btn btn-lg customization_footer_add_button_dsddzfgjhk "
												onClick={() => {
													if (this.calculateFinalPrice(product) > 0) {
														this._processAddons(product);
														handlePopupClose();
													} else {
														alert("Please select at least one addon or quantity to proceed.");

													}

												}}
												style={{
													backgroundColor: localStorage.getItem("cartColorBg"),
													color: localStorage.getItem("cartColorText"),

												}}
											>

												{localStorage.getItem("customizationDoneBtnText")}


											</button>
										</div>
									</div>

								</div>

							</>
							:
							<>

								{/* Scrollable Content Section */}
								<div style={{ overflowY: "auto", padding: "1rem 2rem", flexGrow: 1 }}>


									{this.state.AlreadyProduct && this.state.AlreadyProduct &&
										this.state.AlreadyProduct.map((item, index) => (
											<>
												<div className="d-flex justify-content-between align-items-center already_addon_list_ajcjh mb-10 p-10">
													<div className=" mx-2"

													>
														<div className="already_addon_selected_sfkg"
															style={{
																"font-size": " 18px"
															}}
														>
															{item.name}
														</div>
														<div className="already_addon_selected_final_price_sfkg already_addon_selected_sfkg"

														>
															{localStorage.getItem("hidePriceWhenZero") === "true" &&
																this._getItemTotal(item) === "0.00" ? null : (
																<React.Fragment>{this._getItemTotal(item)}</React.Fragment>
															)}
														</div>
														<div className="already_item_price already_addon_selected_sfkg">
															{item.selectedaddons && item.selectedaddons.map((addon, index) => (
																<>
																	• {addon.addon_name.replace(/^1X\s*/, '')} {" "}
																</>

															)

															)}
														</div>

													</div>
													<div className="d-flex justify-content-center align-items-center flex-column">
														<div>
															<div>
																<div className="item_button_dasjk item-center text-center">
																	<button className="btn_remove_dgjkf btn"
																		onClick={() => {
																			this.removeProductQuantity(item);
																			this.props.forceUpdate()
																		}}
																	>
																		<div className="sc-gsnTZi dGssTp">-</div>
																		<Ink duration={500} />
																	</button>
																	<button className="btn_remove_dgjkf btn">
																		<div className="sc-gsnTZi dGssTp">
																			{item.quantity}
																		</div>
																	</button>
																	<button className="btn_remove_dgjkf btn"
																		onClick={() => {
																			this.props.addProduct(item);
																			this.props.forceUpdate()
																			// handlePopupClose();
																		}}
																	>
																		<div className="sc-gsnTZi dGssTp">+</div>
																		<Ink duration={500} />
																	</button>
																</div>
															</div>
														</div>
														<div className="already_addon_selected_final_price_sfkg mt-2">
															<React.Fragment>{this._getItemTotalWithQuantity(item)}</React.Fragment>
														</div>

													</div>
												</div>

											</>


										))}



									<div style={{
										marginBottom: "150px"
									}} />
								</div>

								<div className="customization_footer_dszfjzfgjhk " >
									<div className="d-flex justify-content-between align-items-center">
										<div className="customization_footer_button_div_dsddzfgjhk"
											style={{
												width: "96%"
											}}
										>
											<button
												className="btn btn-lg customization_footer_add_button_dsddzfgjhk "
												onClick={() => {
													this.setState({ already_product_status: false })
													this.props.forceUpdate()
												}}
												style={{
													backgroundColor: 'transparent',
													color: localStorage.getItem("cartColorBg"),
													border: `1px solid ${localStorage.getItem("cartColorBg")}`,
												}}
											>
												<span class="mr-2">+</span>
												ADD NEW Customisation
											</button>
										</div>


									</div>

								</div>
							</>
						}

					</div>
				</Drawer>

			</React.Fragment>
		);
	}
}
export default CustomizationNew;
