
let nasaKey = "DEMO_KEY";
let apodLink = "https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=DEMO_KEY";
let planetsLink = "https://solar-system-opendata-proxy.vercel.app/api/planets";
let launchesLink = "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";
let launchPlaceholder = "./assets/images/placeholder.webp";
let launchLoadingImage = "./assets/images/launch-placeholder.png";

let sidebar = document.querySelector("#sidebar");
let menuButton = document.querySelector("#sidebar-toggle");
let menuLinks = document.querySelectorAll(".nav-link");
let allSections = document.querySelectorAll(".app-section");

let dateInput = document.querySelector("#apod-date-input");
let loadButton = document.querySelector("#load-date-btn");
let todayButton = document.querySelector("#today-apod-btn");
let apodImage = document.querySelector("#apod-image");
let viewButton = document.querySelector("#apod-image-container button");

let planets = [];
let currentApod = null;

let planetColors = {
  mercury: "#eab308",
  venus: "#f97316",
  earth: "#3b82f6",
  mars: "#ef4444",
  jupiter: "#fb923c",
  saturn: "#facc15",
  uranus: "#06b6d4",
  neptune: "#2563eb"
};

let planetInfo = {
  mercury: "Mercury is the smallest planet and the closest to the Sun.",
  venus: "Venus is the hottest planet. It spins backwards compared to most planets.",
  earth: "Earth is the third planet from the Sun and the only one known to have life.",
  mars: "Mars is a cold desert planet known as the Red Planet.",
  jupiter: "Jupiter is the largest planet. It is a gas giant with a huge storm called the Great Red Spot.",
  saturn: "Saturn is a gas giant famous for its beautiful rings.",
  uranus: "Uranus is an ice giant that rotates on its side.",
  neptune: "Neptune is the farthest planet from the Sun. It is cold, dark and windy."
};

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function getToday() {
  let now = new Date();
  let year = now.getFullYear();
  let month = String(now.getMonth() + 1).padStart(2, "0");
  let day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortDate(dateText) {
  let date = new Date(dateText + "T00:00:00");
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function longDate(dateText) {
  let date = new Date(dateText + "T00:00:00");
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

menuButton.addEventListener("click", function () {
  if (sidebar.classList.contains("sidebar-open")) {
    sidebar.classList.remove("sidebar-open");
  } else {
    sidebar.classList.add("sidebar-open");
  }
});

function showSection(name) {
  for (let i = 0; i < allSections.length; i++) {
    if (allSections[i].getAttribute("data-section") === name) {
      allSections[i].classList.remove("hidden");
    } else {
      allSections[i].classList.add("hidden");
    }
  }

  for (let j = 0; j < menuLinks.length; j++) {
    if (menuLinks[j].getAttribute("data-section") === name) {
      menuLinks[j].className = "nav-link flex items-center space-x-3 px-3 py-2.5 bg-blue-500/10 text-blue-400 rounded-lg font-medium transition-colors";
    } else {
      menuLinks[j].className = "nav-link flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition-colors";
    }
  }

  window.scrollTo(0, 0);
}

for (let i = 0; i < menuLinks.length; i++) {
  menuLinks[i].addEventListener("click", function (event) {
    event.preventDefault();
    showSection(this.getAttribute("data-section"));
    sidebar.classList.remove("sidebar-open");
  });
}

async function getApod(date) {
  try {
    var response = await fetch(apodLink);
    if (!response.ok) {
      throw new Error("NASA API error " + response.status);
    }
    var data = await response.json();
    var item = null;

    if (date) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].date === date) {
          item = data[i];
        }
      }
    } else {
      item = data[0];
    }

    if (item === null) {
      setText("apod-title", "No picture for this date");
      setText("apod-explanation", "Try another date.");
      return;
    }

    showApod(item);
  } catch (error) {
    console.log("APOD error:", error);
    setText("apod-title", "Something went wrong");
    setText("apod-explanation", "Could not load the image. Try another date.");
  }
}

function showApod(data) {
  currentApod = data;

  if (data.media_type === "video") {
    apodImage.src = "./assets/images/placeholder.webp";
  } else {
    apodImage.src = data.hdurl;
  }

  setText("apod-title", data.title);
  document.getElementById("apod-explanation").innerHTML = data.explanation;
  setText("apod-date", `Astronomy Picture of the Day - ${longDate(data.date)}`);
  setText("apod-date-info", data.date);
  setText("apod-media-type", data.media_type);
  document.getElementById("apod-date-detail").innerHTML = `<i class="far fa-calendar mr-2"></i>${data.date}`;

  if (data.copyright) {
    document.getElementById("apod-copyright").innerHTML = "© " + data.copyright;
  } else {
    setText("apod-copyright", "© NASA");
  }

  dateInput.value = data.date;
  dateInput.parentElement.querySelector("span").textContent = shortDate(data.date);
}

loadButton.addEventListener("click", function () {
  getApod(dateInput.value);
});

todayButton.addEventListener("click", function () {
  getApod();
});

viewButton.addEventListener("click", function () {
  if (currentApod === null) {
    return;
  }

  if (currentApod.media_type === "video") {
    window.open(currentApod.url, "_blank");
  } else {
    window.open(currentApod.hdurl, "_blank");
  }
});

dateInput.addEventListener("change", function () {
  dateInput.parentElement.querySelector("span").textContent = shortDate(dateInput.value);
});

function getStatusColor(status) {
  if (status === "Go") {
    return "#22c55e";
  } else if (status === "TBC") {
    return "#eab308";
  } else if (status === "TBD") {
    return "#3b82f6";
  } else {
    return "#64748b";
  }
}

function launchDate(isoText) {
  let date = new Date(isoText);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function launchTime(isoText) {
  let date = new Date(isoText);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }) + " UTC";
}

var placeholderLaunches = [
  "Martian Moon eXplorer",
  "Amazon Leo (LE-04)",
  "Bandwagon 5",
  "Long March 12A | Flight 2",
  "Long March 12 | Unknown Payload"
];

function getLaunchImage(launch) {
  for (var i = 0; i < placeholderLaunches.length; i++) {
    if (launch.name.indexOf(placeholderLaunches[i]) !== -1) {
      return launchLoadingImage;
    }
  }

  if (launch.image && launch.image.image_url) {
    return launch.image.image_url;
  } else {
    return launchPlaceholder;
  }
}

async function getLaunches() {
  try {
    let response = await fetch(launchesLink);
    let data = await response.json();
    let launches = data.results;

    showFeaturedLaunch(launches[0]);
    showLaunchCards(launches);

    setText("launches-count", `${launches.length} Launches`);
    setText("launches-count-mobile", launches.length);
  } catch (error) {
    console.log("Launches error:", error);
  }
}

function showFeaturedLaunch(launch) {
  let status = launch.status.abbrev;
  let daysLeft = Math.ceil((new Date(launch.net) - new Date()) / (1000 * 60 * 60 * 24));
  let imageUrl = getLaunchImage(launch);
  let description = "No description available.";
  let country = "Unknown";

  if (launch.mission && launch.mission.description) {
    description = launch.mission.description;
  }

  if (launch.pad.country && launch.pad.country.name) {
    country = launch.pad.country.name;
  }

  let imageHtml = "";
  if (imageUrl) {
    imageHtml = `<img src="${imageUrl}" alt="${launch.name}" onerror="this.onerror=null; this.src='${launchPlaceholder}'" class="w-full h-full object-cover absolute inset-0" />`;
  } else {
    imageHtml = `<div class="flex items-center justify-center h-full min-h-[400px] bg-slate-800"><i class="fas fa-rocket text-9xl text-slate-700"></i></div>`;
  }

  document.getElementById("featured-launch").innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star"></i> Featured Launch
              </span>
              <span class="px-4 py-1.5 rounded-full text-sm font-semibold text-white" style="background-color: ${getStatusColor(status)}">${status}</span>
            </div>
            <h3 class="text-3xl font-bold mb-3 leading-tight">${launch.name}</h3>
            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2"><i class="fas fa-building"></i><span>${launch.launch_service_provider.name}</span></div>
              <div class="flex items-center gap-2"><i class="fas fa-rocket"></i><span>${launch.rocket.configuration.name}</span></div>
            </div>
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
              <i class="fas fa-clock text-2xl text-blue-400"></i>
              <div>
                <p class="text-2xl font-bold text-blue-400">${daysLeft}</p>
                <p class="text-xs text-slate-400">Days Until Launch</p>
              </div>
            </div>
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-calendar"></i> Launch Date</p>
                <p class="font-semibold">${launchDate(launch.net)}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-clock"></i> Launch Time</p>
                <p class="font-semibold">${launchTime(launch.net)}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-map-marker-alt"></i> Location</p>
                <p class="font-semibold text-sm">${launch.pad.location.name}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-globe"></i> Country</p>
                <p class="font-semibold">${country}</p>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6">${description}</p>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <button class="flex-1 px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
              <i class="fas fa-info-circle"></i> View Full Details
            </button>
            <div class="icons self-end md:self-center">
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="far fa-heart"></i></button>
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="fas fa-bell"></i></button>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">${imageHtml}</div>
        </div>
      </div>
    </div>`;
}

function showLaunchCards(launches) {
  let cards = "";

  for (let i = 1; i < launches.length; i++) {
    let launch = launches[i];
    let status = launch.status.abbrev;
    let imageUrl = getLaunchImage(launch);
    let imageHtml = "";

    if (imageUrl) {
      imageHtml = `<img src="${imageUrl}" alt="${launch.name}" onerror="this.onerror=null; this.src='${launchPlaceholder}'" class="w-full h-full object-cover" />`;
    } else {
      imageHtml = `<i class="fas fa-rocket text-5xl text-slate-700"></i>`;
    }

    cards += `
      <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">
        <div class="relative h-48 bg-slate-900/50 flex items-center justify-center overflow-hidden">
          ${imageHtml}
          <div class="absolute top-3 right-3">
            <span class="px-3 py-1 text-white rounded-full text-xs font-semibold" style="background-color: ${getStatusColor(status)}">${status}</span>
          </div>
        </div>
        <div class="p-5">
          <div class="mb-3">
            <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">${launch.name}</h4>
            <p class="text-sm text-slate-400 flex items-center gap-2"><i class="fas fa-building text-xs"></i>${launch.launch_service_provider.name}</p>
          </div>
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm"><i class="fas fa-calendar text-slate-500 w-4"></i><span class="text-slate-300">${launchDate(launch.net)}</span></div>
            <div class="flex items-center gap-2 text-sm"><i class="fas fa-clock text-slate-500 w-4"></i><span class="text-slate-300">${launchTime(launch.net)}</span></div>
            <div class="flex items-center gap-2 text-sm"><i class="fas fa-rocket text-slate-500 w-4"></i><span class="text-slate-300">${launch.rocket.configuration.name}</span></div>
            <div class="flex items-center gap-2 text-sm"><i class="fas fa-map-marker-alt text-slate-500 w-4"></i><span class="text-slate-300 line-clamp-1">${launch.pad.location.name}</span></div>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
            <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">Details</button>
            <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"><i class="far fa-heart"></i></button>
          </div>
        </div>
      </div>`;
  }

  document.getElementById("launches-grid").innerHTML = cards;
}

function getAU(planet) {
  return planet.semimajorAxis / 149597870.7;
}

function getMoons(planet) {
  if (planet.moons) {
    return planet.moons.length;
  } else {
    return 0;
  }
}

function getMassText(planet) {
  return `${planet.mass.massValue} × 10^${planet.mass.massExponent} kg`;
}

function getOrbitText(planet) {
  if (planet.sideralOrbit < 730) {
    return `${planet.sideralOrbit.toFixed(1)} days`;
  } else {
    return `${(planet.sideralOrbit / 365.25).toFixed(1)} years`;
  }
}

function getPlanetType(id) {
  if (id === "jupiter" || id === "saturn") {
    return "Gas Giant";
  } else if (id === "uranus" || id === "neptune") {
    return "Ice Giant";
  } else {
    return "Terrestrial";
  }
}

async function getPlanets() {
  try {
    let response = await fetch(planetsLink);
    let data = await response.json();

    let allBodies = data.bodies;
    for (let i = 0; i < allBodies.length; i++) {
      if (allBodies[i].isPlanet) {
        allBodies[i].id = allBodies[i].englishName.toLowerCase();
        planets.push(allBodies[i]);
      }
    }

    planets.sort(function (a, b) {
      return a.semimajorAxis - b.semimajorAxis;
    });

    showPlanetCards();
    showComparisonTable();
    showPlanetDetails("earth");
  } catch (error) {
    console.log("Planets error:", error);
    if (planets.length === 0) {
      document.getElementById("planets-grid").innerHTML = "<p class='text-slate-400'>Could not load planets.</p>";
    }
  }
}

function showPlanetCards() {
  let cards = "";

  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];
    let color = planetColors[planet.id];

    cards += `
      <div class="planet-card bg-slate-800/50 border border-slate-700 rounded-2xl p-4 transition-all cursor-pointer group"
        data-planet-id="${planet.id}" style="--planet-color: ${color}"
        onmouseover="this.style.borderColor='${color}80'" onmouseout="this.style.borderColor='#334155'">
        <div class="relative mb-3 h-24 flex items-center justify-center">
          <img class="w-20 h-20 object-contain group-hover:scale-110 transition-transform" src="./assets/images/${planet.id}.png" alt="${planet.englishName}" />
        </div>
        <h4 class="font-semibold text-center text-sm">${planet.englishName}</h4>
        <p class="text-xs text-slate-400 text-center">${getAU(planet).toFixed(2)} AU</p>
      </div>`;
  }

  let grid = document.getElementById("planets-grid");
  grid.innerHTML = cards;

  let planetCards = grid.querySelectorAll(".planet-card");
  for (let j = 0; j < planetCards.length; j++) {
    planetCards[j].addEventListener("click", function () {
      showPlanetDetails(this.getAttribute("data-planet-id"));
    });
  }
}

function showPlanetDetails(id) {
  let planet = null;
  for (let i = 0; i < planets.length; i++) {
    if (planets[i].id === id) {
      planet = planets[i];
    }
  }

  document.getElementById("planet-detail-image").src = `./assets/images/${planet.id}.png`;
  setText("planet-detail-name", planet.englishName);
  setText("planet-detail-description", planetInfo[planet.id]);

  setText("planet-distance", `${(planet.semimajorAxis / 1000000).toFixed(1)}M km`);
  setText("planet-radius", `${planet.meanRadius} km`);
  setText("planet-mass", getMassText(planet));
  setText("planet-density", `${planet.density} g/cm³`);
  setText("planet-orbital-period", getOrbitText(planet));
  setText("planet-rotation", `${planet.sideralRotation} hours`);
  setText("planet-moons", getMoons(planet));
  setText("planet-gravity", `${planet.gravity} m/s²`);

  if (planet.discoveredBy) {
    setText("planet-discoverer", planet.discoveredBy);
    setText("planet-discovery-date", planet.discoveryDate);
  } else {
    setText("planet-discoverer", "Known since antiquity");
    setText("planet-discovery-date", "Ancient times");
  }

  setText("planet-body-type", planet.bodyType);
  setText("planet-volume", `${planet.vol.volValue} × 10^${planet.vol.volExponent} km³`);

  setText("planet-perihelion", `${(planet.perihelion / 1000000).toFixed(1)}M km`);
  setText("planet-aphelion", `${(planet.aphelion / 1000000).toFixed(1)}M km`);
  setText("planet-eccentricity", planet.eccentricity);
  setText("planet-inclination", `${planet.inclination}°`);
  setText("planet-axial-tilt", `${planet.axialTilt}°`);
  setText("planet-temp", `${Math.round(planet.avgTemp - 273.15)}°C`);
  setText("planet-escape", `${(planet.escape / 1000).toFixed(2)} km/s`);

  document.getElementById("planet-facts").innerHTML = `
    <li class="flex items-start"><i class="fas fa-check text-green-400 mt-1 mr-2"></i><span class="text-slate-300">Mass: ${getMassText(planet)}</span></li>
    <li class="flex items-start"><i class="fas fa-check text-green-400 mt-1 mr-2"></i><span class="text-slate-300">Surface gravity: ${planet.gravity} m/s²</span></li>
    <li class="flex items-start"><i class="fas fa-check text-green-400 mt-1 mr-2"></i><span class="text-slate-300">Density: ${planet.density} g/cm³</span></li>
    <li class="flex items-start"><i class="fas fa-check text-green-400 mt-1 mr-2"></i><span class="text-slate-300">Moons: ${getMoons(planet)}</span></li>`;
}

function showComparisonTable() {
  let rows = "";
  let cell = "px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap";

  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];
    let color = planetColors[planet.id];
    let type = getPlanetType(planet.id);
    let massInEarths = planet.mass.massValue * Math.pow(10, planet.mass.massExponent) / 5.97237e24;

    rows += `
      <tr class="hover:bg-slate-800/30 transition-colors">
        <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
          <div class="flex items-center space-x-2 md:space-x-3">
            <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color: ${color}"></div>
            <span class="font-semibold text-sm md:text-base whitespace-nowrap">${planet.englishName}</span>
          </div>
        </td>
        <td class="${cell}">${getAU(planet).toFixed(2)}</td>
        <td class="${cell}">${Math.round(planet.meanRadius * 2).toLocaleString("en-US")}</td>
        <td class="${cell}">${massInEarths.toFixed(3)}</td>
        <td class="${cell}">${getOrbitText(planet)}</td>
        <td class="${cell}">${getMoons(planet)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap"><span class="px-2 py-1 rounded text-xs bg-slate-700 text-white">${type}</span></td>
      </tr>`;
  }

  document.getElementById("planet-comparison-tbody").innerHTML = rows;
}

dateInput.max = getToday();
getApod();
getLaunches();
getPlanets();
