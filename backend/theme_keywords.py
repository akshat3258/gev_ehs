"""
Theme Keywords for GEV EHS Platform
Mirrors the JavaScript classification logic for client and server-side theme detection.
"""

THEMES = [
    'Excavation & Trench Work',
    'Vehicle & Mobile Equipment',
    'Suspended Platforms',
    'Machine & Power Tools',
    'Lifting & Rigging',
    'Fall from Height',
    'Lockout/Tagout Violations',
    'Chemical & Hazmat',
    'Hot Work & Welding',
    'Sharp Objects & Cutting',
    'Dropped Objects',
    'Confined Spaces',
    'Environmental Spills',
    'Caught-in / Caught-between',
    'Electrical Hazards',
    'Struck-by Hazards',
    'Slips, Trips & Falls',
    'Forklift & Powered Equipment',
    'Contractor Safety',
    'Scaffolding & Platforms',
    'Crane & Overhead Lifting'
]

THEME_KEYWORDS = {
    'Excavation & Trench Work': r'excavat|trench|dig|soil|shoring|cave.?in|backfill',
    'Vehicle & Mobile Equipment': r'vehicle|truck|driver|mobile equipment|backing|seatbelt|speed|transport',
    'Suspended Platforms': r'suspended platform|swing stage|bosun|man.?basket|aerial lift',
    'Machine & Power Tools': r'machine|power tool|drill|grinder|saw blade|guard|rotating|pinch point',
    'Lifting & Rigging': r'lift|rigging|sling|shackle|hoist|crane|load|capacity|overload',
    'Fall from Height': r'fall from|height|roof|ladder|edge|guardrail|harness|lanyard|anchor|tie.?off',
    'Lockout/Tagout Violations': r'lockout|tagout|loto|energiz|de.?energi|isolation|stored energy',
    'Chemical & Hazmat': r'chemical|hazmat|hazardous material|sds|msds|toxic|corrosive|spill.*chem',
    'Hot Work & Welding': r'hot work|weld|cutting torch|burn|fire watch|spark|flash|slag',
    'Sharp Objects & Cutting': r'sharp|cut|lacerat|blade|knife|puncture|needle|barb|edge.*sharp',
    'Dropped Objects': r'drop.*object|falling object|overhead|tool.*drop|unsecured.*tool|toe board',
    'Confined Spaces': r'confined space|permit.?required|atmosphere|ventilat|entry|monitor.*gas|oxygen',
    'Environmental Spills': r'spill|leak|containment|discharge|stormwater|waste|oil.*ground|berm',
    'Caught-in / Caught-between': r'caught.?in|caught.?between|crush|pinch|nip point|entangle|compress',
    'Electrical Hazards': r'electri|shock|arc flash|live wire|exposed.*wire|panel|energized|gfci|ground fault',
    'Struck-by Hazards': r'struck.?by|hit by|impact|flying|projectile|debris|swing|overhead.*load',
    'Slips, Trips & Falls': r'slip|trip|fall(?!.*height)|wet|ice|uneven|housekeep|clutter|cable.*floor',
    'Forklift & Powered Equipment': r'forklift|pallet jack|powered industrial|pit|load.*fork|pedestrian.*fork',
    'Contractor Safety': r'contractor|sub.?contract|visitor|orient|induct|badge|permit.*work|jsa',
    'Scaffolding & Platforms': r'scaffold|platform|plank|toe.?board|access|erect.*scaffold|inspect.*scaffold',
    'Crane & Overhead Lifting': r'crane|overhead|boom|jib|rigging.*crane|load chart|swing radius|outrigger',
}