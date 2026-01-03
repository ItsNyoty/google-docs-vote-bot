const flemishFirstNames = ["Jan", "Piet", "Joris", "Corneel", "Lukas", "Thomas", "Bart", "Koen", "Wim", "Luc", "Marc", "Peter", "Johan", "Dirk", "Tom", "Kris", "Stef", "Geert", "Stijn", "Maarten", "Els", "Maria", "Katrien", "An", "Linda", "Martine", "Hilde", "Caroline", "Sofie", "Kim", "Sarah", "Eline", "Lotte", "Emma", "Julie", "Lisa", "Britt", "Laura"];
const flemishLastNames = ["Peeters", "Janssens", "Maes", "Jacobs", "Mertens", "Willems", "Claes", "Goossens", "Wouters", "De Smet", "Vermeulen", "Pauwels", "Dubois", "Hermans", "Michiels", "Martens", "Vande Velde", "Desmet", "De Backer", "Lemmens", "Verstraete", "Declercq", "Cornelis"];

const locations = [
    { city: "Scheldewindeke", zip: "9860", type: "village" },
    { city: "Oosterzele", zip: "9860", type: "village" },
    { city: "Balegem", zip: "9860", type: "village" },
    { city: "Moortsel", zip: "9860", type: "village" },
    { city: "Landskouter", zip: "9860", type: "village" },
    { city: "Gijzenzele", zip: "9860", type: "village" },
    { city: "Bottelare", zip: "9820", type: "village" },
    { city: "Munte", zip: "9820", type: "village" },
    { city: "Merelbeke", zip: "9820", type: "town" }, 
    { city: "Baaigem", zip: "9890", type: "village" },
    { city: "Dikkelvenne", zip: "9890", type: "village" },
    { city: "Gavere", zip: "9890", type: "town" },
    { city: "Zottegem", zip: "9620", type: "city" }, 
    { city: "Velzeke", zip: "9620", type: "village" },
    { city: "Oombergen", zip: "9620", type: "village" },
    { city: "Wetteren", zip: "9230", type: "city" }, 
    { city: "Massemen", zip: "9230", type: "village" },
    { city: "Roborst", zip: "9630", type: "village" },
    { city: "Munkzwalm", zip: "9630", type: "village" },
    { city: "Beerlegem", zip: "9630", type: "village" }
];

const cityStreets = ["Nieuwstraat", "Stationsstraat", "Kerkstraat", "Hoogstraat", "Kasteelstraat", "Kapelstraat", "Grote Markt", "Marktplein", "Provinciebaan", "Zottegemstraat"];
const villageStreets = ["Dorpsstraat", "Molenstraat", "Veldstraat", "Kerkstraat", "Schoolstraat", "Lindestraat", "Bosstraat", "Kapelweg", "Spiegel", "Lange Munte", "Windekekouter", "Stationsstraat", "Meerstraat"];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fetchBelgianUser() {
    return new Promise((resolve) => {
        const firstName = getRandomElement(flemishFirstNames);
        const lastName = getRandomElement(flemishLastNames);
        
        const nameOrder = Math.random() > 0.2 ? `${lastName} ${firstName}` : `${firstName} ${lastName}`;
        
        const location = getRandomElement(locations);
        let streetList = location.type === "city" || location.type === "town" ? cityStreets : villageStreets;
        if(location.type === "village") streetList = [...villageStreets, ...villageStreets, "Langestraat", "Kouter"];

        const street = getRandomElement(streetList);
        const number = getRandomInt(1, 150);
        
        let bus = "";
        if ((location.type === "city" || location.type === "town") && Math.random() > 0.7) {
            bus = ` bus ${getRandomInt(1, 20)}`;
        }
        
        const address = `${street} ${number}${bus}, ${location.zip} ${location.city}`;

        // Email Logic
        const domains = ["outlook.com", "hotmail.com", "telenet.be", "proximus.be", "outlook.be"];
        const randomDomain = Math.random() < 0.7 ? "gmail.com" : getRandomElement(domains);
        
        const sep = Math.random() > 0.5 ? "." : "";
        const numSuffix = Math.random() > 0.8 ? getRandomInt(1, 999) : ""; 
        
        const email = `${firstName.toLowerCase()}${sep}${lastName.toLowerCase().replace(/\s/g, '')}${numSuffix}@${randomDomain}`;

        // Phone (Belgian format)
        // 04xx xx xx xx (standard)
        // 04xxxxxxxx (no spaces)
        // 04xx/xx.xx.xx (slashes/dots - less common for mobile but possible)
        const digits = `04${getRandomInt(70, 99)}${getRandomInt(10, 99)}${getRandomInt(10, 99)}${getRandomInt(10, 99)}`;
        let phone;
        const format = Math.random();
        
        if (format < 0.4) {
            phone = digits;
        } else if (format < 0.9) {
            phone = `${digits.substring(0,4)} ${digits.substring(4,6)} ${digits.substring(6,8)} ${digits.substring(8,10)}`;
        } else {
             phone = `${digits.substring(0,4)}/${digits.substring(4,6)}.${digits.substring(6,8)}.${digits.substring(8,10)}`;
        }

        const tractor = Math.random() < 0.4 ? 4 : getRandomInt(1, 121);

        const fullData = {
            firstName,
            lastName,
            fullName: nameOrder, 
            email,
            address,
            phone,
        };
        resolve(fullData);
    });
}

module.exports = { fetchBelgianUser };
