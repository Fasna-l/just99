import moment from "moment";
import React from "react";

import Ink from "react-ink";
import Fade from "react-reveal/Fade";

import "./rest.css";
import { checkAssetURL } from "../../../../helpers/truncate";
import DelayLink from "../../../../helpers/delayLink";
function RestaurantCard({ restaurant }) {
  const renderRestaurantOpenTime = (restaurant) => {


    const showTime =
      localStorage.getItem("showRestaurantActiveTime") &&
      localStorage.getItem("showRestaurantActiveTime") == "true";
    if (!showTime) return localStorage.getItem("restaurantNotActiveMsg");

    if (!restaurant.schedule_data)
      return localStorage.getItem("restaurantNotActiveMsg");

    const scheduleData = JSON.parse(restaurant.schedule_data);

    const weekDayMap = {
      monday: "week_day_1",
      tuesday: "week_day_2",
      wednesday: "week_day_3",
      thursday: "week_day_4",
      friday: "week_day_5",
      saturday: "week_day_6",
      sunday: "week_day_7",
    };

    const arrangedScheduleData = {};

    Object.keys(scheduleData).forEach((day) => {
      const weekDay = weekDayMap[day.toLowerCase()];
      arrangedScheduleData[weekDay] = scheduleData[day];
    });
    // console.log('Schedule Data:', scheduleData);

    const currentMoment = moment();
    //const currentMoment = moment('07:00', 'HH:mm'); // Manually set to 7:00 AM for testing

    const currentTime = currentMoment.format("HH:mm"); // Update here to get the actual current time
    // console.log("currentTime " + currentTime);

    const currentDayScheduleKey = `week_day_${
      currentMoment.day() === 0 ? 7 : currentMoment.day()
    }`; // Sunday as week_day_7
    const nextDayScheduleKey = `week_day_${
      currentMoment.add(1, "day").day() === 0
        ? 7
        : currentMoment.add(1, "day").day()
    }`; // Sunday as week_day_7

    // console.log('Restaurant Name:', restaurant.name);
    // console.log('Current Day Schedule Key:', currentDayScheduleKey);
    // console.log('Next Day Schedule Key:', nextDayScheduleKey);

    const currentDaySchedule =
      arrangedScheduleData[currentDayScheduleKey] || [];
    const nextDaySchedule = arrangedScheduleData[nextDayScheduleKey] || [];

    // console.log('Current Day Schedule:', currentDaySchedule);
    // console.log('Next Day Schedule:', nextDaySchedule);

    // Check if the current day schedule is empty
    if (currentDaySchedule.length === 0) {
      // console.log("No schedule found for the current day.");
    }

    // Sort schedules by opening time
    currentDaySchedule.sort((a, b) => a.open.localeCompare(b.open));

    let nextOpeningTime = null;

    // Iterate over sorted current day schedule to find the next opening time
    for (const slot of currentDaySchedule) {
      const slotOpen = moment(slot.open, "HH:mm");
      const slotClose = moment(slot.close, "HH:mm");

      if (currentTime < slot.open) {
        // console.log(`Next opening time found: ${slot.open}`);
        nextOpeningTime = slot.open;
        break;
      }

      if (slot.open > slot.close && currentTime > slot.close) {
        nextOpeningTime = slot.open;
        break;
      }

      // console.log(`Checking slot: ${slot.open} - ${slot.close}`);
      // console.log(`Current time: ${currentTime} | Slot open: ${slotOpen.format('HH:mm')} | Slot close: ${slotClose.format('HH:mm')}`);
      // Check if current time is before the opening time
      if (currentMoment.isBefore(slotOpen)) {
        console.log(`Next opening time found: ${slot.open}`);
        nextOpeningTime = slot.open;
        break;
      }

      // Handle cases where the restaurant closes after midnight (e.g., open at 20:00, close at 02:00)
      if (slotClose.isBefore(slotOpen) && currentMoment.isBefore(slotClose)) {
        // console.log(`Next opening time (after midnight case) found: ${slot.open}`);
        nextOpeningTime = slot.open;
        break;
      }
    }

    // console.log("nextOpeningTime " + nextOpeningTime)
    // If no opening time found for today, check tomorrow's schedule
    if (!nextOpeningTime && nextDaySchedule.length > 0) {
      nextDaySchedule.sort((a, b) => a.open.localeCompare(b.open));
      // console.log('Next Day Schedule after sorting:', nextDaySchedule);
      nextOpeningTime = nextDaySchedule[0].open;

      // console.log('Next Opening Time Today:', nextOpeningTime);
      const formattedTime = moment(nextOpeningTime, "HH:mm").format("hh:mm A");
      const dayName = "Tomorrow";
      return `Opens ${dayName} at ${formattedTime}`;
    }

    if (nextOpeningTime) {
      // console.log('Next Opening Time Today:', nextOpeningTime);
      const formattedTime = moment(nextOpeningTime, "HH:mm").format("hh:mm A");
      const dayName = "Today";
      return `Opens ${dayName} at ${formattedTime}`;
    }

    return localStorage.getItem("restaurantNotActiveMsg");
  };

  const renderRestaurantCloseTime = (restaurant) => {
    if (restaurant.is_schedulable === 0 || !restaurant.schedule_data) return 0;

    const scheduleData = JSON.parse(restaurant.schedule_data);

    const weekDayMap = {
      monday: "week_day_1",
      tuesday: "week_day_2",
      wednesday: "week_day_3",
      thursday: "week_day_4",
      friday: "week_day_5",
      saturday: "week_day_6",
      sunday: "week_day_7",
    };

    const arrangedScheduleData = {};
    Object.keys(scheduleData).forEach((day) => {
      const weekDay = weekDayMap[day.toLowerCase()];
      arrangedScheduleData[weekDay] = scheduleData[day];
    });

    const now = moment();
    const currentDayKey = `week_day_${now.day() === 0 ? 7 : now.day()}`;
    const currentDaySchedule = arrangedScheduleData[currentDayKey] || [];

    if (currentDaySchedule.length === 0) return null;

    // Sort today's schedule by opening time
    currentDaySchedule.sort((a, b) => a.open.localeCompare(b.open));

    for (const slot of currentDaySchedule) {
      let openTime = moment(slot.open, "HH:mm");
      let closeTime = moment(slot.close, "HH:mm");

      // Handle overnight (close after midnight)
      if (closeTime.isBefore(openTime)) {
        closeTime.add(1, "day");
      }

      if (now.isBetween(openTime, closeTime)) {
        const minutesLeft = closeTime.diff(now, "minutes"); // difference in minutes
        return minutesLeft;
      }
    }

    return 0; // Not open today
  };

  return (
    <>
      <div className="col-xs-12 col-sm-12 restaurant-block">
        <DelayLink
          to={"../stores/" + restaurant.slug}
          delay={200}
          className="restrau "
          clickAction={() => {
            localStorage.getItem("userPreferredSelection") === "DELIVERY" &&
              restaurant.delivery_type === 1 &&
              localStorage.setItem("userSelected", "DELIVERY");
            localStorage.getItem("userPreferredSelection") === "SELFPICKUP" &&
              restaurant.delivery_type === 2 &&
              localStorage.setItem("userSelected", "SELFPICKUP");
            localStorage.getItem("userPreferredSelection") === "DELIVERY" &&
              restaurant.delivery_type === 3 &&
              localStorage.setItem("userSelected", "DELIVERY");
            localStorage.getItem("userPreferredSelection") === "SELFPICKUP" &&
              restaurant.delivery_type === 3 &&
              localStorage.setItem("userSelected", "SELFPICKUP");
          }}
        >
          <div
            className={`img-box ${
              restaurant.is_featured &&
              restaurant.is_active &&
              restaurant.highest_discount_coupon
                ? // ? "ribbon ribbon-bookmark ribbon-warning "
                  "ribbon ribbon-bookmark ribbon-warning"
                : ""
            } `}
          >
            <Fade duration={500}>
              {restaurant.highest_discount_coupon ? (
                <main>
                  <img
                    width={120}
                    height={147}
                    alt={restaurant.name}
                    src={checkAssetURL(restaurant.image)}
                    className={`restaurant-img ${!restaurant.is_active &&
                      "restaurant-not-active"}`}
                  />

                  {restaurant.item_offers == 1 && (
                    <div className="styles_free_item_home">
                      Free Item Inside
                    </div>
                  )}

                  <span>
                    {restaurant.highest_discount_coupon && (
                      <>
                        {restaurant.highest_discount_coupon.discount_type ===
                          "PERCENTAGE" && (
                          <span>
                            <p className="p-one">
                              {restaurant.highest_discount_coupon.discount}% OFF
                            </p>

                            {restaurant.highest_discount_coupon
                              .max_discount && (
                              <p className="p-two">
                                Upto ₹
                                {
                                  restaurant.highest_discount_coupon
                                    .max_discount
                                }
                              </p>
                            )}
                          </span>
                        )}

                        {restaurant.highest_discount_coupon.discount_type ===
                          "AMOUNT" && (
                          <>
                            <p className="p-one amount">
                              Flat {restaurant.highest_discount_coupon.discount}
                              ₹ off
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </span>
                </main>
              ) : (
                <>
                  <img
                    width={120}
                    height={147}
                    src={checkAssetURL(restaurant.image)}
                    alt={restaurant.name}
                    className={`restaurant-img ${!restaurant.is_active &&
                      "restaurant-not-active"}`}
                  />

                  {restaurant.item_offers == 1 && (
                    <div className="styles_free_item_home_without_shade">
                      Free Item Inside
                    </div>
                  )}
                </>
              )}
            </Fade>
          </div>
          <div
            className=" restaurant-in "
            style={{
              maxWidth: "65%", // Or a specific width like "200px"
            }}
          >
            <div
              className="font-w700 mb-5 text-dark"
              style={{
                fontSize: "1.2em",
                marginBottom: "0.4em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                Width: "90%", // Or a specific width like "200px"
              }}
            >
              {restaurant.name}
            </div>

            <div className="font-size-sm text-muted truncate-text text-muted">
              <p
                style={{
                  marginBottom: "0.4em",

                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "90%", // Or a specific width like "200px"
                }}
              >
                {restaurant.description}
              </p>
              <p
                style={{
                  marginBottom: "0.4em",

                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "90%", // Or a specific width like "200px"
                }}
              >
                {restaurant.address}
              </p>
            </div>
            <div className="">
              {(restaurant.couponCount > 0 ||
                (restaurant.cashback_active == 1 &&
                  restaurant.cashback_rate > 0)) && (
                <div className="restaurant-offer font-size-sm text-muted font-weight-bold text-muted mt-1 d-flex items-center">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 24 24"
                    class="text-dark mr-1"
                    height="20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m20.749 12 1.104-1.908a1 1 0 0 0-.365-1.366l-1.91-1.104v-2.2a1 1 0 0 0-1-1h-2.199l-1.103-1.909a1.008 1.008 0 0 0-.607-.466.993.993 0 0 0-.759.1L12 3.251l-1.91-1.105a1 1 0 0 0-1.366.366L7.62 4.422H5.421a1 1 0 0 0-1 1v2.199l-1.91 1.104a.998.998 0 0 0-.365 1.367L3.25 12l-1.104 1.908a1.004 1.004 0 0 0 .364 1.367l1.91 1.104v2.199a1 1 0 0 0 1 1h2.2l1.104 1.91a1.01 1.01 0 0 0 .866.5c.174 0 .347-.046.501-.135l1.908-1.104 1.91 1.104a1.001 1.001 0 0 0 1.366-.365l1.103-1.91h2.199a1 1 0 0 0 1-1v-2.199l1.91-1.104a1 1 0 0 0 .365-1.367L20.749 12zM9.499 6.99a1.5 1.5 0 1 1-.001 3.001 1.5 1.5 0 0 1 .001-3.001zm.3 9.6-1.6-1.199 6-8 1.6 1.199-6 8zm4.7.4a1.5 1.5 0 1 1 .001-3.001 1.5 1.5 0 0 1-.001 3.001z" />
                  </svg>
                  <span className="">
                    {restaurant.cashback_active == 1 &&
                      restaurant.cashback_rate > 0 &&
                      ` ${Math.round(
                        restaurant.cashback_rate
                      )}% ${localStorage.getItem("cashPointTitle")}`}

                    {restaurant.couponCount > 0 &&
                      ` ${
                        restaurant.cashback_active == 1 &&
                        restaurant.cashback_rate > 0
                          ? "& "
                          : ""
                      }${restaurant.couponCount} ${
                        restaurant.couponCount > 1 ? "Offers" : "Offer"
                      }`}
                  </span>
                </div>
              )}
              {restaurant.is_active && restaurant.is_featured ? (
                <React.Fragment>
                  {restaurant.custom_featured_name == null ? (
                    <div
                      class=" badge text-white"
                      style={{
                        backgroundColor: "#f59b3b",
                      }}
                    >
                      {localStorage.getItem("restaurantFeaturedText")}
                    </div>
                  ) : (
                    <>
                      <div
                        class=" badge text-white"
                        style={{
                          backgroundColor: "#f59b3b",
                        }}
                      >
                        {restaurant.custom_featured_name}
                      </div>
                      <br />
                    </>
                  )}
                </React.Fragment>
              ) : null}
            </div>
            {restaurant.custom_message_on_list !== null &&
              restaurant.custom_message_on_list !== "<p><br></p>" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: restaurant.custom_message_on_list,
                  }}
                />
              )}

            {!restaurant.is_active && (
              <span
                className="restaurant-not-active-msg_sahjd"
                style={{
                  color: localStorage.getItem("storeColor"),
                }}
              >
                {renderRestaurantOpenTime(restaurant)}
              </span>
            )}

            {restaurant.is_active == 1 &&
              renderRestaurantCloseTime(restaurant) != 0 &&
              renderRestaurantCloseTime(restaurant) < 30 && (
                <span
                  className="restaurant-not-active-msg_sahjd"
                  style={{
                    color: localStorage.getItem("storeColor"),
                  }}
                >
                  Restaurant closes in{" "}
                  {renderRestaurantCloseTime(restaurant)} min.
                </span>
              )}

            <hr className="line" />
            <div className="text-center restaurant-meta mt-5 d-flex align-items-center justify-content-between text-muted">
              <div className="col-4 p-0 text-left store-rating-block">
                <i
                  className="fa fa-star pr-1"
                  style={{ color: "rgb(252, 128, 25)" }}
                />{" "}
                {restaurant.avgRating === "0"
                  ? restaurant.rating
                  : restaurant.avgRating}
                {restaurant.countRating > "0" &&
                  " (" + restaurant.countRating + ")"}
              </div>
              <div className="col-4 p-0 text-center store-distance-block">
                <span>
                  <i className="si si-clock pr-1" />
                  {restaurant.delivery_time}{" "}
                  {localStorage.getItem("homePageMinsText")}
                </span>
              </div>
              <div className="col-4 p-0 text-center store-distance-block">
                <span>
                  <i className="si si-pointer pr-1" />
                  {restaurant.distance.toFixed(1)} KM
                </span>
              </div>
            </div>

           
          </div>

          <Ink duration="500" hasTouch={false} />
        </DelayLink>
      </div>
    </>
  );
}

export default RestaurantCard;
