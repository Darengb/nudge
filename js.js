// Weak Point: the character limit in the settings table is 1000, but elapsed will increase every day forever. TODO must eliminate old entries after saving them to the database somewhere to archive.. Currently will work for about 1 month.
/*
*   Wednesday : Free Yourself From the Web
*   //DONE REGISTRATION
*   //DONE CATEGORIES: get from ajax on load, select each category that  does not contain '.' in a sites array, replace categories with the one from ajax, then add each item from the sites array 
*   Put sites into default group
*   
*   when you log in it's already created a new nudge so never uses the one from the db
*/

// delete localstorage: while (localStorage.length) localStorage.removeItem(localStorage.key(0));
// for ( s in localStorage){if (s != 'nudge' && s != 'user'){delete localStorage[s];}}
nudgeDefault = {
    "groups" : {
        "addictions" : { 
            "categories" : ["Arts & Entertainment","News","Lifestyle"],
            "max" : 7200,
            "min" : 0,
            "elapsed" : [1,0]
        },
        "social media" : { 
            "categories" : ["Facebook","Twitter"],
            "max" : 7200,
            "min" : 0,
            "elapsed" : [1,0]
        }        
    },
    "categories" : ["Technology","Business","Lifestyle","Online Resources","Science","Arts & Entertainment","Games","Shopping","Sports","Adult","Twitter","Facebook","News","Career & Education","Health & Beauty"],
    "inspiration" : { 
        "list" : { 
            "Doing Outdoor Activities" : ["http://nudge.skim.me/images/outdoor.png","Whether you want to ride a bike, play a sport, take a walk, or have a picnic, we help you free up the time."],
            "Practicing a Hobby" : ["http://nudge.skim.me/images/hobby.png","Whether you want to learn a musical instrument, a new language, a sport, an art form, or anything else you can dream of, we help you free up the time."],
            "Being With Your Family" : ["http://nudge.skim.me/images/family.png","If you want to spend more quality time with your family, we will help you get there."],
            "Working Productively" : ["http://nudge.skim.me/images/working.png","If you want to get more work done productively and with focus, we will help you get there."],
            "Indoor Leisure" : ["http://nudge.skim.me/images/leisure.png","Whether you want to read a book, watch TV, play a game, or anything else, we help you free up the time."],
            "Socializing With People" : ["http://nudge.skim.me/images/social.png","Friends complaining about never seeing you... or have none? Maybe you think you are too busy to socialize much, but we can help you find the time."],
            "Other Things" : ["http://nudge.skim.me/images/other.png","You can imagine hundreds of things you would like to do, if only you had the time. We will help you get there."]
        },
        "goal" : "Practicing a Hobby"
    }       
}

nudge = nudgeDefault;

bar = { 
    ostate : 'closed',
    openSettings : function(){
        //var settingsurl = document.URL.replace("background.html","settings.html");
        chrome.tabs.create({
            url: 'http://nudge.skim.me/nudge/settings.html'
        });
    },
    warn : function(tab){
        chrome.tabs.executeScript(tab,{
            code: "$('#nudge #warning').show();"
        }); // inject the code onto the page
    },
      goalImage : function(){ var myGoal = nudge['inspiration']['goal']; return nudge['inspiration']['list'][myGoal][0];}

};

passive = {
    mode : false
}
function getDateStamp(){
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    datestamp =  month + '' +  day + '' +  year;
    return datestamp;
}
    
// get nudge object
if(localStorage['nudge'] !== undefined){
    nudge = JSON.parse ( localStorage["nudge"]);
} else {
    // get via AJAX
    elapsed = "elapsed"+getDateStamp();
 
    if(localStorage['user'] !== undefined){
        $.get("http://nudge.skim.me/nudge/api.php", {
            uid: localStorage['user'], 
            select: true
        },function(data){
            localStorage['nudge'] = data;
            nudge = JSON.parse (data);
        });
    } else { // if user is undefined, open settings tab
        bar.openSettings();

    }
}
// LEGACY UPDATE HACKS
if(nudge['inspiration'] == undefined){
nudge['inspiration'] = nudgeDefault['inspiration'];
}
nudgeDefault['groups'] = nudge['groups'];
nudgeDefault['inspiration']['goal'] = nudge['inspiration']['goal'];
for ( s in localStorage){if (s != 'user'){delete localStorage[s];}}
nudge = nudgeDefault;

// UPDATE NUDGE CATEGORIES 
$.get("http://nudge.skim.me/nudge/api.php", {
    categories: true
},function(data){           
    categories = JSON.parse(data);
    if(categories[1] !== undefined){
        for(category in nudge['categories']){
            //   if (nudge['categories'][category].indexOf(".") ==-1) {
            delete nudge['categories'][category];
        //   }
        } 
        nudge['categories'] = categories.concat(nudge['categories']);
        nudge['categories'] = nudge['categories'].filter(function(){
            return true;
        }); // remove null
    }
});     






        
setInterval(function(){
    // check isIdle or isActive with message listener
    addLine();
},1000);

setInterval(function(){

    $.get('http://nudge.skim.me/nudge/api.php?uid='+localStorage['user']+'&update='+encodeURIComponent(JSON.stringify(nudge))+'');

},60000);

function domain(url){
    base = String(url).split( '/' );
    base = base[2];
    base = base.replace('www.','');
    return base;
}

function getCat(url){ // this is the category of the site, such as news or politics
    for(category in nudge['categories']){
        if (nudge['categories'][category] == url){
            category = url;
            console.log(category);
            return getGroup(category); // if the url is a category (manually added site), stop here.
        }
    }

    if(localStorage[url] !== undefined){
        category = localStorage[url];
        console.log('2 '+category);
        return getGroup(category);;
    } else {
        $.get("http://nudge.skim.me/nudge/api.php", {
            getCat:url
        },function(data){
            localStorage[url] = data; 
            category = data;
            console.log('2 '+category);
            return getGroup(category);
        });
    //category = 'News';
    //have to deal with chrome:// pages
    }


}

function getGroup(cat){ // this is the group the user has place the category in, such as Addictions, Time Wasters, or Productive Stuff
    var thisGroup = false
    for(group in nudge['groups']){ // iterate through groups
        for(attr in nudge['groups'][group]){ // iterate through each item in the group, such as categories, max, min
            var len = nudge['groups'][group][attr].length
            for (var i=0; i<len; ++i) { // iterate through the categories
                if (i in nudge['groups'][group][attr]) {
                    var groupCat = nudge['groups'][group][attr][i];
                    if (groupCat == cat){ // test if the category is in this group
                        thisGroup = group; 
                    }
                }
            }

        }
    }
    return thisGroup // return the group
}
function addLine() {
    
    chrome.tabs.query({
        'active':true,
        'currentWindow': true
    }, function (tab){  

        var url = tab[0].url,        
        url = domain(url);

        
        var group = getCat(url);
        chrome.tabs.sendMessage(tab[0]['id'], {
            purpose: "checkPassive"
        }, function(response) {
            passive.mode = response.passive;
            console.log('p '+response.passive);
        });
        if(passive.mode){
            return false;
        }
        var datestamp = getDateStamp();

        if (group == false){
            bar['width'] = 0;
            bar['color'] = 'none';
            bar['height'] = 0;
            bar['settingsTop'] = 0;
            group = '<span class=gear>.</span>';
        } else {
            if(nudge['groups'][group]["elapsed"+datestamp] == undefined){
                nudge['groups'][group]["elapsed"+datestamp] = [1,0];
                console.log('yes');
            } else if (nudge['groups'][group]["elapsed"+datestamp][0] == undefined){
                nudge['groups'][group]["elapsed"+datestamp] = [1,0];
            }
            
            bar['width'] = Math.round((nudge['groups'][group]["elapsed"+datestamp][0] / nudge['groups'][group]["max"]) * 100); 
            if(bar['width'] < 71){
                bar['color'] = "RGB(24,194,108)";
            } else if (bar['width'] >70 && bar['width'] < 95) {
                bar['color'] = "RGB(254,213,20)";
            } else if (bar['width'] > 94){
                bar['color'] = "RGB(249,66,30)";
            } 
            bar['height'] = '2px';
            if((nudge['groups'][group]["elapsed"+datestamp][0] > nudge['groups'][group]["max"])){
                bar['height'] = '10px';
                bar['settingsTop'] = '10px';
                if( nudge['groups'][group]["elapsed"+datestamp][0] > nudge['groups'][group]["elapsed"+datestamp][1]){
                bar.warn(tab[0]['id']);
                }
            }
            // update the elapsed time      
            console.log('before:'+nudge['groups'][group]["elapsed"+datestamp][0]);
            nudge['groups'][group]["elapsed"+datestamp][0]++;
            console.log('after:'+nudge['groups'][group]["elapsed"+datestamp][0]);
            localStorage['nudge'] = JSON.stringify(nudge); // update localStorage
        }   
        
        // update the  active tab
        var inject = "var nudgeline = $('#nudgeline'); \n\
                                if(nudgeline.length > 0){ \n\
                                    $('#nudgeline').css({'width' : '"+bar['width']+"%', 'background' : '"+bar['color']+"', 'height' : '"+bar['height']+"'}).attr('data-nudge','"+JSON.stringify(nudge)+"').attr('data-user','"+localStorage['user']+"');$('#nudgesettings').css('top','"+bar['settingsTop']+"');\n\
                                     \n\
                                } else { \n\
                                    $('body').after('<div id=nudge class="+bar['ostate']+" data-passive=off style=display:none;><div id=warning><img src="+bar.goalImage()+" /><div id=wbuttons><div id=done><span style=text-transform:uppercase;>ALRIGHT! I&#39;M DONE WITH "+group+"! WAY TO GO!</span></div><div id=snooze><span>LET ME FINISH UP (10 more minutes)</span></div><div id=disable><span>I&#39;M HOOKED (no more warnings today)</span></div></div></div><div id=nudgesettings style=top:"+bar['settingsTop']+";><div id=groupname>"+group+"</div><img class=gear src=http://dev.skim.me/images/milkbrighttrans2.png></div><div id=nudgeline data-user="+localStorage['user']+">&nbsp;</div></div>');\n\
                                    $('#nudgeline').css({ 'width' : '"+bar['width']+"%', 'background' : '"+bar['color']+"', 'height' : '"+bar['height']+"'}); \n\
                                    initliz();\n\
                                }\n\
                               if(document.URL == 'http://nudge.skim.me/nudge/settings.html'){\n\
                                   settings.open();  \n\
                                }\n\
                        "; // create the code string to inject
    
        inject = inject.replace(/(\r\n|\n|\r)/gm,""); // remove line breaks
        chrome.tabs.executeScript(tab[0]['id'],{
            code:inject
        }); // inject the code onto the page
        
    });

}

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.purpose == "newNudge"){
      
            nudge = request.newNudge;
            nudge = request.newNudge;
          
            localStorage['nudge'] = JSON.stringify(nudge);     
            sendResponse({
                newNudge: nudge
            });
        } else if(request.purpose == "login") {
            var email = request.email,
            password = request.password;
            $.get('http://nudge.skim.me/nudge/api.php?email='+email+'&password='+password+'&login=true',function(resp){
                if(resp.id != 'bad'){
                    localStorage['user'] = resp.id;
                    if (resp.nudge != undefined) {
                        localStorage['nudge'] = resp.nudge;
                        nudge = JSON.parse(resp.nudge);
                        chrome.tabs.query({
                            'active':true,
                            'currentWindow': true
                        }, function (tab){  
                            chrome.tabs.reload(tab[0]['id'],function(){});
                            /*    chrome.tabs.executeScript(tab[0]['id'],{
            code: 'setTimeout(function(){$( "#motivationdialog" ).dialog( "open" );},2000);'
        });*/
                        });
                    }
                }
                // if resp.nudge != undefined
                sendResponse({
                    user: resp.id
                });
            },'json');
            return true;
                       
        } else if (request.purpose == "openSettings"){
            bar.openSettings();
        }
    });
    

/*


var $category = $( "#gallery" ),
      $trash = $( "#trash" );
 
    // let the gallery items be draggable
    $('.category').draggable({
      revert: "invalid", // when not dropped, the item will revert back to its initial position
      containment: "document",
      helper: "clone",
      cursor: "move"
    });
 
    // let the trash be droppable, accepting the gallery items
    $trash.droppable({
      accept: "#gallery > li",
      activeClass: "ui-state-highlight",
      drop: function( event, ui ) {
        deleteImage( ui.draggable );
      }
    });
 
    // let the gallery be droppable as well, accepting items from the trash
    $gallery.droppable({
      accept: "#trash li",
      activeClass: "custom-state-active",
      drop: function( event, ui ) {
        recycleImage( ui.draggable );
      }
    });

nudge = {"groups":{"addictions":{"categories":["News","Arts & Entertainment","Health & Beauty","Shopping"],"max":37200,"min":0,"elapsed":1,"elapsed3122013":3266,"elapsed3142013":7354,"elapsed3182013":7661,"elapsed3192013":9131,"elapsed3202013":4873,"elapsed3212013":7939,"elapsed3222013":14389,"elapsed3252013":2944,"elapsed3262013":7266,"elapsed3272013":6473,"elapsed3282013":0,"elapsed412013":4920,"elapsed422013":19775},"adult":{"categories":["Adult","Facebook"],"max":7200,"min":0,"elapsed":1}},"categories":["Technology","Business","Lifestyle","Online Resources","Science","Arts & Entertainment","Games","Shopping","Sports","Adult","Twitter","Facebook","News","Career & Education","Health & Beauty"]}
*/



function initialize() { // on initialize
    //var groups  = JSON.parse(localStorage['groups']); // use AJAX?
   

    //TODO  use ajax when storing settings and on initialize. Only use localstorage for storing times, except for every 30 minutes use  ajax for analytics purposes. 

    localStorage["storageType"] = "local";
    chrome.tabs.onSelectionChanged.addListener(function () {
        // addLine();
        });
    
    chrome.windows.onFocusChanged.addListener(function () {
        //   addLine();
        });

    chrome.tabs.onUpdated.addListener(function () {
        //  addLine();
        });

    chrome.browserAction.onClicked.addListener(function (tab) {
        /* sendStatistics(); */
        chrome.tabs.create({
            url: "http://nudge.skim.me/nudge/settings.html"
        });
    });
        
} // end on initialize

initialize();
    

    /*
     * add = function(integerA, objectB) {
    if (!map[objectB.type]) {
        map[objectB.type] = {};        
    }
    map[objectB.type][integerA] = objectB;
}

{"groups":{"addictions":{"categories":["News","Lifestyle","Arts & Entertainment"],"max":9000,"min":0,"elapsed":1,"elapsed3122013":3266,"elapsed3142013":7354,"elapsed3182013":7661,"elapsed3192013":9131,"elapsed3202013":4873,"elapsed3212013":7939,"elapsed3222013":14389,"elapsed3252013":2944,"elapsed3262013":7266,"elapsed3272013":6473,"elapsed3282013":0,"elapsed412013":4920,"elapsed422013":19775,"elapsed452013":2004,"elapsed482013":8714,"elapsed492013":29253},"social media":{"categories":["Facebook","Twitter"],"max":7200,"min":0}},"categories":["Technology","Business","Lifestyle","Utilities","Science","Arts & Entertainment","Games","Shopping","Sports","Adult","Twitter","Facebook","News","Career & Education","Health & Beauty"]}

     */
    