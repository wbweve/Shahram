/*
  projects-branches.cjs — 500 REAL projects across 10 course branches.
  Same shape as projects-real.cjs so the deep-walk harness can consume it:
    PROJECTS_FILE=./projects-branches.cjs node run-100-real.cjs
  Branches (domain field):
    Software (General) | Electrical Energy | Financial Projects | Mechanical Energy
    Energy (General)   | Fuel Energy       | Engineering         | Sustainable Energy
    Energy Efficiency  | CO2 Reduction
  50 projects per branch (open-source/public references; catalog validated for unique names).
  Fields:
    name     — real project name
    domain   — branch
    country  — primary location
    blurb    — short real description (evidence of reality)
    method   — suggested project management method
    finish   — realistic completion posture for the app lifecycle walk
*/
module.exports = require("./js/project-catalog.js").PROJECTS || [
  // ── Software (General) ────────────────────────────────────────────────────
  { name: "Linux Kernel", domain: "Software (General)", country: "Global", blurb: "World's largest open-source software project; thousands of contributors ship a new release roughly every 9–10 weeks.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Kubernetes", domain: "Software (General)", country: "Global", blurb: "CNCF container-orchestration platform; de-facto standard for cloud-native workloads.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "PostgreSQL", domain: "Software (General)", country: "Global", blurb: "Leading open-source relational database with 3+ decades of continuous development.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Mozilla Firefox", domain: "Software (General)", country: "USA", blurb: "Cross-platform open-source browser built on Mozilla's independent Gecko engine.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "VLC Media Player", domain: "Software (General)", country: "France", blurb: "VideoLAN's cross-platform open-source media player used by billions worldwide.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "WordPress", domain: "Software (General)", country: "Global", blurb: "Open-source CMS powering roughly 40% of the web; core + ecosystem releases.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Visual Studio Code", domain: "Software (General)", country: "USA", blurb: "Microsoft's open-source code editor — the most-used developer tool worldwide.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Debian GNU/Linux", domain: "Software (General)", country: "Global", blurb: "One of the oldest and largest community Linux distributions; ~1,000 maintainers.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Android Open Source Project", domain: "Software (General)", country: "USA", blurb: "Open-source OS foundation behind the world's most-used mobile platform.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "GNOME Desktop", domain: "Software (General)", country: "Global", blurb: "Leading open-source desktop environment for Linux with a global contributor community.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "LLVM/Clang", domain: "Software (General)", country: "USA", blurb: "Open-source compiler infrastructure used by Apple, Google, Rust, Julia and more.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Blender", domain: "Software (General)", country: "Global", blurb: "Open-source 3D creation suite; free-license development funded by the Blender Foundation.", method: "Agile/Scrum", finish: "in-progress" },
  // ── Electrical Energy ─────────────────────────────────────────────────────
  { name: "Vogtle Units 3 & 4", domain: "Electrical Energy", country: "USA", blurb: "First new US nuclear reactors in 30+ years (AP1000); both units commercial by 2024 in Georgia.", method: "Waterfall", finish: "done" },
  { name: "Barakah Nuclear Plant", domain: "Electrical Energy", country: "UAE", blurb: "Four 1.4 GW APR-1400 units — the Arab world's first nuclear plant; fully operational 2024.", method: "Waterfall", finish: "done" },
  { name: "Olkiluoto 3", domain: "Electrical Energy", country: "Finland", blurb: "1.6 GW EPR unit; grid-connected March 2022 with regular output from April 2023 after a 17-year construction saga.", method: "Waterfall", finish: "done" },
  { name: "Flamanville 3", domain: "Electrical Energy", country: "France", blurb: "1.6 GW EPR; connected to the grid December 2024, commercial operation 2025.", method: "Waterfall", finish: "done" },
  { name: "North Sea Link", domain: "Electrical Energy", country: "Norway–UK", blurb: "1.4 GW HVDC interconnector between Norway and the UK; operational 2021 (Statnett–National Grid).", method: "PRINCE2", finish: "done" },
  { name: "ElecLink", domain: "Electrical Energy", country: "France–UK", blurb: "1 GW HVDC link through the Channel Tunnel; in commercial operation since May 2022.", method: "PRINCE2", finish: "done" },
  { name: "NEMO Link", domain: "Electrical Energy", country: "Belgium–UK", blurb: "1 GW HVDC interconnector between Belgium and the UK; operational since 2019.", method: "PRINCE2", finish: "done" },
  { name: "IFA2", domain: "Electrical Energy", country: "France–UK", blurb: "1 GW HVDC interconnector between Normandy and Hampshire; commissioned 2020–21.", method: "PRINCE2", finish: "done" },
  { name: "Champlain Hudson Power Express", domain: "Electrical Energy", country: "USA–Canada", blurb: "1.25 GW HVDC line from Québec hydropower to NYC; activated 1 June 2026.", method: "PRINCE2", finish: "done" },
  { name: "Harmony Link", domain: "Electrical Energy", country: "Lithuania–Poland", blurb: "700 MW HVDC interconnector coupling the Baltic grid to continental Europe; planned ~2030.", method: "PRINCE2", finish: "in-progress" },
  { name: "Hornsdale Power Reserve", domain: "Electrical Energy", country: "Australia", blurb: "150 MW/194 MWh grid-scale Tesla battery near Jamestown, SA; operating since 2017.", method: "Waterfall", finish: "done" },
  { name: "Waratah Super Battery", domain: "Electrical Energy", country: "Australia", blurb: "850 MW/1.68 GWh grid battery at Munmorah, NSW; energizing in stages from 2025.", method: "PRINCE2", finish: "in-progress" },
  // ── Financial Projects ────────────────────────────────────────────────────
  { name: "ECB T2 Real-Time Settlement", domain: "Financial Projects", country: "EU", blurb: "ECB's new real-time gross settlement system replacing TARGET2; live 20 March 2023.", method: "Waterfall", finish: "done" },
  { name: "SWIFT ISO 20022 Migration", domain: "Financial Projects", country: "Global", blurb: "Industry-wide migration of cross-border payments to ISO 20022; go-live Nov 2025 with cutover to 2028.", method: "Waterfall", finish: "in-progress" },
  { name: "EU Instant Payments Rollout", domain: "Financial Projects", country: "EU", blurb: "Regulation mandating instant euro payments at no extra charge; banks live from the Oct 2025 window.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "UPI International Expansion", domain: "Financial Projects", country: "India", blurb: "India's UPI real-time payments rail expanding into partner countries (Nepal, France, UAE, Singapore…).", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Pix Internacional", domain: "Financial Projects", country: "Brazil", blurb: "Banco Central's instant-payment ecosystem, live since 2020; international interoperability under way.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "SAMA Sarie Instant Payments", domain: "Financial Projects", country: "Saudi Arabia", blurb: "Saudi Central Bank (SAMA) instant payments system 'Sarie', live nationally since February 2021.", method: "Agile/Scrum", finish: "done" },
  { name: "ECB Digital Euro Preparation", domain: "Financial Projects", country: "EU", blurb: "Preparation phase for a possible central bank digital currency; rulebook and experimentation ongoing.", method: "Waterfall", finish: "in-progress" },
  { name: "Bank of England RTGS Renewal", domain: "Financial Projects", country: "UK", blurb: "RTGS Renewal Programme: new core ledger and settlement engine went live April 2025; further enhancements continue.", method: "Waterfall", finish: "in-progress" },
  { name: "Payments Canada Real-Time Rail", domain: "Financial Projects", country: "Canada", blurb: "National instant payments platform (RTR); certification and launch planning ongoing.", method: "Waterfall", finish: "in-progress" },
  { name: "Project Guardian", domain: "Financial Projects", country: "Singapore", blurb: "MAS-led asset-tokenization pilots with global banks, asset managers and exchanges.", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Project mBridge", domain: "Financial Projects", country: "Global", blurb: "BIS-led multi-CBDC platform for cross-border payments (China, Hong Kong, Thailand, UAE).", method: "Agile/Scrum", finish: "in-progress" },
  { name: "Riksbank e-Krona Pilot", domain: "Financial Projects", country: "Sweden", blurb: "Sweden's CBDC pilot concluded; preparation for a possible e-krona issuance decision continues.", method: "Waterfall", finish: "in-progress" },
  // ── Mechanical Energy ─────────────────────────────────────────────────────
  { name: "Baihetan Hydropower", domain: "Mechanical Energy", country: "China", blurb: "16 GW hydro plant on the Jinsha River — world's second-largest power station; completed 2022.", method: "Waterfall", finish: "done" },
  { name: "Wudongde Hydropower", domain: "Mechanical Energy", country: "China", blurb: "10.2 GW run-of-river hydro on the Jinsha; all units online by 2021.", method: "Waterfall", finish: "done" },
  { name: "Belo Monte", domain: "Mechanical Energy", country: "Brazil", blurb: "11.2 GW hydro complex on the Xingu with the world's largest bulb-turbine hall.", method: "Waterfall", finish: "done" },
  { name: "Itaipu Binacional", domain: "Mechanical Energy", country: "Brazil–Paraguay", blurb: "14 GW hydro plant on the Paraná — benchmark for large-scale electromechanical engineering.", method: "Waterfall", finish: "done" },
  { name: "Neelum–Jhelum", domain: "Mechanical Energy", country: "Pakistan", blurb: "969 MW run-of-river hydro with a 48 km headrace tunnel in Azad Kashmir; completed 2018.", method: "PRINCE2", finish: "done" },
  { name: "Snowy 2.0", domain: "Mechanical Energy", country: "Australia", blurb: "2.2 GW pumped-hydro expansion of the Snowy Scheme with 27 km of tunnels; first power targeted 2027.", method: "PRINCE2", finish: "in-progress" },
  { name: "Fengning Pumped Storage", domain: "Mechanical Energy", country: "China", blurb: "3.6 GW pumped-storage plant — the world's largest; full commissioning by 2022.", method: "Waterfall", finish: "done" },
  { name: "GE9X Engine Program", domain: "Mechanical Energy", country: "USA", blurb: "GE Aerospace's most powerful jet engine (for the Boeing 777X); certified, awaiting entry into service.", method: "Waterfall", finish: "in-progress" },
  { name: "Rolls-Royce UltraFan", domain: "Mechanical Energy", country: "UK", blurb: "Next-generation ultra-efficient turbofan demonstrator; first full-scale tests on 2023–24 testbeds.", method: "Waterfall", finish: "in-progress" },
  { name: "Mingyang MySE 16-260", domain: "Mechanical Energy", country: "China", blurb: "16 MW offshore wind turbine commissioned 2023 at Zhangpu Liuao (Fujian) — then the world's largest.", method: "Waterfall", finish: "done" },
  { name: "MeyGen Tidal Array", domain: "Mechanical Energy", country: "UK", blurb: "Pentland Firth tidal-stream array in Scotland; phase 1 operational since 2018, phased expansion.", method: "PRINCE2", finish: "in-progress" },
  { name: "Sihwa Lake Tidal", domain: "Mechanical Energy", country: "South Korea", blurb: "254 MW tidal power plant on Sihwa Lake — the world's largest; completed 2011.", method: "Waterfall", finish: "done" },
  // ── Energy (General) ──────────────────────────────────────────────────────
  { name: "Bornholm Energy Island", domain: "Energy (General)", country: "Denmark", blurb: "Planned 3 GW offshore-wind hub in the Baltic; ownership/market design decisions ongoing.", method: "PRINCE2", finish: "in-progress" },
  { name: "Dogger Bank South", domain: "Energy (General)", country: "UK", blurb: "RWE–Masdar 3 GW offshore wind (East & West); DCO approved May 2026, first power targeted 2030.", method: "PRINCE2", finish: "in-progress" },
  { name: "REPowerEU", domain: "Energy (General)", country: "EU", blurb: "EU plan to end dependence on Russian fossil fuels via renewables, savings and hydrogen.", method: "PRINCE2", finish: "in-progress" },
  { name: "SuedLink", domain: "Energy (General)", country: "Germany", blurb: "Two ~700 km HVDC corridors moving North Sea wind south to Bavaria/Baden-Württemberg; commissioning targeted 2028.", method: "PRINCE2", finish: "in-progress" },
  { name: "SüdOstLink", domain: "Energy (General)", country: "Germany", blurb: "~580 km HVDC corridor from Saxony-Anhalt to Bavaria; phased commissioning through 2027.", method: "PRINCE2", finish: "in-progress" },
  { name: "Ukraine Energy Support Fund", domain: "Energy (General)", country: "Ukraine", blurb: "International fund financing emergency repairs and restoration of Ukraine's energy grid since 2022.", method: "PRINCE2", finish: "in-progress" },
  { name: "Desert to Power", domain: "Energy (General)", country: "Sahel / Africa", blurb: "African Development Bank initiative aiming at 10 GW of solar across the Sahel by 2030.", method: "PRINCE2", finish: "in-progress" },
  { name: "One Sun One World One Grid", domain: "Energy (General)", country: "India / Global", blurb: "India-led initiative for a global interconnected solar grid, launched at COP26.", method: "PRINCE2", finish: "in-progress" },
  { name: "ASEAN Power Grid", domain: "Energy (General)", country: "SE Asia", blurb: "Interconnected grid vision across ASEAN; LTMS-PIP cross-border trading live since 2022.", method: "PRINCE2", finish: "in-progress" },
  { name: "CASA-1000", domain: "Energy (General)", country: "Central/South Asia", blurb: "1.3 GW HVDC link carrying Kyrgyz/Tajik summer hydropower to Afghanistan and Pakistan.", method: "PRINCE2", finish: "in-progress" },
  { name: "Green Grids Initiative", domain: "Energy (General)", country: "Global", blurb: "UK–India co-chaired COP26 programme promoting interconnected renewable grids worldwide.", method: "PRINCE2", finish: "in-progress" },
  { name: "Nigeria Presidential Power Initiative", domain: "Energy (General)", country: "Nigeria", blurb: "Grid-modernisation partnership (Federal Government + Siemens) targeting 25 GW capacity uplift.", method: "PRINCE2", finish: "in-progress" },
  // ── Fuel Energy ───────────────────────────────────────────────────────────
  { name: "North Field East", domain: "Fuel Energy", country: "Qatar", blurb: "World's largest LNG project: four trains lifting Qatar's capacity to 126 mtpa; first cargoes 2025–26.", method: "PRINCE2", finish: "in-progress" },
  { name: "North Field South", domain: "Fuel Energy", country: "Qatar", blurb: "Two further LNG trains (~16 mtpa) completing Qatar's North Field expansion.", method: "PRINCE2", finish: "in-progress" },
  { name: "Golden Pass LNG", domain: "Fuel Energy", country: "USA", blurb: "ExxonMobil–QatarEnergy 18 mtpa Texas terminal; first LNG production early 2026, first export cargo April 2026.", method: "PRINCE2", finish: "done" },
  { name: "Corpus Christi Stage 3", domain: "Fuel Energy", country: "USA", blurb: "Cheniere's three-train expansion (+10 mtpa); trains ramping through 2025–26.", method: "PRINCE2", finish: "in-progress" },
  { name: "Port Arthur LNG", domain: "Fuel Energy", country: "USA", blurb: "Sempra–ConocoPhillips two-train Texas terminal (13.5 mtpa); first LNG targeted 2027.", method: "PRINCE2", finish: "in-progress" },
  { name: "Scarborough & Pluto Train 2", domain: "Fuel Energy", country: "Australia", blurb: "Woodside's Scarborough gas field plus second Pluto LNG train; first cargoes targeted 2026.", method: "PRINCE2", finish: "in-progress" },
  { name: "Balticconnector", domain: "Fuel Energy", country: "Finland–Estonia", blurb: "Offshore gas interconnector linking the Baltic states to Finland; commissioning 2020.", method: "PRINCE2", finish: "done" },
  { name: "Trans Adriatic Pipeline", domain: "Fuel Energy", country: "Greece–Albania–Italy", blurb: "878 km gas pipeline delivering Azeri gas to Europe; operational since 2020.", method: "PRINCE2", finish: "done" },
  { name: "Neste Porvoo Transformation", domain: "Fuel Energy", country: "Finland", blurb: "€2.5bn conversion of the Porvoo refinery toward renewable fuels (HVO/SAF) and circular feedstocks.", method: "PRINCE2", finish: "in-progress" },
  { name: "HyNet North West", domain: "Fuel Energy", country: "UK", blurb: "Low-carbon hydrogen and CCS cluster in Northwest England; FID 2024, operations targeted ~2029.", method: "PRINCE2", finish: "in-progress" },
  { name: "Mozambique LNG", domain: "Fuel Energy", country: "Mozambique", blurb: "TotalEnergies 13.1 mtpa LNG project; force majeure lifted and full restart 2025–26, first LNG ~2029.", method: "PRINCE2", finish: "in-progress" },
  { name: "NLNG Train 7", domain: "Fuel Energy", country: "Nigeria", blurb: "Seventh LNG train at Bonny Island adding ~4.4 mtpa; completion slipping into 2026–27.", method: "PRINCE2", finish: "in-progress" },
  // ── Engineering ───────────────────────────────────────────────────────────
  { name: "Millau Viaduct", domain: "Engineering", country: "France", blurb: "World's tallest cable-stayed bridge (343 m pylon); opened 2004.", method: "Waterfall", finish: "done" },
  { name: "Akashi Kaikyō Bridge", domain: "Engineering", country: "Japan", blurb: "World's longest central-span suspension bridge (1,991 m); opened 1998.", method: "Waterfall", finish: "done" },
  { name: "Palm Jumeirah", domain: "Engineering", country: "UAE", blurb: "Iconic reclaimed palm-shaped island in Dubai; completed 2006.", method: "PRINCE2", finish: "done" },
  { name: "Kansai International Airport", domain: "Engineering", country: "Japan", blurb: "First offshore airport on a purpose-built island in Osaka Bay; operational 1994.", method: "Waterfall", finish: "done" },
  { name: "Hong Kong International Airport", domain: "Engineering", country: "China", blurb: "Chek Lap Kok airport built on island reclamation; opened 1998.", method: "Waterfall", finish: "done" },
  { name: "Great Man-Made River", domain: "Engineering", country: "Libya", blurb: "4,000 km pipeline network delivering Sahara fossil water to the coast; phased delivery.", method: "PRINCE2", finish: "in-progress" },
  { name: "Kariba Dam Rehabilitation", domain: "Engineering", country: "Zambia–Zimbabwe", blurb: "Upgrade of the 65-year-old arch dam's plunge pool and spillway to restore safety margins.", method: "PRINCE2", finish: "in-progress" },
  { name: "Venice MOSE", domain: "Engineering", country: "Italy", blurb: "Movable flood barriers protecting the Venice lagoon; fully operational 2020.", method: "Waterfall", finish: "done" },
  { name: "Taipei 101", domain: "Engineering", country: "Taiwan", blurb: "508 m supertall tower — world's tallest 2004–2010; benchmark high-rise engineering.", method: "PRINCE2", finish: "done" },
  { name: "Danyang–Kunshan Grand Bridge", domain: "Engineering", country: "China", blurb: "World's longest bridge (164.8 km) on the Beijing–Shanghai HSR; opened 2011.", method: "Waterfall", finish: "done" },
  { name: "NEOM Oxagon", domain: "Engineering", country: "Saudi Arabia", blurb: "Floating industrial city planned on the Red Sea near NEOM; development ongoing.", method: "PRINCE2", finish: "in-progress" },
  { name: "Sheikh Jaber Al-Ahmad Causeway", domain: "Engineering", country: "Kuwait", blurb: "48.5 km maritime causeway linking Kuwait City to Subiyah; opened 2019.", method: "PRINCE2", finish: "done" },
  // ── Sustainable Energy ────────────────────────────────────────────────────
  { name: "Al Shuaibah Solar", domain: "Sustainable Energy", country: "Saudi Arabia", blurb: "2.6 GW PV complex near Jeddah — the world's largest standalone solar plant (ACWA Power).", method: "Waterfall", finish: "done" },
  { name: "MBR Solar Park", domain: "Sustainable Energy", country: "UAE", blurb: "Mohammed bin Rashid Al Maktoum Solar Park; 5 GW target with world's tallest CSP tower; phased to 2030.", method: "PRINCE2", finish: "in-progress" },
  { name: "Noor Ouarzazate", domain: "Sustainable Energy", country: "Morocco", blurb: "510 MW concentrated-solar complex in the Sahara; phases completed 2016–2019.", method: "Waterfall", finish: "done" },
  { name: "Ivanpah Solar", domain: "Sustainable Energy", country: "USA", blurb: "392 MW CSP tower plant in the Mojave Desert; operating since 2014.", method: "Waterfall", finish: "done" },
  { name: "Vineyard Wind 1", domain: "Sustainable Energy", country: "USA", blurb: "806 MW offshore wind off Massachusetts — first US commercial-scale project; fully operational 2025.", method: "PRINCE2", finish: "done" },
  { name: "South Fork Wind", domain: "Sustainable Energy", country: "USA", blurb: "132 MW offshore wind east of Montauk; operational since 2024.", method: "PRINCE2", finish: "done" },
  { name: "Hollandse Kust Zuid", domain: "Sustainable Energy", country: "Netherlands", blurb: "1.5 GW offshore wind farm (Vattenfall); inaugurated 2023, fully operational 2024.", method: "PRINCE2", finish: "done" },
  { name: "Kaskasi", domain: "Sustainable Energy", country: "Germany", blurb: "RWE's 342 MW offshore wind farm with recyclable blades; operational since 2022.", method: "PRINCE2", finish: "done" },
  { name: "H2Med (BarMar)", domain: "Sustainable Energy", country: "Spain–France", blurb: "Subsea hydrogen corridor Barcelona–Marseille feeding the EU hydrogen backbone; target 2030.", method: "PRINCE2", finish: "in-progress" },
  { name: "Hellisheiði Geothermal", domain: "Sustainable Energy", country: "Iceland", blurb: "303 MW geothermal plant powering Reykjavík's district heating; commissioned 2011.", method: "Waterfall", finish: "done" },
  { name: "Cirata Floating Solar", domain: "Sustainable Energy", country: "Indonesia", blurb: "145 MW floating PV on the Cirata reservoir — Southeast Asia's largest; operational 2023.", method: "PRINCE2", finish: "done" },
  { name: "Hywind Tampen", domain: "Sustainable Energy", country: "Norway", blurb: "88 MW floating wind farm supplying the Snorre/Gullfaks platforms (Equinor); operational 2022.", method: "PRINCE2", finish: "done" },
  // ── Energy Efficiency ─────────────────────────────────────────────────────
  { name: "Energiesprong", domain: "Energy Efficiency", country: "Netherlands–UK", blurb: "Industrialised net-zero retrofit model (prefab facades, heat pumps); scaled across NL, UK and France.", method: "PRINCE2", finish: "in-progress" },
  { name: "Empire State Building Retrofit", domain: "Energy Efficiency", country: "USA", blurb: "Iconic ~38% energy-use reduction retrofit of the 1930s landmark; completed 2014.", method: "Waterfall", finish: "done" },
  { name: "LA LED Streetlight Program", domain: "Energy Efficiency", country: "USA", blurb: "Replacement of 140,000+ municipal streetlights with LEDs under LA's Green Plan.", method: "Waterfall", finish: "done" },
  { name: "UJALA LED Programme", domain: "Energy Efficiency", country: "India", blurb: "Distribution of ~370m LED bulbs by EESL; one of the world's largest efficiency rollouts.", method: "Waterfall", finish: "done" },
  { name: "NYC Retrofit Accelerator", domain: "Energy Efficiency", country: "USA", blurb: "City programme helping buildings cut energy use and comply with Local Law 97 emissions caps.", method: "PRINCE2", finish: "in-progress" },
  { name: "UK Smart Meter Rollout", domain: "Energy Efficiency", country: "UK", blurb: "Nationwide installation of smart gas/electricity meters; ~40m installed (70% of meters) by end-2025.", method: "PRINCE2", finish: "in-progress" },
  { name: "Amager Bakke (CopenHill)", domain: "Energy Efficiency", country: "Denmark", blurb: "Waste-to-energy plant with rooftop ski slope; commissioned 2017, CopenHill ski slope opened 2019.", method: "PRINCE2", finish: "done" },
  { name: "KfW Energy-Efficient Building", domain: "Energy Efficiency", country: "Germany", blurb: "Federal subsidised-loan programme driving low-energy new builds and deep retrofits.", method: "PRINCE2", finish: "in-progress" },
  { name: "Efficiency Vermont", domain: "Energy Efficiency", country: "USA", blurb: "The nation's first efficiency utility; annual savings programmes for electricity and heat.", method: "PRINCE2", finish: "in-progress" },
  { name: "EU Renovation Wave", domain: "Energy Efficiency", country: "EU", blurb: "EU programme to double renovation rates and retrofit 35m buildings by 2030.", method: "PRINCE2", finish: "in-progress" },
  { name: "Kalundborg Symbiosis", domain: "Energy Efficiency", country: "Denmark", blurb: "World's first industrial symbiosis: shared energy, water and waste flows among 17 companies.", method: "PRINCE2", finish: "in-progress" },
  { name: "ProjectZero Sønderborg", domain: "Energy Efficiency", country: "Denmark", blurb: "Municipal carbon-neutral-by-2029 plan built on district-heating retrofits and efficiency measures.", method: "PRINCE2", finish: "in-progress" },
  // ── CO2 Reduction ─────────────────────────────────────────────────────────
  { name: "Northern Lights CCS", domain: "CO2 Reduction", country: "Norway", blurb: "First open-access cross-border CO2 transport & storage; first commercial injections 2025 (Equinor/Shell/Total).", method: "PRINCE2", finish: "done" },
  { name: "Longship", domain: "CO2 Reduction", country: "Norway", blurb: "Full-chain Norwegian CCS: Heidelberg's Brevik cement capture plus Northern Lights shipping/storage.", method: "PRINCE2", finish: "in-progress" },
  { name: "Drax BECCS", domain: "CO2 Reduction", country: "UK", blurb: "Bioenergy with carbon capture at the UK's largest power station; planning and investment under way.", method: "PRINCE2", finish: "in-progress" },
  { name: "Climeworks Mammoth", domain: "CO2 Reduction", country: "Iceland", blurb: "World's largest direct-air-capture plant (36,000 t CO2/yr); operational 2024.", method: "Agile/Scrum", finish: "done" },
  { name: "Climeworks Orca", domain: "CO2 Reduction", country: "Iceland", blurb: "First commercial direct-air-capture plant (4,000 t/yr); operational 2021.", method: "Agile/Scrum", finish: "done" },
  { name: "Gorgon CCS", domain: "CO2 Reduction", country: "Australia", blurb: "World's largest CO2 injection project at Barrow Island (target ~4 Mt/yr); operating since 2019.", method: "Waterfall", finish: "done" },
  { name: "ADM Decatur CCS", domain: "CO2 Reduction", country: "USA", blurb: "Commercial-scale CO2 storage from Illinois corn-ethanol production; injecting since 2017.", method: "Waterfall", finish: "done" },
  { name: "Project Greensand", domain: "CO2 Reduction", country: "Denmark", blurb: "North Sea CO2 storage pilot (INEOS–Wintershall Dea); first injections 2023, scale-up decision pending.", method: "PRINCE2", finish: "in-progress" },
  { name: "Stockholm Exergi Bio-CCS", domain: "CO2 Reduction", country: "Sweden", blurb: "World's largest bio-CCS at the Värtan CHP plant; construction underway, operations targeted 2028.", method: "PRINCE2", finish: "in-progress" },
  { name: "HYBRIT", domain: "CO2 Reduction", country: "Sweden", blurb: "Fossil-free steel via hydrogen (SSAB/LKAB/Vattenfall); pilot 2021, demonstration plant planning.", method: "PRINCE2", finish: "in-progress" },
  { name: "H2 Green Steel (Stegra)", domain: "CO2 Reduction", country: "Sweden", blurb: "Boden plant: green-hydrogen direct-reduction steel; first steel ramp targeted 2026.", method: "PRINCE2", finish: "in-progress" },
  { name: "MethaneSAT", domain: "CO2 Reduction", country: "USA", blurb: "EDF satellite pinpointing methane emissions from oil & gas; launched March 2024.", method: "Waterfall", finish: "done" }
];