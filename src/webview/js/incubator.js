//This source file is intended to include new experimental functionality
//when the functionality is solid, it can be moved to another more source file

//copies the selection choosen to the input text the user is working with
function useExpressionVariable(event)
{
    //append expression variable to input text
    event.parentNode.previousElementSibling.value += "${"+event.selectedOptions[0].text+"}"

    //fire event to update 3D activity
    event.parentNode.previousElementSibling.oninput()

    //reset to first (default) option ('use variable...')
    event.selectedIndex = 0
}

//returns a collection of simple variables defined on preceding activities.
//simple variables are variables you can use in the Camel simple language
function findExpressionVariables()
{
    //initialise to the preceding activity
    let activity = getPreviousActivity(getActiveActivity())

    //collection to return
    let variables = []

    //while not the end of the route
    while(activity)
    {
        let type = activity.getAttribute('processor-type')

        //if 'setter' found
        if(type == "header" || type == "property"){
        
            //we add to the collection in the format [type.var] (e.g. 'header.h1')
            variables.push(type+"."+activity.getElementsByTagName("a-text")[0].firstChild.getAttribute('value').slice(0, -1))
        }

        //look next
        activity = getPreviousActivity(activity)
    }

    return variables        
}

//includes the selection of expression variables in the HTML element given
function populateExpressionVariables(element)
{
    //obtain expression variables
    let vars = findExpressionVariables();

    //obtain the container with expression variables
    var select = document.getElementById("select-vars");

    //reset list
    select.options.length = 1;

    //include default expression variables (e.g. ${body})
    select.options[select.options.length] = new Option("body", 1);

    //move list to given element
    select.parentNode.removeChild(select)
    element.appendChild(select)
    
    //populate selection with expression variables found
    for(index in vars) {
        select.options[select.options.length] = new Option(vars[index], index);
    }
}