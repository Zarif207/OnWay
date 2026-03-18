
export const getDemandMultiplier = (params) => {
    const {
        pickupAddress = "",
        appOpenCount = 0,
        weatherMultiplier = 1.0,
        weatherCondition = "",
        rainMm = 0,
        visibility = 10000,
        temp = 30,
        humidity = 60,
    } = params;

    const HOTSPOTS = [
        "Railway Station",
        "Rail Station",
        "Train Station",
        "Bus Terminal",
        "Bus Stand",
        "Bus Station",
        "Launch Terminal",
        "Ferry Ghat",
        "Steamer Ghat",
        "Airport",
        "Biman Bandar",
        "Zilla School",
        "University",
        "Varsity",
        "College",
        "Medical College",
        "Polytechnic",
        "School Mor",
        "College Gate",
        "University Gate",
        "Main Bazar",
        "Bazar",
        "Market",
        "New Market",
        "Shopping Mall",
        "Super Shop",
        "Super Market",
        "Shoping Center",
        "Hospital",
        "Clinic",
        "Medical",
        "Sadar Hospital",
        "District Hospital",
        "General Hospital",
        "DC Office",
        "Collectorate",
        "Court",
        "Sadar",
        "Upazila",
        "Thana",
        "Police Station",
        "Government Office",
        "Stadium",
        "BSCIC",
        "Industrial Area",
        "EPZ",
        "Export Zone",
        "Bank",
        "Sonali Bank",
        "Motijheel",
        "Gulshan",
        "Banani",
        "Dhanmondi",
        "Mirpur",
        "Uttara",
        "Mohammadpur",
        "Farmgate",
        "Shahbag",
        "New Market",
        "Sadarghat",
        "Gabtoli",
        "Mohakhali",
        "Agrabad",
        "GEC",
        "Chawkbazar",
        "Nasirabad",
        "Halishahar",
        "Patenga",
        "Zero Point",
        "Shapla Chattar",
        "Boro Masjid",
        "Central Mosque",
        "Jame Masjid",
        "Idgah Maidan",
    ];

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    let multiplier = 1.0;
    let reasons = [];

    // ১. Time-Based Logic
    if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21)) {
        multiplier *= 1.25;
        reasons.push("Peak Hour");
    } else if (hour >= 23 || hour <= 5) {
        multiplier *= 1.30;
        reasons.push("Late Night");
    }

    // ২. Weekend Surge — day variable
    if (day === 5 || day === 6) {
        multiplier *= 1.10;
        reasons.push("Weekend");
    }

    // ৩. Area-Based Logic (Hotspots)
    const isHotspot = HOTSPOTS.some(spot =>
        pickupAddress.toLowerCase().includes(spot.toLowerCase())
    );
    if (isHotspot) {
        multiplier *= 1.15;
        reasons.push("High Demand Area");
    }

    // ৪. Real-time Demand (Dynamic Traffic)
    if (appOpenCount > 10) {
        const trafficFactor = Math.min(1 + (appOpenCount / 100), 1.5);
        multiplier *= trafficFactor;

        if (trafficFactor >= 1.1) {
            reasons.push("High Traffic");
        }
    }

    // ৫. Weather Integration

    let resolvedWeatherFactor = 1.0;

    if (weatherCondition) {
        // New path: raw condition থেকে calculate
        if (weatherCondition === "Thunderstorm" || weatherCondition === "Squall") {
            resolvedWeatherFactor = 1.5;
        } else if (weatherCondition === "Rain" || weatherCondition === "Drizzle") {
            resolvedWeatherFactor = rainMm > 20 ? 1.45 : 1.3;
        } else if (visibility < 1000 || weatherCondition === "Fog" || weatherCondition === "Mist") {
            resolvedWeatherFactor = 1.2;
        } else if (temp > 36 && humidity > 70) {
            resolvedWeatherFactor = 1.15;
        } else if (temp > 38) {
            resolvedWeatherFactor = 1.1;
        }
    } else if (weatherMultiplier > 1.0) {
        resolvedWeatherFactor = weatherMultiplier;
    }

    if (resolvedWeatherFactor > 1.0) {
        multiplier *= resolvedWeatherFactor;
        reasons.push("Weather Surge");
    }

    // ৬. Special Dates (BD Perspective)
    const monthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const specialEvents = {

        "02-21": "Ekushey February",
        "03-07": "Historic 7th March",
        "03-17": "Mujib Birthday",
        "03-25": "Genocide Remembrance Day",
        "03-26": "Independence Day",
        "04-14": "Pohela Boishakh",
        "04-17": "Mujibnagar Day",
        "05-01": "May Day",
        "08-15": "National Mourning Day",
        "09-28": "Hasina Birthday",
        "11-07": "National Revolution Day",
        "12-14": "Martyred Intellectuals Day",
        "12-16": "Victory Day",
        "12-31": "New Year Eve",
        "04-10": "Eid ul-Fitr",
        "04-11": "Eid Holiday",
        "04-12": "Eid Holiday",
        "06-17": "Eid ul-Adha",
        "06-18": "Eid Holiday",
        "06-19": "Eid Holiday",
        "10-02": "Durga Puja",
        "10-03": "Durga Puja",
        "10-12": "Durga Puja",
        "01-01": "English New Year",
        "02-14": "Valentine's Day",
        "10-31": "Halloween",
        "02-15": "SSC Exam Season",
        "04-02": "HSC Exam Season",
    };

    if (specialEvents[monthDay]) {
        multiplier *= 1.40;
        reasons.push(specialEvents[monthDay]);
    }

    // Max cap 2.5x to keep it professional
    const finalValue = Math.min(multiplier, 2.5);

    return {
        value: parseFloat(finalValue.toFixed(2)),
        reasons: reasons.length > 0 ? [...new Set(reasons)] : ["Standard"],
        isSurge: finalValue > 1.1
    };
};