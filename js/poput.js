//记录organizationIds为空的位置
positions = []

BASE_TOKEN = localStorage.token;
NEXT_PEOJECTS_URL = localStorage.address;
BASE_DEALS_URL = "https://api.getbase.com/v2/deals";
BASE_CONTACTS_URL = "https://api.getbase.com/v2/contacts";
BASE_USERS_URL = "https://api.getbase.com/v2/users";


//设置保存的 address 和 token
if (!_.isUndefined(BASE_TOKEN)){
    inputTokenDom = $("#input-token");
    inputTokenDom.val(BASE_TOKEN);
    inputTokenDom.attr({"readOnly": "true"});

    btnTokenDom = $("#token");
    btnTokenDom.text("编辑");
    btnTokenDom.attr({"class": "btn btn-danger"});
}

if (!_.isUndefined(BASE_TOKEN)){
    inputAddressDom = $("#input-address");
    inputAddressDom.val(NEXT_PEOJECTS_URL);
    inputAddressDom.attr({"readOnly": "true"});

    btnAddressDom = $("#address");
    btnAddressDom.text("编辑");
    btnAddressDom.attr({"class": "btn btn-danger"});
}

function getProjects(responseText) {
    //过滤其他信息值获取items
    jsonObjectItems = responseText.items;

    allProjectDatas = {
        results: []
    };

    ownerIds = []
    contactIds = []
    organizationIds = []
    for (i = 0; i < jsonObjectItems.length; i++) {
        allProjectDatas.results[i] = {}
        dealData = {}
        project = jsonObjectItems[i].data;

        ownerIds[i] = project['owner_id']
        contactIds[i] = project['contact_id']
        organizationIds[i] = project['organization_id']
        dealData = {
            id: project['id'],
            name: project['name'],
            tags: project['tags']
        }
        allProjectDatas.results[i].clientProject = dealData
    }

    organizationIdsTemp = organizationIds.slice(0)
    for (i = 0; i < organizationIds.length; i++) {
        if (organizationIds[i] == null) {
            positions.push(i)
                // organizationIdsTemp.splice(i,1)
        }
    }

    clearNullArr(organizationIdsTemp)


    $.ajax({
        async: false,
        type: "GET",
        url: BASE_CONTACTS_URL,
        data: {
            ids: organizationIdsTemp.join(',')
        },
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + BASE_TOKEN
        },
        success: function(content) {
            for (j = 0; j < content['items'].length; j++) {
                companyData = {};
                data = content['items'][j]['data'];
                companyData.id = data['id'];
                companyData.name = data['name'];
                companyData.tags = data['tags'];

                if (!isEmptyObject(data['custom_fields'])) {
                    if ("Industry" in data['custom_fields']) {
                        companyData.industry = data['custom_fields']['Industry'];
                    }
                    if ("Size" in data['custom_fields']) {
                        companyData.size = data['custom_fields']['Size'];
                    }
                } else {
                    companyData.industry = "";
                    companyData.size = "";
                }

                indexArray = findElemIndex(companyData.id, organizationIds)
                for (i = 0; i < indexArray.length; i++) {
                    allProjectDatas.results[indexArray[i]].clientCompany = companyData;
                }
            }
            for (k = 0; k < positions.length; k++) {
                allProjectDatas.results[positions[k]].clientCompany = {};
                allProjectDatas.results[positions[k]].clientCompany.industry = "";
                allProjectDatas.results[positions[k]].clientCompany.size = "";
            }
        }
    });

    $.ajax({
        async: false,
        type: "GET",
        url: BASE_CONTACTS_URL,
        data: {
            ids: contactIds.join(',')
        },
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + BASE_TOKEN
        },
        success: function(content) {
            for (j = 0; j < content['items'].length; j++) {
                clientData = {}
                data = content['items'][j]['data'];
                clientData.id = data['id'];
                clientData.name = data['name'];
                clientData.email = data['email'];
                clientData.tags = data['tags'];
                // allProjectDatas.results[i].clientContact = clientData;
                indexArray = findElemIndex(clientData.id, contactIds)
                for (i = 0; i < indexArray.length; i++) {
                    allProjectDatas.results[indexArray[i]].clientContact = clientData;
                }
            }
        }
    });

    $.ajax({
        async: false,
        type: "GET",
        url: BASE_USERS_URL,
        data: {
            ids: ownerIds.join(',')
        },
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + BASE_TOKEN
        },
        success: function(content) {
            for (j = 0; j < content['items'].length; j++) {
                pmData = {}
                data = content['items'][j]['data'];
                pmData.id = data['id'];
                pmData.name = data['name'];
                pmData.email = data['email'];
                // allProjectDatas.results[i].pm = pmData
                indexArray = findElemIndex(pmData.id, ownerIds)
                for (i = 0; i < indexArray.length; i++) {
                    allProjectDatas.results[indexArray[i]].pm = pmData;
                }
            }
        }
    });


    allProjectDatas.total = allProjectDatas.results.length
    console.log(allProjectDatas)
    return allProjectDatas
}


$("#address").click(function() {
    var addressValue = document.getElementById("input-address").value;

    if ($(this).text() === "保存") {
        if (addressValue != "") {
            //改变样式
            $("#input-address").attr({
                "readOnly": "true"
            });
            $(this).text("编辑");
            $(this).attr({
                "class": "btn btn-danger"
            });
            //保存数据
             localStorage.address = addressValue;
        }
    } else {
        $("#input-address").removeAttr("readOnly");
        $(this).text("保存");
        $(this).attr({
            "class": "btn btn-success"
        });
    }
})

$("#token").click(function() {
    var tokenValue = document.getElementById("input-token").value;

    if ($(this).text() === "保存") {
        if (tokenValue != "") {
            //改变样式
            $("#input-token").attr({
                "readOnly": "true"
            });
            $(this).text("编辑");
            $(this).attr({
                "class": "btn btn-danger"
            });
            //保存数据
            localStorage.token = tokenValue;
        }
    } else {
        $("#input-token").removeAttr("readOnly");
        $(this).text("保存");
        $(this).attr({
            "class": "btn btn-success"
        });
    }
})


$("#btn-sync").click(function() {
    if (!(BASE_TOKEN  && NEXT_PEOJECTS_URL)) {
        return null;
    }

    $("#btn-val").text("上传中...");
    $("#btn-sync").attr({
        "disabled": "disabled"
    });
    $.ajax({
        type: "GET",
        url: BASE_DEALS_URL,
        data : {page : 1, per_page : 100, sort_by: 'created_at', stage_id:100908},
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + BASE_TOKEN
        },
        success: function(content) {
            datas = JSON.stringify(getProjects(content));
            $.ajax({
                type: "POST",
                url: NEXT_PEOJECTS_URL,
                data: datas,
                dataType: "json",
                processData: false,
                success: function(data) {
                    $("#btn-val").text("成功");
                    // $("#btn-sync").removeAttr("disabled");
                    $("#btn-sync").attr({
                        "class": "btn btn-success btn-primary btn-block"
                    });
                },
                error: function(data) {
                    $("#btn-val").text("失败");
                    $("#btn-sync").removeAttr("disabled");
                    $("#btn-sync").attr({
                        "class": "btn btn-danger btn-primary btn-block"
                    });
                }
            });
        },
        error: function(data) {
            $("#btn-val").text("失败");
            $("#btn-sync").removeAttr("disabled");
            $("#btn-sync").attr({
                "class": "btn btn-danger btn-primary btn-block"
            });
        }
    });
});

