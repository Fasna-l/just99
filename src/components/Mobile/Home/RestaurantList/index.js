import {
	GET_RESTAURANTS_SLIDES_URL,
	GET_JUST99_BRANCHES_URL,
} from "../../../../configs/index";
import React, { Component } from "react";

import ContentLoader from "react-content-loader";
import Ink from "react-ink";
import axios from "axios";
import PromoSlider from "../PromoSlider";

import { connect } from "react-redux";
import { getDeliveryRestaurants, getSelfpickupRestaurants } from "../../../../services/restaurant/actions";
import { checkAssetURL } from "../../../helpers/truncate";
import { withRouter } from "react-router-dom";

import "./branch-selector.css";
import { RiHome8Fill } from "react-icons/ri";

class RestaurantList extends Component {
	state = {
		total: null,
		restaurants: [],
		branches: [],
		loading: false,
		selfpickup: false,
		userPreferredSelectionDelivery: true,
		userPreferredSelectionSelfPickup: false,
		no_restaurants: false,
		data: [],
		review_data: [],
		isHomeDelivery: true,
		selectedBranchSlug:
  			localStorage.getItem("selectedBranchSlug") || "",
		//selectedBranchSlug: "",
		locationError: null,
		locationLoading: false,
	};

	componentDidMount() {
		window.addEventListener(
    		"branchChanged",
    	this.handleExternalBranchChange
  	);
		this.getAllRestaurantSliders();
	//this.getAdminBranches();
		this.getBranches();

	if (localStorage.getItem("userPreferredSelection") === null) {
		localStorage.setItem("userPreferredSelection", "DELIVERY");
		localStorage.setItem("userSelected", "DELIVERY");

		this.setState({
			userPreferredSelectionDelivery: true,
			isHomeDelivery: true,
		});
	}

	if (localStorage.getItem("enSPU") === "true") {
		if (localStorage.getItem("userPreferredSelection") === "SELFPICKUP") {
			this.setState({
				selfpickup: true,
				isHomeDelivery: false,
				userPreferredSelectionSelfPickup: true,
				userPreferredSelectionDelivery: false,
			});
		} else {
			this.setState({
				selfpickup: false,
				isHomeDelivery: true,
				userPreferredSelectionDelivery: true,
				userPreferredSelectionSelfPickup: false,
			});
		}
	}
}

componentWillUnmount() {
  window.removeEventListener(
    "branchChanged",
    this.handleExternalBranchChange
  );
}

handleExternalBranchChange = (event) => {
    const selectedBranchSlug = event.detail;

    this.setState(
        {
            selectedBranchSlug,
            locationError: null,
        },
        () => {
            this.scrollSelectedBranchIntoView(
                selectedBranchSlug
            );
        }
    );
};

// handleExternalBranchChange = (event) => {
//   const selectedBranchSlug = event.detail;

//   this.setState({
//     selectedBranchSlug,
//   });
// };

	getBranches = () => {
    this.setState({
        loading: true,
		selectedBranchSlug:
  			localStorage.getItem("selectedBranchSlug") || "",
        //selectedBranchSlug: "",
    });

    return axios
        .get(GET_JUST99_BRANCHES_URL)
        .then((response) => {


			this.setState(
    {
        branches: response.data,
        total: response.data.length,
        no_restaurants:
            response.data.length === 0,
        loading: false,
    },
    () => {
        const selectedBranchSlug =
            localStorage.getItem("selectedBranchSlug");

        if (selectedBranchSlug) {
            this.scrollSelectedBranchIntoView(
                selectedBranchSlug
            );
        }
    }
);

            // this.setState({
            //     branches: response.data,
            //     total: response.data.length,
            //     no_restaurants:
            //         response.data.length === 0,
            //     loading: false,
            // });

        })
        .catch((error) => {

            console.log(
                "Failed to load branches:",
                error
            );

            this.setState({
                branches: [],
                total: null,
                no_restaurants: true,
                loading: false,
            });

        });
};

	__getDeliveryRestaurants = () => {
		if (localStorage.getItem("userSetAddress")) {
			this.setState({
				loading: true,
				selectedBranchSlug: "",
			});
			const userSetAddress = JSON.parse(localStorage.getItem("userSetAddress"));

			return this.props.getDeliveryRestaurants(userSetAddress.lat, userSetAddress.lng).then((restaurants) => {
				if (restaurants && restaurants.payload.length) {
					this.setState({
						total: restaurants.payload.length,
						no_restaurants: false,
						loading: false,
					});
				} else {
					this.setState({
						total: null,
						no_restaurants: true,
						loading: false,
					});
				}
			});
		}
	};

	__getSelfPickupRestaurants = () => {
		if (localStorage.getItem("userSetAddress")) {
			this.setState({
				loading: true,
				selectedBranchSlug: "",
			});
			const userSetAddress = JSON.parse(localStorage.getItem("userSetAddress"));

			return this.props.getSelfpickupRestaurants(userSetAddress.lat, userSetAddress.lng).then((restaurants) => {
				if (restaurants && restaurants.payload.length) {
					this.setState({
						total: restaurants.payload.length,
						no_restaurants: false,
						loading: false,
					});
				} else {
					this.setState({
						total: null,
						loading: false,
						no_restaurants: true,
					});
				}
			});
		}
	};

	filterDelivery = () => {
	this.setState({
		selfpickup: false,
		userPreferredSelectionDelivery: true,
		userPreferredSelectionSelfPickup: false,
	});

	localStorage.setItem("userPreferredSelection", "DELIVERY");

	this.getBranches();
};

filterSelfPickup = () => {
	this.setState({
		selfpickup: true,
		userPreferredSelectionSelfPickup: true,
		userPreferredSelectionDelivery: false,
	});

	localStorage.setItem("userPreferredSelection", "SELFPICKUP");

	this.getBranches();
};

	getAllRestaurantSliders = () => {
		axios.post(GET_RESTAURANTS_SLIDES_URL).then((response) => {
			if (response.data) {
				this.setState({
					data: response.data,
				});
			}
		});
	};

	changeRouteToRestaurantsCategories = (categories) => {
		if (categories.categories_ids) {
			const saveCategorySelectOptions = new Promise((resolve) => {
				localStorage.setItem("categorySelectOptions", JSON.stringify(categories.categories_ids));
				resolve("categorySelectOptions Saved");
			});
			saveCategorySelectOptions.then(() => {
				this.props.history.push("categories/stores");
			});
		}
	};

handleBranchChange = (event) => {
    const selectedBranchSlug = event.target.value;

    this.setState(
        {
            selectedBranchSlug,
            locationError: null,
        },
        () => {
            this.scrollSelectedBranchIntoView(selectedBranchSlug);
        }
    );

    localStorage.setItem(
        "selectedBranchSlug",
        selectedBranchSlug
    );

    window.dispatchEvent(
        new CustomEvent("branchChanged", {
            detail: selectedBranchSlug,
        })
    );
};

handleBannerBranchClick = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });

    setTimeout(() => {
        window.dispatchEvent(
            new CustomEvent("openBranchDropdown")
        );
    }, 500);
};

scrollSelectedBranchIntoView = (selectedBranchSlug) => {
    const slider = document.querySelector(".branch-slider");

    if (!slider) return;

    const selectedBranch = slider.querySelector(
        `[data-branch-slug="${selectedBranchSlug}"]`
    );

    if (!selectedBranch) return;

    const sliderRect = slider.getBoundingClientRect();
    const branchRect = selectedBranch.getBoundingClientRect();

    const branchLeft =
        branchRect.left - sliderRect.left;

    const branchRight =
        branchRect.right - sliderRect.left;

    const sliderWidth = slider.clientWidth;

    // Branch is on the left side
    if (branchLeft < 0) {
        slider.scrollBy({
            left: branchLeft - 20,
            behavior: "smooth",
        });
    }

    // Branch is on the right side
    else if (branchRight > sliderWidth) {
        slider.scrollBy({
            left: branchRight - sliderWidth + 20,
            behavior: "smooth",
        });
    }
};

	getBranchLabel = (restaurant) => {
		return restaurant.branch_name || restaurant.branch || restaurant.outlet_name || restaurant.name;
	};

	getSelectedBranch = () => {
		return this.state.branches.find(
			(branch) =>
				branch.slug === this.state.selectedBranchSlug
		);
	};
	
	setUserSelectedPreference = () => {
	const preferredSelection =
		localStorage.getItem("userPreferredSelection");

	if (preferredSelection === "SELFPICKUP") {
		localStorage.setItem("userSelected", "SELFPICKUP");
	} else {
		localStorage.setItem("userSelected", "DELIVERY");
	}
};

continueToSelectedBranch = () => {
    const selectedBranch = this.getSelectedBranch();

    if (!selectedBranch) {
        this.setState({
            locationError:
                "Please select a branch to continue.",
        });
        return;
    }

    if (!selectedBranch.storeUrl) {
        this.setState({
            locationError:
                "This branch does not have a store link.",
        });
        return;
    }

    window.top.location.href = selectedBranch.storeUrl;
};
// continueToSelectedBranch = () => {
//     const selectedBranch = this.getSelectedBranch();

//     if (!selectedBranch) {
//         this.setState({
//             locationError:
//                 "Please select a branch to continue.",
//         });
//         return;
//     }

//     window.top.location.href =
//         "https://just99.online/stores/carmelram-zogyopmwysd9dxe";
// };

	detectCurrentLocation = () => {
		if (!navigator.geolocation) {
			this.props.history.push("/search-location");
			return;
		}

		this.setState({
			locationLoading: true,
			locationError: null,
			selectedBranchSlug: "",
		});

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const userSetAddress = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					address: "Current Location",
					house: null,
					tag: null,
				};

				localStorage.setItem("userSetAddress", JSON.stringify(userSetAddress));
				localStorage.setItem("userAlreadySelectedLocation", "true");

				const fetchRestaurants =
					localStorage.getItem("userPreferredSelection") === "SELFPICKUP" &&
					localStorage.getItem("enSPU") === "true"
						? this.__getSelfPickupRestaurants()
						: this.__getDeliveryRestaurants();

				if (fetchRestaurants) {
					fetchRestaurants
						.then(() => {
							this.setState({ locationLoading: false });
						})
						.catch(() => {
							this.setState({ locationLoading: false });
						});
				} else {
					this.setState({ locationLoading: false });
				}
			},
			() => {
				this.setState({
					locationLoading: false,
					locationError: "Location permission is needed to find nearby branches.",
				});
			}
		);
	};

	renderPreferenceButtons = () => {
		if (localStorage.getItem("enSPU") !== "true") {
			return null;
		}

		return (
			<div className="branch-preference-row">
				<button
					onClick={this.filterDelivery}
					className={
						"btn btn-preference " + (this.state.userPreferredSelectionDelivery ? "user-preferred" : "")
					}
					type="button"
				>
					{localStorage.getItem("deliveryTypeDelivery")}
				</button>
				<button
					onClick={this.filterSelfPickup}
					className={
						"btn btn-preference " + (this.state.userPreferredSelectionSelfPickup ? "user-preferred" : "")
					}
					type="button"
				>
					{localStorage.getItem("deliveryTypeSelfPickup")}
				</button>
			</div>
		);
	};
	scrollBranchesLeft = () => {
    const slider = document.querySelector(".branch-slider");

    if (slider) {
        slider.scrollBy({
            left: -150,
            behavior: "smooth",
        });
    }
};
	scrollBranchesRight = () => {
    	const slider = document.querySelector(
        	".branch-slider"
    	);

    	if (slider) {
        	slider.scrollBy({
            	left: 150,
            	behavior: "smooth",
        	});
    	}
	};

	renderBranchSelector = () => {
	const { branches } = this.state;
	// const { restaurants } = this.props;
	const selectedBranch = this.getSelectedBranch();

	const storeName =
		localStorage.getItem("storeName") || "Just99";

	const storeColor =
		localStorage.getItem("storeColor") || "#168414";

	const isContinueDisabled =
		!this.state.selectedBranchSlug;

	return (
		<div className="branch-selector-wrapper">

			<div className="branch-selector-card">

				<h8>
    				Choose your <span style={{ color: "#CA202C" }}>{storeName}</span> branch
				</h8>

				{/* ================= BRANCH SLIDER ================= */}
<div className="branch-slider-wrapper">

    <div className="branch-slider">

        {branches.map((branch) => {

            const isSelected =
                this.state.selectedBranchSlug === branch.slug;

				 const isBranchAvailable = branch.isActive !== false;

            return (
				
           <button
    key={branch._id}
    type="button"
    data-branch-slug={branch.slug}
    className={
        "branch-slider-item " +
        (isSelected
            ? "branch-slider-item-active"
            : "")
    }
    onClick={() =>
        this.handleBranchChange({
            target: {
                value: branch.slug,
            },
        })
    }
>

                    {/* IMAGE */}
                    <div className="branch-slider-image-wrapper">

                        {branch.image ? (
                            <img
                                src={`http://localhost:5000${branch.image}`}
                                alt={branch.name}
                                className="branch-slider-image"
                            />
                        ) : (
                            <div className="branch-slider-image-placeholder">
                                <i className="si si-location-pin" />
                            </div>
                        )}

                        {/* SELECTED TICK */}
                        {isSelected && (
                            <span className="branch-selected-tick">
                                ✓
                            </span>
                        )}

                    </div>


                    {/* BRANCH DETAILS */}
                    <div className="branch-slider-info">

                        <div className="branch-slider-name">
                            {branch.name}
                        </div>

						<div className="branch-slider-city">
    						{branch.name === "Carmelaram"
        						? "Bangalore"
        						: branch.city ||
          						branch.location ||
          						branch.area ||
          						"Kerala"
							}
						</div>

						<div
    className={
        "branch-slider-status " +
        (branch.isActive === false
            ? "branch-slider-status-unavailable"
            : "")
    }
>
    <span className="branch-status-dot"></span>

    {branch.isActive === false
        ? "Currently unavailable"
        : "Open"}
</div>

                        {/* <div className="branch-slider-status">
                            <span className="branch-status-dot"></span>
                            Open
                        </div> */}

                    </div>

                </button>
            );
        })}

    </div>
	{/* LEFT ARROW */}
{branches.length > 3 && (
    <button
        type="button"
        className="branch-slider-arrow branch-slider-arrow-left"
        onClick={this.scrollBranchesLeft}
    >
        <i className="si si-arrow-left"></i>
    </button>
)}

{/* RIGHT ARROW */}
{branches.length > 3 && (
    <button
        type="button"
        className="branch-slider-arrow branch-slider-arrow-right"
        onClick={this.scrollBranchesRight}
    >
        <i className="si si-arrow-right"></i>
    </button>
)}
</div>

				{/* ================= ERROR ================= */}

				{this.state.locationError && (
					<div className="branch-selector-error">
						{this.state.locationError}
					</div>
				)}


				{/* ================= DELIVERY / PICKUP ================= */}

				{this.renderPreferenceButtons()}


				{/* ================= CONTINUE ================= */}

				<button
					className="branch-continue-button"
					disabled={isContinueDisabled}
					onClick={this.continueToSelectedBranch}
					style={{
						backgroundColor: storeColor,
					}}
					type="button"
				>
					Continue
				</button>

				{/* ================= WHY JUST99 ================= */}

<div className="why-just99-section">

    {/* <h6>Why {storeName}?</h6> */}
	
	<h6>
    	Why <span className="why-store-name">{storeName}</span>?
	</h6>
    
	<div className="why-just99-features">

        {/* WIDE VARIETY */}
<div className="why-just99-feature">

    <div className="why-just99-icon">

        <svg
            viewBox="0 0 64 64"
            className="why-svg-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Plate */}
            <circle cx="32" cy="32" r="24" />

            {/* Fork */}
            <path d="M22 18V32" />
            <path d="M18 18V25" />
            <path d="M26 18V25" />
            <path d="M18 25C18 29 22 31 22 31" />
            <path d="M22 31V45" />

            {/* Spoon */}
            <path d="M42 18C38 18 37 23 37 27C37 31 40 33 42 33V45" />
        </svg>

    </div>

    <span>
        Wide<br />
        Variety
    </span>

</div>


        {/* FRESHLY PREPARED */}
        <div className="why-just99-feature">

            <div className="why-just99-icon">

                <svg
                    viewBox="0 0 64 64"
                    className="why-svg-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >

                    <path d="M10 45H54" />

                    <path
                        d="M15 42C17 30 25 23 32 23C39 23 47 30 49 42"
                    />

                    <path d="M21 42H43" />

                    <path
                        d="M28 18C28 15 30 13 32 13C34 13 36 15 36 18"
                    />

                    <path d="M9 46H55" />

                </svg>

            </div>

            <span>
                Freshly<br />
                Prepared
            </span>

        </div>


        {/* FAST DELIVERY */}
        <div className="why-just99-feature">

            <div className="why-just99-icon">

                <svg
                    viewBox="0 0 64 64"
                    className="why-svg-icon"
                    fill="currentColor"
                >

                    <circle cx="17" cy="48" r="6" />

                    <circle cx="48" cy="48" r="6" />

                    <path d="
                        M11 44
                        H20
                        L25 27
                        H40
                        L46 37
                        H55
                        V44
                        H52
                        C51 39 45 39 43 44
                        H23
                        C22 39 16 39 14 44
                        Z
                    " />

                    <path d="
                        M25 27
                        H39
                        L35 20
                        H27
                        Z
                    " />

                    <path d="
                        M43 29
                        L49 23
                        H56
                        L52 29
                        Z
                    " />

                </svg>

            </div>

            <span>
                Fast<br />
                Delivery
            </span>

        </div>


        {/* GREAT TASTE */}
        <div className="why-just99-feature">

            <div className="why-just99-icon">

                <svg
                    viewBox="0 0 64 64"
                    className="why-svg-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >

                    <circle
                        cx="32"
                        cy="32"
                        r="25"
                    />

                    <circle
                        cx="23"
                        cy="27"
                        r="2"
                        fill="currentColor"
                    />

                    <circle
                        cx="41"
                        cy="27"
                        r="2"
                        fill="currentColor"
                    />

                    <path
                        d="M20 38C23 44 28 47 32 47C36 47 41 44 44 38"
                    />

                </svg>

            </div>

            <span>
                Great Taste<br />
                Always
            </span>

        </div>

    </div>

	{/* ================= BOTTOM BANNERS ================= */}

<div className="why-just99-banners">

    {/* RED OFFERS BANNER */}
    <div
    	className="why-just99-banner why-just99-banner-offers"
    	onClick={this.handleBannerBranchClick}
    	style={{ cursor: "pointer" }}
	>

        <div className="why-just99-banner-icon">
            %
        </div>

        <div className="why-just99-banner-text">
            <strong>
                EXCITING OFFERS
                <br />
                EVERY DAY!
            </strong>

            <small>
                Great food at unbeatable prices.
            </small>
        </div>

        <div className="why-just99-banner-food">
            🍔
        </div>

        <div className="why-just99-banner-arrow">
            <i className="si si-arrow-right" />
        </div>

    </div>


    {/* BLACK / GREEN HYGIENE BANNER */}
    <div
    	className="why-just99-banner why-just99-banner-hygiene"
    	onClick={this.handleBannerBranchClick}
    	style={{ cursor: "pointer" }}
	>

        <div className="why-just99-banner-icon hygiene-icon">
            ✓
        </div>

        <div className="why-just99-banner-text">
            <strong>
                HYGIENIC &amp; SAFE FOOD
            </strong>

            <small>
                Your safety is our top priority.
            </small>
        </div>

        <div className="why-just99-banner-food">
            🥗
        </div>

        <div className="why-just99-banner-arrow">
            <i className="si si-arrow-right" />
        </div>

    </div>

</div>

    {/* <div className="why-just99-offer">

        <div className="why-just99-offer-icon">
            %
        </div>

        <div className="why-just99-offer-text">

            <strong>
                Exciting Offers Every Day!
            </strong>

            <small>
                Great food at unbeatable prices.
            </small>

        </div>

        <i className="si si-arrow-right why-just99-offer-arrow" />

    </div> */}

</div>

			</div>

		</div>
	);
};

	renderNoBranches = () => {
		const storeName = localStorage.getItem("storeName") || "Just99";
		const storeColor = localStorage.getItem("storeColor") || "#168414";

		return (
			<div className="branch-selector-wrapper">
				<div className="branch-selector-card">
					<h2>{localStorage.getItem("noRestaurantMessage") || "No branches available"}</h2>
					<p>Try detecting your current location to find nearby {storeName} branches.</p>

					<button className="branch-location-button" type="button" onClick={this.detectCurrentLocation}>
						<span className="branch-location-icon" style={{ color: storeColor }}>
							<i className={this.state.locationLoading ? "si si-refresh" : "si si-compass"} />
						</span>
						<span className="branch-location-copy">
							<strong style={{ color: storeColor }}>
								{this.state.locationLoading ? "Detecting Location" : "Detect My Location"}
							</strong>
							<small>Find {storeName} branches near you</small>
						</span>
						<i className="si si-arrow-right branch-location-arrow" />
					</button>

					{this.state.locationError && <div className="branch-selector-error">{this.state.locationError}</div>}
					{this.renderPreferenceButtons()}
				</div>
			</div>
		);
	};

	renderCategorySlider = () => {
		if (localStorage.getItem("restaurantCategorySliderPosition") !== "0" || this.state.data.length <= 0) {
			return null;
		}

		return (
			<div className="slider-wrapper secondary-slider-wrapper my-0 pb-20">
				{this.state.data.map((category) => (
					<div className="slider-wrapper__img-wrapper" key={category.id}>
						<div
							style={{ position: "relative" }}
							onClick={() => {
								this.changeRouteToRestaurantsCategories(category);
							}}
						>
							<img
								src={checkAssetURL(category.image)}
								alt={category.name}
								className="slider-wrapper__img slider-cust-img"
								style={{
									height:
										(12 / 5) * parseInt(localStorage.getItem("restaurantCategorySliderSize")) +
										"rem",
									width:
										(12 / 5) * parseInt(localStorage.getItem("restaurantCategorySliderSize")) +
										"rem",
									borderRadius:
										parseFloat(localStorage.getItem("restaurantCategorySliderStyle")) + "rem",
								}}
							/>
							{localStorage.getItem("showRestaurantCategorySliderLabel") === "true" && (
								<span className="category-slider-name">{category.name}</span>
							)}
							<Ink duration="500" hasTouch={true} />
						</div>
					</div>
				))}
			</div>
		);
	};

	renderLoader = () => (
		<div className="branch-selector-loader">
			<ContentLoader height={310} width={400} speed={1.2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
				<rect x="20" y="15" rx="6" ry="6" width="240" height="28" />
				<rect x="20" y="55" rx="4" ry="4" width="315" height="18" />
				<rect x="20" y="100" rx="8" ry="8" width="360" height="58" />
				<rect x="20" y="205" rx="8" ry="8" width="360" height="58" />
				<rect x="20" y="280" rx="8" ry="8" width="360" height="28" />
			</ContentLoader>
		</div>
	);

	render() {
    	return (
        	<div className="bg-white">
            	{this.renderBranchSelector()}
        	</div>
    	);
	}
}

const mapStateToProps = (state) => ({
	restaurants: state.restaurant.restaurants,
});

export default withRouter(
	connect(
		mapStateToProps,
		{
			getDeliveryRestaurants,
			getSelfpickupRestaurants,
		}
	)(RestaurantList)
);
