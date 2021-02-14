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
	return (
		<div className="p-1 lg:p-2 my-1 max-w-md mx-auto">
			{restaurant.addedBy && (
				<div className="text-xs uppercase tracking-wide text-gray-500 mt-1 mb-2">
					Added by{" "}
					{userIdHash === restaurant.addedBy.hashId
						? "You"
						: restaurant.addedBy.name}
					{userIdHash === restaurant.addedBy.hashId && (
						<button
							aria-label={`remove ${restaurant.business.name}`}
							onClick={() =>
								socket.removeRestaurant(
									sessionId || "",
									userId || "",
									restaurant.business.id
								)
							}
							className="mx-1 px-2 py-0.5 border border-gray-300 rounded bg-gray-50 hover:bg-red hover:text-gray-50 hover:border-red hover:shadow btn-focus transition-all duration-200"
						>
							<FontAwesomeIcon icon={faTrash} className="mr-1" />
							remove
						</button>
					)}
				</div>
			)}
			<div className="flex justify-between items-start">
				{addRestaurant}
				<div className="flex-1" onClick={() => setExpanded((prev) => !prev)}>
					<h2 className="flex-1 leading-tight font-display italic font-bold text-xl text-gray-800">
						{restaurant.business.name}
						{restaurant.business.price && (
							<span className="ml-2 px-1 pt-1 rounded bg-gray-500 text-gray-50 text-sm whitespace-nowrap">
								{restaurant.business.price.split("").map((_, i) => (
									<FontAwesomeIcon icon={faDollarSign} key={i} />
								))}
							</span>
						)}
					</h2>
					<div className="text-gray-500 font-display leading-tight px-3">
						{restaurant.business.categories.map((c) => c.title).join(", ")}
					</div>
					{restaurant.business.hours && restaurant.business.hours[0] && (
						<div className="text-gray-500 uppercase font-bold tracking-wide text-sm leading-tight px-3">
							<FontAwesomeIcon icon={faClock} className="mr-1" />
							{openMsg(restaurant.business.hours[0])}
						</div>
					)}
				</div>

				<button
					className="flex-initial fa-layers fa-fw fa-2x ml-2 right-0 btn-focus rounded-full"
					onClick={() => setExpanded((prev) => !prev)}
					aria-label={expanded ? "hide more info" : "show more info"}
				>
					<FontAwesomeIcon className=" text-gray-50" icon={faCircle} />
					<FontAwesomeIcon
						className=" text-yellow"
						icon={expanded ? faChevronCircleUp : faChevronCircleDown}
					/>
				</button>
			</div>

			<div className="pl-3">
				{restaurant.votes.length > 0 && (
					<div className="my-1">
						{restaurant.votes.map((v, idx) =>
							v ? (
								<span className="m-1 border-gray-800 rounded-sm border bg-gray-50 shadow-md whitespace-nowrap">
									<span className="bg-gray-800 text-gray-50 px-1">
										<FontAwesomeIcon icon={icons[idx].icon} />
									</span>
									<span className="px-2 text-gray-800">{v}</span>
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
							<div className="flex-initial ml-2">
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
											<h3 className="uppercase tracking-wide font-bold text-gray-500 text-sm">
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
									className="block text-center rounded w-full py-1 px-3 bg-red text-gray-50 font-bold italic mt-3"
									href={restaurant.business.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									more info
									<FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2" />
								</a>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

const HoursTable: React.FC<{ hours: [Hours] | undefined }> = ({ hours }) => {
	if (!hours || !hours[0]) {
		return (
			<div className="text-gray-500 py-2 px-4 rounded my-3 border border-gray-500 italic text-sm">
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
								<span className="italic text-gray-500">Closed</span>
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
