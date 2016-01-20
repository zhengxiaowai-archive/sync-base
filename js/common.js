function isEmptyObject(obj) {
    for (x in obj) {
        return false;
    }
    return true;
}

function clearNullArr(arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (!arr[i] || arr[i] == '' || arr[i] === undefined) {
            arr.splice(i, 1);
            len--;
            i--;
        }
    }
    return arr;
}


function findElemIndex(elem, array) {
    indexArray = []
    for (i = 0; i < array.length; i++) {
        if (elem == array[i]) {
            indexArray.push(i)
        }
    }
    return indexArray;
}