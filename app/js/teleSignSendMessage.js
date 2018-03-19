var mobNum;
var str;
var s;
var i = 0;
var j;
var variable = 0;
var resp;
var txt;
var tab;
var templateSelected = 0;
recepients = [];
updates = [];
names = [];
utils={};

$(document).ready(function() {
    ZOHO.embeddedApp.on("PageLoad", function(data) {
        $('#loading').show();
		console.log(data);
var count=0;
utils.n=0;
        tab = "";
        for (var id in data.EntityId) {
			if(data.Entity == "Accounts"){
				ZOHO.CRM.API.getRelatedRecords({Entity:data.Entity,RecordID:data.EntityId[id],RelatedList:"Contacts"})
					.then(function(data){					
						console.log(data);                    
						for(var id in data){							
								utils.n++;
								names.push(data[id].Full_Name);
								recepients.push({
									"data": data[id]
								});

								if(utils.n<=6)
								{
									tab='<li class="conlist" id="'+data[id].id+'"><span style="color:#222;">'+data[id].Full_Name+'</span><span class="ConText" onclick="deleteRow(this.id,this.parentNode.id)" id="'+count+'"></span></li>';
									count++;									
								}
								else
								{									
									tab='<li class="hidden" style="display: none;" id="'+data[id].id+'"><span style="color:#222;">'+data[id].Full_Name+'</span><span class="ConText" onclick="deleteRow(this.id,this.parentNode.id)" id="'+count+'"></span></li>'
									count++;								

								}
								if(id>=9)
								{
									tab+="</div>"
								}
								document.getElementById("recipientsList").innerHTML += tab;								
						}						
					})
			}
			else {
            ZOHO.CRM.API.getRecord({                    
					Entity: data.Entity,
                    RecordID: data.EntityId[id]
                })
                .then(function(data) {
				console.log(data);
                   utils.n++;
                    names.push(data.Full_Name);
                    recepients.push({
                        "data": data
                    });

                    if(utils.n<=6)
                    {
                        tab='<li class="conlist" id="'+data.id+'"><span style="color:#222;">'+data.Full_Name+'</span><span class="ConText" onclick="deleteRow(this.id,this.parentNode.id)" id="'+count+'"></span></li>';
                        count++;
                        return tab;
                    }
                    else
                    {
                        
                        tab='<li class="hidden" style="display: none;" id="'+data.id+'"><span style="color:#222;">'+data.Full_Name+'</span><span class="ConText" onclick="deleteRow(this.id,this.parentNode.id)" id="'+count+'"></span></li>'
                        count++;
                        return tab;

                    }
                    
                }).then(function(tab) {
                    if(id>=9)
                    {
                        tab+="</div>"
                    }
                    document.getElementById("recipientsList").innerHTML += tab;
                })
				}
        }
        
    })

    ZOHO.embeddedApp.init().then(function() {}).then(function() {
        var action=1;
$('a').click(function(){
    if(action==1)
    {
    $(this).text('-View Less')
    $(".hidden").toggle('slow');
    action=2;
}
else if(action==2){
    $(this).text('+View More')
    $(".hidden").toggle('slow');
    action=1;
}
})
        ZOHO.CRM.META.API.getFields({
            "Entity": "Contacts"
        }).then(function(data) {
            var fieldsrc = $("#fieldsList").html(); //get contents of field
            var fieldTemplate = Handlebars.compile(fieldsrc); //convert to template using Handlebars.compile()
            var html = fieldTemplate(data); //getting the html
            $("#fieldnames").html(html); //rendering it
        });
    }).then(function() {
        ZOHO.CRM.CONFIG.getOrgVariable("telesignsms.tscustomerId").then(function(data) {
            utils.accntSID = data.Success.Content;
        }).then(function() {
            ZOHO.CRM.CONFIG.getOrgVariable("telesignsms.tsapikey").then(function(data) {
                utils.auth = data.Success.Content;
                str = utils.accntSID + ":" + utils.auth;
                utils.encodedAuth = btoa(str);

            //}) For SMS Templates
			}).then(function() {			
                ZOHO.CRM.API.getAllRecords({
                        Entity: "telesignsms.SMS_Templates",
                        sort_order: "desc"
                    })
                    .then(function(data) {
                            s = {
                                "obj": data
                            };
                           if(data.status==204){
                            document.getElementById("templist").innerHTML=' <select id="temp" class="fldtype1"><option id="none">--None--</option></select>'
                            $('#loading').hide();  
                           }
                           else
                           {
                            var tempSrc = $('#templates').html();
                            var tempTemplate = Handlebars.compile(tempSrc);
                            var temphtml = tempTemplate(s);
                            $("#templist").html(temphtml);
                          $('#loading').hide();
                          }  
                    })
            })
			
			
        })
    })

});
function back()
{
    $('#loading').show();
    $('#create').hide();
    $('#getTemp').show();
    ZOHO.CRM.API.getAllRecords({
                        Entity: "telesignsms.SMS_Templates",
                        sort_order: "desc"
                    })
                    .then(function(data) {
                        if (data.status == 204) {
                            $('#listTemplatesDiv').hide();
                        } else {
                            s = {
                                "obj": data
                            };
                            var tempSrc = $('#templates').html();
                            var tempTemplate = Handlebars.compile(tempSrc);
                            var temphtml = tempTemplate(s);
                            $("#templist").html(temphtml);
                            ZOHO.CRM.API.getRecord({
            Entity: "telesignsms.SMS_Templates",
            RecordID: data[0].id
        })
        .then(function(data) {
            document.getElementById("temp").options[1].selected=true;
           txt = (data["telesignsms.Template_content"]);
            document.getElementById("msgTxt").innerHTML = txt;
            templateSelected = 1;
            $('#loading').hide();
        })
                        }
                    })

}

function deleteRow(i,id) {
    var x=parseInt(i)
    if(recepients.length==1){
        document.getElementsByClassName("viewmore-div")[0].style.borderTopColor="#ff0000";
        $("#recp").show();
    }
    else
    {
for(var k in recepients)
{
    if(recepients[k].data.id==id)
    {
        console.log(recepients[k].data.Full_Name)
    recepients.splice(k, 1);
    $('#'+id).remove();
}
}
if(recepients.length>=6){
    document.getElementById(recepients[5].data.id).style.display="block";
     $("#"+recepients[5].data.id).removeClass('hidden').addClass('conlist');
}
}
}
function addField() {
    document.getElementById("templateTxt").value += "$(" + document.getElementById("selectOption").value + ")";
}

function update() {
   
    template = {};
    template.name = document.getElementById("templateName").value
    template.content = document.getElementById("templateTxt").value
    if(template.name==""){
        document.getElementById("templateName").style.borderBottomColor="#ff0000";
        $("#tempNameEmptyDiv").show();
    }
    else if (template.content=="")
{
   document.getElementById("templateTxt").style.borderColor="#ff0000"; 
   $("#templateEmptyAlert").show();
}

    if(template.name!=""&&template.content!="")
    {
         $('#loading').show();
        var recordData = {
            "telesignsms.CustomModule1_Name": template.name,
            "telesignsms.Template_content": template.content
        }
        ZOHO.CRM.API.insertRecord({
                Entity: "telesignsms.SMS_Templates",
                APIData: recordData
            })
            .then(function(data) {
                $('#loading').hide();
                $('#successMsg').show();
    setTimeout('$("#successMsg").hide()',2000);
                return back();
                 
            });
    }
}

function addTemp() {
    $('#getTemp').hide();
    $('#create').show();
     document.getElementById("templateName").value = "";
                document.getElementById("templateTxt").value = "";
               document.getElementById("selectOption").options[0].selected=true;
               document.getElementById("templateName").style.borderBottomColor="#444";
               $("#tempNameEmptyDiv").hide();
                  document.getElementById("templateTxt").style.borderColor="rgb(206, 206, 206)"; 
$("#templateEmptyAlert").hide();
}

function listTemplates() {
    $('#loading').show();
    var selectedTemplate = document.getElementById("temp").value;
    var ind = document.getElementById("temp").selectedIndex;
    utils.id = document.getElementById("temp").getElementsByTagName("option")[ind].value;
    var b;
    if (selectedTemplate == "--None--") {
        document.getElementById("msgTxt").innerHTML = "";
		$('#loading').hide();
    } else{
		ZOHO.CRM.API.getRecord({
				Entity: "telesignsms.SMS_Templates",
				RecordID: utils.id
			})
			.then(function(data) {
				$('#loading').hide();
			   txt = (data["telesignsms.Template_content"]);
				document.getElementById("msgTxt").innerHTML = txt;
				templateSelected = 1;
			})
	}

}

function skip() {
    $("#create").hide();
    $("#getTemp").show();
}

function sendsms() {

    /*
     * get all dynamic placeholders
     */
     console.log(recepients)
     
    var msgContent = document.getElementById("msgTxt").value;
    var fields = [];
    var promises = [];
    var messages = [];
    var fieldRegex = /\$\((\w*)\)/g;
    //var frmNo = document.getElementById("toNumber").value;
    if(msgContent!="")
    {
        do {


        var match = fieldRegex.exec(msgContent);
        if (match) {
            fields.push(match[1]);
        }

    } while (match);
    /*
     * loop through all message recipients and send sms
     */

    if (recepients) {
        $('#loading').show();
        for (var i in recepients) {
            var message = generatePersonalMessage(msgContent, fields, recepients[i]);
            messages.push(message);

            request = {
                url: "https://rest-ww.telesign.com/v1/messaging",
                params: {
					message_type : "ARN",
                    phone_number: recepients[i].data.Mobile,
                    message: message
                },
                headers: {
                    Authorization: "Basic " + utils.encodedAuth,
                }
            }
            promise = sendMessage(request);
            promises.push(promise);
        }
        
        Promise.all(promises)
            .then(function(data) {
                //return showReport(data, messages, frmNo)
				return showReport(data, messages)
            });
    }
}
else
{
   document.getElementById("msgTxt").style.borderColor="#ff0000"; 
   $("#msgEmptyAlert").show();
}
}

function generatePersonalMessage(message, fields, record) {

    for (var index in fields) {
        var replaceStr = record.data[fields[index]];
        if (fields[index] == "Owner") {
            replaceStr = record.data[fields[index]].name;
        }
        message = message.replace("$(" + fields[index] + ")", replaceStr);
    }
    return message;
}

function sendMessage(reqBody) {	
	var promise = $.ajax({
	  type: "POST",
	  url: reqBody.url,
	  data: reqBody.params,
	  headers:reqBody.headers,
	  success: function(res) {
		//console.log(res);
		return res;
	  }	  
	});
    /*var promise = ZOHO.CRM.HTTP.post(reqBody)
        .then(function(data) {		
            return data;
        });*/
	console.log(promise);
    return promise;
}

//function showReport(data, messages, frmNo) {
function showReport(data, messages) {
    var status;
    var statusRep = [];	
	console.log(recepients);
    for (var index in recepients) {console.log(index);
	debugger;
        //response = JSON.parse(data[index])
		response = data[index]
		console.log(response);		
        if (response.status.code != 290) {
            status = response.status.description;
        } else {
            status = response.status.description;
        }
        statusRep.push({
            Name: recepients[index].data.Full_Name,
            Mobile: recepients[index].data.Mobile,
            Status: status			
        })

        var recData = {
            "telesignsms.CustomModule2_Name": recepients[index].data.Full_Name,
            "telesignsms.Message_sent": messages[index],
            "telesignsms.Status": status,
            //"message360sruthy.Sent_From": frmNo,
            "telesignsms.Contact_Name": recepients[index].data.id,
            "telesignsms.Template_used":utils.id,
			"telesignsms.TeleSign_Reference_Id": response.reference_id
        }
        ZOHO.CRM.API.insertRecord({
            Entity: "telesignsms.TeleSign_SMS_History",
            APIData: recData
        }).then(function(data) {
        });

    }
    var report = $('#reportScript').html();
    var reportTemplate = Handlebars.compile(report);
    $("#statusReport").html(reportTemplate({
        data: statusRep
    }));
    $("#getTemp").hide();
    $("#report").show();
    $('#loading').hide();
}
function updateOrgVariable(authVar)
{
    if(authVar=="accntSID")
    {
        var newAccntSid=document.getElementById("modifiedAccntSid").value;
        parameterMap={"apiname":"message360sruthy.accSID","value":newAccntSid};
        ZOHO.CRM.CONNECTOR.invokeAPI("crm.set",parameterMap)
.then(function(data){
})
document.getElementById("acSID").innerHTML="<b>Account SID:</b>"+newAccntSid;
    }
    if(authVar=="auth")
    {
        var newAuth=document.getElementById("modifiedAuth").value;
        parameterMap={"apiname":"message360sruthy.authToken","value":newAuth};
        ZOHO.CRM.CONNECTOR.invokeAPI("crm.set",parameterMap)
.then(function(data){
})
document.getElementById("authToken").innerHTML="<b>Auth Token:</b>"+newAuth;
    }
}
function closePopUp(toReload) {
    if (toReload) {
        return ZOHO.CRM.UI.Popup.closeReload();
    } else {
        return ZOHO.CRM.UI.Popup.close();
    }

}