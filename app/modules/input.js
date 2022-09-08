function eventListenerAdd(element, type){
    if(type === "alphabetic"){
        element.addEventListener('input', function(){
            inputControl.alphabeticInput(element)
        })
    } else if(type === "numeric"){
        element.addEventListener('input', function(){
            inputControl.numericInput(element)
        })
    }
}
function alphabeticInput(e){
    var value = e.target.value;
    e.target.value = value.charAt(0).toUpperCase() + value.slice(1); //first letter uppercase
    e.target.value = e.target.value.trim() //removes spaces
    e.target.value = e.target.value.replace(/[^A-Za-z]/g, ""); //replace numeric values
}

function numericInput(e){
    var value = e.value
    e.value = e.value.trim() //removes spaces
    e.value = value.replace(/\D+/g, "");
}

function alphaNumericInput(e){
    e.value = e.value.replace(/[^A-Za-z0-9]/g, "") //alphanumeric only accepted
}

function passwordInput(){
    
}

function emailInput(){

}

function inputClear(){

}

export { eventListenerAdd, alphaNumericInput, alphabeticInput, numericInput }