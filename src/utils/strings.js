export { addCharacterToString };

function addCharacterToString(string, char, position) {
    const result = string.slice(0, position) + char + string.slice(position);

    return result;
}
