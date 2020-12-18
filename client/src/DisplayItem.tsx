import {
	faCircle,
	faChevronCircleUp,
	faChevronCircleDown,
	faDollarSign,
	faClock,
	faMapPin,
	faCheck,
	faExternalLinkAlt,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode, useState } from "react";
import { icons } from "./VotingIcons";
import { BusinessWithVotes, Hours } from "../../shared/types";
import socket from "./socket";

export const DisplayItem: React.FC<{
	restaurant: BusinessWithVotes;
	addRestaurant?: ReactNode;
	vote?: ReactNode;
	userIdHash?: string;
	userId?: string;
	sessionId?: string;
}> = ({ restaurant, addRestaurant, vote, userIdHash, userId, sessionId }) => {
	let [expanded, setExpanded] = useState(false);
	// let {userState} = useContext(UserContext);
	return (
		<div
			key={restaurant.business.id}
			className="relative p-1 lg:p-2 my-1 max-w-md mx-auto flex"
		>
			<button
				className="fa-layers fa-fw fa-2x absolute m-2 right-0 btn-focus rounded-full"
				onClick={() => setExpanded((prev) => !prev)}
			>
				<FontAwesomeIcon className=" text-white" icon={faCircle} />
				<FontAwesomeIcon
					className=" text-theme-yellow"
					icon={expanded ? faChevronCircleUp : faChevronCircleDown}
				/>
			</button>

			<div className="flex-initial">{addRestaurant}</div>

			<div className="flex-1">
				{restaurant.addedBy && (
					<div className="text-xs uppercase tracking-wide text-theme-med-gray mb-xs">
						Added by{" "}
						{userIdHash === restaurant.addedBy.hashId
							? "You"
							: restaurant.addedBy.name}
						{userIdHash === restaurant.addedBy.hashId && (
							<button
								onClick={() =>
									socket.removeRestaurant(
										sessionId || "",
										userId || "",
										restaurant.business.id
									)
								}
								className="mx-1 px-2 border border-theme-extra-light-gray rounded hover:bg-theme-red hover:text-white hover:border-theme-red hover:shadow btn-focus transition-all duration-200"
							>
								<FontAwesomeIcon icon={faTrash} className="mr-1" />
								remove
							</button>
						)}
					</div>
				)}
				<h2 className="leading-tight font-display italic font-bold text-xl text-theme-dark-gray mr-8">
					{restaurant.business.name}
					{restaurant.business.price && (
						<span className="ml-2 px-1 pt-1 rounded bg-theme-light-gray text-white text-sm whitespace-no-wrap">
							{restaurant.business.price.split("").map((_, i) => (
								<FontAwesomeIcon icon={faDollarSign} key={i} />
							))}
						</span>
					)}
				</h2>
				<div className="pl-3">
					<div className="text-theme-light-gray font-display leading-none mr-8">
						{restaurant.business.categories.map((c) => c.title).join(", ")}
					</div>
					{restaurant.business.hours && restaurant.business.hours[0] && (
						<div className="text-theme-light-gray uppercase font-bold tracking-wide text-sm leading-none">
							<FontAwesomeIcon icon={faClock} className="mr-1" />
							{openMsg(restaurant.business.hours[0])}
						</div>
					)}

					{restaurant.votes.length > 0 && (
						<div className="my-1">
							{restaurant.votes.map((v, idx) =>
								v ? (
									<span className="m-1 border-theme-dark-gray rounded-sm border bg-white bg-opacity-50 shadow">
										<span className="bg-theme-dark-gray text-white px-1">
											<FontAwesomeIcon icon={icons[idx].icon} />
										</span>
										<span className="px-2 text-theme-dark-gray">{v}</span>
									</span>
								) : null
							)}
						</div>
					)}
					{!addRestaurant ? vote : null}
					{expanded && (
						<>
							{addRestaurant ? vote : null}

							<div className="flex justify-around mt-2">
								<div className="flex-shrink-0">
									<HoursTable hours={restaurant.business.hours} />
								</div>
								<div className="flex-initial">
									<div className="flex">
										<FontAwesomeIcon
											icon={faMapPin}
											className="flex-none mt-1 mr-2"
										/>

										<div className="flex-initial">
											{restaurant.business.location.display_address.map(
												(line) => (
													<p>{line}</p>
												)
											)}
										</div>
									</div>
									{restaurant.business.transactions &&
										restaurant.business.transactions.length > 0 && (
											<ul className="mt-3">
												<h3 className="uppercase tracking-wide font-bold text-theme-med-gray text-sm font-light">
													Services offered:
												</h3>

												{restaurant.business.transactions.map((t) => (
													<li>
														<FontAwesomeIcon
															icon={faCheck}
															className="mr-2 text-green-500"
														/>
														{t}
													</li>
												))}
											</ul>
										)}

									<a
										className="block text-center rounded w-full py-1 px-3 bg-theme-red text-white font-bold italic mt-3"
										href={restaurant.business.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										more info
										<FontAwesomeIcon
											icon={faExternalLinkAlt}
											className="ml-2"
										/>
									</a>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

const HoursTable: React.FC<{ hours: [Hours] | undefined }> = ({ hours }) => {
	if (!hours || !hours[0]) {
		return (
			<div className="text-theme-light-gray py-2 px-4 rounded my-3 border border-theme-light-gray italic text-sm">
				No hours available.
			</div>
		);
	}
	let days = [
		"Mon",
		"Tues",
		"Weds",
		"Thurs",
		"Fri",
		"Sat",
		"Sun",
	].map((d: string) => ({ day: d, hourStr: new Array<string>() }));
	let dateify = (start: string, end: string): string =>
		`${formatAsTime(start)} - ${formatAsTime(end)}`;
	hours[0].open.forEach((h) =>
		days[h.day].hourStr.push(dateify(h.start, h.end))
	);
	return (
		<table>
			<tbody>
				{days.map((day) => (
					<tr key={day.day}>
						<th className="text-left py-0 align-top">{day.day}</th>
						<td className="py-0 pl-3 whitespace-pre">
							{day.hourStr.length > 0 ? (
								day.hourStr.join(",\n")
							) : (
								<span className="italic text-theme-light-gray">Closed</span>
							)}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

const formatAsTime = (time: string): string =>
	`${time.slice(0, 2)}:${time.slice(2)}`;

const openMsg = (hours: Hours): string => {
	const padZeros = (n: number) => ("00" + n).slice(-2);
	const today = new Date();
	const dayOfWeek = (((today.getDay() - 1) % 6) + 6) % 6;
	const timeString = padZeros(today.getHours()) + padZeros(today.getMinutes());
	let diff = 9999999;
	const days = hours.open.filter((h) => h.day === dayOfWeek);
	if (days.length === 0) {
		return "Closed";
	}
	let t: string | undefined = undefined;
	for (let h of days) {
		if (timeString < h.start) {
			// will open later
			const currentDiff = +h.start - +timeString;
			if (currentDiff < diff) {
				t = formatAsTime(h.start);
				diff = currentDiff;
			}
		} else if (timeString < h.end) {
			// open now
			return "Open now";
		}
	}
	if (t) {
		return `Opens at ${t}`;
	}
	return "Closed";
};

export default DisplayItem;
