"use strict";

/**
 * Переводит первый символ в верхний регистр.
 * @param {String} s
 * @returns {string}
 */
module.exports = function ucfirst( s ) {
    return s.charAt( 0 ).toUpperCase() + s.substr( 1 );
};
