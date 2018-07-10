// ==========================================================================
// String utils
// ==========================================================================

// Replace all occurances of a string in a string
export function replaceAll(input = '', find = '', replace = '') {
    return input.replace(
        new RegExp(find.toString().replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'), 'g'),
        replace.toString(),
    );
}

// Convert to title case
export function toTitleCase(input = '') {
    return input.toString().replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase());
}

// Convert string to pascalCase
export function toPascalCase(input = '') {
    let string = input.toString();

    // Convert kebab case
    string = replaceAll(string, '-', ' ');

    // Convert snake case
    string = replaceAll(string, '_', ' ');

    // Convert to title case
    string = toTitleCase(string);

    // Convert to pascal case
    return replaceAll(string, ' ', '');
}

// Convert string to pascalCase
export function toCamelCase(input = '') {
    let string = input.toString();

    // Convert to pascal case
    string = toPascalCase(string);

    // Convert first character to lowercase
    return string.charAt(0).toLowerCase() + string.slice(1);
}
