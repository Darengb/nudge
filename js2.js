
passive = {
    mode : function(){
        var pmode = $('#nudge').attr('data-passive');
        if(pmode == 'on'){
            return true;
        } else {
            return false;
        }
    },
    on : function(){ 
        $('#nudge').attr('data-passive','on');
    },
    off : function(){ 
        $('#nudge').attr('data-passive','off');
    },
    get : function(){
        return passive.mode;
    }
}   

var idle = new Idle();
idle.onAway = passive.on;
idle.onAwayBack = passive.off;
idle.setAwayTimeout(10000);




// sometimes this script stops running                   
/*     
setInterval(function(){
        var idle = new Idle();
			idle.onAway = passive.on;
			idle.onAwayBack = passive.off;
			idle.setAwayTimeout(30000);
},60000);     
*/
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.purpose == "checkPassive")

            sendResponse({
                passive: passive.mode()
            });
        console.log('sent '+passive.mode());
    }); 



/*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
var settingsHtml ="
<div class='categories'><div class='header'><span class='text1'>drag categories to a ngroup below</span>
<span class='texT2'>Then set how many minutes per day you want to spend on that ngroup, maximum</span>
  <div class='catbox'>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <div class='catbox'>
<span class='category'>Technology</span>
<span class='category'>Business</span>
<span class='category'>News</span>
<span class='category'>Lifestyle</span>
<span class='category'>Online Resources</span>
<span class='category'>Science</span>
<span class='category'>Arts & Entertainment</span>
<span class='category'>Health & Beauty</span>
<span class='category'>Career & Education</span>
<span class='category'>Games</span>
<span class='category'>Shopping</span>
<span class='category'>Sports</span>
<span class='category'>Adult</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
</div>
</div>

<div class='ngroup'>
<div class='header'><span class='text1'>addictions</span><input type='text' value='120' class='addictions max' ></div>
<div class='categories'>

</div>
<div class='text1'>add new group +</div>
</div>"; */
                            

var groups;
   
var settings = {
        
    create : function(){
        nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
        var catHTML = "";
        for(category in nudge['categories']){
            catHTML += "<span class='category'><div>&#092;</div><span>"+nudge['categories'][category]+"</span></span>";
        }
        var inspirationButtons = "";
        for(item in nudge['inspiration']['list']){
            var selected = '';
            if (item == nudge['inspiration']['goal']){
                selected = 'selected';
            }
            console.log(item);
            console.log(JSON.stringify(nudge));
            inspirationButtons +=    "<button type='button' class='ui-button motivation "+selected+"'><span class='ui-button-text'>"+item+"</span></button>"
            var myGoal = nudge['inspiration']['goal'], 
            goalIMG = nudge['inspiration']['list'][myGoal][0];
        }
        var html =  "<img src='http://nudge.skim.me/images/nudgebrighttrans.png' id='logo'><div class='categories'><div class='hrow'><div class='nheader'><span class='text1'>drag websites or categories to a group below</span><div class='text1 addsite'>add website <span>+</span></div></div><div class='text1 motivationbtn'><span class='text2'><span style='font-family:ModernPictograms;opacity: .;'>.</span> Motivation: "+nudge['inspiration']['goal']+" </span></div></div><div class='catbox'><div class='marrows'>&#223;</div>"+catHTML+"<img class='swlogo' src='http://nudge.skim.me/nudge/swlogo.png' /></div></div></div></div>             <div class='ngroup newgroup' id='footer'><div class='nheader'><span class='text1'>NEW GROUP</span><div class='text1 addgroup'>add group <span>+</span></div></div>         <div id='addgroupdialog' style='display:none;width:430px;' title='Add a New Group'><p style='float:left;'>Name</p><input type='text' id='name' name='name' value='' style='float:left;'> <div style='clear:both;'></div>  <p style='float:left;'>Max Time</p><div class='minutes'>minutes per day</div><input type='text' id='maximum' name='maximum' value='120' style='float:left;'></div>       <div id='addsitedialog' style='display:none;width:430px;' title='Add a New Group'><p style='float:left;'> Website URL</p><input type='text' id='url' name='url' value='pinterest.com' style='float:left;'> </div>        <div id='logindialog' style='display:none;width:430px;' title='Register/Login'><p style='float:left;'>Email</p><input type='email' id='email' name='email' value='' style='float:left;'> <div style='clear:both;'></div>  <p style='float:left;'>Password</p><input type='password' id='password' name='password' value='' style='float:left;'>       <div id='motivationdialog' style='display:none;width:430px;' title='Choose your Motivation'><div class='col1'><div class='text2'>What inspires you?</div>"+inspirationButtons+"</div><div class='col2'><img src='"+goalIMG+"' /><div class='text2'>I wish I had more time for:</div><div class='text1'>"+myGoal+"</div><div class='text3'>"+nudge['inspiration']['list'][myGoal][1]+"</div></div></div>        </div>";
        $('#nudgesettings').html(html);
    },
    get : function(e,callback){
        $('.ngroup.cat').remove();
        nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
        for(group in nudge['groups']){ // iterate through groups
            var maxMinutes = Math.round(nudge['groups'][group]['max'] / 60);
            var groupid = group.replace(/\s/g, '');
            $('.newgroup').before("<div class='ngroup cat' id='"+groupid+"'><div class='nheader'><span class='text1'>"+group+"</span><span class='minutes3'>spend</span><span class='minutes'>minutes</span><span class='minutes2'>maximum each day</span><span class='delete'>x</span><input type='text' value='"+maxMinutes+"' class='"+group+" max' id='max'></div><div class='marrows'>&#174;</div><div class='categories'></div>");
            for(cat in nudge['groups'][group]['categories']){
                $('#'+groupid+' .categories').append("<span class='category ui-draggable''><div>&#092;</div><span>"+nudge['groups'][group]['categories'][cat]+"</span></span>");
                $(".catbox span:contains('"+nudge['groups'][group]['categories'][cat]+"')").remove();
            }
        }
    }, 
    save : function(e,callback) { // saves the settings
        $('#nudge .ngroup.cat').each(function(){ // loop through settings groups
            var groupName = $(this).children('.nheader').children('.text1').text(),
            groupName = groupName.toLowerCase();
            if(!nudge['groups'][groupName]){
                nudge['groups'][groupName] = {};
            }
            nudge['groups'][groupName]['max'] = Math.round(parseInt($(this).find('.max').val()) * 60); // update max time
            var categories = [];
            $(this).children('.categories').find('.category span').each(function(){ // loop through  categories in group
                console.log('text is '+$(this).text());
                categories.push($(this).text());
                
            });
            console.log('categories is '+categories);
            nudge['groups'][groupName]['categories'] = categories; // update categories for group
        });
        chrome.extension.sendMessage({
            purpose: 'newNudge',
            newNudge: nudge
        }, function(response) {
            nudge = response.newNudge;
            $('#nudgeline').attr('data-nudge',JSON.stringify(nudge));
            console.log(nudge);
        });
        
    },        
    addGroup : function(groupName,maximum,minimum){
        nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
        var groupName = groupName.toLowerCase();
        nudge['groups'][groupName] = {
            categories : [], 
            max: maximum, 
            min: minimum
        };
        $('#nudgeline').attr('data-nudge',JSON.stringify(nudge));
        settings.get();
        settings.save();
    },
    deleteGroup : function(groupName){
        nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
        var groupName = groupName.toLowerCase();
        delete nudge['groups'][groupName];
        $('#nudgeline').attr('data-nudge',JSON.stringify(nudge));
        settings.create();
        settings.get();
        settings.save();
        initliz();
    },
    addSite : function(siteUrl){
        nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
        var siteUrl = siteUrl.toLowerCase();
        if ($.inArray(siteUrl,nudge['categories'])==-1)  nudge['categories'].push(siteUrl);
        $('#nudgeline').attr('data-nudge',JSON.stringify(nudge));
        settings.create();
        settings.get();
        settings.save();
    },
    login : function(email, password){
        chrome.extension.sendMessage({
            purpose: 'login',
            email: email,
            password: password
        }, function(response) {
            if(response.user == 'bad'){
                alert ('This email address was registered with a different password.');
            } else {
                $( '#logindialog' ).dialog( 'close' );
                $('#nudgeline').attr('data-user',response.user);
                initliz();
                $( '#motivationdialog' ).dialog('open');
            }
        });

    },
    open : function(){

        if($('#nudge.closed').length > 0 && $('#nudgeline').attr('data-nudge').length > 0) {                    

            $('#nudge').addClass('open');
            $('#nudge').removeClass('closed');
            nudge = JSON.parse($('#nudgeline').attr('data-nudge')); // get the most recent groups object
            settings.create();
            settings.get();
            if($('#nudgeline').attr('data-user') == "undefined"){
                settings.showMotivation = false;
                initliz();
                $( "#logindialog" ).dialog( "open" );
            } else {
                initliz();
                settings.showMotivation = false;                
            }
        }
    },
    showMotivation : true
}

function getDateStamp(){    
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    datestamp =  month + '' +  day + '' +  year;
    return datestamp;
}

$(document).on('click','#nudge.closed #nudgesettings, #nudge.closed #nudgeline',function(){
    chrome.extension.sendMessage({
        purpose: 'openSettings'
    }, function(response) { 
            
        });

});
$(document).on('click','#close',function(){
    $('#nudge').remove();
    $('body').show();
});
$(document).on('blur','#nudge .max',function(){
    settings.save();
});
 
 
$(document).on('click','#done',function(){
    $('#wbuttons').hide();    
});
$(document).on('click','#snooze',function(){
    nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
    var group = $('#groupname').text();
    group = group.toLowerCase();
    var datestamp = getDateStamp();
    nudge['groups'][group]["elapsed"+datestamp][1] = nudge['groups'][group]["elapsed"+datestamp][0] + 600;
    $('#nudgeline').attr('data-nudge',JSON.stringify(nudge));
    settings.save();    
    $('#nudge #warning').hide();
});
$(document).on('click','#disable',function(){
    nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
    var group = $('#groupname').text();
    group = group.toLowerCase();
    var datestamp = getDateStamp();
    nudge['groups'][group]["elapsed"+datestamp][1] = nudge['groups'][group]["elapsed"+datestamp][0] + 86400;
    $('#nudgeline').attr('data-nudge',JSON.stringify(nudge));
    settings.save();    
    $('#nudge #warning').hide();
});
 
function domain(url){
    base = url.replace('http://','');
    base = base.replace('https://','');
    base = base.replace('www.','');
    base = String(base).split( '/' );
    base = base[0];
    return base;
}
function initliz(){

    $('#nudge .category').draggable({ // for making categories draggable
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        cursor: "move",
        helper: 'clone',
        snap: 'true'
    });
    /******************/
    $('#nudgesettings').droppable({ // for dragging categories OUT of groups
        accept: "#nudge .category",
        activeClass: "highighted",
        greedy: "true",
        drop: function( event, ui ) {
            var $item = ui.draggable,
            thisCat = $item.children('span').text();

            $('.catbox').append("<span class='category new' style='font-size:0px;'><div>&#092;</div><span>"+thisCat+"</span></span>");
            $item.animate({
                fontSize : "0px"
            }, 500);
            $('.category.new').animate({
                fontSize : "14px"
            }, 500);
            setTimeout(function(){
                $(".category:contains('"+thisCat+"'):not('.new')").remove();
                $('.category.new').removeClass('new');

                initliz()
                setTimeout(function(){
                    settings.save();
                }, 500);
            },750);    
         
        }
            
    });

    /******************/

    $('#nudge .ngroup.cat').droppable({ // for dragging categories IN to groups
        accept: "#nudge .category",
        activeClass: "highighted",
        greedy: "true",
        drop: function( event, ui ) {
            var $item = ui.draggable,
            thisCat = $item.children('span').text();
            $(this).children(' .categories').append("<span class='category new' style='font-size:0px;'><div>&#092;</div><span>"+thisCat+"</span></span>");
            $item.animate({
                fontSize : "0px"
            }, 500);
            $('.category.new').animate({
                fontSize : "14px"
            }, 500);
            $('.category.new').removeClass('new');
            setTimeout(function(){
                $item.remove();
                settings.save();

                initliz()
            },750);

        }

    });

    /******************/

    $( '#addgroupdialog' ).dialog({ // Add New Group form
        autoOpen: false,
        height: 300,
        width: 600,
        modal: true,
        zIndex: 4000000000,
        buttons: {
            'ADD': function() {
                var   groupName = $('#addgroupdialog #name').val(),
                maximum = $('#addgroupdialog #maximum').val(),
                maximum = Math.round(maximum * 60);
                settings.addGroup(groupName,maximum,0);
                $( this ).dialog( 'close' );
                initliz();

            },
            Cancel: function() {
                $( this ).dialog( 'close' );
            }
        }
    });
    $( ".addgroup" )
    .button()
    .click(function() {
        $( "#addgroupdialog" ).dialog( "open" );
        $('body').show();
        tempName = 'Group ' + $('.ngroup.cat').length;
        $('#addgroupdialog #name').val(tempName);
    });

    /******************/
    $( '#addsitedialog' ).dialog({ // Add New Group form
        autoOpen: false,
        height: 300,
        width: 600,
        modal: true,
        zIndex: 4000000000,
        buttons: {
            'ADD': function() {
                var   siteUrl = $('#addsitedialog #url').val();
                siteUrl = domain(siteUrl);
                settings.addSite(siteUrl);
                $( this ).dialog( 'close' );
                initliz();

            },
            Cancel: function() {
                $( this ).dialog( 'close' );
            }
        }
    });
    $( ".addsite" )
    .button()
    .click(function() {
        $( "#addsitedialog" ).dialog( "open" );
        $('body').show();
        tempName = 'Group ' + $('.ngroup.cat').length;
        $('#addsitedialog #name').val(tempName);
    });

    /******************/
    $( '#logindialog' ).dialog({ // Add New Group form
        autoOpen: false,
        width: 400,
        modal: true,
        zIndex: 4000000000,
        dialogClass: 'nudge', 
        buttons: {
            'Continue': function() {
                var   email = $('#logindialog #email').val(),
                password = $('#logindialog #password').val();
                settings.login(email,password);
            }
        }
    });
        

    /******************/
    $( '#motivationdialog' ).dialog({ // Add New Group form
        autoOpen: settings.showMotivation,
        height: 300,
        width: 600,
        modal: true,
        zIndex: 4000000000,
        buttons: {
            'Close': function() {
                $( this ).dialog( 'close' );
            }
        }
    });
    $( ".motivationbtn" )
    .click(function() {
        $( "#motivationdialog" ).dialog( "open" );
    });        
                   

    /***********************/

    $('.ngroup.cat .delete').click(function(){
        var groupName = $(this).parents('.ngroup.cat').children('.nheader').children('.text1').text();
        settings.deleteGroup(groupName);

    }) // delete group
}
$(document).on('mouseover','.motivation',function(){
    nudge = JSON.parse($('#nudgeline').attr('data-nudge'));
    var thisGoal = $(this).text();
    nudge['inspiration']['goal'] = thisGoal;
    $('.col2 img').attr("src",nudge['inspiration']['list'][thisGoal][0]);
    $('.col2 .text1').text(thisGoal);
    $('.col2 .text3').text(nudge['inspiration']['list'][thisGoal][1]);
    $('button').removeClass('selected');
    $(this).addClass('selected')
});

$(document).on('click','.motivation',function(){
    $('#nudgeline').attr('data-nudge',JSON.stringify(nudge));
    settings.save();
    $('.motivationbtn .text2').html("<span style='font-family:ModernPictograms;opacity: .;'>.</span> Motivation: "+nudge['inspiration']['goal']+" </span>");
    $( '#motivationdialog' ).dialog('close');
});
$(document).ready(function(){
    document.body.onmousemove = function() {
        passive.off();
    }
});