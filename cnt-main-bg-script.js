//    Copyright 2016 Ed Novak

//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.

//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

// This is the primary logic for the CNT app

//console.log("Some output from cnt-main-bg-script!");


// for debug purposes
//function dumpKeys(obj){
//	console.log("Dumping: " + obj)
//	for(var k in obj){
//		console.log(k + " " + obj[k]);
//	}
//}


// This opens the desired URL in a new tab
// This allows me to set active: true which puts
// the focus on the page (thankfully)
function focusWorkAround(tab){
	//console.log("focusworkAround running");
	//console.log("Tab URL in focusworkAround: " + tab.url);

	// This workaround puts the focus on the page (cause of the call to create) instead of in the URL bar
	browser.tabs.remove(tab.id);
	var creating = browser.tabs.create({"url":URL, "active":true});
	//console.log("recreated tab as workaround");
	/*
	// other focus option, deprecated
	if(focus_data.cnt_focus_pref == "focus_bar"){
		// This method leaves the focus in the URL bar
		browser.tabs.update(tab.id, {"url":url_data.cnt_url_pref});
	} 
	*/
}


// Callback for when new tabs are opened
// This causes an infinite loop in combination with the browser.tabs.create call above
// I avoid this infinite loop by using the stallpath as the trigger below
// The first time stall.index is opened (thanks to manifest) but then it is never opened again
function newTab(newTab){
	var tab = newTab;

	//console.log("New tab url: " + tab.url + " tab.id: " + tab.id);

	// We have to wait for it to load, then we can redirect, careful of _tab vs tab!
	browser.tabs.onUpdated.addListener(function(tabID, info, _tab){
		//console.log("_tab url: " + _tab.url)
		if( info.status == "complete" && _tab.url == stallPath ){
			// After tab has finished loading remove listener
			browser.tabs.onUpdated.removeListener(arguments.callee);
			focusWorkAround(_tab);
		}

		// I needed this to remove the listened in other cases where it completes loading
		// This block stops the duplicate tab problem
		if( info.status == "complete" ){
			browser.tabs.onUpdated.removeListener(arguments.callee);
		}
	});
}



const stallPath = browser.extension.getURL("stall.html")
//const indexPath = browser.extension.getURL("index.html");

// Set the URL prference
URL = "not yet set";
chrome.storage.local.get("cnt_url_pref", function(result){
	//console.log("got preference!!");
	URL = result["cnt_url_pref"];
	if(URL == undefined){
		URL = "about:newtab";
	}
	//console.log("URL set: " + URL)
});

// Listen for new tabs
browser.tabs.onCreated.addListener(newTab);



