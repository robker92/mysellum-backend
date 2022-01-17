export { userOfAge, getYearMonthDayFromIso, addLeadingZero };

/**
 * Checks if someone is of age (> 18 years old) for a provided birthdate.
 * @param {String} inputDate birthdate format: dd.mm.yyyy
 * @param {String} currentDateISO date in ISO format; use: new Date().new Date().toISOString()
 * @throws when invalid inputs are given
 * @returns
 */
function userOfAge(inputDate, currentDateISO) {
    if (/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/.test(inputDate) === false) {
        throw new Error('Wrong date format! Only the format dd.mm.yyyy is supported.');
    }

    const adultAge = 18;

    let currentDateArray = getYearMonthDayFromIso(currentDateISO);

    let inputYear = inputDate.slice(6, inputDate.length);
    let inputMonth = inputDate.slice(3, 5);
    let inputDay = inputDate.slice(0, 2);

    if (parseInt(currentDateArray[2]) - parseInt(inputYear) > adultAge) {
        return true;
    }

    if (parseInt(currentDateArray[2]) - parseInt(inputYear) === adultAge) {
        // Now we check on month level
        if (parseInt(currentDateArray[1]) < parseInt(inputMonth)) {
            //18th birthday did not happen and is not in the same month
            return false;
        }
        if (parseInt(currentDateArray[1]) > parseInt(inputMonth)) {
            //18th birthday already happened
            return true;
        }
        if (parseInt(currentDateArray[1]) === parseInt(inputMonth)) {
            // Now we check on day level
            if (parseInt(currentDateArray[0]) < parseInt(inputDay)) {
                //18th birthday did not happen yet
                return false;
            }
            if (parseInt(currentDateArray[1]) >= parseInt(inputMonth)) {
                //18th birthday already happened
                return true;
            }
        }
    }
    return false;
}

/**
 * Extracts the day month and year from a provided iso date
 * @param {String} currentDateISO input date
 * @throws when the provided date is not in iso format
 * @returns String Array: [day, month, year]
 */
function getYearMonthDayFromIso(currentDateISO) {
    if (!checkIfDateIsoFormat(currentDateISO)) {
        throw new Error('Wrong date format provided! ISO format is needed.');
    }

    const year = currentDateISO.slice(0, 4);
    const month = currentDateISO.slice(5, 7);
    const day = currentDateISO.slice(8, 10);

    return [day, month, year];
}

/**
 * Checks if a provided date string is a valid ISO format
 * @param {String} isoDate input date
 * @returns true when the date is in ISO format, false if not
 */
function checkIfDateIsoFormat(isoDate) {
    let parsedDate = new Date(Date.parse(isoDate));
    if (parsedDate.toISOString() === isoDate) {
        return true;
    }
    return false;
}

function addLeadingZero(value) {
    if (parseInt(value) < 10) {
        return `0${value}`;
    }
    return value.toString();
}
