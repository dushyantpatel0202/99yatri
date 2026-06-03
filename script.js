// --- Route Matching Logic ---
let allRoutes = [];

async function loadRoutes() {
    const response = await fetch("rout.json");
    if (!response.ok) throw new Error("Failed to load rout.json");
    const data = await response.json();
    
    // Extract all stations from rout.json stoppages
    const routeStations = new Set();
    if (data.categories) {
        data.categories.forEach(category => {
            if (category.routes) {
                category.routes.forEach(route => {
                    if (route.stoppages && Array.isArray(route.stoppages)) {
                        route.stoppages.forEach(stop => {
                            routeStations.add(stop);
                        });
                    }
                });
            }
        });
    }
    
    allRoutes = data;
    
    // Merge rout.json stations with existing allStations
    const existingStations = new Set(allStations);
    routeStations.forEach(station => existingStations.add(station));
    allStations = Array.from(existingStations).sort();
    
    console.log("Total stations (from busdata.json + rout.json):", allStations.length);
}

function getUniqueStationSet(stations) {
	return new Set(stations.map(s => s.trim().toLowerCase()).filter(Boolean));
}

function attachMatchingRouteNumbers() {
	if (!Array.isArray(allRoutes) || !allRoutes.length || !Array.isArray(busData)) return;
	for (const bus of busData) {
		let matched = '';
		if (bus.route) {
			const busStations = getUniqueStationSet(bus.route.map(stop => stop.station));
			for (const route of allRoutes) {
				const routeStations = getUniqueStationSet(route.stops);
				if ([...routeStations].every(st => busStations.has(st))) {
					matched = route.route_number;
					break;
				}
			}
		}
		bus.matchedRouteNumber = matched;
	}
}
let busData = [];

		const startStationEl = document.getElementById("startStation");
		const endStationEl = document.getElementById("endStation");
		const startStationListEl = document.getElementById("startStationList");
		const endStationListEl = document.getElementById("endStationList");
		const searchBtnEl = document.getElementById("searchBtn");
		const busListBtnEl = document.getElementById("busListBtn");
		const swapStationsBtnEl = document.getElementById("swapStationsBtn");
		const themeToggleBtnEl = document.getElementById("themeToggleBtn");
		const themeToggleIconEl = document.getElementById("themeToggleIcon");
		const languageSelectEl = document.getElementById("languageSelect");
		const languageLabelEl = document.getElementById("languageLabel");
		const heroTitleEl = document.getElementById("heroTitle");
		const heroSubtitleEl = document.getElementById("heroSubtitle");
		const startLabelEl = document.getElementById("startLabel");
		const endLabelEl = document.getElementById("endLabel");
		const resultsEl = document.getElementById("results");
		const errorTextEl = document.getElementById("errorText");
		const metaTextEl = document.getElementById("metaText");
		const trackerWarningEl = document.getElementById("trackerWarning");

		let allStations = [];
		let subStationToParentMap = {}; // lowercase sub-station name → parent main station (canonical)
		let allSubStationNames = []; // sorted unique sub-station display names
		let cityNameLookup = {}; // lowercase city name -> canonical city name

		const globalDefaultSegmentFare = 10;
		const defaultRouteNumberingConfig = {
			locationCodeStartNumber: 1,
			locationCodeStep: 1,
			locationCodeWidth: 3,
			serialStartNumber: 1,
			serialStep: 1,
			serialWidth: 3,
			useStartLocationField: true,
			useFirstRouteStopAsStartLocation: true,
			useBusNumberDigitsAsFallback: true
		};
		let routeNumberingConfig = { ...defaultRouteNumberingConfig };

		const stateCodes = {
			"andaman and nicobar islands": "AN",
			"andhra pradesh": "AP",
			"arunachal pradesh": "AR",
			"assam": "AS",
			"bihar": "BR",
			"chhattisgarh": "CG",
			"chandigarh": "CH",
			"dadra and nagar haveli and daman and diu": "DD",
			"delhi": "DL",
			"goa": "GA",
			"gujarat": "GJ",
			"haryana": "HR",
			"himachal pradesh": "HP",
			"jharkhand": "JH",
			"karnataka": "KA",
			"kerala": "KL",
			"ladakh": "LA",
			"lakshadweep": "LD",
			"madhya pradesh": "MP",
			"maharashtra": "MH",
			"manipur": "MN",
			"meghalaya": "ML",
			"mizoram": "MZ",
			"nagaland": "NL",
			"odisha": "OD",
			"puducherry": "PY",
			"punjab": "PB",
			"rajasthan": "RJ",
			"sikkim": "SK",
			"tamil nadu": "TN",
			"telangana": "TG",
			"tripura": "TR",
			"uttar pradesh": "UP",
			"uttarakhand": "UK",
			"west bengal": "WB"
		};

		const districtCodes = {
			"balod": "BD",
			"baloda bazar-bhatapara": "BB",
			"balrampur": "BP",
			"bastar": "BS",
			"bemetara": "BM",
			"bijapur": "BJ",
			"bilaspur": "BL",
			"dantewada": "DT",
			"dhamtari": "DH",
			"durg": "DG",
			"gariaband": "GB",
			"gaurela-pendra-marwahi": "GP",
			"janjgir-champa": "JC",
			"jashpur": "JS",
			"kabirdham": "KB",
			"kanker": "KN",
			"khairagarh-chhuikhadan-gandai": "KC",
			"kondagaon": "KD",
			"korba": "KO",
			"korea": "KR",
			"mahasamund": "MS",
			"manendragarh-chirmiri-bharatpur": "MC",
			"mohla-manpur-ambagarh chowki": "MM",
			"mungeli": "MU",
			"narayanpur": "NP",
			"raigarh": "RG",
			"raipur": "RP",
			"rajnandgaon": "RN",
			"sakti": "SK",
			"sarangarh-bilaigarh": "SB",
			"sukma": "SU",
			"surajpur": "SJ",
			"surguja": "SG"
		};

		const cityCodeOverrides = {
			// Keep explicit overrides here when city code must not be plain first-3 letters.
			"abhanpur": "ABH",
			"ambikapur": "ABK",
			"arang": "ARN",
			"balod": "BLD",
			"barahdwar": "BRD",
			"barmkela": "BMK",
			"belgahna": "BGH",
			"bhatapara": "BTP",
			"bilaigarh": "BLG",
			"bilaspur": "BSP",
			"bilha": "BLH",
			"birgaon": "BRG",
			"chandrapur": "CDP",
			"dabhra": "DBR",
			"dhamtari": "DHT",
			"dharamjaigarh": "DJG",
			"durg": "DRG",
			"gobra navapara": "GNP",
			"gharghoda": "GRH",
			"jagdalpur": "JDP",
			"jaijaipur": "JJP",
			"kharora": "KRR",
			"kharsia": "KHS",
			"kota": "KOT",
			"lailunga": "LLG",
			"mahasamund": "MHS",
			"malhar": "MLH",
			"malkharoda": "MKR",
			"mandir hasaud": "MHD",
			"masturi": "MST",
			"nawapara": "NWP",
			"pusaur": "PSR",
			"raigarh": "RGH",
			"raipur": "RPR",
			"rajnandgaon": "RJN",
			"ratanpur": "RTP",
			"sakti": "SKT",
			"sarangarh": "SRG",
			"sarsiwa": "SRW",
			"seepat": "SPT",
			"shakti": "SHK",
			"takhatpur": "TKP",
			"tamnar": "TMR",
			"tilda": "TLD"
		};

		function normalizeCodeLookupValue(value) {
			return String(value || "").trim().toLowerCase();
		}

		function getCityCode(city) {
			const normalizedCity = normalizeCodeLookupValue(city);
			if (!normalizedCity) {
				return "";
			}

			const manualCode = cityCodeOverrides[normalizedCity];
			if (manualCode) {
				return String(manualCode).trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
			}

			const lettersOnly = normalizedCity.replace(/[^a-z]/g, "");
			if (lettersOnly.length < 3) {
				return "";
			}

			return lettersOnly.slice(0, 3).toUpperCase();
		}

		function getConfiguredRouteNumber(bus) {
			if (bus.routeNumber !== undefined && bus.routeNumber !== null && bus.routeNumber !== "") {
				return String(bus.routeNumber).trim();
			}
			if (!routeNumberingConfig.useBusNumberDigitsAsFallback) {
				return "";
			}
			const fallbackBusNumber = String(bus.busNo || "");
			const routeNumberMatch = fallbackBusNumber.match(/(\d+)/);
			if (routeNumberMatch) {
				return routeNumberMatch[1];
			}
			return "";
		}

		function getNormalizedRouteOrigin(bus) {
			return normalizeCodeLookupValue(bus.origin);
		}

		function getRouteStartLocation(bus) {
			if (routeNumberingConfig.useStartLocationField && bus.startLocation) {
				return String(bus.startLocation).trim();
			}
			if (routeNumberingConfig.useFirstRouteStopAsStartLocation) {
				const firstStopStation = bus.route?.[0]?.station;
				if (firstStopStation) {
					return String(firstStopStation).trim();
				}
			}
			return String(bus.origin || "").trim();
		}

		function getRouteDestinationStation(bus) {
			const lastStop = Array.isArray(bus.route) && bus.route.length ? bus.route[bus.route.length - 1] : null;
			return lastStop?.station || bus.city || bus.district || bus.busName || "";
		}

		function getLocationCodeStartValue() {
			const configuredStart = Number(routeNumberingConfig.locationCodeStartNumber);
			if (Number.isInteger(configuredStart) && configuredStart > 0) {
				return configuredStart;
			}

			return defaultRouteNumberingConfig.locationCodeStartNumber;
		}

		function getLocationCodeStepValue() {
			const configuredStep = Number(routeNumberingConfig.locationCodeStep);
			if (Number.isInteger(configuredStep) && configuredStep > 0) {
				return configuredStep;
			}

			return defaultRouteNumberingConfig.locationCodeStep;
		}

		function getSerialStartValue() {
			const configuredStart = Number(routeNumberingConfig.serialStartNumber);
			if (Number.isInteger(configuredStart) && configuredStart > 0) {
				return configuredStart;
			}

			return defaultRouteNumberingConfig.serialStartNumber;
		}

		function getSerialStepValue() {
			const configuredStep = Number(routeNumberingConfig.serialStep);
			if (Number.isInteger(configuredStep) && configuredStep > 0) {
				return configuredStep;
			}

			return defaultRouteNumberingConfig.serialStep;
		}

		function getLocationCodeWidthValue() {
			const configuredWidth = Number(routeNumberingConfig.locationCodeWidth);
			if (Number.isInteger(configuredWidth) && configuredWidth > 0) {
				return configuredWidth;
			}

			return defaultRouteNumberingConfig.locationCodeWidth;
		}

		function getSerialWidthValue() {
			const configuredWidth = Number(routeNumberingConfig.serialWidth);
			if (Number.isInteger(configuredWidth) && configuredWidth > 0) {
				return configuredWidth;
			}

			return defaultRouteNumberingConfig.serialWidth;
		}

		function getAutoRouteNumberByOrigin(bus) {
			const normalizedOrigin = getNormalizedRouteOrigin(bus);
			if (!normalizedOrigin || !Array.isArray(busData) || !busData.length) {
				return "";
			}

			const locationCodeByStartLocation = new Map();
			const usedNumbers = new Set(
				busData
					.filter((item) => getNormalizedRouteOrigin(item) === normalizedOrigin)
					.map((item) => getConfiguredRouteNumber(item))
					.filter(Boolean)
			);

			const unresolvedOriginRoutes = busData
				.filter((item) => getNormalizedRouteOrigin(item) === normalizedOrigin && !getConfiguredRouteNumber(item))
				.slice();

			let nextLocationCode = getLocationCodeStartValue();
			const locationCodeStep = getLocationCodeStepValue();
			const serialStart = getSerialStartValue();
			const serialStep = getSerialStepValue();
			const locationCodeWidth = getLocationCodeWidthValue();
			const serialWidth = getSerialWidthValue();
			const nextSerialByLocation = new Map();

			for (const unresolvedBus of unresolvedOriginRoutes) {
				const normalizedStartLocation = normalizeCodeLookupValue(getRouteStartLocation(unresolvedBus));
				if (!normalizedStartLocation) {
					continue;
				}

				if (!locationCodeByStartLocation.has(normalizedStartLocation)) {
					locationCodeByStartLocation.set(normalizedStartLocation, nextLocationCode);
					nextLocationCode += locationCodeStep;
				}

				const locationCode = locationCodeByStartLocation.get(normalizedStartLocation);
				let nextSerial = nextSerialByLocation.get(normalizedStartLocation) || serialStart;
				let generatedRouteNumber = `${String(locationCode).padStart(locationCodeWidth, "0")}${String(nextSerial).padStart(serialWidth, "0")}`;

				while (usedNumbers.has(generatedRouteNumber)) {
					nextSerial += serialStep;
					generatedRouteNumber = `${String(locationCode).padStart(locationCodeWidth, "0")}${String(nextSerial).padStart(serialWidth, "0")}`;
				}

				if (unresolvedBus === bus) {
					return generatedRouteNumber;
				}

				usedNumbers.add(generatedRouteNumber);
				nextSerialByLocation.set(normalizedStartLocation, nextSerial + serialStep);
			}

			return "";
		}

		function inferRouteNumber(bus) {
			const configuredRouteNumber = getConfiguredRouteNumber(bus);
			if (configuredRouteNumber) {
				return configuredRouteNumber;
			}

			return getAutoRouteNumberByOrigin(bus);
		}

		function getRouteNumberParts(routeNumber) {
			const locationCodeWidth = getLocationCodeWidthValue();
			const serialWidth = getSerialWidthValue();
			const expectedLength = locationCodeWidth + serialWidth;
			const digitsOnlyRouteNumber = String(routeNumber || "").replace(/\D/g, "");

			if (!digitsOnlyRouteNumber) {
				return {
					locationCode: "",
					serialCode: ""
				};
			}

			const normalizedRouteNumber = digitsOnlyRouteNumber.padStart(expectedLength, "0").slice(-expectedLength);
			return {
				locationCode: normalizedRouteNumber.slice(0, locationCodeWidth),
				serialCode: normalizedRouteNumber.slice(locationCodeWidth)
			};
		}

		function generateBusCode(state, originDistrict, originCity, routeNumber) {
			const normalizedState = normalizeCodeLookupValue(state);
			const normalizedDistrict = normalizeCodeLookupValue(originDistrict);
			const stateCode = stateCodes[normalizedState];
			const districtCode = districtCodes[normalizedDistrict];
			const cityCode = getCityCode(originCity);
			const routeNumberParts = getRouteNumberParts(routeNumber);
			const originAreaCode = districtCode && cityCode ? `${districtCode}${cityCode}` : "";

			if (!stateCode || !originAreaCode || !routeNumberParts.locationCode || !routeNumberParts.serialCode) {
				return "Invalid State, District, or City";
			}

			return `${stateCode}${originAreaCode}${routeNumberParts.locationCode}${routeNumberParts.serialCode}`;
		}

		function getBusDisplayCode(bus) {
			const state = bus.state || "Chhattisgarh";
			const originDistrict = bus.originDistrict || bus.origin || bus.district;
			const originCity = bus.originCity || bus.origin || bus.city;
			const autoRouteNumberForCode = getAutoRouteNumberByOrigin(bus);
			const generated = generateBusCode(state, originDistrict, originCity, autoRouteNumberForCode);
			const manualBusNo = String(bus.busNo || "").trim();

			if (generated === "Invalid State, District, or City") {
				return manualBusNo;
			}

			if (manualBusNo && manualBusNo !== generated) {
				return `${generated} | ${manualBusNo}`;
			}

			return generated;
		}

		function validateUniqueCodeMap(mapName, codeMap) {
			const valuesByCode = new Map();

			Object.entries(codeMap).forEach(([name, code]) => {
				const normalizedCode = String(code || "").trim().toUpperCase();
				if (!normalizedCode) {
					return;
				}

				const existingNames = valuesByCode.get(normalizedCode) || [];
				existingNames.push(name);
				valuesByCode.set(normalizedCode, existingNames);
			});

			valuesByCode.forEach((names, code) => {
				if (names.length > 1) {
					console.warn(`${mapName} duplicate code detected for ${code}: ${names.join(", ")}`);
				}
			});
		}

		function validateBusMetadata() {
			validateUniqueCodeMap("stateCodes", stateCodes);
			validateUniqueCodeMap("districtCodes", districtCodes);
			validateUniqueCodeMap("cityCodeOverrides", cityCodeOverrides);

			busData.forEach((bus) => {
				const missingFields = [];
				if (!bus.state) {
					missingFields.push("state");
				}
				if (!bus.district) {
					missingFields.push("district");
				}
				if (!bus.city) {
					missingFields.push("city");
				}
				if (!inferRouteNumber(bus)) {
					missingFields.push("routeNumber");
				}
				if (!bus.internalDetails?.registrationNumber) {
					missingFields.push("internalDetails.registrationNumber");
				}

				if (missingFields.length) {
					console.warn(`Bus ${bus.busNo} is missing metadata: ${missingFields.join(", ")}`);
				}
			});
		}

		function getStationPairKey(fromStation, toStation) {
			return `${fromStation}->${toStation}`;
		}

		function getBusFareConfig(bus) {
			return bus.fareConfig || {};
		}

		function getFareValueByKey(fareMap, key) {
			if (!fareMap || typeof fareMap !== "object") {
				return null;
			}

			const value = fareMap[key];
			if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
				return value;
			}

			return null;
		}

		function getDirectFareByStationPair(bus, fromStation, toStation) {
			const fareConfig = getBusFareConfig(bus);
			const key = getStationPairKey(fromStation, toStation);
			const stationPairFare = getFareValueByKey(fareConfig.directFaresByStationPair, key);
			if (stationPairFare !== null) {
				return stationPairFare;
			}

			return getFareValueByKey(fareConfig.directFaresByStopNumber, key);
		}

		function getSegmentFareByStationPair(bus, fromStation, toStation) {
			const fareConfig = getBusFareConfig(bus);
			const key = getStationPairKey(fromStation, toStation);
			const segmentFare = getFareValueByKey(fareConfig.segmentFaresByStationPair, key);
			if (segmentFare !== null) {
				return segmentFare;
			}

			const legacySegmentFare = getFareValueByKey(fareConfig.segmentFaresByStopNumber, key);
			if (legacySegmentFare !== null) {
				return legacySegmentFare;
			}

			const busDefault = fareConfig.defaultSegmentFare;
			if (typeof busDefault === "number" && Number.isFinite(busDefault) && busDefault >= 0) {
				return busDefault;
			}

			return globalDefaultSegmentFare;
		}

		function calculateFareForRouteSlice(bus, startIndex, endIndex) {
			const segmentCount = Math.max(0, endIndex - startIndex);
			if (segmentCount === 0) {
				return {
					totalFare: 0,
					segmentCount
				};
			}

			const startStation = bus.route[startIndex]?.station;
			const endStation = bus.route[endIndex]?.station;
			if (!startStation || !endStation) {
				return {
					totalFare: 0,
					segmentCount
				};
			}

			const directFare = getDirectFareByStationPair(bus, startStation, endStation);
			if (directFare !== null) {
				return {
					totalFare: directFare,
					segmentCount
				};
			}

			let totalFare = 0;
			for (let index = startIndex; index < endIndex; index += 1) {
				const fromStation = bus.route[index]?.station;
				const toStation = bus.route[index + 1]?.station;
				if (!fromStation || !toStation) {
					continue;
				}
				totalFare += getSegmentFareByStationPair(bus, fromStation, toStation);
			}

			return {
				totalFare,
				segmentCount
			};
		}

		function getBestRouteSegment(bus, startStation, endStation) {
			if (!Array.isArray(bus.route) || !bus.route.length || !startStation || !endStation) {
				return null;
			}

			const normalizeTarget = (target) => {
				if (!target) return null;
				if (typeof target === "string") {
					return { type: "station", value: target };
				}
				if (typeof target === "object" && target.type === "city" && target.value) {
					return { type: "city", value: target.value };
				}
				if (typeof target === "object" && target.type === "station" && target.value) {
					return { type: "station", value: target.value };
				}
				return null;
			};

			const startTarget = normalizeTarget(startStation);
			const endTarget = normalizeTarget(endStation);
			if (!startTarget || !endTarget) {
				return null;
			}

			const collectMatchingIndexes = (target, role) => {
				if (target.type === "station") {
					return bus.route
						.map((stop, index) => stop.station === target.value ? index : -1)
						.filter((index) => index >= 0);
				}

				const normalizedCity = normalizeStationInput(target.value);
				const indexes = new Set();

				bus.route.forEach((stop, index) => {
					const normalizedStopName = normalizeStationInput(stop.station);
					if (normalizedStopName.includes(normalizedCity)) {
						indexes.add(index);
					}
				});

				const normalizedOrigin = normalizeStationInput(bus.origin || "");
				const normalizedOriginCity = normalizeStationInput(bus.originCity || "");
				const normalizedDestinationCity = normalizeStationInput(bus.city || "");
				const normalizedDistrict = normalizeStationInput(bus.district || "");
				const isOriginCityMatch = normalizedOrigin === normalizedCity || normalizedOriginCity === normalizedCity;
				const isDestinationCityMatch = normalizedDestinationCity === normalizedCity || normalizedDistrict === normalizedCity;

				if (role === "start" && isOriginCityMatch) {
					indexes.add(0);
				}

				if (role === "end" && isDestinationCityMatch) {
					indexes.add(bus.route.length - 1);
				}

				if (isOriginCityMatch && isDestinationCityMatch) {
					bus.route.forEach((_, index) => indexes.add(index));
				}

				return Array.from(indexes).sort((a, b) => a - b);
			};

			const startIndexes = collectMatchingIndexes(startTarget, "start");
			const endIndexes = collectMatchingIndexes(endTarget, "end");

			if (!startIndexes.length || !endIndexes.length) {
				return null;
			}

			if (startTarget.type === "station" && endTarget.type === "station" && startTarget.value === endTarget.value) {
				if (startIndexes.length < 2) {
					return null;
				}

				return {
					startIndex: startIndexes[0],
					endIndex: startIndexes[startIndexes.length - 1]
				};
			}

			let bestSegment = null;
			startIndexes.forEach((startIndex) => {
				endIndexes.forEach((endIndex) => {
					if (endIndex <= startIndex) {
						return;
					}

					const hopCount = endIndex - startIndex;
					if (!bestSegment || hopCount < bestSegment.hopCount || (hopCount === bestSegment.hopCount && startIndex < bestSegment.startIndex)) {
						bestSegment = {
							startIndex,
							endIndex,
							hopCount
						};
					}
				});
			});

			if (!bestSegment) {
				return null;
			}

			return {
				startIndex: bestSegment.startIndex,
				endIndex: bestSegment.endIndex
			};
		}

		const i18n = {
			en: {
				language: "Language",
				heroTitle: "99Yatri Bus - Chhattisgarh",
				heroSubtitle: "Choose your boarding station and destination station to see departure time, arrival time, and route details. Currently, only <strong>Bilaspur City Bus</strong> is available — all other buses coming soon!",
				busList: "Bus List",
				findBuses: "Find Buses",
				startingStation: "Starting Station",
				destinationStation: "Destination Station",
				startPlaceholder: "Type or select start station",
				endPlaceholder: "Type or select destination station",
				swapTitle: "Swap starting and destination stations",
				themeLight: "Light",
				themeDark: "Dark",
				switchToLightMode: "Switch to light mode",
				switchToDarkMode: "Switch to dark mode",
				metaAvailable: "10 buses available from ,Bilaspur, Chhattisgarh.",
				warning: "⚠️ This bus tracking is a simulated feature based on schedule timings. It may not reflect the bus's real-time location. <strong>Real-time tracking will be available soon.</strong>",
				back: "← Back",
				dismiss: "Dismiss",
				trackBus: "Track Bus",
				stationAlert: "Station Alert!",
				toggleTime: "Toggle time format",
				busNotStarted: "Bus not started yet. It is at origin {station}.",
				busCompleted: "Bus has completed this route and reached {station}.",
				busAtStation: "Bus is currently at {station}.",
				busInTransit: "Bus is moving from {from} to {to}.",
				liveUnavailable: "Live location is not available right now.",
				arrivingIn10: "Arriving in approximately 10 minutes",
				busNo: "Bus No",
				activeAlarms: "Active Alarms ({count})",
				noStationAlarm: "No station alarm set for this bus yet.",
				removeAlarm: "Remove alarm",
				setAlarm: "Set alarm",
				alarmSet: "Alarm set",
				busBetweenStops: "Bus is between this stop and next",
				subStationsBetween: "Sub-stations between {from} and {to}",
				showSubStations: "Show sub-stations",
				fullRoute: "Full Route",
				totalStopsInView: "Total stops in this route view: {count}",
				shareRoute: "📤 Share Route",
				currentTime: "Current time",
				shareTiming: "Timing: Check departure and arrival times on Where Is My Bus app",
				shareDownload: "Download: Where Is My Bus - Chhattisgarh",
				shareCopied: "✓ Route details copied to clipboard!",
				noDirectBus: "No direct bus found for this route. Try a different station pair.",
				zeroBusFound: "0 buses found from {start} to {end}.",
				busesFound: "{count} bus(es) found from {start} to {end}.",
				busesListed: "{count} bus(es) listed in alphabetical order.",
				departure: "Departure",
				arrival: "Arrival",
				duration: "Duration",
				searchResults: "Search Results",
				otherCityBuses: "Other buses available for this city",
				cityAlternative: "City Alternative",
				noExactShowingCity: "No exact bus found. Showing buses available from {city}.",
				searchHistory: "Search History",
				recentlyViewedBuses: "Recently Viewed Buses",
				clearHistory: "Clear",
				clearRecentViews: "Clear",
				noSearchHistory: "No recent searches yet.",
				noRecentViewedBuses: "No recently viewed buses yet.",
				subStationResolved: "Showing results for nearest stop",
				runsDaily: "Runs Daily",
				runsToday: "Runs Today",
				notRunningToday: "Not running today",
				arrivalAt: "Arrival:",
				departureAt: "Departure:",
				haltingTime: "Halt: {minutes} min",
				routePreview: "Route Preview:",
				fare: "Fare",
				stopWord: "stop",
				stopsWord: "stops",
				route: "Route:",
				totalStops: "Total Stops:",
				origin: "Origin:",
				startLocation: "Start Location:",
				share: "📤 Share",
				dataLoadError: "Unable to load bus data. Please run this app using Live Server or another local web server.",
				validStationsError: "Please type or select valid starting and destination stations.",
				differentStationsError: "Starting and destination stations must be different.",
				fullRouteTitle: "🗺️ Full Route · {busName} &nbsp;({busNo})",
				trackerTitle: "🚌 {busName} &nbsp;·&nbsp; {busNo}"
			},
			hi: {
				language: "भाषा",
				heroTitle: "Where Is My Bus - छत्तीसगढ़",
				heroSubtitle: "अपना शुरुआती स्टेशन और गंतव्य स्टेशन चुनें और प्रस्थान समय, आगमन समय और रूट विवरण देखें। अभी केवल <strong>बिलासपुर सिटी बस</strong> उपलब्ध है — बाकी सभी बसें जल्द आ रही हैं!",
				busList: "बस सूची",
				findBuses: "बस खोजें",
				startingStation: "शुरुआती स्टेशन",
				destinationStation: "गंतव्य स्टेशन",
				startPlaceholder: "शुरुआती स्टेशन टाइप करें या चुनें",
				endPlaceholder: "गंतव्य स्टेशन टाइप करें या चुनें",
				swapTitle: "शुरुआती और गंतव्य स्टेशन बदलें",
				themeLight: "लाइट",
				themeDark: "डार्क",
				switchToLightMode: "लाइट मोड पर जाएं",
				switchToDarkMode: "डार्क मोड पर जाएं",
				metaAvailable: "बिलासपुर, छत्तीसगढ़ से 10 बसें उपलब्ध हैं।",
				warning: "⚠️ यह बस ट्रैकिंग फीचर अभी शेड्यूल समय के आधार पर सिमुलेट किया गया है। यह बस की वास्तविक समय लोकेशन नहीं दिखा सकता। <strong>रियल-टाइम ट्रैकिंग जल्द उपलब्ध होगी।</strong>",
				back: "← वापस",
				dismiss: "बंद करें",
				trackBus: "बस ट्रैक करें",
				stationAlert: "स्टेशन अलर्ट!",
				toggleTime: "समय प्रारूप बदलें",
				busNotStarted: "बस अभी शुरू नहीं हुई है। यह {station} से शुरू होगी।",
				busCompleted: "बस यह रूट पूरा कर चुकी है और {station} पहुंच चुकी है।",
				busAtStation: "बस इस समय {station} पर है।",
				busInTransit: "बस {from} से {to} की ओर जा रही है।",
				liveUnavailable: "अभी लाइव लोकेशन उपलब्ध नहीं है।",
				arrivingIn10: "लगभग 10 मिनट में पहुंचेगी",
				busNo: "बस नंबर",
				activeAlarms: "सक्रिय अलार्म ({count})",
				noStationAlarm: "इस बस के लिए अभी कोई स्टेशन अलार्म सेट नहीं है।",
				removeAlarm: "अलार्म हटाएं",
				setAlarm: "अलार्म सेट करें",
				alarmSet: "अलार्म सेट है",
				busBetweenStops: "बस इस स्टॉप और अगले स्टॉप के बीच है",
				subStationsBetween: "{from} और {to} के बीच उप-स्टेशन",
				showSubStations: "उप-स्टेशन दिखाएं",
				fullRoute: "पूरा रूट",
				totalStopsInView: "इस रूट व्यू में कुल स्टॉप: {count}",
				shareRoute: "📤 रूट शेयर करें",
				currentTime: "वर्तमान समय",
				shareTiming: "समय: प्रस्थान और आगमन समय Where Is My Bus ऐप में देखें",
				shareDownload: "डाउनलोड: Where Is My Bus - छत्तीसगढ़",
				shareCopied: "✓ रूट विवरण क्लिपबोर्ड पर कॉपी हो गया!",
				noDirectBus: "इस रूट के लिए सीधी बस नहीं मिली। कृपया दूसरा स्टेशन जोड़ा चुनें।",
				zeroBusFound: "{start} से {end} तक 0 बसें मिलीं।",
				busesFound: "{start} से {end} तक {count} बसें मिलीं।",
				busesListed: "वर्णक्रमानुसार {count} बसें सूचीबद्ध हैं।",
				departure: "प्रस्थान",
				arrival: "आगमन",
				duration: "समय अवधि",
				searchResults: "खोज परिणाम",
				otherCityBuses: "इस शहर के लिए अन्य उपलब्ध बसें",
				cityAlternative: "शहर विकल्प",
				noExactShowingCity: "सटीक बस नहीं मिली। {city} से उपलब्ध बसें दिखाई जा रही हैं।",
				searchHistory: "खोज इतिहास",
				recentlyViewedBuses: "हाल ही में देखी गई बसें",
				clearHistory: "साफ करें",
				clearRecentViews: "साफ करें",
				noSearchHistory: "अभी कोई पिछली खोज नहीं है।",
				noRecentViewedBuses: "अभी हाल ही में देखी गई बसें नहीं हैं।",
				subStationResolved: "निकटतम स्टेशन के लिए परिणाम दिखाए जा रहे हैं",
				runsDaily: "हर दिन चलती है",
				runsToday: "आज चल रही है",
				notRunningToday: "आज नहीं चलती",
				arrivalAt: "आगमन:",
				departureAt: "प्रस्थान:",
				haltingTime: "रुकने का समय: {minutes} मिनट",
				routePreview: "रूट पूर्वावलोकन:",
				fare: "किराया",
				stopWord: "स्टॉप",
				stopsWord: "स्टॉप",
				route: "रूट:",
				totalStops: "कुल स्टॉप:",
				origin: "मूल स्टेशन:",
				startLocation: "शुरुआती स्थान:",
				share: "📤 शेयर",
				dataLoadError: "बस डेटा लोड नहीं हो सका। कृपया इस ऐप को Live Server या किसी लोकल वेब सर्वर से चलाएं।",
				validStationsError: "कृपया सही शुरुआती और गंतव्य स्टेशन टाइप करें या चुनें।",
				differentStationsError: "शुरुआती और गंतव्य स्टेशन अलग होने चाहिए।",
				fullRouteTitle: "🗺️ पूरा रूट · {busName} &nbsp;({busNo})",
				trackerTitle: "🚌 {busName} &nbsp;·&nbsp; {busNo}"
			}
		};

		let currentLanguage = "en";

		function t(key, params = {}) {
			const langMap = i18n[currentLanguage] || i18n.en;
			let text = langMap[key] || i18n.en[key] || key;
			Object.keys(params).forEach((paramKey) => {
				text = text.replaceAll(`{${paramKey}}`, String(params[paramKey]));
			});
			return text;
		}

		function getInitialTheme() {
			const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
			if (storedTheme === "light" || storedTheme === "dark") {
				return storedTheme;
			}

			return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}

		function updateThemeToggleButton() {
			const darkModeEnabled = currentTheme === "dark";
			themeToggleIconEl.textContent = darkModeEnabled ? "🌙" : "☀";
			themeToggleBtnEl.setAttribute("title", darkModeEnabled ? t("switchToLightMode") : t("switchToDarkMode"));
			themeToggleBtnEl.setAttribute("aria-label", darkModeEnabled ? t("switchToLightMode") : t("switchToDarkMode"));
			themeToggleBtnEl.setAttribute("aria-pressed", String(darkModeEnabled));
		}

		function applyTheme() {
			document.body.setAttribute("data-theme", currentTheme);
			updateThemeToggleButton();
		}

		function toggleTheme() {
			currentTheme = currentTheme === "dark" ? "light" : "dark";
			localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
			applyTheme();
		}

		function getStopWord(count) {
			if (count === 1) {
				return t("stopWord");
			}
			return t("stopsWord");
		}

		const stationTranslations = {
			"Raipur": "रायपुर",
			"Tatibandh": "टाटीबंध",
			"Kumhari": "कुम्हारी",
			"Bhilai-3": "भिलाई-3",
			"Power House": "पावर हाउस",
			"Nehru Nagar": "नेहरू नगर",
			"Supela": "सुपेला",
			"Durg Bypass": "दुर्ग बायपास",
			"Durg Station": "दुर्ग स्टेशन",
			"Durg": "दुर्ग",
			"Siltara": "सिलतरा",
			"Tilda": "तिल्दा",
			"Nipania": "निपानिया",
			"Bhatapara": "भाटापारा",
			"Hathband": "हथबंद",
			"Simga": "सिमगा",
			"Sakri": "सकरी",
			"Uslapur": "उसलापुर",
			"Bilaspur": "बिलासपुर",
			"Bhilai": "भिलाई",
			"Anjora": "अंजोरा",
			"Dongargaon": "डोंगरगांव",
			"Chichola": "चिचोला",
			"Thelkadih": "थेलकाडीह",
			"Rajnandgaon": "राजनांदगांव",
			"Pachpedi Naka": "पचपेड़ी नाका",
			"Abhanpur": "अभनपुर",
			"Kurud": "कुरुद",
			"Sirri": "सिर्री",
			"Megha": "मेघा",
			"Magarlod": "मगरलोड",
			"Bhakhara": "भाखरा",
			"Rudri": "रुद्री",
			"Dhamtari": "धमतरी",
			"Telibandha": "तेलीबांधा",
			"Mandir Hasaud": "मंदिर हसौद",
			"Arang": "आरंग",
			"Pithora Road": "पिथौरा रोड",
			"Tumgaon": "तुमगांव",
			"Bagbahara": "बागबाहरा",
			"Khallari": "खल्लारी",
			"Bamhani": "बम्हनी",
			"Mahasamund": "महासमुंद",
			"Gunderdehi": "गुंडरदेही",
			"Arjunda": "अर्जुंडा",
			"Gurur": "गुरूर",
			"Dondi": "डोंडी",
			"Sanjari": "संजारी",
			"Jhalmala": "झलमला",
			"Balod": "बालोद",
			"Masturi": "मस्तूरी",
			"Akaltara": "अकलतरा",
			"Janjgir": "जांजगीर",
			"Champa": "चांपा",
			"Darri": "दर्री",
			"Korba": "कोरबा",
			"Sakti": "सक्ती",
			"Kharsia": "खरसिया",
			"Pusaur": "पुसौर",
			"Kotarlia": "कोतरलिया",
			"Kodatarai": "कोडातराई",
			"Jindal Gate": "जिंदल गेट",
			"Raigarh": "रायगढ़",
			"Kanker": "कांकेर",
			"Keshkal": "केशकाल",
			"Kondagaon": "कोंडागांव",
			"Bastar": "बस्तर",
			"Nayapara": "नयापारा",
			"Dharampura": "धरमपुरा",
			"Jagdalpur": "जगदलपुर",
			"Pendra": "पेंड्रा",
			"Anuppur": "अनूपपुर",
			"Kotma": "कोतमा",
			"Manendragarh": "मनेन्द्रगढ़",
			"Baikunthpur": "बैकुंठपुर",
			"Surajpur": "सूरजपुर",
			"Ambikapur": "अंबिकापुर"
		};

		const markerTranslations = {
			en: ["Mini Chowk", "Link Road", "Market Point", "Service Lane", "Bypass Gate", "Bridge Halt"],
			hi: ["मिनी चौक", "लिंक रोड", "मार्केट पॉइंट", "सर्विस लेन", "बायपास गेट", "ब्रिज हॉल्ट"]
		};

		function displayStationName(stationName) {
			if (currentLanguage === "hi") {
				return stationTranslations[stationName] || stationName;
			}
			return stationName;
		}

		function normalizeStationInput(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // Remove punctuation
        .replace(/\s+/g, " ");    // Normalize spaces
}

		async function loadBusData() {
			const response = await fetch("busdata.json");
			if (!response.ok) {
				throw new Error(`Failed to load busdata.json: ${response.status}`);
			}

			const loadedData = await response.json();

			if (Array.isArray(loadedData)) {
				busData = loadedData;
				routeNumberingConfig = { ...defaultRouteNumberingConfig };
			} else if (loadedData && typeof loadedData === "object") {
				busData = Array.isArray(loadedData.buses) ? loadedData.buses : [];
				routeNumberingConfig = {
					...defaultRouteNumberingConfig,
					...(loadedData.routeNumberingConfig && typeof loadedData.routeNumberingConfig === "object"
						? loadedData.routeNumberingConfig
						: {})
				};
			} else {
				busData = [];
				routeNumberingConfig = { ...defaultRouteNumberingConfig };
			}

			validateBusMetadata();
			allStations = Array.from(
				new Set(busData.flatMap((bus) => bus.route.map((stop) => stop.station)))
			).sort((a, b) => a.localeCompare(b));

			// Build sub-station → parent main station map
			subStationToParentMap = {};
			const subStationNameSet = new Set();
			busData.forEach((bus) => {
				bus.route.forEach((stop) => {
					if (Array.isArray(stop.subStationsToNext)) {
						stop.subStationsToNext.forEach((sub) => {
							const displayName = sub.station.trim();
							subStationToParentMap[displayName.toLowerCase()] = stop.station;
							subStationNameSet.add(displayName);
						});
					}
				});
			});
			allSubStationNames = Array.from(subStationNameSet).sort((a, b) => a.localeCompare(b));

			const canonicalCityMap = {};
			const addCityAlias = (value) => {
				const normalized = normalizeStationInput(value || "");
				if (!normalized) return;
				if (!canonicalCityMap[normalized]) {
					canonicalCityMap[normalized] = String(value).trim();
				}
			};

			busData.forEach((bus) => {
				addCityAlias(bus.city);
				addCityAlias(bus.originCity);
				addCityAlias(bus.origin);
				addCityAlias(bus.district);
			});

			cityNameLookup = canonicalCityMap;
		}

		async function initializeApp() {
			try {
				await Promise.all([loadBusData(), loadRoutes()]);
				attachMatchingRouteNumbers();
				loadSearchHistory();
				loadRecentViewedBuses();
				fillStationOptions();
				applyLanguage();
				openAdminOverlayIfRequested();
			} catch (error) {
				console.error(error);
				errorTextEl.textContent = t("dataLoadError");
				metaTextEl.textContent = "";
			}
		}

		function formatTime12Hour(time24) {
			const [hourText, minute] = time24.split(":");
			const hour = Number(hourText);
			const period = hour >= 12 ? "PM" : "AM";
			const hour12 = hour % 12 || 12;
			return `${String(hour12).padStart(2, "0")}:${minute}${period}`;
		}

		let useAmPmFormat = true;

		function getDisplayTime(time24) {
			return useAmPmFormat ? formatTime12Hour(time24) : time24;
		}

		function renderTimeToggle(time24) {
			return `<button type="button" class="time-toggle" data-time24="${time24}" title="${t("toggleTime")}">${getDisplayTime(time24)}</button>`;
		}

		function refreshVisibleTimeToggles() {
			document.querySelectorAll(".time-toggle").forEach((button) => {
				const time24 = button.getAttribute("data-time24");
				if (time24) {
					button.textContent = getDisplayTime(time24);
				}
			});
		}

		function timeToMinutes(time24) {
			const [hour, minute] = time24.split(":").map(Number);
			return hour * 60 + minute;
		}

		function getNowTime24() {
			const now = new Date();
			const hour = String(now.getHours()).padStart(2, "0");
			const minute = String(now.getMinutes()).padStart(2, "0");
			return `${hour}:${minute}`;
		}

		function minutesToTime24(totalMinutes) {
			const normalized = ((totalMinutes % 1440) + 1440) % 1440;
			const hour = String(Math.floor(normalized / 60)).padStart(2, "0");
			const minute = String(normalized % 60).padStart(2, "0");
			return `${hour}:${minute}`;
		}

		function normalizeTime24Input(value) {
			const text = String(value || "").trim();
			if (!/^\d{1,2}:\d{2}$/.test(text)) {
				return "";
			}

			const [hourText, minuteText] = text.split(":");
			const hour = Number(hourText);
			const minute = Number(minuteText);
			if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
				return "";
			}

			return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
		}

		function getStopTimingInfo(stop) {
			const fallbackTime = normalizeTime24Input(stop?.time);
			const arrivalFromJson = normalizeTime24Input(stop?.arrivalTime);
			const departureFromJson = normalizeTime24Input(stop?.departureTime);

			let arrivalTime = arrivalFromJson || fallbackTime || "00:00";
			let departureTime = departureFromJson || fallbackTime || arrivalTime;

			if (timeToMinutes(departureTime) < timeToMinutes(arrivalTime)) {
				departureTime = arrivalTime;
			}

			const haltingMinutes = Math.max(0, timeToMinutes(departureTime) - timeToMinutes(arrivalTime));

			return {
				arrivalTime,
				departureTime,
				haltingMinutes,
				hasDetailed: Boolean(arrivalFromJson || departureFromJson)
			};
		}

		function renderStopTimingDetails(stop, classPrefix) {
			const timing = getStopTimingInfo(stop);
			if (!timing.hasDetailed) {
				return { arrival: renderTimeToggle(timing.departureTime), departure: renderTimeToggle(timing.departureTime), halt: "" };
			}

			const haltingHtml = timing.haltingMinutes > 0
				? `<div class="${classPrefix}-halt" style="margin-top: 4px;">${t("haltingTime", { minutes: timing.haltingMinutes })}</div>`
				: "";

			return { 
				arrival: renderTimeToggle(timing.arrivalTime), 
				departure: renderTimeToggle(timing.departureTime),
				halt: haltingHtml
			};
		}

		function getSubStationsBetween(bus, segmentIndex) {
			const startStop = bus.route[segmentIndex];
			const endStop = bus.route[segmentIndex + 1];
			if (!startStop || !endStop) {
				return [];
			}

			const configuredSubStations = Array.isArray(startStop.subStationsToNext)
				? startStop.subStationsToNext
				: [];

			if (configuredSubStations.length > 0) {
				const startMinutes = timeToMinutes(getStopTimingInfo(startStop).departureTime);
				const endMinutes = timeToMinutes(getStopTimingInfo(endStop).arrivalTime);
				const duration = Math.max(3, endMinutes - startMinutes);

				return configuredSubStations.map((subStation, index) => {
					const stationName = typeof subStation === "string"
						? subStation
						: (subStation?.station || subStation?.name || `${displayStationName(startStop.station)} Sub-${index + 1}`);

					const providedTime = typeof subStation === "object"
						? (subStation.time || subStation.time24 || "")
						: "";

					const normalizedProvidedTime = normalizeTime24Input(providedTime);

					const fallbackMinute = startMinutes + Math.max(1, Math.floor((duration * (index + 1)) / (configuredSubStations.length + 1)));

					return {
						name: stationName,
						time24: normalizedProvidedTime || minutesToTime24(fallbackMinute)
					};
				});
			}

			const markers = markerTranslations[currentLanguage] || markerTranslations.en;
			const seed = Array.from(bus.busNo).reduce((sum, char) => sum + char.charCodeAt(0), 0);
			const firstMarkerIndex = (seed + segmentIndex * 3) % markers.length;
			let secondMarkerIndex = (seed + segmentIndex * 5 + 2) % markers.length;
			if (secondMarkerIndex === firstMarkerIndex) {
				secondMarkerIndex = (secondMarkerIndex + 1) % markers.length;
			}

			const startMinutes = timeToMinutes(getStopTimingInfo(startStop).departureTime);
			const endMinutes = timeToMinutes(getStopTimingInfo(endStop).arrivalTime);
			const duration = Math.max(3, endMinutes - startMinutes);
			const firstSubMinute = startMinutes + Math.max(1, Math.floor(duration / 3));
			const secondSubMinute = startMinutes + Math.max(2, Math.floor((duration * 2) / 3));

			return [
				{
					name: `${displayStationName(startStop.station)} ${markers[firstMarkerIndex]}`,
					time24: minutesToTime24(firstSubMinute)
				},
				{
					name: `${displayStationName(endStop.station)} ${markers[secondMarkerIndex]}`,
					time24: minutesToTime24(secondSubMinute)
				}
			];
		}

		function getBusTrackingState(bus) {
			const now24 = getNowTime24();
			const nowMinutes = timeToMinutes(now24);
			const route = bus.route;
			const firstMinutes = timeToMinutes(getStopTimingInfo(route[0]).departureTime);
			const lastMinutes = timeToMinutes(getStopTimingInfo(route[route.length - 1]).arrivalTime);

			if (nowMinutes < firstMinutes) {
				return {
					now24,
					status: "not-started",
					message: t("busNotStarted", { station: displayStationName(route[0].station) }),
					currentIndex: 0,
					lastPassedIndex: 0,
					progressPercent: 0
				};
			}

			if (nowMinutes >= lastMinutes) {
				return {
					now24,
					status: "completed",
					message: t("busCompleted", { station: displayStationName(route[route.length - 1].station) }),
					currentIndex: route.length - 1,
					lastPassedIndex: route.length - 1,
					progressPercent: 100
				};
			}

			for (let index = 0; index < route.length - 1; index += 1) {
				const from = route[index];
				const to = route[index + 1];
				const fromTiming = getStopTimingInfo(from);
				const toTiming = getStopTimingInfo(to);
				const fromMinutes = timeToMinutes(fromTiming.departureTime);
				const toArrivalMinutes = timeToMinutes(toTiming.arrivalTime);
				const toDepartureMinutes = timeToMinutes(toTiming.departureTime);

				if (nowMinutes === fromMinutes) {
					const stopProgress = (index / (route.length - 1)) * 100;
					return {
						now24,
						status: "at-stop",
						message: t("busAtStation", { station: displayStationName(from.station) }),
						currentIndex: index,
						lastPassedIndex: index,
						progressPercent: stopProgress
					};
				}

				if (nowMinutes > fromMinutes && nowMinutes < toArrivalMinutes) {
					const ratio = (nowMinutes - fromMinutes) / (toArrivalMinutes - fromMinutes);
					const progressiveIndex = index + ratio;
					return {
						now24,
						status: "in-transit",
						message: t("busInTransit", { from: displayStationName(from.station), to: displayStationName(to.station) }),
						currentIndex: index,
						lastPassedIndex: index,
						progressPercent: (progressiveIndex / (route.length - 1)) * 100
					};
				}

				if (nowMinutes >= toArrivalMinutes && nowMinutes <= toDepartureMinutes) {
					const stopProgress = ((index + 1) / (route.length - 1)) * 100;
					return {
						now24,
						status: "at-stop",
						message: t("busAtStation", { station: displayStationName(to.station) }),
						currentIndex: index + 1,
						lastPassedIndex: index + 1,
						progressPercent: stopProgress
					};
				}
			}

			return {
				now24,
				status: "unknown",
				message: t("liveUnavailable"),
				currentIndex: 0,
				lastPassedIndex: 0,
				progressPercent: 0
			};
		}

		const trackerOverlayEl = document.getElementById("trackerOverlay");
		const trackerCloseBtnEl = document.getElementById("trackerCloseBtn");
		const trackerHeaderEl = document.getElementById("trackerHeader");
		const trackerStatusEl = document.getElementById("trackerStatus");
		const trackerAlarmSummaryEl = document.getElementById("trackerAlarmSummary");
		const trackerTimelineEl = document.getElementById("trackerTimeline");
		const routeOverlayEl = document.getElementById("routeOverlay");
		const routeCloseBtnEl = document.getElementById("routeCloseBtn");
		const routeHeaderEl = document.getElementById("routeHeader");
		const routeStatusEl = document.getElementById("routeStatus");
		const routeTimelineEl = document.getElementById("routeTimeline");
		const adminOverlayEl = document.getElementById("adminOverlay");
		const adminCloseBtnEl = document.getElementById("adminCloseBtn");
		const adminHeaderEl = document.getElementById("adminHeader");
		const adminContentEl = document.getElementById("adminContent");
		const yatraOverlayEl = document.getElementById("yatraOverlay");
		const yatraBtnEl = document.getElementById("yatraBtn");
		const yatraCloseBtnEl = document.getElementById("yatraCloseBtn");

		const DEFAULT_ADMIN_VIEW_PIN = "2605";
		const ADMIN_PIN_STORAGE_KEY = "wimb_admin_pin";
		const ADMIN_SESSION_KEY = "wimb_admin_access_granted";
		const THEME_STORAGE_KEY = "wimb_theme";
		const SEARCH_HISTORY_STORAGE_KEY = "wimb_search_history";
		const RECENT_VIEWED_BUSES_STORAGE_KEY = "wimb_recent_viewed_buses";
		const MAX_SEARCH_HISTORY_ITEMS = 12;
		const MAX_RECENT_VIEWED_BUSES = 10;

		const alarmModalEl = document.getElementById("alarmModal");
		const alarmStationEl = document.getElementById("alarmStation");
		const alarmDetailsEl = document.getElementById("alarmDetails");
		const alarmBusInfoEl = document.getElementById("alarmBusInfo");
		const alarmTitleEl = document.getElementById("alarmTitle");
		const alarmDismissBtnEl = document.getElementById("alarmDismissBtn");
		const alarmTrackBtnEl = document.getElementById("alarmTrackBtn");

		let currentAlarmBus = null;
		let userAlarms = [];
		let trackerBusData = null;
		let isTrackerAlarmUiVisible = false;
		let pendingAlarmQueue = [];
		let currentView = "search";
		let routeOverlayContext = null;
		let searchHistory = [];
		let recentViewedBuses = [];
		let hasPerformedSearch = false;
		let currentTheme = "light";

		function escapeHtml(value) {
			return String(value || "")
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;");
		}

		function getInternalDetails(bus) {
			const details = bus.internalDetails || {};
			return {
				registrationNumber: details.registrationNumber || bus.registrationNumber || "-",
				ownerName: details.owner?.name || bus.ownerName || "-",
				ownerMobiles: details.owner?.mobiles || bus.ownerMobiles || [],
				driverName: details.driver?.name || bus.driverName || "-",
				driverMobiles: details.driver?.mobiles || bus.driverMobiles || [],
				conductorName: details.conductor?.name || bus.conductorName || "-",
				conductorMobiles: details.conductor?.mobiles || bus.conductorMobiles || []
			};
		}

		function formatMobileList(mobiles) {
			if (!Array.isArray(mobiles) || !mobiles.length) {
				return "-";
			}

			return mobiles.map((mobile) => escapeHtml(mobile)).join(", ");
		}

		function renderAdminDetails() {
			if (!adminHeaderEl || !adminContentEl) {
				return;
			}

			adminHeaderEl.innerHTML = `
				<h2>Admin Dashboard</h2>
				<p>Internal fleet details (private view only)</p>
			`;

			const cardsHtml = busData.map((bus) => {
				const details = getInternalDetails(bus);
				const inferredRouteNumber = inferRouteNumber(bus) || "-";
				const hasConfiguredRouteNumber = Boolean(getConfiguredRouteNumber(bus));
				const routeNumberSourceLabel = hasConfiguredRouteNumber ? "Manual" : "Auto";
				return `
					<article class="admin-bus-card">
						<div class="admin-bus-title">${escapeHtml(bus.busName)} (${escapeHtml(getBusDisplayCode(bus))})</div>
						<div class="admin-bus-grid">
							<div class="admin-field">
								<span class="admin-label">Bus Number</span>
								<div class="admin-value">${escapeHtml(bus.busNo)}</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Route Number</span>
								<div class="admin-value">${escapeHtml(inferredRouteNumber)} (${routeNumberSourceLabel})</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Registration</span>
								<div class="admin-value">${escapeHtml(details.registrationNumber)}</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Owner</span>
								<div class="admin-value">${escapeHtml(details.ownerName)}</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Owner Mobiles</span>
								<div class="admin-value">${formatMobileList(details.ownerMobiles)}</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Driver</span>
								<div class="admin-value">${escapeHtml(details.driverName)}</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Driver Mobiles</span>
								<div class="admin-value">${formatMobileList(details.driverMobiles)}</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Conductor</span>
								<div class="admin-value">${escapeHtml(details.conductorName)}</div>
							</div>
							<div class="admin-field">
								<span class="admin-label">Conductor Mobiles</span>
								<div class="admin-value">${formatMobileList(details.conductorMobiles)}</div>
							</div>
						</div>
					</article>
				`;
			}).join("");

			adminContentEl.innerHTML = `
				<div class="admin-note">This panel is hidden from regular users. Open with <strong>Ctrl + Shift + A</strong> or add <strong>?admin=1</strong> to URL, then enter admin PIN. To change PIN: set <strong>localStorage.${ADMIN_PIN_STORAGE_KEY}</strong>.</div>
				${cardsHtml}
			`;
		}

		function getConfiguredAdminPin() {
			const storedPin = localStorage.getItem(ADMIN_PIN_STORAGE_KEY);
			const normalizedStoredPin = String(storedPin || "").trim();
			if (normalizedStoredPin) {
				return normalizedStoredPin;
			}

			return DEFAULT_ADMIN_VIEW_PIN;
		}

		function requestAdminAccess() {
			if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "1") {
				return true;
			}

			const enteredPin = window.prompt("Enter admin PIN to open internal details:", "");
			if (enteredPin === null) {
				return false;
			}

			if (enteredPin.trim() !== getConfiguredAdminPin()) {
				window.alert("Invalid admin PIN");
				return false;
			}

			sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
			return true;
		}

		function openAdminOverlay() {
			if (!adminOverlayEl) {
				return;
			}

			if (!requestAdminAccess()) {
				return;
			}

			renderAdminDetails();
			adminOverlayEl.scrollTop = 0;
			document.body.style.overflow = "hidden";
			adminOverlayEl.classList.add("open");
		}

		function closeAdminOverlay() {
			if (!adminOverlayEl) {
				return;
			}

			adminOverlayEl.classList.remove("open");
			document.body.style.overflow = "";
		}

		function openYatraOverlay() {
			if (!yatraOverlayEl) return;
			yatraOverlayEl.scrollTop = 0;
			document.body.style.overflow = "hidden";
			yatraOverlayEl.classList.add("open");
			// Lazy-load yatra packages on first open
			if (!window._yatraLoaded) {
				window._yatraLoaded = true;
				loadYatraPackages();
			}
		}

		function closeYatraOverlay() {
			if (!yatraOverlayEl) return;
			yatraOverlayEl.classList.remove("open");
			document.body.style.overflow = "";
			// Also close detail modal if open
			closeYatraDetail();
		}

		if (yatraBtnEl) yatraBtnEl.addEventListener("click", function () {
			openYatraOverlay();
		});
		if (yatraCloseBtnEl) yatraCloseBtnEl.addEventListener("click", closeYatraOverlay);

		function openAdminOverlayIfRequested() {
			const currentUrl = new URL(window.location.href);
			if (currentUrl.searchParams.get("admin") === "1" || currentUrl.hash === "#admin") {
				openAdminOverlay();
			}
		}

		function playAlarmSound() {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();
			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);
			oscillator.frequency.value = 800;
			oscillator.type = "sine";
			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.5);
		}

		function showNextAlarmFromQueue() {
			if (alarmModalEl.classList.contains("show")) {
				return;
			}

			const nextAlarm = pendingAlarmQueue.shift();
			if (!nextAlarm) {
				return;
			}

			currentAlarmBus = nextAlarm.bus;
			playAlarmSound();

			alarmStationEl.textContent = displayStationName(nextAlarm.upcomingStation);
			alarmDetailsEl.innerHTML = `${t("arrivingIn10")}<br><strong>${renderTimeToggle(nextAlarm.arrivalTime24)}</strong>`;
			alarmBusInfoEl.innerHTML = `<strong>${nextAlarm.bus.busName}</strong><br>${t("busNo")}: ${getBusDisplayCode(nextAlarm.bus)}`;

			alarmModalEl.classList.add("show");
		}

		function triggerAlarm(bus, upcomingStation, arrivalTime24, stopIndex) {
			const duplicateQueued = pendingAlarmQueue.some(
				(item) =>
					item.bus.busNo === bus.busNo &&
					item.stopIndex === stopIndex &&
					item.arrivalTime24 === arrivalTime24
			);
			if (duplicateQueued) {
				return false;
			}

			pendingAlarmQueue.push({
				bus,
				upcomingStation,
				arrivalTime24,
				stopIndex
			});
			showNextAlarmFromQueue();
			return true;
		}

		function isAlarmSet(busNo, stopIndex) {
			return userAlarms.some((alarm) => alarm.busNo === busNo && alarm.stopIndex === stopIndex);
		}

		function checkUpcomingStations() {
			const now24 = getNowTime24();
			const nowMinutes = timeToMinutes(now24);

			userAlarms.forEach((alarm) => {
				const bus = busData.find((item) => item.busNo === alarm.busNo);
				if (!bus) {
					return;
				}

				const stopIndex = typeof alarm.stopIndex === "number"
					? alarm.stopIndex
					: bus.route.findIndex((stop) => stop.station === alarm.station);
				if (stopIndex === -1) return;

				const stop = bus.route[stopIndex];
				const stopTiming = getStopTimingInfo(stop);
				const stopMinutes = timeToMinutes(stopTiming.arrivalTime);
				const minutesUntilStop = stopMinutes - nowMinutes;

				if (minutesUntilStop > 0 && minutesUntilStop <= 10 && minutesUntilStop > 9.5) {
					const hasReachedPreviousStop = bus.route.slice(0, stopIndex).every((prevStop) => {
						const prevMinutes = timeToMinutes(getStopTimingInfo(prevStop).departureTime);
						return nowMinutes >= prevMinutes;
					});

					if (hasReachedPreviousStop && !alarm.triggered) {
						const queued = triggerAlarm(bus, stop.station, stopTiming.arrivalTime, stopIndex);
						if (queued) {
							alarm.triggered = true;
						}
					}
				}
			});
		}

		function deactivateAlarm(busNo, stopIndex) {
			userAlarms = userAlarms.filter((alarm) => !(alarm.busNo === busNo && alarm.stopIndex === stopIndex));
		}

		function renderTrackerAlarmSummary(bus) {
			if (!bus) {
				trackerAlarmSummaryEl.innerHTML = "";
				return;
			}

			const activeAlarms = userAlarms
				.filter((alarm) => alarm.busNo === bus.busNo)
				.sort((first, second) => {
					const firstIndex = first.stopIndex ?? 999;
					const secondIndex = second.stopIndex ?? 999;
					return firstIndex - secondIndex;
				});

			if (!activeAlarms.length) {
				trackerAlarmSummaryEl.innerHTML = `
					<div class="tracker-alarm-title">${t("activeAlarms", { count: 0 })}</div>
					<div class="tracker-alarm-empty">${t("noStationAlarm")}</div>
				`;
				return;
			}

			const chipsHtml = activeAlarms.map((alarm) => {
				const stop = typeof alarm.stopIndex === "number" ? bus.route[alarm.stopIndex] : bus.route.find((item) => item.station === alarm.station);
				const timeLabel = stop ? renderTimeToggle(getStopTimingInfo(stop).arrivalTime) : "--:--";
				return `
					<div class="tracker-alarm-chip">
						<div class="tracker-alarm-chip-main">
							<span class="tracker-alarm-icon">🔔</span>
							<div class="tracker-alarm-details">
								<span class="tracker-alarm-station">${displayStationName(stop?.station || alarm.station)}</span>
								<span class="tracker-alarm-time">${timeLabel}</span>
							</div>
						</div>
						<button type="button" class="tracker-alarm-remove" data-remove-bus="${bus.busNo}" data-remove-stop-index="${alarm.stopIndex}" title="${t("removeAlarm")}">✕</button>
					</div>
				`;
			}).join("");

			trackerAlarmSummaryEl.innerHTML = `
				<div class="tracker-alarm-title">${t("activeAlarms", { count: activeAlarms.length })}</div>
				<div class="tracker-alarm-chips">${chipsHtml}</div>
			`;
		}

		alarmDismissBtnEl.addEventListener("click", () => {
			alarmModalEl.classList.remove("show");
			showNextAlarmFromQueue();
		});

		alarmTrackBtnEl.addEventListener("click", () => {
			if (currentAlarmBus) {
				alarmModalEl.classList.remove("show");
				openTrackerOverlay(currentAlarmBus);
				showNextAlarmFromQueue();
			}
		});

		setInterval(checkUpcomingStations, 30000);

		trackerCloseBtnEl.addEventListener("click", () => {
			trackerOverlayEl.classList.remove("open");
			document.body.style.overflow = "";
		});

		routeCloseBtnEl.addEventListener("click", () => {
			routeOverlayEl.classList.remove("open");
			document.body.style.overflow = "";
		});

		if (adminCloseBtnEl) {
			adminCloseBtnEl.addEventListener("click", () => {
				closeAdminOverlay();
			});
		}

		trackerAlarmSummaryEl.addEventListener("click", (event) => {
			const removeButton = event.target.closest(".tracker-alarm-remove");
			if (!removeButton) {
				return;
			}

			const stopIndexText = removeButton.getAttribute("data-remove-stop-index");
			const busNumber = removeButton.getAttribute("data-remove-bus");
			if (stopIndexText === null || !busNumber) {
				return;
			}
			const stopIndex = Number(stopIndexText);
			if (!Number.isInteger(stopIndex)) {
				return;
			}

			deactivateAlarm(busNumber, stopIndex);
			renderTrackerAlarmSummary(trackerBusData);
			renderTrackerStatus(trackerBusData);

			const stationBell = trackerTimelineEl.querySelector(
				`.v-alarm-mini-btn[data-bus-number="${busNumber}"][data-stop-index="${stopIndex}"]`
			);
			if (stationBell) {
				stationBell.classList.remove("is-active");
				stationBell.setAttribute("title", t("setAlarm"));
			}

		});

		trackerTimelineEl.addEventListener("click", (event) => {
			const alarmMiniButton = event.target.closest(".v-alarm-mini-btn");
			if (alarmMiniButton) {
				const busNumber = alarmMiniButton.getAttribute("data-bus-number");
				const station = alarmMiniButton.getAttribute("data-station");
				const stopIndexText = alarmMiniButton.getAttribute("data-stop-index");
				if (!busNumber || !station || stopIndexText === null) {
					return;
				}
				const stopIndex = Number(stopIndexText);
				if (!Number.isInteger(stopIndex)) {
					return;
				}

				if (isAlarmSet(busNumber, stopIndex)) {
					deactivateAlarm(busNumber, stopIndex);
					alarmMiniButton.classList.remove("is-active");
					alarmMiniButton.setAttribute("title", t("setAlarm"));
					renderTrackerStatus(trackerBusData);
				} else {
					userAlarms.push({
						busNo: busNumber,
						station,
						stopIndex,
						triggered: false
					});
					alarmMiniButton.classList.add("is-active");
					alarmMiniButton.setAttribute("title", t("alarmSet"));
					renderTrackerStatus(trackerBusData);
				}

				renderTrackerAlarmSummary(trackerBusData);

				return;
			}

			const segmentButton = event.target.closest(".v-seg-btn");
			if (!segmentButton) {
				return;
			}

			const segmentIndex = segmentButton.getAttribute("data-segment-index");
			if (segmentIndex === null) {
				return;
			}

			const targetSubStation = trackerTimelineEl.querySelector(
				`.v-substations[data-substations-for="${segmentIndex}"]`
			);
			if (!targetSubStation) {
				return;
			}

			const isOpen = !targetSubStation.hasAttribute("hidden");

			trackerTimelineEl.querySelectorAll(".v-substations").forEach((section) => {
				section.setAttribute("hidden", "");
			});
			trackerTimelineEl.querySelectorAll(".v-seg-btn").forEach((button) => {
				button.setAttribute("aria-expanded", "false");
			});

			if (!isOpen) {
				targetSubStation.removeAttribute("hidden");
				segmentButton.setAttribute("aria-expanded", "true");
			}
		});

		function openTrackerOverlay(bus) {
			addRecentViewedBus(bus);
			trackerBusData = bus;
			isTrackerAlarmUiVisible = false;
			trackerOverlayEl.classList.remove("show-alarms");
			const tracking = getBusTrackingState(bus);
			const stopCount = bus.route.length;
			const firstStation = bus.route[0]?.station || "";
			const lastStation = bus.route[bus.route.length - 1]?.station || "";

			const stopsHtml = bus.route.map((stop, index) => {
				const isPassed = index <= tracking.lastPassedIndex;
				const isCurrent = index === tracking.currentIndex && tracking.status !== "in-transit";
				let dotColor = "#a4b7dc";
				let rowClass = "v-stop";
				if (index === 0) { rowClass += " v-start"; }
				if (index === stopCount - 1) { rowClass += " v-end"; }
				if (isCurrent) { dotColor = "#ff8a00"; rowClass += " v-current"; }
				else if (isPassed) { dotColor = "#2c78ff"; rowClass += " v-passed"; }

				const isBusHere = tracking.status === "in-transit" && index === tracking.lastPassedIndex;
				const busIconHtml = isBusHere
					? `<div class="v-bus-icon" title="${t("busBetweenStops")}">🚌</div>`
					: "";
				const alarmActive = isAlarmSet(bus.busNo, index);
				const alarmMiniHtml = `<button type="button" class="v-alarm-mini v-alarm-mini-btn${alarmActive ? " is-active" : ""}" data-bus-number="${bus.busNo}" data-station="${stop.station}" data-stop-index="${index}" title="${alarmActive ? t("alarmSet") : t("setAlarm")}">🔔</button>`;
				const nextStop = bus.route[index + 1];
				const subStations = index < stopCount - 1 ? getSubStationsBetween(bus, index) : [];
				const subStationsHtml = index < stopCount - 1
					? `
						<div class="v-substations" data-substations-for="${index}" hidden>
							<div class="v-substations-title">${t("subStationsBetween", { from: displayStationName(stop.station), to: displayStationName(nextStop.station) })}</div>
							<ul class="v-substations-list">
								${subStations.map((sub) => `<li><strong>${sub.name}</strong> <span class="v-time">(${renderTimeToggle(sub.time24)})</span></li>`).join("")}
							</ul>
						</div>
					`
					: "";

				const timing = renderStopTimingDetails(stop, "v");

				return `
					<div class="${rowClass}">
						<div class="v-time-col-left">${timing.arrival}</div>
						<div class="v-dot-col">
							<div class="v-dot" style="background:${dotColor}"></div>
							${index < stopCount - 1 ? `<button type="button" class="v-seg v-seg-btn${isPassed && !isBusHere ? " v-seg-done" : ""}" data-segment-index="${index}" aria-expanded="false" title="${t("showSubStations")}"></button>${busIconHtml}` : ""}
						</div>
						<div class="v-station-center${isCurrent ? " v-station-current" : ""}${isPassed && !isCurrent ? " v-station-passed" : ""}">
							<div class="v-station">${displayStationName(stop.station)} ${alarmMiniHtml}</div>
							${timing.halt}
						</div>
						<div class="v-time-col-right">${timing.departure}</div>
						<div class="v-info-substations">
							${subStationsHtml}
						</div>
					</div>
				`;
			}).join("");

			trackerHeaderEl.innerHTML = `
				<h2>${t("trackerTitle", { busName: bus.busName, busNo: getBusDisplayCode(bus) })}</h2>
				<p>${displayStationName(bus.route[0].station)} → ${displayStationName(bus.route[bus.route.length - 1].station)}</p>
				<p><strong>${t("origin")}</strong> ${displayStationName(bus.origin || bus.originCity || bus.city || bus.district || "")} &nbsp; | &nbsp; <strong>${t("startLocation")}</strong> ${displayStationName(getRouteStartLocation(bus))}</p>
				<div class="tracker-header-actions">
					<button type="button" class="tracker-head-btn tracker-head-btn-alarm" data-tracker-action="alarm">🔔 ${t("setAlarm")}</button>
					<button type="button" class="tracker-head-btn tracker-head-btn-share" data-tracker-action="share" data-share-bus-number="${bus.busNo}" data-share-from="${firstStation}" data-share-to="${lastStation}">📤 ${t("share")}</button>
				</div>
			`;
			renderTrackerStatus(bus);
			renderTrackerAlarmSummary(bus);
			const timingHeaderHtml = `<div class="v-timeline-header"><div class="v-timing-col">${t("arrivalAt")}</div><div></div><div class="v-timing-col" style="text-align: left;">Station</div><div class="v-timing-col">${t("departureAt")}</div></div>`;
			trackerTimelineEl.innerHTML = timingHeaderHtml + stopsHtml;

			trackerOverlayEl.scrollTop = 0;
			document.body.style.overflow = "hidden";
			trackerOverlayEl.classList.add("open");
		}

		function openRouteOverlay(bus, startStation, endStation) {
			addRecentViewedBus(bus, startStation, endStation);
			routeOverlayContext = { bus, startStation, endStation };
			const segment = getBestRouteSegment(bus, startStation, endStation);
			const hasValidSlice = Boolean(segment);
			const baseStartIndex = hasValidSlice ? segment.startIndex : 0;
			const routeSlice = hasValidSlice
				? bus.route.slice(segment.startIndex, segment.endIndex + 1)
				: bus.route;
			const stopCount = routeSlice.length;

			const stopsHtml = routeSlice.map((stop, index) => {
				let roleClass = "";
				if (index === 0) {
					roleClass = " is-start";
				} else if (index === stopCount - 1) {
					roleClass = " is-end";
				}

				const nextStop = routeSlice[index + 1];
				const routeSegmentIndex = baseStartIndex + index;
				const subStations = index < stopCount - 1 ? getSubStationsBetween(bus, routeSegmentIndex) : [];
				const subStationsHtml = index < stopCount - 1
					? `
						<div class="route-substations" data-route-substations-for="${index}" hidden>
							<div class="route-substations-title">${t("subStationsBetween", { from: displayStationName(stop.station), to: displayStationName(nextStop.station) })}</div>
							<ul class="route-substations-list">
								${subStations.map((sub) => `<li><strong>${sub.name}</strong> <span class="route-substation-time">(${renderTimeToggle(sub.time24)})</span></li>`).join("")}
							</ul>
						</div>
					`
					: "";

				const timing = renderStopTimingDetails(stop, "route-v");

				return `
					<div class="route-v-stop${roleClass}">
						<div class="route-v-time-col-left">${timing.arrival}</div>
						<div class="route-v-dot-col">
							<div class="route-v-dot"></div>
							${index < stopCount - 1 ? `<button type="button" class="route-v-seg route-v-seg-btn" data-route-segment-index="${index}" aria-expanded="false" title="${t("showSubStations")}"></button>` : ''}
						</div>
						<div class="route-v-station-center">
							<div class="route-v-station"><strong>${displayStationName(stop.station)}</strong></div>
							${timing.halt}
						</div>
						<div class="route-v-time-col-right">${timing.departure}</div>
						<div class="route-v-info-substations">
							${subStationsHtml}
						</div>
					</div>
				`;
			}).join("");

			routeHeaderEl.innerHTML = `
				<h2>${t("fullRouteTitle", { busName: bus.busName, busNo: getBusDisplayCode(bus) })}</h2>
				<p>${displayStationName(routeSlice[0].station)} → ${displayStationName(routeSlice[routeSlice.length - 1].station)}</p>
				<p><strong>${t("origin")}</strong> ${displayStationName(bus.origin || bus.originCity || bus.city || bus.district || "")} &nbsp; | &nbsp; <strong>${t("startLocation")}</strong> ${displayStationName(getRouteStartLocation(bus))}</p>
				<div class="tracker-header-actions">
					<button type="button" class="tracker-head-btn tracker-head-btn-share route-share-btn" data-share-bus-number="${bus.busNo}" data-share-from="${routeSlice[0].station}" data-share-to="${routeSlice[routeSlice.length - 1].station}">📤 ${t("shareRoute")}</button>
				</div>
			`;
			routeStatusEl.textContent = t("totalStopsInView", { count: routeSlice.length });
			const routeTimingHeaderHtml = `<div class="route-v-timeline-header"><div class="route-v-timing-col">${t("arrivalAt")}</div><div></div><div class="route-v-timing-col" style="text-align: left;">Station</div><div class="route-v-timing-col">${t("departureAt")}</div></div>`;
			routeTimelineEl.innerHTML = `
				<div class="route-v-timeline">${routeTimingHeaderHtml}${stopsHtml}</div>
			`;

			routeOverlayEl.scrollTop = 0;
			document.body.style.overflow = "hidden";
			routeOverlayEl.classList.add("open");
		}

		function renderTrackerStatus(bus) {
			if (!bus) {
				trackerStatusEl.innerHTML = "";
				return;
			}

			const tracking = getBusTrackingState(bus);
			trackerStatusEl.innerHTML = `📍 ${tracking.message}  ${t("currentTime")}: ${renderTimeToggle(tracking.now24)}`;
		}

		function shareRoute(busNumber, fromStation, toStation) {
			const bus = busData.find((item) => item.busNo === busNumber);
			if (!bus) return;

			const shareText = `🚌 **${bus.busName}** (${getBusDisplayCode(bus)})
📍 ${t("route")} ${displayStationName(fromStation)} → ${displayStationName(toStation)}
🕐 ${t("shareTiming")}
🔗 ${t("shareDownload")}

#BusTracking #RaipurBus #RouteInfo`;

		navigator.clipboard.writeText(shareText).then(() => {
			showShareSuccess();
		}).catch((err) => {
			console.error('Failed to copy:', err);
		});
		}

		function showShareSuccess() {
			const toast = document.createElement("div");
			toast.className = "share-success-toast";
			toast.textContent = t("shareCopied");
			document.body.appendChild(toast);

			setTimeout(() => {
				toast.remove();
			}, 3000);
		}

		function fillStationOptions(options = {}) {
			const preserveSelection = options.preserveSelection || false;
			const preservedStartStation = preserveSelection
				? resolveStationName(startStationEl.value)
				: "Railway Station";
			const preservedEndStation = preserveSelection
				? resolveStationName(endStationEl.value)
				: "Old Bus Stand";

			startStationListEl.innerHTML = "";
			endStationListEl.innerHTML = "";

			allStations.forEach((station) => {
				const startOpt = document.createElement("option");
				startOpt.value = displayStationName(station);
				startStationListEl.appendChild(startOpt);

				const endOpt = document.createElement("option");
				endOpt.value = displayStationName(station);
				endStationListEl.appendChild(endOpt);
			});

			// Add sub-station names as datalist suggestions (prefixed with a thin-space for grouping)
			allSubStationNames.forEach((subStation) => {
				const startOpt = document.createElement("option");
				startOpt.value = subStation;
				startOpt.dataset.type = "substation";
				startStationListEl.appendChild(startOpt);

				const endOpt = document.createElement("option");
				endOpt.value = subStation;
				endOpt.dataset.type = "substation";
				endStationListEl.appendChild(endOpt);
			});

			startStationEl.value = displayStationName(preservedStartStation || "Railway Station");
			endStationEl.value = displayStationName(preservedEndStation || "Old Bus Stand");
		}

		function resolveStationName(inputValue) {
    const normalizedInput = normalizeStationInput(inputValue);
    if (!normalizedInput) return "";
    
    // Try to match from allStations
    const stationMatch = allStations.find((station) => {
        const canonicalName = normalizeStationInput(station);
        return canonicalName === normalizedInput || canonicalName.includes(normalizedInput) || normalizedInput.includes(canonicalName);
    });
    if (stationMatch) return stationMatch;
    
    // Try sub-station to parent
    const parentStation = subStationToParentMap[normalizedInput];
    if (parentStation) return parentStation;
    
    // Try city lookup
    return cityNameLookup[normalizedInput] || "";
}

		function resolveSearchTarget(inputValue) {
    const normalizedInput = normalizeStationInput(inputValue);
    if (!normalizedInput) return null;

    // First try to match from allStations (which now includes both busdata.json and rout.json)
    let stationMatch = allStations.find((station) => {
        const canonicalName = normalizeStationInput(station);
        return canonicalName === normalizedInput || canonicalName.includes(normalizedInput) || normalizedInput.includes(canonicalName);
    });
    
    if (stationMatch) {
        return {
            type: "station",
            value: stationMatch,
            display: stationMatch,
            resolvedFromSubStation: false
        };
    }

    // Try sub-station to parent
    const parentStation = subStationToParentMap[normalizedInput];
    if (parentStation) {
        return {
            type: "station",
            value: parentStation,
            display: parentStation,
            resolvedFromSubStation: true
        };
    }

    // Try city lookup
    const cityMatch = cityNameLookup[normalizedInput];
    if (cityMatch) {
        return {
            type: "city",
            value: cityMatch,
            display: cityMatch,
            resolvedFromSubStation: false
        };
    }

    return null;
}
		function findBuses(startTarget, endTarget) {
    if (!startTarget || !endTarget) return [];
    
    const startStationName = startTarget.value || startTarget;
    const endStationName = endTarget.value || endTarget;
    
    const results = [];
    
    for (const bus of busData) {
        if (!bus.route || !bus.route.length) continue;
        
        let startIndex = -1;
        let endIndex = -1;
        
        const normalizedStart = normalizeStationInput(startStationName);
        const normalizedEnd = normalizeStationInput(endStationName);
        
        for (let i = 0; i < bus.route.length; i++) {
            const station = bus.route[i].station;
            const normalizedStation = normalizeStationInput(station);
            
            // Check for start station match
            if (startIndex === -1 && (
                normalizedStation === normalizedStart ||
                normalizedStation.includes(normalizedStart) ||
                normalizedStart.includes(normalizedStation)
            )) {
                startIndex = i;
                console.log(`Found start: "${station}" at index ${i} in bus ${bus.busName}`);
            }
            
            // Check for end station match
            if (normalizedStation === normalizedEnd ||
                normalizedStation.includes(normalizedEnd) ||
                normalizedEnd.includes(normalizedStation)) {
                endIndex = i;
                console.log(`Found end: "${station}" at index ${i} in bus ${bus.busName}`);
            }
        }
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            const departure = getStopTimingInfo(bus.route[startIndex]).departureTime;
            const arrival = getStopTimingInfo(bus.route[endIndex]).arrivalTime;
            const fare = calculateFareForRouteSlice(bus, startIndex, endIndex);
            
            results.push({
                ...bus,
                departure,
                arrival,
                matchedStartStation: bus.route[startIndex].station,
                matchedEndStation: bus.route[endIndex].station,
                viaStops: bus.route.slice(startIndex + 1, endIndex).map((s) => s.station),
                segmentRoute: bus.route.slice(startIndex, endIndex + 1),
                stationHops: fare.segmentCount,
                price: fare.totalFare
            });
        }
    }
    
    console.log(`Found ${results.length} buses from ${startStationName} to ${endStationName}`);
    return results;
}
		function inferCityFromStation(stationName, role = "start") {
			const normalizedStation = normalizeStationInput(stationName);
			if (!normalizedStation) {
				return "";
			}

			const cityCount = new Map();
			const addCity = (city) => {
				const normalizedCity = normalizeStationInput(city);
				if (!normalizedCity) {
					return;
				}
				cityCount.set(normalizedCity, (cityCount.get(normalizedCity) || 0) + 1);
			};

			busData.forEach((bus) => {
				if (!Array.isArray(bus.route)) {
					return;
				}

				bus.route.forEach((stop) => {
					if (normalizeStationInput(stop.station) !== normalizedStation) {
						return;
					}

					if (role === "start") {
						addCity(bus.originCity || bus.origin);
						addCity(bus.origin);
					} else {
						addCity(bus.city || bus.district);
						addCity(bus.city);
					}
				});
			});

			if (!cityCount.size) {
				return "";
			}

			const sorted = Array.from(cityCount.entries()).sort((a, b) => b[1] - a[1]);
			const bestNormalizedCity = sorted[0][0];
			return cityNameLookup[bestNormalizedCity] || "";
		}

		function getCityTargetForSearch(target, role = "start") {
			if (!target) {
				return null;
			}

			if (target.type === "city") {
				return target;
			}

			if (target.type === "station") {
				const inferredCity = inferCityFromStation(target.value, role);
				if (inferredCity) {
					return {
						type: "city",
						value: inferredCity,
						display: inferredCity,
						resolvedFromSubStation: false
					};
				}
			}

			return null;
		}

		function findBusesFromCityAnyLocation(startCityTarget) {
			if (!startCityTarget || startCityTarget.type !== "city") {
				return [];
			}

			return busData
				.map((bus) => {
					if (!Array.isArray(bus.route) || !bus.route.length) {
						return null;
					}

					const segment = getBestRouteSegment(
						bus,
						startCityTarget,
						{ type: "station", value: bus.route[bus.route.length - 1].station }
					);

					if (!segment) {
						return null;
					}

					const { startIndex, endIndex } = segment;
					const departure = getStopTimingInfo(bus.route[startIndex]).departureTime;
					const arrival = getStopTimingInfo(bus.route[endIndex]).arrivalTime;
					const viaStops = bus.route.slice(startIndex + 1, endIndex).map((s) => s.station);
					const segmentRoute = bus.route.slice(startIndex, endIndex + 1);
					const fare = calculateFareForRouteSlice(bus, startIndex, endIndex);

					return {
						...bus,
						departure,
						arrival,
						matchedStartStation: bus.route[startIndex].station,
						matchedEndStation: bus.route[endIndex].station,
						viaStops,
						segmentRoute,
						stationHops: fare.segmentCount,
						price: fare.totalFare
					};
				})
				.filter(Boolean);
		}

		function renderDaysSymbols(bus) {
			const allDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
			const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
			const configuredDays = Array.isArray(bus.daysOfOperation) && bus.daysOfOperation.length
				? bus.daysOfOperation.map((day) => String(day || "").trim().toLowerCase())
				: allDays;

			const chips = allDays
				.map((day, index) => {
					const active = configuredDays.includes(day);
					return `<span class="day-chip${active ? " active" : ""}">${dayLabels[index]}</span>`;
				})
				.join("");

			return `<div class="days-row"><strong>Days:</strong> <span class="days-chips">${chips}</span></div>`;
		}

		function loadSearchHistory() {
			try {
				const stored = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
				if (!stored) {
					searchHistory = [];
					return;
				}

				const parsed = JSON.parse(stored);
				if (!Array.isArray(parsed)) {
					searchHistory = [];
					return;
				}

				searchHistory = parsed
					.map((item) => ({
						startStation: String(item?.startStation || "").trim(),
						endStation: String(item?.endStation || "").trim(),
						searchedAt: Number(item?.searchedAt || Date.now())
					}))
					.filter((item) => item.startStation && item.endStation)
					.slice(0, MAX_SEARCH_HISTORY_ITEMS);
			} catch (error) {
				console.warn("Unable to load search history", error);
				searchHistory = [];
			}
		}

		function persistSearchHistory() {
			try {
				localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(searchHistory));
			} catch (error) {
				console.warn("Unable to save search history", error);
			}
		}

		function addSearchHistory(startStation, endStation) {
			const normalizedStart = String(startStation || "").trim();
			const normalizedEnd = String(endStation || "").trim();
			if (!normalizedStart || !normalizedEnd) {
				return;
			}

			searchHistory = searchHistory.filter((item) =>
				!(item.startStation === normalizedStart && item.endStation === normalizedEnd)
			);

			searchHistory.unshift({
				startStation: normalizedStart,
				endStation: normalizedEnd,
				searchedAt: Date.now()
			});

			searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY_ITEMS);
			persistSearchHistory();
		}

		function clearSearchHistory() {
			searchHistory = [];
			persistSearchHistory();
		}

		function loadRecentViewedBuses() {
			try {
				const stored = localStorage.getItem(RECENT_VIEWED_BUSES_STORAGE_KEY);
				if (!stored) {
					recentViewedBuses = [];
					return;
				}

				const parsed = JSON.parse(stored);
				if (!Array.isArray(parsed)) {
					recentViewedBuses = [];
					return;
				}

				recentViewedBuses = parsed
					.map((item) => ({
						busNo: String(item?.busNo || "").trim(),
						startStation: String(item?.startStation || "").trim(),
						endStation: String(item?.endStation || "").trim(),
						viewedAt: Number(item?.viewedAt || Date.now())
					}))
					.filter((item) => item.busNo)
					.slice(0, MAX_RECENT_VIEWED_BUSES);
			} catch (error) {
				console.warn("Unable to load recent viewed buses", error);
				recentViewedBuses = [];
			}
		}

		function persistRecentViewedBuses() {
			try {
				localStorage.setItem(RECENT_VIEWED_BUSES_STORAGE_KEY, JSON.stringify(recentViewedBuses));
			} catch (error) {
				console.warn("Unable to save recent viewed buses", error);
			}
		}

		function addRecentViewedBus(bus, startStation = "", endStation = "") {
			if (!bus?.busNo) {
				return;
			}

			const resolvedStartStation = String(startStation || bus.route?.[0]?.station || "").trim();
			const resolvedEndStation = String(endStation || bus.route?.[bus.route.length - 1]?.station || "").trim();

			recentViewedBuses = recentViewedBuses.filter((item) =>
				!(item.busNo === bus.busNo && item.startStation === resolvedStartStation && item.endStation === resolvedEndStation)
			);

			recentViewedBuses.unshift({
				busNo: String(bus.busNo).trim(),
				startStation: resolvedStartStation,
				endStation: resolvedEndStation,
				viewedAt: Date.now()
			});

			recentViewedBuses = recentViewedBuses.slice(0, MAX_RECENT_VIEWED_BUSES);
			persistRecentViewedBuses();
		}

		function clearRecentViewedBuses() {
			recentViewedBuses = [];
			persistRecentViewedBuses();
		}

		function renderRecentViewedBusesSection() {
			const recentSection = document.createElement("section");
			recentSection.className = "search-history-panel recent-viewed-panel";

			if (!recentViewedBuses.length) {
				recentSection.innerHTML = `
					<div class="search-history-head">
						<div class="search-history-title">${t("recentlyViewedBuses")}</div>
					</div>
					<div class="search-history-empty">${t("noRecentViewedBuses")}</div>
				`;
				return recentSection;
			}

			const itemsHtml = recentViewedBuses.map((item) => {
				const bus = busData.find((entry) => entry.busNo === item.busNo);
				if (!bus) {
					return "";
				}

				const busCode = getBusDisplayCode(bus);
				const displayStart = displayStationName(item.startStation || bus.route?.[0]?.station || "");
				const displayEnd = displayStationName(item.endStation || bus.route?.[bus.route.length - 1]?.station || "");
				return `
					<button type="button" class="search-history-item recent-viewed-item" data-viewed-bus-number="${escapeHtml(bus.busNo)}" data-viewed-start="${escapeHtml(item.startStation)}" data-viewed-end="${escapeHtml(item.endStation)}">
						<span class="recent-viewed-code">${escapeHtml(busCode)}</span>
						<span class="recent-viewed-main">
							<span class="recent-viewed-name">${escapeHtml(bus.busName)}</span>
							<span class="recent-viewed-route">${displayStart} → ${displayEnd}</span>
						</span>
					</button>
				`;
			}).join("");

			recentSection.innerHTML = `
				<div class="search-history-head">
					<div class="search-history-title">${t("recentlyViewedBuses")}</div>
					<button type="button" class="search-history-clear" data-recent-viewed-clear="1">${t("clearRecentViews")}</button>
				</div>
				<div class="search-history-list">${itemsHtml || `<div class="search-history-empty">${t("noRecentViewedBuses")}</div>`}</div>
			`;

			return recentSection;
		}

		function renderSearchHistorySection(activeStartStation = "", activeEndStation = "") {
			const historySection = document.createElement("section");
			historySection.className = "search-history-panel";

			if (!searchHistory.length) {
				historySection.innerHTML = `
					<div class="search-history-head">
						<div class="search-history-title">${t("searchHistory")}</div>
					</div>
					<div class="search-history-empty">${t("noSearchHistory")}</div>
				`;
				return historySection;
			}

			const itemsHtml = searchHistory.map((item) => {
				const itemStart = displayStationName(item.startStation);
				const itemEnd = displayStationName(item.endStation);
				const isActive = item.startStation === activeStartStation && item.endStation === activeEndStation;
				const activeClass = isActive ? " active" : "";
				return `
					<button type="button" class="search-history-item${activeClass}" data-history-start="${escapeHtml(item.startStation)}" data-history-end="${escapeHtml(item.endStation)}">
						<span>${itemStart}</span>
						<span class="search-history-item-arrow">→</span>
						<span>${itemEnd}</span>
					</button>
				`;
			}).join("");

			historySection.innerHTML = `
				<div class="search-history-head">
					<div class="search-history-title">${t("searchHistory")}</div>
					<button type="button" class="search-history-clear" data-history-clear="1">${t("clearHistory")}</button>
				</div>
				<div class="search-history-list">${itemsHtml}</div>
			`;

			return historySection;
		}

		function renderSearchHistoryOnly() {
			errorTextEl.textContent = "";
			resultsEl.innerHTML = "";
			resultsEl.appendChild(renderSearchHistorySection());
			resultsEl.appendChild(renderRecentViewedBusesSection());
		}

		function getDurationLabel(departureTime, arrivalTime) {
			const departureMinutes = timeToMinutes(departureTime);
			let arrivalMinutes = timeToMinutes(arrivalTime);
			if (arrivalMinutes < departureMinutes) {
				arrivalMinutes += 24 * 60;
			}

			const totalMinutes = Math.max(0, arrivalMinutes - departureMinutes);
			const hours = Math.floor(totalMinutes / 60);
			const minutes = totalMinutes % 60;
			return `${hours}h${String(minutes).padStart(2, "0")}m`;
		}

		function getRunStatusLabel(bus) {
			const allDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
			const configuredDays = Array.isArray(bus.daysOfOperation) && bus.daysOfOperation.length
				? bus.daysOfOperation.map((day) => String(day || "").trim().toLowerCase())
				: allDays;

			const runsAllWeek = allDays.every((day) => configuredDays.includes(day));
			if (runsAllWeek) {
				return {
					text: t("runsDaily"),
					className: "daily"
				};
			}

			const todayKey = allDays[new Date().getDay()];
			if (configuredDays.includes(todayKey)) {
				return {
					text: t("runsToday"),
					className: "today"
				};
			}

			return {
				text: t("notRunningToday"),
				className: "off"
			};
		}

		function renderResults(matches, startStation, endStation, supplementalMatches = []) {
			resultsEl.innerHTML = "";
			const displayStartStation = displayStationName(startStation);
			const displayEndStation = displayStationName(endStation);

			if (!matches.length) {
				if (!supplementalMatches.length) {
					resultsEl.innerHTML =
						`<div class="bus-card">${t("noDirectBus")}</div>`;
					metaTextEl.textContent = t("zeroBusFound", { start: displayStartStation, end: displayEndStation });
					return;
				}

				metaTextEl.textContent = t("zeroBusFound", { start: displayStartStation, end: displayEndStation });
			}

			metaTextEl.textContent = t("busesFound", { count: matches.length, start: displayStartStation, end: displayEndStation });

			const resultsHeader = document.createElement("section");
			resultsHeader.className = "results-screen-head";
			resultsHeader.innerHTML = `
				<div class="results-screen-title">${t("searchResults")}</div>
				<div class="results-screen-route">
					<span>${displayStartStation}</span>
					<span class="results-screen-arrow">→</span>
					<span>${displayEndStation}</span>
				</div>
			`;
			resultsEl.appendChild(resultsHeader);

			matches.forEach((bus) => {
				const card = document.createElement("article");
				card.className = "bus-card rail-result-card";
				const busCode = getBusDisplayCode(bus);
				const departureText = renderTimeToggle(bus.departure);
				const arrivalText = renderTimeToggle(bus.arrival);
				const durationText = getDurationLabel(bus.departure, bus.arrival);
				const runStatus = getRunStatusLabel(bus);

				card.innerHTML = `
					<div class="rail-card-top">
						<span class="rail-code">${busCode}</span>
						<div class="rail-times">
							<span class="rail-time">${departureText}</span>
							<span class="rail-duration"><span>${t("duration")}</span> ${durationText}</span>
							<span class="rail-time end">${arrivalText}</span>
						</div>
					</div>
					<div class="rail-name-row">
						<div class="rail-bus-name">${bus.busName}</div>
						<span class="badge">${bus.matchedRouteNumber || ''}</span>
					</div>
					<div class="rail-route-line">${displayStartStation} → ${displayEndStation}</div>
					<div class="rail-meta-row">
						<span class="rail-status ${runStatus.className}">${runStatus.text}</span>
						<span class="fare-badge"><span class="fare-icon">🎟️</span> ${t("fare")}: ₹${bus.price}</span>
					</div>
					<div class="rail-days-wrap">
						${renderDaysSymbols(bus)}
						</div>
					<div class="btn-group">
						<button type="button" class="track-btn" data-bus-number="${bus.busNo}">${t("trackBus")}</button>
						<button type="button" class="view-route-btn" data-bus-number="${bus.busNo}" data-start-station="${bus.matchedStartStation || startStation}" data-end-station="${bus.matchedEndStation || endStation}">${t("fullRoute")}</button>
					</div>
				`;

				resultsEl.appendChild(card);
			});

			if (supplementalMatches.length) {
				const supplementalHeading = document.createElement("section");
				supplementalHeading.className = "results-screen-head";
				supplementalHeading.innerHTML = `
					<div class="results-screen-title">${t("otherCityBuses")}</div>
				`;
				resultsEl.appendChild(supplementalHeading);

				supplementalMatches.forEach((bus) => {
					const card = document.createElement("article");
					card.className = "bus-card rail-result-card";
					const busCode = getBusDisplayCode(bus);
					const departureText = renderTimeToggle(bus.departure);
					const arrivalText = renderTimeToggle(bus.arrival);
					const durationText = getDurationLabel(bus.departure, bus.arrival);
					const runStatus = getRunStatusLabel(bus);

					const matchedStart = bus.matchedStartStation || startStation;
					const matchedEnd = bus.matchedEndStation || endStation;
					const displayMatchedStart = displayStationName(matchedStart);
					const displayMatchedEnd = displayStationName(matchedEnd);

					card.innerHTML = `
						<div class="rail-card-top">
							<span class="rail-code">${busCode}</span>
							<div class="rail-times">
								<span class="rail-time">${departureText}</span>
								<span class="rail-duration"><span>${t("duration")}</span> ${durationText}</span>
								<span class="rail-time end">${arrivalText}</span>
							</div>
						</div>
						<div class="rail-name-row">
							<div class="rail-bus-name">${bus.busName}</div>
							<span class="rail-alt-badge">${t("cityAlternative")}</span>
							<span class="badge">${bus.matchedRouteNumber || bus.busNo}</span>
						</div>
						<div class="rail-route-line">${displayMatchedStart} → ${displayMatchedEnd}</div>
						<div class="rail-meta-row">
							<span class="rail-status ${runStatus.className}">${runStatus.text}</span>
							<span class="fare-badge"><span class="fare-icon">🎟️</span> ${t("fare")}: ₹${bus.price}</span>
						</div>
						<div class="rail-days-wrap">
							${renderDaysSymbols(bus)}
							</div>
						<div class="btn-group">
							<button type="button" class="track-btn" data-bus-number="${bus.busNo}">${t("trackBus")}</button>
							<button type="button" class="view-route-btn" data-bus-number="${bus.busNo}" data-start-station="${matchedStart}" data-end-station="${matchedEnd}">${t("fullRoute")}</button>
						</div>
					`;

					resultsEl.appendChild(card);
				});
			}

			resultsEl.appendChild(renderSearchHistorySection(startStation, endStation));
			resultsEl.appendChild(renderRecentViewedBusesSection());
		}

		function renderAllBusesAlphabetically() {
			resultsEl.innerHTML = "";
			errorTextEl.textContent = "";

			const sortedBuses = [...busData].sort((first, second) =>
				first.busName.localeCompare(second.busName, undefined, { sensitivity: "base" }) ||
				getBusDisplayCode(first).localeCompare(getBusDisplayCode(second), undefined, { sensitivity: "base" })
			);

			metaTextEl.textContent = t("busesListed", { count: sortedBuses.length });

			sortedBuses.forEach((bus) => {
				const firstStop = bus.route[0];
				const lastStop = bus.route[bus.route.length - 1];
				const totalHops = Math.max(0, bus.route.length - 1);
				const fare = calculateFareForRouteSlice(bus, 0, totalHops).totalFare;
				const busCode = getBusDisplayCode(bus);
				const startLocation = displayStationName(getRouteStartLocation(bus));

				const card = document.createElement("article");
				card.className = "bus-card";
				card.innerHTML = `
					<div class="bus-top">
						<div class="bus-title">${bus.busName} (${busCode})</div>
						<span class="badge">${bus.routeNumber}</span>
					</div>
					<div class="bus-time">
						<div class="bus-time-item">
							<div class="bus-time-top">
								<div class="bus-time-label">${t("departure")}</div>
								<div class="bus-time-label">${t("arrival")}</div>
							</div>
							<div class="bus-time-route">
								<div class="bus-time-city">${displayStationName(firstStop.station)}</div>
								<div class="bus-time-arrow">→</div>
								<div class="bus-time-city end">${displayStationName(lastStop.station)}</div>
							</div>
							<div class="bus-time-value-row">
								<div class="bus-time-value">${renderTimeToggle(getStopTimingInfo(firstStop).departureTime)}</div>
								<div class="bus-time-arrow">→</div>
								<div class="bus-time-value end">${renderTimeToggle(getStopTimingInfo(lastStop).arrivalTime)}</div>
							</div>
						</div>
					</div>
					<div class="bus-route"><strong>${t("route")}</strong> ${displayStationName(firstStop.station)} → ${displayStationName(lastStop.station)}</div>
					<div class="bus-route"><strong>${t("totalStops")}</strong> ${bus.route.length} &nbsp; | &nbsp; <strong>${t("origin")}</strong> ${displayStationName(bus.origin || bus.originCity || bus.city || bus.district || "")} &nbsp; | &nbsp; <strong>${t("startLocation")}</strong> ${startLocation}</div>
					<div>
						<span class="fare-badge"><span class="fare-icon">🎟️</span> ${t("fare")}: ₹${fare}</span>
					</div>
					${renderDaysSymbols(bus)}
					<div class="btn-group">
						<button type="button" class="track-btn" data-bus-number="${bus.busNo}">${t("trackBus")}</button>
						<button type="button" class="view-route-btn" data-bus-number="${bus.busNo}" data-start-station="${firstStop.station}" data-end-station="${lastStop.station}">${t("fullRoute")}</button>
						<button type="button" class="share-btn" data-share-bus-number="${bus.busNo}" data-share-from="${firstStop.station}" data-share-to="${lastStop.station}">${t("share")}</button>
					</div>
				`;

				resultsEl.appendChild(card);
			});
		}

		function onSearch() {
			const rawStart = startStationEl.value;
			const rawEnd = endStationEl.value;
			const startTarget = resolveSearchTarget(rawStart);
			const endTarget = resolveSearchTarget(rawEnd);
			const startStation = startTarget?.display || "";
			const endStation = endTarget?.display || "";
			errorTextEl.textContent = "";

			// Show a subtle hint if a sub-station was resolved to a parent station
			const startIsSubStation = Boolean(startTarget?.resolvedFromSubStation);
			const endIsSubStation = Boolean(endTarget?.resolvedFromSubStation);
			if (startIsSubStation || endIsSubStation) {
				const hints = [];
				if (startIsSubStation) hints.push(`"${rawStart.trim()}" → ${displayStationName(startStation)}`);
				if (endIsSubStation) hints.push(`"${rawEnd.trim()}" → ${displayStationName(endStation)}`);
				errorTextEl.textContent = `📍 ${t("subStationResolved")}: ${hints.join(" · ")}`;
				errorTextEl.classList.add("info-hint");
			} else {
				errorTextEl.classList.remove("info-hint");
			}

			if (!startTarget || !endTarget) {
				errorTextEl.textContent = t("validStationsError");
				errorTextEl.classList.remove("info-hint");
				return;
			}

			hasPerformedSearch = true;
			const matches = findBuses(startTarget, endTarget);

			const startCityTarget = getCityTargetForSearch(startTarget, "start");
			const endCityTarget = getCityTargetForSearch(endTarget, "end");

			let supplementalMatches = [];
			if (startCityTarget && endCityTarget) {
				supplementalMatches = findBuses(startCityTarget, endCityTarget);
			} else if (startCityTarget) {
				supplementalMatches = findBusesFromCityAnyLocation(startCityTarget);
			}

			const primaryKeySet = new Set(matches.map((bus) => `${bus.busNo}|${bus.matchedStartStation}|${bus.matchedEndStation}`));
			supplementalMatches = supplementalMatches.filter((bus) => !primaryKeySet.has(`${bus.busNo}|${bus.matchedStartStation}|${bus.matchedEndStation}`));

			addSearchHistory(startStation, endStation);
			if (!matches.length && startTarget.type === "station" && endTarget.type === "station" && startStation === endStation) {
				errorTextEl.textContent = t("noDirectBus");
				metaTextEl.textContent = t("zeroBusFound", { start: displayStationName(startStation), end: displayStationName(endStation) });
				resultsEl.innerHTML = `<div class="bus-card">${t("noDirectBus")}</div>`;
				resultsEl.appendChild(renderSearchHistorySection(startStation, endStation));
				resultsEl.appendChild(renderRecentViewedBusesSection());
				return;
			}

			if (!matches.length && supplementalMatches.length && startCityTarget) {
				errorTextEl.textContent = t("noExactShowingCity", { city: displayStationName(startCityTarget.display || startCityTarget.value) });
				errorTextEl.classList.add("info-hint");
			}
			currentView = "search";
			renderResults(matches, startStation, endStation, supplementalMatches);
		}

		function applyLanguage() {
			document.documentElement.lang = currentLanguage;
			updateThemeToggleButton();
			languageLabelEl.textContent = t("language");
			heroTitleEl.textContent = t("heroTitle");
			heroSubtitleEl.innerHTML = t("heroSubtitle");
			busListBtnEl.textContent = t("busList");
			searchBtnEl.textContent = t("findBuses");
			startLabelEl.textContent = t("startingStation");
			endLabelEl.textContent = t("destinationStation");
			startStationEl.setAttribute("placeholder", t("startPlaceholder"));
			endStationEl.setAttribute("placeholder", t("endPlaceholder"));
			swapStationsBtnEl.setAttribute("title", t("swapTitle"));
			trackerWarningEl.innerHTML = t("warning");
			trackerCloseBtnEl.textContent = t("back");
			routeCloseBtnEl.textContent = t("back");
			alarmTitleEl.textContent = t("stationAlert");
			alarmDismissBtnEl.textContent = t("dismiss");
			alarmTrackBtnEl.textContent = t("trackBus");
			fillStationOptions({ preserveSelection: true });

			if (currentView === "all") {
				renderAllBusesAlphabetically();
			} else if (hasPerformedSearch) {
				onSearch();
			} else {
				renderSearchHistoryOnly();
			}

			if (trackerOverlayEl.classList.contains("open") && trackerBusData) {
				openTrackerOverlay(trackerBusData);
			}

			if (routeOverlayEl.classList.contains("open") && routeOverlayContext) {
				openRouteOverlay(routeOverlayContext.bus, routeOverlayContext.startStation, routeOverlayContext.endStation);
			}

			if (adminOverlayEl && adminOverlayEl.classList.contains("open")) {
				renderAdminDetails();
			}
		}

		languageSelectEl.addEventListener("change", () => {
			currentLanguage = languageSelectEl.value;
			applyLanguage();
		});
		themeToggleBtnEl.addEventListener("click", toggleTheme);
		searchBtnEl.addEventListener("click", onSearch);
		busListBtnEl.addEventListener("click", (event) => {
			event.preventDefault();
			currentView = "all";
			renderAllBusesAlphabetically();
			resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
		});
		document.addEventListener("click", (event) => {
			const timeToggle = event.target.closest(".time-toggle");
			if (!timeToggle) {
				return;
			}
			useAmPmFormat = !useAmPmFormat;
			refreshVisibleTimeToggles();
		});
		document.addEventListener("keydown", (event) => {
			if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
				event.preventDefault();
				openAdminOverlay();
			}
		});
		swapStationsBtnEl.addEventListener("click", () => {
			const currentStart = startStationEl.value;
			startStationEl.value = endStationEl.value;
			endStationEl.value = currentStart;
			onSearch();
		});
		resultsEl.addEventListener("click", (event) => {
			const trackBtn = event.target.closest(".track-btn");
			const routeBtn = event.target.closest(".view-route-btn");
			const shareBtn = event.target.closest(".share-btn");
			const historyItemBtn = event.target.closest(".search-history-item");
			const historyClearBtn = event.target.closest(".search-history-clear");
			const recentViewedItemBtn = event.target.closest(".recent-viewed-item");
			const recentViewedClearBtn = event.target.closest("[data-recent-viewed-clear='1']");

			if (recentViewedClearBtn) {
				clearRecentViewedBuses();
				if (currentView === "search" && !hasPerformedSearch) {
					renderSearchHistoryOnly();
				} else {
					onSearch();
				}
				return;
			}

			if (recentViewedItemBtn) {
				const busNumber = recentViewedItemBtn.getAttribute("data-viewed-bus-number") || "";
				const startStation = recentViewedItemBtn.getAttribute("data-viewed-start") || "";
				const endStation = recentViewedItemBtn.getAttribute("data-viewed-end") || "";
				const bus = busData.find((item) => item.busNo === busNumber);
				if (bus) {
					openTrackerOverlay(bus);
				}
				if (startStation && endStation) {
					startStationEl.value = displayStationName(startStation);
					endStationEl.value = displayStationName(endStation);
				}
				return;
			}

			if (historyClearBtn) {
				clearSearchHistory();
				if (currentView === "search" && !hasPerformedSearch) {
					renderSearchHistoryOnly();
				} else {
					onSearch();
				}
				return;
			}

			if (historyItemBtn) {
				const historyStart = historyItemBtn.getAttribute("data-history-start") || "";
				const historyEnd = historyItemBtn.getAttribute("data-history-end") || "";
				startStationEl.value = displayStationName(historyStart);
				endStationEl.value = displayStationName(historyEnd);
				onSearch();
				return;
			}

			if (trackBtn) {
				const busNumber = trackBtn.getAttribute("data-bus-number");
				const bus = busData.find((item) => item.busNo === busNumber);
				if (bus) {
					openTrackerOverlay(bus);
				}
			}

			if (routeBtn) {
				const busNumber = routeBtn.getAttribute("data-bus-number");
				const startStation = routeBtn.getAttribute("data-start-station") || "";
				const endStation = routeBtn.getAttribute("data-end-station") || "";
				const bus = busData.find((item) => item.busNo === busNumber);
				if (bus) {
					openRouteOverlay(bus, startStation, endStation);
				}
			}

			if (shareBtn) {
				const busNumber = shareBtn.getAttribute("data-share-bus-number");
				const fromStation = shareBtn.getAttribute("data-share-from");
				const toStation = shareBtn.getAttribute("data-share-to");
				if (busNumber && fromStation && toStation) {
					shareRoute(busNumber, fromStation, toStation);
				}
			}
		});

		trackerHeaderEl.addEventListener("click", (event) => {
			const actionButton = event.target.closest("[data-tracker-action]");
			if (!actionButton || !trackerBusData) {
				return;
			}

			const action = actionButton.getAttribute("data-tracker-action");
			if (action === "alarm") {
				isTrackerAlarmUiVisible = true;
				trackerOverlayEl.classList.add("show-alarms");
				trackerAlarmSummaryEl.scrollIntoView({ behavior: "smooth", block: "start" });
				trackerAlarmSummaryEl.classList.add("is-highlighted");
				setTimeout(() => trackerAlarmSummaryEl.classList.remove("is-highlighted"), 700);
				return;
			}

			if (action === "share") {
				const busNumber = actionButton.getAttribute("data-share-bus-number");
				const fromStation = actionButton.getAttribute("data-share-from");
				const toStation = actionButton.getAttribute("data-share-to");
				if (busNumber && fromStation && toStation) {
					shareRoute(busNumber, fromStation, toStation);
				}
			}
		});

		routeOverlayEl.addEventListener("click", (event) => {
			const shareBtn = event.target.closest(".route-share-btn");
			if (!shareBtn) {
				return;
			}
			const busNumber = shareBtn.getAttribute("data-share-bus-number");
			const fromStation = shareBtn.getAttribute("data-share-from");
			const toStation = shareBtn.getAttribute("data-share-to");
			if (busNumber && fromStation && toStation) {
				shareRoute(busNumber, fromStation, toStation);
			}
		});

		routeTimelineEl.addEventListener("click", (event) => {
			const segmentButton = event.target.closest(".route-v-seg-btn");
			if (!segmentButton) {
				return;
			}

			const segmentIndex = segmentButton.getAttribute("data-route-segment-index");
			if (segmentIndex === null) {
				return;
			}

			const targetSubStation = routeTimelineEl.querySelector(
				`.route-substations[data-route-substations-for="${segmentIndex}"]`
			);
			if (!targetSubStation) {
				return;
			}

			const isOpen = !targetSubStation.hasAttribute("hidden");

			routeTimelineEl.querySelectorAll(".route-substations").forEach((section) => {
				section.setAttribute("hidden", "");
			});
			routeTimelineEl.querySelectorAll(".route-v-seg-btn").forEach((button) => {
				button.setAttribute("aria-expanded", "false");
			});

			if (!isOpen) {
				targetSubStation.removeAttribute("hidden");
				segmentButton.setAttribute("aria-expanded", "true");
			}
		});

		currentTheme = getInitialTheme();
		applyTheme();
		initializeApp();
		

// === NEW Mobile Search - Input stays at top, keyboard visible ===
(function() {
    const startStationEl = document.getElementById('startStation');
    const endStationEl = document.getElementById('endStation');
    
    if (!startStationEl || !endStationEl) return;
    
    // Wrap inputs for positioning
    function wrapInput(input) {
        if (input.parentElement && !input.parentElement.classList.contains('station-input-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'station-input-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            return wrapper;
        }
        return input.parentElement;
    }
    
    wrapInput(startStationEl);
    wrapInput(endStationEl);
    
    // Create suggestions containers
    function createSuggestions(inputElement, containerId) {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'mobile-suggestions';
            container.style.display = 'none';
            inputElement.parentElement.appendChild(container);
        }
        return container;
    }
    
    const startSuggestions = createSuggestions(startStationEl, 'startMobileSuggestions');
    const endSuggestions = createSuggestions(endStationEl, 'endMobileSuggestions');
    
    function hideSuggestions(suggestionsBox) {
        if (suggestionsBox) {
            suggestionsBox.style.display = 'none';
            suggestionsBox.innerHTML = '';
        }
    }
    
    function showSuggestions(suggestionsBox) {
        if (suggestionsBox && suggestionsBox.innerHTML.trim() !== '') {
            suggestionsBox.style.display = 'block';
        }
    }
    
    function updateSuggestions(input, suggestionsBox, query) {
        if (!query || query.length < 1) {
            hideSuggestions(suggestionsBox);
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        let matches = allStations.filter(station => 
            station.toLowerCase().includes(lowerQuery)
        );
        
        matches = matches.slice(0, 6);
        
        if (matches.length === 0) {
            hideSuggestions(suggestionsBox);
            return;
        }
        
        suggestionsBox.innerHTML = matches.map(station => 
            `<div class="mobile-suggestion-item" data-value="${station.replace(/"/g, '&quot;')}">${station}</div>`
        ).join('');
        showSuggestions(suggestionsBox);
    }
    
    function handleInput(event, input, suggestionsBox) {
        updateSuggestions(input, suggestionsBox, event.target.value);
    }
    
    function handleSuggestionClick(event, input, suggestionsBox) {
        const item = event.target.closest('.mobile-suggestion-item');
        if (item) {
            event.preventDefault(); // prevent blur from firing and hiding suggestions
            const value = item.getAttribute('data-value') || item.textContent;
            input.value = value;
            hideSuggestions(suggestionsBox);
            input.focus();
            
            if (typeof onSearch === 'function') {
                onSearch();
            }
        }
    }
    
    function handleFocus(input, suggestionsBox) {
        // Scroll input into view so it stays visible above keyboard on mobile
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        if (input.value.length >= 1) {
            updateSuggestions(input, suggestionsBox, input.value);
        }
    }
    
    function handleBlur(input, suggestionsBox) {
        setTimeout(() => {
            if (!suggestionsBox.contains(document.activeElement)) {
                hideSuggestions(suggestionsBox);
            }
        }, 200);
    }
    
    // Start station events
    startStationEl.addEventListener('input', (e) => handleInput(e, startStationEl, startSuggestions));
    startStationEl.addEventListener('focus', () => handleFocus(startStationEl, startSuggestions));
    startSuggestions.addEventListener('mousedown', (e) => handleSuggestionClick(e, startStationEl, startSuggestions));
    startSuggestions.addEventListener('touchstart', (e) => handleSuggestionClick(e, startStationEl, startSuggestions));
    startStationEl.addEventListener('blur', () => handleBlur(startStationEl, startSuggestions));
    
    // End station events
    endStationEl.addEventListener('input', (e) => handleInput(e, endStationEl, endSuggestions));
    endStationEl.addEventListener('focus', () => handleFocus(endStationEl, endSuggestions));
    endSuggestions.addEventListener('mousedown', (e) => handleSuggestionClick(e, endStationEl, endSuggestions));
    endSuggestions.addEventListener('touchstart', (e) => handleSuggestionClick(e, endStationEl, endSuggestions));
    endStationEl.addEventListener('blur', () => handleBlur(endStationEl, endSuggestions));
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!startStationEl.contains(e.target) && !startSuggestions.contains(e.target)) {
            hideSuggestions(startSuggestions);
        }
        if (!endStationEl.contains(e.target) && !endSuggestions.contains(e.target)) {
            hideSuggestions(endSuggestions);
        }
    });
    
    console.log("Mobile search ready - input stays at top, keyboard visible");
})();

/* ══════════════════════════════════════════════════════
   99Yatri — Yatra Travel Package Functions
   Handles dynamic package loading from yatra.json
   and the full detail modal experience.
══════════════════════════════════════════════════════ */

/* ── Yatra helpers ── */

/* Convert a package title to a URL-friendly slug */
function toYatraSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* All loaded packages — kept globally so hash navigation can find them */
var _yatraPackages = [];

function yatrasetText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '';
}

function yatraSetHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html ?? '';
}

function yatraFormatPrice(price, currency) {
    return `${currency}${price.toLocaleString('en-IN')}`;
}

/* ── Yatra Detail Modal open / close ── */
function openYatraDetail(pkg) {
    yatraPopulateModal(pkg);
    const modal = document.getElementById('detail-modal');
    if (!modal) return;
    // Ensure the Yatra overlay is visible (needed when opening from a shared link)
    openYatraOverlay();
    modal.classList.add('open');
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.classList.add('visible');
    const shareBtn = document.getElementById('modal-share-btn');
    if (shareBtn) shareBtn.classList.add('visible');
    modal.scrollTop = 0;
    // Update the URL hash so this page is shareable
    history.replaceState(null, '', '#' + toYatraSlug(pkg.title));
}

function closeYatraDetail() {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;
    modal.classList.remove('open');
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.classList.remove('visible');
    const shareBtn = document.getElementById('modal-share-btn');
    if (shareBtn) shareBtn.classList.remove('visible');
    // Remove hash without adding a history entry
    history.replaceState(null, '', window.location.pathname + window.location.search);
}

// Attach close button listener
(function() {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeYatraDetail);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeYatraDetail();
    });

    /* ── Share button ── */
    var shareBtn = document.getElementById('modal-share-btn');
    var shareToast = document.getElementById('share-toast');
    var _shareToastTimer = null;

    function showShareToast(msg) {
        if (!shareToast) return;
        shareToast.textContent = msg || 'Link copied!';
        shareToast.classList.add('show');
        clearTimeout(_shareToastTimer);
        _shareToastTimer = setTimeout(function() {
            shareToast.classList.remove('show');
        }, 2200);
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            var url = window.location.href;
            var title = document.getElementById('d-hero-title');
            var pkgTitle = title ? title.textContent : 'Check out this trip!';
            // Use Web Share API on supported devices (mobile)
            if (navigator.share) {
                navigator.share({
                    title: pkgTitle,
                    text: 'Book your next adventure — ' + pkgTitle,
                    url: url
                }).catch(function() {});
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(url).then(function() {
                    showShareToast('Link copied!');
                }).catch(function() {
                    // Final fallback for older browsers
                    var ta = document.createElement('textarea');
                    ta.value = url;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    showShareToast('Link copied!');
                });
            }
        });
    }
})();

/* ── Populate detail modal ── */
function yatraPopulateModal(p) {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;

    /* Hero background */
    const heroBg = modal.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.background = `
            linear-gradient(to bottom, rgba(8,11,20,0.35) 0%, rgba(8,11,20,0.6) 60%, rgba(8,11,20,0.98) 100%),
            url('${p.hero_img}') center/cover no-repeat`;
    }

    yatrasetText('d-hero-title', p.hero_title);
    yatrasetText('d-hero-sub',   p.hero_sub);
    yatrasetText('d-hero-meta',  p.hero_meta);
    yatrasetText('d-badge',      p.category_display);

    yatraSetHTML('d-hero-tags', p.hero_tags
        .map(function(tag) { return `<span class="hero-tag">${tag}</span>`; })
        .join(''));

    /* Animated stars */
    const starsEl = document.getElementById('d-stars');
    if (starsEl) {
        starsEl.innerHTML = '';
        for (let i = 0; i < 40; i++) {
            const s = document.createElement('span');
            s.className = 'star';
            const size = Math.random() * 2.5 + 1;
            s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;--d:${(Math.random() * 4 + 2).toFixed(1)}s;--delay:-${(Math.random() * 6).toFixed(1)}s;--op:${(Math.random() * 0.5 + 0.3).toFixed(2)}`;
            starsEl.appendChild(s);
        }
    }

    /* Vibe */
    yatrasetText('d-vibe-label', p.vibe.label);
    yatraSetHTML('d-vibe-title',
        `${p.vibe.title} <em style="color:var(--yatra-orange,#f59e0b);font-style:normal">${p.vibe.title_em}</em>`);
    yatrasetText('d-vibe-desc', p.vibe.desc);
    yatraSetHTML('d-vibe-grid', p.vibe.items
        .map(function(item) {
            return `<div class="vibe-item"><span class="vi">${item.icon}</span><span>${item.text}</span></div>`;
        }).join(''));

    /* Itinerary */
    yatrasetText('d-itin-label', p.itin.label);
    yatrasetText('d-itin-title', p.itin.title);
    yatraSetHTML('d-timeline', p.itin.itinerary
        .map(function(step) {
            return `<div class="tl-item"><div class="tl-dot"></div><div class="tl-card"><div class="tl-day-label">${step.day}</div><h3>${step.title}</h3><p>${step.desc}</p></div></div>`;
        }).join(''));

    /* Transport */
    yatrasetText('d-trans-label', p.trans.label);
    yatrasetText('d-trans-title', p.trans.title);
    yatrasetText('d-trans-desc',  p.trans.desc);
    yatraSetHTML('d-rides-grid', p.trans.transport
        .map(function(r) {
            return `<div class="ride-card"><div class="ride-icon">${r.icon}</div><h3>${r.name}</h3><p>${r.detail}</p></div>`;
        }).join(''));

    /* Pricing */
    const pr = p.pricing;
    yatrasetText('d-price-label',    pr.label);
    yatrasetText('d-price-headline', pr.headline);
    yatrasetText('d-price-amount',   pr.amount);
    yatrasetText('d-price-per',      pr.per);
    yatrasetText('d-price-pitch',    pr.pitch);
    yatraSetHTML('d-includes', pr.includes
        .map(function(inc) { return `<li class="inc-item"><span class="inc-check">&#10003;</span>${inc}</li>`; })
        .join(''));

    /* Squad */
    const sq = p.squad;
    yatrasetText('d-squad-badge',  sq.badge);
    yatrasetText('d-squad-title',  sq.title);
    yatrasetText('d-squad-desc',   sq.desc);
    const spotsLeft = sq.total - sq.in;
    yatraSetHTML('d-squad-stats', `
        <span><strong>${sq.total}</strong><span class="lbl">Total</span></span>
        <span><strong>${sq.in}</strong><span class="lbl">Joined</span></span>
        <span><strong>${spotsLeft}</strong><span class="lbl">Left</span></span>`);
    yatraSetHTML('d-squad-faces', sq.faces.map(function(f) { return `<span>${f}</span>`; }).join(''));

    /* CTA */
    yatrasetText('d-cta-btn', p.cta.text);
    const ctaBtn = document.getElementById('d-cta-btn');
    if (ctaBtn) ctaBtn.href = p.cta.url;
    yatrasetText('d-cta-sub', p.cta.sub);

    /* Footer */
    yatrasetText('d-footer-tagline', p.footer.tagline);
    yatraSetHTML('d-footer-chips', p.footer.chips
        .map(function(c) { return `<span class="footer-chip">${c}</span>`; })
        .join(''));
}

/* ── Render filter buttons ── */
function yatraRenderFilters(packages, activeCategory) {
    if (activeCategory === undefined) activeCategory = 'all';
    const cats = ['all'].concat(Array.from(new Set(packages.map(function(p) { return p.category; }))));
    const labels = {
        all:        'All Packages',
        road_trip:  '🚗 Road Trips',
        tirth_yatra:'🛕 Tirth Yatra',
        honeymoon:  '💑 Honeymoon',
        trekking:   '🥾 Trekking',
        regional:   '🏞️ Regional',
        wildlife:   '🐘 Wildlife',
        beach:      '🏖️ Beach',
        solo_travel:'🧍 Solo Travel'
    };

    const filterEl = document.getElementById('categoryFilter');
    if (!filterEl) return;
    filterEl.innerHTML = cats
        .map(function(c) {
            return `<button class="filter-btn${activeCategory === c ? ' active' : ''}" data-category="${c}">${labels[c] || c}</button>`;
        }).join('');

    filterEl.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            yatraRenderFilters(packages, btn.dataset.category);
            yatraRenderCards(packages, btn.dataset.category);
        });
    });
}

/* ── Render package cards ── */
function yatraRenderCards(packages, category) {
    if (category === undefined) category = 'all';
    const grid = document.getElementById('packagesGrid');
    if (!grid) return;

    const list = category === 'all'
        ? packages
        : packages.filter(function(p) { return p.category === category; });

    if (!list.length) {
        grid.innerHTML = '<div class="loading">No packages found in this category 🙏</div>';
        return;
    }

    grid.innerHTML = list.map(function(pkg) {
        return `<div class="package-card">
            <div class="card-image" style="background-image:url('${pkg.image}')">
                <span class="category-badge">${pkg.category_display}</span>
                <span class="price-badge">${yatraFormatPrice(pkg.price, pkg.currency)}</span>
            </div>
            <div class="card-content">
                <h3 class="package-title">${pkg.title}</h3>
                <div class="package-location"><i class="fas fa-map-marker-alt"></i> ${pkg.location}</div>
                <div class="package-meta-row">
                    <span class="package-duration"><i class="far fa-calendar-alt"></i> ${pkg.duration}</span>
                    ${pkg.dates ? `<span class="package-dates"><i class="fas fa-calendar-check"></i> ${pkg.dates}</span>` : ''}
                </div>
                <div class="package-highlights">${pkg.highlights.map(function(h) { return `<span class="highlight-tag">${h}</span>`; }).join('')}</div>
                <div class="card-actions">
                    <button class="whatsapp-btn" data-wa="${pkg.whatsapp_number || '917734906606'}" data-title="${pkg.title}">
                        <i class="fab fa-whatsapp"></i> Book via WhatsApp
                    </button>
                    <button class="detail-btn" data-id="${pkg.id}">🔍 Details</button>
                </div>
            </div>
        </div>`;
    }).join('');

    /* WhatsApp button → open booking modal */
    grid.querySelectorAll('.whatsapp-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            openWaBookingModal(btn.dataset.wa, btn.dataset.title);
        });
    });

    /* Detail button */
    grid.querySelectorAll('.detail-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const pkg = packages.find(function(p) { return p.id === Number(btn.dataset.id); });
            if (pkg) openYatraDetail(pkg);
        });
    });
}

/* ── WhatsApp Booking Modal ── */
(function() {
    var _waNumber = '';
    var _waTitle  = '';
    var _couponApplied = '';

    var backdrop      = document.getElementById('waBookingBackdrop');
    var pkgNameEl     = document.getElementById('waModalPkgName');
    var nameInput     = document.getElementById('waNameInput');
    var couponToggle  = document.getElementById('waCouponToggle');
    var couponExpand  = document.getElementById('waCouponExpand');
    var couponInput   = document.getElementById('waCouponInput');
    var couponMsg     = document.getElementById('waCouponMsg');
    var proceedBtn    = document.getElementById('waProceedBtn');
    var closeBtn      = document.getElementById('waModalCloseBtn');

    function openWaBookingModal(number, title) {
        _waNumber      = number;
        _waTitle       = title;
        _couponApplied = '';
        if (nameInput)    nameInput.value   = '';
        if (couponInput)  couponInput.value  = '';
        if (couponMsg)    { couponMsg.textContent = ''; couponMsg.className = 'wa-coupon-msg'; }
        if (couponExpand) couponExpand.classList.remove('open');
        if (couponToggle) couponToggle.classList.remove('active');
        if (pkgNameEl)    pkgNameEl.textContent = title;
        if (backdrop)     backdrop.classList.add('open');
        if (nameInput)    nameInput.focus();
    }
    window.openWaBookingModal = openWaBookingModal;

    function closeModal() {
        if (backdrop) backdrop.classList.remove('open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });

    if (couponToggle) couponToggle.addEventListener('click', function() {
        var isOpen = couponExpand.classList.toggle('open');
        couponToggle.classList.toggle('active', isOpen);
        if (isOpen) {
            couponInput.focus();
        } else {
            couponInput.value  = '';
            couponMsg.textContent = '';
            couponMsg.className   = 'wa-coupon-msg';
            _couponApplied = '';
        }
    });

    if (couponInput) couponInput.addEventListener('change', function() {
        var code = couponInput.value.trim().toUpperCase();
        if (code) {
            _couponApplied = code;
            couponMsg.textContent = '✔ Coupon "' + code + '" will be applied!';
            couponMsg.className   = 'wa-coupon-msg success';
        } else {
            _couponApplied = '';
            couponMsg.textContent = '';
            couponMsg.className   = 'wa-coupon-msg';
        }
    });

    if (proceedBtn) proceedBtn.addEventListener('click', function() {
        var name = (nameInput ? nameInput.value.trim() : '');
        if (!name) {
            nameInput.classList.add('shake');
            nameInput.placeholder = 'Name is required!';
            setTimeout(function() {
                nameInput.classList.remove('shake');
                nameInput.placeholder = 'Enter your full name';
            }, 800);
            return;
        }
        var msg = 'Hi! I\'m ' + name + ' and I\'d like to book the "' + _waTitle + '" package.';
        var code = couponInput ? couponInput.value.trim().toUpperCase() : '';
        if (code) msg += ' Coupon code: ' + code + '.';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg).catch(function() {});
        }
        window.open('https://wa.me/' + _waNumber + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
        closeModal();
    });
})();

/* ── Bootstrap: load yatra.json then render ── */
function loadYatraPackages() {
    fetch('yatra.json')
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function(data) {
            _yatraPackages = data.packages;
            yatraRenderFilters(_yatraPackages, 'all');
            yatraRenderCards(_yatraPackages, 'all');
            // Auto-open detail if a matching hash is in the URL
            yatraHandleHash();
        })
        .catch(function(err) {
            console.error('Could not load yatra.json:', err);
            const grid = document.getElementById('packagesGrid');
            if (grid) grid.innerHTML = '<div class="loading">⚠️ Open via a local server (VS Code Live Server or <code>python -m http.server</code>) to load packages.</div>';
        });
}

/* Open the correct detail page based on current URL hash */
function yatraHandleHash() {
    var hash = window.location.hash.slice(1);
    if (!hash || !_yatraPackages.length) return;
    var pkg = _yatraPackages.find(function(p) { return toYatraSlug(p.title) === hash; });
    if (pkg) {
        // Populate & show without overwriting the hash again
        yatraPopulateModal(pkg);
        var modal = document.getElementById('detail-modal');
        if (modal) modal.classList.add('open');
        var closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) closeBtn.classList.add('visible');
    }
}

/* Listen for browser back / forward so the detail opens / closes correctly */
window.addEventListener('hashchange', function() {
    var hash = window.location.hash.slice(1);
    if (!hash) {
        // Hash was cleared — close detail (without clearing hash again)
        var modal = document.getElementById('detail-modal');
        if (modal) modal.classList.remove('open');
        var closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) closeBtn.classList.remove('visible');
    } else {
        yatraHandleHash();
    }
});

/* Auto-open yatra overlay + detail on page load when a hash is present */
document.addEventListener('DOMContentLoaded', function() {
    var hash = window.location.hash.slice(1);
    if (hash && hash !== 'admin') {
        // openYatraOverlay will call loadYatraPackages which calls yatraHandleHash
        openYatraOverlay();
    }
});
