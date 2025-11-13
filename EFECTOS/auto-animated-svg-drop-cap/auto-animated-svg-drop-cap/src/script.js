const videoURL =
	"https://www.youtube.com/embed/R3Aq1YMamto?autoplay=1&amp;mute=1&amp;loop=1&amp;controls=0";

document.querySelector("iframe").setAttribute("src", videoURL);

const contentDiv = document.querySelector(".content");
function adjustContentSize() {
	const viewportWidth = window.innerWidth;
	const baseWidth = 1300;
	const scaleFactor =
		viewportWidth < baseWidth ? (viewportWidth / baseWidth) * 0.8 : 1;
	contentDiv.style.transform = `scale(${scaleFactor})`;
}

window.addEventListener("load", adjustContentSize);

window.addEventListener("resize", adjustContentSize);

const quoteText = document.getElementById("quote-text");
const svgContainer = document.getElementById("svg-container");

// Extract the first letter and remaining text
const firstLetter = quoteText.textContent.charAt(0);
const remainingText = quoteText.textContent.slice(1);
quoteText.textContent = remainingText; // Update the <p> to remove the first letter

// Create the SVG element dynamically
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("id", "first-letter-svg");
svg.setAttribute("viewBox", "0 0 200 200");

// Create the text element inside the SVG
const text = document.createElementNS(svgNS, "text");
text.setAttribute("id", "first-letter");
text.setAttribute("x", "10");
text.setAttribute("y", "150");
text.textContent = firstLetter; // Set the text content to the first letter

svg.appendChild(text);
svgContainer.appendChild(svg);

// Set the initial stroke-dasharray and stroke-dashoffset
text.style.strokeDasharray = 2000;
text.style.strokeDashoffset = 2000;

// Animate the stroke dashoffset to create the draw effect
text.animate([{ strokeDashoffset: 2000 }, { strokeDashoffset: 0 }], {
	duration: 7500, // Stroke draw duration in milliseconds
	delay: 500,
	easing: "ease-in-out",
	fill: "forwards"
});

// Animate the fill opacity after the stroke animation completes
text.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], {
	duration: 1000, // Fill fade-in duration in milliseconds
	delay: 3500, // Delay to start after stroke animation
	easing: "ease-in-out",
	fill: "forwards"
});
