import React, { Component } from "react";
import moment from "moment";
import Dialog from "@material-ui/core/Dialog";
import "./index.css";

class OrderScheduling extends Component {
	state = {
		timeStops: [],
		time: [],
		day: "",
		slotsArray: [],
		days: [],
		sortedArray: [],
		open: false,
		todayDate: null,
		selectedDate: null,
		slotsDays: [],
		selectedSlot: {},
	};

	componentDidMount() {

		// Show popup if restaurant only accepts scheduled orders
		if (this.props.restaurant.only_schedule_orders === 1) {
			this.props.handleOnlyScheduleOrderPopup(true)
		}

		this.getCurrentDay();
		if (JSON.parse(this.props.restaurant.schedule_data)) {
			this.getSlots(
				JSON.parse(this.props.restaurant.schedule_data)[this.getCurrentDay(new Date().getDay())],
				this.props.restaurant.schedule_order_slot_interval,
				"m"
			);
		}

		let d1 = new Date();
		this.setState({
			todayDate: moment(new Date()).format("YYYY-MM-DD"),
			currentTime: moment(d1.getTime()).format("hh:mm A"),
			selectedDate: moment(new Date()).format("YYYY-MM-DD"),
		});

		let arr = [];
		for (let i = 0; i < Object.keys(JSON.parse(this.props.restaurant.schedule_data)).length; i++) {
			arr.push({
				days: Object.keys(JSON.parse(this.props.restaurant.schedule_data))[i],
			});
		}
		this.setState({ slotsDays: arr }, () => {
			this.getCurrentWeek();
		});
	}

	getCurrentDay = (i) => {
		let day;
		switch (i) {
			case 0:
				day = "sunday";
				break;
			case 1:
				day = "monday";
				break;
			case 2:
				day = "tuesday";
				break;
			case 3:
				day = "wednesday";
				break;
			case 4:
				day = "thursday";
				break;
			case 5:
				day = "friday";
				break;
			case 6:
				day = "saturday";
				break;
			default:
				day = "";
				break;
		}
		this.setState({ day: day });

		return day;
	};

	getCurrentWeek = () => {
		let currentDate = moment();
		let weekStart = currentDate.clone().startOf("isoWeek");

		// let weekEnd = moment().add(new Date().getDay() - 4, "days");
		// let weekEnd = moment().add(new Date().getDay() === 6 ? new Date().getDay() - 4 : new Date().getDay() === 0 ? new Date().getDay() - 1 : new Date().getDay() === new Date().getDay() - 1 ? 1 , "days");

		let weekEnd = currentDate.clone().endOf("isoWeek") + 1;

		let days = [];
		let nextWeek = [];

		for (let i = 0; i <= 6; i++) {
			days.push({
				day: moment(weekStart)
					.add(i, "days")
					.format("dddd"),
				date: moment(weekStart)
					.add(i, "days")
					.format("YYYY-MM-DD"),
			});
			nextWeek.push({
				day: moment(weekEnd)
					.add(i, "days")
					.format("dddd"),
				date: moment(weekEnd)
					.add(i, "days")
					.format("YYYY-MM-DD"),
			});
		}

		let arr = [];
		for (let i = 0; i < days.length; i++) {
			if (moment(days[i].date).isSameOrAfter(moment(new Date()).format("YYYY-MM-DD"))) {
				arr.push(days[i]);
			}
		}

		if (parseInt(localStorage.getItem("orderSchedulingFutureDays")) > arr.length) {
			let array1 = arr.concat(nextWeek).filter((days) => {
				return this.state.slotsDays.some((availSlots) => {
					return days.day.toLowerCase() === availSlots.days.toLowerCase();
				});
			});

			this.setState({ days: array1 }, () => {
				this.daysAvailable(this.state.days);
			});
		} else {
			let array1 = arr.filter((days) => {
				return this.state.slotsDays.some((availSlots) => {
					return days.day.toLowerCase() === availSlots.days.toLowerCase();
				});
			});

			this.setState({ days: array1 }, () => {
				this.daysAvailable(this.state.days);
			});
		}
	};

	daysAvailable = () => {
		if (this.state.days.length > 0) {
			this.state.days.sort((a, b) => {
				let day1 = new Date(a.date);
				let day2 = new Date(b.date);
				return day1 - day2;
			});

			// Filter out today if only_schedule_orders is enabled
			let availableDays = this.state.days;
			if (this.props.restaurant && this.props.restaurant.only_schedule_orders === 1) {
				const today = moment(new Date()).format("YYYY-MM-DD");
				availableDays = this.state.days.filter(day => day.date !== today);
			}

			if (localStorage.getItem("enFixedNumberOfDays") === "true") {
				let arr = availableDays.slice(0, parseInt(localStorage.getItem("orderSchedulingFutureDays")));

				if (arr.length > 0) {
					let sortedArray = arr.filter((days) => {
						return this.state.slotsDays.some((availSlots) => {
							return days.day.toLowerCase() === availSlots.days.toLowerCase();
						});
					});

					this.setState({ sortedArray: sortedArray }, () => {
						// Auto-select tomorrow if only_schedule_orders is enabled
						if (this.props.restaurant && this.props.restaurant.only_schedule_orders === 1 && sortedArray.length > 0) {
							this.setDay(sortedArray[0]);
						}
					});
				}
			} else {
				this.setState({ sortedArray: availableDays }, () => {
					// Auto-select tomorrow if only_schedule_orders is enabled
					if (this.props.restaurant && this.props.restaurant.only_schedule_orders === 1 && availableDays.length > 0) {
						this.setDay(availableDays[0]);
					}
				});
			}
		}
	};

	getSlots = (data, timeSlots, _format) => {
			console.log("getSlots called with data:", data, "timeSlots:", timeSlots, "format:", _format);
		let slots = [];
		const interval = parseInt(timeSlots, 10) > 0 ? parseInt(timeSlots, 10) : 30;
		const today = moment().format("YYYY-MM-DD");
		const supportedTimeFormats = ["HH:mm", "H:mm", "hh:mm A", "h:mm A"];

		if (data && data.length > 0) {
			for (let i = 0; i < data.length; i++) {
				let open = moment(`${today} ${data[i].open}`, supportedTimeFormats.map((f) => `YYYY-MM-DD ${f}`), true);
				let close = moment(`${today} ${data[i].close}`, supportedTimeFormats.map((f) => `YYYY-MM-DD ${f}`), true);

				if (!open.isValid() || !close.isValid()) {
					continue;
				}

				// Support overnight ranges where close time is on the next day.
				if (close.isSameOrBefore(open)) {
					close.add(1, "day");
				}

				let slotStart = open.clone();
				while (slotStart.clone().add(interval, "minutes").isSameOrBefore(close)) {
					const slotEnd = slotStart.clone().add(interval, "minutes");
					slots.push({
						open: slotStart.format("hh:mm A"),
						close: slotEnd.format("hh:mm A"),
					});
					slotStart = slotEnd;
				}
			}
		}

		this.setState({ slotsArray: slots });
		return slots;
	};

	setDay = (scheduleDay) => {
		this.setState({
			day: scheduleDay.day,
			selectedDate: scheduleDay.date,
			selectedSlot: {},
		});
		let dateAndDay = {
			day: scheduleDay.day,
			date: scheduleDay.date,
		};
		localStorage.setItem("orderDate", JSON.stringify(dateAndDay));

		if (scheduleDay.day !== this.state.day) {
			localStorage.removeItem("orderSlot");
		}

		if (scheduleDay) {
			let tomorrow = JSON.parse(this.props.restaurant.schedule_data)[
				this.getCurrentDay(
					scheduleDay.day.toLowerCase() === "sunday"
						? 0
						: scheduleDay.day.toLowerCase() === "monday"
							? 1
							: scheduleDay.day.toLowerCase() === "tuesday"
								? 2
								: scheduleDay.day.toLowerCase() === "wednesday"
									? 3
									: scheduleDay.day.toLowerCase() === "thursday"
										? 4
										: scheduleDay.day.toLowerCase() === "friday"
											? 5
											: 6
				)
			];
			this.getSlots(tomorrow, this.props.restaurant.schedule_order_slot_interval, "m");
		}
	};

	toggleSchedulePopup = () => {
		this.setState({ open: !this.state.open });
	};

	chooseOrderSlot = (dateDetails) => {
		if (localStorage.getItem("orderDate") === null) {
			let dateAndDay = {
				day: this.state.day,
				date: moment(new Date()).format("YYYY-MM-DD"),
			};
			localStorage.setItem("orderDate", JSON.stringify(dateAndDay));
		}
		localStorage.setItem("orderSlot", JSON.stringify(dateDetails));
		this.setState({ selectedSlot: dateDetails });
	};

	renderScheduleButton = () => {
		const orderDate = localStorage.getItem("orderDate");
		const orderSlot = localStorage.getItem("orderSlot");
		if (!(orderDate !== null && orderSlot !== null)) {
			return (
				<React.Fragment>
					<i className="si si-clock" />
					<span className="ml-2">{localStorage.getItem("modOSScheduleThisOrderText")}</span>
				</React.Fragment>
			);
		} else {
			const orderDateJson = JSON.parse(orderDate);
			const orderSlotJson = JSON.parse(orderSlot);
			return (
				<React.Fragment>
					<div className="d-flex justify-content-between w-100">
						<div>
							<span>
								{localStorage.getItem("modOSScheduleForText")} {orderDateJson.day}{" "}
								<small className="text-white">({orderDateJson.date})</small> <br />({orderSlotJson.open}{" "}
								- {orderSlotJson.close})
							</span>
						</div>
						<div>
							<button className="btn btn-sm"
								style={{
									backgroundColor: localStorage.getItem('storeColor')
								}}
								onClick={this.removeSelectedSchedule}>
								{localStorage.getItem("modOSRemoveBtnText")}
							</button>
						</div>
					</div>
				</React.Fragment>
			);
		}
	};

	removeSelectedSchedule = (event) => {
		event.stopPropagation();
		localStorage.removeItem("orderDate");
		localStorage.removeItem("orderSlot");
		this.setState({ selectedDate: null, selectedSlot: {}, slotsArray: [] });
	};

	renderDoneButton = () => {
		const orderDate = localStorage.getItem("orderDate");
		const orderSlot = localStorage.getItem("orderSlot");
		if (orderDate !== null && orderSlot !== null) {
			if (this.state.open) {
				return (
					<React.Fragment>
						<button
							className="btn btn-main"
							style={{
								color: localStorage.getItem("cartColorText"),
								backgroundColor: localStorage.getItem("cartColorBg"),
								position: "fixed",
								bottom: "0",
								zIndex: "9999999",
							}}
							onClick={this.toggleSchedulePopup}
						>
							{localStorage.getItem("modOSDoneBtnText")}
						</button>
					</React.Fragment>
				);
			}
		}
	};

	getFirstSlot = (time) => {
		let slotBasedOnCurrentTime = moment(this.state.currentTime, "hh:mm A").add(
			this.props.restaurant.schedule_slot_buffer,
			"minutes"
		); //add minutes from store's schedule_slot_buffer value
		let openTime = moment(time.open, "hh:mm A");
		if (slotBasedOnCurrentTime.isSameOrBefore(openTime)) {
			return true;
		} else {
			return false;
		}
	};

	render() {
		const orderDate = localStorage.getItem("orderDate");
		const orderSlot = localStorage.getItem("orderSlot");
		const hasSchedule = orderDate !== null && orderSlot !== null;

		return (
			<React.Fragment>
				<div className={`schedule-order-btn p-10 mx-15 mt-2 ${hasSchedule ? "has-schedule" : ""}`}

					style={{
						"border-color": localStorage.getItem('storeColor')
					}}
					onClick={this.toggleSchedulePopup}>
					<React.Fragment>{this.renderScheduleButton()}</React.Fragment>
				</div>

				<Dialog
					maxWidth={false}
					fullWidth={true}
					fullScreen={true}
					open={this.state.open}
					onClose={this.toggleSchedulePopup}
					className="schedule-dialog"
					style={{ margin: "auto", position: "absolute", bottom: "0", top: "25%" }}
					PaperProps={{
						style: {
							backgroundColor: "#fff",
							borderTopLeftRadius: "16px",
							borderTopRightRadius: "16px",
						},
					}}
				>
					<div className="container p-0 m-0">
						<h3 className="schedule-dialog-title">{localStorage.getItem("modOSSelectDateTimeText")}</h3>
						<div className="day-slots-container">
							<div className="day-slots">
								{this.state.sortedArray.length > 0 && (
									<React.Fragment>
										{this.state.sortedArray.map((day) => (
											<div
												key={day.date}
												className={`day-slot ${this.state.day.toLowerCase() === day.day.toLowerCase() && this.state.selectedDate === day.date ? "active" : ""}`}
												onClick={() => {
													console.log("Selected day:", day); // Debug log to check the selected day
													this.setDay(day)}}
											>
												<div className="day-name">{day.day.slice(0, 3)}</div>
												<div className="day-date">
													{day.date === this.state.todayDate
														? "Today"
														: day.date === moment().clone().add(1, "days").format("YYYY-MM-DD")
															? "Tomorrow"
															: moment(day.date).format("D")}
												</div>
											</div>
										))}
									</React.Fragment>
								)}
							</div>
						</div>

						<div className="time-slots-container">
							{this.state.slotsArray.length > 0 ? (
								this.state.slotsArray.map((time, index) => (
									<React.Fragment key={index}>
										{this.state.todayDate === this.state.selectedDate ? (
											<React.Fragment>
												{this.getFirstSlot(time) && (
													<div
														className={`time-slot ${this.state.selectedSlot.open === time.open ? "selected" : ""}`}
														onClick={() => this.chooseOrderSlot(time)}
													>
														{time.open + " - " + time.close}
													</div>
												)}
											</React.Fragment>
										) : (
											<div
												className={`time-slot ${this.state.selectedSlot.open === time.open ? "selected" : ""}`}
												onClick={() => this.chooseOrderSlot(time)}
											>
												{time.open + " - " + time.close}
											</div>
										)}
									</React.Fragment>
								))
							) : (
								<div className="no-slots">
									<p>No time slots available for this day</p>
								</div>
							)}
						</div>
					</div>
				</Dialog>
				{this.renderDoneButton()}
				<>
					{this.props.restaurant && this.props.restaurant.only_schedule_orders === 1 && (
						<Dialog
							open={this.props.showScheduleOrderPopup}
							onClose={() => this.props.handleOnlyScheduleOrderPopup(false)}
							className="schedule-order-popup"
							PaperProps={{
								style: {
									backgroundColor: "#fff",
									borderRadius: "16px",
									padding: "20px",
									margin: "20px",
									textAlign: "center",
								},
							}}
						>
							<div className="schedule-order-popup-content">
								<h4 style={{ marginBottom: "10px" }}>
									{localStorage.getItem("storeOnlyAcceptsScheduledOrders") || "This store only accepts scheduled orders"}
								</h4>
								<p style={{ marginBottom: "20px", color: "#666" }}>
									{localStorage.getItem("toPlaceOrderSelectDateTime") || "To place an order, please select date and time slot"}
								</p>
								<button
									className="btn btn-main"
									style={{
										backgroundColor: localStorage.getItem("storeColor"),
										color: "#fff",
										padding: "10px 30px",
										borderRadius: "4px",
									}}
									onClick={() => this.props.handleOnlyScheduleOrderPopup(false)}
								>
									{localStorage.getItem("closeBtnText") || "Close"}
								</button>
							</div>
						</Dialog>
					)}
				</>
			</React.Fragment>

		);
	}
}

export default OrderScheduling;
