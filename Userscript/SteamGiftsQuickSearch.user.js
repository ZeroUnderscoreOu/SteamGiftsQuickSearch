// ==UserScript==
// @name        SteamGifts Quick Search
// @author      ZeroUnderscoreOu
// @version     1.1.0-beta
// @icon        https://raw.githubusercontent.com/ZeroUnderscoreOu/SteamGiftsQuickSearch/master/Logo128.png
// @namespace   https://github.com/ZeroUnderscoreOu/
// @include     *://store.steampowered.com/app/*
// @include     *://store.steampowered.com/sub/*
// @connect     steamgifts.com
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var AppName;
var CustomStyle = document.head.appendChild(document.createElement("Style")); // should add style element before inserting rules
var ButtonSG = document.createElement("A");
var TmpContainer = document.createDocumentFragment();
CustomStyle.type = "Text/CSS";
if (document.location.pathname.includes	("/sub/")) { // adding absent block
	let AppTitle = document.body.getElementsByClassName("page_title_area game_title_area")[0];
	CustomStyle.sheet.insertRule(
		".apphub_OtherSiteInfo {Position: Relative; Float: Right;}", // copying style from apphub.css
		CustomStyle.sheet.cssRules.length // inserting at the end
	);
	AppTitle.insertBefore(
		document.createElement("Div"),
		AppTitle.getElementsByClassName("pageheader")[0]
	).className = "apphub_OtherSiteInfo";
	AppName = document.body.getElementsByClassName("pageheader")[0].textContent; // title location depends on page
} else {
	AppName = document.body.getElementsByClassName("apphub_AppName")[0].textContent;
};
CustomStyle.sheet.insertRule(
	"A.SGButton .ico16 {Background-Image: URL(https://raw.githubusercontent.com/ZeroUnderscoreOu/ZeroDay/master/BackgroundIcons.png);}", // "?" symbol - loading; repeating SteamDB's button styling
	CustomStyle.sheet.cssRules.length
);
ButtonSG.className = "btnv6_blue_hoverfade btn_medium SGButton"; // SG button
ButtonSG.href = "https://www.steamgifts.com/giveaways/search?q=" + encodeURIComponent(AppName).replace(/%20/g,"+"); // webform encoding of spaces
ButtonSG.addEventListener("mousedown",ButtonSGClick,false); // additional functionality; click event works only with LMB
ButtonSG = ButtonSG.appendChild(document.createElement("Span"));
ButtonSG = ButtonSG.appendChild(document.createElement("Img"));
ButtonSG.className = "ico16";
ButtonSG.src = "https://raw.githubusercontent.com/ZeroUnderscoreOu/SteamGiftsQuickSearch/master/SteamGifts.png";
TmpContainer.appendChild(document.createTextNode(" "));
TmpContainer.appendChild(ButtonSG.parentElement.parentElement);
TmpContainer.appendChild(document.createTextNode(" "));
document.body.getElementsByClassName("apphub_OtherSiteInfo")[0].insertBefore(
	TmpContainer,
	document.body.getElementsByClassName("apphub_OtherSiteInfo")[0].firstChild
);
/*
var Request = new XMLHttpRequest();
Request.open("GET","https://www.steamgifts.com/bundle-games/search?q="+encodeURIComponent(AppName).replace(/%20/g,"+"));
Request.responseType = "document";
Request.addEventListener("load",RequestLoad,false);
Request.send();
*/
GM_xmlhttpRequest({
	method: "GET",
	url: "https://www.steamgifts.com/discussion/pJRbR/can-we-have-a-list-of-games-that-cannot-be-created-as-giveaway-unofficial-list-inside",
	timeout: 15 * 1000,
	onload: RequestLoadFree,
	onerror: function(Data) {
		console.error("SGQS - free list request error");
		ButtonSG.style["background-position"] = "-32px 0px"; // "!" symbol - error
	},
	ontimeout: function(Data) {
		console.error("SGQS - free list request timeout");
		ButtonSG.style["background-position"] = "-32px 0px"; // "!" symbol - error
	}
});

function ButtonSGClick(Event) {
	if (Event.button==1) {
		this.pathname = "/bundle-games/search";
	} else {
		this.pathname = "/giveaways/search";
	};
};

function RequestLoadFree(Data) {
	let ListStart = Data.responseText.indexOf("<ul>");
	let ListEnd = Data.responseText.indexOf("</ul>",ListStart); // both optimizing & avoiding unneeded lists
	var List = Data.responseText.substring(ListStart,ListEnd); // selecting the first found unatributed list
	if (List.match(/<li>.*<\/li>/g).includes("<li>"+AppName+"</li>")) { // it's easier to add tags to game name then to filter all unbracketed matches
		ButtonSG.style["background-position"] = "-64px 0px"; // "F" symbol - free
	} else {
		GM_xmlhttpRequest({
			method: "GET",
			url: "https://www.steamgifts.com/bundle-games/search?q=" + encodeURIComponent(AppName).replace(/%20/g,"+"),
			timeout: 15 * 1000,
			onload: RequestLoadBundle,
			onerror: function(Data) {
				console.error("SGQS - bundle list request error");
				ButtonSG.style["background-position"] = "-32px 0px"; // "!" symbol - error
			},
			ontimeout: function(Data) {
				console.error("SGQS - bundle list request timeout");
				ButtonSG.style["background-position"] = "-32px 0px"; // "!" symbol - error
			}
		});
	};
};

function RequestLoadBundle(Data) {
	/*
	[].some.call(Data.target.responseXML.getElementsByClassName("table__column__heading"),function(Match){
		if (Match.textContent==AppName) {
			ButtonSG.style["background-position"] = "-48px 0px";
			return true;
		};
	});
	*/
	var BundledHeading = /<p class="table__column__heading">(.*?)<\/p>/g;
	var BundledAppName = BundledHeading.exec(Data.responseText);
	while (BundledAppName!=null) {
		if (BundledAppName[1]==AppName) {
			ButtonSG.style["background-position"] = "-48px 0px"; // "B" symbol - bundled
			return BundledAppName[1]; // stopping the search
		};
		BundledAppName = BundledHeading.exec(Data.responseText);
	};
	ButtonSG.style["background-position"] = "-16px 0px"; // space symbol - OK; if search wasn't stopped
};