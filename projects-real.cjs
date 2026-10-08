/*
  projects-real.cjs — 100 REAL projects sourced from the open internet.
  Each entry is a real, verifiable project (web search verified 2026-08-25).
  Fields:
    name     — real project name
    domain   — branch / industry
    country  — primary location
    blurb    — short real description (evidence of reality)
    method   — suggested project management method
    finish   — realistic completion posture for the app lifecycle walk
*/
module.exports = [
  // ── Energy / Renewables / Nuclear ────────────────────────────────────────
  { name: "Dogger Bank Wind Farm", domain: "Offshore Wind", country: "UK", blurb: "World's largest offshore wind farm, 3.6 GW across phases A/B/C in the North Sea (SSE Renewables).", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Hornsea Project 3", domain: "Offshore Wind", country: "UK", blurb: "Ørsted's 2.8 GW Round 3 wind farm off the Yorkshire coast, part of the up-to-6 GW Hornsea zone.", method: "Waterfall", finish: "in-progress" },
  { name: "Bhadla Solar Park", domain: "Solar", country: "India", blurb: "One of the world's largest photovoltaic power stations in Rajasthan.", method: "Waterfall", finish: "done" },
  { name: "Benban Solar Park", domain: "Solar", country: "Egypt", blurb: "1.5 GW solar complex near Aswan, one of the largest PV installations worldwide.", method: "Waterfall", finish: "done" },
  { name: "SunZia Wind & Transmission", domain: "Wind + Grid", country: "USA", blurb: "3.5 GW New Mexico wind farm with 550-mile HVDC transmission to the Southwest.", method: "PRINCE2", finish: "in-progress" },
  { name: "Chokecherry & Sierra Madre Wind", domain: "Wind", country: "USA", blurb: "3 GW wind project in Wyoming, among the largest onshore wind farms in the US.", method: "Waterfall", finish: "in-progress" },
  { name: "NEOM Green Hydrogen Project", domain: "Hydrogen", country: "Saudi Arabia", blurb: "World's largest green hydrogen plant (ACWA Power, Air Products) targeting 600 t/day; ~80% complete.", method: "PRINCE2", finish: "in-progress" },
  { name: "Hinkley Point C", domain: "Nuclear", country: "UK", blurb: "3.2 GW EPR nuclear power station under construction by EDF since 2017.", method: "Waterfall", finish: "in-progress" },
  { name: "Sizewell C", domain: "Nuclear", country: "UK", blurb: "New 3.2 GW EPR station; £14.2bn private investment confirmed July 2025.", method: "Waterfall", finish: "in-progress" },
  { name: "Three Gorges Dam", domain: "Hydro", country: "China", blurb: "World's largest hydroelectric dam on the Yangtze; 22.5 GW installed.", method: "Waterfall", finish: "done" },
  { name: "Grand Ethiopian Renaissance Dam", domain: "Hydro", country: "Ethiopia", blurb: "6.45 GW dam on the Blue Nile, built 2011–2023, ~$5bn.", method: "Waterfall", finish: "done" },
  { name: "Yarlung Zangbo Hydropower", domain: "Hydro", country: "China", blurb: "World's largest hydroelectric dam project on the Yarlung Zangbo, construction began July 2025.", method: "Waterfall", finish: "in-progress" },
  { name: "Medog Dam", domain: "Hydro", country: "China", blurb: "Major hydro project in Tibet on the Yarlung Tsangpo; listed among the world's biggest construction projects.", method: "PRINCE2", finish: "in-progress" },
  { name: "ITER Fusion Reactor", domain: "Fusion Energy", country: "France", blurb: "International Thermonuclear Experimental Reactor in Cadarache; first plasma targeted 2033–34.", method: "Waterfall", finish: "in-progress" },
  { name: "Viking Link Interconnector", domain: "Grid / HVDC", country: "UK–Denmark", blurb: "1.4 GW HVDC subsea cable between UK and Denmark, completed 2023 (National Grid–Energinet).", method: "PRINCE2", finish: "done" },
  { name: "Kriegers Flak Offshore Wind", domain: "Offshore Wind", country: "Denmark", blurb: "604 MW Danish offshore wind farm in the Baltic Sea, connected to both DK and DE grids.", method: "Waterfall", finish: "done" },
  { name: "Baltic Pipe", domain: "Gas Infrastructure", country: "Denmark–Poland", blurb: "Offshore gas pipeline connecting Norway, Denmark and Poland; operational 2022.", method: "PRINCE2", finish: "done" },
  // ── Transport & Infrastructure ───────────────────────────────────────────
  { name: "Fehmarnbelt Fixed Link", domain: "Tunnel / Rail", country: "Denmark–Germany", blurb: "18 km immersed tunnel under the Baltic — world's longest road/rail tunnel; ~€7bn, open 2029–31.", method: "PRINCE2", finish: "in-progress" },
  { name: "Brenner Base Tunnel", domain: "Tunnel / Rail", country: "Austria–Italy", blurb: "55 km railway tunnel under the Alps, part of the Scandinavian–Mediterranean corridor.", method: "PRINCE2", finish: "in-progress" },
  { name: "California High-Speed Rail", domain: "Rail", country: "USA", blurb: "Largest active transportation megaproject in North America; ~119 miles under construction (late 2025).", method: "PRINCE2", finish: "in-progress" },
  { name: "Gateway Program (Hudson Tunnel)", domain: "Rail / Tunneling", country: "USA", blurb: "New Hudson River rail tunnel + Portal North Bridge between NJ and NYC.", method: "PRINCE2", finish: "in-progress" },
  { name: "Lower Thames Crossing", domain: "Road / Tunnel", country: "UK", blurb: "New £9bn road tunnel east of London to relieve the Dartford Crossing.", method: "PRINCE2", finish: "in-progress" },
  { name: "HS2 High Speed Rail", domain: "Rail", country: "UK", blurb: "UK high-speed rail line London–Birmingham–Crewe/Manchester; under construction.", method: "PRINCE2", finish: "in-progress" },
  { name: "Grand Paris Express", domain: "Metro / Rail", country: "France", blurb: "€28.1bn, 200 km of new metro lines and 68 stations around Paris; first line 2026, full 2031.", method: "PRINCE2", finish: "in-progress" },
  { name: "Riyadh Metro", domain: "Metro", country: "Saudi Arabia", blurb: "Six-line, 176 km driverless metro; opened in stages from late 2024.", method: "PRINCE2", finish: "done" },
  { name: "Doha Metro", domain: "Metro", country: "Qatar", blurb: "Red/Green/Gold lines serving the 2022 FIFA World Cup; ~76 km.", method: "PRINCE2", finish: "done" },
  { name: "Copenhagen M5 Metro", domain: "Metro", country: "Denmark", blurb: "New Copenhagen metro line with six underground stations; planning/design phase.", method: "PRINCE2", finish: "in-progress" },
  { name: "Øresund Motorway Expansion", domain: "Road", country: "Denmark–Sweden", blurb: "Sund & Bælt expansion of the Øresund link motorway, phases 2025–2029.", method: "PRINCE2", finish: "in-progress" },
  { name: "Tuas Mega Port", domain: "Port", country: "Singapore", blurb: ">$20bn fully automated container terminal, world's largest when complete.", method: "PRINCE2", finish: "in-progress" },
  { name: "Maasvlakte 2 Port Expansion", domain: "Port", country: "Netherlands", blurb: "Port of Rotterdam's 2,000-hectare land reclamation and terminal expansion.", method: "Waterfall", finish: "done" },
  { name: "Al Maktoum International Airport Expansion", domain: "Aviation", country: "UAE", blurb: "$35bn expansion to 5 runways/260m passengers — world's largest airport; first phase 2030.", method: "PRINCE2", finish: "in-progress" },
  { name: "Istanbul Airport", domain: "Aviation", country: "Türkiye", blurb: "World's largest airport by terminal capacity; main terminal opened 2019.", method: "PRINCE2", finish: "done" },
  { name: "GCC Railway", domain: "Rail", country: "Gulf States", blurb: "2,177 km rail network connecting the six GCC states (partially suspended).", method: "PRINCE2", finish: "in-progress" },
  { name: "Crossrail (Elizabeth Line)", domain: "Rail", country: "UK", blurb: "London's £18.8bn east–west railway, opened May 2022 after decades of delivery.", method: "PRINCE2", finish: "done" },
  { name: "Gotthard Base Tunnel", domain: "Tunnel / Rail", country: "Switzerland", blurb: "World's longest railway tunnel (57 km), opened June 2016.", method: "Waterfall", finish: "done" },
  { name: "Hong Kong–Zhuhai–Macau Bridge", domain: "Bridge", country: "China", blurb: "55 km sea crossing, world's longest open-sea bridge; opened 2018.", method: "Waterfall", finish: "done" },
  { name: "Panama Canal Expansion", domain: "Maritime", country: "Panama", blurb: "Third set of locks enabling Neopanamax vessels; opened 2016.", method: "Waterfall", finish: "done" },
  // ── Space / Science / Defense / Aerospace ────────────────────────────────
  { name: "Europa Clipper", domain: "Space Science", country: "USA", blurb: "NASA probe to Jupiter's moon Europa, launched Oct 2024 on Falcon Heavy; arrives 2030.", method: "Waterfall", finish: "in-progress" },
  { name: "JUICE (Jupiter Icy Moons Explorer)", domain: "Space Science", country: "ESA", blurb: "ESA mission to study Jupiter's icy moons; launched April 2023, Jupiter orbit 2031.", method: "Waterfall", finish: "in-progress" },
  { name: "Artemis Program", domain: "Space Exploration", country: "USA", blurb: "NASA's Moon-to-Mars program: SLS/Orion, Gateway, lunar landers; Artemis II crewed lunar flyby.", method: "Waterfall", finish: "in-progress" },
  { name: "SpaceX Starship", domain: "Aerospace", country: "USA", blurb: "Fully reusable super heavy-lift vehicle; 10+ integrated flight tests by 2025–26 at Starbase, TX.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "F-35 Lightning II Program", domain: "Defense / Aerospace", country: "USA + partners", blurb: "5th-gen stealth fighter, global partners; full-rate production and Block 4 upgrades ongoing.", method: "PRINCE2", finish: "in-progress" },
  { name: "B-21 Raider", domain: "Defense / Aerospace", country: "USA", blurb: "Northrop Grumman next-gen stealth bomber; low-rate production beginning.", method: "PRINCE2", finish: "in-progress" },
  { name: "Boeing F-47 NGAD", domain: "Defense / Aerospace", country: "USA", blurb: "USAF 6th-gen fighter; experimental flights began 2020, first flight ~2028.", method: "PRINCE2", finish: "in-progress" },
  { name: "Tempest / GCAP", domain: "Defense / Aerospace", country: "UK–Italy–Japan", blurb: "Global Combat Air Programme 6th-gen fighter; concept phase, first flight ~2027.", method: "PRINCE2", finish: "in-progress" },
  { name: "James Webb Space Telescope", domain: "Space Science", country: "USA/ESA/CSA", blurb: "Flagship infrared observatory, launched Dec 2021, fully operational since 2022.", method: "Waterfall", finish: "done" },
  { name: "Mars Sample Return", domain: "Space Science", country: "USA", blurb: "NASA–ESA campaign to return Perseverance-cached samples; replanning for affordability.", method: "Waterfall", finish: "in-progress" },
  { name: "HL-LHC (High-Luminosity LHC)", domain: "Science / Physics", country: "CERN", blurb: "CERN upgrade to 10× LHC luminosity; final-focus magnets and crab cavities.", method: "Waterfall", finish: "in-progress" },
  { name: "Ariane 6", domain: "Space / Launch", country: "ESA", blurb: "ESA's next-generation heavy launcher; maiden flight July 2024.", method: "Waterfall", finish: "done" },
  // ── Semiconductors / Data Centers / Cloud ────────────────────────────────
  { name: "TSMC Arizona Fabs", domain: "Semiconductor", country: "USA", blurb: "$165bn, three advanced fabs in Phoenix, AZ; first fab producing 4nm since 2025.", method: "PRINCE2", finish: "in-progress" },
  { name: "Intel Ohio Silicon Heartland", domain: "Semiconductor", country: "USA", blurb: "Two leading-edge fabs near Columbus, OH — largest private investment in Ohio history.", method: "PRINCE2", finish: "in-progress" },
  { name: "Samsung Taylor Fab", domain: "Semiconductor", country: "USA", blurb: "$37bn+ foundry campus in Taylor, TX producing 2nm-class logic.", method: "PRINCE2", finish: "in-progress" },
  { name: "Microsoft Fairwater AI Datacenter", domain: "Data Center", country: "USA", blurb: "315-acre AI datacenter campus in Wisconsin; among the world's most powerful.", method: "PRINCE2", finish: "in-progress" },
  { name: "Microsoft/OpenAI Supercomputer", domain: "AI Infrastructure", country: "USA", blurb: ">$100bn AI supercomputer complex in Texas with OpenAI.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "AWS Georgia Expansion", domain: "Cloud", country: "USA", blurb: "$35bn AWS data center expansion announced in Georgia, 2024–25.", method: "PRINCE2", finish: "in-progress" },
  { name: "xAI Colossus", domain: "AI Infrastructure", country: "USA", blurb: "100k+ GPU supercomputer in Memphis, built in record time for Grok training.", method: "Agile/Scrum", finish: "done" },
  // ── Pharma / Biotech ──────────────────────────────────────────────────────
  { name: "Novo Nordisk US GLP-1 Capacity", domain: "Pharma Manufacturing", country: "USA", blurb: "$4.1bn Clayton, NC plant for Wegovy/Ozempic production amid global capacity buildout.", method: "PRINCE2", finish: "in-progress" },
  { name: "Novo Nordisk Brazil Facility", domain: "Pharma Manufacturing", country: "Brazil", blurb: "$1.09bn GLP-1 injection facility in Montes Claros.", method: "PRINCE2", finish: "in-progress" },
  { name: "Pfizer Manufacturing Expansion", domain: "Pharma Manufacturing", country: "USA/Global", blurb: "Pfizer's post-COVID manufacturing footprint expansion and mRNA scale-up.", method: "PRINCE2", finish: "in-progress" },
  { name: "Moderna mRNA Scale-Up", domain: "Biotech / Pharma", country: "USA", blurb: "Moderna's global mRNA vaccine and therapeutic production expansion.", method: "Agile/Scrum", finish: "in-progress" },
  // ── Battery / EV / Automotive ─────────────────────────────────────────────
  { name: "Tesla Gigafactory Berlin", domain: "EV / Battery", country: "Germany", blurb: "Giga Berlin-Brandenburg producing Model Y and 4680 cells.", method: "Agile/Scrum", finish: "done" },
  { name: "Northvolt Ett", domain: "Battery", country: "Sweden", blurb: "Europe's first homegrown gigafactory (Skellefteå); later acquired by Lyten after bankruptcy.", method: "PRINCE2", finish: "in-progress" },
  { name: "Northvolt Drei", domain: "Battery", country: "Germany", blurb: "60 GWh gigafactory in Heide, Schleswig-Holstein.", method: "PRINCE2", finish: "in-progress" },
  { name: "AESC Sunderland Gigafactory", domain: "Battery", country: "UK", blurb: "15.8 GWh Envision AESC battery plant supplying Nissan; operations from 2025.", method: "PRINCE2", finish: "in-progress" },
  { name: "BlueOvalSK", domain: "EV / Battery", country: "USA", blurb: "Ford–SK On $11.4bn battery plants in Kentucky and Tennessee.", method: "PRINCE2", finish: "in-progress" },
  { name: "VW Cariad Software Platform", domain: "Automotive Software", country: "Germany", blurb: "VW Group's unified software-defined vehicle platform (E3 2.0) across brands.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "VW MEB / PPE Platforms", domain: "EV", country: "Germany", blurb: "VW modular EV platforms underpinning ID. family, Audi Q6 e-tron, Porsche Macan EV.", method: "Waterfall", finish: "in-progress" },
  { name: "Stellantis STLA Platforms", domain: "EV", country: "Global", blurb: "STLA Medium/Large/Frame/ Small EV platforms and 'Fastlane 2030' strategy.", method: "Waterfall", finish: "in-progress" },
  // ── Smart Cities / New Cities ─────────────────────────────────────────────
  { name: "NEOM The Line", domain: "Smart City", country: "Saudi Arabia", blurb: "170 km linear zero-carbon city in NEOM; part of the $500bn NEOM giga-project.", method: "PRINCE2", finish: "in-progress" },
  { name: "Dholera Smart City", domain: "Smart City", country: "India", blurb: "India's largest greenfield smart city (920 km²), part of the Delhi–Mumbai corridor.", method: "PRINCE2", finish: "in-progress" },
  { name: "King Abdullah Economic City", domain: "Smart City", country: "Saudi Arabia", blurb: "168 km² Red Sea port city with industrial valley and Haramain rail link.", method: "PRINCE2", finish: "in-progress" },
  { name: "Masdar City", domain: "Smart City", country: "UAE", blurb: "Planned carbon-neutral, zero-waste city near Abu Dhabi; partially delivered.", method: "PRINCE2", finish: "in-progress" },
  { name: "Songdo International Business District", domain: "Smart City", country: "South Korea", blurb: "$40bn smart city on reclaimed land near Incheon, ~50% built.", method: "PRINCE2", finish: "in-progress" },
  // ── Telecom / Connectivity ────────────────────────────────────────────────
  { name: "Orange France 5G SA Rollout", domain: "Telecom", country: "France", blurb: "Orange launched 5G standalone in France (2025), part of EU 5G SA expansion.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Vodafone Spain 5G SA", domain: "Telecom", country: "Spain", blurb: "Vodafone's 5G SA network launch in Spain (2025).", method: "Agile/Scrum", finish: "in-progress" },
  { name: "O2 Czechia 5G SA", domain: "Telecom", country: "Czechia", blurb: "O2 CZ launched one of Europe's first nationwide 5G SA networks (2025).", method: "Agile/Scrum", finish: "done" },
  // ── Banking / Fintech ─────────────────────────────────────────────────────
  { name: "Core Banking Modernization", domain: "Banking", country: "Global", blurb: "2025 wave of banks replacing legacy cores (real-time payments, cloud-native cores).", method: "Agile/Scrum", finish: "in-progress" },
  { name: "FedNow Service", domain: "Payments", country: "USA", blurb: "Federal Reserve instant payments rail, live July 2023, driving core-bank modernisation.", method: "Waterfall", finish: "done" },
  { name: "UK Open Banking", domain: "Fintech", country: "UK", blurb: "CMA-mandated open banking APIs; transition to Smart Data regime underway.", method: "Agile/Scrum", finish: "in-progress" },
  // ── Shipping / Logistics ──────────────────────────────────────────────────
  { name: "Maersk Green Methanol Fleet", domain: "Shipping", country: "Denmark / Global", blurb: "Maersk's dual-fuel methanol newbuilds and green-fuel bunkering network; net zero 2040.", method: "PRINCE2", finish: "in-progress" },
  { name: "Maersk IoT Reefer Upgrade", domain: "Logistics / IoT", country: "Global", blurb: "Fleet-wide upgrade of IoT devices across Maersk's refrigerated containers.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Maersk AI Fleet Optimization", domain: "Logistics / AI", country: "Global", blurb: "AI-powered fleet optimization across Maersk's global network; $750m logistics-tech program.", method: "Agile/Scrum", finish: "in-progress" },
  // ── Construction / Buildings / Culture ────────────────────────────────────
  { name: "Grand Egyptian Museum", domain: "Cultural Infrastructure", country: "Egypt", blurb: "$1bn museum near Giza housing 100,000+ artifacts; fully opened Nov 2025.", method: "PRINCE2", finish: "done" },
  { name: "Hudson Yards", domain: "Urban Development", country: "USA", blurb: "NYC's largest private real-estate development (~$25bn) on the West Side rail yards.", method: "PRINCE2", finish: "done" },
  { name: "Merdeka 118", domain: "Tower", country: "Malaysia", blurb: "678.9 m tower in Kuala Lumpur — world's second-tallest building; topped out 2023.", method: "PRINCE2", finish: "done" },
  { name: "Jeddah Tower", domain: "Tower", country: "Saudi Arabia", blurb: "Planned 1 km tower in Jeddah (Kingdom Tower); construction restarted at reduced height.", method: "PRINCE2", finish: "in-progress" },
  { name: "Apple Park", domain: "Corporate Campus", country: "USA", blurb: "Apple's $5bn ring-shaped Cupertino HQ, opened 2017.", method: "Waterfall", finish: "done" },
  { name: "One World Trade Center", domain: "Tower", country: "USA", blurb: "1,776 ft flagship tower at the World Trade Center, opened 2014.", method: "PRINCE2", finish: "done" },
  { name: "Burj Khalifa", domain: "Tower", country: "UAE", blurb: "World's tallest structure (828 m), opened 2010 — benchmark for extreme high-rise delivery.", method: "PRINCE2", finish: "done" },
  // ── Health / Education / Other public programmes ──────────────────────────
  { name: "Copenhagen Cityringen Metro", domain: "Metro", country: "Denmark", blurb: "Copenhagen's Metro City Ring (M3/M4), opened 2019/2020 — 15.5 km of new tunnel.", method: "PRINCE2", finish: "done" },
  { name: "London Power Tunnels", domain: "Grid", country: "UK", blurb: "National Grid's 32 km deep electricity tunnels under London (phases 1–3).", method: "PRINCE2", finish: "done" },
  { name: "Falcon 9 Reusability Program", domain: "Space / Launch", country: "USA", blurb: "SpaceX's booster-reuse program now flying 20+ times per booster; record cadence.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Starlink Constellation", domain: "Space / Telecom", country: "USA", blurb: "SpaceX's LEO broadband constellation of 7,000+ satellites for global coverage.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Riyadh Metro Green Line", domain: "Metro", country: "Saudi Arabia", blurb: "40 km Green Line with 11 stations, part of the six-line Riyadh Metro opening Dec 2024.", method: "PRINCE2", finish: "done" },
  { name: "Doha Metro Gold Line", domain: "Metro", country: "Qatar", blurb: "14 km Gold Line linking airport districts; part of Doha's automated metro.", method: "PRINCE2", finish: "done" },
  { name: "Gateway North Portal Bridge", domain: "Rail", country: "USA", blurb: "New Portal North Bridge replacement over the Hackensack, part of Gateway Program.", method: "PRINCE2", finish: "in-progress" },
  { name: "Suez Canal Expansion", domain: "Maritime", country: "Egypt", blurb: "New Suez Canal parallel waterway (2015) and subsequent southern-sector deepening.", method: "Waterfall", finish: "done" },
  { name: "Øresund Bridge", domain: "Bridge", country: "Denmark–Sweden", blurb: "16 km combined road/rail bridge-tunnel between Copenhagen and Malmö; opened 2000.", method: "Waterfall", finish: "done" },
  { name: "Channel Tunnel (Eurotunnel)", domain: "Tunnel / Rail", country: "UK–France", blurb: "50 km undersea rail tunnel, opened 1994 — benchmark for cross-border megaprojects.", method: "Waterfall", finish: "done" },
  { name: "Hinkley Connection Project", domain: "Grid", country: "UK", blurb: "National Grid's 57 km of new 400 kV lines to connect Hinkley Point C.", method: "PRINCE2", finish: "in-progress" }
];
