BASE_TOKEN = "设置base的token";

BASE_DEALS_URL = "https://api.getbase.com/v2/deals";
BASE_CONTACTS_URL = "https://api.getbase.com/v2/contacts";
BASE_USERS_URL ="https://api.getbase.com/v2/users";

NEXT_PEOJECTS_URL = "http://hexiangyu.limijiaoyin.com/api/client-projects/";


//记录organizationIds为空的位置
positions = []

function getProjects(responseText){
    //过滤其他信息值获取items
    jsonObjectItems = responseText.items;

    allProjectDatas = {results : []};

    ownerIds = []
    contactIds = []
    organizationIds = []
    for (i=0; i<jsonObjectItems.length; i++){
        allProjectDatas.results[i] = {}
        dealData = {}
        project  = jsonObjectItems[i].data;

        ownerIds[i] = project['owner_id'] 
        contactIds[i] = project['contact_id'] 
        organizationIds[i] = project['organization_id']
        dealData = {
            id : project['id'],
            name : project['name'],
            tags : project['tags']
        }
        allProjectDatas.results[i].clientProject = dealData
    }

    organizationIdsTemp = organizationIds.slice(0)
    for (i=0; i<organizationIds.length; i++){
        if (organizationIds[i] == null){
            positions.push(i)
            // organizationIdsTemp.splice(i,1)
        }
    }

    clearNullArr(organizationIdsTemp)


    $.ajax({
        async: false, 
        type : "GET",
        url : BASE_CONTACTS_URL,
        data : {ids : organizationIdsTemp.join(',')},
        dataType : "json",
        headers : {
            "Accept" : "application/json",
            "Authorization" : "Bearer " + BASE_TOKEN
        },
        success : function(content){
            for (j=0; j<content['items'].length; j++){
                companyData = {};
                data = content['items'][j]['data'];
                companyData.id = data['id'];
                companyData.name = data['name'];
                companyData.tags = data['tags'];

                if (!isEmptyObject(data['custom_fields'])){
                    if ("Industry" in data['custom_fields']){
                        companyData.industry = data['custom_fields']['Industry'];
                    }
                    if ("Size" in data['custom_fields']){
                        companyData.size = data['custom_fields']['Size'];
                    }
                }else{
                    companyData.industry = "";
                    companyData.size = "";
                }

                indexArray = findElemIndex(companyData.id, organizationIds)
                for (i=0; i<indexArray.length; i++){
                    allProjectDatas.results[indexArray[i]].clientCompany = companyData;
                    // if (!('clientCompany' in allProjectDatas.results[indexArray[i]])){
                    //     allProjectDatas.results[indexArray[i]].clientCompany = companyData;
                    // }
                }
                // po = organizationIds.indexOf(companyData.id)
                // allProjectDatas.results[po].clientCompany = companyData
                
            }
            for (k=0; k<positions.length; k++){
                allProjectDatas.results[positions[k]].clientCompany = {};
                allProjectDatas.results[positions[k]].clientCompany.industry = "";
                allProjectDatas.results[positions[k]].clientCompany.size = "";
            }
        }
    });

    $.ajax({
        async: false, 
        type : "GET",
        url : BASE_CONTACTS_URL,
        data : {ids : contactIds.join(',')},
        dataType : "json",
        headers : {
            "Accept" : "application/json",
            "Authorization" : "Bearer " + BASE_TOKEN
        },
        success : function(content){
            for (j=0; j<content['items'].length; j++){
                clientData = {}
                data = content['items'][j]['data'];
                clientData.id = data['id'];
                clientData.name = data['name'];
                clientData.email = data['email'];
                clientData.tags = data['tags'];
                // allProjectDatas.results[i].clientContact = clientData;
                indexArray = findElemIndex(clientData.id, contactIds)
                for (i=0; i<indexArray.length; i++){
                    allProjectDatas.results[indexArray[i]].clientContact = clientData;
                }
            }
        }
    });

    $.ajax({
        async: false, 
        type : "GET",
        url : BASE_USERS_URL,
        data : {ids : ownerIds.join(',')},
        dataType : "json",
        headers : {
            "Accept" : "application/json",
            "Authorization" : "Bearer " + BASE_TOKEN
        },
        success : function(content){
            for (j=0; j<content['items'].length; j++){
                pmData = {}
                data = content['items'][j]['data'];
                pmData.id = data['id'];
                pmData.name = data['name'];
                pmData.email = data['email'];
                // allProjectDatas.results[i].pm = pmData
                indexArray = findElemIndex(pmData.id, ownerIds)
                for (i=0; i<indexArray.length; i++){
                    allProjectDatas.results[indexArray[i]].pm = pmData;
                }
            }
        }
    });


    allProjectDatas.total = allProjectDatas.results.length
    console.log(allProjectDatas)
    return allProjectDatas
}

function isEmptyObject(obj){
    for (x in obj){
        return false;
    }
    return true;
}

function clearNullArr(arr){ 
    for(var i=0,len=arr.length;i<len;i++){ 
        if(!arr[i] || arr[i]=='' || arr[i] === undefined){ 
            arr.splice(i,1); 
            len--; 
            i--; 
        } 
    } 
    return arr; 
}


function findElemIndex(elem, array){
    indexArray = []
    for (i=0; i<array.length; i++){
        if (elem == array[i]){
            indexArray.push(i)
        }
    }
    return indexArray;
} 


$("#btn-sync").click(function(){
    $("#btn-val").text("上传中...");
    $("#btn-sync").attr({"disabled":"disabled"});
    $.ajax({
        type : "GET",
        url : BASE_DEALS_URL,
        // data : {page : 1, per_page : 1},
        dataType : "json",
        headers : {
            "Accept" : "application/json",
            "Authorization" : "Bearer " + BASE_TOKEN
        },
        success : function(content){
            datas = JSON.stringify(getProjects(content));
            $.ajax({
                type : "POST",
                url : NEXT_PEOJECTS_URL,
                data : datas,
                dataType : "json",
                processData : false,
                success : function(data){
                    $("#btn-val").text("成功");
                    // $("#btn-sync").removeAttr("disabled");
                    $("#btn-sync").attr({"class":"btn btn-success"});
                },
                error : function(data){
                    $("#btn-val").text("失败");
                    $("#btn-sync").removeAttr("disabled");
                    $("#btn-sync").attr({"class":"btn btn-danger"});
                }
            });
        },
        error : function(data){
            $("#btn-val").text("失败");
            $("#btn-sync").removeAttr("disabled");
            $("#btn-sync").attr({"class":"btn btn-danger"});
        }
    });
});