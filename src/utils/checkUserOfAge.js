//birthdate format: dd.mm.yyyy
export function userOfAge(inputDate){
    if(/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/.test(inputDate) === false){
        throw new Error("Wrong date format!");
    }

    const adultAge = 18

    let currentDateArray = getYearMonthDayFromIso(new Date().toISOString());

    let inputYear = inputDate.slice(6, inputDate.length);
    let inputMonth = inputDate.slice(3, 5);
    let inputDay = inputDate.slice(0 ,2);

    if(parseInt(currentDateArray[2]) - parseInt(inputYear) > adultAge) {
        return true;
    }

    if(parseInt(currentDateArray[2]) - parseInt(inputYear) === adultAge) {
        // Now we check on month level
        if(parseInt(currentDateArray[1]) < parseInt(inputMonth)) {
            //18th birthday did not happen and is not in the same month
            return false;
        }
        if(parseInt(currentDateArray[1]) > parseInt(inputMonth)) {
            //18th birthday already happened
            return true;
        }
        if(parseInt(currentDateArray[1]) === parseInt(inputMonth)) {
            // Now we check on day level
            if(parseInt(currentDateArray[0]) < parseInt(inputDay)) {
                //18th birthday did not happen yet
                return false;
            }
            if(parseInt(currentDateArray[1]) >= parseInt(inputMonth)) {
                //18th birthday already happened
                return true;
            }
        }
    }
    return false;
}

function getYearMonthDayFromIso(currentDateISO) {
    if(!checkIfDateIsoFormat(currentDateISO)){
        throw new Error("Wrong date format!");
    }

    let currentYear = currentDateISO.slice(0,4);
    let currentMonth = currentDateISO.slice(5,7);
    let currentDay = currentDateISO.slice(8,10);

    return [currentDay, currentMonth, currentYear];
}

function checkIfDateIsoFormat(isoDate){
    let parsedDate = new Date(Date.parse(isoDate));
    if(parsedDate.toISOString() === isoDate) {
        return true;
    }
    return false;
}