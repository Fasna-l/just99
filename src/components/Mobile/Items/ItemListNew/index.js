import React, { Component } from "react";
import { addProduct, removeProduct } from "../../../../services/cart/actions";
import { updateCart } from "../../../../services/total/actions";
import { loadCart } from "../../../../services/cart/actions";

import Collapsible from "react-collapsible";
import ContentLoader from "react-content-loader";
import Customization from "../Customization";

import Ink from "react-ink";
import ItemBadge from "./ItemBadge";
import { Link } from "react-router-dom";

import RecommendedItems from "./RecommendedItems";
import ShowMore from "react-show-more";

import { connect } from "react-redux";
import { searchItem, clearSearch } from "../../../../services/items/actions";

import ProgressiveImage from "react-progressive-image";
import LazyLoad from "react-lazyload";
import { debounce } from "../../../helpers/debounce";
import ItemRating from "./ItemRating";
import { WEBSITE_URL } from "../../../../configs/website";
import CustomizationNew from "../CustomizationNew";
import "./item.css";
import { checkAssetURL } from "../../../helpers/truncate";
class ItemListNew extends Component {
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

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

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

  searchForItem = (e) => {
    this.searchItem(e.target.value);
  };

  searchItem = debounce((event) => {
    if (event.length >= 3) {
      this.setState({ filterText: event });
      this.props.searchItem(
        this.state.items,
        event,
        localStorage.getItem("itemSearchText"),
        localStorage.getItem("itemSearchNoResultText")
      );
      this.setState({ searching: true, queryLengthError: false });
    } else {
      this.setState({ queryLengthError: true });
    }
    if (event.length === 0) {
      this.setState({ filterText: null, queryLengthError: false });
      // console.log("Cleared");

      this.props.clearSearch(this.state.items_backup);
      this.setState({ searching: false });
    }
  }, 500);

  inputFocus = () => {
    this.refs.searchGroup.classList.add("search-shadow-light");
  };

  handleClickOutside = (event) => {
    if (
      this.refs.searchGroup &&
      !this.refs.searchGroup.contains(event.target)
    ) {
      this.refs.searchGroup.classList.remove("search-shadow-light");
    }
  };

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.restaurant && props.restaurant.id) {
      if (props.data !== state.data) {
        if (state.filterText !== null) {
          return {
            data: props.data,
          };
        } else if (state.filterText === null) {
          return {
            items_backup: props.data,
            data: props.data,
            filter_items: props.data && props.data.items,
          };
        }
      }
      if (props.restaurant_backup_items && state.items >= 0) {
        let arr = [];
        if (props.restaurant_backup_items.hasOwnProperty("items")) {
          Object.keys(props.restaurant_backup_items.items).forEach((keys) => {
            props.restaurant_backup_items.items[keys].forEach((itemsList) => {
              arr.push(itemsList);
            });
          });
        }
        return { items: arr };
      }
      return null;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState !== this.state.data) {
      return true;
    } else {
      return false;
    }
  }

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
    const {
      addProduct,
      removeProduct,
      cartProducts,
      updateCart,
      restaurant,
    } = this.props;
    const { data } = this.state;
    return (
      <React.Fragment>
        <div className="col-12 mt-10">
          <div
            className="input-group"
            ref="searchGroup"
            onClick={this.inputFocus}
          >
            <input
              type="text"
              className="form-control items-search-box"
              placeholder={localStorage.getItem("itemSearchPlaceholder")}
              onChange={this.searchForItem}
            />
            <div className="input-group-append">
              <span className="input-group-text items-search-box-icon">
                <i className="si si-magnifier" />
              </span>
            </div>
          </div>
        </div>
        <div>
          {this.state.queryLengthError && (
            <div className="auth-error">
              <div className="">
                {localStorage.getItem("searchAtleastThreeCharsMsg")}
              </div>
            </div>
          )}
        </div>

        <div
          className={`bg-grey-light mt-20 ${restaurant && !restaurant.certificate ? "mb-100" : null
            }`}
        >
          {!this.state.searching && (
            <div className="px-5">
              {!data.recommended ? (
                <ContentLoader
                  height={480}
                  width={400}
                  speed={1.2}
                  primaryColor="#f3f3f3"
                  secondaryColor="#ecebeb"
                >
                  <rect x="10" y="22" rx="4" ry="4" width="185" height="137" />
                  <rect x="10" y="168" rx="0" ry="0" width="119" height="18" />
                  <rect x="10" y="193" rx="0" ry="0" width="79" height="18" />

                  <rect x="212" y="22" rx="4" ry="4" width="185" height="137" />
                  <rect x="212" y="168" rx="0" ry="0" width="119" height="18" />
                  <rect x="212" y="193" rx="0" ry="0" width="79" height="18" />

                  <rect x="10" y="272" rx="4" ry="4" width="185" height="137" />
                  <rect x="10" y="418" rx="0" ry="0" width="119" height="18" />
                  <rect x="10" y="443" rx="0" ry="0" width="79" height="18" />

                  <rect
                    x="212"
                    y="272"
                    rx="4"
                    ry="4"
                    width="185"
                    height="137"
                  />
                  <rect x="212" y="418" rx="0" ry="0" width="119" height="18" />
                  <rect x="212" y="443" rx="0" ry="0" width="79" height="18" />
                </ContentLoader>
              ) : null}
              {data.recommended && data.recommended.length > 0 && (
                <h3 className="px-10 py-10 recommended-text mb-0">
                  {localStorage.getItem("itemsPageRecommendedText")}
                </h3>
              )}

              <div
                className={
                  localStorage.getItem("recommendedLayoutV2") === "true"
                    ? "product-slider"
                    : "row m-0"
                }
              >
                {!data.recommended
                  ? null
                  : data.recommended.map((item) => (
                    <RecommendedItems
                      restaurant={restaurant}
                      shouldUpdate={this.state.update}
                      update={this.forceStateUpdate}
                      product={item}
                      addProduct={addProduct}
                      removeProduct={removeProduct}
                      key={item.id}
                    />
                  ))}
              </div>
            </div>
          )}
          {data.items &&
            Object.keys(data.items).map((category, index) => (
              <div key={category} id={category + index}>
                <Collapsible
                  trigger={category}
                  open={
                    index === 0
                      ? true
                      : localStorage.getItem("expandAllItemMenu") === "true"
                        ? true
                        : this.props.menuClicked
                  }
                >
                  {data.items[category].map((item) => (
                    <React.Fragment key={item.id}>
                      <div>
                        <span className="hidden">{(item.quantity = 1)}</span>

                        {/* new code */}
                        <>
                          <div className="item_container_sxcc ">
                            <div className="item_container_flex_dsamn d-flex justify-content-between">
                              <div className="item_info_jagdd px-2">
                                <div className="item_tags_ajhdgjq mt-2">
                                  {localStorage.getItem(
                                    "showVegNonVegBadge"
                                  ) === "true" &&
                                    item.is_veg !== null && (
                                      <React.Fragment>
                                        {item.is_veg ? (
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

                                  <ItemBadge item={item} />
                                </div>
                                <div className="item_name_gfdw mt-2">
                                  {item.name}
                                </div>
                                <div className="item_price_hhrtdgf mt-2">
                                  <span className="">
                                    {localStorage.getItem(
                                      "hidePriceWhenZero"
                                    ) === "true" && item.price === "0.00" ? (
                                      <>
                                        <React.Fragment>
                                          {this.getTotalOfLowestPricedAddons(
                                            item
                                          ) > 0 && (
                                              <span className="item_price_span_hhrtdgf">
                                                {localStorage.getItem(
                                                  "currencySymbolAlign"
                                                ) === "left" &&
                                                  localStorage.getItem(
                                                    "currencyFormat"
                                                  )}{" "}
                                                {this.getTotalOfLowestPricedAddons(
                                                  item
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
                                        {item.old_price > 0 && (
                                          <span className="item_old_price_span_hhdff">
                                            {" "}
                                            {localStorage.getItem(
                                              "currencySymbolAlign"
                                            ) === "left" &&
                                              localStorage.getItem(
                                                "currencyFormat"
                                              )}{" "}
                                            {Number(item.old_price)}
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
                                          {Number(item.price)}
                                          {localStorage.getItem(
                                            "currencySymbolAlign"
                                          ) === "right" &&
                                            localStorage.getItem(
                                              "currencyFormat"
                                            )}
                                        </span>

                                        {item.old_price > 0 &&
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
                                                ((parseFloat(item.old_price) -
                                                  parseFloat(item.price)) /
                                                  parseFloat(item.old_price)) *
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
                                  <ItemRating item={item} />
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
                                        __html: item.desc,
                                      }}
                                    />
                                  </ShowMore>
                                </div>
                              </div>
                              <div className="item_image_adgnmand ">
                                <div className="single_item_full_info_ajsmb">
                                  {item.image !== null ? (
                                    <React.Fragment>
                                      {this.state.searching ? (
                                        <img
                                          src={checkAssetURL(item.image)}
                                          alt={item.name}
                                          className="flex_item_image_dajfgjah"
                                        />
                                      ) : (
                                        <LazyLoad>
                                          <ProgressiveImage
                                            src={checkAssetURL(item.image)}
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
                                                alt={item.name}
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
                                        (cp) => cp.id === item.id
                                      ) !== undefined ? (
                                        <div className="item_button_dasjk item-center text-center">
                                          {item.is_active ? (
                                            <React.Fragment>
                                              {item.addon_categories &&
                                                item.addon_categories.length ? (
                                                <button
                                                  onClick={() => {
                                                    const filteredCartProducts = cartProducts.filter(
                                                      (cp) => cp.id === item.id
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
                                                        item
                                                      );
                                                    } else {
                                                      item.quantity = 1;
                                                      removeProduct(item);
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
                                                    item.quantity = 1;
                                                    removeProduct(item);
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
                                                      (cp) => cp.id === item.id
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
                                                    item.addon_categories &&
                                                    item.addon_categories.length
                                                  ) {
                                                    this.handlePopupOpen(item);
                                                  } else {
                                                    addProduct(item);
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
                                                item.quantity = 1;
                                                removeProduct(item);
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
                                                  item.addon_categories &&
                                                  item.addon_categories.length
                                                ) {
                                                  this.handlePopupOpen(item);
                                                } else {
                                                  addProduct(item);
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
                                    {item.addon_categories &&
                                      item.addon_categories.length > 0 && (
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
                  ))}
                </Collapsible>
              </div>
            ))}
          <div className="mb-50" />
        </div>
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
    );
  }
}

const mapStateToProps = (state) => ({
  cartProducts: state.cart.products,
});

export default connect(
  mapStateToProps,
  { addProduct, removeProduct, searchItem, clearSearch, updateCart }
)(ItemListNew);
