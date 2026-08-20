import React, { Component } from "react";
import { addProduct, removeProduct } from "../../../../../services/cart/actions";

import Customization from "../../Customization";
import Fade from "react-reveal/Fade";
import Ink from "react-ink";
import LazyLoad from "react-lazyload";

import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { checkAssetURL } from "../../../../helpers/truncate";
import ProgressiveImage from "react-progressive-image";
import CustomizationNew from "../../CustomizationNew";

class RecommendedItems extends Component {
	state = {
		update: true,
		items_backup: [],
		searching: false,
		data: [],
		filterText: null,
		filter_items: [],
		items: [],
		queryLengthError: false,
		customization_item: null,
		customization_drawer: false,
	};

	static contextTypes = {
		router: () => null,
	};

	forceStateUpdate = () => {
		setTimeout(() => {
			this.forceUpdate();
			this.props.update();
		}, 100);
	};

	handlePopupOpen = (item) => {
		this.setState({ customization_item: item, customization_drawer: true });
		//for forcing state update every 100ms to prevent misuse of changing addon price
		// this.rerenderInterval = setInterval(() => {
		// 	this.forceStateUpdate();
		// }, 100);
	};


	handlePopupClose = () => {
		this.setState({ customization_drawer: false, customization_item: null });
		this.forceStateUpdate();
		clearInterval(this.rerenderInterval);
	};

	render() {
		const { addProduct, removeProduct, product, cartProducts, restaurant, updateCart } = this.props;
		product.quantity = 1;
		return (
			<React.Fragment>
				{localStorage.getItem("recommendedLayoutV2") === "true" ? (
					<div key={product.id} className="product-slider-item">
						<div className="block border-radius-275 recommended-item-shadow">
							<div
								className="block-content recommended-item-content py-5 mb-5"
								style={{ position: "relative", height: "17.5rem" }}
							>
								<React.Fragment>
									<Link to={restaurant.slug + "/" + product.id}>
										<LazyLoad>
											<ProgressiveImage
												src={checkAssetURL(product.image)}
												placeholder={checkAssetURL("/assets/img/various/blank-white.jpg")}
											>
												{(src, loading) => (
													<img
														src={src}
														alt={product.name}
														className="recommended-item-image"
													/>
												)}
											</ProgressiveImage>


										</LazyLoad>
									</Link>

									<React.Fragment>
										{cartProducts.find((cp) => cp.id === product.id) !== undefined && (
											<Fade duration={150}>
												<div
													className="quantity-badge-recommended"
													style={{
														backgroundColor: localStorage.getItem("storeColor"),
													}}
												>
													<span>
														{product.addon_categories && product.addon_categories.length ? (
															<React.Fragment>
																<i
																	className="si si-check"
																	style={{ lineHeight: "1.3rem" }}
																/>
															</React.Fragment>
														) : (
															<React.Fragment>
																{
																	cartProducts.find((cp) => cp.id === product.id)
																		.quantity
																}
															</React.Fragment>
														)}
													</span>
												</div>
											</Fade>
										)}
									</React.Fragment>
								</React.Fragment>
								<div className="my-2 recommended-item-meta">
									<div className="px-5 text-left recommended-v2-ellipsis-meta">
										{localStorage.getItem("showVegNonVegBadge") === "true" ? (
											product.is_veg !== null ? (
												<div className="d-flex justify-content-between align-items-center">
													{product.is_veg ? (
														<React.Fragment>
															<img
																src={checkAssetURL("/assets/img/various/veg-icon-bg.png")}
																alt="Veg"
																style={{ width: "1rem", alignSelf: "center" }}
																className="mr-1 my-1"
															/>
															<span className="meta-name">{product.name}</span>
														</React.Fragment>
													) : (
														<React.Fragment>
															<img
																src={checkAssetURL("/assets/img/various/non-veg-icon-bg.png")}
																alt="Non-Veg"
																style={{ width: "1rem", alignSelf: "center" }}
																className="mr-1 my-1"
															/>
															<span className="meta-name">{product.name}</span>
														</React.Fragment>
													)}
												</div>
											) : (
												<span className="meta-name">{product.name}</span>
											)
										) : (
											<span className="meta-name">{product.name}</span>
										)}
									</div>
									<div className="ml-2">
										<span className="meta-price">
											{localStorage.getItem("hidePriceWhenZero") === "true" &&
												product.price === "0.00" ? (
												<span style={{ height: "20px", display: "block" }}> </span>
											) : (
												<React.Fragment>
													{product.old_price > 0 && (
														<span className="strike-text mr-1">
															{" "}
															{localStorage.getItem("currencySymbolAlign") === "left" &&
																localStorage.getItem("currencyFormat")}{" "}
															{product.old_price}
															{localStorage.getItem("currencySymbolAlign") === "right" &&
																localStorage.getItem("currencyFormat")}
														</span>
													)}

													<span>
														{localStorage.getItem("currencySymbolAlign") === "left" &&
															localStorage.getItem("currencyFormat")}{" "}
														{product.price}
														{localStorage.getItem("currencySymbolAlign") === "right" &&
															localStorage.getItem("currencyFormat")}
													</span>
												</React.Fragment>
											)}
										</span>
									</div>
									<div
										className="d-flex btn-group btn-group-sm my-5 btn-full justify-content-around"
										role="group"
										aria-label="btnGroupIcons1"
										style={{ height: "40px" }}
									>
										{product.is_active ? (
											<React.Fragment>
												{product.addon_categories && product.addon_categories.length ? (
													<>
													
													<button

															type="button"
															className="btn btn-add-remove"
															style={{
																color: localStorage.getItem("cartColor-bg"),
															}}
															onClick={() => {
																const filteredCartProducts = cartProducts.filter(
																	(cp) => cp.id === product.id
																);
																console.log(filteredCartProducts)
																if (filteredCartProducts && filteredCartProducts.length > 1) {
																	this.handlePopupOpen(product)
																}
																else {
																	product.quantity = 1;
																	removeProduct(product);
																	this.forceStateUpdate();
																}

															}}
														>
															<span className="btn-dec">-</span>
															<Ink duration="500" />
														</button>
													</>
												) : (
													<button
														type="button"
														className="btn btn-add-remove"
														style={{
															color: localStorage.getItem("cartColor-bg"),
														}}
														onClick={() => {
															removeProduct(product);
															this.forceStateUpdate();
														}}
													>
														<span className="btn-dec">-</span>
														<Ink duration="500" />
													</button>
												)}
												{product.addon_categories.length ? (
													<>
														<button

														onClick={() => {
															const filteredCartProducts = cartProducts.filter(
																(cp) => cp.id === product.id
															);
															console.log(filteredCartProducts)
															if (filteredCartProducts && filteredCartProducts.length > 1) {
																this.handlePopupOpen(product)
															}
															else {
																product.quantity = 1;
																removeProduct(product);
																this.forceStateUpdate();
															}

														}}
														className="btn_remove_dgjkf btn "

													>
														<div class="sc-gsnTZi dGssTp ">
															-
														</div>


													</button>
													</>
												) : (
													<button
														type="button"
														className="btn btn-add-remove"
														style={{
															color: localStorage.getItem("cartColor-bg"),
														}}
														onClick={() => {
															addProduct(product);
															this.forceStateUpdate();
														}}
													>
														<span className="btn-inc">+</span>
														<Ink duration="500" />
													</button>
												)}
											</React.Fragment>
										) : (
											<div className="text-danger text-item-not-available d-flex align-items-center">
												{localStorage.getItem("cartItemNotAvailable")}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div key={product.id} className="col-6 p-0 d-flex justify-content-center px-5">
						<div className="block border-radius-275 recommended-item-shadow mb-3">
							<div
								className="block-content recommended-item-content py-5 mb-5"
								style={{ position: "relative", height: "17.5rem" }}
							>
								<Link to={restaurant.slug + "/" + product.id}>
									<img src={checkAssetURL(product.image)} alt={product.name} className="recommended-item-image" />
								</Link>

								<React.Fragment>
									{cartProducts.find((cp) => cp.id === product.id) !== undefined && (
										<Fade duration={150}>
											<div
												className="quantity-badge-recommended"
												style={{
													backgroundColor: localStorage.getItem("storeColor"),
												}}
											>
												<span>
													{product.addon_categories && product.addon_categories.length ? (
														<React.Fragment>
															<i
																className="si si-check"
																style={{ lineHeight: "1.3rem" }}
															/>
														</React.Fragment>
													) : (
														<React.Fragment>
															{cartProducts.find((cp) => cp.id === product.id).quantity}
														</React.Fragment>
													)}
												</span>
											</div>
										</Fade>
									)}
								</React.Fragment>
								<div className="my-2 recommended-item-meta">
									<div className="px-5 text-left recommended-v2-ellipsis-meta">
										{localStorage.getItem("showVegNonVegBadge") === "true" ? (
											product.is_veg !== null ? (
												<div className="d-flex justify-content-left align-items-center">
													{product.is_veg ? (
														<React.Fragment>
															<img
																src={checkAssetURL("/assets/img/various/veg-icon-bg.png")}
																alt="Veg"
																style={{ width: "1rem", alignSelf: "center" }}
																className="mr-1 my-1"
															/>
															<span className="meta-name">{product.name}</span>
														</React.Fragment>
													) : (
														<React.Fragment>
															<img
																src={checkAssetURL("/assets/img/various/non-veg-icon-bg.png")}
																alt="Non-Veg"
																style={{ width: "1rem", alignSelf: "center" }}
																className="mr-1 my-1"
															/>
															<span className="meta-name">{product.name}</span>
														</React.Fragment>
													)}
												</div>
											) : (
												<span className="meta-name">{product.name}</span>
											)
										) : (
											<span className="meta-name">{product.name}</span>
										)}

										<div className="ml-2">
											<span className="meta-price">
												{localStorage.getItem("hidePriceWhenZero") === "true" &&
													product.price === "0.00" ? null : (
													<React.Fragment>
														{product.old_price > 0 && (
															<span className="strike-text mr-1">
																{" "}
																{localStorage.getItem("currencySymbolAlign") ===
																	"left" &&
																	localStorage.getItem("currencyFormat")}{" "}
																{product.old_price}
																{localStorage.getItem("currencySymbolAlign") ===
																	"right" && localStorage.getItem("currencyFormat")}
															</span>
														)}

														<span>
															{localStorage.getItem("currencySymbolAlign") === "left" &&
																localStorage.getItem("currencyFormat")}{" "}
															{product.price}
															{localStorage.getItem("currencySymbolAlign") === "right" &&
																localStorage.getItem("currencyFormat")}
														</span>
													</React.Fragment>
												)}
											</span>
										</div>

										<div
											className="d-flex btn-group btn-group-sm my-5 btn-full justify-content-around"
											role="group"
											aria-label="btnGroupIcons1"
											style={{ height: "40px" }}
										>
											{product.is_active ? (
												<React.Fragment>
													{product.addon_categories && product.addon_categories.length ? (
														<button

															type="button"
															className="btn btn-add-remove"
															style={{
																color: localStorage.getItem("cartColor-bg"),
															}}
															onClick={() => {
																const filteredCartProducts = cartProducts.filter(
																	(cp) => cp.id === product.id
																);
																console.log(filteredCartProducts)
																if (filteredCartProducts && filteredCartProducts.length > 1) {
																	this.handlePopupOpen(product)
																}
																else {
																	product.quantity = 1;
																	removeProduct(product);
																	this.forceStateUpdate();
																}

															}}
														>
															<span className="btn-dec">-</span>
															<Ink duration="500" />
														</button>
													) : (
														<button
															type="button"
															className="btn btn-add-remove"
															style={{
																color: localStorage.getItem("cartColor-bg"),
															}}
															onClick={() => {
																removeProduct(product);
																this.forceStateUpdate();
															}}
														>
															<span className="btn-dec">-</span>
															<Ink duration="500" />
														</button>
													)}
													{product.addon_categories && product.addon_categories.length ? (
														<>
															<button
																type="button"
																className="btn btn-add-remove"
																style={{
																	color: localStorage.getItem("cartColor-bg"),
																}}
																onClick={() => {
																	if (product.addon_categories &&
																		product.addon_categories.length) {
																		this.handlePopupOpen(product)

																	} else {
																		addProduct(product);
																		this.forceStateUpdate();
																	}


																}}
															>
																<span className="btn-inc">+</span>
																<Ink duration="500" />
															</button>
														</>
													) : (
														<button
															type="button"
															className="btn btn-add-remove"
															style={{
																color: localStorage.getItem("cartColor-bg"),
															}}
															onClick={() => {
																addProduct(product);
																this.forceStateUpdate();
															}}
														>
															<span className="btn-inc">+</span>
															<Ink duration="500" />
														</button>
													)}
												</React.Fragment>
											) : (
												<div className="text-danger text-item-not-available d-flex align-items-center">
													{localStorage.getItem("cartItemNotAvailable")}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				{this.state.customization_drawer && <CustomizationNew
					cartProducts={cartProducts}
					customization_drawer={this.state.customization_drawer}
					product={this.state.customization_item}
					addProduct={addProduct}
					updateCart={updateCart}

					forceUpdate={this.forceStateUpdate}
					handlePopupClose={this.handlePopupClose}
				/>}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	cartProducts: state.cart.products,
});

export default connect(
	mapStateToProps,
	{ addProduct, removeProduct }
)(RecommendedItems);
