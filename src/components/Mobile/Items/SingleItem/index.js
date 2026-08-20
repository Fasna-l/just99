import React, { Component } from "react";
import { addProduct, removeProduct } from "../../../../services/cart/actions";
import {
	getRestaurantInfo,
	getRestaurantItems,
	getSingleItem,
	resetInfo,
	resetItems,
	getRestaurantInfoForLoggedInUser,
} from "../../../../services/items/actions";

import Customization from "../Customization";
import Fade from "react-reveal/Fade";
import FloatCart from "../../FloatCart";
import Ink from "react-ink";
import ItemBadge from "../ItemList/ItemBadge";
import LazyLoad from "react-lazyload";

import { Redirect } from "react-router";
import RestaurantInfo from "../RestaurantInfo";

import { connect } from "react-redux";
import ContentLoader from "react-content-loader";

import { getSettings } from "../../../../services/settings/actions";

import { getAllLanguages, getSingleLanguageData } from "../../../../services/languages/actions";
import CustomizationNew from "../CustomizationNew";
import { updateCart } from "../../../../services/total/actions";
import { checkAssetURL } from "../../../helpers/truncate";
import ItemRating from "../ItemListNew/ItemRating";
import ShowMore from "react-show-more";

import ProgressiveImage from "react-progressive-image";
import "../ItemListNew/item.css"

class SingleItem extends Component {
	state = {
		update: true,
		is_active: 1,
		loading: true,
		item_loading: true,
		customization_item: null,
		customization_drawer: false,
	};
	forceStateUpdate = () => {
		setTimeout(() => {
			this.forceUpdate();
			if (this.state.update) {
				this.setState({ update: false });
			} else {
				this.setState({ update: true });
			}
		}, 100);
	};

	componentDidMount() {
		this.props.getSettings();
		this.props.getAllLanguages();

		const { user } = this.props;
		user.success
			? this.props.getRestaurantInfoForLoggedInUser(this.props.restaurant)
			: this.props.getRestaurantInfo(this.props.restaurant);

		this.props.getSingleItem(this.props.itemId).then((response) => {
			if (response) {
				if (response.payload.id) {
					this.setState({ item_loading: false });
				}
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.restaurant_info.is_active === "undefined") {
			this.setState({ loading: true });
		}
		if (nextProps.restaurant_info.is_active === 1 || nextProps.restaurant_info.is_active === 0) {
			this.setState({ loading: false });
			this.setState({ is_active: nextProps.restaurant_info.is_active });
		}
		if (!this.state.is_active) {
			document.getElementsByTagName("html")[0].classList.add("page-inactive");
		}

		if (this.props.languages !== nextProps.languages) {
			if (localStorage.getItem("userPreferedLanguage")) {
				this.props.getSingleLanguageData(localStorage.getItem("userPreferedLanguage"));
			} else {
				if (nextProps.languages.length) {
					// console.log("Fetching Translation Data...");
					const id = nextProps.languages.filter((lang) => lang.is_default === 1)[0].id;
					this.props.getSingleLanguageData(id);
				}
			}
		}
	}

	componentWillUnmount() {
		document.getElementsByTagName("html")[0].classList.remove("page-inactive");
	}

	handlePopupClose = () => {
		this.setState({ customization_drawer: false, customization_item: null });
		this.forceStateUpdate();
		clearInterval(this.rerenderInterval);
	};

  handlePopupOpen = (item) => {
    this.setState({ customization_item: item, customization_drawer: true });
    //for forcing state update every 100ms to prevent misuse of changing addon price
    // this.rerenderInterval = setInterval(() => {
    // 	this.forceStateUpdate();
    // }, 100);
  };


	getTotalOfLowestPricedAddons = (product) => {
		let totalAddonPrice = 0;

		// Check if the product has addon categories
		if (product.addon_categories && product.addon_categories.length > 0) {
			product.addon_categories.forEach((category) => {
				// Check if the category type is "SINGLE"
				if (
					category.type === "SINGLE" &&
					category.addons &&
					category.addons.length > 0
				) {
					// Find the addon with the lowest price in this category
					const minPricedAddon = category.addons.reduce((prev, current) => {
						return parseFloat(current.price) < parseFloat(prev.price)
							? current
							: prev;
					});

					// Add the price of the lowest-priced addon to the total
					totalAddonPrice += parseFloat(minPricedAddon.price);
				}
			});
		}

		// Return the total price of the lowest-priced addons
		return totalAddonPrice;
	};


	render() {
		if (window.innerWidth > 768) {
			return <Redirect to="/" />;
		}
		// if (localStorage.getItem("storeColor") === null) {
		// 	return <Redirect to={"/"} />;
		// }

		const { addProduct, removeProduct, cartProducts, single_item, updateCart } = this.props;
		return (
			<React.Fragment>
				<RestaurantInfo
					history={this.props.history}
					restaurant={this.props.restaurant_info}
					withLinkToRestaurant={true}
				/>

				{single_item.id && (
					<div className="single-item px-15 mt-20 pb-100">
						<hr/>
						<div
							className="category-list-item single-item-img"
							style={{
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							{this.state.item_loading ? (
								<ContentLoader
									height={400}
									width={window.innerWidth}
									speed={1.2}
									primaryColor="#f3f3f3"
									secondaryColor="#ecebeb"
								>
									<rect x="0" y="0" rx="4" ry="4" width={window.innerWidth} height="290" />
									<rect x="0" y="300" rx="0" ry="0" width="115" height="20" />
									<rect x="0" y="325" rx="0" ry="0" width="75" height="16" />

									<rect x={window.innerWidth - 100} y="300" rx="4" ry="4" width="115" height="35" />
									<rect x={window.innerWidth - 50} y="300" rx="4" ry="4" width="115" height="35" />
								</ContentLoader>
							) : (
								<React.Fragment>
									<React.Fragment key={single_item.id}>
										<div>
											<span className="hidden">{(single_item.quantity = 1)}</span>

											{/* new code */}
											<>
												<div className="item_container_sxcc ">
													<div className="item_container_flex_dsamn d-flex justify-content-between">
														<div className="item_info_jagdd px-2">
															<div className="item_tags_ajhdgjq mt-2">
																{localStorage.getItem(
																	"showVegNonVegBadge"
																) === "true" &&
																	single_item.is_veg !== null && (
																		<React.Fragment>
																			{single_item.is_veg ? (
																				<img
																					src={checkAssetURL("/assets/img/various/veg-icon-bg.png")}
																					alt="Veg"
																					className="mr-1 veg-non-veg-badge-noimage_fhjksfk"
																				/>
																			) : (
																				<img
																					src={checkAssetURL("/assets/img/various/non-veg-icon-bg.png")}
																					alt="Non-Veg"
																					className="mr-1 veg-non-veg-badge-noimage_fhjksfk"
																				/>
																			)}
																		</React.Fragment>
																	)}

																<ItemBadge item={single_item} />
															</div>
															<div className="item_name_gfdw mt-2">
																{single_item.name}
															</div>
															<div className="item_price_hhrtdgf mt-2">
																<span className="">
																	{localStorage.getItem(
																		"hidePriceWhenZero"
																	) === "true" && single_item.price === "0.00" ? (
																		<>
																			<React.Fragment>
																				{this.getTotalOfLowestPricedAddons(
																					single_item
																				) > 0 && (
																						<span className="item_price_span_hhrtdgf">
																							{localStorage.getItem(
																								"currencySymbolAlign"
																							) === "left" &&
																								localStorage.getItem(
																									"currencyFormat"
																								)}{" "}
																							{this.getTotalOfLowestPricedAddons(
																								single_item
																							)}
																							{localStorage.getItem(
																								"currencySymbolAlign"
																							) === "right" &&
																								localStorage.getItem(
																									"currencyFormat"
																								)}
																						</span>
																					)}
																			</React.Fragment>
																		</>
																	) : (
																		<React.Fragment>
																			{single_item.old_price > 0 && (
																				<span className="item_old_price_span_hhdff">
																					{" "}
																					{localStorage.getItem(
																						"currencySymbolAlign"
																					) === "left" &&
																						localStorage.getItem(
																							"currencyFormat"
																						)}{" "}
																					{Number(single_item.old_price)}
																					{localStorage.getItem(
																						"currencySymbolAlign"
																					) === "right" &&
																						localStorage.getItem(
																							"currencyFormat"
																						)}
																				</span>
																			)}

																			<span className="item_price_span_hhrtdgf">
																				{localStorage.getItem(
																					"currencySymbolAlign"
																				) === "left" &&
																					localStorage.getItem(
																						"currencyFormat"
																					)}{" "}
																				{Number(single_item.price)}
																				{localStorage.getItem(
																					"currencySymbolAlign"
																				) === "right" &&
																					localStorage.getItem(
																						"currencyFormat"
																					)}
																			</span>

																			{single_item.old_price > 0 &&
																				localStorage.getItem(
																					"showPercentageDiscount"
																				) === "true" ? (
																				<React.Fragment>
																					<p
																						className="price-percentage-discount mb-0"
																						style={{
																							color: localStorage.getItem(
																								"cartColorBg"
																							),
																						}}
																					>
																						{parseFloat(
																							((parseFloat(single_item.old_price) -
																								parseFloat(single_item.price)) /
																								parseFloat(single_item.old_price)) *
																							100
																						).toFixed(0)}
																						{localStorage.getItem(
																							"itemPercentageDiscountText"
																						)}
																					</p>
																				</React.Fragment>
																			) : (
																				<br />
																			)}
																		</React.Fragment>
																	)}
																</span>
															</div>

															<div className="item_rating_saffgjq mt-2">
																<ItemRating item={single_item} />
															</div>
															<div className="item_desc_xhjfgjq ">
																<ShowMore
																	lines={1}
																	more={localStorage.getItem(
																		"showMoreButtonText"
																	)}
																	less={localStorage.getItem(
																		"showLessButtonText"
																	)}
																	anchorclassName="show-more ml-1"
																>
																	<div
																		dangerouslySetInnerHTML={{
																			__html: single_item.desc,
																		}}
																	/>
																</ShowMore>
															</div>
														</div>
														<div className="item_image_adgnmand ">
															<div className="single_item_full_info_ajsmb">
																{single_item.image !== null ? (
																	<React.Fragment>
																		{this.state.searching ? (
																			<img
																				src={checkAssetURL(single_item.image)}
																				alt={single_item.name}
																				className="flex_item_image_dajfgjah"
																			/>
																		) : (
																			<LazyLoad>
																				<ProgressiveImage
																					src={checkAssetURL(single_item.image)}
																					placeholder={checkAssetURL("/assets/img/various/blank-white.jpg")}
																				>
																					{(src, loading) => (
																						<img
																							style={{
																								opacity: loading
																									? "0.5"
																									: "1",
																							}}
																							src={src}
																							alt={single_item.name}
																							className="flex_item_image_dajfgjah"
																						/>
																					)}
																				</ProgressiveImage>
																			</LazyLoad>
																		)}
																	</React.Fragment>
																) : (
																	<div
																		style={{
																			marginTop: "3rem",
																		}}
																	/>
																)}
															</div>
															<div className="item_button_main_dasjk ">
																<div>
																	<React.Fragment>
																		{cartProducts.find(
																			(cp) => cp.id === single_item.id
																		) !== undefined ? (
																			<div className="item_button_dasjk item-center text-center">
																				{single_item.is_active ? (
																					<React.Fragment>
																						{single_item.addon_categories &&
																							single_item.addon_categories.length ? (
																							<button
																								onClick={() => {
																									const filteredCartProducts = cartProducts.filter(
																										(cp) => cp.id === single_item.id
																									);
																									console.log(
																										filteredCartProducts
																									);
																									if (
																										filteredCartProducts &&
																										filteredCartProducts.length >
																										1
																									) {
																										this.handlePopupOpen(
																											single_item
																										);
																									} else {
																										single_item.quantity = 1;
																										removeProduct(single_item);
																										this.forceStateUpdate();
																									}
																								}}
																								className="btn_remove_dgjkf btn "
																							>
																								<div class="sc-gsnTZi dGssTp ">
																									-
																								</div>
																							</button>
																						) : (
																							<button
																								className="btn_remove_dgjkf btn"
																								style={{}}
																								onClick={() => {
																									single_item.quantity = 1;
																									removeProduct(single_item);
																									this.forceStateUpdate();
																								}}
																							>
																								<div class="sc-gsnTZi dGssTp">
																									-
																								</div>

																								<Ink duration="500" />
																							</button>
																						)}
																						<button className="btn_remove_dgjkf btn">
																							<div class="sc-gsnTZi dGssTp">
																								{cartProducts
																									.filter(
																										(cp) => cp.id === single_item.id
																									) // Filter products with the same ID
																									.reduce(
																										(total, cp) =>
																											total + cp.quantity,
																										0
																									) // Sum their quantities
																								}
																							</div>
																						</button>

																						<button
																							className="btn_remove_dgjkf btn"
																							style={{}}
																							onClick={() => {
																								if (
																									single_item.addon_categories &&
																									single_item.addon_categories.length
																								) {
																									this.handlePopupOpen(single_item);
																								} else {
																									addProduct(single_item);
																									this.forceStateUpdate();
																								}
																							}}
																						>
																							<div class="sc-gsnTZi dGssTp">
																								+
																							</div>

																							<Ink duration="500" />
																						</button>
																					</React.Fragment>
																				) : (
																					<div className="text-danger text-item-not-available"
																						onClick={() => {
																							single_item.quantity = 1;
																							removeProduct(single_item);
																							this.forceStateUpdate();
																						}}
																					>
																						<i
																							className="si si-trash mr-2"
																							style={{
																								fontSize: "0.8rem",
																								top: "-0.2rem",
																								WebkitTextStroke:
																									"0.4px rgb(244, 67, 54)",
																								color: "rgb(244, 67, 54)",
																							}}
																						/>

																						{localStorage.getItem(
																							"cartItemNotAvailable"
																						)}
																					</div>
																				)}
																			</div>
																		) : (
																			<>
																				<div className="item_button_dasjk">
																					<button
																						className="add_button_sdahj btn"
																						onClick={() => {
																							if (
																								single_item.addon_categories &&
																								single_item.addon_categories.length
																							) {
																								this.handlePopupOpen(single_item);
																							} else {
																								addProduct(single_item);
																								this.forceStateUpdate();
																							}
																						}}
																					>
																						<div class="sc-gsnTZi dGssTp">
																							Add
																						</div>
																						<Ink duration="500" />
																					</button>
																				</div>
																			</>
																		)}
																	</React.Fragment>
																</div>

																<div className="">
																	{single_item.addon_categories &&
																		single_item.addon_categories.length > 0 && (
																			<React.Fragment>
																				<span
																					className="customizable_item_text_fsf d-block text-center"
																					style={
																						{
																							// color: localStorage.getItem("storeColor"),
																						}
																					}
																				>
																					{localStorage.getItem(
																						"customizableItemText"
																					)}
																				</span>
																				<br />
																			</React.Fragment>
																		)}
																</div>
															</div>
														</div>
													</div>
												</div>
											</>
											<hr
												className=""
												style={{
													marginTop: "2rem",
												}}
											/>
										</div>
									</React.Fragment>

									{this.state.customization_drawer && (
										<CustomizationNew
											cartProducts={cartProducts}
											customization_drawer={this.state.customization_drawer}
											product={this.state.customization_item}
											addProduct={addProduct}
											updateCart={updateCart}
											forceUpdate={this.forceStateUpdate}
											handlePopupClose={this.handlePopupClose}
										/>
									)}
								</React.Fragment>
							)}
						</div>
					</div>
				)}

				{!this.state.loading && (
					<React.Fragment>
						{this.state.is_active ? (
							<FloatCart />
						) : (
							<div className="auth-error no-click">
								<div className="error-shake">{localStorage.getItem("notAcceptingOrdersMsg")}</div>
							</div>
						)}
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	restaurant_info: state.items.restaurant_info,
	cartProducts: state.cart.products,
	single_item: state.items.single_item,
	settings: state.settings.settings,
	languages: state.languages.languages,
	language: state.languages.language,
	user: state.user.user,
});

export default connect(
	mapStateToProps,
	{
		getRestaurantInfo,
		getRestaurantItems,
		resetItems,
		resetInfo,
		getSingleItem,
		addProduct,
		removeProduct,
		getSettings,
		getAllLanguages,
		getSingleLanguageData,
		getRestaurantInfoForLoggedInUser,
		updateCart,
	}
)(SingleItem);
