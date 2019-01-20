/**
 
 Copyright 2016 Brian Donohue.
 
*/

'use strict';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
		 
//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = "Fall Creek";
    var speechOutput = "You can ask Fall Creek what's for lunch tomorrow";
    callback(session.attributes,
        buildSpeechletResponse(cardTitle, speechOutput, "", false));
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if(intentName == 'WhatsForLunchIntent') {
        handleWhatsForLunchRequest(intent, session, callback);
    }
    else if (intentName == "JustDateIntent") {
        handleWhatsForLunchRequest(intent, session, callback);
    }
    else if (intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent")
    {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard("OK.  Goodbye!", "", true));
    }
    else if (intentName == "AMAZON.HelpIntent")
    {
        var msg = "This skill is to provide more information for the Fall Creek neighborhood.  Right now, you can get the current school lunch menu.  For which day would you like to hear the menu? (For example, you can say today, or next Monday.)";
        
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(msg, "", false));
        
    }
    else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function handleWhatsForLunchRequest(intent, session, callback) {
    
    var date = intent.slots.Date.value;
  //  var menu = getLunchMenu(date);

    const datestr = formatDateToString(new Date(date));
    const url = 'https://webapis.schoolcafe.com/api/CalendarView/GetDailyMenuitems?SchoolId=ec3b8fd1-a985-41b8-996a-15d3e1dce111&ServingDate=' + datestr + '&ServingLine=TRADITIONAL%20SUPER%20STAR%20CAFE%20(PRE-K%20NO%20OVS)&MealType=Lunch';
    const fetch = require('node-fetch');

    fetch(url).then(function(response) {
        return response.json();
    }).then(function(body) {
        return parseMenuJson(body);
    }).then(function(menu) {
//        return mytext;
        var cardTitle = "Fall Creek";
        var msg = menu;
        
        callback(session.attributes,
            buildSpeechletResponse(cardTitle, msg, "", true));
    });    


}

function callSchoolCafeAPI(date) {
}


function getLunchMenu(date) {
    var jsonData = {"2018-02-15": "Cheeseburger  OR Hamburger , OR Pizza Cheese Sticks , Shredded Romaine , Marinara Sauce , Baked Beans , Oven Baked Fries , Fresh Orange Slices , Flavored Applesauce Cup , Catsup, Mustard, Salad Dressing ", "2018-02-16": "Chicken Nuggets , w/ Whole Wheat Roll , OR Grilled Cheese Sandwich , Seasoned Green Beans , Whipped Sweet Potatoes , Fresh Strawberries , Raisins , Catsup or BBQ Sauce ", "2018-02-12": "Crispy Chicken Sandwich , OR Beef Fiestada , w/ Mini Cornbread Loaf , Whole Kernel Corn , Refried Beans , Chilled Mixed Fruit , Fresh Apple Wedges , Catsup or BBQ Sauce,, Salad Dressing ", "2018-02-26": "Pepperoni Pizza Bites  OR, Beef Steak Fingers , Spinach Romaine Salad , Sweet Potato Fries , Fresh Apple Wedges , Chilled Mixed Fruit , Whole Grain Garlic Breadstick , Catsup , Whole Grain Brownie ", "2018-02-28": "Turkey Breast Steak  OR, Chicken Rings , Pacific Blend Vegetables , Mashed Potatoes , Fresh Grapefruit , Frozen Peach Cup , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce, Turkey Gravy ", "2018-02-11": "It's the weekend, get your own lunch!", "2018-02-27": "Fruit Plate w/ Yogurt, & Graham Crackers  OR, Pepperoni or Cheese Pizza , Seasoned Broccoli w/ Cheese , Fresh Baby Carrots , Fresh Strawberries , Raisins , Ranch Dressing ", "2018-02-07": "Beef Corn Chip Pie , OR, Chicken Rings , Malibu Blend Vegetables , Ranch Beans , \u201cFruit to Go\u201d Fruit Snack , Fresh Orange Slices , Whole Wheat Roll , Catsup or BBQ Sauce ", "2018-02-21": "BREAKFAST FOR LUNCH, Sausage, Cheese & Egg*, Breakfast Sandwich , (*egg is optional), OR French Toast Sticks , \u201cDragon\u201d Punch , Frozen Peach Cup , Fresh Orange Slices , Syrup ", "2018-02-22": "Cheeseburger , OR Hamburger , OR Pizza Munchable Kit , Shredded Romaine , Potato Puffs , Seasoned Pinto Beans , Fresh Banana , Chilled Pineapple Tidbits , Catsup, Mustard, Salad Dressing ", "2018-02-05": "Meatballs w/Penne Pasta , OR Chicken Nuggets , Glazed Carrots , Spinach Romaine Salad , Fresh Apple Wedges , Chilled Mixed Fruit , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce ", "2018-02-02": "Pizza Cheese Sticks , OR Mini Corn Dogs , Marinara Sauce , Malibu Blend Vegetables , Potato Puffs , Craisins , Fresh Orange Slices , Catsup, Mustard ", "2018-02-04": "It's the weekend, get your own lunch!", "2018-02-13": "Fruit Plate w/Yogurt &, Graham Crackers  OR, Chicken Rings , Spinach Romaine Salad , Mashed Potatoes , Fresh Banana , \u201cIce Dog\u201d Frozen Fruit Juice , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce, Beef Gravy ", "2018-02-09": "Turkey Hot Dog on Bun  OR, OR Macaroni & Cheese , w/Whole Wheat Roll , Sweet Potato Fries , Pacific Blend Vegetables , Frozen Peach Cup , Fresh Pear , Catsup, Mustard ", "2018-02-24": "It's the weekend, get your own lunch!", "2018-02-10": "It's the weekend, get your own lunch!", "2018-02-20": "Beef Nachos , OR Pizza Cheese Sticks , Marinara Sauce , Spinach Romaine Salad , Glazed Carrots , Fresh Grapefruit , \u201cFruit to Go\u201d Fruit Snack , Salsa ", "2018-02-08": "Cheeseburger  OR Hamburger , OR Pizza Munchable Kit , Shredded Romaine , Oven Baked Fries , Baked Beans , Fresh Apple Wedges , Chilled Pineapple Tidbits , Catsup, Mustard, Salad Dressing ", "2018-02-06": "Chef Salad w/ Boiled Egg, & Graham Crackers , OR Pepperoni Pizza Bites , Potato Puffs , Seasoned Broccoli w/ Cheese , Cherry Limeade \u201cEmoji\u201d Ice Cup , Fresh Banana , Whole Grain Chocolate Chip Cookie , Catsup ", "2018-02-14": "Pepperoni or Cheese Pizza , OR Baked Potato w/ Cheese , w/ Whole Grain Biscuit , Glazed Carrots , Steamed Spinach , Chilled Pineapple Tidbits , Fresh Grapefruit , Sour Cream, Margarine , Cherry Vanilla Swirl, Ice Cream Cup ", "2018-02-19": "Sweet & Sour Chicken , OR Chicken Nuggets , Whole Kernel Corn , Fresh Broccoli/Carrot Cup , Chilled Mixed Fruit , Fresh Apple Wedges , Whole Grain Brown Rice , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce,, Ranch Dressing Dip Cup ", "2018-02-23": "Breaded Chicken Drumstick , OR Fish Nuggets , Mashed Potatoes , Pacific Blend Vegetables , Fresh Pear , Flavored Applesauce Cup , Whole Grain Biscuit , Catsup, Beef Gravy , HELP US CELEBRATE, FEBRUARY BIRTHDAYS!, \u201cHappy Birthday\u201d, Chocolate Cupcake ", "2018-02-17": "It's the weekend, get your own lunch!", "2018-02-03": "It's the weekend, get your own lunch!", "2018-02-01": "Cheeseburger , OR Hamburger , OR Cheese Quesadillas , Shredded Romaine , Oven Baked Fries , Seasoned Pinto Beans , Fresh Banana , Pineapple Tidbits , Catsup, Mustard, Salad Dressing , Salsa ", "2018-02-18": "It's the weekend, get your own lunch!", "2018-02-25": "It's the weekend, get your own lunch!"};
    var menuData = ['Cheeseburger , OR Hamburger , OR Cheese Quesadillas , Shredded Romaine , Oven Baked Fries , Seasoned Pinto Beans , Fresh Banana , Pineapple Tidbits , Catsup, Mustard, Salad Dressing , Salsa ', 'Pizza Cheese Sticks , OR Mini Corn Dogs , Marinara Sauce , Malibu Blend Vegetables , Potato Puffs , Craisins , Fresh Orange Slices , Catsup, Mustard ', 'Meatballs w/Penne Pasta , OR Chicken Nuggets , Glazed Carrots , Spinach Romaine Salad , Fresh Apple Wedges , Chilled Mixed Fruit , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce ', 'Chef Salad w/ Boiled Egg, & Graham Crackers , OR Pepperoni Pizza Bites , Potato Puffs , Seasoned Broccoli w/ Cheese , Cherry Limeade \u201cEmoji\u201d Ice Cup , Fresh Banana , Whole Grain Chocolate Chip Cookie , Catsup ', 'Beef Corn Chip Pie , OR, Chicken Rings , Malibu Blend Vegetables , Ranch Beans , \u201cFruit to Go\u201d Fruit Snack , Fresh Orange Slices , Whole Wheat Roll , Catsup or BBQ Sauce ', 'Cheeseburger  OR Hamburger , OR Pizza Munchable Kit , Shredded Romaine , Oven Baked Fries , Baked Beans , Fresh Apple Wedges , Chilled Pineapple Tidbits , Catsup, Mustard, Salad Dressing ', 'Turkey Hot Dog on Bun  OR, OR Macaroni & Cheese , w/Whole Wheat Roll , Sweet Potato Fries , Pacific Blend Vegetables , Frozen Peach Cup , Fresh Pear , Catsup, Mustard ', 'Crispy Chicken Sandwich , OR Beef Fiestada , w/ Mini Cornbread Loaf , Whole Kernel Corn , Refried Beans , Chilled Mixed Fruit , Fresh Apple Wedges , Catsup or BBQ Sauce,, Salad Dressing ', 'Fruit Plate w/Yogurt &, Graham Crackers  OR, Chicken Rings , Spinach Romaine Salad , Mashed Potatoes , Fresh Banana , \u201cIce Dog\u201d Frozen Fruit Juice , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce, Beef Gravy ', 'Pepperoni or Cheese Pizza , OR Baked Potato w/ Cheese , w/ Whole Grain Biscuit , Glazed Carrots , Steamed Spinach , Chilled Pineapple Tidbits , Fresh Grapefruit , Sour Cream, Margarine , Cherry Vanilla Swirl, Ice Cream Cup ', 'Cheeseburger  OR Hamburger , OR Pizza Cheese Sticks , Shredded Romaine , Marinara Sauce , Baked Beans , Oven Baked Fries , Fresh Orange Slices , Flavored Applesauce Cup , Catsup, Mustard, Salad Dressing ', 'Chicken Nuggets , w/ Whole Wheat Roll , OR Grilled Cheese Sandwich , Seasoned Green Beans , Whipped Sweet Potatoes , Fresh Strawberries , Raisins , Catsup or BBQ Sauce ', 'Sweet & Sour Chicken , OR Chicken Nuggets , Whole Kernel Corn , Fresh Broccoli/Carrot Cup , Chilled Mixed Fruit , Fresh Apple Wedges , Whole Grain Brown Rice , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce,, Ranch Dressing Dip Cup ', 'Beef Nachos , OR Pizza Cheese Sticks , Marinara Sauce , Spinach Romaine Salad , Glazed Carrots , Fresh Grapefruit , \u201cFruit to Go\u201d Fruit Snack , Salsa ', 'BREAKFAST FOR LUNCH, Sausage, Cheese & Egg*, Breakfast Sandwich , (*egg is optional), OR French Toast Sticks , \u201cDragon\u201d Punch , Frozen Peach Cup , Fresh Orange Slices , Syrup ', 'Cheeseburger , OR Hamburger , OR Pizza Munchable Kit , Shredded Romaine , Potato Puffs , Seasoned Pinto Beans , Fresh Banana , Chilled Pineapple Tidbits , Catsup, Mustard, Salad Dressing ', 'Breaded Chicken Drumstick , OR Fish Nuggets , Mashed Potatoes , Pacific Blend Vegetables , Fresh Pear , Flavored Applesauce Cup , Whole Grain Biscuit , Catsup, Beef Gravy , HELP US CELEBRATE, FEBRUARY BIRTHDAYS!, \u201cHappy Birthday\u201d, Chocolate Cupcake ', 'Pepperoni Pizza Bites  OR, Beef Steak Fingers , Spinach Romaine Salad , Sweet Potato Fries , Fresh Apple Wedges , Chilled Mixed Fruit , Whole Grain Garlic Breadstick , Catsup , Whole Grain Brownie ', 'Fruit Plate w/ Yogurt, & Graham Crackers  OR, Pepperoni or Cheese Pizza , Seasoned Broccoli w/ Cheese , Fresh Baby Carrots , Fresh Strawberries , Raisins , Ranch Dressing ', 'Turkey Breast Steak  OR, Chicken Rings , Pacific Blend Vegetables , Mashed Potatoes , Fresh Grapefruit , Frozen Peach Cup , Whole Grain Garlic Breadstick , Catsup or BBQ Sauce, Turkey Gravy ', 'Updated 1-18-18', 'Elementary School Lunch Menu', 'MEAL PRICES:, Student Breakfast: $1.40, Reduced: $0.30, Student Lunch: $2.25, Reduced: $0.40', '1'];


     var menu = "";
    menu += callSchoolCafeAPI(date);

     if (date in jsonData){
         menu =  "Here's the school lunch menu for " + date + ": " + jsonData[date];
     }
     else {
         menu = "Sorry, I don't have the menu for " + date + " yet.  Please try again another time.";    
     }

     return menu;
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
    
}

// Convert Date object to string needed for API call
function formatDateToString(date){
    // 01, 02, 03, ... 29, 30, 31
    var dd = (date.getDate() < 10 ? '0' : '') + date.getDate();
    // 01, 02, 03, ... 10, 11, 12
    var MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
    // 1970, 1971, ... 2015, 2016, ...
    var yyyy = date.getFullYear();
 
    // create the format you want
    return (MM + "%2F" + dd + "%2F" + yyyy);
 }

 // Parse the JSON object of the menu returned from the API call
function parseMenuJson(menu) {

    var retStr = "For the entree: ";

        retStr += getElements(menu["ENTREE"]);            

        if ("FRUIT" in menu) {
            retStr += ", For fruit: ";
            retStr += getElements(menu["FRUIT"]);
        }

        if ("VEGETABLE" in menu) {
            retStr += ", For veggies: ";
            retStr += getElements(menu["VEGETABLE"]);
        }
        
        if ("WG SIDE" in menu) {
            retStr += getElements(menu["WG SIDE"]);
        }

        if ("WG DESSERT" in menu) {
            retStr += getElements(menu["WG DESSERT"]);
        }
        
    return retStr;
}

// Retrieve elements from the object
function getElements(arr) {
    var retStr = "";

    arr.forEach(element => {
        var tmp = cleanup(element.MenuItemDescription);
        retStr += tmp + ", ";
    })

    return retStr;
}

// Cleanup by removing (S), (W), (G), ELEM from the text        
function cleanup(str) {
    return str.replace(/\(S\)|\(W\)|\(G\)| ELEM|/gi, '');    
}



