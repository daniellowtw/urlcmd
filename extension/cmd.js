 chrome.commands.onCommand.addListener(function(command) { 
    console.log("HIHI", command);
    chrome.tabs.create({url: chrome.extension.getURL('index.html')});

    // queryTabsAndShowPageActions()
 }); 

 function queryTabsAndShowPageActions() { 
     chrome.tabs.query( 
         queryInfoForAllTabs, 
         function(tabs) { 
             console.log("All tabs length: %s", tabs.length); 
             //Output tabs object to the console as a separate visual group 
             logTabs(tabs); 
             if(tabs.length > 0) { 
                 for(var i=0; i<tabs.length; i++) { 
                  console.log(tabs[i])
                 } 
             } 
         } 
     ); 
 } 

 var queryInfoForAllTabs = { 
     //"active":false,"currentWindow":true 
 }; 
 function logTabs(tabs) { 
     console.group("Tabs"); 
     console.log(tabs); 
     console.groupEnd("Tabs"); 
 } 